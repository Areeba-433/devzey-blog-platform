import { NextApiRequest, NextApiResponse } from 'next';
import { getAdminUsers, createAdminUser } from '../../../../utils/admin-auth';
import { withAdminAuth } from '../../../../utils/admin-middleware';
import { handleApiError, sendSuccess } from '../../../../utils/api-errors';
import { CreateAdminUserRequest } from '../../../../types/admin';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await handleGetUsers(req, res);
    } else if (req.method === 'POST') {
      await handleCreateUser(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        message: 'Only GET and POST methods are allowed',
      });
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

async function handleGetUsers(req: NextApiRequest, res: NextApiResponse) {
  const filters = {
    role: req.query.role as any,
    isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
  };

  const users = await getAdminUsers(filters);

  // Remove password hashes from response
  const sanitizedUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    permissions: user.permissions,
  }));

  sendSuccess(res, { users: sanitizedUsers, total: sanitizedUsers.length });
}

async function handleCreateUser(req: NextApiRequest, res: NextApiResponse) {
  const userData: CreateAdminUserRequest = req.body;

  // Validate required fields
  if (!userData.username || !userData.email || !userData.password || !userData.role) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Username, email, password, and role are required',
    });
    return;
  }

  // Validate role
  const validRoles = ['super_admin', 'admin', 'editor', 'moderator'];
  if (!validRoles.includes(userData.role)) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Invalid role. Must be one of: super_admin, admin, editor, moderator',
    });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Invalid email format',
    });
    return;
  }

  // Validate password strength
  if (userData.password.length < 8) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Password must be at least 8 characters long',
    });
    return;
  }

  try {
    const newUser = await createAdminUser(userData);

    // Remove password hash from response
    const sanitizedUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      avatar: newUser.avatar,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      permissions: newUser.permissions,
    };

    sendSuccess(res, sanitizedUser, 201);

  } catch (error: any) {
    if (error.message.includes('already exists')) {
      res.status(409).json({
        success: false,
        error: 'Conflict',
        message: error.message,
      });
    } else {
      throw error;
    }
  }
}

export default withAdminAuth(handler, { requirePermission: { resource: 'users', action: 'read' } });
