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
          .sort({ createdAt: -1 })
          .limit(50)
          .select({ title: 1, slug: 1, content: 1, author: 1, createdAt: 1, seoMetadata: 1 })
          .lean();
      })()
    : [];

  const base = siteUrl();
  const items = posts
    .map((p: any) => {
      const url = `${base}/posts/${p.slug}`;
      const title = escapeXml(p.seoMetadata?.title || p.title);
      const description = escapeXml(p.seoMetadata?.description || '');
      const pubDate = new Date(p.createdAt).toUTCString();
      return `
        <item>
          <title>${title}</title>
          <link>${escapeXml(url)}</link>
          <guid>${escapeXml(url)}</guid>
          <pubDate>${pubDate}</pubDate>
          ${description ? `<description>${description}</description>` : ''}
        </item>
      `.trim();
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml('DevZey Blog')}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml('Developer-centric blog for DevZey.')}</description>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

