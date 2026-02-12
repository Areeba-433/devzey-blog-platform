import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateAdminUser, generateToken, createAdminSession } from '../../../../utils/admin-auth';
import { handleApiError, sendSuccess } from '../../../../utils/api-errors';
import { AdminLoginRequest } from '../../../../types/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      message: 'Only POST method is allowed',
    });
    return;
  }

  try {
    const { username, password }: AdminLoginRequest = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Username and password are required',
      });
      return;
    }

    // Authenticate user
    const user = await authenticateAdminUser(username, password);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid username or password',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create session
    await createAdminSession(
      user.id,
      token,
      expiresAt,
      req.headers['x-forwarded-for'] as string || req.connection.remoteAddress as string,
      req.headers['user-agent']
    );

    // Return user data (without password hash) and token
    const userResponse = {
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

    sendSuccess(res, {
      user: userResponse,
      token,
      expiresAt,
    });

  } catch (error) {
    handleApiError(error, res);
  }
}
