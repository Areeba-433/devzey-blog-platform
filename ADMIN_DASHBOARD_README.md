# Admin Dashboard Component

A complete, copy-paste admin dashboard with user and post management controls built for the DevZey blog platform.

## Features

### 🔐 **Authentication**
- JWT-based login system
- Secure token storage in localStorage
- Automatic logout on token expiration
- Role-based access control

### 📊 **Dashboard Overview**
- Real-time statistics (posts, users, views)
- System health monitoring
- Recent activity feeds
- Popular content tracking

### 👥 **User Management**
- List all admin users with filtering
- Create new admin users with role assignment
- Edit user details and permissions
- Activate/deactivate users
- Delete users (with safety checks)
- Role-based permission management

### 📝 **Post Management**
- Advanced post filtering and search
- Publish/unpublish posts
- Bulk operations support
- View post analytics (views, likes, comments)
- Quick status changes

### ⚙️ **Platform Settings**
- Site configuration management
- Security settings control
- Content and user settings
- Maintenance mode configuration
- Real-time settings updates

## Installation

1. **Copy the component:**
   ```bash
   # Copy components/AdminDashboard.tsx to your project
   cp AdminDashboard.tsx your-project/components/
   ```

2. **Copy the styles:**
   ```bash
   # Copy styles/admin.css to your project
   cp admin.css your-project/styles/
   ```

3. **Create the admin page:**
   ```bash
   # Copy pages/admin.tsx to your project
   cp admin.tsx your-project/pages/
   ```

4. **Install dependencies:**
   ```bash
   npm install bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
   ```

5. **Initialize admin system:**
   ```bash
   npm run admin:init
   ```

## Usage

### Basic Implementation

```tsx
import AdminDashboard from '../components/AdminDashboard';

export default function AdminPage() {
  return <AdminDashboard />;
}
```

### With Logout Callback

```tsx
import AdminDashboard from '../components/AdminDashboard';

export default function AdminPage() {
  const handleLogout = () => {
    // Redirect to home page or login page
    window.location.href = '/';
  };

  return <AdminDashboard onLogout={handleLogout} />;
}
```

## API Endpoints Required

The dashboard requires these API endpoints to be available:

### Authentication
- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`

### Dashboard
- `GET /api/admin/dashboard/stats`

### User Management
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/[id]`
- `DELETE /api/admin/users/[id]`

### Post Management
- `GET /api/admin/posts`
- `PUT /api/posts/[id]` (for status changes)
- `DELETE /api/posts/[id]`

### Settings
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

## Component Structure

```
AdminDashboard
├── AdminLogin (login form)
├── Header (navigation and logout)
├── Sidebar (tab navigation)
├── DashboardTab
│   ├── Statistics Cards
│   ├── Recent Activity
│   └── System Health
├── UsersTab
│   ├── User List Table
│   ├── UserForm (create/edit)
│   └── Action Buttons
├── PostsTab
│   ├── Post Filters
│   ├── Post List Table
│   └── Action Buttons
└── SettingsTab
    ├── Site Settings
    ├── Content Settings
    ├── Security Settings
    └── Maintenance Mode
```

## Customization

### Styling

The component uses Tailwind CSS classes. Customize by:

1. **Modifying the component classes directly**
2. **Overriding with custom CSS**
3. **Using CSS custom properties**

Example custom CSS:
```css
.admin-dashboard {
  --primary-color: #your-color;
  --background-color: #your-bg;
}

.admin-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Adding New Features

To add new admin features:

1. **Add new tab to sidebar navigation**
2. **Create new tab component**
3. **Add API endpoints if needed**
4. **Update types and permissions**

Example:
```tsx
// Add to activeTab type
type TabType = 'dashboard' | 'users' | 'posts' | 'settings' | 'new-feature';

// Add to sidebar
<li>
  <button onClick={() => setActiveTab('new-feature')}>
    🆕 New Feature
  </button>
</li>

// Add tab component
{activeTab === 'new-feature' && (
  <NewFeatureTab token={token} />
)}
```

## Security Features

### Built-in Security
- **Input validation** on all forms
- **XSS protection** through sanitization
- **CSRF protection** via JWT
- **Rate limiting** (handled by API)
- **Role-based access** control
- **Secure password** handling

### Best Practices
- Always validate user permissions on API calls
- Use HTTPS in production
- Regularly rotate JWT secrets
- Monitor admin activity logs
- Implement session timeouts

## User Roles & Permissions

### Super Admin
- Full access to all features
- Can manage other super admins
- Can modify system settings

### Admin
- Most administrative features
- Cannot delete super admins
- Limited settings access

### Editor
- Content creation and editing
- Can publish/unpublish own posts
- View analytics

### Moderator
- Content moderation
- Basic user management
- Limited analytics access

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Responsiveness

The dashboard is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Performance

### Optimizations
- Lazy loading of tab content
- Efficient API calls with caching
- Minimal re-renders
- Compressed CSS and JS

### Monitoring
- API response times
- Memory usage
- User session tracking
- Error logging

## Troubleshooting

### Common Issues

1. **Login not working**
   - Check API endpoints are running
   - Verify JWT_SECRET is set
   - Check browser console for errors

2. **Permissions errors**
   - Verify user role has required permissions
   - Check API middleware configuration
   - Clear browser cache and retry

3. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check admin.css is imported
   - Verify no CSS conflicts

4. **API errors**
   - Check network connectivity
   - Verify API endpoints return correct format
   - Check server logs for detailed errors

### Debug Mode

Enable debug logging:
```bash
# Set in .env.local
NODE_ENV=development
DEBUG=admin:*
```

## API Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null,
  "message": null
}
```

Error responses:
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human readable message",
  "field": "optional_field_name"
}
```

## Contributing

To extend the admin dashboard:

1. **Add new features** following the existing patterns
2. **Test thoroughly** on all supported browsers
3. **Update documentation** with new features
4. **Follow security best practices**
5. **Ensure responsive design**

## License

This admin dashboard is part of the DevZey blog platform and follows the same licensing terms.

---

## Quick Start Checklist

- [ ] Copy AdminDashboard.tsx to components/
- [ ] Copy admin.css to styles/
- [ ] Copy admin.tsx to pages/
- [ ] Install required dependencies
- [ ] Run `npm run admin:init`
- [ ] Access `/admin` in your browser
- [ ] Login with default credentials
- [ ] Change default password immediately
- [ ] Configure platform settings
- [ ] Create additional admin users

The admin dashboard is now ready to use! 🎉
