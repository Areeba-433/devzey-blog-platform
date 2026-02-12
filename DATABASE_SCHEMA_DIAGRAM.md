# Database Schema Diagram - SEO-Optimized Blog Platform

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            BLOG PLATFORM ERD                                   │
│                          (Scalable & Secure)                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │     posts       │       │   categories    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┼─ author_id (FK) │       │ id (PK)         │
│ username        │       │ id (PK)         │       │ name            │
│ email           │       │ title           │       │ slug            │
│ password_hash   │       │ slug            │       │ description     │
│ first_name      │       │ content         │       │ parent_id (FK)  │
│ last_name       │       │ excerpt         │       │ color           │
│ display_name    │       │ status          │       │ icon            │
│ bio             │       │ published       │       │ post_count      │
│ avatar_url      │       │ published_at    │       │ is_active       │
│ website_url     │       │ seo_title       │       │ seo_title       │
│ social_links    │       │ seo_description │       │ seo_description │
│ role            │       │ canonical_url   │       │ created_at      │
│ status          │       │ no_index        │       │ updated_at      │
│ last_login_at   │       │ featured_image  │       │ deleted_at      │
│ created_at      │       │ view_count      │       └─────────────────┘
│ updated_at      │       │ like_count      │               ▲
│ deleted_at      │       │ comment_count   │               │
└─────────────────┘       │ reading_time    │               │
        ▲                 │ word_count      │               │
        │                 │ custom_fields   │               │
        │                 │ created_at      │               │
        │                 │ updated_at      │               │
        │                 │ deleted_at      │               │
        └─────────────────┼─────────────────┼───────────────┼─────────────┐
                          │                 │               │             │
                          ▼                 ▼               │             │
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │             │
│  user_sessions  │ │   comments      │ │  post_tags      │ │             │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤ │             │
│ id (PK)         │ │ id (PK)         │ │ post_id (FK)    │ │             │
│ user_id (FK)    │ │ post_id (FK)    │ │ tag_id (FK)     │ │             │
│ session_token   │ │ author_id (FK)  │ │ created_at      │ │             │
│ refresh_token   │ │ parent_id (FK)  │ └─────────────────┘ │             │
│ expires_at      │ │ content         │           ▲         │             │
│ created_at      │ │ status          │           │         │             │
│ last_activity_at│ │ like_count      │           │         │             │
└─────────────────┘ │ created_at      │           │         │             │
                    │ updated_at      │           │         │             │
                    │ deleted_at      │           │         │             │
                    └─────────────────┘           │         │             │
                                        ┌─────────────────┐ │             │
                                        │      tags       │ │             │
                                        ├─────────────────┤ │             │
                                        │ id (PK)         │ │             │
                                        │ name            │ │             │
                                        │ slug            │ │             │
                                        │ description     │ │             │
                                        │ color           │ │             │
                                        │ post_count      │ │             │
                                        │ is_active       │ │             │
                                        │ created_at      │ │             │
                                        │ updated_at      │ │             │
                                        │ deleted_at      │ │             │
                                        └─────────────────┘ │             │
                                                  ▲         │             │
                                                  │         │             │
                                                  │         │             │
