# Scalable and Secure Database Schema for SEO-Optimized Blog Content

## Overview

This document outlines a comprehensive, scalable database schema designed for high-performance blog content management with advanced SEO optimization, security features, and enterprise-grade scalability. The schema moves from the current file-based JSON storage to a relational database architecture optimized for performance, security, and SEO.

## Architecture Principles

### Scalability Features
- **Horizontal Partitioning**: Time-based partitioning for posts and analytics data
- **Read Replicas**: Separate read/write workloads
- **Caching Layer**: Redis for frequently accessed content
- **CDN Integration**: Static asset distribution
- **Database Sharding**: User-based sharding for multi-tenant scenarios

### Security Features
- **Row-Level Security (RLS)**: User-based data access control
- **Encryption**: Sensitive data encryption at rest and in transit
- **Audit Logging**: Comprehensive activity tracking
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Sanitization and validation at database level

### SEO Optimization
- **Structured Data**: JSON-LD schema support
- **Meta Optimization**: Dynamic meta tag generation
- **URL Management**: SEO-friendly URL structures
- **Performance**: Optimized queries for fast page loads
- **Analytics Integration**: SEO performance tracking

## Database Schema

### Core Tables

#### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(150),
  bio TEXT,
  avatar_url VARCHAR(500),
  website_url VARCHAR(500),
  social_links JSONB DEFAULT '{}',
  role VARCHAR(20) DEFAULT 'author' CHECK (role IN ('super_admin', 'admin', 'editor', 'author', 'contributor')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  last_login_at TIMESTAMPTZ,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ DEFAULT NOW(),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE UNIQUE INDEX idx_users_username_active ON users(username) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_email_active ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role_status ON users(role, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC) WHERE deleted_at IS NULL;
```

#### 2. posts
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(600) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  featured_image_url VARCHAR(500),
  featured_image_alt VARCHAR(255),

  -- Publication Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,

  -- Content Metadata
  reading_time INTEGER DEFAULT 1,
  word_count INTEGER DEFAULT 0,
  language VARCHAR(10) DEFAULT 'en',

  -- SEO Fields
  seo_title VARCHAR(60), -- Recommended 50-60 chars
  seo_description VARCHAR(160), -- Recommended 150-160 chars
  canonical_url VARCHAR(500),
  no_index BOOLEAN DEFAULT FALSE,
  no_follow BOOLEAN DEFAULT FALSE,
  focus_keyword VARCHAR(100),
  seo_score INTEGER DEFAULT 0,

  -- Social Media
  social_title VARCHAR(60),
  social_description VARCHAR(160),
  social_image_url VARCHAR(500),
  twitter_card_type VARCHAR(20) DEFAULT 'summary_large_image',

  -- Content Management
  series_id UUID REFERENCES post_series(id),
  series_order INTEGER,
  is_part_of_series BOOLEAN DEFAULT FALSE,

  -- Analytics (denormalized for performance)
  view_count BIGINT DEFAULT 0,
  unique_view_count BIGINT DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  -- Performance tracking
  average_load_time DECIMAL(5,2), -- in seconds
  bounce_rate DECIMAL(5,2),

  -- Moderation
  is_featured BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  review_status VARCHAR(20) DEFAULT 'approved' CHECK (review_status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,

  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  internal_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
) PARTITION BY RANGE (created_at);

-- Partitioning setup (example for yearly partitions)
CREATE TABLE posts_2024 PARTITION OF posts FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE posts_2025 PARTITION OF posts FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Indexes
CREATE UNIQUE INDEX idx_posts_slug_active ON posts(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_author_status ON posts(author_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_status_published ON posts(status, published) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_published_at ON posts(published_at DESC) WHERE deleted_at IS NULL AND published = TRUE;
CREATE INDEX idx_posts_created_at ON posts(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_seo_keyword ON posts(focus_keyword) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE deleted_at IS NULL AND published = TRUE;
CREATE INDEX idx_posts_series ON posts(series_id, series_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_search ON posts USING GIN (to_tsvector('english', title || ' ' || content || ' ' || excerpt));
```

#### 3. categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  icon VARCHAR(50), -- Icon identifier
  parent_id UUID REFERENCES categories(id),
  display_order INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  seo_title VARCHAR(60),
  seo_description VARCHAR(160),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Hierarchical constraints
  CHECK (id != parent_id) -- Prevent self-reference
);

