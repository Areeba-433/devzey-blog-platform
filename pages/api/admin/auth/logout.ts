import { NextApiRequest, NextApiResponse } from 'next';
import { invalidateAdminSession } from '../../../../utils/admin-auth';
import { withAdminAuth } from '../../../../utils/admin-middleware';
import { sendSuccess } from '../../../../utils/api-errors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      message: 'Only POST method is allowed',
    });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authorization header missing or invalid',
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const invalidated = await invalidateAdminSession(token);

    if (!invalidated) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Session not found or already invalidated',
      });
      return;
    }

    sendSuccess(res, { message: 'Logged out successfully' });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred during logout',
    });
  }
}

export default handler;
