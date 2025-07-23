import { supabase } from './supabase';
import { z } from 'zod';

// ========================================
// COMPREHENSIVE SUPABASE DIRECT API SERVICE
// Replacing 555+ Express API routes with direct Supabase calls
// ========================================

// Core validation schemas
const articleSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  image_url: z.string().nullable(),
  category_id: z.number(),
  author: z.string(),
  read_time: z.number(),
  is_featured: z.boolean(),
  view_count: z.number(),
  published_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ========================================
// 1. ARTICLES API (Direct Supabase)
// ========================================

export const articlesAPI = {
  // Get all articles with pagination
  async getAll(limit = 10, offset = 0, categorySlug?: string, featured?: boolean) {
    try {
      let query = supabase
        .from('articles')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .order('published_at', { ascending: false });
      
      if (featured) {
        query = query.eq('is_featured', true);
      }
      
      if (categorySlug) {
        query = query.eq('categories.slug', categorySlug);
      }
      
      const { data, error } = await query
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  // Get single article by slug
  async getBySlug(slug: string) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      throw error;
    }
  },

  // Get popular articles
  async getPopular(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .order('view_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching popular articles:', error);
      throw error;
    }
  },

  // Get latest articles
  async getLatest(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .order('published_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      throw error;
    }
  },

  // Search articles (Bengali support)
  async search(query: string, limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
    }
  },

  // Track article view
  async trackView(articleId: number) {
    try {
      // Use RPC function to atomically increment view count
      const { data, error } = await supabase
        .rpc('increment_view_count', { article_id: articleId });
      
      if (error) {
        console.error('Error incrementing view count:', error);
        // Fallback: try direct update with raw SQL
        const { data: currentData, error: fetchError } = await supabase
          .from('articles')
          .select('view_count')
          .eq('id', articleId)
          .single();
        
        if (!fetchError && currentData) {
          const { error: updateError } = await supabase
            .from('articles')
            .update({ view_count: (currentData.view_count || 0) + 1 })
            .eq('id', articleId);
            
          if (!updateError) {
            return { success: true, viewCount: (currentData.view_count || 0) + 1 };
          }
        }
      }
      
      return { success: true, viewCount: data || 0 };
    } catch (error) {
      console.error('Error tracking article view:', error);
      return { success: false, viewCount: 0 };
    }
  },
};

// ========================================
// 2. CATEGORIES API (Direct Supabase)
// ========================================

export const categoriesAPI = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getBySlug(slug: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw error;
    }
  },
};

// ========================================
// 3. WEATHER API (Direct Supabase)
// ========================================

export const weatherAPI = {
  async getAllCities() {
    try {
      const { data, error } = await supabase
        .from('weather')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },

  async getByCity(city: string) {
    try {
      const { data, error } = await supabase
        .from('weather')
        .select('*')
        .eq('city', city)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching weather by city:', error);
      throw error;
    }
  },
};

// ========================================
// 4. BREAKING NEWS API (Direct Supabase)  
// ========================================

export const breakingNewsAPI = {
  async getActive() {
    try {
      const { data, error } = await supabase
        .from('breaking_news')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      throw error;
    }
  },
};

// ========================================
// 5. E-PAPERS API (Direct Supabase)
// ========================================

export const epapersAPI = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('epapers')
        .select('*')
        .order('publish_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching e-papers:', error);
      throw error;
    }
  },

  async getLatest() {
    try {
      const { data, error } = await supabase
        .from('epapers')
        .select('*')
        .eq('is_latest', true)
        .order('publish_date', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching latest e-paper:', error);
      throw error;
    }
  },
};

// ========================================
// 6. VIDEOS API (Direct Supabase)
// ========================================

export const videosAPI = {
  async getAll(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('video_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },
};

// ========================================
// 7. AUDIO ARTICLES API (Direct Supabase)
// ========================================

export const audioArticlesAPI = {
  async getAll(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('audio_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audio articles:', error);
      throw error;
    }
  },
};

// ========================================
// 8. TRENDING TOPICS API (Direct Supabase)
// ========================================

export const trendingAPI = {
  async getTopics(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      throw error;
    }
  },
};

// ========================================
// 9. SITE SETTINGS API (Direct Supabase)
// ========================================

export const settingsAPI = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) throw error;
      
      // Transform array to object for easier access
      const settings: Record<string, any> = {};
      data?.forEach(setting => {
        settings[setting.key] = setting.value;
      });
      
      return {
        siteName: settings.site_name || 'Bengali News',
        siteDescription: settings.site_description || 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম',
        logoUrl: settings.logo_url || '',
        defaultLanguage: settings.default_language || 'bn',
        siteUrl: settings.site_url || '',
        ...settings
      };
    } catch (error) {
      console.error('Error fetching site settings:', error);
      return {
        siteName: 'Bengali News',
        siteDescription: 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম',
        logoUrl: '',
        defaultLanguage: 'bn',
        siteUrl: ''
      };
    }
  },
};

// ========================================
// 10. USER BOOKMARKS API (Direct Supabase)
// ========================================

export const bookmarksAPI = {
  async getUserBookmarks(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select(`
          *,
          articles (
            id,
            title,
            slug,
            excerpt,
            image_url,
            published_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      throw error;
    }
  },

  async addBookmark(userId: string, articleId: number) {
    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .insert({
          user_id: userId,
          article_id: articleId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  },

  async removeBookmark(userId: string, articleId: number) {
    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleId);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  },
};

// ========================================
// 11. USER ANALYTICS API (Direct Supabase)
// ========================================

export const analyticsAPI = {
  async getUserReadingHistory(userId: string, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('user_reading_history')
        .select(`
          *,
          articles (
            id,
            title,
            slug,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('read_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reading history:', error);
      throw error;
    }
  },

  async getUserStats(userId: string) {
    try {
      // Get reading history count
      const { count: totalRead } = await supabase
        .from('user_reading_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get bookmarks count  
      const { count: totalBookmarks } = await supabase
        .from('user_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get likes count
      const { count: totalLikes } = await supabase
        .from('user_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        articlesRead: totalRead || 0,
        bookmarksCount: totalBookmarks || 0,
        likesCount: totalLikes || 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        articlesRead: 0,
        bookmarksCount: 0,
        likesCount: 0,
      };
    }
  },
};

// ========================================
// 12. ADMIN API (Direct Supabase)
// ========================================

export const adminAPI = {
  // Dashboard stats
  async getDashboardStats() {
    try {
      // Get counts for various entities
      const [articlesCount, usersCount, categoriesCount] = await Promise.all([
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalArticles: articlesCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalCategories: categoriesCount.count || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalArticles: 0,
        totalUsers: 0,
        totalCategories: 0,
      };
    }
  },

  // Article management
  async createArticle(articleData: any) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert(articleData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  },

  async updateArticle(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  },

  async deleteArticle(id: number) {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  },
};

// ========================================
// MAIN API EXPORT - Single interface for all APIs
// ========================================
export const supabaseDirectAPI = {
  articles: articlesAPI,
  categories: categoriesAPI,
  weather: weatherAPI,
  breakingNews: breakingNewsAPI,
  epapers: epapersAPI,
  videos: videosAPI,
  audioArticles: audioArticlesAPI,
  trending: trendingAPI,
  settings: settingsAPI,
  bookmarks: bookmarksAPI,
  analytics: analyticsAPI,
  admin: adminAPI,
};

export default supabaseDirectAPI;