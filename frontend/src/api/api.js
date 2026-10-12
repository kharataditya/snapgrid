import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach session-isolated Bearer token if present
api.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem('snapgrid_token') ||
    localStorage.getItem('snapgrid_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Pass along error message from server if available
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authApi = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Users API
export const usersApi = {
  searchUsers: async (query) => {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
  getUser: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/users/me', data);
    return res.data;
  },
  getFollowers: async (id) => {
    const res = await api.get(`/users/${id}/followers`);
    return res.data;
  },
  getFollowing: async (id) => {
    const res = await api.get(`/users/${id}/following`);
    return res.data;
  },
};

// Posts API
export const postsApi = {
  getFeed: async () => {
    const res = await api.get('/posts/feed');
    return res.data;
  },
  getUserPosts: async (userId) => {
    const res = await api.get(`/posts/user/${userId}`);
    return res.data;
  },
  createPost: async (postData) => {
    const res = await api.post('/posts', postData);
    return res.data;
  },
  getPost: async (id) => {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  },
  deletePost: async (id) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },
};

// Likes API
export const likesApi = {
  likePost: async (postId) => {
    const res = await api.post(`/posts/${postId}/like`);
    return res.data;
  },
  unlikePost: async (postId) => {
    const res = await api.delete(`/posts/${postId}/like`);
    return res.data;
  },
};

// Comments API
export const commentsApi = {
  getComments: async (postId) => {
    const res = await api.get(`/posts/${postId}/comments`);
    return res.data;
  },
  addComment: async (postId, text) => {
    const res = await api.post(`/posts/${postId}/comments`, { comment_text: text });
    return res.data;
  },
  deleteComment: async (commentId) => {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  },
};

// Follows API
export const followsApi = {
  followUser: async (userId) => {
    const res = await api.post(`/users/${userId}/follow`);
    return res.data;
  },
  unfollowUser: async (userId) => {
    const res = await api.delete(`/users/${userId}/follow`);
    return res.data;
  },
};

// Format relative date helper
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 0 || diffInSeconds < 60) {
    return 'just now';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// Default avatar placeholder generator
export const getDefaultAvatar = (username) => {
  const initial = (username || 'U').charAt(0).toUpperCase();
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23dbdbdb"/><text x="50%" y="55%" font-size="40" font-family="Arial,sans-serif" font-weight="bold" fill="%23555555" dominant-baseline="middle" text-anchor="middle">${initial}</text></svg>`;
};

export default api;
