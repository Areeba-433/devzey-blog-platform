# Admin API Documentation

This comprehensive admin API provides full administrative control over the blog platform, including user management, content moderation, platform settings, and analytics.

## Table of Contents

- [Authentication](#authentication)
- [Authorization & Roles](#authorization--roles)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Security Features](#security-features)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Dashboard](#dashboard-endpoints)
  - [User Management](#user-management-endpoints)
  - [Post Management](#post-management-endpoints)
  - [Platform Settings](#platform-settings-endpoints)
- [Data Models](#data-models)
- [Security Best Practices](#security-best-practices)

## Authentication

Admin authentication uses JWT (JSON Web Tokens) with secure password hashing and session management.

### Login Process

```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "yourpassword"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "username": "admin",
      "email": "admin@example.com",
      "role": "super_admin",
      "firstName": "Super",
      "lastName": "Admin",
      "isActive": true,
      "permissions": [...],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here",
    "expiresAt": "2024-01-21T00:00:00.000Z"
  }
}
```

### Using Authentication

Include the JWT token in the Authorization header for all admin requests:

```
Authorization: Bearer jwt-token-here
```

### Logout

```http
POST /api/admin/auth/logout
Authorization: Bearer jwt-token-here
```

## Authorization & Roles

### Admin Roles

1. **Super Admin**: Full access to all features and settings
2. **Admin**: Most administrative features, cannot modify other admins
3. **Editor**: Content creation and editing, limited admin access
4. **Moderator**: Content moderation and basic analytics

### Permission System

Each role has specific permissions for different resources:

```typescript
interface AdminPermission {
  resource: 'users' | 'posts' | 'comments' | 'settings' | 'analytics' | 'media' | 'categories' | 'tags' | 'authors' | 'series';
  actions: ('create' | 'read' | 'update' | 'delete' | 'publish' | 'unpublish' | 'moderate' | 'manage')[];
}
```

### Default Role Permissions

- **Super Admin**: All permissions on all resources
- **Admin**: All permissions except managing super admin accounts
- **Editor**: Create, read, update posts; limited analytics
- **Moderator**: Moderate comments, publish/unpublish posts, basic analytics

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* payload */ },
  "error": null,
  "message": null
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "field": "optional_field_name"
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Common Error Types

- `Validation Error` - Input validation failed
- `Unauthorized` - Authentication required or invalid
- `Forbidden` - Insufficient permissions
- `Not Found` - Resource doesn't exist
- `Conflict` - Resource already exists
- `Too Many Requests` - Rate limit exceeded

## Security Features

### Password Security
- Minimum 8 characters
- Bcrypt hashing with salt rounds
- Protection against common weak passwords

### Session Management
- JWT tokens with expiration
- Secure session storage
- Automatic cleanup of expired sessions

### Rate Limiting
- Configurable request limits per endpoint
- Brute force protection for login attempts
- IP-based and user-based limiting

### Input Validation
- XSS protection through input sanitization
- SQL injection prevention
- File upload security validation

### Audit Logging
- All admin actions are logged
- IP address and user agent tracking
- Success/failure status tracking

## Endpoints

### Authentication Endpoints

#### Login

```http
POST /api/admin/auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** User data with JWT token

#### Logout

```http
POST /api/admin/auth/logout
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Dashboard Endpoints

#### Get Dashboard Statistics

```http
GET /api/admin/dashboard/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPosts": 150,
    "publishedPosts": 120,
    "draftPosts": 25,
    "archivedPosts": 5,
    "totalUsers": 8,
    "activeUsers": 7,
    "totalComments": 450,
    "pendingComments": 0,
    "totalViews": 25000,
    "recentPosts": [...],
    "recentUsers": [...],
    "popularPosts": [...],
    "systemHealth": {
      "uptime": 3600,
      "memoryUsage": 45,
      "diskUsage": 120,
      "lastBackup": null
    }
  }
}
```

### User Management Endpoints

#### List Admin Users

```http
GET /api/admin/users?role=admin&isActive=true&limit=10&offset=0
Authorization: Bearer {token}
```

**Query Parameters:**
- `role` - Filter by role (super_admin, admin, editor, moderator)
- `isActive` - Filter by active status (true/false)
- `limit` - Number of users to return
- `offset` - Number of users to skip

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-id",
        "username": "admin",
        "email": "admin@example.com",
        "role": "super_admin",
        "firstName": "Super",
        "lastName": "Admin",
        "isActive": true,
        "lastLoginAt": "2024-01-20T10:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "permissions": [...]
      }
    ],
    "total": 1
  }
}
```

#### Create Admin User

```http
POST /api/admin/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "securepassword123",
  "role": "editor",
  "firstName": "New",
  "lastName": "User",
  "permissions": [...]
}
```

#### Get Specific Admin User

```http
GET /api/admin/users/{userId}
Authorization: Bearer {token}
```

#### Update Admin User

```http
PUT /api/admin/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "updateduser",
  "email": "updated@example.com",
  "role": "admin",
  "firstName": "Updated",
  "lastName": "User",
  "isActive": true
}
```

#### Delete Admin User

```http
DELETE /api/admin/users/{userId}
Authorization: Bearer {token}
```

**Note:** Cannot delete your own account or the last active super admin.

### Post Management Endpoints

#### List Posts (Admin View)

```http
GET /api/admin/posts?status=draft&author=john&limit=20&sortBy=createdAt&sortOrder=desc&wordCountMin=500
Authorization: Bearer {token}
```

**Additional Admin Filters:**
- `hasComments` - Posts with/without comments
- `wordCountMin` - Minimum word count
- `wordCountMax` - Maximum word count

**Enhanced Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post-id",
        "title": "Post Title",
        "content": "Post content...",
        "excerpt": "Post excerpt",
        "author": "John Doe",
        "published": false,
        "status": "draft",
        "tags": ["tag1", "tag2"],
        "category": "Technology",
        "viewCount": 150,
        "likeCount": 25,
        "commentCount": 10,
        "wordCount": 850,
        "readingTime": 4,
        "createdAt": "2024-01-20T10:00:00.000Z",
        "updatedAt": "2024-01-20T10:00:00.000Z",
        "adminMetadata": {
          "isPublished": false,
          "daysSinceCreation": 5,
          "daysSinceUpdate": 1,
          "engagementScore": 275
        }
      }
    ],
    "total": 1,
    "filters": {...}
  }
}
```

