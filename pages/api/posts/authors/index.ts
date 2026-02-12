import { NextApiRequest, NextApiResponse } from 'next';
import { getPosts } from '../../../../lib/posts';
import { handleApiError, sendSuccess } from '../../../../utils/api-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await handleGetAuthors(res);
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

async function handleGetAuthors(res: NextApiResponse) {
  // Get all posts to extract author information
  const posts = await getPosts({ published: true });

  // Extract unique authors and count posts by each
  const authorsMap = new Map<string, { count: number; latestPost?: Date }>();

  posts.forEach(post => {
    if (!authorsMap.has(post.author)) {
      authorsMap.set(post.author, { count: 0 });
    }
    const authorData = authorsMap.get(post.author)!;
    authorData.count++;

    // Track latest post date for each author
    const postDate = post.publishedAt || post.createdAt;
    if (!authorData.latestPost || postDate > authorData.latestPost) {
      authorData.latestPost = postDate;
    }
  });

  // Convert to array and sort authors by post count, then by latest post date
  const authors = Array.from(authorsMap.entries())
    .map(([name, data]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      count: data.count,
      latestPost: data.latestPost,
    }))
    .sort((a, b) => {
      // Sort by post count descending, then by latest post date descending
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return new Date(b.latestPost || 0).getTime() - new Date(a.latestPost || 0).getTime();
    });

  sendSuccess(res, {
    authors,
    total: authors.length
  });
}
