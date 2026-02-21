# Develop SEO-Optimized Devzey Blog Platform — Project Plan

## 1) Executive Summary

Devzey Blog Platform is a Next.js-based blog system that supports SEO-optimized publishing, public search, and a secure admin control system for managing posts, users, and platform settings. The platform emphasizes **server-rendered SEO metadata**, **content discoverability (search + taxonomy)**, and **operational security** (JWT auth, RBAC, audit logging, rate limiting).

This plan consolidates the repo’s specifications and deliverables into a single execution document covering **purpose/goals**, **requirements**, **objectives**, and **scope**.

## 2) Purpose & Goals

### 2.1 Purpose
- Provide a modern blog platform for publishing content with strong technical SEO fundamentals.
- Provide an admin system to manage content and platform configuration safely.
- Provide a search experience that helps users discover content effectively.

### 2.2 High-Level Goals
- **SEO-first rendering**: ensure pages ship with correct `<head>` tags server-side.
- **Content management**: support full post lifecycle (draft → scheduled → published → archived).
- **Discoverability**: implement fast, relevant search and taxonomy browsing.
- **Security & governance**: admin authentication, roles/permissions, rate limiting, auditability.
- **Evolvability**: support a migration path from JSON storage to a scalable database design.

## 3) Stakeholders & Users

### 3.1 Primary User Personas
- **Reader (Public)**: reads posts, searches content, shares links.
- **Editor/Author (Admin)**: creates/edits posts, sets SEO fields, schedules publishing.
- **Moderator (Admin)**: moderates content and performs basic publishing tasks.
- **Admin/Super Admin (Admin)**: manages users, platform settings, security settings, and operations.

### 3.2 Key Stakeholder Needs
- **Readers**: fast pages, relevant search results, clean URL structure, shareable previews.
- **Editors**: easy authoring, clear preview of SEO/social metadata, safe publishing controls.
- **Admins**: secure access, audit logs, configurability (robots.txt, GA ID, defaults).

## 4) Requirements

> Notes:
> - Requirements below are derived from existing repo documentation including: `API_DOCUMENTATION.md`, `ADMIN_API_DOCUMENTATION.md`, `SEARCH_REQUIREMENTS.md`, `SEO_GUIDE.md`, and database schema documents.
> - Where the current repo uses JSON-file storage, the plan treats that as the baseline implementation with an optional scalable DB phase.

### 4.1 Functional Requirements (Public Site)

#### FR-P1: Post Rendering (SEO-friendly)
- Render individual post pages at `/posts/[slug]`.
- Use server-side rendering for metadata (Next.js SSR).
- Display post content, author, publish date, category/tags, and featured image (if present).

#### FR-P2: Post Discoverability via Search
- Provide a search experience at `/search` supporting:
  - keyword search across title/content/excerpt/tags/category/author
  - filtering (category, tag; potentially author)
  - sorting (relevance default, date, views)
  - responsive UI and empty/no-query states

#### FR-P3: Analytics Tracking (Content engagement)
- Track post views via a tracking endpoint.
- Maintain basic counters (viewCount, likeCount, commentCount), with an extensible path for more analytics.

### 4.2 Functional Requirements (Admin System)

#### FR-A1: Admin Authentication
- Admin login and logout via JWT.
- Sessions include expiration and cleanup of expired sessions.
- Secure password hashing (bcrypt).
- Ability to initialize the admin system with a default super admin and default settings.

#### FR-A2: Role-Based Access Control (RBAC)
- Support roles:
  - super_admin
  - admin
  - editor
  - moderator
- Enforce permission checks server-side for all admin APIs.

#### FR-A3: Admin User Management
- CRUD admin users:
  - list/filter users
  - create users with role assignment
  - update user data/role/isActive
  - delete users with safety checks (e.g., protecting super_admin flows)

#### FR-A4: Admin Dashboard Insights
- Dashboard stats for posts/users, health metrics, recent activity, and popular content tracking.

#### FR-A5: Admin Post Management
- Admin can list posts with advanced filters (status, author, word count, engagement score).
- Admin can publish/unpublish posts and manage status transitions.
- Bulk operations support (where specified).

#### FR-A6: Platform Settings Management
- Admin can view and update platform settings including:
  - siteName/siteDescription/siteUrl (as applicable)
  - content settings (e.g., postsPerPage)
  - security settings (e.g., max login attempts)
  - SEO settings: defaults, GA ID, and `robots.txt`

### 4.3 Functional Requirements (SEO)