-- Indexes
CREATE UNIQUE INDEX idx_categories_slug_active ON categories(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_parent_order ON categories(parent_id, display_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_active ON categories(is_active) WHERE deleted_at IS NULL;
```

#### 4. tags
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(60) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7),
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE UNIQUE INDEX idx_tags_name_active ON tags(name) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_tags_slug_active ON tags(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_tags_active ON tags(is_active) WHERE deleted_at IS NULL;
```

#### 5. post_categories (Many-to-Many)
```sql
CREATE TABLE post_categories (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (post_id, category_id)
);

-- Indexes
CREATE INDEX idx_post_categories_category ON post_categories(category_id);
CREATE INDEX idx_post_categories_primary ON post_categories(post_id) WHERE is_primary = TRUE;
```

#### 6. post_tags (Many-to-Many)
```sql
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (post_id, tag_id)
);

-- Indexes
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);
```

#### 7. comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for guest comments
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For threaded comments

  -- Comment content
  content TEXT NOT NULL,
  author_name VARCHAR(100), -- For guest comments
  author_email VARCHAR(255), -- For guest comments
  author_url VARCHAR(500), -- For guest comments

  -- Status and moderation
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,

  -- Analytics
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,

  -- Metadata
  ip_address INET,
  user_agent TEXT,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_comments_post_status ON comments(post_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_author ON comments(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_created_at ON comments(created_at DESC) WHERE deleted_at IS NULL;
```

#### 8. post_series
```sql
CREATE TABLE post_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) UNIQUE NOT NULL,
  description TEXT,
  featured_image_url VARCHAR(500),
  author_id UUID NOT NULL REFERENCES users(id),
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  seo_title VARCHAR(60),
  seo_description VARCHAR(160),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE UNIQUE INDEX idx_post_series_slug_active ON post_series(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_post_series_author ON post_series(author_id) WHERE deleted_at IS NULL;
```

#### 9. media_assets
```sql
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  public_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  alt_text VARCHAR(255),
  caption TEXT,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  is_public BOOLEAN DEFAULT TRUE,
  tags TEXT[], -- Array of tags for organization
  metadata JSONB DEFAULT '{}', -- EXIF, dimensions, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_media_assets_uploaded_by ON media_assets(uploaded_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_media_assets_mime_type ON media_assets(mime_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_media_assets_tags ON media_assets USING GIN (tags);
CREATE INDEX idx_media_assets_metadata ON media_assets USING GIN (metadata);
```

#### 10. structured_data
```sql
CREATE TABLE structured_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  schema_type VARCHAR(50) NOT NULL, -- Article, BlogPosting, NewsArticle, etc.
  schema_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_structured_data_post ON structured_data(post_id) WHERE is_active = TRUE;
CREATE INDEX idx_structured_data_type ON structured_data(schema_type) WHERE is_active = TRUE;
```

#### 11. seo_metadata
```sql
CREATE TABLE seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  page_type VARCHAR(20) NOT NULL, -- post, category, tag, author, series, custom
  url_path VARCHAR(500) NOT NULL,

  -- SEO Fields
  title VARCHAR(60),
  description VARCHAR(160),
  canonical_url VARCHAR(500),
  robots_meta VARCHAR(100) DEFAULT 'index,follow',
  og_title VARCHAR(60),
  og_description VARCHAR(160),
  og_image VARCHAR(500),
  twitter_title VARCHAR(60),
  twitter_description VARCHAR(160),
  twitter_image VARCHAR(500),

  -- Performance
  load_time DECIMAL(5,2),
  core_web_vitals JSONB,

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one active metadata per resource
  UNIQUE (post_id, is_active),
  UNIQUE (category_id, is_active),
  UNIQUE (tag_id, is_active)
);

-- Indexes
CREATE INDEX idx_seo_metadata_url ON seo_metadata(url_path) WHERE is_active = TRUE;
CREATE INDEX idx_seo_metadata_type ON seo_metadata(page_type) WHERE is_active = TRUE;
```

#### 12. analytics_events
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- page_view, post_read, comment, share, etc.
  event_data JSONB NOT NULL,

  -- Context
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  referrer_url VARCHAR(500),

  -- Geographic
  country_code VARCHAR(2),
  city VARCHAR(100),
  region VARCHAR(100),

  -- Device/Browser
  device_type VARCHAR(20), -- desktop, mobile, tablet
  browser_name VARCHAR(50),
  browser_version VARCHAR(20),
  os_name VARCHAR(50),
  os_version VARCHAR(20),

  -- Timing
  event_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
) PARTITION BY RANGE (event_at);

-- Partitioning (monthly partitions)
CREATE TABLE analytics_events_2024_01 PARTITION OF analytics_events FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE analytics_events_2024_02 PARTITION OF analytics_events FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Indexes (partitioned indexes for performance)
CREATE INDEX idx_analytics_events_type_date ON analytics_events(event_type, event_at DESC);
CREATE INDEX idx_analytics_events_post ON analytics_events(post_id, event_at DESC);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, event_at DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id, event_at DESC);
```

#### 13. user_sessions
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL,
  refresh_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_user_sessions_token ON user_sessions(session_token) WHERE is_active = TRUE;
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id, is_active);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at) WHERE is_active = TRUE;
```

#### 14. audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- NULL for system actions
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  timestamp TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (timestamp);

-- Partitioning (monthly)
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Indexes
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id, timestamp DESC);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
```

#### 15. rate_limits
```sql
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL, -- IP, user_id, or API key
  limit_type VARCHAR(50) NOT NULL, -- api_requests, login_attempts, comments, etc.
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  request_count INTEGER DEFAULT 0,
  limit_value INTEGER NOT NULL,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (identifier, limit_type, window_start)
);

-- Indexes
CREATE INDEX idx_rate_limits_identifier_type ON rate_limits(identifier, limit_type);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start, window_end);
```

#### 16. api_keys
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '[]', -- Array of allowed actions/endpoints
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE is_active = TRUE;
CREATE INDEX idx_api_keys_user ON api_keys(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_api_keys_expires ON api_keys(expires_at) WHERE is_active = TRUE;
```

#### 17. notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- comment, mention, like, system, etc.
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Additional context data
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url VARCHAR(500), -- URL to redirect when clicked
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type, created_at DESC);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;
```

#### 18. system_settings
```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (category, key)
);

-- Indexes
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE UNIQUE INDEX idx_system_settings_key ON system_settings(category, key);
```

## Security Implementation

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data (except admins)
CREATE POLICY users_own_data ON users
  FOR ALL USING (
    id = current_user_id() OR
    EXISTS (SELECT 1 FROM users WHERE id = current_user_id() AND role IN ('admin', 'super_admin'))
  );

-- Posts visibility based on status and user permissions
CREATE POLICY posts_visibility ON posts
  FOR SELECT USING (
    published = true OR
    author_id = current_user_id() OR
    EXISTS (SELECT 1 FROM users WHERE id = current_user_id() AND role IN ('admin', 'super_admin', 'editor'))
  );

-- Comments moderation policies
CREATE POLICY comments_moderation ON comments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = current_user_id() AND role IN ('admin', 'super_admin', 'moderator'))
  );
```

### Data Encryption

```sql
-- Sensitive fields are encrypted at rest
-- Passwords use bcrypt with salt
-- API keys use SHA-256 with salt
-- Personal data can be encrypted using PostgreSQL's pgcrypto

-- Example: Encrypt sensitive user data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encrypted fields for sensitive data
ALTER TABLE users ADD COLUMN encrypted_email TEXT;
ALTER TABLE users ADD COLUMN encrypted_pii JSONB;

-- Encryption functions
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT, key TEXT DEFAULT 'your-encryption-key')
RETURNS TEXT AS $$
BEGIN
  RETURN encode(encrypt(data::bytea, key::bytea, 'aes'), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(data TEXT, key TEXT DEFAULT 'your-encryption-key')
RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(decrypt(decode(data, 'hex'), key::bytea, 'aes'), 'utf8');
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimizations

### Indexing Strategy

```sql
-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_posts_search_filters ON posts(status, published, published_at DESC, author_id);
CREATE INDEX CONCURRENTLY idx_posts_seo_performance ON posts(seo_score DESC, published_at DESC) WHERE published = true;
CREATE INDEX CONCURRENTLY idx_comments_threaded ON comments(post_id, parent_id NULLS FIRST, created_at ASC);

-- Partial indexes for active data
CREATE INDEX CONCURRENTLY idx_active_posts ON posts(published_at DESC) WHERE deleted_at IS NULL AND published = true;
CREATE INDEX CONCURRENTLY idx_active_users ON users(created_at DESC) WHERE deleted_at IS NULL AND status = 'active';

-- GIN indexes for JSON and array fields
CREATE INDEX CONCURRENTLY idx_posts_custom_fields ON posts USING GIN (custom_fields);
CREATE INDEX CONCURRENTLY idx_users_social_links ON users USING GIN (social_links);
```

### Query Optimization

```sql
-- Materialized view for popular posts
CREATE MATERIALIZED VIEW mv_popular_posts AS
SELECT
  p.id,
  p.title,
  p.slug,
  p.excerpt,
  p.featured_image_url,
  p.published_at,
  p.view_count,
  p.like_count,
  u.display_name as author_name,
  array_agg(DISTINCT c.name) as categories,
  array_agg(DISTINCT t.name) as tags
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN post_categories pc ON p.id = pc.post_id
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.published = true AND p.deleted_at IS NULL
GROUP BY p.id, p.title, p.slug, p.excerpt, p.featured_image_url, p.published_at, p.view_count, p.like_count, u.display_name
ORDER BY p.view_count DESC, p.published_at DESC
LIMIT 100;

-- Refresh materialized view periodically
CREATE OR REPLACE FUNCTION refresh_popular_posts()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_popular_posts;
END;
$$ LANGUAGE plpgsql;

-- Create refresh schedule (requires pg_cron extension)
SELECT cron.schedule('refresh-popular-posts', '*/30 * * * *', 'SELECT refresh_popular_posts();');
```

### Caching Strategy

```sql
-- Redis cache keys pattern:
-- post:{id} - Post data with relationships
-- posts:list:{page}:{filters} - Paginated post lists
-- user:{id} - User profile data
-- categories:list - Category list with post counts
-- tags:list - Tag list with post counts
-- seo:{url} - SEO metadata for URL

-- Cache TTL strategies:
-- Post content: 1 hour
-- Post lists: 15 minutes
-- User data: 24 hours
-- Categories/Tags: 1 hour
-- SEO data: 6 hours
```

## Monitoring and Maintenance

### Health Checks

```sql
-- Database connection pool monitoring
CREATE OR REPLACE FUNCTION get_db_stats()
RETURNS TABLE (
  active_connections INTEGER,
  idle_connections INTEGER,
  total_connections INTEGER,
  max_connections INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')::INTEGER,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle')::INTEGER,
    (SELECT count(*) FROM pg_stat_activity)::INTEGER,
    (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections');
END;
$$ LANGUAGE plpgsql;

-- Table size monitoring
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  table_name TEXT,
  size_mb NUMERIC,
  rows_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname || '.' || tablename as table_name,
    pg_total_relation_size(schemaname || '.' || tablename) / 1024.0 / 1024.0 as size_mb,
    n_tup_ins - n_tup_del as rows_count
  FROM pg_stat_user_tables
  ORDER BY size_mb DESC;
END;
$$ LANGUAGE plpgsql;
```

### Automated Maintenance

```sql
-- Archive old data (requires pg_partman or similar)
CREATE OR REPLACE FUNCTION archive_old_posts(days_old INTEGER DEFAULT 365)
RETURNS void AS $$
BEGIN
  -- Move old posts to archive schema
  INSERT INTO archive.posts
  SELECT * FROM posts
  WHERE created_at < NOW() - INTERVAL '1 day' * days_old
  AND status = 'published';

  -- Update archive status
  UPDATE posts SET status = 'archived'
  WHERE created_at < NOW() - INTERVAL '1 day' * days_old;
END;
$$ LANGUAGE plpgsql;

-- Clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
  DELETE FROM rate_limits WHERE window_end < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Schedule maintenance jobs
SELECT cron.schedule('cleanup-expired-sessions', '0 */6 * * *', 'SELECT cleanup_expired_sessions();');
SELECT cron.schedule('archive-old-posts', '0 2 * * 0', 'SELECT archive_old_posts(365);');
```

## Migration Strategy

### From File-Based to Database

1. **Data Export**: Create scripts to export JSON data
2. **Schema Creation**: Deploy new database schema
3. **Data Import**: Transform and import data with validation
4. **Testing**: Comprehensive testing of all features
5. **Gradual Rollout**: Feature flags for gradual migration
6. **Rollback Plan**: Backup and rollback procedures

### Sample Migration Script

```sql
-- Migration script structure
DO $$
DECLARE
  post_record RECORD;
  user_record RECORD;
BEGIN
  -- Create default admin user
  INSERT INTO users (username, email, password_hash, role, status)
  VALUES ('admin', 'admin@example.com', '$2b$10$...', 'super_admin', 'active');

  -- Migrate posts
  FOR post_record IN SELECT * FROM jsonb_array_elements(pg_read_file('data/posts.json')::jsonb)
  LOOP
    INSERT INTO posts (
      id, title, slug, content, excerpt, author_id,
      status, published, published_at, created_at, updated_at,
      seo_title, seo_description, featured_image_url,
      view_count, like_count, comment_count
    ) VALUES (
      post_record->>'id',
      post_record->>'title',
      post_record->>'slug',
      post_record->>'content',
      post_record->>'excerpt',
      (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
      CASE WHEN post_record->>'published' = 'true' THEN 'published' ELSE 'draft' END,
      (post_record->>'published')::boolean,
      (post_record->>'publishedAt')::timestamptz,
      (post_record->>'createdAt')::timestamptz,
      (post_record->>'updatedAt')::timestamptz,
      post_record->>'seoTitle',
      post_record->>'seoDescription',
      post_record->>'featuredImage',
      (post_record->>'viewCount')::bigint,
      (post_record->>'likeCount')::integer,
      (post_record->>'commentCount')::integer
    );
  END LOOP;

  RAISE NOTICE 'Migration completed successfully';
END $$;
```

## API Design Considerations

### RESTful Endpoints

```
/api/v1/posts              # CRUD posts
/api/v1/posts/{id}         # Single post with relationships
/api/v1/posts/search       # Full-text search
/api/v1/posts/analytics    # Analytics data
/api/v1/categories         # Category management
/api/v1/tags               # Tag management
/api/v1/comments           # Comment management
/api/v1/users              # User management
/api/v1/media              # Media asset management
/api/v1/seo                # SEO metadata management
/api/v1/analytics          # Analytics events
```

### GraphQL Alternative

```graphql
type Query {
  posts(filter: PostFilter, pagination: Pagination): PostConnection!
  post(id: ID!): Post
  search(query: String!, filter: SearchFilter): SearchResult!
  analytics(dateRange: DateRange): AnalyticsData!
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  publishPost(id: ID!): Post!
  deletePost(id: ID!): Boolean!
}
```

## Deployment Architecture

### Infrastructure Components

1. **Database Cluster**: PostgreSQL with streaming replication
2. **Cache Layer**: Redis cluster for session and content caching
3. **Load Balancer**: Nginx or AWS ALB for request distribution
4. **CDN**: CloudFront or similar for static assets
5. **Monitoring**: Prometheus + Grafana for metrics
6. **Logging**: ELK stack for centralized logging
7. **Backup**: Automated backups with point-in-time recovery

### Scaling Strategies

- **Vertical Scaling**: Increase instance size for more CPU/memory
- **Horizontal Scaling**: Add read replicas for query distribution
- **Database Sharding**: Shard by user_id for multi-tenant applications
- **Caching**: Multi-layer caching (application, database, CDN)
- **CDN**: Global content distribution for media assets

This schema provides a solid foundation for a scalable, secure, and SEO-optimized blog platform that can handle millions of posts and users while maintaining excellent performance and security standards.
