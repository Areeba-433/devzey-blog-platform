# Devzey Blog Platform — Initial Setup & Database Schema Design

This document provides:
- **Initial project environment setup** (what you need installed and how to run the app)
- A **database schema design** for a scalable, secure, SEO-focused blog platform  
  (based on the detailed DDL in `SCALABLE_DATABASE_SCHEMA.md` and `DATABASE_SCHEMA.md`).

---

## 1) Initial Project Environment Setup

### 1.1 Prerequisites
- **Node.js**: v18 or later
- **npm**: bundled with Node
- (Optional for DB-backed deployment) A PostgreSQL instance and a connection URL

### 1.2 Install dependencies
From the project root:

```bash
npm install
```

This sets up:
- Next.js 14
- React 18
- TypeScript
- Jest (for tests)
- Admin dependencies (`bcryptjs`, `jsonwebtoken`, type definitions)

### 1.3 Environment variables
Create a `.env.local` file in the project root:

```env
NODE_ENV=development
JWT_SECRET=change-me-to-a-long-random-secret

# Optional for future DB-backed storage (see schema below)
DATABASE_URL=postgres://user:password@host:5432/devzey_blog
```

> In production, ensure `JWT_SECRET` is long and random and that `DATABASE_URL` points to a secure managed database instance.

### 1.4 Initialize admin system and platform settings

```bash
npm run admin:init
```

This:
- Creates default admin user and platform settings in `data/` (file-based storage).
- Initializes SEO settings (including default meta values and robots.txt content).

### 1.5 Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.
- Admin dashboard at `/admin`
- Public search at `/search`
- Post pages at `/posts/[slug]`

---

## 2) Database Schema Design Overview

The current implementation uses **file-based JSON** (`data/posts.json`, etc.).  
This section defines a **relational schema** suitable for PostgreSQL that:
- Scales to large numbers of posts and users
- Embeds **SEO fields** directly into content tables
- Supports **analytics, taxonomy, and security** concerns

For full SQL DDL, see `SCALABLE_DATABASE_SCHEMA.md`.  
Here we summarize the core tables and how they map to platform requirements.

### 2.1 Design Goals
- **Scalability**
  - Partitioning of large tables (`posts`, analytics) by time.
  - Indexes for frequent queries and search.
- **Security**
  - Strong user model with roles/status.
  - Row-level security potential for per-user data.
  - Audit-friendly fields (timestamps, moderation).
- **SEO & content**
  - First-class SEO columns in `posts`.
  - Support for categories, tags, series, and related posts.
  - Room for structured data (JSON-LD).

### 2.2 Core Tables (Conceptual)

#### 2.2.1 `users`
Stores admin and author accounts.

- Identity & profile:
  - `id` (UUID, PK)
  - `username`, `email` (unique)
  - `first_name`, `last_name`, `display_name`
  - `bio`, `avatar_url`, `website_url`
  - `social_links` (JSONB)
- Security:
  - `password_hash`
  - `role` (`super_admin`, `admin`, `editor`, `author`, `contributor`)
  - `status` (`active`, `inactive`, `suspended`, `pending`)
  - `last_login_at`, `login_attempts`, `locked_until`
  - `password_changed_at`, 2FA fields
- Metadata:
  - `created_at`, `updated_at`, `deleted_at`

This supports:
- Admin RBAC from `ADMIN_API_DOCUMENTATION.md`
- Security features described in admin docs (lockouts, audits).

#### 2.2.2 `posts`
Represents blog content with SEO and analytics fields.  
Partitioned by `created_at` for scalability.

- Core content:
  - `id` (UUID, PK)
  - `author_id` → `users.id`
  - `title`, `slug` (unique)
  - `content`, `excerpt`
  - Featured image URL + alt text
- Publication:
  - `status` (`draft`, `published`, `scheduled`, `archived`)
  - `published` (boolean)
  - `published_at`, `scheduled_publish_at`
- SEO:
  - `seo_title` (short title for SERPs)
  - `seo_description` (meta description)
  - `canonical_url`
  - `no_index`, `no_follow`
  - `focus_keyword`
  - `seo_score` (for internal SEO analysis)
- Social:
  - `social_title`, `social_description`, `social_image_url`
  - `twitter_card_type` (e.g., `summary_large_image`)
- Content management:
  - `series_id` (optional), `series_order`
  - Flags like `is_featured`, `is_pinned`
  - `review_status` + reviewer references
- Analytics (denormalized):
  - `view_count`, `unique_view_count`
  - `like_count`, `comment_count`, `share_count`
  - `last_viewed_at`
  - performance metrics (avg load time, bounce rate) if needed
