import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/posts/index';
import bulkHandler from '../pages/api/posts/bulk';
import statsHandler from '../pages/api/posts/stats';
import searchHandler from '../pages/api/posts/search';
import categoryHandler from '../pages/api/posts/categories/[category]';
import tagHandler from '../pages/api/posts/tags/[tag]';
import seriesHandler from '../pages/api/posts/series/[series]';
import seriesIndexHandler from '../pages/api/posts/series/index';
import authorHandler from '../pages/api/posts/authors/[author]';
import authorsIndexHandler from '../pages/api/posts/authors/index';

// Mock the posts library
jest.mock('../lib/posts', () => ({
  createPost: jest.fn(),
  getPosts: jest.fn(),
  bulkDeletePost: jest.fn(),
  bulkUpdatePosts: jest.fn(),
  bulkPublishPosts: jest.fn(),
  getPostStats: jest.fn(),
  searchPosts: jest.fn(),
}));

import {
  createPost,
  getPosts,
  bulkDeletePost,
  bulkUpdatePosts,
  bulkPublishPosts,
  getPostStats,
  searchPosts,
} from '../lib/posts';

const mockCreatePost = createPost as jest.MockedFunction<typeof createPost>;
const mockGetPosts = getPosts as jest.MockedFunction<typeof getPosts>;
const mockBulkDeletePost = bulkDeletePost as jest.MockedFunction<typeof bulkDeletePost>;
const mockBulkUpdatePosts = bulkUpdatePosts as jest.MockedFunction<typeof bulkUpdatePosts>;
const mockBulkPublishPosts = bulkPublishPosts as jest.MockedFunction<typeof bulkPublishPosts>;
const mockGetPostStats = getPostStats as jest.MockedFunction<typeof getPostStats>;
const mockSearchPosts = searchPosts as jest.MockedFunction<typeof searchPosts>;

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/posts', () => {
    it('should create a post successfully', async () => {
      const mockPost = {
        id: 'test-id',
        title: 'Test Post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        author: 'Test Author',
        published: false,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        category: 'Uncategorized',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        wordCount: 2,
        readingTime: 1,
      };

      mockCreatePost.mockResolvedValue(mockPost);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          title: 'Test Post',
          content: 'Test content',
          excerpt: 'Test excerpt',
          author: 'Test Author',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual(mockPost);
    });

    it('should handle validation errors', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // Missing required fields
          title: '',
          content: 'Test content',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Validation Error');
    });
  });

  describe('GET /api/posts', () => {
    it('should get posts with filters', async () => {
      const mockPosts = [
        { id: '1', title: 'Post 1', published: true },
        { id: '2', title: 'Post 2', published: false },
      ];

      mockGetPosts.mockResolvedValue(mockPosts);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          published: 'true',
          limit: '10',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.posts).toEqual(mockPosts);
      expect(responseData.data.total).toBe(2);

      expect(mockGetPosts).toHaveBeenCalledWith({
        published: true,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    });
  });

  describe('POST /api/posts/bulk', () => {
    it('should handle bulk delete', async () => {
      mockBulkDeletePost.mockResolvedValue({ deleted: 2, failed: [] });

      const { req, res } = createMocks({
        method: 'DELETE',
        body: {
          ids: ['id1', 'id2'],
        },
      });

      await bulkHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual({ deleted: 2, failed: [] });
    });

    it('should handle bulk update', async () => {
      mockBulkUpdatePosts.mockResolvedValue({ updated: 2, failed: [] });

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          ids: ['id1', 'id2'],
          updates: { category: 'New Category' },
        },
      });

      await bulkHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual({ updated: 2, failed: [] });
    });

    it('should handle bulk publish', async () => {
      mockBulkPublishPosts.mockResolvedValue({ updated: 2, failed: [] });

      const { req, res } = createMocks({
        method: 'PATCH',
        body: {
          ids: ['id1', 'id2'],
          published: true,
        },
      });

      await bulkHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
    });

    it('should validate bulk delete request', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        body: {
          ids: [], // Empty array
        },
      });

      await bulkHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
    });
  });

  describe('GET /api/posts/stats', () => {
    it('should return post statistics', async () => {
      const mockStats = {
        total: 10,
        published: 8,
        drafts: 1,
        archived: 1,
        totalViews: 150,
        totalLikes: 25,
        totalComments: 12,
        averageReadingTime: 3,
      };

      mockGetPostStats.mockResolvedValue(mockStats);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await statsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual(mockStats);
    });
  });

  describe('GET /api/posts/search', () => {
    it('should search posts', async () => {
      const mockResults = [
        { id: '1', title: 'Search Result 1' },
        { id: '2', title: 'Search Result 2' },
      ];

      mockSearchPosts.mockResolvedValue(mockResults);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          q: 'javascript',
          published: 'true',
          limit: '5',
        },
      });

      await searchHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.posts).toEqual(mockResults);
      expect(responseData.data.query).toBe('javascript');

      expect(mockSearchPosts).toHaveBeenCalledWith('javascript', {
        published: true,
        limit: 5,
      });
    });

    it('should require search query', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {},
      });

      await searchHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
    });
  });

  describe('GET /api/posts/categories/[category]', () => {
    it('should get posts by category', async () => {
      const mockPosts = [
        { id: '1', title: 'Tech Post 1', category: 'Tech', published: true },
        { id: '2', title: 'Tech Post 2', category: 'Tech', published: true },
      ];

      mockGetPosts.mockResolvedValue(mockPosts);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          category: 'Tech',
          published: 'true',
          limit: '10',
        },
      });

      await categoryHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.posts).toEqual(mockPosts);
      expect(responseData.data.category).toBe('Tech');
    });

    it('should handle invalid category parameter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          category: ['invalid'],
        },
      });

      await categoryHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
    });
  });

  describe('GET /api/posts/tags/[tag]', () => {
    it('should get posts by tag', async () => {
      const mockPosts = [
        { id: '1', title: 'Tagged Post 1', tags: ['javascript'], published: true },
        { id: '2', title: 'Tagged Post 2', tags: ['javascript', 'react'], published: true },
      ];

      mockGetPosts.mockResolvedValue(mockPosts);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          tag: 'javascript',
          published: 'true',
        },
      });

      await tagHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.posts).toEqual(mockPosts);
      expect(responseData.data.tag).toBe('javascript');
    });
  });

  describe('GET /api/posts/series/[series]', () => {
    it('should get posts by series', async () => {
      const mockPosts = [
        { id: '1', title: 'Series Post 1', series: 'Tutorial', seriesOrder: 1, published: true },
        { id: '2', title: 'Series Post 2', series: 'Tutorial', seriesOrder: 2, published: true },
      ];

      mockGetPosts.mockResolvedValue(mockPosts);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          series: 'Tutorial',
          published: 'true',
        },
      });

      await seriesHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.series).toBe('Tutorial');
    });
  });

  describe('GET /api/posts/series', () => {
    it('should get all series with post counts', async () => {
      const mockPosts = [
        { id: '1', title: 'Post 1', series: 'Tutorial', seriesOrder: 1, published: true, publishedAt: new Date('2024-01-01'), slug: 'post-1' },
        { id: '2', title: 'Post 2', series: 'Tutorial', seriesOrder: 2, published: true, publishedAt: new Date('2024-01-02'), slug: 'post-2' },
        { id: '3', title: 'Post 3', series: 'Guide', published: true, publishedAt: new Date('2024-01-03'), slug: 'post-3' },
      ];

      mockGetPosts.mockResolvedValue(mockPosts);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await seriesIndexHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.series).toHaveLength(2);

      // Check that series are sorted alphabetically
      expect(responseData.data.series[0].name).toBe('Guide');
      expect(responseData.data.series[1].name).toBe('Tutorial');
      expect(responseData.data.series[1].count).toBe(2);
    });
  });

  describe('GET /api/posts/authors/[author]', () => {
    it('should get posts by author', async () => {
      const mockPosts = [
        { id: '1', title: 'Author Post 1', author: 'John Doe', published: true },
        { id: '2', title: 'Author Post 2', author: 'John Doe', published: true },
      ];

      mockGetPosts.mockResolvedValue(mockPosts);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          author: 'John Doe',
          published: 'true',
        },
      });

      await authorHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.posts).toEqual(mockPosts);
      expect(responseData.data.author).toBe('John Doe');
    });
  });

  describe('GET /api/posts/authors', () => {
    it('should get all authors with post counts', async () => {
      const mockPosts = [
        { id: '1', title: 'Post 1', author: 'John Doe', published: true, publishedAt: new Date('2024-01-01') },
        { id: '2', title: 'Post 2', author: 'John Doe', published: true, publishedAt: new Date('2024-01-02') },
        { id: '3', title: 'Post 3', author: 'Jane Smith', published: true, publishedAt: new Date('2024-01-03') },
      ];

      mockGetPosts.mockResolvedValue(mockPosts);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await authorsIndexHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.authors).toHaveLength(2);

      // Check that authors are sorted by post count
      expect(responseData.data.authors[0].name).toBe('John Doe');
      expect(responseData.data.authors[0].count).toBe(2);
      expect(responseData.data.authors[1].name).toBe('Jane Smith');
      expect(responseData.data.authors[1].count).toBe(1);
    });
  });
});
