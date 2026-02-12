import { NextApiRequest, NextApiResponse } from 'next';
import { getPosts } from '../../../../lib/posts';
import { withAdminAuth } from '../../../../utils/admin-middleware';
import { handleApiError, sendSuccess } from '../../../../utils/api-errors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        message: 'Only GET method is allowed',
      });
      return;
    }

    const filters: any = {};

    // Parse query parameters with admin-specific filters
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
        filters.status = req.query.status;
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

    // Admin-specific filters
    if (req.query.hasComments !== undefined) {
      // TODO: Implement comment system
      filters.hasComments = req.query.hasComments === 'true';
    }

    if (req.query.wordCountMin && typeof req.query.wordCountMin === 'string') {
      const wordCountMin = parseInt(req.query.wordCountMin, 10);
      if (!isNaN(wordCountMin) && wordCountMin >= 0) {
        filters.wordCountMin = wordCountMin;
      }
    }

    if (req.query.wordCountMax && typeof req.query.wordCountMax === 'string') {
      const wordCountMax = parseInt(req.query.wordCountMax, 10);
      if (!isNaN(wordCountMax) && wordCountMax >= 0) {
        filters.wordCountMax = wordCountMax;
      }
    }

    if (req.query.limit && typeof req.query.limit === 'string') {
      const limit = parseInt(req.query.limit, 10);
      if (!isNaN(limit) && limit > 0 && limit <= 100) {
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
      const validSortFields = ['createdAt', 'updatedAt', 'publishedAt', 'viewCount', 'likeCount', 'commentCount', 'wordCount'];
      if (validSortFields.includes(req.query.sortBy)) {
        filters.sortBy = req.query.sortBy;
      }
    }

    if (req.query.sortOrder && typeof req.query.sortOrder === 'string') {
      if (['asc', 'desc'].includes(req.query.sortOrder)) {
        filters.sortOrder = req.query.sortOrder;
      }
    }

    const posts = await getPosts(filters);

    // Add admin-specific metadata
    const postsWithMetadata = posts.map(post => ({
      ...post,
      adminMetadata: {
        isPublished: post.published,
        daysSinceCreation: Math.floor((Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        daysSinceUpdate: Math.floor((Date.now() - post.updatedAt.getTime()) / (1000 * 60 * 60 * 24)),
        engagementScore: calculateEngagementScore(post)
      }
    }));

    sendSuccess(res, {
      posts: postsWithMetadata,
      total: postsWithMetadata.length,
      filters: filters
    });

  } catch (error) {
    handleApiError(error, res);
  }
}

function calculateEngagementScore(post: any): number {
  let score = 0;

  // Views contribute to score (1 point per 10 views)
  score += Math.floor(post.viewCount / 10);

  // Likes contribute more (5 points per like)
  score += post.likeCount * 5;

  // Comments contribute significantly (10 points per comment)
  score += post.commentCount * 10;

  // Recent posts get a small boost
  const daysSincePublished = post.publishedAt
    ? Math.floor((Date.now() - post.publishedAt.getTime()) / (1000 * 60 * 60 * 24))
    : Math.floor((Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSincePublished <= 7) {
    score += 20; // Recent content boost
  } else if (daysSincePublished <= 30) {
    score += 10; // Somewhat recent boost
  }

  return score;
}

export default withAdminAuth(handler, { requirePermission: { resource: 'posts', action: 'read' } });
