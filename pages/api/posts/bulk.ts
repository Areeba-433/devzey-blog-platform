import { NextApiRequest, NextApiResponse } from 'next';
import { bulkDeletePost, bulkUpdatePosts, bulkPublishPosts } from '../../../lib/posts';
import { validateUpdatePost } from '../../../utils/validation';
import { handleApiError, sendSuccess, sendBadRequest } from '../../../utils/api-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'DELETE') {
      await handleBulkDelete(req, res);
    } else if (req.method === 'PUT') {
      await handleBulkUpdate(req, res);
    } else if (req.method === 'PATCH') {
      await handleBulkPublish(req, res);
    } else {
      res.setHeader('Allow', ['DELETE', 'PUT', 'PATCH']);
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        message: 'Only DELETE, PUT, and PATCH methods are allowed',
      });
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

async function handleBulkDelete(req: NextApiRequest, res: NextApiResponse) {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    sendBadRequest(res, 'Post IDs array is required and must not be empty');
    return;
  }

  // Validate all IDs are strings
  if (!ids.every((id: any) => typeof id === 'string' && id.trim().length > 0)) {
    sendBadRequest(res, 'All post IDs must be non-empty strings');
    return;
  }

  const result = await bulkDeletePost(ids);
  sendSuccess(res, result);
}

async function handleBulkUpdate(req: NextApiRequest, res: NextApiResponse) {
  const { ids, updates } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    sendBadRequest(res, 'Post IDs array is required and must not be empty');
    return;
  }

  if (!updates || typeof updates !== 'object') {
    sendBadRequest(res, 'Updates object is required');
    return;
  }

  // Validate all IDs are strings
  if (!ids.every((id: any) => typeof id === 'string' && id.trim().length > 0)) {
    sendBadRequest(res, 'All post IDs must be non-empty strings');
    return;
  }

  // Validate updates
  const validatedUpdates = validateUpdatePost(updates);

  const result = await bulkUpdatePosts(ids, validatedUpdates);
  sendSuccess(res, result);
}

async function handleBulkPublish(req: NextApiRequest, res: NextApiResponse) {
  const { ids, published } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    sendBadRequest(res, 'Post IDs array is required and must not be empty');
    return;
  }

  if (published === undefined || typeof published !== 'boolean') {
    sendBadRequest(res, 'Published status must be a boolean value');
    return;
  }

  // Validate all IDs are strings
  if (!ids.every((id: any) => typeof id === 'string' && id.trim().length > 0)) {
    sendBadRequest(res, 'All post IDs must be non-empty strings');
    return;
  }

  const result = await bulkPublishPosts(ids, published);
  sendSuccess(res, result);
}
