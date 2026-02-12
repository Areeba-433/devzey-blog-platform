# Blog Post Database Schema

## Overview

This blog post management system uses a file-based JSON storage system located in the `data/posts.json` file. The system provides comprehensive blog post management with advanced features for SEO, analytics, social media, and content organization.

## Storage Structure

### File Location
- **Path**: `data/posts.json`
- **Format**: JSON array of post objects
- **Auto-created**: Yes (when first post is created)

### Post Schema

Each post in the system is represented by a comprehensive object with the following structure:

```typescript
interface Post {
  // Core Content Fields
  id: string;                    // Unique identifier (auto-generated)
  title: string;                 // Post title (required, 1-200 chars)
  slug: string;                  // URL-friendly slug (auto-generated from title)
  content: string;               // Full post content in markdown/HTML (required)
  excerpt: string;               // Short summary/description (required, 1-500 chars)
  author: string;                // Author name (required)

  // Publication Status
  published: boolean;            // Whether post is publicly visible
  publishedAt: Date | null;      // Publication timestamp
  status: 'draft' | 'published' | 'archived';  // Current status
  scheduledPublishAt: Date | null;  // Future publication date

  // Metadata
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last modification timestamp

  // Organization
  tags: string[];                // Array of tag strings
  category: string;              // Primary category (defaults to 'Uncategorized')

  // Media
  featuredImage?: string;        // URL to featured image

  // SEO Fields
  seoTitle?: string;             // Custom SEO title (falls back to title)
  seoDescription?: string;       // Custom SEO description (falls back to excerpt)
  canonicalUrl?: string;         // Canonical URL for SEO
  noIndex?: boolean;             // Whether to add noindex meta tag
  structuredData?: object;       // JSON-LD structured data

  // Content Management
  series?: string;               // Series name for grouping related posts
  seriesOrder?: number;          // Order within series (0-based)
  relatedPosts?: string[];       // Array of related post IDs

  // Social Media
  socialTitle?: string;          // Custom title for social sharing
  socialDescription?: string;    // Custom description for social sharing
  socialImage?: string;          // Custom image for social sharing

  // Analytics & Tracking
  viewCount: number;             // Number of views
  likeCount: number;             // Number of likes
  commentCount: number;          // Number of comments
  lastViewedAt?: Date;           // Last view timestamp

  // Content Metrics
  readingTime: number;           // Estimated reading time in minutes
  wordCount: number;             // Total word count

  // Extensibility
  customFields?: Record<string, any>;  // Custom metadata fields
}
```

## Data Validation Rules

### Required Fields
- `title`: Non-empty string, trimmed
- `content`: Non-empty string, trimmed
- `excerpt`: Non-empty string, trimmed
- `author`: Non-empty string, trimmed

### Optional Fields with Validation
- `tags`: Array of strings (defaults to empty array)
- `category`: String (defaults to 'Uncategorized')
- `status`: Must be one of: 'draft', 'published', 'archived' (defaults to 'draft')
- `scheduledPublishAt`: Valid Date object or null
- `seriesOrder`: Non-negative integer or null
- `seoTitle`, `seoDescription`, `canonicalUrl`: Strings or undefined
- `noIndex`: Boolean (defaults to false)
- `featuredImage`, `socialImage`: Valid URL strings or undefined

### Auto-generated Fields
- `id`: Generated using timestamp + random string
- `slug`: Generated from title using URL-friendly transformation
- `createdAt`: Set to current timestamp on creation
- `updatedAt`: Updated on every modification
- `publishedAt`: Set when post becomes published
- `readingTime`: Calculated based on word count (200 WPM)
- `wordCount`: Calculated from content
- `viewCount`, `likeCount`, `commentCount`: Initialized to 0

## Data Relationships

### Post-to-Post Relationships
- **Related Posts**: `relatedPosts` array contains IDs of related posts
- **Series**: Posts can be grouped by `series` field with `seriesOrder` for sequencing

### Categories and Tags
- **Categories**: Single category per post (string field)
- **Tags**: Multiple tags per post (string array)
- Categories and tags are not stored separately but extracted from posts

## Indexing and Search

### Full-text Search Fields
The system supports searching across:
- `title`
- `content`
- `excerpt`
- `tags` (individual tag matches)
- `category`
- `author`

### Filtering Options
Posts can be filtered by:
- `published`: Boolean status
- `status`: 'draft' | 'published' | 'archived'
- `author`: Exact or partial match
- `category`: Exact match
- `tag`: Partial match against any tag
- `series`: Partial match
- `dateFrom` / `dateTo`: Date range filters
- `minViews`: Minimum view count
- `excludeIds`: Exclude specific post IDs