#### FR-S1: Per-Post SEO Fields
Each post supports optional SEO and social metadata fields including:
- seoTitle, seoDescription
- canonicalUrl
- noIndex
- structuredData (JSON-LD)
- socialTitle, socialDescription, socialImage

#### FR-S2: Global SEO Defaults
Platform settings support global defaults for:
- default meta title/description
- Google Analytics measurement ID
- robots.txt content (admin-editable)

#### FR-S3: Meta Tag Rendering Rules (Priority/Fallbacks)
- Post pages compute:
  - title: `post.seoTitle || post.title || global.defaultMetaTitle || siteName`
  - description: `post.seoDescription || post.excerpt || global.defaultMetaDescription || siteDescription`
  - canonical: `post.canonicalUrl || siteUrl + /posts/slug`
  - robots: `noindex,nofollow` if post.noIndex else `index,follow`
- Render:
  - `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">`
  - Open Graph tags + Twitter Card tags
  - Optional JSON-LD via `<script type="application/ld+json">`

### 4.4 Non-Functional Requirements

#### NFR-1: Performance
- Search results returned quickly for “typical” datasets (target < 500ms for common queries).
- Support up to ~10,000 posts efficiently in the baseline architecture.
- SSR pages must load quickly and avoid excessive server work per request.

#### NFR-2: Security
- Admin endpoints require JWT auth and RBAC.
- Brute-force protection / rate limiting for auth and sensitive endpoints.
- Input validation + sanitization (XSS protection) for admin and public write operations.
- Audit logging for admin actions.

#### NFR-3: SEO Quality
- Server-rendered metadata for indexable pages.
- Correct canonicals.
- Robots directives handled correctly (including per-post noIndex).

#### NFR-4: Accessibility & UX
- Keyboard navigation for search (Enter/Escape), ARIA-friendly inputs, focus management.
- Responsive UI (mobile-first).

#### NFR-5: Maintainability & Extensibility
- Clear separation of concerns:
  - API routes
  - domain logic (`lib`)
  - shared types (`types`)
  - admin utilities (`utils`)
- Clear migration path from JSON to DB.

### 4.5 Data & Storage Requirements

#### DR-1: Baseline Storage (Current)
- File-based JSON storage for posts and admin data:
  - posts: `data/posts.json`
  - admin users/sessions/settings: `data/*.json` (as documented)

#### DR-2: Post Schema
- Post must store:
  - core content fields (title, slug, content, excerpt, author)
  - status, scheduling timestamps
  - taxonomy (category, tags)
  - SEO/social metadata
  - analytics counters
  - extensibility (`customFields`)

#### DR-3: Scalable Storage (Future Phase)
- A scalable relational schema is defined (PostgreSQL-oriented) with:
  - partitioning, indexes, FTS indexes (GIN/tsvector)
  - categories/tags normalized with many-to-many joins
  - security primitives (RLS/audit logging)
  - analytics tables (as needed)

## 5) Objectives (Measurable Outcomes)

### 5.1 MVP Objectives
- Publish posts with correct SSR SEO tags and canonical URLs.
- Allow users to search posts with relevance ranking, filters, and sorting.
- Provide an admin dashboard with secure login and basic post/user/settings management.

### 5.2 Quality Objectives
- SEO:
  - Lighthouse SEO category is “green” for representative pages.
  - Social previews render correctly (OG/Twitter fields present).
- Security:
  - Admin APIs protected by JWT + RBAC; sensitive endpoints rate-limited.
- DX:
  - Clear docs and predictable API response formats and errors.

## 6) Scope

### 6.1 In Scope (MVP)
- Public site:
  - post pages by slug
  - search page with SSR
  - basic engagement tracking endpoints (views)
- Blog Post Management API:
  - CRUD + filtering + pagination + taxonomy endpoints
  - search endpoint
  - basic analytics endpoints (as documented)
- Admin system:
  - login/logout (JWT), RBAC
  - user management
  - admin posts listing + management actions
  - platform settings including SEO settings and robots.txt editing
- Documentation:
  - API docs, admin docs, SEO guide, search requirements (existing) + consolidated plan (this document)

### 6.2 Out of Scope (MVP)
These may be future enhancements but are not required for initial delivery unless explicitly prioritized:
- Public user accounts / comments system (beyond counters)
- Media uploads pipeline (image hosting, transformations, CDN) beyond URL fields
- Multi-language content and hreflang
- Full DB migration (PostgreSQL + Redis + CDN) — tracked as Phase 2+
- Editorial workflows (review queues, approvals) beyond simple roles and status
- Full analytics suite (UTM attribution, cohorting, funnels)

