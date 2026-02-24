# Deployment Guide — DevZey Blog

This guide covers deploying the DevZey Blog platform to production.

## Pre-Deployment Checklist

- [ ] All tests pass (`npm test`)
- [ ] Production build succeeds (`npm run build`)
- [ ] `JWT_SECRET` is set to a long, random string
- [ ] Default admin password has been changed
- [ ] `data/` directory is in `.gitignore` (do not commit user data)

## Deploy to Vercel

### 1. Prepare the Repository

Ensure your code is in a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your repository
4. Vercel will detect Next.js automatically

### 3. Configure Environment Variables

In the Vercel project settings, add:

| Name | Value | Notes |
|------|-------|-------|
| `JWT_SECRET` | (random 32+ character string) | **Required** for admin auth |
| `NODE_ENV` | `production` | Usually set automatically |

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Deploy

- Click **Deploy**
- Vercel will run `npm install` and `npm run build`
- After deployment, your site will be live at `https://your-project.vercel.app`

### 5. Post-Deploy: Initialize Admin

Because Vercel uses serverless functions and ephemeral storage, you need to initialize the admin system on first use:

**Option A: Run admin:init locally against production**

If you have a way to run one-off commands against the production environment, run:

```bash
npm run admin:init
```

**Option B: Use the admin API**

If the platform supports creating the first admin via an API or setup endpoint, use that flow.

**Option C: Seed data in build**

For Vercel, you can add a build step that creates initial data if it doesn't exist. This requires customizing the build or using a database.

### 6. Data Persistence (Important)

Vercel serverless functions do **not** persist the `data/` directory between requests. For production:

1. **Use a database**: Migrate to PostgreSQL or similar (see [DATABASE_SETUP.md](./DATABASE_SETUP.md), [SCALABLE_DATABASE_SCHEMA.md](./SCALABLE_DATABASE_SCHEMA.md))
2. **Use Vercel Blob** or another storage service for JSON files
3. **Use a platform with persistent storage** (e.g., Railway, Render, self-hosted)

For a small blog or MVP, you may use Vercel with file storage only if you accept that data can be reset on redeploy. For serious use, use a database.

---

## Deploy to Other Platforms

### Railway / Render

1. Connect your Git repository
2. Set build command: `npm run build`
3. Set start command: `npm run start`
4. Add `JWT_SECRET` environment variable
5. Ensure the `data/` directory is writable (these platforms often provide persistent storage)

### Docker (Self-Hosted)

Example `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t devzey-blog .
docker run -p 3000:3000 -e JWT_SECRET=your-secret -v $(pwd)/data:/app/data devzey-blog
```

---

## Custom Domain (Vercel)

1. In Vercel project → Settings → Domains
2. Add your domain
3. Update DNS as instructed by Vercel
4. Update `siteUrl` in platform settings (admin → Settings) to match your domain

---

## Security Checklist

- [ ] `JWT_SECRET` is unique and not committed
- [ ] Default admin password changed
- [ ] HTTPS enabled (Vercel provides this)
- [ ] Rate limiting configured in platform settings
- [ ] Regular backups if using file storage
