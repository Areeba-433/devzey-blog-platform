import { promises as fs } from 'fs';
import path from 'path';
import { Post, CreatePostRequest, UpdatePostRequest, PostFilters } from '../types/post';

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Generate a URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .trim();
}

// Ensure slug uniqueness
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  const posts = await readPosts();
  let slug = baseSlug;
  let counter = 1;

  while (posts.some(post => post.slug === slug && post.id !== excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Calculate reading time (roughly 200 words per minute)
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Calculate word count
function calculateWordCount(content: string): number {
  return content.split(/\s+/).filter(word => word.length > 0).length;
}

// Read all posts from file
async function readPosts(): Promise<Post[]> {
  await ensureDataDirectory();
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    const posts = JSON.parse(data);
    // Convert date strings back to Date objects
    return posts.map((post: any) => ({
      ...post,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt),
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
    }));
  } catch {
    return [];
  }
}

// Write posts to file
async function writePosts(posts: Post[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// Create a new post
export async function createPost(data: CreatePostRequest): Promise<Post> {
  const posts = await readPosts();
  const now = new Date();

  // Handle scheduled publishing
  // If status is 'published', check if it should be published now or scheduled
  // If published is true explicitly and no schedule, publish immediately
  // If there's a future schedule, don't publish yet
  const shouldPublish = data.status === 'published' && (!data.scheduledPublishAt || data.scheduledPublishAt <= now);

  // Generate unique slug
  const baseSlug = generateSlug(data.title);
  const uniqueSlug = await ensureUniqueSlug(baseSlug);

  const post: Post = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: data.title,
    slug: uniqueSlug,
    content: data.content,
    excerpt: data.excerpt,
    author: data.author,
    published: shouldPublish,
    publishedAt: shouldPublish ? (data.scheduledPublishAt || now) : null,
    createdAt: now,
    updatedAt: now,
    tags: data.tags || [],
    category: data.category || 'Uncategorized',
    featuredImage: data.featuredImage,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    readingTime: calculateReadingTime(data.content),
    // New fields
    status: data.status || 'draft',
    scheduledPublishAt: data.scheduledPublishAt,
    lastViewedAt: null,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    wordCount: calculateWordCount(data.content),
    canonicalUrl: data.canonicalUrl,
    noIndex: data.noIndex || false,
    structuredData: data.structuredData,
    series: data.series,
    seriesOrder: data.seriesOrder,
    relatedPosts: data.relatedPosts || [],
    socialTitle: data.socialTitle,
    socialDescription: data.socialDescription,
    socialImage: data.socialImage,
    customFields: data.customFields || {},
  };

  posts.push(post);
  await writePosts(posts);
  return post;
}

// Get all posts with optional filtering
export async function getPosts(filters: PostFilters = {}): Promise<Post[]> {
  let posts = await readPosts();

  // Apply filters
  if (filters.published !== undefined) {
    posts = posts.filter(post => post.published === filters.published);
  }

  if (filters.author) {
    posts = posts.filter(post => post.author.toLowerCase().includes(filters.author!.toLowerCase()));
  }

  if (filters.category) {
    posts = posts.filter(post => post.category.toLowerCase() === filters.category!.toLowerCase());
  }

  if (filters.tag) {
    posts = posts.filter(post => post.tags.some(tag => tag.toLowerCase().includes(filters.tag!.toLowerCase())));
  }

  // Enhanced filters
  if (filters.status) {
    posts = posts.filter(post => post.status === filters.status);
  }

  if (filters.series) {
    posts = posts.filter(post => post.series?.toLowerCase().includes(filters.series!.toLowerCase()));
  }

  if (filters.dateFrom) {
    posts = posts.filter(post => post.createdAt >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    posts = posts.filter(post => post.createdAt <= filters.dateTo!);
  }

  if (filters.minViews !== undefined) {
    posts = posts.filter(post => post.viewCount >= filters.minViews!);
  }

  if (filters.excludeIds && filters.excludeIds.length > 0) {
    posts = posts.filter(post => !filters.excludeIds!.includes(post.id));
  }

  // Full-text search
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    posts = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      post.category.toLowerCase().includes(searchTerm) ||
      post.author.toLowerCase().includes(searchTerm)
    );
  }

  // Sort posts
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';

  posts.sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'publishedAt':
        aValue = a.publishedAt || a.createdAt;
        bValue = b.publishedAt || b.createdAt;
        break;
      case 'updatedAt':
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
      case 'viewCount':
        aValue = a.viewCount;
        bValue = b.viewCount;
        break;
      case 'likeCount':
        aValue = a.likeCount;
        bValue = b.likeCount;
        break;
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
    }

    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Apply pagination
  const offset = filters.offset || 0;
  const limit = filters.limit || posts.length;
  posts = posts.slice(offset, offset + limit);

  return posts;
}

