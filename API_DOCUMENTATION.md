# Blog Post Management API Documentation

This comprehensive API provides full CRUD operations for managing blog posts with advanced features including SEO optimization, analytics, scheduling, and content organization.

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Posts](#posts)
  - [Search](#search)
  - [Analytics](#analytics)
  - [Bulk Operations](#bulk-operations)
  - [Categories](#categories)
  - [Tags](#tags)
  - [Authors](#authors)
  - [Series](#series)
  - [Scheduled Posts](#scheduled-posts)
- [Data Models](#data-models)

## Authentication

Currently, this API does not implement authentication. All endpoints are publicly accessible. For production use, consider adding authentication middleware.

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
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

### Error Types

- `Validation Error` - Input validation failed
- `Not Found` - Resource doesn't exist
- `Bad Request` - Invalid request parameters
- `Method Not Allowed` - HTTP method not supported
- `Internal Server Error` - Server-side error

## Endpoints

### Posts

#### Create a Post

```http
POST /api/posts
Content-Type: application/json

{
  "title": "My Blog Post Title",
  "content": "Full markdown/HTML content...",
  "excerpt": "Brief summary of the post",
  "author": "John Doe",
  "published": false,
  "status": "draft",
  "tags": ["javascript", "tutorial"],
  "category": "Programming",
  "featuredImage": "https://example.com/image.jpg",
  "seoTitle": "Custom SEO Title",
  "seoDescription": "Custom SEO description",
  "canonicalUrl": "https://example.com/custom-url",
  "noIndex": false,
  "series": "JavaScript Series",
  "seriesOrder": 1,
  "relatedPosts": ["post-id-1", "post-id-2"],
  "socialTitle": "Social Media Title",
  "socialDescription": "Social media description",
  "socialImage": "https://example.com/social-image.jpg",
  "customFields": { "key": "value" }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "title": "My Blog Post Title",
    "slug": "my-blog-post-title",
    "content": "Full markdown/HTML content...",
    "excerpt": "Brief summary of the post",
    "author": "John Doe",
    "published": false,
    "publishedAt": null,
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z",
    "status": "draft",
    "tags": ["javascript", "tutorial"],
    "category": "Programming",
    "featuredImage": "https://example.com/image.jpg",
    "seoTitle": "Custom SEO Title",
    "seoDescription": "Custom SEO description",
    "readingTime": 5,
    "wordCount": 250,
    "canonicalUrl": "https://example.com/custom-url",
    "noIndex": false,
    "structuredData": null,
    "series": "JavaScript Series",
    "seriesOrder": 1,
    "relatedPosts": ["post-id-1", "post-id-2"],
    "socialTitle": "Social Media Title",
    "socialDescription": "Social media description",
    "socialImage": "https://example.com/social-image.jpg",
    "viewCount": 0,
    "likeCount": 0,
    "commentCount": 0,
    "customFields": { "key": "value" }
  }
}
```

#### Get Posts (with filtering and pagination)

```http
GET /api/posts?published=true&limit=10&offset=0&sortBy=createdAt&sortOrder=desc&category=Tech&tag=javascript&author=John%20Doe&status=published&series=Tutorial&minViews=100&dateFrom=2024-01-01&dateTo=2024-12-31
```

**Query Parameters:**

- `published` (boolean) - Filter by publication status
- `author` (string) - Filter by author name
- `category` (string) - Filter by category
- `tag` (string) - Filter by tag
- `status` (string) - Filter by status: 'draft', 'published', 'archived'
- `series` (string) - Filter by series name
- `dateFrom` (string) - Filter posts from date (ISO format)
- `dateTo` (string) - Filter posts to date (ISO format)
- `minViews` (number) - Filter by minimum view count
- `excludeIds` (string) - Comma-separated list of post IDs to exclude
- `limit` (number) - Number of posts to return (default: all)
- `offset` (number) - Number of posts to skip (default: 0)
- `sortBy` (string) - Sort field: 'createdAt', 'updatedAt', 'publishedAt', 'viewCount', 'likeCount'
- `sortOrder` (string) - Sort order: 'asc', 'desc'

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "abc123def456",
        "title": "My Blog Post Title",
        "slug": "my-blog-post-title",
        "excerpt": "Brief summary of the post",
        "author": "John Doe",
        "published": true,
        "publishedAt": "2024-01-20T10:00:00.000Z",
        "createdAt": "2024-01-20T10:00:00.000Z",
        "updatedAt": "2024-01-20T10:00:00.000Z",
        "status": "published",
        "tags": ["javascript", "tutorial"],
        "category": "Programming",
        "readingTime": 5,
        "viewCount": 150,
        "likeCount": 25,
        "commentCount": 10
      }
    ],
    "total": 1
  }
}
```

#### Get Single Post by ID

```http
GET /api/posts/{id}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "title": "My Blog Post Title",
    "slug": "my-blog-post-title",
    "content": "Full markdown/HTML content...",
    "excerpt": "Brief summary of the post",
    "author": "John Doe",
    "published": true,
    "publishedAt": "2024-01-20T10:00:00.000Z",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z",
    "status": "published",
    "tags": ["javascript", "tutorial"],
    "category": "Programming",
    "featuredImage": "https://example.com/image.jpg",
    "seoTitle": "Custom SEO Title",
    "seoDescription": "Custom SEO description",
    "readingTime": 5,
    "wordCount": 250,
    "canonicalUrl": "https://example.com/custom-url",
    "noIndex": false,
    "structuredData": null,
    "series": "JavaScript Series",
    "seriesOrder": 1,
    "relatedPosts": ["post-id-1", "post-id-2"],
    "socialTitle": "Social Media Title",
    "socialDescription": "Social media description",
    "socialImage": "https://example.com/social-image.jpg",
    "viewCount": 150,
    "likeCount": 25,
    "commentCount": 10,
    "customFields": { "key": "value" }
  }
}
```

#### Update a Post

```http
PUT /api/posts/{id}
Content-Type: application/json

{
  "title": "Updated Blog Post Title",
  "content": "Updated content...",
  "excerpt": "Updated excerpt",
  "published": true,
  "status": "published",
  "tags": ["javascript", "tutorial", "updated"],
  "category": "Web Development"
}
```

**Response (200):** Same as GET single post response

#### Delete a Post

```http
DELETE /api/posts/{id}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Post deleted successfully"
  }
}
```

#### Get Post by Slug (SEO-friendly)

```http
GET /api/posts/slug/{slug}
```

**Note:** Only returns published posts for SEO purposes.

**Response (200):** Same as GET single post response

#### Get Related Posts

```http
GET /api/posts/{id}/related?limit=5
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "relatedPosts": [
      {
        "id": "related-post-1",
        "title": "Related Post Title",
        "slug": "related-post-title",
        "excerpt": "Related post excerpt",
        "author": "Jane Smith",
        "published": true,
        "publishedAt": "2024-01-19T10:00:00.000Z",
        "tags": ["javascript", "react"],
        "category": "Programming",
        "readingTime": 3
      }
    ],
    "limit": 5
  }
}
```

#### Track Post Engagement

```http
POST /api/posts/{id}/track
Content-Type: application/json

