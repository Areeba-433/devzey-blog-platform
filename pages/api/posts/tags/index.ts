import { NextApiRequest, NextApiResponse } from 'next';
import { getPosts } from '../../../../lib/posts';
import { handleApiError, sendSuccess } from '../../../../utils/api-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await handleGetTags(res);
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

async function handleGetTags(res: NextApiResponse) {
  const posts = await getPosts({ published: true });
  const allTags = posts.flatMap(post => post.tags);
  const uniqueTags = [...new Set(allTags)].sort();

  const tagStats = uniqueTags.map(tag => {
    const postsWithTag = posts.filter(post => post.tags.includes(tag));
    return {
      name: tag,
      count: postsWithTag.length,
      slug: tag.toLowerCase().replace(/\s+/g, '-'),
    };
  });

  sendSuccess(res, {
    tags: tagStats,
    total: uniqueTags.length
  });
}
