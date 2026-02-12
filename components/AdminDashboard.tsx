'use client';

import React, { useState, useEffect } from 'react';
import { AdminUser, AdminDashboardStats, PlatformSettings } from '../types/admin';
import '../styles/admin.css';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'posts' | 'settings'>('dashboard');
  const [user, setUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      fetchDashboardData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (authToken: string) => {
    try {
      const [statsResponse, settingsResponse] = await Promise.all([
        fetch('/api/admin/dashboard/stats', {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('adminToken');
    setToken(null);
    setUser(null);
    setStats(null);
    onLogout?.();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={(user, token) => {
      setUser(user);
      setToken(token);
      localStorage.setItem('adminToken', token);
      fetchDashboardData(token);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              {user && (
                <span className="ml-4 text-sm text-gray-500">
                  Welcome, {user.firstName} {user.lastName} ({user.role})
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-64 bg-white rounded-lg shadow-sm p-6">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📊 Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'users'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👥 Users
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'posts'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📝 Posts
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ⚙️ Settings
                </button>
              </li>
            </ul>
          </nav>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <DashboardTab stats={stats} settings={settings} />
            )}
            {activeTab === 'users' && (
              <UsersTab token={token} userRole={user?.role} />
            )}
            {activeTab === 'posts' && (
              <PostsTab token={token} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab token={token} settings={settings} onSettingsUpdate={setSettings} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Login Component
function AdminLogin({ onLogin }: { onLogin: (user: AdminUser, token: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.data.user, data.data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && (
            <div className="mb-4 text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Default credentials:</p>
          <p>Username: admin</p>
          <p>Password: admin123</p>
          <p className="text-red-500 mt-2">⚠️ Change password after first login!</p>
        </div>
      </div>
    </div>
  );
}

// Dashboard Tab
function DashboardTab({ stats, settings }: { stats: AdminDashboardStats | null, settings: PlatformSettings | null }) {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold">{stats.publishedPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">👁️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
          <div className="space-y-3">
            {stats.recentPosts.slice(0, 5).map((post) => (
              <div key={post.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-sm">{post.title}</p>
                  <p className="text-xs text-gray-500">by {post.author} • {post.status}</p>
                </div>
                <span className="text-xs text-gray-500">{post.viewCount} views</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {stats.recentUsers.slice(0, 5).map((user) => (
              <div key={user.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-sm">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.role} • {user.email}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.systemHealth.uptime}h</p>
            <p className="text-sm text-gray-600">Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.systemHealth.memoryUsage}MB</p>
            <p className="text-sm text-gray-600">Memory Usage</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.systemHealth.diskUsage}MB</p>
            <p className="text-sm text-gray-600">Storage Used</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Users Tab
function UsersTab({ token, userRole }: { token: string | null, userRole?: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    if (!token) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        setShowCreateForm(false);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create user');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update user');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token) return;

    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete user');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  if (loading) {
    return <div className="bg-white rounded-lg shadow-sm p-6">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        {userRole === 'super_admin' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create User
          </button>
        )}
      </div>

      {showCreateForm && (
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateForm(false)}
          title="Create New User"
        />
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.firstName && user.lastName && (
                      <div className="text-sm text-gray-500">
                        {user.firstName} {user.lastName}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'editor' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    {userRole === 'super_admin' && user.role !== 'super_admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <UserForm
          onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
          onCancel={() => setEditingUser(null)}
          title="Edit User"
          initialData={editingUser}
          isEditing={true}
        />
      )}
    </div>
  );
}

// User Form Component
function UserForm({ onSubmit, onCancel, title, initialData, isEditing = false }: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  title: string;
  initialData?: any;
  isEditing?: boolean;
}) {
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || 'editor',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    isActive: initialData?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!isEditing}
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Active User
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {isEditing ? 'Update User' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Posts Tab
function PostsTab({ token }: { token: string | null }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    author: '',
    published: '',
    limit: 20,
    offset: 0
  });

  useEffect(() => {
    fetchPosts();
  }, [token, filters]);

  const fetchPosts = async () => {
    if (!token) return;

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/posts?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (postId: string, published: boolean) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          published,
          status: published ? 'published' : 'draft'
        })
      });

      if (response.ok) {
        fetchPosts();
      } else {
        alert('Failed to update post status');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!token) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchPosts();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setShowPostForm(true);
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setShowPostForm(true);
  };

  const handleSubmitPost = async (postData: any) => {
    if (!token) return;

    try {
      const isEditing = !!editingPost;
      const url = isEditing ? `/api/posts/${editingPost.id}` : '/api/posts';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowPostForm(false);
        setEditingPost(null);
        fetchPosts();
      } else {
        alert(data.message || 'Failed to save post');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  if (loading) {
    return <div className="bg-white rounded-lg shadow-sm p-6">Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Post Management</h2>
        <div className="flex space-x-4 items-center">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={filters.published}
            onChange={(e) => setFilters({...filters, published: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Posts</option>
            <option value="true">Published Only</option>
            <option value="false">Unpublished Only</option>
          </select>
          <input
            type="text"
            placeholder="Filter by author"
            value={filters.author}
            onChange={(e) => setFilters({...filters, author: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleCreatePost}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            New Post
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium max-w-xs truncate">{post.title}</div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {post.excerpt}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {post.author}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    post.status === 'published' ? 'bg-green-100 text-green-800' :
                    post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>{post.viewCount} views</div>
                  <div>{post.likeCount} likes</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(post.id, !post.published)}
                      className={`text-xs px-2 py-1 rounded ${
                        post.published
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {post.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleEditPost(post)}
                      className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPostForm && (
        <PostForm
          onSubmit={handleSubmitPost}
          onCancel={() => {
            setShowPostForm(false);
            setEditingPost(null);
          }}
          initialData={editingPost}
        />
      )}
    </div>
  );
}

// Post Form (Admin)
function PostForm({
  initialData,
  onSubmit,
  onCancel
}: {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<any>({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    author: initialData?.author || '',
    category: initialData?.category || '',
    tags: initialData?.tags?.join(', ') || '',
    featuredImage: initialData?.featuredImage || '',
    status: initialData?.status || 'draft',
    published: initialData?.published || false,
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    canonicalUrl: initialData?.canonicalUrl || '',
    noIndex: initialData?.noIndex || false,
    socialTitle: initialData?.socialTitle || '',
    socialDescription: initialData?.socialDescription || '',
    socialImage: initialData?.socialImage || ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      author: formData.author,
      category: formData.category || undefined,
      tags: formData.tags
        ? formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
        : undefined,
      featuredImage: formData.featuredImage || undefined,
      status: formData.status,
      published: formData.published,
      seoTitle: formData.seoTitle || undefined,
      seoDescription: formData.seoDescription || undefined,
      canonicalUrl: formData.canonicalUrl || undefined,
      noIndex: formData.noIndex,
      socialTitle: formData.socialTitle || undefined,
      socialDescription: formData.socialDescription || undefined,
      socialImage: formData.socialImage || undefined
    };

    onSubmit(payload);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? 'Edit Post' : 'Create New Post'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="nextjs, seo, performance"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Excerpt *
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image URL
            </label>
            <input
              type="url"
              value={formData.featuredImage}
              onChange={(e) => handleChange('featuredImage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => handleChange('published', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 text-sm text-gray-700">
              Published
            </label>
          </div>
        </div>

        {/* SEO Section */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-md font-semibold mb-3">SEO</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => handleChange('seoTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Overrides the default page title in search results"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canonical URL
              </label>
              <input
                type="url"
                value={formData.canonicalUrl}
                onChange={(e) => handleChange('canonicalUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/posts/my-post"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Description
            </label>
            <textarea
              value={formData.seoDescription}
              onChange={(e) => handleChange('seoDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Short description shown in search results (recommended ~160 characters)"
            />
          </div>
          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id="noIndex"
              checked={formData.noIndex}
              onChange={(e) => handleChange('noIndex', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="noIndex" className="ml-2 text-sm text-gray-700">
              Prevent search engines from indexing this post (noindex)
            </label>
          </div>
        </div>

        {/* Social Section */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-md font-semibold mb-3">Social Sharing</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social Title
              </label>
              <input
                type="text"
                value={formData.socialTitle}
                onChange={(e) => handleChange('socialTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Title used when sharing on social media"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social Image URL
              </label>
              <input
                type="url"
                value={formData.socialImage}
                onChange={(e) => handleChange('socialImage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Image used in social previews"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Social Description
            </label>
            <textarea
              value={formData.socialDescription}
              onChange={(e) => handleChange('socialDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description used when sharing on social media"
            />
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {initialData ? 'Update Post' : 'Create Post'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Settings Tab
function SettingsTab({ token, settings, onSettingsUpdate }: {
  token: string | null;
  settings: PlatformSettings | null;
  onSettingsUpdate: (settings: PlatformSettings) => void;
}) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        onSettingsUpdate(data.data);
        alert('Settings updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update settings');
      }
    } catch (error) {
      alert('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (!settings) {
    return <div className="bg-white rounded-lg shadow-sm p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platform Settings</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          {/* Site Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Site Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={formData.siteName || ''}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site URL
                </label>
                <input
                  type="url"
                  value={formData.siteUrl || ''}
                  onChange={(e) => handleChange('siteUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Description
              </label>
              <textarea
                value={formData.siteDescription || ''}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Content Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">Content Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posts Per Page
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.postsPerPage || 10}
                  onChange={(e) => handleChange('postsPerPage', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="commentsEnabled"
                  checked={formData.commentsEnabled || false}
                  onChange={(e) => handleChange('commentsEnabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="commentsEnabled" className="ml-2 text-sm text-gray-700">
                  Enable Comments
                </label>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seoSettings?.defaultMetaTitle || ''}
                  onChange={(e) =>
                    handleChange('seoSettings', {
                      ...formData.seoSettings,
                      defaultMetaTitle: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fallback title for pages and posts"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={formData.seoSettings?.googleAnalyticsId || ''}
                  onChange={(e) =>
                    handleChange('seoSettings', {
                      ...formData.seoSettings,
                      googleAnalyticsId: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. G-XXXXXXXXXX"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Meta Description
              </label>
              <textarea
                value={formData.seoSettings?.defaultMetaDescription || ''}
                onChange={(e) =>
                  handleChange('seoSettings', {
                    ...formData.seoSettings,
                    defaultMetaDescription: e.target.value
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Fallback description used when posts/pages do not define their own description"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                robots.txt
              </label>
              <textarea
                value={formData.seoSettings?.robotsTxt || ''}
                onChange={(e) =>
                  handleChange('seoSettings', {
                    ...formData.seoSettings,
                    robotsTxt: e.target.value
                  })
                }
                rows={5}
                className="w-full font-mono text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`User-agent: *\nAllow: /\n\nSitemap: ${formData.siteUrl || 'https://example.com'}/sitemap.xml`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Controls how search engine crawlers access your site. Be careful when editing.
              </p>
            </div>
          </div>

          {/* Security Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  value={formData.securitySettings?.sessionTimeout || 480}
                  onChange={(e) => handleChange('securitySettings', {
                    ...formData.securitySettings,
                    sessionTimeout: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  min="3"
                  value={formData.securitySettings?.maxLoginAttempts || 5}
                  onChange={(e) => handleChange('securitySettings', {
                    ...formData.securitySettings,
                    maxLoginAttempts: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Min Length
                </label>
                <input
                  type="number"
                  min="6"
                  value={formData.securitySettings?.passwordMinLength || 8}
                  onChange={(e) => handleChange('securitySettings', {
                    ...formData.securitySettings,
                    passwordMinLength: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div>
            <h3 className="text-lg font-medium mb-4">Maintenance Mode</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceEnabled"
                  checked={formData.maintenanceMode?.enabled || false}
                  onChange={(e) => handleChange('maintenanceMode', {
                    ...formData.maintenanceMode,
                    enabled: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceEnabled" className="ml-2 text-sm text-gray-700">
                  Enable Maintenance Mode
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance Message
                </label>
                <textarea
                  value={formData.maintenanceMode?.message || ''}
                  onChange={(e) => handleChange('maintenanceMode', {
                    ...formData.maintenanceMode,
                    message: e.target.value
                  })}
                  placeholder="Site is currently under maintenance. Please check back later."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
