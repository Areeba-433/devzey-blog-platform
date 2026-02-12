import { CreatePostRequest, UpdatePostRequest } from '../types/post';

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateCreatePost(data: any): CreatePostRequest {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }

  if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
    errors.push('Content is required and must be a non-empty string');
  }

  if (!data.excerpt || typeof data.excerpt !== 'string' || data.excerpt.trim().length === 0) {
    errors.push('Excerpt is required and must be a non-empty string');
  }

  if (!data.author || typeof data.author !== 'string' || data.author.trim().length === 0) {
    errors.push('Author is required and must be a non-empty string');
  }

  if (data.published !== undefined && typeof data.published !== 'boolean') {
    errors.push('Published must be a boolean value');
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array of strings');
  }

  if (data.category && typeof data.category !== 'string') {
    errors.push('Category must be a string');
  }

  if (data.featuredImage && typeof data.featuredImage !== 'string') {
    errors.push('Featured image must be a string URL');
  }

  if (data.seoTitle && typeof data.seoTitle !== 'string') {
    errors.push('SEO title must be a string');
  }

  if (data.seoDescription && typeof data.seoDescription !== 'string') {
    errors.push('SEO description must be a string');
  }

  // Validate new fields
  if (data.status && !['draft', 'published', 'archived'].includes(data.status)) {
    errors.push('Status must be one of: draft, published, archived');
  }

  if (data.scheduledPublishAt && !(data.scheduledPublishAt instanceof Date) && isNaN(Date.parse(data.scheduledPublishAt))) {
    errors.push('Scheduled publish date must be a valid date');
  }

  if (data.canonicalUrl && typeof data.canonicalUrl !== 'string') {
    errors.push('Canonical URL must be a string');
  }

  if (data.noIndex !== undefined && typeof data.noIndex !== 'boolean') {
    errors.push('No index must be a boolean value');
  }

  if (data.series && typeof data.series !== 'string') {
    errors.push('Series must be a string');
  }

  if (data.seriesOrder !== undefined && (!Number.isInteger(data.seriesOrder) || data.seriesOrder < 0)) {
    errors.push('Series order must be a non-negative integer');
  }

  if (data.relatedPosts && !Array.isArray(data.relatedPosts)) {
    errors.push('Related posts must be an array of post IDs');
  }

  if (data.socialTitle && typeof data.socialTitle !== 'string') {
    errors.push('Social title must be a string');
  }

  if (data.socialDescription && typeof data.socialDescription !== 'string') {
    errors.push('Social description must be a string');
  }

  if (data.socialImage && typeof data.socialImage !== 'string') {
    errors.push('Social image must be a string URL');
  }

  if (data.customFields && typeof data.customFields !== 'object') {
    errors.push('Custom fields must be an object');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  return {
    title: data.title.trim(),
    content: data.content.trim(),
    excerpt: data.excerpt.trim(),
    author: data.author.trim(),
    published: data.published,
    tags: data.tags || [],
    category: data.category?.trim(),
    featuredImage: data.featuredImage?.trim(),
    seoTitle: data.seoTitle?.trim(),
    seoDescription: data.seoDescription?.trim(),
    status: data.status || 'draft',
    scheduledPublishAt: data.scheduledPublishAt ? new Date(data.scheduledPublishAt) : null,
    canonicalUrl: data.canonicalUrl?.trim(),
    noIndex: data.noIndex,
    structuredData: data.structuredData,
    series: data.series?.trim(),
    seriesOrder: data.seriesOrder,
    relatedPosts: data.relatedPosts || [],
    socialTitle: data.socialTitle?.trim(),
    socialDescription: data.socialDescription?.trim(),
    socialImage: data.socialImage?.trim(),
    customFields: data.customFields || {},
  };
}