{
  "action": "view"
}
```

Supported actions: `view`, `like`, `comment`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "View count incremented",
    "newCount": 151
  }
}
```

### Search

#### Full-text Search

```http
GET /api/posts/search?q=javascript&published=true&limit=10&category=Programming
```

**Query Parameters:**
- `q` (string, required) - Search query
- All other parameters from GET /api/posts

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "query": "javascript",
    "total": 5
  }
}
```

### Analytics

#### Get Post Statistics

```http
GET /api/posts/stats
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "published": 120,
    "drafts": 25,
    "archived": 5,
    "totalViews": 25000,
    "totalLikes": 1250,
    "totalComments": 450,
    "averageReadingTime": 4
  }
}
```

### Bulk Operations

#### Bulk Delete Posts

```http
DELETE /api/posts/bulk
Content-Type: application/json

{
  "ids": ["post-id-1", "post-id-2", "post-id-3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deleted": 3,
    "failed": []
  }
}
```

#### Bulk Update Posts

```http
PUT /api/posts/bulk
Content-Type: application/json

{
  "ids": ["post-id-1", "post-id-2"],
  "updates": {
    "category": "Updated Category",
    "published": true,
    "status": "published",
    "tags": ["updated", "bulk"]
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "updated": 2,
    "failed": []
  }
}
```

#### Bulk Publish/Unpublish Posts

```http
PATCH /api/posts/bulk
Content-Type: application/json

{
  "ids": ["post-id-1", "post-id-2"],
  "published": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "updated": 2,
    "failed": []
  }
}
```

### Categories

#### Get Posts by Category

```http
GET /api/posts/categories/{category}?published=true&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "category": "Technology",
    "total": 25
  }
}
```

#### Get All Categories

```http
GET /api/posts/categories
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "name": "Technology",
        "count": 45,
        "slug": "technology"
      },
      {
        "name": "Programming",
        "count": 32,
        "slug": "programming"
      }
    ],
    "total": 2
  }
}
```

### Tags

#### Get Posts by Tag

```http
GET /api/posts/tags/{tag}?published=true&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "tag": "javascript",
    "total": 15
  }
}
```

#### Get All Tags

```http
GET /api/posts/tags
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "name": "javascript",
        "count": 25,
        "slug": "javascript"
      },
      {
        "name": "react",
        "count": 18,
        "slug": "react"
      }
    ],
    "total": 2
  }
}
```

### Authors

#### Get Posts by Author

```http
GET /api/posts/authors/{author}?published=true&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "author": "John Doe",
    "total": 12
  }
}
```

#### Get All Authors

```http
GET /api/posts/authors
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "authors": [
      {
        "name": "John Doe",
        "count": 45,
        "slug": "john-doe",
        "latestPost": "2024-01-20T10:00:00.000Z"
      },
      {
        "name": "Jane Smith",
        "count": 32,
        "slug": "jane-smith",
        "latestPost": "2024-01-19T15:30:00.000Z"
      }
    ],
    "total": 2
  }
}
```

### Series

#### Get Posts by Series

```http
GET /api/posts/series/{series}?published=true&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "series": "JavaScript Fundamentals",
    "total": 8
  }
}
```

#### Get All Series

```http
GET /api/posts/series
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "series": [
      {
        "name": "JavaScript Fundamentals",
        "count": 8,
        "slug": "javascript-fundamentals",
        "latestPost": "2024-01-20T10:00:00.000Z"
      },
      {
        "name": "React Tutorial",
        "count": 5,
        "slug": "react-tutorial",
        "latestPost": "2024-01-18T09:15:00.000Z"
      }
    ],
    "total": 2
  }
}
```

### Scheduled Posts

#### Get Upcoming Scheduled Posts

```http
GET /api/posts/scheduled?hours=24
```

**Query Parameters:**
- `hours` (number) - Hours ahead to look (default: 24, max: 168)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "scheduledPosts": [
      {
        "id": "post-id-1",
        "title": "Future Post",
        "scheduledPublishAt": "2024-01-21T10:00:00.000Z",
        "author": "John Doe"
      }
    ],
    "total": 1,
    "hoursAhead": 24
  }
}
```

