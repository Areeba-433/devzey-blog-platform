import { NextRequest, NextResponse } from 'next/server';
import { searchPostsMongo } from '../../../lib/search-mongo';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';

  const posts = await searchPostsMongo(q, { tag, limit: 50 });
  return NextResponse.json({ success: true, data: { posts } });
}

