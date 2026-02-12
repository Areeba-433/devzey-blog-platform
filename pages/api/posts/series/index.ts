import { NextApiRequest, NextApiResponse } from 'next';
import { getPosts } from '../../../../lib/posts';
import { handleApiError, sendSuccess } from '../../../../utils/api-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await handleGetSeries(res);
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

async function handleGetSeries(res: NextApiResponse) {
  // Get all posts to extract series information
  const posts = await getPosts({ published: true });

  // Extract unique series and count posts in each
  const seriesMap = new Map<string, { count: number; posts: any[] }>();

  posts.forEach(post => {
    if (post.series) {
      if (!seriesMap.has(post.series)) {
        seriesMap.set(post.series, { count: 0, posts: [] });
      }
      const seriesData = seriesMap.get(post.series)!;
      seriesData.count++;
      seriesData.posts.push({
        id: post.id,
        title: post.title,
        slug: post.slug,
        seriesOrder: post.seriesOrder,
        publishedAt: post.publishedAt,
      });
    }
  });

  // Convert to array and sort series by name
  const series = Array.from(seriesMap.entries())
    .map(([name, data]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      count: data.count,
      posts: data.posts.sort((a, b) => {
        // Sort by seriesOrder first, then by publishedAt
        if (a.seriesOrder !== undefined && b.seriesOrder !== undefined) {
          return a.seriesOrder - b.seriesOrder;
        }
        if (a.seriesOrder !== undefined) return -1;
        if (b.seriesOrder !== undefined) return 1;
        return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      }),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  sendSuccess(res, {
    series,
    total: series.length
  });
}