#### Publish Scheduled Posts

```http
POST /api/posts/scheduled
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully published 3 scheduled posts",
    "published": 3,
    "failed": []
  }
}
```

## Data Models

### Post Object

```typescript
interface Post {
  // Core Content Fields
  id: string;                    // Unique identifier
  title: string;                 // Post title
  slug: string;                  // URL-friendly slug
  content: string;               // Full post content
  excerpt: string;               // Short summary
  author: string;                // Author name

  // Publication Status
  published: boolean;            // Whether post is public
  publishedAt: Date | null;      // Publication timestamp
  status: 'draft' | 'published' | 'archived'; // Current status
  scheduledPublishAt: Date | null; // Future publication date

  // Metadata
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last modification timestamp

  // Organization
  tags: string[];                // Array of tag strings
  category: string;              // Primary category

  // Media
  featuredImage?: string;        // URL to featured image

  // SEO Fields
  seoTitle?: string;             // Custom SEO title
  seoDescription?: string;       // Custom SEO description
  canonicalUrl?: string;         // Canonical URL
  noIndex?: boolean;             // No-index flag
  structuredData?: object;       // JSON-LD data

  // Content Management
  series?: string;               // Series name
  seriesOrder?: number;          // Order within series
  relatedPosts?: string[];       // Related post IDs

  // Social Media
  socialTitle?: string;          // Social sharing title
  socialDescription?: string;    // Social sharing description
  socialImage?: string;          // Social sharing image

  // Analytics & Tracking
  viewCount: number;             // Number of views
  likeCount: number;             // Number of likes
  commentCount: number;          // Number of comments
  lastViewedAt?: Date;           // Last view timestamp

  // Content Metrics
  readingTime: number;           // Estimated reading time
  wordCount: number;             // Total word count

  // Extensibility
  customFields?: Record<string, any>; // Custom metadata
}
```

### Create Post Request

```typescript
interface CreatePostRequest {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  published?: boolean;
  tags?: string[];
  category?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: 'draft' | 'published' | 'archived';
  scheduledPublishAt?: Date | null;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: object;
  series?: string;
  seriesOrder?: number;
  relatedPosts?: string[];
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: string;
  customFields?: Record<string, any>;
}
```

### Update Post Request

```typescript
interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  published?: boolean;
  tags?: string[];
  category?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: 'draft' | 'published' | 'archived';
  scheduledPublishAt?: Date | null;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: object;
  series?: string;
  seriesOrder?: number;
  relatedPosts?: string[];
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: string;
  customFields?: Record<string, any>;
}
```

### Post Filters

```typescript
interface PostFilters {
  published?: boolean;
  author?: string;
  category?: string;
  tag?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount' | 'likeCount';
  sortOrder?: 'asc' | 'desc';
  status?: 'draft' | 'published' | 'archived';
  series?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minViews?: number;
  search?: string;
  excludeIds?: string[];
}
```

## Usage Examples

### JavaScript (fetch)

```javascript
// Create a post
const createPost = async (postData) => {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  return response.json();
};

// Get posts with filters
const getPosts = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`/api/posts?${queryParams}`);
  return response.json();
};

// Update a post
const updatePost = async (id, updates) => {
  const response = await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return response.json();
};
```

### cURL Examples

```bash
# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content...",
    "excerpt": "Brief summary",
    "author": "John Doe"
  }'

# Get published posts
curl "http://localhost:3000/api/posts?published=true&limit=10"

# Update a post
curl -X PUT http://localhost:3000/api/posts/post-id-123 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "published": true}'

# Delete a post
curl -X DELETE http://localhost:3000/api/posts/post-id-123

# Search posts
curl "http://localhost:3000/api/posts/search?q=javascript&published=true"
```

This API provides a comprehensive solution for blog post management with advanced features for SEO, analytics, and content organization. The file-based storage makes it easy to deploy and manage, while the extensive validation and error handling ensure data integrity.