// Get a single post by ID
export async function getPostById(id: string): Promise<Post | null> {
  const posts = await readPosts();
  return posts.find(post => post.id === id) || null;
}

// Get a single post by slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await readPosts();
  return posts.find(post => post.slug === slug) || null;
}

// Update a post
export async function updatePost(id: string, data: UpdatePostRequest): Promise<Post | null> {
  const posts = await readPosts();
  const index = posts.findIndex(post => post.id === id);

  if (index === -1) {
    return null;
  }

  const existingPost = posts[index];
  const now = new Date();

  // Handle status changes and scheduled publishing
  let newStatus = data.status || existingPost.status;
  let newPublished = data.published !== undefined ? data.published : existingPost.published;
  let newPublishedAt = existingPost.publishedAt;

  // If status is explicitly set to published, ensure published is true
  if (newStatus === 'published') {
    newPublished = true;
    newPublishedAt = newPublishedAt || now;
  }

  // Handle scheduled publishing
  if (data.scheduledPublishAt) {
    if (data.scheduledPublishAt <= now && newStatus === 'published') {
      newPublished = true;
      newPublishedAt = data.scheduledPublishAt;
    }
  }

  const updatedPost: Post = {
    ...existingPost,
    ...data,
    updatedAt: now,
    slug: data.title ? await ensureUniqueSlug(generateSlug(data.title), existingPost.id) : existingPost.slug,
    published: newPublished,
    publishedAt: newPublishedAt,
    status: newStatus,
    scheduledPublishAt: data.scheduledPublishAt !== undefined ? data.scheduledPublishAt : existingPost.scheduledPublishAt,
    readingTime: data.content ? calculateReadingTime(data.content) : existingPost.readingTime,
    wordCount: data.content ? calculateWordCount(data.content) : existingPost.wordCount,
    // Ensure new fields are properly handled
    lastViewedAt: existingPost.lastViewedAt,
    viewCount: existingPost.viewCount,
    likeCount: existingPost.likeCount,
    commentCount: existingPost.commentCount,
    canonicalUrl: data.canonicalUrl !== undefined ? data.canonicalUrl : existingPost.canonicalUrl,
    noIndex: data.noIndex !== undefined ? data.noIndex : existingPost.noIndex,
    structuredData: data.structuredData !== undefined ? data.structuredData : existingPost.structuredData,
    series: data.series !== undefined ? data.series : existingPost.series,
    seriesOrder: data.seriesOrder !== undefined ? data.seriesOrder : existingPost.seriesOrder,
    relatedPosts: data.relatedPosts !== undefined ? data.relatedPosts : existingPost.relatedPosts,
    socialTitle: data.socialTitle !== undefined ? data.socialTitle : existingPost.socialTitle,
    socialDescription: data.socialDescription !== undefined ? data.socialDescription : existingPost.socialDescription,
    socialImage: data.socialImage !== undefined ? data.socialImage : existingPost.socialImage,
    customFields: data.customFields !== undefined ? data.customFields : existingPost.customFields,
  };

  posts[index] = updatedPost;
  await writePosts(posts);
  return updatedPost;
}

// Delete a post
export async function deletePost(id: string): Promise<boolean> {
  const posts = await readPosts();
  const filteredPosts = posts.filter(post => post.id !== id);

  if (filteredPosts.length === posts.length) {
    return false; // Post not found
  }

  await writePosts(filteredPosts);
  return true;
}

// Bulk operations
export async function bulkDeletePost(ids: string[]): Promise<{ deleted: number; failed: string[] }> {
  const posts = await readPosts();
  const initialCount = posts.length;
  const failed: string[] = [];

  const filteredPosts = posts.filter(post => {
    if (ids.includes(post.id)) {
      return false; // Remove this post
    }
    failed.push(post.id);
    return true; // Keep this post
  });

  await writePosts(filteredPosts);
  return {
    deleted: initialCount - filteredPosts.length,
    failed
  };
}

export async function bulkUpdatePosts(ids: string[], updates: UpdatePostRequest): Promise<{ updated: number; failed: string[] }> {
  const posts = await readPosts();
  let updated = 0;
  const failed: string[] = [];

  for (let i = 0; i < posts.length; i++) {
    if (ids.includes(posts[i].id)) {
      try {
        const result = await updatePost(posts[i].id, updates);
        if (result) {
          updated++;
        } else {
          failed.push(posts[i].id);
        }
      } catch (error) {
        failed.push(posts[i].id);
      }
    }
  }

  return { updated, failed };
}

