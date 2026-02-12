import { promises as fs } from 'fs';
import path from 'path';
import { PlatformSettings } from '../types/admin';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'platform-settings.json');

// Default platform settings
const DEFAULT_SETTINGS: PlatformSettings = {
  id: 'platform-settings',
  siteName: 'DevZey Blog',
  siteDescription: 'A modern blog platform built with Next.js',
  siteUrl: 'https://devzey-blog.vercel.app',
  adminEmail: 'admin@devzey-blog.com',
  allowRegistration: false,
  requireEmailVerification: false,
  defaultUserRole: 'editor',
  postsPerPage: 10,
  commentsEnabled: true,
  socialLinks: {
    twitter: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    github: ''
  },
  seoSettings: {
    defaultMetaTitle: 'DevZey Blog',
    defaultMetaDescription: 'A modern blog platform built with Next.js',
    googleAnalyticsId: '',
    robotsTxt: 'User-agent: *\nAllow: /\n\nSitemap: https://devzey-blog.vercel.app/sitemap.xml'
  },
  emailSettings: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@devzey-blog.com',
    fromName: 'DevZey Blog'
  },
  securitySettings: {
    sessionTimeout: 480, // 8 hours in minutes
    maxLoginAttempts: 5,
    lockoutDuration: 30, // 30 minutes
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true
  },
  maintenanceMode: {
    enabled: false,
    message: 'The site is currently under maintenance. Please check back later.',
    allowedIPs: []
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Utility functions
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readSettings(): Promise<PlatformSettings> {
  await ensureDataDirectory();
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(data);
    return {
      ...settings,
      createdAt: new Date(settings.createdAt),
      updatedAt: new Date(settings.updatedAt)
    };
  } catch {
    // Return default settings if file doesn't exist
    return DEFAULT_SETTINGS;
  }
}

async function writeSettings(settings: PlatformSettings): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// Initialize default settings if they don't exist
export async function initializeDefaultSettings(): Promise<void> {
  const existingSettings = await readSettings();
  if (existingSettings.id !== DEFAULT_SETTINGS.id) {
    await writeSettings(DEFAULT_SETTINGS);
    console.log('Default platform settings initialized');
  }
}

// Get current platform settings
export async function getPlatformSettings(): Promise<PlatformSettings> {
  return readSettings();
}

// Update platform settings
export async function updatePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const currentSettings = await readSettings();

  // Validate critical settings
  if (updates.siteName !== undefined && (!updates.siteName || updates.siteName.trim().length === 0)) {
    throw new Error('Site name cannot be empty');
  }

  if (updates.siteUrl !== undefined && updates.siteUrl) {
    try {
      new URL(updates.siteUrl);
    } catch {
      throw new Error('Invalid site URL format');
    }
  }

  if (updates.adminEmail !== undefined && updates.adminEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.adminEmail)) {
      throw new Error('Invalid admin email format');
    }
  }

  if (updates.emailSettings?.fromEmail !== undefined && updates.emailSettings.fromEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.emailSettings.fromEmail)) {
      throw new Error('Invalid from email format');
    }
  }

  if (updates.securitySettings?.passwordMinLength !== undefined &&
      updates.securitySettings.passwordMinLength < 6) {
    throw new Error('Password minimum length must be at least 6 characters');
  }

  if (updates.securitySettings?.sessionTimeout !== undefined &&
      updates.securitySettings.sessionTimeout < 15) {
    throw new Error('Session timeout must be at least 15 minutes');
  }

  if (updates.securitySettings?.maxLoginAttempts !== undefined &&
      updates.securitySettings.maxLoginAttempts < 3) {
    throw new Error('Maximum login attempts must be at least 3');
  }

  if (updates.postsPerPage !== undefined && (updates.postsPerPage < 1 || updates.postsPerPage > 100)) {
    throw new Error('Posts per page must be between 1 and 100');
  }

  const updatedSettings: PlatformSettings = {
    ...currentSettings,
    ...updates,
    updatedAt: new Date()
  };

  await writeSettings(updatedSettings);
  return updatedSettings;
}

// Get specific setting sections
export async function getSiteSettings(): Promise<Pick<PlatformSettings, 'siteName' | 'siteDescription' | 'siteUrl' | 'adminEmail'>> {
  const settings = await readSettings();
  return {
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    siteUrl: settings.siteUrl,
    adminEmail: settings.adminEmail
  };
}

export async function getUserSettings(): Promise<Pick<PlatformSettings, 'allowRegistration' | 'requireEmailVerification' | 'defaultUserRole'>> {
  const settings = await readSettings();
  return {
    allowRegistration: settings.allowRegistration,
    requireEmailVerification: settings.requireEmailVerification,
    defaultUserRole: settings.defaultUserRole
  };
}

export async function getContentSettings(): Promise<Pick<PlatformSettings, 'postsPerPage' | 'commentsEnabled'>> {
  const settings = await readSettings();
  return {
    postsPerPage: settings.postsPerPage,
    commentsEnabled: settings.commentsEnabled
  };
}

export async function getSocialSettings(): Promise<PlatformSettings['socialLinks']> {
  const settings = await readSettings();
  return settings.socialLinks;
}

export async function getSEOSettings(): Promise<PlatformSettings['seoSettings']> {
  const settings = await readSettings();
  return settings.seoSettings;
}

export async function getEmailSettings(): Promise<PlatformSettings['emailSettings']> {
  const settings = await readSettings();
  return settings.emailSettings;
}

export async function getSecuritySettings(): Promise<PlatformSettings['securitySettings']> {
  const settings = await readSettings();
  return settings.securitySettings;
}

export async function getMaintenanceSettings(): Promise<PlatformSettings['maintenanceMode']> {
  const settings = await readSettings();
  return settings.maintenanceMode;
}

// Check if maintenance mode is enabled
export async function isMaintenanceMode(): Promise<boolean> {
  const settings = await readSettings();
  return settings.maintenanceMode.enabled;
}

// Check if IP is allowed during maintenance
export async function isIPAllowedDuringMaintenance(ip: string): Promise<boolean> {
  const settings = await readSettings();
  return settings.maintenanceMode.allowedIPs.includes(ip);
}

// Get robots.txt content
export async function getRobotsTxt(): Promise<string> {
  const settings = await readSettings();
  return settings.seoSettings.robotsTxt || DEFAULT_SETTINGS.seoSettings.robotsTxt!;
}

// Get sitemap URL
export async function getSitemapUrl(): Promise<string> {
  const settings = await readSettings();
  return `${settings.siteUrl}/sitemap.xml`;
}

// Validate and sanitize settings
export function validateSocialLink(url: string): boolean {
  if (!url || url.trim().length === 0) return true; // Empty is allowed
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateEmailSettings(settings: PlatformSettings['emailSettings']): string[] {
  const errors: string[] = [];

  if (settings.smtpHost && (!settings.smtpPort || settings.smtpPort < 1 || settings.smtpPort > 65535)) {
    errors.push('SMTP port must be between 1 and 65535');
  }

  if (settings.fromEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.fromEmail)) {
      errors.push('Invalid from email format');
    }
  }

  return errors;
}