### Sorting Options
Posts can be sorted by:
- `createdAt`: Creation date
- `updatedAt`: Last modification date
- `publishedAt`: Publication date
- `viewCount`: View count
- `likeCount`: Like count

## Data Persistence

### File Operations
- **Read**: JSON file parsed into Post array
- **Write**: Post array serialized to JSON with 2-space indentation
- **Atomic**: All operations read entire file and write complete dataset

### Concurrency
- **Current Limitation**: File-based storage doesn't support concurrent writes
- **Recommendation**: For production use, migrate to database (PostgreSQL/MySQL recommended)

### Backup Strategy
- **Manual**: Copy `data/posts.json` file
- **Automated**: Implement regular file backups
- **Version Control**: Include in git (with appropriate .gitignore rules)

## Migration Path

### To Database
When migrating from file-based to database storage:

1. **Schema Creation**: Create posts table with equivalent fields
2. **Data Types**: Convert dates to TIMESTAMP, JSON fields to JSON/JSONB
3. **Indexes**: Add indexes on frequently queried fields (status, published, author, category, tags)
4. **Relationships**: Consider separate tables for categories/tags if needed
5. **Full-text Search**: Use database FTS capabilities (PostgreSQL tsvector, MySQL FULLTEXT)

### Sample Database Schema (PostgreSQL)

```sql
CREATE TABLE posts (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,

  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP NULL,
  status VARCHAR(50) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  scheduled_publish_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  tags JSONB DEFAULT '[]'::jsonb,
  category VARCHAR(255) DEFAULT 'Uncategorized',
  featured_image VARCHAR(1000),

  seo_title VARCHAR(500),
  seo_description TEXT,
  canonical_url VARCHAR(1000),
  no_index BOOLEAN DEFAULT FALSE,
  structured_data JSONB,

  series VARCHAR(255),
  series_order INTEGER,
  related_posts JSONB DEFAULT '[]'::jsonb,

  social_title VARCHAR(500),
  social_description TEXT,
  social_image VARCHAR(1000),

  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,

  reading_time INTEGER DEFAULT 1,
  word_count INTEGER DEFAULT 0,
  custom_fields JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_author ON posts(author);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_series ON posts(series);
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX idx_posts_related_posts ON posts USING GIN (related_posts);
```

## API Integration

### RESTful Endpoints
The schema supports the following API operations:

- `GET /api/posts` - List posts with filtering/pagination
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get single post by ID
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `GET /api/posts/slug/[slug]` - Get post by slug (SEO-friendly)
- `GET /api/posts/search` - Full-text search
- `GET /api/posts/stats` - Analytics statistics
- `GET /api/posts/categories` - List categories with counts
- `GET /api/posts/tags` - List tags with counts
- `POST /api/posts/bulk` - Bulk operations (delete/update/publish)

### Response Format
All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* payload */ },
  "error": null,
  "message": null
}
```

## Data Integrity

### Validation
- **Input Validation**: All inputs validated using custom validation functions
- **Type Safety**: TypeScript interfaces ensure type safety
- **Sanitization**: String fields trimmed and sanitized

### Error Handling
- **Validation Errors**: 400 status with detailed field-level errors
- **Not Found**: 404 status for missing resources
- **Server Errors**: 500 status with generic error messages
- **Logging**: All errors logged for debugging

## Performance Considerations

### Current Limitations (File-based)
- **Memory Usage**: Entire dataset loaded into memory
- **Write Performance**: Full file rewrite on every change
- **Concurrency**: No support for concurrent operations
- **Search Performance**: Linear search through all posts

### Optimization Strategies
- **Caching**: Implement Redis for frequently accessed posts
- **Pagination**: Always use pagination for list operations
- **Indexing**: Pre-compute common aggregations
- **Background Jobs**: Move heavy operations (search indexing) to background

## Monitoring and Maintenance

### Key Metrics
- **Post Counts**: Total, published, drafts, archived
- **Engagement**: Total views, likes, comments
- **Performance**: Response times, error rates
- **Storage**: File size, growth rate

### Maintenance Tasks
- **Regular Backups**: Automate file backups
- **Data Validation**: Periodic integrity checks
- **Performance Monitoring**: Track query performance
- **Storage Optimization**: Compress old/archived posts if needed

This schema provides a solid foundation for blog post management with extensive features for content creation, SEO optimization, and analytics tracking.
