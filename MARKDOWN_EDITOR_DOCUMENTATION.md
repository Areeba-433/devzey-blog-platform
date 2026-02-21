# Markdown Editor Documentation

## Overview

The blog platform now includes a fully functional Markdown editor for creating and editing blog posts. The editor provides a live preview, syntax highlighting, and a user-friendly interface for writing content in Markdown format.

## Features

### Editor Capabilities

- **Live Preview**: See your formatted content in real-time as you type
- **Split View**: Edit and preview side-by-side
- **Syntax Highlighting**: Code blocks with proper syntax highlighting
- **Markdown Support**: Full Markdown syntax support including:
  - Headers (H1-H6)
  - Bold and italic text
  - Code blocks and inline code
  - Lists (ordered and unordered)
  - Links and images
  - Blockquotes
  - Tables
  - Horizontal rules
  - And more

### User Interface

- **Resizable Editor**: Drag the divider to adjust editor/preview sizes
- **Toolbar**: Quick access to common formatting options
- **Keyboard Shortcuts**: Standard Markdown shortcuts supported
- **Responsive Design**: Works on different screen sizes

## Usage

### Accessing the Editor

1. Navigate to the Admin Dashboard
2. Click on the "Posts" tab
3. Click "New Post" or "Edit" on an existing post
4. The Markdown editor appears in the "Content" field

### Writing Content

The editor accepts standard Markdown syntax. Here are some examples:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

- Unordered list item
- Another item

1. Ordered list item
2. Another item

`inline code`

\`\`\`javascript
// Code block
function example() {
  return "Hello, World!";
}
\`\`\`

[Link text](https://example.com)

![Image alt text](https://example.com/image.jpg)

> Blockquote text

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

### Editor Modes

The editor supports three viewing modes:

1. **Edit Mode**: Shows only the Markdown editor
2. **Live Preview**: Shows editor and preview side-by-side (default)
3. **Preview Mode**: Shows only the rendered preview

Switch between modes using the toolbar buttons.

### Tips for Best Results

1. **Use Headers**: Structure your content with proper heading hierarchy (H1 → H2 → H3)
2. **Code Blocks**: Use triple backticks with language identifiers for syntax highlighting
3. **Images**: Use relative paths or full URLs for images
4. **Links**: Always include descriptive link text
5. **Lists**: Use proper indentation for nested lists
6. **Line Breaks**: Use double line breaks for paragraphs

## Technical Details

### Component Location

- **Component**: `components/MarkdownEditor.tsx`
- **Integration**: `components/AdminDashboard.tsx` (PostForm component)

### Dependencies

- `@uiw/react-md-editor`: Main Markdown editor library
- `rehype-sanitize`: Security sanitization for rendered HTML
- `remark-gfm`: GitHub Flavored Markdown support

### Data Storage

The Markdown content is stored as plain text in the `content` field of the post object. The content is saved exactly as written in the editor, preserving all Markdown syntax.

### Rendering

When posts are displayed on the frontend, the Markdown content should be rendered using a Markdown parser (e.g., `react-markdown` or `marked`). The editor only handles the editing experience.

## Customization

### Editor Height

The default editor height is 500px. To change it, modify the `height` prop in the `PostForm` component:

```tsx
<MarkdownEditor
  height={600} // Change to desired height
  // ... other props
/>
```

### Preview Mode

Change the default preview mode by modifying the `preview` prop:

```tsx
<MarkdownEditor
  preview="edit" // Options: 'edit', 'live', 'preview'
  // ... other props
/>
```

### Styling

The editor includes custom CSS for better integration with the admin dashboard. Styles are defined in the `MarkdownEditor` component using styled-jsx.

## Troubleshooting

### Editor Not Loading

- Ensure all dependencies are installed: `npm install`
- Check browser console for errors
- Verify Next.js is running in development mode

### Content Not Saving

- Check that the `onChange` handler is properly connected
- Verify the form submission includes the content field
- Check browser console for validation errors

### Preview Not Rendering

- Ensure the editor is mounted (client-side only)
- Check that Markdown syntax is valid
- Verify CSS styles are loading correctly

## Future Enhancements

Potential improvements for future versions:

- [ ] Image upload integration
- [ ] Custom toolbar buttons
- [ ] Markdown templates
- [ ] Auto-save functionality
- [ ] Version history
- [ ] Collaborative editing
- [ ] Spell checking
- [ ] Word count display
- [ ] Reading time estimation

## Support

For issues or questions about the Markdown editor:

1. Check this documentation
2. Review the component code in `components/MarkdownEditor.tsx`
3. Check the library documentation: https://github.com/uiwjs/react-md-editor

## Examples

### Basic Blog Post

```markdown
# My First Blog Post

This is my first blog post using the new Markdown editor!

## Introduction

I'm excited to share this with you.

## Main Content

Here's some **important** information:

- Point 1
- Point 2
- Point 3

## Conclusion

Thanks for reading!
```

### Code Example Post

```markdown
# How to Use React Hooks

React Hooks are a powerful feature. Here's an example:

\`\`\`javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`
```

### Post with Images and Links

```markdown
# My Project

Check out my project on [GitHub](https://github.com/example/project).

![Project Screenshot](https://example.com/screenshot.png)

This project demonstrates:
- Modern web development
- Best practices
- Clean code
```
