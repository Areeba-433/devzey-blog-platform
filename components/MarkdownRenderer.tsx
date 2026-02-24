import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  value: string;
  className?: string;
}

export default function MarkdownRenderer({ value, className = '' }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {value || ''}
      </ReactMarkdown>
    </div>
  );
}
