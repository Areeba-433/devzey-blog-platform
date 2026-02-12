export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  permissions: AdminPermission[];
}

export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'moderator';

export interface AdminPermission {
  resource: AdminResource;
  actions: AdminAction[];
}

export type AdminResource =
  | 'users'
  | 'posts'
  | 'comments'
  | 'settings'
  | 'analytics'
  | 'media'
  | 'categories'
  | 'tags'
  | 'authors'
  | 'series';

export type AdminAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'moderate'
  | 'manage';

export interface CreateAdminUserRequest {
  username: string;
  email: string;
  password: string;
  role: AdminRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  permissions?: AdminPermission[];
}

export interface UpdateAdminUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: AdminRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive?: boolean;
  permissions?: AdminPermission[];
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminAuthResponse {
  user: Omit<AdminUser, 'passwordHash'>;
  token: string;
  expiresAt: Date;
}

export interface AdminSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface PlatformSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: AdminRole;
  postsPerPage: number;
  commentsEnabled: boolean;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  seoSettings: {
    defaultMetaTitle?: string;
    defaultMetaDescription?: string;
    googleAnalyticsId?: string;
    robotsTxt?: string;
  };
  emailSettings: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail: string;
    fromName: string;
  };
  securitySettings: {
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    passwordMinLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
  };
  maintenanceMode: {
    enabled: boolean;
    message?: string;
    allowedIPs?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminDashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalUsers: number;
  activeUsers: number;
  totalComments: number;
  pendingComments: number;
  totalViews: number;
  recentPosts: Array<{
    id: string;
    title: string;
    author: string;
    status: string;
    createdAt: Date;
    viewCount: number;
  }>;
  recentUsers: Array<{
    id: string;
    username: string;
    email: string;
    role: AdminRole;
    createdAt: Date;
    lastLoginAt?: Date;
  }>;
  popularPosts: Array<{
    id: string;
    title: string;
    viewCount: number;
    likeCount: number;
  }>;
  systemHealth: {
    uptime: number;
    memoryUsage: number;
    diskUsage: number;
    lastBackup?: Date;
  };
}

export interface AdminAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
