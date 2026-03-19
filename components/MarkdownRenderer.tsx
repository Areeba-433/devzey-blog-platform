import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownRendererProps {
  value: string;
  className?: string;
}

export default function MarkdownRenderer({ value, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {value || ''}
      </ReactMarkdown>
    </div>
  );
}