export async function bulkPublishPosts(ids: string[], publish: boolean): Promise<{ updated: number; failed: string[] }> {
  return bulkUpdatePosts(ids, { published: publish, status: publish ? 'published' : 'draft' });
}

// Analytics and tracking
export async function incrementViewCount(id: string): Promise<boolean> {
  const posts = await readPosts();
  const index = posts.findIndex(post => post.id === id);

  if (index === -1) {
    return false;
  }

  posts[index].viewCount++;
  posts[index].lastViewedAt = new Date();
  await writePosts(posts);
  return true;
}

export async function incrementLikeCount(id: string): Promise<boolean> {
  const posts = await readPosts();
  const index = posts.findIndex(post => post.id === id);

  if (index === -1) {
    return false;
  }

  posts[index].likeCount++;
  await writePosts(posts);
  return true;
}

export async function incrementCommentCount(id: string): Promise<boolean> {
  const posts = await readPosts();
  const index = posts.findIndex(post => post.id === id);

  if (index === -1) {
    return false;
  }

  posts[index].commentCount++;
  await writePosts(posts);
  return true;
}

// Get post statistics
export async function getPostStats(): Promise<{
  total: number;
  published: number;
  drafts: number;
  archived: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageReadingTime: number;
}> {
  const posts = await readPosts();

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
    archived: posts.filter(p => p.status === 'archived').length,
    totalViews: posts.reduce((sum, p) => sum + p.viewCount, 0),
    totalLikes: posts.reduce((sum, p) => sum + p.likeCount, 0),
    totalComments: posts.reduce((sum, p) => sum + p.commentCount, 0),
    averageReadingTime: posts.length > 0
      ? Math.round(posts.reduce((sum, p) => sum + p.readingTime, 0) / posts.length)
      : 0,
  };

  return stats;
}

// Search functionality with relevance scoring
export async function searchPosts(query: string, filters: PostFilters = {}): Promise<Post[]> {
  if (!query || query.trim().length === 0) {
    return getPosts(filters);
  }

  const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(term => term.length > 0);
  if (searchTerms.length === 0) {
    return getPosts(filters);
  }

  // Get all posts with filters applied (except search)
  const { search: _, ...filtersWithoutSearch } = filters;
  let posts = await getPosts(filtersWithoutSearch);

  // Score and rank posts based on relevance
  const scoredPosts = posts.map(post => {
    let score = 0;
    const titleLower = post.title.toLowerCase();
    const excerptLower = post.excerpt.toLowerCase();
    const contentLower = post.content.toLowerCase();
    const categoryLower = post.category.toLowerCase();
    const authorLower = post.author.toLowerCase();
    const tagsLower = post.tags.map(tag => tag.toLowerCase());

    searchTerms.forEach(term => {
      // Title matches (highest weight)
      if (titleLower === term) {
        score += 100; // Exact title match
      } else if (titleLower.startsWith(term)) {
        score += 50; // Title starts with term
      } else if (titleLower.includes(term)) {
        score += 30; // Title contains term
      }

      // Tag matches (high weight)
      const tagMatches = tagsLower.filter(tag => tag === term || tag.includes(term));
      score += tagMatches.length * 25;

      // Category match (medium weight)
      if (categoryLower === term) {
        score += 20;
      } else if (categoryLower.includes(term)) {
        score += 10;
      }

      // Author match (medium weight)
      if (authorLower.includes(term)) {
        score += 15;
      }

      // Excerpt matches (medium weight)
      if (excerptLower.includes(term)) {
        score += 10;
        // Boost if term appears multiple times
        const matches = (excerptLower.match(new RegExp(term, 'g')) || []).length;
        score += matches * 2;
      }

      // Content matches (lower weight, but can accumulate)
      if (contentLower.includes(term)) {
        score += 5;
        // Boost for multiple occurrences
        const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
        score += Math.min(matches, 10); // Cap at 10 additional points
      }
    });

    // Boost for recent posts (small bonus)
    const daysSincePublished = post.publishedAt
      ? (Date.now() - post.publishedAt.getTime()) / (1000 * 60 * 60 * 24)
      : (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSincePublished < 30) {
      score += 5; // Recent content boost
    }

    // Boost for popular posts (small bonus)
    if (post.viewCount > 100) {
      score += Math.min(post.viewCount / 100, 5); // Cap at 5 points
    }

    return { post, score };
  });

  // Filter out posts with zero score and sort by score
  const relevantPosts = scoredPosts
    .filter(item => item.score > 0)
    .sort((a, b) => {
      // Sort by score (descending), then by published date (descending)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const aDate = a.post.publishedAt || a.post.createdAt;
      const bDate = b.post.publishedAt || b.post.createdAt;
      return bDate.getTime() - aDate.getTime();
    })
    .map(item => item.post);

  // Apply limit if specified
  if (filters.limit) {
    return relevantPosts.slice(0, filters.limit);
  }

  return relevantPosts;
}

