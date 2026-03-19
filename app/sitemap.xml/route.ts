import { NextResponse } from 'next/server';
import { connectToDB, isMongoConfigured } from '../../lib/db';
import { Post } from '../../models/Post';

function siteUrl() {
  return process.env.SITE_URL || 'http://localhost:3000';
}

function escapeXml(s: string) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = isMongoConfigured()
    ? await (async () => {
        await connectToDB();
        return Post.find({})
          .select({ slug: 1, updatedAt: 1, createdAt: 1 })
          .sort({ createdAt: -1 })
          .lean();
      })()
    : [];

  const base = siteUrl();
  const urls = [
    { loc: `${base}/`, lastmod: new Date().toISOString() },
    { loc: `${base}/search`, lastmod: new Date().toISOString() },
    ...posts.map((p: any) => ({
      loc: `${base}/posts/${p.slug}`,
      lastmod: new Date(p.updatedAt || p.createdAt).toISOString(),
    })),
  ];

  const body = urls
    .map(
      (u) => `
  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(u.lastmod)}</lastmod>
  </url>`.trim()
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