export function validateUpdatePost(data: any): UpdatePostRequest {
  const errors: string[] = [];

  if (data.title !== undefined && (typeof data.title !== 'string' || data.title.trim().length === 0)) {
    errors.push('Title must be a non-empty string');
  }

  if (data.content !== undefined && (typeof data.content !== 'string' || data.content.trim().length === 0)) {
    errors.push('Content must be a non-empty string');
  }

  if (data.excerpt !== undefined && (typeof data.excerpt !== 'string' || data.excerpt.trim().length === 0)) {
    errors.push('Excerpt must be a non-empty string');
  }

  if (data.author !== undefined && (typeof data.author !== 'string' || data.author.trim().length === 0)) {
    errors.push('Author must be a non-empty string');
  }

  if (data.published !== undefined && typeof data.published !== 'boolean') {
    errors.push('Published must be a boolean value');
  }

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array of strings');
  }

  if (data.category !== undefined && typeof data.category !== 'string') {
    errors.push('Category must be a string');
  }

  if (data.featuredImage !== undefined && typeof data.featuredImage !== 'string') {
    errors.push('Featured image must be a string URL');
  }

  if (data.seoTitle !== undefined && typeof data.seoTitle !== 'string') {
    errors.push('SEO title must be a string');
  }

  if (data.seoDescription !== undefined && typeof data.seoDescription !== 'string') {
    errors.push('SEO description must be a string');
  }

  // Validate new fields
  if (data.status !== undefined && !['draft', 'published', 'archived'].includes(data.status)) {
    errors.push('Status must be one of: draft, published, archived');
  }

  if (data.scheduledPublishAt !== undefined && data.scheduledPublishAt !== null &&
      !(data.scheduledPublishAt instanceof Date) && isNaN(Date.parse(data.scheduledPublishAt))) {
    errors.push('Scheduled publish date must be a valid date or null');
  }

  if (data.canonicalUrl !== undefined && typeof data.canonicalUrl !== 'string') {
    errors.push('Canonical URL must be a string');
  }

  if (data.noIndex !== undefined && typeof data.noIndex !== 'boolean') {
    errors.push('No index must be a boolean value');
  }

  if (data.series !== undefined && typeof data.series !== 'string') {
    errors.push('Series must be a string');
  }

  if (data.seriesOrder !== undefined && (!Number.isInteger(data.seriesOrder) || data.seriesOrder < 0)) {
    errors.push('Series order must be a non-negative integer');
  }

  if (data.relatedPosts !== undefined && !Array.isArray(data.relatedPosts)) {
    errors.push('Related posts must be an array of post IDs');
  }

  if (data.socialTitle !== undefined && typeof data.socialTitle !== 'string') {
    errors.push('Social title must be a string');
  }

  if (data.socialDescription !== undefined && typeof data.socialDescription !== 'string') {
    errors.push('Social description must be a string');
  }

  if (data.socialImage !== undefined && typeof data.socialImage !== 'string') {
    errors.push('Social image must be a string URL');
  }

  if (data.customFields !== undefined && typeof data.customFields !== 'object') {
    errors.push('Custom fields must be an object');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  const result: UpdatePostRequest = {};

  if (data.title !== undefined) result.title = data.title.trim();
  if (data.content !== undefined) result.content = data.content.trim();
  if (data.excerpt !== undefined) result.excerpt = data.excerpt.trim();
  if (data.author !== undefined) result.author = data.author.trim();
  if (data.published !== undefined) result.published = data.published;
  if (data.tags !== undefined) result.tags = data.tags;
  if (data.category !== undefined) result.category = data.category.trim();
  if (data.featuredImage !== undefined) result.featuredImage = data.featuredImage.trim();
  if (data.seoTitle !== undefined) result.seoTitle = data.seoTitle.trim();
  if (data.seoDescription !== undefined) result.seoDescription = data.seoDescription.trim();
  if (data.status !== undefined) result.status = data.status;
  if (data.scheduledPublishAt !== undefined) result.scheduledPublishAt = data.scheduledPublishAt ? new Date(data.scheduledPublishAt) : null;
  if (data.canonicalUrl !== undefined) result.canonicalUrl = data.canonicalUrl.trim();
  if (data.noIndex !== undefined) result.noIndex = data.noIndex;
  if (data.structuredData !== undefined) result.structuredData = data.structuredData;
  if (data.series !== undefined) result.series = data.series.trim();
  if (data.seriesOrder !== undefined) result.seriesOrder = data.seriesOrder;
  if (data.relatedPosts !== undefined) result.relatedPosts = data.relatedPosts;
  if (data.socialTitle !== undefined) result.socialTitle = data.socialTitle.trim();
  if (data.socialDescription !== undefined) result.socialDescription = data.socialDescription.trim();
  if (data.socialImage !== undefined) result.socialImage = data.socialImage.trim();
  if (data.customFields !== undefined) result.customFields = data.customFields;

  return result;
}

export function validateId(id: string): void {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new ValidationError('Invalid post ID');
  }
}

export function validateSlug(slug: string): void {
  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    throw new ValidationError('Invalid post slug');
  }
}
