import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  bulkDeletePost,
  bulkUpdatePosts,
  bulkPublishPosts,
  incrementViewCount,
  incrementLikeCount,
  incrementCommentCount,
  getPostStats,
  searchPosts,
  getRelatedPosts,
  generateSlug,
  calculateReadingTime,
  calculateWordCount
} from '../lib/posts';
import { promises as fs } from 'fs';
import path from 'path';

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json');

// Mock fs operations
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('Posts Library', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default mocks
    mockFs.access.mockResolvedValue(undefined);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('[]');
    mockFs.writeFile.mockResolvedValue(undefined);
  });

  describe('Utility Functions', () => {
    describe('generateSlug', () => {
      it('should generate URL-friendly slugs', () => {
        expect(generateSlug('Hello World!')).toBe('hello-world');
        expect(generateSlug('Test_Post-123')).toBe('test-post-123');
        expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
        expect(generateSlug('Special@#$%Characters')).toBe('specialcharacters');
      });
    });

    describe('calculateReadingTime', () => {
      it('should calculate reading time correctly', () => {
        expect(calculateReadingTime('This is a test post with some content.')).toBe(1);
        expect(calculateReadingTime('word '.repeat(400))).toBe(2);
        expect(calculateReadingTime('')).toBe(1); // Empty content still shows 1 minute
      });
    });

    describe('calculateWordCount', () => {
      it('should count words correctly', () => {
        expect(calculateWordCount('This is a test.')).toBe(4);
        expect(calculateWordCount('One')).toBe(1);
        expect(calculateWordCount('Multiple   spaces   here')).toBe(3);
        expect(calculateWordCount('')).toBe(0);
      });
    });
  });

  describe('Post CRUD Operations', () => {
    const mockPostData = {
      title: 'Test Post',
      content: 'This is test content for the post.',
      excerpt: 'Test excerpt',
      author: 'Test Author',
      tags: ['test', 'blog'],
      category: 'Tech',
    };

    describe('createPost', () => {
      it('should create a post with default values', async () => {
        const post = await createPost(mockPostData);

        expect(post).toMatchObject({
          title: 'Test Post',
          content: 'This is test content for the post.',
          excerpt: 'Test excerpt',
          author: 'Test Author',
          tags: ['test', 'blog'],
          category: 'Tech',
          published: false,
          status: 'draft',
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          wordCount: 7, // "This is test content for the post."
          readingTime: 1,
        });

        expect(post.id).toBeDefined();
        expect(post.slug).toBe('test-post');
        expect(post.createdAt).toBeInstanceOf(Date);
        expect(post.updatedAt).toBeInstanceOf(Date);
      });

      it('should create a published post', async () => {
        const publishedData = { ...mockPostData, published: true, status: 'published' as const };
        const post = await createPost(publishedData);

        expect(post.published).toBe(true);
        expect(post.status).toBe('published');
        expect(post.publishedAt).toBeInstanceOf(Date);
      });

      it('should handle scheduled publishing', async () => {
        const futureDate = new Date(Date.now() + 86400000); // Tomorrow
        const scheduledData = {
          ...mockPostData,
          status: 'published' as const,
          scheduledPublishAt: futureDate
        };

        const post = await createPost(scheduledData);

        expect(post.published).toBe(false); // Not published yet
        expect(post.status).toBe('published');
        expect(post.scheduledPublishAt).toEqual(futureDate);
      });
    });

    describe('getPosts', () => {
      beforeEach(() => {
        const mockPosts = [
          {
            id: '1',
            title: 'Post 1',
            content: 'Content 1',
            excerpt: 'Excerpt 1',
            author: 'Author 1',
            published: true,
            status: 'published',
            tags: ['tag1'],
            category: 'Tech',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            publishedAt: new Date('2024-01-01'),
            viewCount: 10,
            likeCount: 5,
            commentCount: 2,
            wordCount: 10,
            readingTime: 1,
            scheduledPublishAt: null,
            lastViewedAt: null,
            featuredImage: null,
            seoTitle: null,
            seoDescription: null,
            canonicalUrl: null,
            noIndex: false,
            structuredData: null,
            series: null,
            seriesOrder: null,
            relatedPosts: [],
            socialTitle: null,
            socialDescription: null,
            socialImage: null,
            customFields: {},
          },
          {
            id: '2',
            title: 'Post 2',
            content: 'Content 2',
            excerpt: 'Excerpt 2',
            author: 'Author 2',
            published: false,
            status: 'draft',
            tags: ['tag2'],
            category: 'News',
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
            publishedAt: null,
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            wordCount: 8,
            readingTime: 1,
            scheduledPublishAt: null,
            lastViewedAt: null,
            featuredImage: null,
            seoTitle: null,
            seoDescription: null,
            canonicalUrl: null,
            noIndex: false,
            structuredData: null,
            series: null,
            seriesOrder: null,
            relatedPosts: [],
            socialTitle: null,
            socialDescription: null,
            socialImage: null,
            customFields: {},
          },
        ];
        mockFs.readFile.mockResolvedValue(JSON.stringify(mockPosts));
      });

      it('should get all posts', async () => {
        const posts = await getPosts();
        expect(posts).toHaveLength(2);
      });

      it('should filter by published status', async () => {
        const publishedPosts = await getPosts({ published: true });
        expect(publishedPosts).toHaveLength(1);
        expect(publishedPosts[0].id).toBe('1');

        const unpublishedPosts = await getPosts({ published: false });
        expect(unpublishedPosts).toHaveLength(1);
        expect(unpublishedPosts[0].id).toBe('2');
      });

      it('should filter by status', async () => {
        const publishedPosts = await getPosts({ status: 'published' });
        expect(publishedPosts).toHaveLength(1);

        const draftPosts = await getPosts({ status: 'draft' });
        expect(draftPosts).toHaveLength(1);
      });

      it('should filter by category', async () => {
        const techPosts = await getPosts({ category: 'Tech' });
        expect(techPosts).toHaveLength(1);
        expect(techPosts[0].category).toBe('Tech');
      });

      it('should filter by tag', async () => {
        const tag1Posts = await getPosts({ tag: 'tag1' });
        expect(tag1Posts).toHaveLength(1);
      });

      it('should sort posts', async () => {
        const postsByCreated = await getPosts({ sortBy: 'createdAt', sortOrder: 'desc' });
        expect(postsByCreated[0].id).toBe('2'); // Newer post first

        const postsByViews = await getPosts({ sortBy: 'viewCount', sortOrder: 'desc' });
        expect(postsByViews[0].id).toBe('1'); // Higher view count first
      });

      it('should paginate results', async () => {
        const posts = await getPosts({ limit: 1, offset: 1 });
        expect(posts).toHaveLength(1);
        expect(posts[0].id).toBe('2');
      });
    });

    describe('getPostById', () => {
      beforeEach(() => {
        const mockPosts = [{
          id: 'test-id',
          title: 'Test Post',
          content: 'Test content',
          excerpt: 'Test excerpt',
          author: 'Test Author',
          published: true,
          status: 'published',
          tags: [],
          category: 'Tech',
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: new Date(),
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          wordCount: 2,
          readingTime: 1,
          scheduledPublishAt: null,
          lastViewedAt: null,
          featuredImage: null,
          seoTitle: null,
          seoDescription: null,
          canonicalUrl: null,
          noIndex: false,
          structuredData: null,
          series: null,
          seriesOrder: null,
          relatedPosts: [],
          socialTitle: null,
          socialDescription: null,
          socialImage: null,
          customFields: {},
        }];
        mockFs.readFile.mockResolvedValue(JSON.stringify(mockPosts));
      });

      it('should return post by ID', async () => {
        const post = await getPostById('test-id');
        expect(post).toBeDefined();
        expect(post?.id).toBe('test-id');
      });

      it('should return null for non-existent post', async () => {
        const post = await getPostById('non-existent');
        expect(post).toBeNull();
      });
    });

    describe('updatePost', () => {
      beforeEach(() => {
        const mockPosts = [{
          id: 'test-id',
          title: 'Original Title',
          content: 'Original content',
          excerpt: 'Original excerpt',
          author: 'Original Author',
          published: false,
          status: 'draft',
          tags: ['old-tag'],
          category: 'Tech',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          publishedAt: null,
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          wordCount: 2,
          readingTime: 1,
          scheduledPublishAt: null,
          lastViewedAt: null,
          featuredImage: null,
          seoTitle: null,
          seoDescription: null,
          canonicalUrl: null,
          noIndex: false,
          structuredData: null,
          series: null,
          seriesOrder: null,
          relatedPosts: [],
          socialTitle: null,
          socialDescription: null,
          socialImage: null,
          customFields: {},
        }];
        mockFs.readFile.mockResolvedValue(JSON.stringify(mockPosts));
      });

      it('should update post fields', async () => {
        const updates = {
          title: 'Updated Title',
          status: 'published' as const,
        };

        const updatedPost = await updatePost('test-id', updates);

        expect(updatedPost).toBeDefined();
        expect(updatedPost?.title).toBe('Updated Title');
        expect(updatedPost?.status).toBe('published');
        expect(updatedPost?.published).toBe(true);
        expect(updatedPost?.updatedAt.getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
      });

      it('should return null for non-existent post', async () => {
        const result = await updatePost('non-existent', { title: 'New Title' });
        expect(result).toBeNull();
      });
    });

    describe('deletePost', () => {
      beforeEach(() => {
        const mockPosts = [
          { id: '1', title: 'Post 1' },
          { id: '2', title: 'Post 2' },
        ];
        mockFs.readFile.mockResolvedValue(JSON.stringify(mockPosts));
      });

      it('should delete existing post', async () => {
        const result = await deletePost('1');
        expect(result).toBe(true);
      });

      it('should return false for non-existent post', async () => {
        const result = await deletePost('non-existent');
        expect(result).toBe(false);
      });
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      const mockPosts = [
        { id: '1', title: 'Post 1', published: true, status: 'published' },
        { id: '2', title: 'Post 2', published: false, status: 'draft' },
        { id: '3', title: 'Post 3', published: true, status: 'published' },
      ];
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockPosts));
    });

    describe('bulkDeletePost', () => {
      it('should delete multiple posts', async () => {
        const result = await bulkDeletePost(['1', '3']);
        expect(result.deleted).toBe(2);
        expect(result.failed).toEqual([]);
      });

      it('should handle non-existent posts', async () => {
        const result = await bulkDeletePost(['1', 'non-existent']);
        expect(result.deleted).toBe(1);
        expect(result.failed).toEqual(['non-existent']);
      });
    });

    describe('bulkUpdatePosts', () => {
      it('should update multiple posts', async () => {
        const result = await bulkUpdatePosts(['1', '2'], { category: 'Updated Category' });
        expect(result.updated).toBe(2);
        expect(result.failed).toEqual([]);
      });
    });

    describe('bulkPublishPosts', () => {
      it('should publish multiple posts', async () => {
        const result = await bulkPublishPosts(['1', '2'], true);
        expect(result.updated).toBe(2);
      });

      it('should unpublish multiple posts', async () => {
        const result = await bulkPublishPosts(['1', '3'], false);
        expect(result.updated).toBe(2);
      });
    });
  });

  describe('Analytics and Tracking', () => {
    beforeEach(() => {
      const mockPosts = [{
        id: 'test-id',
        title: 'Test Post',
        viewCount: 5,
        likeCount: 2,
        commentCount: 1,
      }];
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockPosts));
    });

    it('should increment view count', async () => {
      const result = await incrementViewCount('test-id');
      expect(result).toBe(true);
    });

    it('should increment like count', async () => {
      const result = await incrementLikeCount('test-id');
      expect(result).toBe(true);
    });

    it('should increment comment count', async () => {
      const result = await incrementCommentCount('test-id');
      expect(result).toBe(true);
    });

    it('should return false for non-existent post', async () => {
      const result = await incrementViewCount('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      const mockPosts = [
        { status: 'published', viewCount: 10, likeCount: 5, commentCount: 2, readingTime: 3 },
        { status: 'draft', viewCount: 0, likeCount: 0, commentCount: 0, readingTime: 2 },
        { status: 'archived', viewCount: 5, likeCount: 1, commentCount: 1, readingTime: 4 },
      ];
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockPosts));
    });

    it('should calculate post statistics', async () => {
      const stats = await getPostStats();

      expect(stats.total).toBe(3);
      expect(stats.published).toBe(1);
      expect(stats.drafts).toBe(1);
      expect(stats.archived).toBe(1);
      expect(stats.totalViews).toBe(15);
      expect(stats.totalLikes).toBe(6);
      expect(stats.totalComments).toBe(3);
      expect(stats.averageReadingTime).toBe(3);
    });
  });

  describe('Search and Related Posts', () => {
    beforeEach(() => {
      const mockPosts = [
        {
          id: '1',
          title: 'JavaScript Tutorial',
          content: 'Learn JavaScript programming',
          tags: ['javascript', 'programming'],
          category: 'Tech',
          author: 'John Doe',
          published: true,
        },
        {
          id: '2',
          title: 'React Guide',
          content: 'Master React development',
          tags: ['react', 'javascript'],
          category: 'Tech',
          author: 'Jane Smith',
          published: true,
        },
        {
          id: '3',
          title: 'Python Basics',
          content: 'Introduction to Python',
          tags: ['python', 'programming'],
          category: 'Tech',
          author: 'John Doe',
          published: true,
        },
      ];
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockPosts));
    });

    it('should search posts by title', async () => {
      const results = await searchPosts('JavaScript');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('JavaScript Tutorial');
    });

    it('should search posts by content', async () => {
      const results = await searchPosts('programming');
      expect(results).toHaveLength(2);
    });

    it('should search posts by tags', async () => {
      const results = await searchPosts('react');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('React Guide');
    });

    it('should return related posts', async () => {
      const related = await getRelatedPosts('1', 5);
      expect(related.length).toBeGreaterThan(0);
      // Should not include the original post
      expect(related.find(p => p.id === '1')).toBeUndefined();
    });
  });
});
