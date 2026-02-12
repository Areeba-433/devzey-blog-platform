# Search Feature Documentation

## Overview

The DevZey Blog platform includes a comprehensive search feature that allows users to find posts by keywords, tags, categories, and authors. The search system uses relevance-based scoring to return the most relevant results first.

---

## Features

### ✅ Implemented Features

1. **Full-Text Search**
   - Search across post titles, content, excerpts, tags, categories, and authors
   - Multi-word query support
   - Case-insensitive matching

2. **Relevance Scoring**
   - Intelligent ranking based on match location and frequency
   - Title matches weighted highest
   - Tag and category matches weighted highly
   - Content matches weighted lower but accumulate

3. **Advanced Filtering**
   - Filter by category
   - Filter by tag
   - Combine multiple filters
   - Filter by publication status (published only in public search)

4. **Sorting Options**
   - Relevance (default, based on scoring algorithm)
   - Date (newest first)
   - Views (most popular first)

5. **User Interface**
   - Search bar with autocomplete suggestions
   - Dedicated search results page
   - Active filter display
   - Responsive design

6. **Performance Optimizations**
   - Efficient filtering and scoring
   - Pagination support
   - Server-side rendering for SEO

---

## Architecture

### Backend Components

#### 1. Search Algorithm (`lib/posts.ts`)

The `searchPosts()` function implements a relevance-based scoring system:

```typescript
export async function searchPosts(query: string, filters: PostFilters = {}): Promise<Post[]>
```

**Scoring Weights:**
- **Exact title match**: 100 points
- **Title starts with term**: 50 points
- **Title contains term**: 30 points
- **Tag exact match**: 25 points per tag
- **Tag partial match**: 25 points per tag
- **Category exact match**: 20 points
- **Category partial match**: 10 points
- **Author match**: 15 points
- **Excerpt match**: 10 points + 2 per additional occurrence
- **Content match**: 5 points + up to 10 additional points for multiple occurrences
- **Recent post bonus**: 5 points (posts < 30 days old)
- **Popular post bonus**: Up to 5 points (based on view count)

**Sorting:**
1. Primary: Score (descending)
2. Secondary: Published date (descending)

#### 2. Search API Endpoint (`pages/api/posts/search.ts`)

**Endpoint:** `GET /api/posts/search`

**Query Parameters:**
- `q` (required): Search query string
- `category` (optional): Filter by category
- `tag` (optional): Filter by tag
- `author` (optional): Filter by author
- `published` (optional): Filter by publication status (default: true for public)
- `sortBy` (optional): Sort field (`publishedAt`, `viewCount`, etc.)
- `sortOrder` (optional): Sort direction (`asc`, `desc`)
- `limit` (optional): Maximum number of results
- `offset` (optional): Pagination offset

**Response Format:**
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "total": 10,
    "query": "search term",
    "filters": {
      "category": "Technology",
      "tag": "javascript",
      "sortBy": "relevance",
      "sortOrder": "desc"
    }
  }
}
```

### Frontend Components

#### 1. SearchBar Component (`components/SearchBar.tsx`)

Reusable search bar component with:
- Real-time input handling
- Autocomplete suggestions (from categories and tags)
- Optional filter dropdowns
- Keyboard navigation (Enter to search, Escape to close)

**Props:**
```typescript
interface SearchBarProps {
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}
```

**Usage:**
```tsx
<SearchBar 
  placeholder="Search posts..." 
  showFilters={true}
  className="max-w-2xl"
