import { NextApiRequest, NextApiResponse } from 'next';
import { searchPosts } from '../../../lib/posts';
import { handleApiError, sendSuccess, sendBadRequest } from '../../../utils/api-errors';
import { PostFilters } from '../../../types/post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await handleSearch(req, res);
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

async function handleSearch(req: NextApiRequest, res: NextApiResponse) {
  const { q: query, ...filterParams } = req.query;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    sendBadRequest(res, 'Search query parameter "q" is required');
    return;
  }

  const filters: PostFilters = {};

  // Parse filter parameters
  if (filterParams.published !== undefined) {
    filters.published = filterParams.published === 'true';
  }

  if (filterParams.author && typeof filterParams.author === 'string') {
    filters.author = filterParams.author;
  }

  if (filterParams.category && typeof filterParams.category === 'string') {
    filters.category = filterParams.category;
  }

  if (filterParams.tag && typeof filterParams.tag === 'string') {
    filters.tag = filterParams.tag;
  }

  if (filterParams.status && typeof filterParams.status === 'string') {
    filters.status = filterParams.status as 'draft' | 'published' | 'archived';
  }

  if (filterParams.limit && typeof filterParams.limit === 'string') {
    const limit = parseInt(filterParams.limit, 10);
    if (!isNaN(limit) && limit > 0) {
      filters.limit = limit;
    }
  }

  if (filterParams.offset && typeof filterParams.offset === 'string') {
    const offset = parseInt(filterParams.offset, 10);
    if (!isNaN(offset) && offset >= 0) {
      filters.offset = offset;
    }
  }

  if (filterParams.sortBy && typeof filterParams.sortBy === 'string') {
    if (['createdAt', 'updatedAt', 'publishedAt', 'viewCount', 'likeCount'].includes(filterParams.sortBy)) {
      filters.sortBy = filterParams.sortBy as any;
    }
  }

  if (filterParams.sortOrder && typeof filterParams.sortOrder === 'string') {
    if (['asc', 'desc'].includes(filterParams.sortOrder)) {
      filters.sortOrder = filterParams.sortOrder as 'asc' | 'desc';
    }
  }

  const posts = await searchPosts(query.trim(), filters);
  
  // Return enhanced search results with metadata
  sendSuccess(res, { 
    posts, 
    total: posts.length, 
    query: query.trim(),
    filters: {
      category: filters.category || null,
      tag: filters.tag || null,
      sortBy: filters.sortBy || 'relevance',
      sortOrder: filters.sortOrder || 'desc'
    }
  });
}