┌─────────────────┐ ┌─────────────────┐ │         │             │
│   audit_logs    │ │   rate_limits   │ │         │             │
├─────────────────┤ ├─────────────────┤ │         │             │
│ id (PK)         │ │ id (PK)         │ │         │             │
│ user_id (FK)    │ │ identifier      │ │         │             │
│ action          │ │ limit_type      │ │         │             │
│ resource_type   │ │ request_count   │ │         │             │
│ resource_id     │ │ limit_value     │ │         │             │
│ old_values      │ │ blocked_until   │ │         │             │
│ new_values      │ │ created_at      │ │         │             │
│ timestamp       │ └─────────────────┘ │         │             │
└─────────────────┘           ▲         │         │             │
                              │         │         │             │
                              │         │         │             │
                    ┌─────────────────┐ │         │             │
                    │   api_keys       │ │         │             │
                    ├─────────────────┤ │         │             │
                    │ id (PK)         │ │         │             │
                    │ name            │ │         │             │
                    │ key_hash        │ │         │             │
                    │ user_id (FK)    │ │         │             │
                    │ permissions     │ │         │             │
                    │ rate_limit      │ │         │             │
                    │ expires_at      │ │         │             │
                    │ last_used_at    │ │         │             │
                    │ is_active       │ │         │             │
                    │ created_at      │ │         │             │
                    │ updated_at      │ │         │             │
                    └─────────────────┘ │         │             │
                              ▲         │         │             │
                              │         │         │             │
                              │         │         │             │
                    ┌─────────────────┐ │         │             │
                    │  notifications  │ │         │             │
                    ├─────────────────┤ │         │             │
                    │ id (PK)         │ │         │             │
                    │ user_id (FK)    │ │         │             │
                    │ type            │ │         │             │
                    │ title           │ │         │             │
                    │ message         │ │         │             │
                    │ data            │ │         │             │
                    │ is_read         │ │         │             │
                    │ read_at         │ │         │             │
                    │ action_url      │ │         │             │
                    │ created_at      │ │         │             │
                    └─────────────────┘ │         │             │
                                        │         │             │
                                        └─────────┼─────────────┼─────────────┘
                                                  │             │
                                                  ▼             ▼

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ post_categories │ │   post_series   │ │  media_assets   │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ post_id (FK)    │ │ id (PK)         │ │ id (PK)         │
│ category_id (FK)│ │ title           │ │ filename        │
│ is_primary      │ │ slug            │ │ mime_type       │
│ created_at      │ │ description     │ │ file_size       │
└─────────────────┘ │ author_id (FK)  │ │ file_path       │
          ▲         │ post_count      │ │ public_url      │
          │         │ is_active       │ │ thumbnail_url   │
          │         │ seo_title       │ │ alt_text        │
          │         │ seo_description │ │ uploaded_by (FK)│
          │         │ created_at      │ │ tags            │
          │         │ updated_at      │ │ metadata        │
          │         │ deleted_at      │ │ created_at      │
          │         └─────────────────┘ │ updated_at      │
          │                   ▲         │ deleted_at      │
          │                   │         └─────────────────┘
          │                   │
          │         ┌─────────────────┐
          │         │structured_data  │
          │         ├─────────────────┤
          │         │ id (PK)         │
          │         │ post_id (FK)    │
          │         │ schema_type     │
          │         │ schema_data     │
          │         │ is_active       │
          │         │ created_at      │
          │         │ updated_at      │
          │         └─────────────────┘
          │
          │
┌─────────────────┐
│  seo_metadata   │
├─────────────────┤
│ id (PK)         │
│ post_id (FK)    │
│ category_id (FK)│
│ tag_id (FK)     │
│ page_type       │
│ url_path        │
│ title           │
│ description     │
│ canonical_url   │
│ robots_meta     │
│ og_title        │
│ og_description  │
│ og_image        │
│ twitter_title   │
│ twitter_desc    │
│ twitter_image   │
│ load_time       │
│ core_web_vitals │
│ is_active       │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│analytics_events │       │system_settings │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ event_type      │       │ category        │
│ event_data      │       │ key             │
│ post_id (FK)    │       │ value           │
│ user_id (FK)    │       │ description     │
│ session_id      │       │ is_public       │
│ ip_address      │       │ updated_by (FK) │
│ user_agent      │       │ created_at      │
│ referrer_url    │       │ updated_at      │
│ country_code    │       └─────────────────┘
│ city            │
│ region          │
│ device_type     │
│ browser_name    │
│ browser_version │
│ os_name         │
│ os_version      │
│ event_at        │
│ processed_at    │
└─────────────────┘
```

## Relationship Legend

### Cardinality Symbols
- **│** : One-to-One relationship
- **┼** : One-to-Many relationship (crow's foot)
- **◄──────** : Foreign Key relationship (many-to-one)
- **▲** : Self-referencing relationship (hierarchical)
- **▼** : Downward relationship flow

### Key Types
- **(PK)** : Primary Key
- **(FK)** : Foreign Key
- **(UQ)** : Unique Constraint

## Detailed Relationships

### Core Content Relationships

1. **users → posts** (1:N)
   - One user can author many posts
   - Cascade delete: deleting user removes their posts

2. **posts → comments** (1:N)
   - One post can have many comments
   - Comments can be threaded (parent_id self-reference)

3. **posts ↔ categories** (N:M via post_categories)
   - Many-to-many relationship with primary category flag
   - Categories can be hierarchical (parent_id self-reference)

4. **posts ↔ tags** (N:M via post_tags)
   - Many-to-many relationship for flexible tagging

5. **posts → post_series** (N:1)
   - Posts can belong to a series with ordering

### User Management Relationships

6. **users → user_sessions** (1:N)
   - Users can have multiple active sessions
   - Sessions expire and are cleaned up automatically

7. **users → api_keys** (1:N)
   - Users can have multiple API keys with different permissions

8. **users → notifications** (1:N)
   - Users receive various types of notifications

### Security & Audit Relationships

9. **users → audit_logs** (1:N)
   - All user actions are logged for compliance

10. **rate_limits** (Independent)
    - Rate limiting by IP, user, or API key
    - Time-window based tracking

### SEO & Analytics Relationships

11. **posts → structured_data** (1:N)
    - Multiple structured data schemas per post
    - Supports different schema.org types

12. **posts → seo_metadata** (1:1)
    - One active SEO metadata record per post
    - Includes Open Graph and Twitter Card data

13. **analytics_events** (Independent with FKs)
    - Links to posts and users for context
    - Partitioned by date for performance

### Media & Content Relationships

14. **users → media_assets** (1:N)
    - Users upload and manage media files

15. **media_assets** (Independent)
    - Media files with metadata and tags
    - Supports various file types and thumbnails

### System Configuration

16. **users → system_settings** (1:N)
    - Admins can modify system settings
    - Categorized configuration values

## Partitioning Strategy

### Time-Based Partitioning
```
posts (by created_at)
├── posts_2024 (Jan-Dec 2024)
├── posts_2025 (Jan-Dec 2025)
└── posts_future (2026+)

