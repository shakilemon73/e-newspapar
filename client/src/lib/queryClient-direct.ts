// ========================================
// DIRECT SUPABASE QUERY CLIENT (No Express Dependencies)
// Replacing Express API calls with direct Supabase queries
// ========================================

import { QueryClient } from "@tanstack/react-query";
import { supabaseDirectAPI } from './supabase-direct-api';
import { directWeatherService } from './weather-service-direct';
import { directAdvancedAlgorithms } from './advanced-algorithms-direct';

// ========================================
// QUERY CLIENT CONFIGURATION
// ========================================

export const directQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ========================================
// DIRECT API FUNCTIONS (Replacing Express Routes)
// ========================================

// Articles API functions
export const articlesApiDirect = {
  // GET /api/articles
  getAll: async (params?: { limit?: number; offset?: number; category?: string; featured?: boolean }) => {
    const { limit = 10, offset = 0, category, featured } = params || {};
    return await supabaseDirectAPI.articles.getAll(limit, offset, category, featured);
  },

  // GET /api/articles/latest
  getLatest: async (limit = 10) => {
    return await supabaseDirectAPI.articles.getLatest(limit);
  },

  // GET /api/articles/popular
  getPopular: async (limit = 5, timeRange = 'all') => {
    return await supabaseDirectAPI.articles.getPopular(limit);
  },

  // GET /api/articles/search
  search: async (query: string, limit = 10, offset = 0) => {
    return await directAdvancedAlgorithms.advancedBengaliSearch(query, limit, offset);
  },

  // GET /api/articles/:slug
  getBySlug: async (slug: string) => {
    return await supabaseDirectAPI.articles.getBySlug(slug);
  },

  // POST /api/articles/:id/view
  trackView: async (articleId: number) => {
    return await supabaseDirectAPI.articles.trackView(articleId);
  },
};

// Categories API functions
export const categoriesApiDirect = {
  // GET /api/categories
  getAll: async () => {
    return await supabaseDirectAPI.categories.getAll();
  },

  // GET /api/categories/:slug
  getBySlug: async (slug: string) => {
    return await supabaseDirectAPI.categories.getBySlug(slug);
  },
};

// Weather API functions
export const weatherApiDirect = {
  // GET /api/weather
  getAll: async () => {
    return await directWeatherService.getAllWeather();
  },

  // GET /api/weather/ip-location
  getByLocation: async () => {
    const location = await directWeatherService.getLocationFromIP();
    if (location) {
      return await directWeatherService.getWeatherByCity(location.city);
    }
    return null;
  },
};

// Breaking News API functions
export const breakingNewsApiDirect = {
  // GET /api/breaking-news
  getActive: async () => {
    return await supabaseDirectAPI.breakingNews.getActive();
  },
};

// E-Papers API functions
export const epapersApiDirect = {
  // GET /api/epapers
  getAll: async () => {
    return await supabaseDirectAPI.epapers.getAll();
  },

  // GET /api/epapers/latest
  getLatest: async () => {
    return await supabaseDirectAPI.epapers.getLatest();
  },
};

// Videos API functions
export const videosApiDirect = {
  // GET /api/videos
  getAll: async (limit = 10) => {
    return await supabaseDirectAPI.videos.getAll(limit);
  },
};

// Audio Articles API functions
export const audioArticlesApiDirect = {
  // GET /api/audio-articles
  getAll: async (limit = 10) => {
    return await supabaseDirectAPI.audioArticles.getAll(limit);
  },
};

// Trending Topics API functions
export const trendingApiDirect = {
  // GET /api/trending-topics
  getTopics: async (limit = 10) => {
    return await directAdvancedAlgorithms.getTrendingTopics(limit);
  },
};

// Site Settings API functions
export const settingsApiDirect = {
  // GET /api/settings
  getAll: async () => {
    return await supabaseDirectAPI.settings.getAll();
  },
};

// User Bookmarks API functions
export const bookmarksApiDirect = {
  // GET /api/user/:userId/bookmarks
  getUserBookmarks: async (userId: string) => {
    return await supabaseDirectAPI.bookmarks.getUserBookmarks(userId);
  },

  // POST /api/bookmarks
  addBookmark: async (userId: string, articleId: number) => {
    return await supabaseDirectAPI.bookmarks.addBookmark(userId, articleId);
  },

  // DELETE /api/bookmarks/:articleId
  removeBookmark: async (userId: string, articleId: number) => {
    return await supabaseDirectAPI.bookmarks.removeBookmark(userId, articleId);
  },
};

// User Analytics API functions
export const analyticsApiDirect = {
  // GET /api/user/:userId/reading-history
  getReadingHistory: async (userId: string, limit = 20) => {
    return await supabaseDirectAPI.analytics.getUserReadingHistory(userId, limit);
  },

  // GET /api/user/:userId/stats
  getUserStats: async (userId: string) => {
    return await supabaseDirectAPI.analytics.getUserStats(userId);
  },

  // GET /api/user/:userId/analytics
  getUserAnalytics: async (userId: string) => {
    return await directAdvancedAlgorithms.getUserAnalytics(userId);
  },
};

// Personalized Recommendations API functions
export const recommendationsApiDirect = {
  // GET /api/recommendations/:userId
  getPersonalized: async (userId?: string, limit = 10) => {
    return await directAdvancedAlgorithms.getPersonalizedRecommendations(userId, limit);
  },

  // GET /api/recommendations/trending
  getTrending: async (limit = 10) => {
    return await directAdvancedAlgorithms.getTrendingArticles(limit);
  },
};

