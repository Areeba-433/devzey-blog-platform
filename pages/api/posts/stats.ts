import { NextApiRequest, NextApiResponse } from 'next';
import { getPostStats } from '../../../lib/posts';
import { handleApiError, sendSuccess } from '../../../utils/api-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await handleGetStats(res);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        message: 'Only GET method is allowed',
      });
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

async function handleGetStats(res: NextApiResponse) {
  const stats = await getPostStats();
  sendSuccess(res, stats);
}