analytics_events (by event_at)
├── analytics_2024_01 (January 2024)
├── analytics_2024_02 (February 2024)
└── analytics_future (future months)

audit_logs (by timestamp)
├── audit_2024_01 (January 2024)
├── audit_2024_02 (February 2024)
└── audit_future (future months)
```

### Indexing Strategy Overview

#### Primary Indexes
- All primary keys are indexed automatically
- Foreign keys have automatic indexes
- Unique constraints have unique indexes

#### Performance Indexes
- **Composite Indexes**: For common query patterns
  - `posts(status, published, published_at DESC)`
  - `comments(post_id, parent_id, created_at ASC)`

- **Partial Indexes**: For active data only
  - `posts(published_at DESC) WHERE published = true`
  - `users(created_at DESC) WHERE status = 'active'`

- **GIN Indexes**: For JSON and array fields
  - `posts USING GIN (custom_fields)`
  - `media_assets USING GIN (tags)`

- **Full-Text Search**: PostgreSQL tsvector
  - `posts USING GIN (to_tsvector('english', title || ' ' || content))`

## Security Layers

### Data Access Control
```
┌─────────────────────────────────┐
│   Application Layer             │
│   ├── Authentication            │
│   ├── Authorization (RBAC)      │
│   └── API Key Validation        │
├─────────────────────────────────┤
│   Database Layer                │
│   ├── Row Level Security (RLS)  │
│   ├── Encrypted Fields          │
│   └── Audit Triggers            │
├─────────────────────────────────┤
│   Infrastructure Layer          │
│   ├── Network Security          │
│   ├── Encryption at Rest        │
│   └── Backup Security           │
└─────────────────────────────────┘
```

### Encryption Strategy
- **Passwords**: bcrypt with salt
- **API Keys**: SHA-256 with salt
- **Sensitive Data**: AES-256 encryption
- **TLS**: End-to-end encryption for all connections

## Scalability Features

### Read/Write Separation
```
Write Operations → Primary Database
                   ├── User authentication
                   ├── Content creation
                   └── Data modifications

Read Operations  → Read Replicas
                   ├── Content display
                   ├── Search queries
                   └── Analytics reports
```

### Caching Hierarchy
```
┌─────────────────┐
│   CDN           │ ← Static assets, images
├─────────────────┤
│   Redis Cache   │ ← Sessions, user data, popular content
├─────────────────┤
│   Application   │ ← Computed data, API responses
├─────────────────┤
│   Database      │ ← Query result caching
└─────────────────┘
```

This diagram provides a comprehensive visual representation of the database schema, showing all entities, relationships, and key design patterns for scalability, security, and SEO optimization.
