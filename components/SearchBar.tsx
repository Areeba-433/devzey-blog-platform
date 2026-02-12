'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

interface SearchBarProps {
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

export default function SearchBar({ 
  placeholder = 'Search posts...', 
  showFilters = false,
  className = '' 
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch available categories and tags for filters
    if (showFilters) {
      fetch('/api/posts/categories')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.categories) {
            setCategories(data.data.categories.map((c: any) => c.name));
          }
        })
        .catch(console.error);

      fetch('/api/posts/tags')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.tags) {
            setTags(data.data.tags.map((t: any) => t.name));
          }
        })
        .catch(console.error);
    }
  }, [showFilters]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams();
    params.set('q', searchQuery.trim());
    
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    
    if (selectedTag) {
      params.set('tag', selectedTag);
    }

    router.push(`/search?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Simple autocomplete suggestions (can be enhanced with API call)
    if (value.length > 2) {
      // Generate suggestions from categories and tags
      const allSuggestions = [...categories, ...tags]
        .filter(item => item.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions(allSuggestions);
      setShowSuggestions(allSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <div className="flex items-center">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => query.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
            <button
              onClick={() => handleSearch()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Search
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-700">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            {(selectedCategory || selectedTag) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedTag('');
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

