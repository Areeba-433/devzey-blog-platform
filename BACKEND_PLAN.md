# Devzey Blog Platform — Backend Plan (Step-by-Step)

This document turns the high-level “backend build” steps into an executable plan for **authentication**, **post management**, and **admin controls**, aligned with the existing repo documentation (`ADMIN_API_DOCUMENTATION.md`, `API_DOCUMENTATION.md`, `DATABASE_SCHEMA*.md`, `SEO_GUIDE.md`, `SEARCH_REQUIREMENTS.md`).

## 1) Requirement Analysis (Backend)

### 1.1 Backend capabilities (must-have)
- **Authentication (Admin)**: JWT login/logout, bcrypt password hashing, session expiration/cleanup, rate limiting, audit logging.
- **Authorization**: role-based access control (RBAC) with permissions on resources (users/posts/settings/analytics/etc.).
- **Post management**: CRUD, scheduling, filtering/sorting, taxonomy (tags/categories/series/authors), analytics counters.
- **Platform settings**: global settings + SEO defaults (meta defaults, GA ID, robots.txt).
- **Search**: query + filters + relevance scoring + SSR-friendly response metadata.
- **Consistent API contracts**: common response format, standard error types/status codes.

### 1.2 Key constraints / assumptions
- **Baseline storage**: file-based JSON (per `DATABASE_SCHEMA.md`) is acceptable for MVP/dev.
- **Scalability roadmap**: optional migration to a relational DB schema (per `SCALABLE_DATABASE_SCHEMA.md`).
- **SEO requirements**: backend must support SSR meta rendering rules and data shapes (per `SEO_GUIDE.md`).

### 1.3 Success criteria (backend)
- Public APIs return correct data for SSR pages and search.
- Admin APIs are protected (JWT + RBAC) and enforce permissions server-side.
- Validation/sanitization prevents common injection/XSS vectors.
- Tests cover critical auth flows, RBAC, and post CRUD/search.

## 2) Backend Architecture & Design

### 2.1 High-level structure (recommended)
- **API layer**: Next.js API routes under `pages/api/**`
- **Domain/data layer**: `lib/**` (posts/search/analytics logic)
- **Security & admin utilities**: `utils/**` (auth, middleware, validation, settings)
- **Types/contracts**: `types/**`
- **Data persistence**: `data/*.json` (MVP), later DB

### 2.2 Data model (MVP)
- **Posts**: `data/posts.json` per `DATABASE_SCHEMA.md` (SEO fields + analytics counters included).
- **Admin**:
  - `data/admin-users.json`
  - `data/admin-sessions.json`
  - `data/platform-settings.json` (includes `seoSettings`, security settings, etc.)

### 2.3 API surface (target)

#### Public Post API (examples; see `API_DOCUMENTATION.md`)
- `GET /api/posts` (filter/paginate/sort)
- `POST /api/posts`
- `GET /api/posts/[id]`
- `PUT /api/posts/[id]`
- `DELETE /api/posts/[id]`
- `GET /api/posts/slug/[slug]`
- `GET /api/posts/search?q=...`
- `GET /api/posts/categories`, `GET /api/posts/tags`, `GET /api/posts/authors`, `GET /api/posts/series`
- Analytics:
  - `POST /api/posts/[id]/track` (view tracking)
  - `GET /api/posts/stats` (aggregations)

#### Admin API (secured; see `ADMIN_API_DOCUMENTATION.md`)
- Auth:
  - `POST /api/admin/auth/login`
  - `POST /api/admin/auth/logout`
- Dashboard:
  - `GET /api/admin/dashboard/stats`
- Users:
  - `GET /api/admin/users`
  - `POST /api/admin/users`
  - `GET /api/admin/users/[id]`
  - `PUT /api/admin/users/[id]`
  - `DELETE /api/admin/users/[id]`
- Posts (admin view):
  - `GET /api/admin/posts`
- Settings:
  - `GET /api/admin/settings`
  - `PUT /api/admin/settings`

### 2.4 Integration points
- **SEO**:
  - ensure post objects include SEO fields (seoTitle, canonicalUrl, noIndex, social*, structuredData)
  - ensure platform settings include `seoSettings` (default meta + GA ID + robots.txt)
- **Search**:
  - `lib/posts.ts` implements relevance scoring
  - search endpoint returns metadata (`query`, `filters`, `total`) for SSR rendering

## 3) Development Environment Setup

### 3.1 Tooling
- Node.js **18+**
- Install deps:

```bash
npm install
```

### 3.2 Environment variables
Create `.env.local`:

```env
NODE_ENV=development
JWT_SECRET=change-me-to-a-long-random-secret
```

