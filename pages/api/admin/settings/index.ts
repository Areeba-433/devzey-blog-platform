import { NextApiRequest, NextApiResponse } from 'next';
import { getPlatformSettings, updatePlatformSettings } from '../../../../utils/platform-settings';
import { withAdminAuth } from '../../../../utils/admin-middleware';
import { handleApiError, sendSuccess } from '../../../../utils/api-errors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await handleGetSettings(res);
    } else if (req.method === 'PUT') {
      await handleUpdateSettings(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        message: 'Only GET and PUT methods are allowed',
      });
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

async function handleGetSettings(res: NextApiResponse) {
  const settings = await getPlatformSettings();
  sendSuccess(res, settings);
}

async function handleUpdateSettings(req: NextApiRequest, res: NextApiResponse) {
  const updates = req.body;

  // Validate that updates is an object
  if (!updates || typeof updates !== 'object') {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Updates must be a valid object',
    });
    return;
  }

  try {
    const updatedSettings = await updatePlatformSettings(updates);
    sendSuccess(res, updatedSettings);

  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: error.message,
    });
  }
}

export default withAdminAuth(handler, { requirePermission: { resource: 'settings', action: 'read' } });
