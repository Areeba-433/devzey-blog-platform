import { AdminUser, AdminRole, AdminPermission, AdminResource, AdminAction, AdminSession } from '../types/admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';

const ADMIN_USERS_FILE = path.join(process.cwd(), 'data', 'admin-users.json');
const ADMIN_SESSIONS_FILE = path.join(process.cwd(), 'data', 'admin-sessions.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SALT_ROUNDS = 12;

// Default role permissions
const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'posts', actions: ['create', 'read', 'update', 'delete', 'publish', 'unpublish'] },
    { resource: 'comments', actions: ['read', 'moderate', 'delete'] },
    { resource: 'settings', actions: ['read', 'update', 'manage'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'media', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'categories', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'tags', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'authors', actions: ['read', 'manage'] },
    { resource: 'series', actions: ['create', 'read', 'update', 'delete'] }
  ],
  admin: [
    { resource: 'users', actions: ['read', 'update'] },
    { resource: 'posts', actions: ['create', 'read', 'update', 'publish', 'unpublish'] },
    { resource: 'comments', actions: ['read', 'moderate'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'media', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'categories', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'tags', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'authors', actions: ['read'] },
    { resource: 'series', actions: ['create', 'read', 'update', 'delete'] }
  ],
  editor: [
    { resource: 'posts', actions: ['create', 'read', 'update'] },
    { resource: 'comments', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'media', actions: ['create', 'read', 'update'] },
    { resource: 'categories', actions: ['read'] },
    { resource: 'tags', actions: ['read'] },
    { resource: 'authors', actions: ['read'] },
    { resource: 'series', actions: ['read', 'update'] }
  ],
  moderator: [
    { resource: 'posts', actions: ['read', 'publish', 'unpublish'] },
    { resource: 'comments', actions: ['read', 'moderate', 'delete'] },
    { resource: 'users', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] }
  ]
};

// Utility functions
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readAdminUsers(): Promise<AdminUser[]> {
  await ensureDataDirectory();
  try {
    const data = await fs.readFile(ADMIN_USERS_FILE, 'utf-8');
    const users = JSON.parse(data);
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
    }));
  } catch {
    return [];
  }
}

