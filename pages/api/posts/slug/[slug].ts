import { NextApiRequest, NextApiResponse } from 'next';
import { getPostBySlug } from '../../../../lib/posts';
import { validateSlug } from '../../../../utils/validation';
import { handleApiError, sendSuccess, sendNotFound } from '../../../../utils/api-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { slug } = req.query;

    if (typeof slug !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid post slug',
      });
      return;
    }

    validateSlug(slug);

    if (req.method === 'GET') {
      await handleGetPostBySlug(slug, res);
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

async function handleGetPostBySlug(slug: string, res: NextApiResponse) {
  const post = await getPostBySlug(slug);

  if (!post) {
    sendNotFound(res, 'Post not found');
    return;
  }

  // Only return published posts via slug route for SEO
  if (!post.published) {
    sendNotFound(res, 'Post not found');
    return;
  }

  sendSuccess(res, post);
}
