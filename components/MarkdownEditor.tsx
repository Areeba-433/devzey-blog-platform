'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default || mod),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] border border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    )
  }
);

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
  visibleDragBar = true,
  preview = 'live'
}: MarkdownEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a textarea fallback during SSR
    return (
      <div className="w-full">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={Math.floor(height / 24)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      </div>
    );
  }

  return (
    <div className="w-full markdown-editor-wrapper" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview={preview}
        visibleDragBar={visibleDragBar}
        height={height}
        textareaProps={{
          placeholder: placeholder,
          style: {
            fontSize: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          },
        }}
        data-color-mode="light"
      />
      <style jsx global>{`
        .markdown-editor-wrapper .w-md-editor {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
        }
        .markdown-editor-wrapper .w-md-editor:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .markdown-editor-wrapper .w-md-editor-text-pre {
          font-size: 14px;
        }
        .markdown-editor-wrapper .w-md-editor-text {
          font-size: 14px;
        }
        .markdown-editor-wrapper .w-md-editor-preview {
          padding: 16px;
        }
        .markdown-editor-wrapper .w-md-editor-preview h1,
        .markdown-editor-wrapper .w-md-editor-preview h2,
        .markdown-editor-wrapper .w-md-editor-preview h3,
        .markdown-editor-wrapper .w-md-editor-preview h4,
        .markdown-editor-wrapper .w-md-editor-preview h5,
        .markdown-editor-wrapper .w-md-editor-preview h6 {
          margin-top: 1em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }
        .markdown-editor-wrapper .w-md-editor-preview h1 {
          font-size: 2em;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.3em;
        }
        .markdown-editor-wrapper .w-md-editor-preview h2 {
          font-size: 1.5em;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.3em;
        }
        .markdown-editor-wrapper .w-md-editor-preview h3 {
          font-size: 1.25em;
        }
        .markdown-editor-wrapper .w-md-editor-preview code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
        }
        .markdown-editor-wrapper .w-md-editor-preview pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 0.375rem;
          overflow-x: auto;
        }
        .markdown-editor-wrapper .w-md-editor-preview pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
        .markdown-editor-wrapper .w-md-editor-preview blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1em;
          margin-left: 0;
          color: #6b7280;
        }
        .markdown-editor-wrapper .w-md-editor-preview table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .markdown-editor-wrapper .w-md-editor-preview table th,
        .markdown-editor-wrapper .w-md-editor-preview table td {
          border: 1px solid #e5e7eb;
          padding: 0.5em;
        }
        .markdown-editor-wrapper .w-md-editor-preview table th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .markdown-editor-wrapper .w-md-editor-preview a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .markdown-editor-wrapper .w-md-editor-preview a:hover {
          color: #2563eb;
        }
        .markdown-editor-wrapper .w-md-editor-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
        }
        .markdown-editor-wrapper .w-md-editor-preview ul,
        .markdown-editor-wrapper .w-md-editor-preview ol {
          padding-left: 2em;
          margin: 0.5em 0;
        }
        .markdown-editor-wrapper .w-md-editor-preview hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
}