async function writeAdminUsers(users: AdminUser[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(ADMIN_USERS_FILE, JSON.stringify(users, null, 2));
}

async function readAdminSessions(): Promise<AdminSession[]> {
  await ensureDataDirectory();
  try {
    const data = await fs.readFile(ADMIN_SESSIONS_FILE, 'utf-8');
    const sessions = JSON.parse(data);
    return sessions.map((session: any) => ({
      ...session,
      expiresAt: new Date(session.expiresAt),
      createdAt: new Date(session.createdAt)
    }));
  } catch {
    return [];
  }
}

async function writeAdminSessions(sessions: AdminSession[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(ADMIN_SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT utilities
export function generateToken(user: AdminUser): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// User management functions
export async function createAdminUser(userData: {
  username: string;
  email: string;
  password: string;
  role: AdminRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  permissions?: AdminPermission[];
}): Promise<AdminUser> {
  const users = await readAdminUsers();

  // Check if username or email already exists
  const existingUser = users.find(u => u.username === userData.username || u.email === userData.email);
  if (existingUser) {
    throw new Error('Username or email already exists');
  }

  const passwordHash = await hashPassword(userData.password);
  const now = new Date();

  const user: AdminUser = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    username: userData.username,
    email: userData.email,
    passwordHash,
    role: userData.role,
    firstName: userData.firstName,
    lastName: userData.lastName,
    avatar: userData.avatar,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    permissions: userData.permissions || DEFAULT_ROLE_PERMISSIONS[userData.role]
  };

  users.push(user);
  await writeAdminUsers(users);

  return user;
}

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  const users = await readAdminUsers();
  return users.find(u => u.id === id) || null;
}

export async function getAdminUserByUsername(username: string): Promise<AdminUser | null> {
  const users = await readAdminUsers();
  return users.find(u => u.username === username) || null;
}

export async function getAdminUsers(filters: {
  role?: AdminRole;
  isActive?: boolean;
  limit?: number;
  offset?: number;
} = {}): Promise<AdminUser[]> {
  let users = await readAdminUsers();

  if (filters.role) {
    users = users.filter(u => u.role === filters.role);
  }

  if (filters.isActive !== undefined) {
    users = users.filter(u => u.isActive === filters.isActive);
  }

  const offset = filters.offset || 0;
  const limit = filters.limit || users.length;

  return users.slice(offset, offset + limit);
}

export async function updateAdminUser(id: string, updates: {
  username?: string;
  email?: string;
  password?: string;
  role?: AdminRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive?: boolean;
  permissions?: AdminPermission[];
}): Promise<AdminUser | null> {
  const users = await readAdminUsers();
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return null;
  }

  const user = users[index];
  const updatedUser = { ...user, updatedAt: new Date() };

  if (updates.username) {
    // Check if username is already taken by another user
    const existingUser = users.find(u => u.username === updates.username && u.id !== id);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    updatedUser.username = updates.username;
  }

  if (updates.email) {
    // Check if email is already taken by another user
    const existingUser = users.find(u => u.email === updates.email && u.id !== id);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    updatedUser.email = updates.email;
  }

  if (updates.password) {
    updatedUser.passwordHash = await hashPassword(updates.password);
  }

  if (updates.role) {
    updatedUser.role = updates.role;
    // Update permissions if role changed and no custom permissions set
    if (!updates.permissions && !user.permissions.some(p => !DEFAULT_ROLE_PERMISSIONS[user.role].find(dp => dp.resource === p.resource))) {
      updatedUser.permissions = DEFAULT_ROLE_PERMISSIONS[updates.role];
    }
  }

  if (updates.permissions) {
    updatedUser.permissions = updates.permissions;
  }

  // Update other fields
  Object.assign(updatedUser, {
    firstName: updates.firstName !== undefined ? updates.firstName : user.firstName,
    lastName: updates.lastName !== undefined ? updates.lastName : user.lastName,
    avatar: updates.avatar !== undefined ? updates.avatar : user.avatar,
    isActive: updates.isActive !== undefined ? updates.isActive : user.isActive
  });

  users[index] = updatedUser;
  await writeAdminUsers(users);

  return updatedUser;
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  const users = await readAdminUsers();
  const filteredUsers = users.filter(u => u.id !== id);

  if (filteredUsers.length === users.length) {
    return false;
  }

  await writeAdminUsers(filteredUsers);

  // Clean up sessions for deleted user
  const sessions = await readAdminSessions();
  const activeSessions = sessions.filter(s => s.userId !== id);
  await writeAdminSessions(activeSessions);

  return true;
}

export async function authenticateAdminUser(username: string, password: string): Promise<AdminUser | null> {
  const user = await getAdminUserByUsername(username);

  if (!user || !user.isActive) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return null;
  }

  // Update last login
  await updateAdminUser(user.id, { lastLoginAt: new Date() });

  return user;
}

// Session management
export async function createAdminSession(userId: string, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string): Promise<AdminSession> {
  const sessions = await readAdminSessions();

  const session: AdminSession = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    userId,
    token,
    expiresAt,
    createdAt: new Date(),
    ipAddress,
    userAgent
  };

  sessions.push(session);
  await writeAdminSessions(sessions);

  return session;
}

export async function getAdminSessionByToken(token: string): Promise<AdminSession | null> {
  const sessions = await readAdminSessions();
  return sessions.find(s => s.token === token && s.expiresAt > new Date()) || null;
}

export async function invalidateAdminSession(token: string): Promise<boolean> {
  const sessions = await readAdminSessions();
  const filteredSessions = sessions.filter(s => s.token !== token);

  if (filteredSessions.length === sessions.length) {
    return false;
  }

  await writeAdminSessions(filteredSessions);
  return true;
}

export async function invalidateAllUserSessions(userId: string): Promise<number> {
  const sessions = await readAdminSessions();
  const filteredSessions = sessions.filter(s => s.userId !== userId);

  const invalidatedCount = sessions.length - filteredSessions.length;
  await writeAdminSessions(filteredSessions);

  return invalidatedCount;
}

// Permission checking utilities
export function hasPermission(user: AdminUser, resource: AdminResource, action: AdminAction): boolean {
  if (user.role === 'super_admin') {
    return true;
  }

  return user.permissions.some(permission =>
    permission.resource === resource && permission.actions.includes(action)
  );
}

export function hasAnyPermission(user: AdminUser, resource: AdminResource, actions: AdminAction[]): boolean {
  return actions.some(action => hasPermission(user, resource, action));
}

export function hasAllPermissions(user: AdminUser, resource: AdminResource, actions: AdminAction[]): boolean {
  return actions.every(action => hasPermission(user, resource, action));
}

// Initialize default admin user if none exists
export async function initializeDefaultAdmin(): Promise<void> {
  const users = await readAdminUsers();

  if (users.length === 0) {
    await createAdminUser({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin'
    });

    console.log('Default admin user created. Username: admin, Password: admin123');
    console.log('Please change the default password after first login!');
  }
}
