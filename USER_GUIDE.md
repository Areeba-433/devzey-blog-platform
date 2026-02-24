# DevZey Blog — User Guide

Welcome to the DevZey Blog platform. This guide covers everything you need to use the blog as a reader or content creator.

## Table of Contents

- [For Readers](#for-readers)
- [For Content Creators & Administrators](#for-content-creators--administrators)
- [Admin Dashboard](#admin-dashboard)
- [Creating and Managing Posts](#creating-and-managing-posts)
- [Platform Settings](#platform-settings)
- [Troubleshooting](#troubleshooting)

---

## For Readers

### Browsing the Blog

- **Home Page**: Visit the root URL to see the latest published posts.
- **Search**: Use the search page (`/search`) to find posts by keywords, tags, or content.
- **Categories & Tags**: Click on categories or tags to filter posts.
- **Authors**: View all posts by a specific author.
- **Series**: Read multi-part content in order.

### Post Features

- **Reading Time**: Each post shows estimated reading time.
- **View Count**: See how many times a post has been viewed.
- **Related Posts**: Discover similar content at the end of each post.

---

## For Content Creators & Administrators

### Getting Started

1. **Log In**: Navigate to `/admin` and sign in with your admin credentials.
2. **Default Credentials** (after initial setup): `admin` / `admin123`
3. **Important**: Change the default password immediately after first login.

### Admin Roles

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access: users, posts, settings, analytics |
| **Admin** | Most features, cannot modify other admins |
| **Editor** | Create and edit posts, limited analytics |
| **Moderator** | Moderate content, publish/unpublish posts, basic analytics |

---

## Admin Dashboard

The dashboard shows:

- **Post Statistics**: Total, published, drafts, archived
- **User Statistics**: Total and active admin users
- **Comments & Views**: Engagement metrics
- **Recent Activity**: Latest posts and users
- **Popular Posts**: Most viewed content
- **System Health**: Uptime, memory, disk usage

### Tabs

- **Dashboard**: Overview and quick stats
- **Users**: Manage admin users (create, edit, delete)
- **Posts**: Create, edit, publish, and manage blog posts
- **Settings**: Configure platform-wide options

---

## Creating and Managing Posts

### Creating a New Post

1. Go to **Posts** tab → **Create New Post**
2. Fill in required fields:
   - **Title** (required)
   - **Content** (required) — Use Markdown
   - **Excerpt** (required) — Short summary for listings
   - **Author** (required)

3. Optional fields:
   - **Tags** (comma-separated)
   - **Category**
   - **Featured Image URL**
   - **SEO Title** and **SEO Description**
   - **Status**: Draft, Published, or Archived

### Markdown Tips

- **Bold**: `**text**`
- *Italic*: `*text*`
- Links: `[text](url)`
- Code: `` `code` ``
- Headings: `# H1`, `## H2`, etc.
- Lists: `- item` or `1. item`
- Code blocks: Wrap in triple backticks

### Post Statuses

- **Draft**: Not visible to the public
- **Published**: Visible on the blog
- **Archived**: Kept but not shown in normal listings

### Bulk Actions

- Select multiple posts
- **Delete**, **Update** (e.g., change category), **Publish**, or **Unpublish** in bulk

---

## Platform Settings

Accessible from **Settings** tab (requires appropriate permissions):

- **Site Name** and **Description**
- **Admin Email**
- **Posts Per Page**
- **Comments** (enable/disable)
- **Social Links** (Twitter, GitHub, etc.)
- **SEO Settings** (meta title, description, Google Analytics)
- **Security** (session timeout, password rules, rate limits)
- **Maintenance Mode** (show maintenance message to visitors)

---

## Troubleshooting

### Cannot Log In

- Check username and password
- Ensure the admin system has been initialized (`npm run admin:init`)
- If locked out, reset by removing `data/admin-users.json` and re-running `admin:init`

### Post Not Appearing

- Confirm status is **Published**
- Check publication date (scheduled posts may not be live yet)
- Clear browser cache

### Editor Issues

- The content editor uses Markdown with a live preview
- If preview doesn’t update, refresh the page
- Save drafts frequently

### For More Help

- See [ADMIN_README.md](./ADMIN_README.md) for setup and configuration
- See [ADMIN_API_DOCUMENTATION.md](./ADMIN_API_DOCUMENTATION.md) for API details
