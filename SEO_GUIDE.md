## SEO Implementation Guide

This document explains how SEO metadata is modeled, edited, and rendered in the DevZey Blog so that developers and content editors can use it consistently.

---

### 1. Data Model Overview

- **Per-post SEO fields** (`types/post.ts`):
  - **`seoTitle?: string`**: Optional SEO-specific title. Falls back to `title` when not set.
  - **`seoDescription?: string`**: Optional SEO description. Falls back to `excerpt`.
  - **`canonicalUrl?: string`**: Canonical URL override. Falls back to `${siteUrl}/posts/${slug}`.
  - **`noIndex?: boolean`**: When `true`, the page is marked with `noindex,nofollow`.
  - **`structuredData?: object`**: Optional JSON-LD object for search engines.
  - **`socialTitle?: string`**: Title for social previews (Open Graph / Twitter). Falls back to SEO title.
  - **`socialDescription?: string`**: Description for social previews. Falls back to SEO description.
  - **`socialImage?: string`**: Image URL for social previews. Falls back to `featuredImage` if present.

- **Global platform SEO settings** (`PlatformSettings.seoSettings` in `types/admin.ts` and `utils/platform-settings.ts`):
  - **`defaultMetaTitle?: string`**: Site-wide default `<title>` when a page/post doesn’t define its own SEO title.
  - **`defaultMetaDescription?: string`**: Site-wide default `<meta name="description">`.
  - **`googleAnalyticsId?: string`**: GA measurement ID (e.g. `G-XXXXXXXXXX`).
  - **`robotsTxt?: string`**: Full contents of `robots.txt`.

Fallback priority for posts:

1. Post-level overrides (`seoTitle`, `seoDescription`, `canonicalUrl`, `social*`).
2. Global SEO defaults (`defaultMetaTitle`, `defaultMetaDescription`).
3. Site basics (`siteName`, `siteDescription`).

---

### 2. Editing SEO in the Admin Dashboard

#### 2.1 Global SEO Settings

- Navigate to **`/admin` → Settings tab → SEO Settings**.
- Fields:
  - **Default Meta Title**: Used when a page/post has no specific SEO title.
  - **Default Meta Description**: Used when a page/post has no specific SEO description.
  - **Google Analytics ID**: Set your GA ID to enable client-side tracking.
  - **robots.txt**: Edit crawler rules and sitemap location (advanced; change with care).
- Changes are persisted via `PUT /api/admin/settings` and stored in `data/platform-settings.json`.

#### 2.2 Per-Post SEO Fields

- Navigate to **`/admin` → Posts tab**.
- Use the post create/edit flow (UI) to manage:
  - **SEO Title / Description**: Search-engine-facing title and snippet text.
  - **Canonical URL**: Custom canonical when the same content appears on multiple URLs.
  - **No Index**: Mark thin or internal posts to be excluded from search engine indexes.
  - **Social Title / Description / Image**: Control how links look when shared on social platforms.
- The UI sends these fields to:
  - `POST /api/posts` for creation.
  - `PUT /api/posts/{id}` for updates.
- Validation and sanitization are handled server-side in `utils/validation.ts`.

---

### 3. How Meta Tags Are Rendered

#### 3.1 Post Pages (`pages/posts/[slug].tsx`)

- Posts are fetched by slug using `getPostBySlug` (or `/api/posts/slug/[slug]`).
- Platform settings are loaded via `getPlatformSettings`.
- On the server, we derive SEO values:
  - **`title`**: `post.seoTitle || post.title || settings.seoSettings.defaultMetaTitle || settings.siteName`
  - **`description`**: `post.seoDescription || post.excerpt || settings.seoSettings.defaultMetaDescription || settings.siteDescription`
  - **`canonicalUrl`**: `post.canonicalUrl || \`\${settings.siteUrl}/posts/\${post.slug}\``
  - **`robots`**: `post.noIndex ? 'noindex,nofollow' : 'index,follow'`
  - **`ogTitle`**: `post.socialTitle || title`
  - **`ogDescription`**: `post.socialDescription || description`
  - **`ogImage`**: `post.socialImage || post.featuredImage`
- In the React page component, we render tags with `next/head`:
  - `<title>`, `<meta name="description">`, `<meta name="robots">`, `<link rel="canonical">`
  - Open Graph tags: `og:type`, `og:title`, `og:description`, `og:url`, `og:image`, `og:site_name`
  - Twitter tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
  - Optional JSON-LD via `<script type="application/ld+json">` if `post.structuredData` is present.

#### 3.2 Static/Other Pages

- Non-post pages (home, about, etc.) should follow the same pattern:
  - Decide a page-level SEO config (title, description, canonical, noIndex, ogImage).
  - Use platform defaults when page-specific values are not provided.
  - Render meta tags in `<Head>` using the same structure as post pages.

---

### 4. Testing & QA Checklist

For any new or updated page/post:

- **View HTML head**:
  - Open the page in a browser, then use *View Source* or DevTools **Elements → `<head>`**.
  - Confirm:
    - `<title>` matches the intended SEO title.
    - `<meta name="description">` is present and accurate.
    - `<link rel="canonical">` is correct and unique per canonical URL.
    - `<meta name="robots">` is `noindex,nofollow` only where explicitly requested.
    - Open Graph and Twitter tags are present when images and social fields are set.
- **Check global defaults**:
  - Temporarily remove post-level SEO fields and ensure defaults from settings are used.
- **Validate JSON-LD** (if used):
  - Confirm that the `<script type="application/ld+json">` tag contains valid JSON and matches the expected schema (e.g., `Article`).

---

### 5. External SEO Validation Tools

Use the following tools after deploying to a public URL:

- **Chrome Lighthouse (SEO category)**:
  - Run from DevTools → Lighthouse → check “SEO”.
  - Confirms presence and basic correctness of title, description, canonical, and other essentials.
- **Google Search Console**:
  - Use the **URL Inspection** tool to see how Google views a specific URL.
  - Check indexing status and detected canonical URL.
- **Social preview tools**:
  - Open Graph/Twitter Card previewers to ensure social shares show the right title, description, and image.

---

### 6. Onboarding Notes for New Team Members

- **When creating a post**:
  - Always set a clear `excerpt` and, when possible, a more focused `seoTitle` and `seoDescription`.
  - Use `noIndex` for low-value or duplicate content.
  - Set social fields when the post is likely to be shared widely.
- **When building new pages**:
  - Follow existing post-page patterns for computing SEO props and rendering `<Head>`.
  - Prefer using platform defaults over hard-coded titles/descriptions wherever possible.
- **When changing global SEO behavior**:
  - Make configuration changes via the admin **SEO Settings** section.
  - Only modify `robots.txt` and structured data behavior in code when necessary and after review.

This guide should be the first reference for any SEO-related changes; keep it updated as new patterns or tools are introduced.


