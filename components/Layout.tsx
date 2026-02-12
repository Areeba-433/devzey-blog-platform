import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchBar from './SearchBar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                DevZey Blog
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  router.pathname === '/' ? 'text-blue-600 font-medium' : ''
                }`}
              >
                Home
              </Link>
              <Link
                href="/search"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  router.pathname === '/search' ? 'text-blue-600 font-medium' : ''
                }`}
              >
                Search
              </Link>
              <Link
                href="/admin"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Admin
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-700 hover:text-gray-900"
                aria-label="Menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar - Always visible */}
          <div className="pb-4">
            <SearchBar placeholder="Search posts..." showFilters={false} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; {new Date().getFullYear()} DevZey Blog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

