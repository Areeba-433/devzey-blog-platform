import { AdminUser } from '../types/admin';

// Security utilities for admin operations
export class AdminSecurityError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AdminSecurityError';
  }
}

// Input sanitization
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email).toLowerCase();
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new AdminSecurityError('Invalid email format', 'INVALID_EMAIL');
  }
  return sanitized;
}

export function sanitizeUsername(username: string): string {
  const sanitized = sanitizeString(username);
  // Allow only alphanumeric characters, hyphens, and underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    throw new AdminSecurityError('Username contains invalid characters', 'INVALID_USERNAME');
  }
  if (sanitized.length < 3 || sanitized.length > 30) {
    throw new AdminSecurityError('Username must be between 3 and 30 characters', 'USERNAME_LENGTH');
  }
  return sanitized;
}

export function sanitizePassword(password: string): string {
  if (typeof password !== 'string' || password.length < 8) {
    throw new AdminSecurityError('Password must be at least 8 characters long', 'PASSWORD_TOO_SHORT');
  }

  // Check for common weak passwords
  const weakPasswords = ['password', '12345678', 'qwerty', 'admin', 'letmein'];
  if (weakPasswords.includes(password.toLowerCase())) {
    throw new AdminSecurityError('Password is too common', 'WEAK_PASSWORD');
  }

  return password;
}

// SQL injection protection (for future database migration)
export function sanitizeSQLInput(input: string): string {
  // Remove potentially dangerous characters
  return input.replace(/['";\\]/g, '');
}

// XSS protection
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Rate limiting data structure
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Brute force protection for login attempts
const loginAttempts = new Map<string, { count: number; lockoutUntil: number }>();

export function checkLoginAttempts(identifier: string, maxAttempts: number = 5, lockoutMinutes: number = 30): boolean {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record || now > record.lockoutUntil) {
    // Reset or create new record
    loginAttempts.set(identifier, { count: 1, lockoutUntil: 0 });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false; // Still locked out
  }

  record.count++;
  return true;
}

export function resetLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

export function isLockedOut(identifier: string): number {
  const record = loginAttempts.get(identifier);
  if (!record) return 0;

  const now = Date.now();
  if (now > record.lockoutUntil) {
    loginAttempts.delete(identifier);
    return 0;
  }

  return Math.ceil((record.lockoutUntil - now) / (1000 * 60)); // minutes remaining
}

export function lockoutLogin(identifier: string, minutes: number): void {
  const lockoutUntil = Date.now() + (minutes * 60 * 1000);
  loginAttempts.set(identifier, { count: 999, lockoutUntil });
}

// Audit logging
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

const auditLog: AuditLogEntry[] = [];

export function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  success: boolean,
  options: {
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    errorMessage?: string;
  } = {}
): void {
  const entry: AuditLogEntry = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    userId,
    action,
    resource,
    success,
    ...options
  };

  auditLog.push(entry);

  // Keep only last 1000 entries in memory (in production, this should be persisted)
  if (auditLog.length > 1000) {
    auditLog.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUDIT] ${userId} ${action} ${resource} ${success ? 'SUCCESS' : 'FAILED'}`);
  }
}

export function getAuditLogs(
  filters: {
    userId?: string;
    action?: string;
    resource?: string;
    success?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): AuditLogEntry[] {
  let filteredLogs = [...auditLog];

  if (filters.userId) {
    filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
  }

  if (filters.action) {
    filteredLogs = filteredLogs.filter(log => log.action === filters.action);
  }

  if (filters.resource) {
    filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
  }

  if (filters.success !== undefined) {
    filteredLogs = filteredLogs.filter(log => log.success === filters.success);
  }

  // Sort by timestamp (newest first)
  filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const offset = filters.offset || 0;
  const limit = filters.limit || filteredLogs.length;

  return filteredLogs.slice(offset, offset + limit);
}

// CSRF protection utilities
const csrfTokens = new Set<string>();

export function generateCSRFToken(): string {
  const token = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  csrfTokens.add(token);

  // Clean up old tokens (keep only last 100)
  if (csrfTokens.size > 100) {
    const tokensArray = Array.from(csrfTokens);
    csrfTokens.clear();
    tokensArray.slice(-50).forEach(t => csrfTokens.add(t));
  }

  return token;
}

export function validateCSRFToken(token: string): boolean {
  if (csrfTokens.has(token)) {
    csrfTokens.delete(token);
    return true;
  }
  return false;
}

// Input validation helpers
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
}

export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Permission validation
export function validatePermissionUpdate(
  currentUser: AdminUser,
  targetUser: AdminUser,
  newPermissions: any
): void {
  // Only super admins can modify permissions
  if (currentUser.role !== 'super_admin') {
    throw new AdminSecurityError('Only super admins can modify permissions', 'PERMISSION_DENIED');
  }

  // Cannot modify super admin permissions unless you're also a super admin
  if (targetUser.role === 'super_admin' && currentUser.id !== targetUser.id) {
    throw new AdminSecurityError('Cannot modify super admin permissions', 'CANNOT_MODIFY_SUPER_ADMIN');
  }

  // Validate permission structure
  if (!Array.isArray(newPermissions)) {
    throw new AdminSecurityError('Permissions must be an array', 'INVALID_PERMISSIONS');
  }

  for (const perm of newPermissions) {
    if (!perm.resource || !perm.actions || !Array.isArray(perm.actions)) {
      throw new AdminSecurityError('Invalid permission structure', 'INVALID_PERMISSION_FORMAT');
    }
  }
}

// Security headers middleware
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
}

// File upload security
export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}): void {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new AdminSecurityError('File size exceeds maximum allowed size', 'FILE_TOO_LARGE');
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/markdown'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new AdminSecurityError('File type not allowed', 'INVALID_FILE_TYPE');
  }

  // Check file extension matches type
  const ext = file.name.split('.').pop()?.toLowerCase();
  const typeExtMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf'],
    'text/plain': ['txt'],
    'text/markdown': ['md', 'markdown']
  };

  const allowedExts = typeExtMap[file.type] || [];
  if (!allowedExts.includes(ext || '')) {
    throw new AdminSecurityError('File extension does not match file type', 'FILE_EXTENSION_MISMATCH');
  }
}
