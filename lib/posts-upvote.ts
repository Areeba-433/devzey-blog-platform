import { connectToDB } from './db';
import { Post } from '../models/Post';

export async function toggleUpvote(postId: string, voterId: string) {
  await connectToDB();

  const existing = await Post.findById(postId).select({ upvotes: 1 }).lean();
  if (!existing) throw new Error('Post not found');

  const hasUpvoted = Array.isArray(existing.upvotes) && existing.upvotes.includes(voterId);

  const updated = await Post.findByIdAndUpdate(
    postId,
    hasUpvoted ? { $pull: { upvotes: voterId } } : { $addToSet: { upvotes: voterId } },
    { new: true, select: { upvotes: 1 } }
  ).lean();

  const total = updated?.upvotes?.length ?? 0;

  return { upvoted: !hasUpvoted, total };
}

