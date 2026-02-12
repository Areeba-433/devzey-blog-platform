import { NextApiRequest, NextApiResponse } from 'next';
import { getPosts } from '../../../../lib/posts';
import { handleApiError, sendSuccess, sendBadRequest } from '../../../../utils/api-errors';
import { PostFilters } from '../../../../types/post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { tag } = req.query;
    const { published, limit, offset, sortBy, sortOrder, ...otherFilters } = req.query;

    if (typeof tag !== 'string') {
      sendBadRequest(res, 'Invalid tag parameter');
      return;
    }

    if (req.method === 'GET') {
      await handleGetPostsByTag(tag, { published, limit, offset, sortBy, sortOrder, ...otherFilters }, res);
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

async function handleGetPostsByTag(
  tag: string,
  queryParams: any,
  res: NextApiResponse
) {
  const filters: PostFilters = {
    tag: decodeURIComponent(tag),
  };

  // Parse additional filters
  if (queryParams.published !== undefined) {
    filters.published = queryParams.published === 'true';
  }

  if (queryParams.limit && typeof queryParams.limit === 'string') {
    const limit = parseInt(queryParams.limit, 10);
    if (!isNaN(limit) && limit > 0 && limit <= 100) {
      filters.limit = limit;
    }
  }

  if (queryParams.offset && typeof queryParams.offset === 'string') {
    const offset = parseInt(queryParams.offset, 10);
    if (!isNaN(offset) && offset >= 0) {
      filters.offset = offset;
    }
  }

  if (queryParams.sortBy && typeof queryParams.sortBy === 'string') {
    if (['createdAt', 'updatedAt', 'publishedAt', 'viewCount', 'likeCount'].includes(queryParams.sortBy)) {
      filters.sortBy = queryParams.sortBy as any;
    }
  }

  if (queryParams.sortOrder && typeof queryParams.sortOrder === 'string') {
    if (['asc', 'desc'].includes(queryParams.sortOrder)) {
      filters.sortOrder = queryParams.sortOrder as 'asc' | 'desc';
    }
  }

  const posts = await getPosts(filters);

  sendSuccess(res, {
    posts,
    total: posts.length,
    tag: decodeURIComponent(tag)
  });
}