### 6.3 Boundaries & Assumptions
- Baseline assumes JSON file storage is acceptable for local/dev and small-scale deployments.
- Production readiness requires:
  - strong secrets management
  - HTTPS
  - rate limiting
  - safe operational practices (backups, monitoring)

## 7) Deliverables

### 7.1 Core Deliverables
- **Public blog experience**
  - `/posts/[slug]` SSR page with full SEO rendering
  - `/search` SSR page + SearchBar component
- **API layer**
  - blog post CRUD endpoints + taxonomy + scheduling + analytics endpoints
  - search endpoint with relevance scoring and filtering/sorting support
- **Admin control system**
  - admin UI (dashboard)
  - admin APIs for auth, users, posts view, and settings
  - initialization script for default admin + settings
- **SEO system**
  - global SEO settings and per-post SEO fields
  - canonical + robots + social tags + optional JSON-LD
- **Documentation**
  - consolidated project plan (`PROJECT_PLAN.md`)
  - existing detailed docs remain authoritative for endpoint specifics

### 7.2 Acceptance Criteria (Project-Level)
- Public post pages show correct meta tags in HTML source (SSR).
- Search returns ranked, relevant results; filters and sorting work; UI is responsive.
- Admin endpoints reject unauthorized requests; permissions enforced for different roles.
- Admin can update global SEO defaults and robots.txt and see effects on rendered pages.
- Basic view tracking increments counters consistently.

## 8) Execution Plan (Phases & Milestones)

### Phase 0 — Alignment & Baseline (1–2 days)
- Confirm branding basics (site name, description, URL).
- Confirm MVP feature set vs. future enhancements.
- Confirm deployment target (Vercel/self-host) and environment variables approach.

### Phase 1 — MVP Build/Hardening (1–2 weeks)
- Public post page SSR + SEO meta rendering rules.
- Post API endpoints stabilized (CRUD, filters, scheduled posts).
- Search: algorithm + endpoint + SSR results page + SearchBar UX.
- Admin auth + RBAC middleware; admin dashboard flows.
- Platform settings (including SEO settings and robots.txt).
- Basic analytics tracking endpoint for views.

### Phase 2 — Production Readiness (1–2 weeks)
- Rate limiting tuned for auth and write endpoints.
- Audit logging review; security review (JWT lifetime, password policy, session cleanup).
- QA checklist execution (SEO verification tools; Search Console after deploy).
- Observability (basic logs, health checks).

### Phase 3 — Scalability Upgrades (optional)
- Migrate data layer to a relational DB schema (PostgreSQL) + indexes/FTS.
- Add caching (Redis) and CDN strategy for assets.
- Evolve analytics tables and reporting.

## 9) Risks & Mitigations

- **File-based storage concurrency**: risk of write conflicts under load.
  - Mitigation: use single-instance deployment for MVP; prioritize DB migration for scale.
- **Admin security misconfiguration** (weak JWT secret, default password).
  - Mitigation: enforce setup checklist; warn loudly; require password change on first login (future).
- **SEO regressions** (missing SSR tags, incorrect canonical).
  - Mitigation: add automated checks and manual QA checklist.
- **Search performance** at larger scale.
  - Mitigation: pagination, caching, later migration to DB FTS or index-based search.

## 10) Open Questions (To Finalize Scope)

- Deployment target and public site URL (required for canonical URLs).
- Content model extensions: authors as entities vs string field, series taxonomy depth.
- Whether public APIs require auth in production (currently documented as public).
- Whether comments are a future requirement (schema suggests possible expansion).

---

## Appendix A — Source Documents Consolidated
- `API_DOCUMENTATION.md` (public blog post management API)
- `ADMIN_API_DOCUMENTATION.md` (admin API, auth, RBAC, endpoints)
- `ADMIN_README.md` / `ADMIN_DASHBOARD_README.md` (admin setup + UI expectations)
- `SEO_GUIDE.md` / `SEO_IMPLEMENTATION_DELIVERABLE.md` (SEO data model and rendering rules)
- `SEARCH_REQUIREMENTS.md` / `SEARCH_FEATURE_DOCUMENTATION.md` / `SEARCH_IMPLEMENTATION_DELIVERABLE.md` (search requirements and architecture)
- `DATABASE_SCHEMA.md` / `SCALABLE_DATABASE_SCHEMA.md` (baseline JSON storage + scalable DB design)