### 3.3 Initialize admin system + data files

```bash
npm run admin:init
```

Expected result: `data/` files created for admin users/sessions/settings (and posts file created on first post write).

## 4) Develop User Authentication (Admin)

### 4.1 Implement/verify flows
- **Login**:
  - validate request body
  - verify username/password (bcrypt compare)
  - issue JWT with expiry
  - create/update session record (for revocation/expiry tracking)
- **Logout**:
  - invalidate session / mark JWT as revoked (session store)

### 4.2 Security controls
- Password policy enforcement (min length, weak password protection).
- Rate limiting for login attempts (IP + username).
- Audit log for auth events (success/failure) including IP + user agent.
- Use secure error messages (avoid leaking whether username exists).

### 4.3 Acceptance tests
- Valid login returns token + expiresAt.
- Invalid credentials return 401.
- Expired token rejected.
- Locked-out user cannot login until lockout expires.

## 5) Implement Post Management (Public API)

### 5.1 CRUD + lifecycle
- Create post:
  - compute slug, readingTime, wordCount, timestamps
  - validate/sanitize fields (XSS-safe)
- Update post:
  - update timestamps
  - status transitions (draft/published/archived) consistent
- Delete post:
  - remove record (or soft-delete if chosen later)
- Scheduling:
  - support `scheduledPublishAt` and a publish job strategy (MVP may publish on request; production may require cron/worker)

### 5.2 SEO data support
- Store and return SEO/social fields without mutation.
- Ensure canonical URL logic can be computed reliably (requires `siteUrl` in settings).

### 5.3 REST + response consistency
- All endpoints return:
  - `{ success, data, error, message }`
- Standard HTTP codes (200/201/400/404/405/500).

## 6) Build Admin Controls (Backend)

### 6.1 RBAC enforcement
- Central middleware checks:
  - token validity + session validity
  - role and permissions for resource/action
- Permissions modeled as:
  - resource: users/posts/comments/settings/analytics/media/categories/tags/authors/series
  - actions: create/read/update/delete/publish/unpublish/moderate/manage

### 6.2 Admin user management endpoints
- CRUD with safety rules:
  - prevent non-super-admin from managing super-admins
  - prevent deleting the last super-admin
  - validate emails/usernames uniqueness

### 6.3 Admin posts view
- Extended filters (status, author, wordCountMin, engagementScore) without exposing unpublished posts to public endpoints.

### 6.4 Platform settings endpoints
- Allow updating:
  - SEO defaults + robots.txt + GA ID
  - security settings (max login attempts, etc.)
- Validate robots.txt content and config shape.

## 7) Testing Strategy (Unit + Integration)

### 7.1 Unit tests
- Validation and sanitization rules.
- Auth helpers: hashing/compare, JWT signing/verification, session cleanup.
- RBAC: permission matrix and enforcement.
- Post domain logic: slug creation, readingTime, search scoring.

### 7.2 Integration tests
- API route tests for:
  - login/logout
  - protected admin routes (401/403 cases)
  - post CRUD and search endpoint

### 7.3 Security tests (minimum)
- Ensure malicious HTML/script is sanitized or safely rendered.
- Ensure rate limiting triggers on repeated login attempts.

## 8) SEO Optimization (Backend Responsibilities)

Backend must provide the data needed for SSR SEO rendering:
- Per-post SEO + social fields present and validated.
- Global SEO defaults (title/description), robots.txt, GA ID stored and retrievable.
- Search responses include metadata so SSR pages can set dynamic titles/canonicals (e.g., include query + filters).

## 9) Documentation (Backend)

### 9.1 What to document
- Endpoint list + request/response examples (public and admin).
- Auth flows + token/session behavior + RBAC model.
- Data model and storage layout.
- Operational runbook (env vars, initialization, backups).

### 9.2 Source-of-truth docs
- Public API: `API_DOCUMENTATION.md`
- Admin API: `ADMIN_API_DOCUMENTATION.md`
- SEO behavior: `SEO_GUIDE.md`
- Search: `SEARCH_REQUIREMENTS.md`

## 10) Deployment & Monitoring

### 10.1 Pre-deploy checklist
- Set a strong `JWT_SECRET`.
- Change default admin password after initialization.
- Ensure HTTPS, proper caching headers (where appropriate), and error handling.
- Back up `data/*.json` (or migrate to DB for production scale).

### 10.2 Production considerations
- File-based JSON storage is not safe for concurrent writes at scale.
  - If deploying beyond MVP, prioritize DB migration + background jobs for scheduling.
- Add basic monitoring:
  - request logs for admin endpoints
  - auth failure metrics
  - 5xx alerts


