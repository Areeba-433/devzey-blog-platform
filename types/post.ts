export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  readingTime?: number;
  // Enhanced fields for better management
  status: 'draft' | 'published' | 'archived';
  scheduledPublishAt?: Date | null;
  lastViewedAt?: Date | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  wordCount: number;
  // SEO enhancements
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: object;
  // Content management
  series?: string;
  seriesOrder?: number;
  relatedPosts?: string[]; // Array of post IDs
  // Social media
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: string;
  // Analytics
  customFields?: Record<string, any>;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  published?: boolean;
  tags?: string[];
  category?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  // Enhanced fields
  status?: 'draft' | 'published' | 'archived';
  scheduledPublishAt?: Date | null;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: object;
  series?: string;
  seriesOrder?: number;
  relatedPosts?: string[];
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: string;
  customFields?: Record<string, any>;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  published?: boolean;
  tags?: string[];
  category?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  // Enhanced fields
  status?: 'draft' | 'published' | 'archived';
  scheduledPublishAt?: Date | null;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: object;
  series?: string;
  seriesOrder?: number;
  relatedPosts?: string[];
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: string;
  customFields?: Record<string, any>;
}

export interface PostFilters {
  published?: boolean;
  author?: string;
  category?: string;
  tag?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount' | 'likeCount';
  sortOrder?: 'asc' | 'desc';
  // Enhanced filters
  status?: 'draft' | 'published' | 'archived';
  series?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minViews?: number;
  search?: string; // Full-text search
  excludeIds?: string[]; // Exclude specific post IDs
}
