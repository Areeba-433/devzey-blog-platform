import { connectToDB, isMongoConfigured } from './db';
import { Post } from '../models/Post';

export type SearchResultPost = {
  id: string;
  title: string;
  slug: string;
  author: string;
  tags: string[];
  createdAt: string;
  upvoteCount: number;
  excerpt: string;
};

function excerptFromMarkdown(markdown: string, maxLen: number = 180) {
  const plain = (markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/[#>*_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).trimEnd()}…`;
}

export async function searchPostsMongo(query: string, opts?: { tag?: string; limit?: number }) {
  if (!isMongoConfigured()) return [] as SearchResultPost[];
  await connectToDB();

  const q = (query || '').trim();
  const limit = Math.min(Math.max(opts?.limit ?? 30, 1), 50);
  const tag = (opts?.tag || '').trim();

  const filter: any = {};
  if (tag) filter.tags = tag;

  let docs: any[] = [];
  if (!q) {
    docs = await Post.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  } else {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    docs = await Post.find({
      ...filter,
      $or: [{ title: regex }, { content: regex }, { tags: regex }, { author: regex }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  return docs.map((d) => ({
    id: String(d._id),
    title: d.title,
    slug: d.slug,
    author: d.author,
    tags: d.tags ?? [],
    createdAt: new Date(d.createdAt).toISOString(),
    upvoteCount: Array.isArray(d.upvotes) ? d.upvotes.length : 0,
    excerpt: excerptFromMarkdown(d.content),
  })) as SearchResultPost[];
}