// Admin API functions
export const adminApiDirect = {
  // GET /api/admin/dashboard
  getDashboardStats: async () => {
    return await supabaseDirectAPI.admin.getDashboardStats();
  },

  // POST /api/admin/articles
  createArticle: async (articleData: any) => {
    return await supabaseDirectAPI.admin.createArticle(articleData);
  },

  // PUT /api/admin/articles/:id
  updateArticle: async (id: number, updates: any) => {
    return await supabaseDirectAPI.admin.updateArticle(id, updates);
  },

  // DELETE /api/admin/articles/:id
  deleteArticle: async (id: number) => {
    return await supabaseDirectAPI.admin.deleteArticle(id);
  },
};

// ========================================
// STATIC QUERY MAP (For offline/fallback support)
// ========================================

export const staticQueryMapDirect: Record<string, () => Promise<any>> = {
  '/api/articles': () => articlesApiDirect.getAll(),
  '/api/articles/latest': () => articlesApiDirect.getLatest(),
  '/api/articles/popular': () => articlesApiDirect.getPopular(),
  '/api/categories': () => categoriesApiDirect.getAll(),
  '/api/breaking-news': () => breakingNewsApiDirect.getActive(),
  '/api/weather': () => weatherApiDirect.getAll(),
  '/api/epapers': () => epapersApiDirect.getAll(),
  '/api/videos': () => videosApiDirect.getAll(),
  '/api/audio-articles': () => audioArticlesApiDirect.getAll(),
  '/api/trending-topics': () => trendingApiDirect.getTopics(),
  '/api/settings': () => settingsApiDirect.getAll(),
};

// ========================================
// QUERY KEYS FACTORY
// ========================================

export const queryKeys = {
  // Articles
  articles: {
    all: ['articles'] as const,
    lists: () => [...queryKeys.articles.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.articles.lists(), { filters }] as const,
    details: () => [...queryKeys.articles.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.articles.details(), slug] as const,
    latest: (limit: number) => [...queryKeys.articles.all, 'latest', limit] as const,
    popular: (limit: number, timeRange: string) => [...queryKeys.articles.all, 'popular', limit, timeRange] as const,
    search: (query: string, limit: number, offset: number) => [...queryKeys.articles.all, 'search', query, limit, offset] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    detail: (slug: string) => [...queryKeys.categories.all, 'detail', slug] as const,
  },

  // Weather
  weather: {
    all: ['weather'] as const,
    location: ['weather', 'location'] as const,
  },

  // Breaking News
  breakingNews: {
    all: ['breaking-news'] as const,
    active: ['breaking-news', 'active'] as const,
  },

  // E-Papers
  epapers: {
    all: ['epapers'] as const,
    latest: ['epapers', 'latest'] as const,
  },

  // Videos
  videos: {
    all: ['videos'] as const,
    list: (limit: number) => [...queryKeys.videos.all, limit] as const,
  },

  // Audio Articles
  audioArticles: {
    all: ['audio-articles'] as const,
    list: (limit: number) => [...queryKeys.audioArticles.all, limit] as const,
  },

  // Trending Topics
  trending: {
    all: ['trending'] as const,
    topics: (limit: number) => [...queryKeys.trending.all, 'topics', limit] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
  },

  // User-specific
  user: {
    all: (userId: string) => ['user', userId] as const,
    bookmarks: (userId: string) => [...queryKeys.user.all(userId), 'bookmarks'] as const,
    readingHistory: (userId: string, limit: number) => [...queryKeys.user.all(userId), 'reading-history', limit] as const,
    stats: (userId: string) => [...queryKeys.user.all(userId), 'stats'] as const,
    analytics: (userId: string) => [...queryKeys.user.all(userId), 'analytics'] as const,
  },

  // Recommendations
  recommendations: {
    all: ['recommendations'] as const,
    personalized: (userId?: string, limit?: number) => [...queryKeys.recommendations.all, 'personalized', userId, limit] as const,
    trending: (limit: number) => [...queryKeys.recommendations.all, 'trending', limit] as const,
  },

  // Admin
  admin: {
    all: ['admin'] as const,
    dashboard: ['admin', 'dashboard'] as const,
  },
};

// ========================================
// CUSTOM QUERY FUNCTIONS
// ========================================

// Generic query function for direct API calls
export const getDirectQueryFn = <T>(apiFunction: () => Promise<T>) => {
  return async (): Promise<T> => {
    try {
      const result = await apiFunction();
      return result;
    } catch (error) {
      console.error('Direct API query error:', error);
      throw error;
    }
  };
};

// Mutation function for direct API calls
export const getDirectMutationFn = <TData, TVariables>(
  apiFunction: (variables: TVariables) => Promise<TData>
) => {
  return async (variables: TVariables): Promise<TData> => {
    try {
      const result = await apiFunction(variables);
      return result;
    } catch (error) {
      console.error('Direct API mutation error:', error);
      throw error;
    }
  };
};

// ========================================
// QUERY INVALIDATION HELPERS
// ========================================

export const invalidateQueries = {
  articles: {
    all: () => directQueryClient.invalidateQueries({ queryKey: queryKeys.articles.all }),
    lists: () => directQueryClient.invalidateQueries({ queryKey: queryKeys.articles.lists() }),
    detail: (slug: string) => directQueryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(slug) }),
  },
  categories: {
    all: () => directQueryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  },
  user: {
    all: (userId: string) => directQueryClient.invalidateQueries({ queryKey: queryKeys.user.all(userId) }),
    bookmarks: (userId: string) => directQueryClient.invalidateQueries({ queryKey: queryKeys.user.bookmarks(userId) }),
  },
};

// ========================================
// EXPORT DEFAULT
// ========================================

export default directQueryClient;