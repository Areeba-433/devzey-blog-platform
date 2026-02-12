import { NextApiRequest, NextApiResponse } from 'next';
import { getPostById, updatePost, deletePost } from '../../../lib/posts';
import { validateUpdatePost, validateId } from '../../../utils/validation';
import { handleApiError, sendSuccess, sendNotFound } from '../../../utils/api-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid post ID',
      });
      return;
    }

    validateId(id);

    if (req.method === 'GET') {
      await handleGetPost(id, res);
    } else if (req.method === 'PUT') {
      await handleUpdatePost(id, req, res);
    } else if (req.method === 'DELETE') {
      await handleDeletePost(id, res);
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

async function handleGetPost(id: string, res: NextApiResponse) {
  const post = await getPostById(id);

  if (!post) {
    sendNotFound(res, 'Post not found');
    return;
  }

  sendSuccess(res, post);
}

async function handleUpdatePost(id: string, req: NextApiRequest, res: NextApiResponse) {
  const post = await getPostById(id);

  if (!post) {
    sendNotFound(res, 'Post not found');
    return;
  }

  const validatedData = validateUpdatePost(req.body);
  const updatedPost = await updatePost(id, validatedData);

  if (!updatedPost) {
    sendNotFound(res, 'Post not found');
    return;
  }

  sendSuccess(res, updatedPost);
}

async function handleDeletePost(id: string, res: NextApiResponse) {
  const post = await getPostById(id);

  if (!post) {
    sendNotFound(res, 'Post not found');
    return;
  }

  const deleted = await deletePost(id);

  if (!deleted) {
    sendNotFound(res, 'Post not found');
    return;
  }

  sendSuccess(res, { message: 'Post deleted successfully' });
}
