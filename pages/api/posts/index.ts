import { NextApiRequest, NextApiResponse } from 'next';
import { createPost, getPosts } from '../../../lib/posts';
import { validateCreatePost } from '../../../utils/validation';
import { handleApiError, sendSuccess } from '../../../utils/api-errors';
import { PostFilters } from '../../../types/post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await handleGetPosts(req, res);
    } else if (req.method === 'POST') {
      await handleCreatePost(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        message: 'Only GET and POST methods are allowed',
      });
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

async function handleGetPosts(req: NextApiRequest, res: NextApiResponse) {
  const filters: PostFilters = {};

  // Parse query parameters
  if (req.query.published !== undefined) {
    filters.published = req.query.published === 'true';
  }

  if (req.query.author && typeof req.query.author === 'string') {
    filters.author = req.query.author;
  }

  if (req.query.category && typeof req.query.category === 'string') {
    filters.category = req.query.category;
  }

  if (req.query.tag && typeof req.query.tag === 'string') {
    filters.tag = req.query.tag;
  }

  if (req.query.status && typeof req.query.status === 'string') {
    if (['draft', 'published', 'archived'].includes(req.query.status)) {
      filters.status = req.query.status as 'draft' | 'published' | 'archived';
    }
  }

  if (req.query.series && typeof req.query.series === 'string') {
    filters.series = req.query.series;
  }

  if (req.query.dateFrom && typeof req.query.dateFrom === 'string') {
    const dateFrom = new Date(req.query.dateFrom);
    if (!isNaN(dateFrom.getTime())) {
      filters.dateFrom = dateFrom;
    }
  }

  if (req.query.dateTo && typeof req.query.dateTo === 'string') {
    const dateTo = new Date(req.query.dateTo);
    if (!isNaN(dateTo.getTime())) {
      filters.dateTo = dateTo;
    }
  }

  if (req.query.minViews && typeof req.query.minViews === 'string') {
    const minViews = parseInt(req.query.minViews, 10);
    if (!isNaN(minViews) && minViews >= 0) {
      filters.minViews = minViews;
    }
  }

  if (req.query.limit && typeof req.query.limit === 'string') {
    const limit = parseInt(req.query.limit, 10);
    if (!isNaN(limit) && limit > 0) {
      filters.limit = limit;
    }
  }

  if (req.query.offset && typeof req.query.offset === 'string') {
    const offset = parseInt(req.query.offset, 10);
    if (!isNaN(offset) && offset >= 0) {
      filters.offset = offset;
    }
  }

  if (req.query.sortBy && typeof req.query.sortBy === 'string') {
    if (['createdAt', 'updatedAt', 'publishedAt', 'viewCount', 'likeCount'].includes(req.query.sortBy)) {
      filters.sortBy = req.query.sortBy as any;
    }
  }

  if (req.query.sortOrder && typeof req.query.sortOrder === 'string') {
    if (['asc', 'desc'].includes(req.query.sortOrder)) {
      filters.sortOrder = req.query.sortOrder as 'asc' | 'desc';
    }
  }

  const posts = await getPosts(filters);
  sendSuccess(res, { posts, total: posts.length });
}

async function handleCreatePost(req: NextApiRequest, res: NextApiResponse) {
  const validatedData = validateCreatePost(req.body);
  const post = await createPost(validatedData);
  sendSuccess(res, post, 201);
}
