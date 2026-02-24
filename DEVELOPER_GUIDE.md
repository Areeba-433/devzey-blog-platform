# DevZey Blog — Developer Guide

This guide covers setup, architecture, testing, and deployment for developers.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Data Storage](#data-storage)

---

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- Basic knowledge of Next.js, React, and TypeScript

---

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd devzey-blog
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and set JWT_SECRET

# Initialize admin system
npm run admin:init

# Run development server
npm run dev
```

Visit `http://localhost:3000` for the blog and `http://localhost:3000/admin` for the admin dashboard.

---

## Project Structure

```
devzey-blog/
├── components/          # React components
│   ├── AdminDashboard.tsx
│   ├── MarkdownEditor.tsx
│   ├── MarkdownRenderer.tsx
│   └── ...
├── data/                # JSON file storage (created at runtime)
│   ├── posts.json
│   ├── admin-users.json
│   └── platform-settings.json
├── lib/                 # Core logic
│   └── posts.ts
├── pages/
│   ├── api/             # API routes
│   │   ├── admin/       # Admin API (auth, users, settings)
│   │   └── posts/       # Public posts API
│   ├── admin.tsx
│   ├── index.tsx
│   ├── search.tsx
│   └── posts/[slug].tsx
├── styles/
├── types/
├── utils/
└── __tests__/
```

---

## Architecture

### Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown, remark-gfm, rehype-sanitize
- **Auth**: JWT with bcrypt

### Data Flow

1. **Posts**: Stored in `data/posts.json`, managed by `lib/posts.ts`
2. **Admin Users**: Stored in `data/admin-users.json`
3. **Settings**: Stored in `data/platform-settings.json`
4. **Sessions**: Stored in `data/admin-sessions.json`

### API Layers

- **Public API** (`/api/posts/*`): No auth, read/write posts (consider adding auth for write in production)
- **Admin API** (`/api/admin/*`): JWT required, full admin capabilities

---

## API Overview

### Public API (Posts)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List posts (filter, sort, paginate) |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/[id]` | Get post by ID |
| PUT | `/api/posts/[id]` | Update post |
| DELETE | `/api/posts/[id]` | Delete post |
| GET | `/api/posts/search?q=` | Search posts |
| GET | `/api/posts/categories` | List categories |
| GET | `/api/posts/tags` | List tags |
| GET | `/api/posts/authors` | List authors |

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for details.

### Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/auth/login` | Login |
| POST | `/api/admin/auth/logout` | Logout |
| GET | `/api/admin/dashboard/stats` | Dashboard statistics |
| GET/POST | `/api/admin/users` | List/Create users |
| GET/PUT/DELETE | `/api/admin/users/[id]` | User CRUD |
| GET | `/api/admin/posts` | Admin post list |
| GET/PUT | `/api/admin/settings` | Platform settings |

See [ADMIN_API_DOCUMENTATION.md](./ADMIN_API_DOCUMENTATION.md) for details.

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test Structure

- `__tests__/api.test.ts` — API endpoint tests (mocked)
- `__tests__/posts.test.ts` — Posts library tests
- `__tests__/validation.test.ts` — Validation logic tests

### Adding Tests

- Use Jest and ts-jest
- Mock `lib/posts` and `fs` where appropriate
- Use `node-mocks-http` for API handler tests

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub/GitLab/Bitbucket
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables:
   - `JWT_SECRET` (required, strong random string)
   - `NODE_ENV=production`
4. Deploy

The project includes `vercel.json` for Next.js deployment.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes (admin) | Secret for JWT signing |
| `NODE_ENV` | No | `development` or `production` |

### Post-Deploy

1. Run `npm run admin:init` if using serverless (may need a one-time setup flow)
2. Change default admin password
3. Configure platform settings via admin UI
4. Add `data/` to `.gitignore` — deploy with empty or seed data

### Data Persistence on Vercel

Vercel serverless functions use ephemeral storage. For production:

- Use a database (PostgreSQL, etc.) instead of JSON files
- See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for migration notes
- Or use Vercel Blob / external storage for JSON

---

## Environment Variables

Create `.env.local`:

```env
JWT_SECRET=your-long-random-secret-for-production
NODE_ENV=development
```

Never commit `.env.local` or real secrets to version control.

---

## Data Storage

### File-Based (Current)

- `data/posts.json` — All posts
- `data/admin-users.json` — Admin users
- `data/admin-sessions.json` — Active sessions
- `data/platform-settings.json` — Site configuration

Ensure the `data/` directory exists and is writable. The app creates it on first run if possible.

### Migrating to a Database

See [SCALABLE_DATABASE_SCHEMA.md](./SCALABLE_DATABASE_SCHEMA.md) for schema design. Replace `lib/posts.ts` and admin utilities with database queries.

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm test` | Run tests |
| `npm run admin:init` | Initialize admin system |

---

## Contributing

1. Follow existing code style (TypeScript, Tailwind)
2. Add tests for new features
3. Update documentation as needed