/>
```

#### 2. Search Results Page (`pages/search.tsx`)

Dedicated search results page with:
- Server-side rendering for SEO
- Filter sidebar
- Sort options
- Result display with post previews
- Empty state handling

**URL Structure:**
```
/search?q=search+term&category=Technology&tag=javascript
```

---

## Search Fields

The search algorithm searches across the following post fields:

1. **Title** (highest weight)
2. **Tags** (high weight)
3. **Category** (medium weight)
4. **Author** (medium weight)
5. **Excerpt** (medium weight)
6. **Content** (lower weight, but accumulates)

---

## Usage Examples

### Basic Search

**API:**
```
GET /api/posts/search?q=javascript
```

**Frontend:**
```tsx
<SearchBar placeholder="Search posts..." />
```

### Search with Filters

**API:**
```
GET /api/posts/search?q=react&category=Technology&tag=frontend
```

**Frontend:**
```tsx
<SearchBar showFilters={true} />
```

### Search with Sorting

**API:**
```
GET /api/posts/search?q=javascript&sortBy=publishedAt&sortOrder=desc
```

---

## Performance Considerations

### Current Implementation

- **File-based storage**: Searches all posts in memory
- **Linear search**: O(n) complexity where n = number of posts
- **Scoring**: O(n*m) where m = number of search terms
- **Suitable for**: Small to medium blogs (< 10,000 posts)

### Optimization Strategies

1. **Caching**
   - Cache search results for common queries
   - Cache category/tag lists
   - Implement TTL-based cache invalidation

2. **Indexing** (Future Enhancement)
   - Pre-build search indexes
   - Use full-text search libraries (e.g., Fuse.js, Lunr.js)
   - Consider database full-text search (PostgreSQL, MySQL)

3. **Pagination**
   - Implement result pagination
   - Limit initial result set
   - Load more on scroll

4. **Debouncing**
   - Debounce autocomplete suggestions
   - Reduce API calls during typing

---

## Testing

### Manual Testing Checklist

- [ ] Basic keyword search returns relevant results
- [ ] Multi-word queries work correctly
- [ ] Category filter narrows results
- [ ] Tag filter narrows results
- [ ] Combined filters work together
- [ ] Sorting by date works
- [ ] Sorting by views works
- [ ] Relevance sorting prioritizes title matches
- [ ] Empty search shows appropriate message
- [ ] No results shows appropriate message
- [ ] Autocomplete suggestions appear
- [ ] Search bar is responsive on mobile
- [ ] Results page is responsive on mobile

### Test Queries

1. **Single word**: "javascript"
2. **Multiple words**: "react hooks tutorial"
3. **Exact title match**: Use an exact post title
4. **Tag search**: Search for a tag name
5. **Category search**: Search for a category name
6. **Author search**: Search for an author name
7. **No results**: "xyzabc123nonexistent"

---

## API Documentation

### GET /api/posts/search

Search for posts matching a query with optional filters.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `category` | string | No | Filter by category |
| `tag` | string | No | Filter by tag |
| `author` | string | No | Filter by author |
| `published` | boolean | No | Filter by publication status |
| `sortBy` | string | No | Sort field (publishedAt, viewCount, etc.) |
| `sortOrder` | string | No | Sort direction (asc, desc) |
| `limit` | number | No | Maximum results |
| `offset` | number | No | Pagination offset |

**Example Request:**
```bash
GET /api/posts/search?q=javascript&category=Technology&sortBy=publishedAt&sortOrder=desc
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "123",
        "title": "JavaScript Best Practices",
        "excerpt": "Learn JavaScript best practices...",
        "author": "John Doe",
        "category": "Technology",
        "tags": ["javascript", "programming"],
        "publishedAt": "2024-01-15T00:00:00.000Z",
        "viewCount": 150,
        "readingTime": 5
      }
    ],
    "total": 1,
    "query": "javascript",
    "filters": {
      "category": "Technology",
      "tag": null,
      "sortBy": "publishedAt",
      "sortOrder": "desc"
    }
  }
}
```

---

## Future Enhancements

### Recommended Improvements

1. **Advanced Search Operators**
   - Phrase matching with quotes: `"exact phrase"`
   - Boolean operators: `AND`, `OR`, `NOT`
   - Field-specific search: `title:javascript`, `tag:react`

2. **Search Analytics**
   - Track popular search queries
   - Track zero-result searches
   - Identify search patterns

3. **Search Suggestions**
   - "Did you mean?" for typos
   - Related searches
   - Popular searches

4. **Advanced Filtering**
   - Date range filter
   - Author filter in UI
   - Series filter
   - Reading time filter

5. **Result Highlighting**
   - Highlight matching terms in results
   - Show match context
   - Snippet preview with highlights

6. **Performance Improvements**
   - Implement search indexing
   - Add result caching
   - Optimize for large datasets

7. **Accessibility**
   - ARIA labels for screen readers
   - Keyboard navigation improvements
   - Focus management

---

## Troubleshooting

### Common Issues

**Issue: Search returns no results**
- Check that posts are published
- Verify search query is not empty
- Check filter combinations are not too restrictive
- Verify posts exist in the database

**Issue: Search is slow**
- Check number of posts (may need indexing for large datasets)
- Consider implementing caching
- Review search algorithm complexity

**Issue: Results not relevant**
- Check scoring weights in `searchPosts()` function
- Verify search terms match post content
- Review relevance algorithm

**Issue: Filters not working**
- Verify category/tag names match exactly (case-sensitive in some cases)
- Check API parameters are correctly formatted
- Verify filter logic in backend

---

## Maintenance

### Regular Tasks

1. **Monitor Search Performance**
   - Track average search time
   - Monitor search result quality
   - Review zero-result searches

2. **Update Search Algorithm**
   - Adjust scoring weights based on user feedback
   - Add new search fields as needed
   - Optimize for performance

3. **Update Documentation**
   - Keep API documentation current
   - Update user guides
   - Document algorithm changes

---

## Related Documentation

- **API_DOCUMENTATION.md**: Complete API reference
- **DATABASE_SCHEMA.md**: Data structure documentation
- **SEO_GUIDE.md**: SEO implementation guide

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Status:** ✅ Production Ready

