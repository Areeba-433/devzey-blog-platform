import { NextApiRequest, NextApiResponse } from 'next';
import { AdminUser, AdminResource, AdminAction } from '../types/admin';
import { verifyToken, getAdminSessionByToken, getAdminUserById, hasPermission } from './admin-auth';
import { ApiError } from './api-errors';

export interface AdminRequest extends NextApiRequest {
  adminUser?: AdminUser;
}

// Middleware to authenticate admin users
export async function requireAdminAuth(req: AdminRequest, res: NextApiResponse): Promise<AdminUser> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authorization header missing or invalid');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Verify JWT token
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  // Check if session exists and is valid
  const session = await getAdminSessionByToken(token);
  if (!session) {
    throw new ApiError(401, 'Session not found or expired');
  }

  // Get user details
  const user = await getAdminUserById(session.userId);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or inactive');
  }

  // Attach user to request
  req.adminUser = user;

  return user;
}

// Middleware to check specific permissions
export function requirePermission(resource: AdminResource, action: AdminAction) {
  return async (req: AdminRequest, res: NextApiResponse): Promise<AdminUser> => {
    const user = await requireAdminAuth(req, res);

    if (!hasPermission(user, resource, action)) {
      throw new ApiError(403, `Insufficient permissions: ${action} on ${resource}`);
    }

    return user;
  };
}

// Middleware to check if user has any of the specified permissions
export function requireAnyPermission(resource: AdminResource, actions: AdminAction[]) {
  return async (req: AdminRequest, res: NextApiResponse): Promise<AdminUser> => {
    const user = await requireAdminAuth(req, res);

    const hasAnyPerm = actions.some(action => hasPermission(user, resource, action));
    if (!hasAnyPerm) {
      throw new ApiError(403, `Insufficient permissions: any of [${actions.join(', ')}] on ${resource}`);
    }

    return user;
  };
}

// Middleware to check if user has all specified permissions
export function requireAllPermissions(resource: AdminResource, actions: AdminAction[]) {
  return async (req: AdminRequest, res: NextApiResponse): Promise<AdminUser> => {
    const user = await requireAdminAuth(req, res);

    const hasAllPerms = actions.every(action => hasPermission(user, resource, action));
    if (!hasAllPerms) {
      throw new ApiError(403, `Insufficient permissions: all of [${actions.join(', ')}] on ${resource}`);
    }

    return user;
  };
}

// Middleware for role-based access
export function requireRole(...allowedRoles: string[]) {
  return async (req: AdminRequest, res: NextApiResponse): Promise<AdminUser> => {
    const user = await requireAdminAuth(req, res);

    if (!allowedRoles.includes(user.role)) {
      throw new ApiError(403, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
    }

    return user;
  };
}

// Middleware to check if user is super admin
export async function requireSuperAdmin(req: AdminRequest, res: NextApiResponse): Promise<AdminUser> {
  return requireRole('super_admin')(req, res);
}

// Generic admin middleware wrapper
export function withAdminAuth(handler: Function, options?: {
  requirePermission?: { resource: AdminResource; action: AdminAction };
  requireAnyPermission?: { resource: AdminResource; actions: AdminAction[] };
  requireAllPermissions?: { resource: AdminResource; actions: AdminAction[] };
  requireRole?: string[];
  requireSuperAdmin?: boolean;
}) {
  return async (req: AdminRequest, res: NextApiResponse) => {
    try {
      let user: AdminUser;

      // Apply authentication
      user = await requireAdminAuth(req, res);

      // Apply additional authorization checks
      if (options?.requireSuperAdmin) {
        user = await requireSuperAdmin(req, res);
      } else if (options?.requireRole) {
        user = await requireRole(...options.requireRole)(req, res);
      } else if (options?.requirePermission) {
        user = await requirePermission(options.requirePermission.resource, options.requirePermission.action)(req, res);
      } else if (options?.requireAnyPermission) {
        user = await requireAnyPermission(options.requireAnyPermission.resource, options.requireAnyPermission.actions)(req, res);
      } else if (options?.requireAllPermissions) {
        user = await requireAllPermissions(options.requireAllPermissions.resource, options.requireAllPermissions.actions)(req, res);
      }

      // Call the handler
      return await handler(req, res);

    } catch (error) {
      const { handleApiError } = await import('./api-errors');
      handleApiError(error, res);
    }
  };
}

// Utility to get current admin user from request
export function getCurrentAdminUser(req: AdminRequest): AdminUser | null {
  return req.adminUser || null;
}

// Rate limiting helper for admin endpoints
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Admin route rate limiting middleware
export function withRateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (handler: Function) => {
    return async (req: AdminRequest, res: NextApiResponse) => {
      const identifier = req.adminUser?.id || req.headers['x-forwarded-for'] as string || req.connection.remoteAddress as string;

      if (!checkRateLimit(identifier, maxRequests, windowMs)) {
        res.status(429).json({
          success: false,
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.'
        });
        return;
      }

      return handler(req, res);
    };
  };
}
