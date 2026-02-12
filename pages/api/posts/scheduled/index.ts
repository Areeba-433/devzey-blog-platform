import { NextApiRequest, NextApiResponse } from 'next';
import { publishScheduledPosts, getUpcomingScheduledPosts } from '../../../../lib/posts';
import { handleApiError, sendSuccess } from '../../../../utils/api-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await handleGetScheduled(req, res);
    } else if (req.method === 'POST') {
      await handlePublishScheduled(res);
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

async function handleGetScheduled(req: NextApiRequest, res: NextApiResponse) {
  const hoursAhead = req.query.hours ? parseInt(req.query.hours as string, 10) : 24;

  if (isNaN(hoursAhead) || hoursAhead < 1 || hoursAhead > 168) { // Max 1 week
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Hours ahead must be a number between 1 and 168',
    });
    return;
  }

  const scheduledPosts = await getUpcomingScheduledPosts(hoursAhead);

  sendSuccess(res, {
    scheduledPosts,
    total: scheduledPosts.length,
    hoursAhead,
  });
}

async function handlePublishScheduled(res: NextApiResponse) {
  const result = await publishScheduledPosts();

  sendSuccess(res, {
    message: `Successfully published ${result.published} scheduled posts`,
    ...result,
  });
}
