'use client';

import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  visibleDragBar?: boolean;
  preview?: 'edit' | 'live' | 'preview';
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing your post in Markdown...',
  height = 500,
  preview = 'live'
}: MarkdownEditorProps) {
  const isPreviewOnly = preview === 'preview';
  const showPreview = preview === 'live' || isPreviewOnly;

  if (isPreviewOnly) {
    return (
      <div className="w-full border border-gray-300 rounded-md overflow-auto bg-white p-4" style={{ minHeight: height }}>
        <MarkdownRenderer value={value} className="prose max-w-none" />
      </div>
    );
  }

  return (
    <div className="w-full border border-gray-300 rounded-md overflow-hidden flex" style={{ minHeight: height }}>
      <div className={`flex-1 ${showPreview ? 'border-r border-gray-200' : ''}`}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
          style={{ minHeight: height }}
        />
      </div>
      {showPreview && (
        <div className="flex-1 overflow-auto bg-gray-50 p-4" style={{ minHeight: height }}>
          <MarkdownRenderer value={value || '*No content to preview*'} className="prose prose-sm max-w-none" />
        </div>
      )}
    </div>
  );
}
