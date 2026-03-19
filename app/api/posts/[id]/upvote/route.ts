import { NextRequest, NextResponse } from 'next/server';
import { toggleUpvote } from '../../../../../lib/posts-upvote';
import { ipFromXForwardedFor, voterIdFromIp } from '../../../../../lib/voter';

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const xff = req.headers.get('x-forwarded-for');
    const ip = ipFromXForwardedFor(xff) || '127.0.0.1';
    const voterId = voterIdFromIp(ip);

    const result = await toggleUpvote(params.id, voterId);
    return NextResponse.json(result);
  } catch (e: any) {
    const message = typeof e?.message === 'string' ? e.message : 'Failed to upvote';
    const status = message === 'Post not found' ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

