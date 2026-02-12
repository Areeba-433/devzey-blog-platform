import { NextApiRequest, NextApiResponse } from 'next';
import { incrementViewCount, incrementLikeCount, incrementCommentCount, getPostById } from '../../../../lib/posts';
import { validateId } from '../../../../utils/validation';
import { handleApiError, sendSuccess, sendNotFound, sendBadRequest } from '../../../../utils/api-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { action } = req.query;

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

    if (req.method === 'POST') {
      await handleTrackAction(id, action as string, res);
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        message: 'Only POST method is allowed',
      });
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

async function handleTrackAction(id: string, action: string, res: NextApiResponse) {
  let success = false;

  switch (action) {
    case 'view':
      success = await incrementViewCount(id);
      break;
    case 'like':
      success = await incrementLikeCount(id);
      break;
    case 'comment':
      success = await incrementCommentCount(id);
      break;
    default:
      sendBadRequest(res, 'Invalid action. Supported actions: view, like, comment');
      return;
  }

  if (!success) {
    sendNotFound(res, 'Post not found or action failed');
    return;
  }

  sendSuccess(res, { message: `${action} count incremented successfully` });
}
