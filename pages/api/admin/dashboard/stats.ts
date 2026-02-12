import { NextApiRequest, NextApiResponse } from 'next';
import { getPostStats, getPosts } from '../../../../lib/posts';
import { getAdminUsers, getAdminUserById } from '../../../../utils/admin-auth';
import { withAdminAuth } from '../../../../utils/admin-middleware';
import { handleApiError, sendSuccess } from '../../../../utils/api-errors';
import { AdminDashboardStats } from '../../../../types/admin';

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

    const stats = await generateDashboardStats();
    sendSuccess(res, stats);

  } catch (error) {
    handleApiError(error, res);
  }
}

async function generateDashboardStats(): Promise<AdminDashboardStats> {
  // Get post statistics
  const postStats = await getPostStats();

  // Get admin users statistics
  const allUsers = await getAdminUsers();
  const activeUsers = allUsers.filter(u => u.isActive);

  // Get recent posts (last 10)
  const recentPosts = await getPosts({
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Get recent users (last 5)
  const recentUsers = await getAdminUsers({
    limit: 5,
    offset: 0
  });

  // Get popular posts (by view count)
  const popularPosts = await getPosts({
    published: true,
    limit: 10,
    sortBy: 'viewCount',
    sortOrder: 'desc'
  });

  // Calculate system health metrics
  const systemHealth = await getSystemHealth();

  // Format recent posts for dashboard
  const formattedRecentPosts = recentPosts.map(post => ({
    id: post.id,
    title: post.title,
    author: post.author,
    status: post.status,
    createdAt: post.createdAt,
    viewCount: post.viewCount
  }));

  // Format recent users for dashboard
  const formattedRecentUsers = recentUsers.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  }));

  // Format popular posts for dashboard
  const formattedPopularPosts = popularPosts.slice(0, 5).map(post => ({
    id: post.id,
    title: post.title,
    viewCount: post.viewCount,
    likeCount: post.likeCount
  }));

  return {
    totalPosts: postStats.total,
    publishedPosts: postStats.published,
    draftPosts: postStats.drafts,
    archivedPosts: postStats.archived,
    totalUsers: allUsers.length,
    activeUsers: activeUsers.length,
    totalComments: postStats.totalComments,
    pendingComments: 0, // TODO: Implement comment system
    totalViews: postStats.totalViews,
    recentPosts: formattedRecentPosts,
    recentUsers: formattedRecentUsers,
    popularPosts: formattedPopularPosts,
    systemHealth
  };
}

async function getSystemHealth() {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  const fs = require('fs').promises;
  let diskUsage = 0;

  try {
    // Get disk usage (simplified - just data directory size)
    const dataDir = './data';
    const files = await fs.readdir(dataDir);
    let totalSize = 0;

    for (const file of files) {
      try {
        const stats = await fs.stat(`${dataDir}/${file}`);
        totalSize += stats.size;
      } catch {
        // Skip files that can't be accessed
      }
    }

    diskUsage = totalSize;
  } catch {
    // If we can't get disk usage, set to 0
    diskUsage = 0;
  }

  // Mock last backup date (in a real system, this would come from backup logs)
  const lastBackup = null; // TODO: Implement backup tracking

  return {
    uptime: Math.floor(uptime),
    memoryUsage: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    diskUsage: Math.round(diskUsage / 1024 / 1024), // MB
    lastBackup
  };
}

export default withAdminAuth(handler, { requirePermission: { resource: 'analytics', action: 'read' } });