// Scheduled publishing management
export async function publishScheduledPosts(): Promise<{ published: number; failed: string[] }> {
  const posts = await readPosts();
  const now = new Date();
  let published = 0;
  const failed: string[] = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];

    // Check if post should be published based on schedule
    if (
      post.status === 'published' &&
      !post.published &&
      post.scheduledPublishAt &&
      post.scheduledPublishAt <= now
    ) {
      try {
        // Update the post to published status
        posts[i] = {
          ...post,
          published: true,
          publishedAt: post.scheduledPublishAt,
          updatedAt: now,
        };
        published++;
      } catch (error) {
        failed.push(post.id);
      }
    }
  }

  if (published > 0) {
    await writePosts(posts);
  }

  return { published, failed };
}

// Get posts that are scheduled to be published soon (within next 24 hours)
export async function getUpcomingScheduledPosts(hoursAhead: number = 24): Promise<Post[]> {
  const posts = await readPosts();
  const now = new Date();
  const futureTime = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000));

  return posts.filter(post =>
    post.status === 'published' &&
    !post.published &&
    post.scheduledPublishAt &&
    post.scheduledPublishAt > now &&
    post.scheduledPublishAt <= futureTime
  ).sort((a, b) => {
    const aTime = a.scheduledPublishAt!.getTime();
    const bTime = b.scheduledPublishAt!.getTime();
    return aTime - bTime;
  });
}

// Validate that related posts exist and are accessible
export async function validateRelatedPosts(postIds: string[]): Promise<{ valid: string[]; invalid: string[] }> {
  if (!postIds || postIds.length === 0) {
    return { valid: [], invalid: [] };
  }

  const posts = await readPosts();
  const existingPostIds = new Set(posts.map(post => post.id));

  const valid: string[] = [];
  const invalid: string[] = [];

  postIds.forEach(id => {
    if (existingPostIds.has(id)) {
      valid.push(id);
    } else {
      invalid.push(id);
    }
  });

  return { valid, invalid };
}

// Get related posts (enhanced with manual relations and automatic suggestions)
export async function getRelatedPosts(postId: string, limit: number = 5): Promise<Post[]> {
  const post = await getPostById(postId);
  if (!post) return [];

  // First, return manually related posts if they exist
  if (post.relatedPosts && post.relatedPosts.length > 0) {
    const { valid } = await validateRelatedPosts(post.relatedPosts);
    if (valid.length > 0) {
      const manualRelatedPosts = await getPosts({
        published: true,
        excludeIds: [postId],
      });

      const filtered = manualRelatedPosts
        .filter(p => valid.includes(p.id))
        .slice(0, limit);

      if (filtered.length >= limit) {
        return filtered;
      }

      // If we need more, fall back to automatic suggestions
      limit = limit - filtered.length;
    }
  }

  // Automatic related posts based on content similarity
  const relatedPosts = await getPosts({
    published: true,
    excludeIds: [postId],
    limit: limit * 3, // Get more to score and filter
  });

  // Score posts based on relevance
  const scoredPosts = relatedPosts.map(relatedPost => {
    let score = 0;

    // Same category (highest weight)
    if (relatedPost.category === post.category) score += 30;

    // Shared tags (high weight)
    const sharedTags = relatedPost.tags.filter(tag => post.tags.includes(tag)).length;
    score += sharedTags * 20;

    // Same author (medium weight)
    if (relatedPost.author === post.author) score += 10;

    // Same series (high weight if applicable)
    if (relatedPost.series === post.series && relatedPost.series) score += 25;

    // Recent posts get slight boost
    const daysSincePublished = (Date.now() - (relatedPost.publishedAt?.getTime() || relatedPost.createdAt.getTime())) / (1000 * 60 * 60 * 24);
    if (daysSincePublished < 30) score += 5;

    // Popular posts get slight boost
    if (relatedPost.viewCount > 100) score += Math.min(relatedPost.viewCount / 100, 10);

    return { post: relatedPost, score };
  });

  // Sort by score and return top results
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}
