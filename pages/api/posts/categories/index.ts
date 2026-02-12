import { NextApiRequest, NextApiResponse } from 'next';
import { getPosts } from '../../../../lib/posts';
import { handleApiError, sendSuccess } from '../../../../utils/api-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await handleGetCategories(res);
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

async function handleGetCategories(res: NextApiResponse) {
  const posts = await getPosts({ published: true });
  const categories = [...new Set(posts.map(post => post.category))].sort();

  const categoryStats = categories.map(category => {
    const postsInCategory = posts.filter(post => post.category === category);
    return {
      name: category,
      count: postsInCategory.length,
      slug: category.toLowerCase().replace(/\s+/g, '-'),
    };
  });

  sendSuccess(res, {
    categories: categoryStats,
    total: categories.length
  });
}
