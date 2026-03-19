'use client';

import { useState, useTransition } from 'react';

type Props = {
  postId: string;
  initialCount: number;
  initiallyUpvoted: boolean;
};

export default function UpvoteButton({ postId, initialCount, initiallyUpvoted }: Props) {
  const [count, setCount] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(initiallyUpvoted);
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    const nextUpvoted = !upvoted;
    const delta = nextUpvoted ? 1 : -1;

    setUpvoted(nextUpvoted);
    setCount((c) => c + delta);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/upvote`, { method: 'POST' });
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        setUpvoted(Boolean(data.upvoted));
        setCount(Number(data.total) || 0);
      } catch {
        setUpvoted(!nextUpvoted);
        setCount((c) => c - delta);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors',
        upvoted
          ? 'bg-sky-500 text-white border-sky-500'
          : 'bg-transparent text-slate-200 border-slate-700 hover:border-slate-500',
        isPending ? 'opacity-70 cursor-not-allowed' : '',
      ].join(' ')}
      aria-pressed={upvoted}
    >
      <span aria-hidden>▲</span>
      <span>{count}</span>
      <span className="sr-only">{upvoted ? 'Remove upvote' : 'Upvote'}</span>
    </button>
  );
}

