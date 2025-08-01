import { supabase } from './supabase';

/**
 * Enhanced storage service for Vercel deployment
 * Handles user data storage using Supabase only (no localStorage)
 */

export interface StorageItem {
  id?: number;
  user_id: string;
  storage_key: string;
  storage_value: any;
  created_at?: string;
  updated_at?: string;
}

class EnhancedStorage {
  private currentUserId: string | null = null;

  constructor() {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.currentUserId = session?.user?.id || null;
    });
  }

  /**
   * Store data for authenticated user in Supabase
   */
  async setItem(key: string, value: any): Promise<void> {
    if (!this.currentUserId) {
      console.warn('No authenticated user - storage operation skipped');
      return;
    }

    // Skip storage operations for admin pages to avoid permission conflicts
    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
      console.log('Admin page detected - skipping user storage operation');
      return;
    }

    try {
      const { error } = await supabase.rpc('upsert_user_storage', {
        p_user_id: this.currentUserId,
        p_storage_key: key,
        p_storage_value: JSON.stringify(value)
      });

      if (error) {
        console.warn('Error storing data in Supabase (non-critical):', error.message);
        // Don't throw error - make it non-blocking
        return;
      }
    } catch (err) {
      console.warn('Storage setItem failed (non-critical):', err);
      // Don't throw error - make it non-blocking  
      return;
    }
  }

  /**
   * Retrieve data for authenticated user from Supabase
   */
  async getItem(key: string): Promise<any | null> {
    if (!this.currentUserId) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_storage')
        .select('storage_value')
        .eq('user_id', this.currentUserId)
        .eq('storage_key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return null;
        }
        console.error('Error retrieving data from Supabase:', error);
        return null;
      }

      return data ? JSON.parse(data.storage_value) : null;
    } catch (err) {
      console.error('Storage getItem failed:', err);
      return null;
    }
  }

  /**
   * Remove data for authenticated user from Supabase
   */
  async removeItem(key: string): Promise<void> {
    if (!this.currentUserId) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_storage')
        .delete()
        .eq('user_id', this.currentUserId)
        .eq('storage_key', key);

      if (error) {
        console.error('Error removing data from Supabase:', error);
        throw error;
      }
    } catch (err) {
      console.error('Storage removeItem failed:', err);
      throw err;
    }
  }

  /**
   * Get all storage keys for authenticated user
   */
  async getAllKeys(): Promise<string[]> {
    if (!this.currentUserId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_storage')
        .select('storage_key')
        .eq('user_id', this.currentUserId);

      if (error) {
        console.error('Error getting storage keys:', error);
        return [];
      }

      return data?.map(item => item.storage_key) || [];
    } catch (err) {
      console.error('Storage getAllKeys failed:', err);
      return [];
    }
  }

  /**
   * Clear all storage for authenticated user
   */
  async clear(): Promise<void> {
    if (!this.currentUserId) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_storage')
        .delete()
        .eq('user_id', this.currentUserId);

      if (error) {
        console.error('Error clearing storage:', error);
        throw error;
      }
    } catch (err) {
      console.error('Storage clear failed:', err);
      throw err;
    }
  }
}

// Export singleton instance
export const enhancedStorage = new EnhancedStorage();

/**
 * Reading history service using Supabase
 */
export class ReadingHistoryService {
  /**
   * Track article reading for authenticated user
   */
  static async trackReading(articleId: number, readingProgress: number = 0): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user - reading tracking skipped');
        return;
      }

      const { error } = await supabase.rpc('track_reading_history', {
        p_user_id: user.id,
        p_article_id: articleId,
        p_reading_progress: readingProgress
      });

      if (error) {
        console.error('Error tracking reading history:', error);
      }
    } catch (err) {
      console.error('Reading tracking failed:', err);
    }
  }

  /**
   * Get reading history for authenticated user
   */
  static async getReadingHistory(limit: number = 10): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_reading_history')
        .select(`
          article_id,
          last_read_at,
          reading_progress,
          articles (
            id,
            title,
            slug,
            excerpt,
            image_url,
            view_count,
            published_at,
            is_featured,
            category_id,
            categories (
              id,
              name,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching reading history:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Reading history fetch failed:', err);
      return [];
    }
  }
}