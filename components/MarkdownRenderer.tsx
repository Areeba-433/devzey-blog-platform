import React from 'react';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

// Use @uiw/react-md-editor's Markdown renderer client-side (avoids SSR DOM assumptions)
const Markdown = dynamic(
  () => import('@uiw/react-md-editor').then((mod: any) => mod.Markdown),
  {
    ssr: false,
    loading: () => <div className="text-gray-500">Loading content...</div>,
  }
);

interface MarkdownRendererProps {
  value: string;
  className?: string;
}

export default function MarkdownRenderer({ value, className = '' }: MarkdownRendererProps) {
  return (
    <div className={className} data-color-mode="light">
      <Markdown
        source={value || ''}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      />
    </div>
  );
}