- Misc:
  - `language`
  - `custom_fields` (JSONB)
  - `internal_notes`
  - `created_at`, `updated_at`, `deleted_at`

Indexes:
- On `slug`, `author_id`, `status/published`, `published_at`, `created_at`.
- Full-text search index: `GIN (to_tsvector('english', title || ' ' || content || ' ' || excerpt))`.

These fields line up with:
- `Post` interface in `DATABASE_SCHEMA.md`
- SEO requirements in `SEO_GUIDE.md` and `SEO_IMPLEMENTATION_DELIVERABLE.md`
- Search requirements (`SEARCH_REQUIREMENTS.md`, `SEARCH_FEATURE_DOCUMENTATION.md`).

#### 2.2.3 `categories`
Hierarchical content categories with SEO support.

- `id` (UUID, PK)
- `name`, `slug` (unique)
- `description`
- Visual metadata: `color`, `icon`
- Hierarchy: `parent_id` (self-reference)
- SEO: `seo_title`, `seo_description`
- Usage stats: `post_count`
- Status + timestamps

#### 2.2.4 `tags`
Flat tagging system.

- `id` (UUID, PK)
- `name`, `slug` (unique)
- `description`, `color`
- `post_count`, `is_active`
- Timestamps

#### 2.2.5 `post_categories` (many-to-many)
Relates posts to categories (supports primary + secondary).

- `post_id` → `posts.id`
- `category_id` → `categories.id`
- `is_primary` (boolean)
- `created_at`
- Composite PK on (`post_id`, `category_id`).

#### 2.2.6 `post_tags` (many-to-many)
Relates posts to tags.

- `post_id` → `posts.id`
- `tag_id` → `tags.id`
- `created_at`
- Composite PK on (`post_id`, `tag_id`).

#### 2.2.7 `comments` (optional / future)
If you add comments:

- Links to `posts` and optionally `users`.
- Moderation fields (`status`, `moderated_by`, `moderated_at`).
- Analytics fields (`like_count`, `dislike_count`).

#### 2.2.8 Settings / platform configuration
Maps current JSON settings to DB tables (if you later migrate):

- `platform_settings` (single-row or key-value)
  - site name/description/url
  - SEO defaults (meta title/description, robots.txt, GA ID)
  - security settings (login attempts, session timeout)
  - email settings
  - maintenance mode flags and allowed IPs

These support:
- SEO defaults for all pages.
- Admin-configurable robots.txt and GA ID.

---

## 3) SEO & Search Considerations in the Schema

### 3.1 SEO fields in `posts`
- `seo_title`, `seo_description`, `canonical_url`, `no_index`, `no_follow`
- `social_title`, `social_description`, `social_image_url`
- Allow server-side rendering of:
  - `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">`
  - Open Graph + Twitter tags
  - Optional JSON-LD (from an additional `structured_data` JSONB field if desired)

### 3.2 Taxonomy and URL structure
- `categories` and `tags` tables allow:
  - SEO-friendly category/tag archives (e.g., `/category/web-development`, `/tag/react`)
  - Per-category/tag SEO meta (titles/descriptions).

### 3.3 Search and performance
- Full-text index on `posts`:
  - used to implement `/api/posts/search`
  - supports relevance-based ranking with filters (category, tag, author, status)
- Denormalized counters (`view_count`, `like_count`, etc.) support:
  - sorting by popularity
  - quick dashboard analytics in admin.

---

## 4) Migration Path from File Storage to Database

1. **Introduce DB behind existing APIs** (no breaking changes to frontend):
   - Implement DB-backed versions of:
     - post CRUD
     - search
     - analytics counters
   - Keep JSON-based implementation as a fallback during transition.

2. **Data migration script**:
   - Read from `data/posts.json`.
   - Transform into SQL INSERTs for `posts`, `categories`, `tags`, junction tables.
   - For admin/users/settings, migrate from `data/*.json` into `users` and `platform_settings`.

3. **Cut over**:
   - Switch `lib/posts.ts` to use DB queries instead of file I/O.
   - Keep the schema in sync with DDL in `SCALABLE_DATABASE_SCHEMA.md`.

4. **Decommission JSON files** once confidence is high and backups are in place.

---

## 5) Summary

- The **initial environment** is fully defined: Node/Next/TypeScript/JWT setup and basic scripts.
- The **database schema design** provides:
  - scalable, indexed storage for posts, users, taxonomy, and analytics
  - built-in fields for SEO and social metadata
  - a clear path from the current JSON storage to a production-grade PostgreSQL schema.


