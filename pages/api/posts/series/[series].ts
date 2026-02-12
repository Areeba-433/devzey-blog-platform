import { NextApiRequest, NextApiResponse } from 'next';
import { getPosts } from '../../../../lib/posts';
import { handleApiError, sendSuccess, sendBadRequest } from '../../../../utils/api-errors';
import { PostFilters } from '../../../../types/post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { series } = req.query;
    const { published, limit, offset, sortBy, sortOrder, ...otherFilters } = req.query;

    if (typeof series !== 'string') {
      sendBadRequest(res, 'Invalid series parameter');
      return;
    }

    if (req.method === 'GET') {
      await handleGetPostsBySeries(series, { published, limit, offset, sortBy, sortOrder, ...otherFilters }, res);
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

async function handleGetPostsBySeries(
  series: string,
  queryParams: any,
  res: NextApiResponse
) {
  const filters: PostFilters = {
    series: decodeURIComponent(series),
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

  // For series, default sort by seriesOrder, then by createdAt
  const defaultSortBy = 'createdAt';
  const defaultSortOrder = 'asc';

  if (queryParams.sortBy && typeof queryParams.sortBy === 'string') {
    if (['createdAt', 'updatedAt', 'publishedAt', 'viewCount', 'likeCount'].includes(queryParams.sortBy)) {
      filters.sortBy = queryParams.sortBy as any;
    }
  } else {
    filters.sortBy = defaultSortBy;
  }

  if (queryParams.sortOrder && typeof queryParams.sortOrder === 'string') {
    if (['asc', 'desc'].includes(queryParams.sortOrder)) {
      filters.sortOrder = queryParams.sortOrder as 'asc' | 'desc';
    }
  } else {
    filters.sortOrder = defaultSortOrder;
  }

  const posts = await getPosts(filters);

  // Sort by seriesOrder if available, maintaining the overall sort
  const sortedPosts = posts.sort((a, b) => {
    // First sort by seriesOrder if both have it
    if (a.seriesOrder !== undefined && b.seriesOrder !== undefined) {
      if (a.seriesOrder !== b.seriesOrder) {
        return a.seriesOrder - b.seriesOrder;
      }
    }

    // Fall back to the requested sort
    const sortBy = filters.sortBy || defaultSortBy;
    const sortOrder = filters.sortOrder || defaultSortOrder;

    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'publishedAt':
        aValue = a.publishedAt || a.createdAt;
        bValue = b.publishedAt || b.createdAt;
        break;
      case 'updatedAt':
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
      case 'viewCount':
        aValue = a.viewCount;
        bValue = b.viewCount;
        break;
      case 'likeCount':
        aValue = a.likeCount;
        bValue = b.likeCount;
        break;
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
    }

    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  sendSuccess(res, {
    posts: sortedPosts,
    total: sortedPosts.length,
    series: decodeURIComponent(series)
  });
}
