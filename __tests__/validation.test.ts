import { validateCreatePost, validateUpdatePost, ValidationError } from '../utils/validation';

describe('validateCreatePost', () => {
  it('should validate a valid create post request', () => {
    const validData = {
      title: 'Test Post',
      content: 'This is test content',
      excerpt: 'Test excerpt',
      author: 'Test Author',
    };

    const result = validateCreatePost(validData);

    expect(result).toEqual({
      title: 'Test Post',
      content: 'This is test content',
      excerpt: 'Test excerpt',
      author: 'Test Author',
      tags: [],
    });
  });

  it('should throw ValidationError for missing title', () => {
    const invalidData = {
      content: 'This is test content',
      excerpt: 'Test excerpt',
      author: 'Test Author',
    };

    expect(() => validateCreatePost(invalidData)).toThrow(ValidationError);
  });

  it('should throw ValidationError for empty title', () => {
    const invalidData = {
      title: '',
      content: 'This is test content',
      excerpt: 'Test excerpt',
      author: 'Test Author',
    };

    expect(() => validateCreatePost(invalidData)).toThrow(ValidationError);
  });

  it('should trim whitespace from string fields', () => {
    const dataWithWhitespace = {
      title: '  Test Post  ',
      content: '  This is test content  ',
      excerpt: '  Test excerpt  ',
      author: '  Test Author  ',
    };

    const result = validateCreatePost(dataWithWhitespace);

    expect(result.title).toBe('Test Post');
    expect(result.content).toBe('This is test content');
    expect(result.excerpt).toBe('Test excerpt');
    expect(result.author).toBe('Test Author');
  });

  it('should handle optional fields correctly', () => {
    const data = {
      title: 'Test Post',
      content: 'This is test content',
      excerpt: 'Test excerpt',
      author: 'Test Author',
      published: true,
      tags: ['tag1', 'tag2'],
      category: 'Tech',
      featuredImage: 'https://example.com/image.jpg',
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description',
      status: 'published' as const,
      scheduledPublishAt: new Date('2024-01-01'),
      canonicalUrl: 'https://example.com/post',
      noIndex: false,
      series: 'Tutorial Series',
      seriesOrder: 1,
      relatedPosts: ['post1', 'post2'],
      socialTitle: 'Social Title',
      socialDescription: 'Social Description',
      socialImage: 'https://example.com/social.jpg',
      customFields: { key: 'value' },
    };

    const result = validateCreatePost(data);

    expect(result.published).toBe(true);
    expect(result.tags).toEqual(['tag1', 'tag2']);
    expect(result.category).toBe('Tech');
    expect(result.featuredImage).toBe('https://example.com/image.jpg');
    expect(result.seoTitle).toBe('SEO Title');
    expect(result.seoDescription).toBe('SEO Description');
    expect(result.status).toBe('published');
    expect(result.scheduledPublishAt).toEqual(new Date('2024-01-01'));
    expect(result.canonicalUrl).toBe('https://example.com/post');
    expect(result.noIndex).toBe(false);
    expect(result.series).toBe('Tutorial Series');
    expect(result.seriesOrder).toBe(1);
    expect(result.relatedPosts).toEqual(['post1', 'post2']);
    expect(result.socialTitle).toBe('Social Title');
    expect(result.socialDescription).toBe('Social Description');
    expect(result.socialImage).toBe('https://example.com/social.jpg');
    expect(result.customFields).toEqual({ key: 'value' });
  });
});

describe('validateUpdatePost', () => {
  it('should validate a valid update post request', () => {
    const validData = {
      title: 'Updated Test Post',
      published: true,
    };

    const result = validateUpdatePost(validData);

    expect(result).toEqual({
      title: 'Updated Test Post',
      published: true,
    });
  });

  it('should handle empty update object', () => {
    const result = validateUpdatePost({});
    expect(result).toEqual({});
  });

  it('should throw ValidationError for empty title', () => {
    const invalidData = {
      title: '',
    };

    expect(() => validateUpdatePost(invalidData)).toThrow(ValidationError);
  });

  it('should trim whitespace from updated string fields', () => {
    const dataWithWhitespace = {
      title: '  Updated Title  ',
      author: '  Updated Author  ',
      series: '  Updated Series  ',
      socialTitle: '  Updated Social Title  ',
    };

    const result = validateUpdatePost(dataWithWhitespace);

    expect(result.title).toBe('Updated Title');
    expect(result.author).toBe('Updated Author');
    expect(result.series).toBe('Updated Series');
    expect(result.socialTitle).toBe('Updated Social Title');
  });

  it('should validate status field', () => {
    expect(() => validateCreatePost({
      title: 'Test',
      content: 'Content',
      excerpt: 'Excerpt',
      author: 'Author',
      status: 'invalid' as any,
    })).toThrow(ValidationError);

    const result = validateCreatePost({
      title: 'Test',
      content: 'Content',
      excerpt: 'Excerpt',
      author: 'Author',
      status: 'draft',
    });

    expect(result.status).toBe('draft');
  });

  it('should validate series order', () => {
    expect(() => validateCreatePost({
      title: 'Test',
      content: 'Content',
      excerpt: 'Excerpt',
      author: 'Author',
      seriesOrder: -1,
    })).toThrow(ValidationError);

    expect(() => validateCreatePost({
      title: 'Test',
      content: 'Content',
      excerpt: 'Excerpt',
      author: 'Author',
      seriesOrder: 1.5,
    })).toThrow(ValidationError);

    const result = validateCreatePost({
      title: 'Test',
      content: 'Content',
      excerpt: 'Excerpt',
      author: 'Author',
      seriesOrder: 5,
    });

    expect(result.seriesOrder).toBe(5);
  });
});
