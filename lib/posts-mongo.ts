import { connectToDB, isMongoConfigured } from './db';
import { Post, PostDoc } from '../models/Post';

export type PublicPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  tags: string[];
  seoMetadata?: PostDoc['seoMetadata'];
  upvotes: string[];
  createdAt: string;
  updatedAt: string;
  upvoteCount: number;
};

function toPublicPost(doc: any): PublicPost {
  const upvotes = Array.isArray(doc.upvotes) ? doc.upvotes.map(String) : [];
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    content: doc.content,
    author: doc.author,
    tags: doc.tags ?? [],
    seoMetadata: doc.seoMetadata ?? undefined,
    upvotes,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
    upvoteCount: upvotes.length,
  };
}

export async function getPostBySlugMongo(slug: string): Promise<PublicPost | null> {
  if (!isMongoConfigured()) return null;
  await connectToDB();
  const doc = await Post.findOne({ slug }).lean();
  return doc ? toPublicPost(doc) : null;
}

export async function getLatestPostsMongo(limit: number = 20): Promise<PublicPost[]> {
  if (!isMongoConfigured()) return [];
  await connectToDB();
  const docs = await Post.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(toPublicPost);
}

