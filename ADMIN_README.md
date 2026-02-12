# Admin Control System Setup Guide

This guide provides step-by-step instructions for setting up and using the comprehensive admin control system for the DevZey blog platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Initialization](#initialization)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- Next.js project set up
- Basic understanding of REST APIs

## Installation

1. **Install Dependencies**

   The admin system requires additional packages. Install them using npm:

   ```bash
   npm install bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
   ```

2. **Environment Variables**

   Create a `.env.local` file in your project root:

   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-long-and-random
   NODE_ENV=development
   ```

   **Important:** Change the JWT_SECRET to a long, random string in production!

## Configuration

The admin system uses JSON file storage for data persistence. The following files will be created in the `data/` directory:

- `admin-users.json` - Admin user accounts
- `admin-sessions.json` - Active admin sessions
- `platform-settings.json` - Platform configuration

## Initialization

1. **Initialize the Admin System**

   Run the initialization script to create default admin user and settings:

   ```bash
   # Option 1: Using npm script (recommended)
   npm run admin:init

   # Option 2: Direct execution
   npx ts-node utils/admin-init.ts

   # Option 3: Import in your code
   import { initializeAdminSystem } from './utils/admin-init';
   await initializeAdminSystem();
   ```

   This will create:
   - Default super admin user (username: `admin`, password: `admin123`)
   - Default platform settings

2. **First Login**

   After initialization, you can log in with:

   ```
   Username: admin
   Password: admin123
   ```

   **⚠️ SECURITY WARNING:** Change the default password immediately after first login!

## Usage

### Admin Authentication

All admin endpoints require authentication via JWT tokens.

1. **Login to get a token:**

   ```bash
   curl -X POST http://localhost:3000/api/admin/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
   ```

   This returns a JWT token that you must include in subsequent requests:

   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3000/api/admin/dashboard/stats
   ```

2. **Logout:**

   ```bash
   curl -X POST http://localhost:3000/api/admin/auth/logout \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Admin Dashboard

Get comprehensive dashboard statistics:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/admin/dashboard/stats
```

Response includes:
- Post statistics (total, published, drafts, archived)
- User statistics
- System health metrics
- Recent activity

### User Management

#### List Admin Users

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/api/admin/users?role=admin&isActive=true"
```

#### Create New Admin User

```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "neweditor",
    "email": "editor@example.com",
    "password": "securepassword123",
    "role": "editor",
    "firstName": "New",
    "lastName": "Editor"
  }'
```

#### Update Admin User

```bash
curl -X PUT http://localhost:3000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "isActive": true
  }'
```

#### Delete Admin User

```bash
curl -X DELETE http://localhost:3000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Platform Settings Management

#### Get Current Settings

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/admin/settings
```

#### Update Settings

```bash
curl -X PUT http://localhost:3000/api/admin/settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "siteName": "My Updated Blog",
    "postsPerPage": 15,
    "securitySettings": {
      "maxLoginAttempts": 3
    }
  }'
```

### Advanced Post Management

Get posts with admin-specific filters and metadata:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:3000/api/admin/posts?status=draft&wordCountMin=500&sortBy=engagementScore"
```

## API Endpoints

### Authentication
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout

### Dashboard
- `GET /api/admin/dashboard/stats` - Dashboard statistics

### User Management
- `GET /api/admin/users` - List admin users
- `POST /api/admin/users` - Create admin user
- `GET /api/admin/users/[id]` - Get specific user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Post Management
- `GET /api/admin/posts` - List posts (admin view)

### Platform Settings
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update platform settings

## Security

### Password Requirements
- Minimum 8 characters
- Must contain numbers and special characters (configurable)
- Cannot use common weak passwords

### Session Security
- JWT tokens expire in 24 hours
- Automatic session cleanup
- IP address and user agent tracking

### Rate Limiting
- Configurable request limits per endpoint
- Brute force protection for login attempts
- Automatic lockout after failed attempts

### Audit Logging
- All admin actions are logged
- Includes user, action, resource, timestamp, IP, and success/failure status

## Troubleshooting

### Common Issues

1. **"Invalid or expired token"**
   - JWT token has expired (24 hours)
   - Token was invalidated due to password change
   - Solution: Re-login to get a new token

2. **"Insufficient permissions"**
   - User role doesn't have permission for the action
   - Check user permissions in the admin interface
   - Only super admins can modify other super admin accounts

3. **"Cannot delete the last active super admin"**
   - System requires at least one active super admin
   - Create another super admin before deleting the current one

4. **Rate limiting errors**
   - Too many requests in a short time
   - Wait a few minutes before retrying
   - Check rate limit settings in platform configuration

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
DEBUG=admin:*
```

### Reset Admin System

If you need to reset the admin system (WARNING: This deletes all admin data):

```bash
# Remove admin data files
rm -f data/admin-users.json data/admin-sessions.json data/platform-settings.json

# Re-initialize
npm run admin:init
```

## Production Deployment

### Environment Setup

1. **Set production environment variables:**

   ```env
   NODE_ENV=production
   JWT_SECRET=your-production-jwt-secret-make-it-very-long-and-random
   ```

2. **Enable HTTPS** (required for security)

3. **Configure rate limiting** based on your traffic

4. **Set up regular backups** of the `data/` directory

### Security Checklist

- [ ] Changed default admin password
- [ ] Set strong JWT_SECRET
- [ ] Enabled HTTPS
- [ ] Configured appropriate rate limits
- [ ] Set up regular backups
- [ ] Limited super admin accounts
- [ ] Enabled audit logging monitoring
- [ ] Configured maintenance mode settings

## Support

For issues or questions:

1. Check the [Admin API Documentation](./ADMIN_API_DOCUMENTATION.md)
2. Review the [Main API Documentation](./API_DOCUMENTATION.md)
3. Check server logs for error details
4. Verify file permissions on the `data/` directory

## Next Steps

After setting up the admin system:

1. **Change the default password** immediately
2. **Create additional admin accounts** as needed
3. **Configure platform settings** for your blog
4. **Set up monitoring** for admin actions
5. **Test all admin functionality** thoroughly
6. **Document your admin workflows** for your team

The admin system is now ready for managing your blog platform with comprehensive user management, content control, and platform configuration capabilities.