### Platform Settings Endpoints

#### Get Platform Settings

```http
GET /api/admin/settings
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "siteName": "DevZey Blog",
    "siteDescription": "A modern blog platform",
    "siteUrl": "https://devzey-blog.vercel.app",
    "adminEmail": "admin@devzey-blog.com",
    "allowRegistration": false,
    "requireEmailVerification": false,
    "defaultUserRole": "editor",
    "postsPerPage": 10,
    "commentsEnabled": true,
    "socialLinks": {
      "twitter": "",
      "facebook": "",
      "instagram": "",
      "linkedin": "",
      "github": ""
    },
    "seoSettings": {
      "defaultMetaTitle": "DevZey Blog",
      "defaultMetaDescription": "A modern blog platform",
      "googleAnalyticsId": "",
      "robotsTxt": "User-agent: *\nAllow: /"
    },
    "emailSettings": {
      "smtpHost": "",
      "smtpPort": 587,
      "smtpUser": "",
      "smtpPassword": "",
      "fromEmail": "noreply@devzey-blog.com",
      "fromName": "DevZey Blog"
    },
    "securitySettings": {
      "sessionTimeout": 480,
      "maxLoginAttempts": 5,
      "lockoutDuration": 30,
      "passwordMinLength": 8,
      "requireSpecialChars": true,
      "requireNumbers": true
    },
    "maintenanceMode": {
      "enabled": false,
      "message": "Site under maintenance",
      "allowedIPs": []
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Platform Settings

```http
PUT /api/admin/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "siteName": "Updated Blog Name",
  "siteDescription": "Updated description",
  "postsPerPage": 15,
  "securitySettings": {
    "maxLoginAttempts": 3,
    "passwordMinLength": 10
  }
}
```

## Data Models

### Admin User

```typescript
interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'super_admin' | 'admin' | 'editor' | 'moderator';
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  permissions: AdminPermission[];
}
```

### Admin Permission

```typescript
interface AdminPermission {
  resource: 'users' | 'posts' | 'comments' | 'settings' | 'analytics' | 'media' | 'categories' | 'tags' | 'authors' | 'series';
  actions: ('create' | 'read' | 'update' | 'delete' | 'publish' | 'unpublish' | 'moderate' | 'manage')[];
}
```

### Platform Settings

```typescript
interface PlatformSettings {
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
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
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
```

## Security Best Practices

### For Administrators

1. **Use Strong Passwords**: Minimum 8 characters with special characters and numbers
2. **Enable 2FA**: When available (not implemented in this version)
3. **Regular Password Changes**: Change passwords every 90 days
4. **Monitor Audit Logs**: Regularly review admin actions
5. **Limit Super Admin Accounts**: Keep super admin accounts to minimum necessary

### For Developers

1. **Environment Variables**: Store sensitive data in environment variables
2. **HTTPS Only**: Always use HTTPS in production
3. **Input Validation**: Validate all inputs on both client and server
4. **Rate Limiting**: Implement appropriate rate limits
5. **Security Headers**: Use security headers middleware
6. **Regular Updates**: Keep dependencies updated
7. **Backup Strategy**: Regular data backups
8. **Access Control**: Implement principle of least privilege

### API Security Checklist

- [x] JWT authentication with expiration
- [x] Password hashing with bcrypt
- [x] Role-based access control
- [x] Input sanitization and validation
- [x] Rate limiting
- [x] Audit logging
- [x] XSS protection
- [x] SQL injection prevention
- [x] File upload security
- [x] Session management
- [x] Error handling without information leakage

## Usage Examples

### JavaScript Admin Client

```javascript
class AdminAPI {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('adminToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('adminToken', token);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Authentication
  async login(username, password) {
    const response = await this.request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setToken(response.data.token);
    return response.data;
  }

  async logout() {
    await this.request('/admin/auth/logout', { method: 'POST' });
    this.token = null;
    localStorage.removeItem('adminToken');
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  // User Management
  async getUsers(filters = {}) {
    const query = new URLSearchParams(filters);
    return this.request(`/admin/users?${query}`);
  }

  async createUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(userId, updates) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  // Settings
  async getSettings() {
    return this.request('/admin/settings');
  }

  async updateSettings(settings) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
}

// Usage
const adminAPI = new AdminAPI();

// Login
const loginResult = await adminAPI.login('admin', 'password123');
console.log('Logged in as:', loginResult.user.username);

// Get dashboard stats
const stats = await adminAPI.getDashboardStats();
console.log('Total posts:', stats.data.totalPosts);

// Create a new editor
const newUser = await adminAPI.createUser({
  username: 'neweditor',
  email: 'editor@example.com',
  password: 'securepass123',
  role: 'editor',
  firstName: 'New',
  lastName: 'Editor'
});
```

This admin API provides a complete administrative interface for managing the blog platform with robust security, comprehensive functionality, and detailed audit trails.
