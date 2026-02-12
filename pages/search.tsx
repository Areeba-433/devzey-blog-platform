import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPosts } from '../lib/posts';
import { getPlatformSettings } from '../utils/platform-settings';
import { Post } from '../types/post';
import SearchBar from '../components/SearchBar';

interface SearchPageProps {
  initialPosts: Post[];
  initialQuery: string;
  initialCategory?: string;
  initialTag?: string;
  total: number;
  settings: {
    siteName: string;
    siteUrl: string;
  };
}

export default function SearchPage({
  initialPosts,
  initialQuery,
  initialCategory,
  initialTag,
  total,
  settings
}: SearchPageProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory || '');
  const [tag, setTag] = useState(initialTag || '');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'views'>('relevance');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    // Fetch categories and tags for filters
    Promise.all([
      fetch('/api/posts/categories').then(res => res.json()),
      fetch('/api/posts/tags').then(res => res.json())
    ]).then(([categoriesRes, tagsRes]) => {
      if (categoriesRes.success) {
        setCategories(categoriesRes.data.categories.map((c: any) => c.name));
      }
      if (tagsRes.success) {
        setTags(tagsRes.data.tags.map((t: any) => t.name));
      }
    });
  }, []);

  const handleSearch = async (searchQuery: string, searchCategory?: string, searchTag?: string) => {
    setLoading(true);
    setQuery(searchQuery);
    
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    if (searchCategory) params.set('category', searchCategory);
    if (searchTag) params.set('tag', searchTag);
    if (sortBy !== 'relevance') {
      params.set('sortBy', sortBy === 'date' ? 'publishedAt' : 'viewCount');
      params.set('sortOrder', 'desc');
    }

    try {
      const response = await fetch(`/api/posts/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts || []);
        router.push(`/search?${params.toString()}`, undefined, { shallow: true });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newCategory: string, newTag: string) => {
    setCategory(newCategory);
    setTag(newTag);
    if (query) {
      handleSearch(query, newCategory || undefined, newTag || undefined);
    }
  };

  const handleSortChange = (newSort: 'relevance' | 'date' | 'views') => {
    setSortBy(newSort);
    if (query) {
      const params = new URLSearchParams();
      params.set('q', query);
      if (category) params.set('category', category);
      if (tag) params.set('tag', tag);
      if (newSort !== 'relevance') {
        params.set('sortBy', newSort === 'date' ? 'publishedAt' : 'viewCount');
        params.set('sortOrder', 'desc');
      }
      
      fetch(`/api/posts/search?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPosts(data.data.posts || []);
            router.push(`/search?${params.toString()}`, undefined, { shallow: true });
          }
        });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>
          {query ? `Search: "${query}" - ${settings.siteName}` : `Search - ${settings.siteName}`}
        </title>
        <meta
          name="description"
          content={`Search results for "${query}" on ${settings.siteName}`}
        />
        <link rel="canonical" href={`${settings.siteUrl}/search?q=${encodeURIComponent(query)}`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search</h1>
          <SearchBar
            placeholder="Search posts..."
            showFilters={true}
            className="max-w-2xl"
          />
        </div>

          {/* Results Summary and Filters */}
          {query && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="text-gray-600">
                  {loading ? (
                    'Searching...'
                  ) : (
                    <>
                      Found <strong>{total}</strong> {total === 1 ? 'result' : 'results'} for "
                      <strong>{query}</strong>"
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as 'relevance' | 'date' | 'views')}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Newest First</option>
                    <option value="views">Most Views</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {(category || tag) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      Category: {category}
                      <button
                        onClick={() => handleFilterChange('', tag)}
                        className="ml-2 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {tag && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      Tag: {tag}
                      <button
                        onClick={() => handleFilterChange(category, '')}
                        className="ml-2 hover:text-green-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Filter Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => handleFilterChange(e.target.value, tag)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tag
                      </label>
                      <select
                        value={tag}
                        onChange={(e) => handleFilterChange(category, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Tags</option>
                        {tags.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-3">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Searching...</p>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Try adjusting your search terms or filters
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <article
                          key={post.id}
                          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                <Link
                                  href={`/posts/${post.slug}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {post.title}
                                </Link>
                              </h2>
                              
                              <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <span>By {post.author}</span>
                                {post.publishedAt && (
                                  <span>{formatDate(post.publishedAt)}</span>
                                )}
                                <span>{post.readingTime} min read</span>
                                {post.category && (
                                  <span className="px-2 py-1 bg-gray-100 rounded">
                                    {post.category}
                                  </span>
                                )}
                                {post.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {post.tags.slice(0, 3).map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {post.featuredImage && (
                              <div className="ml-4 hidden md:block">
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-32 h-32 object-cover rounded"
                                />
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!query && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Start searching</h3>
              <p className="mt-2 text-sm text-gray-500">
                Enter keywords, tags, or categories to find posts
              </p>
            </div>
          )}
        </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { q: query, category, tag, sortBy, sortOrder } = context.query;

  if (!query || typeof query !== 'string') {
    return {
      props: {
        initialPosts: [],
        initialQuery: '',
        total: 0,
        settings: {
          siteName: 'DevZey Blog',
          siteUrl: 'https://devzey-blog.vercel.app'
        }
      }
    };
  }

  const filters: any = {
    published: true,
    search: query
  };

  if (category && typeof category === 'string') {
    filters.category = category;
  }

  if (tag && typeof tag === 'string') {
    filters.tag = tag;
  }

  if (sortBy && typeof sortBy === 'string' && sortBy !== 'relevance') {
    filters.sortBy = sortBy;
    filters.sortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
  }

  const posts = await getPosts(filters);
  const settings = await getPlatformSettings();

  return {
    props: {
      initialPosts: posts,
      initialQuery: query,
      initialCategory: category || '',
      initialTag: tag || '',
      total: posts.length,
      settings: {
        siteName: settings.siteName,
        siteUrl: settings.siteUrl
      }
    }
  };
};

