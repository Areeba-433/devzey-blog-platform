import { NextApiRequest, NextApiResponse } from 'next';
import { getRelatedPosts, getPostById } from '../../../../lib/posts';
import { validateId } from '../../../../utils/validation';
import { handleApiError, sendSuccess, sendNotFound, sendBadRequest } from '../../../../utils/api-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (typeof id !== 'string') {
      sendBadRequest(res, 'Invalid post ID');
      return;
    }

    validateId(id);

    // Verify post exists
    const post = await getPostById(id);
    if (!post) {
      sendNotFound(res, 'Post not found');
      return;
    }

    if (req.method === 'GET') {
      await handleGetRelated(id, req, res);
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

async function handleGetRelated(id: string, req: NextApiRequest, res: NextApiResponse) {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

  if (isNaN(limit) || limit < 1 || limit > 20) {
    sendBadRequest(res, 'Limit must be a number between 1 and 20');
    return;
  }

  const relatedPosts = await getRelatedPosts(id, limit);
  sendSuccess(res, { relatedPosts, total: relatedPosts.length });
}
