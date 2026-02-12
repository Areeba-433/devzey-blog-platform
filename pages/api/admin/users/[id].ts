import { NextApiRequest, NextApiResponse } from 'next';
import { getAdminUserById, updateAdminUser, deleteAdminUser, invalidateAllUserSessions } from '../../../../utils/admin-auth';
import { withAdminAuth } from '../../../../utils/admin-middleware';
import { handleApiError, sendSuccess, sendNotFound } from '../../../../utils/api-errors';
import { UpdateAdminUserRequest } from '../../../../types/admin';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid user ID',
      });
      return;
    }

    if (req.method === 'GET') {
      await handleGetUser(id, res);
    } else if (req.method === 'PUT') {
      await handleUpdateUser(id, req, res);
    } else if (req.method === 'DELETE') {
      await handleDeleteUser(id, req, res);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        message: 'Only GET, PUT, and DELETE methods are allowed',
      });
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

async function handleGetUser(id: string, res: NextApiResponse) {
  const user = await getAdminUserById(id);

  if (!user) {
    sendNotFound(res, 'User not found');
    return;
  }

  // Remove password hash from response
  const sanitizedUser = {
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
  };

  sendSuccess(res, sanitizedUser);
}

async function handleUpdateUser(id: string, req: NextApiRequest, res: NextApiResponse) {
  const user = await getAdminUserById(id);

  if (!user) {
    sendNotFound(res, 'User not found');
    return;
  }

  const updateData: UpdateAdminUserRequest = req.body;

  // Validate role if provided
  if (updateData.role) {
    const validRoles = ['super_admin', 'admin', 'editor', 'moderator'];
    if (!validRoles.includes(updateData.role)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid role. Must be one of: super_admin, admin, editor, moderator',
      });
      return;
    }
  }

  // Validate email format if provided
  if (updateData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid email format',
      });
      return;
    }
  }

  // Validate password strength if provided
  if (updateData.password && updateData.password.length < 8) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Password must be at least 8 characters long',
    });
    return;
  }

  try {
    const updatedUser = await updateAdminUser(id, updateData);

    if (!updatedUser) {
      sendNotFound(res, 'User not found');
      return;
    }

    // If password was updated, invalidate all sessions
    if (updateData.password) {
      await invalidateAllUserSessions(id);
    }

    // Remove password hash from response
    const sanitizedUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatar: updatedUser.avatar,
      isActive: updatedUser.isActive,
      lastLoginAt: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      permissions: updatedUser.permissions,
    };

    sendSuccess(res, sanitizedUser);

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

async function handleDeleteUser(id: string, req: NextApiRequest, res: NextApiResponse) {
  // Prevent deleting self
  if (req.adminUser?.id === id) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Cannot delete your own account',
    });
    return;
  }

  const user = await getAdminUserById(id);

  if (!user) {
    sendNotFound(res, 'User not found');
    return;
  }

  // Prevent deleting the last super admin
  if (user.role === 'super_admin') {
    const { getAdminUsers } = await import('../../../../utils/admin-auth');
    const superAdmins = await getAdminUsers({ role: 'super_admin', isActive: true });
    if (superAdmins.length <= 1) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Cannot delete the last active super admin',
      });
      return;
    }
  }

  const deleted = await deleteAdminUser(id);

  if (!deleted) {
    sendNotFound(res, 'User not found');
    return;
  }

  sendSuccess(res, { message: 'User deleted successfully' });
}

export default withAdminAuth(handler, { requirePermission: { resource: 'users', action: 'read' } });
