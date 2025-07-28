/**
 * Vercel-Safe Storage Service
 * Handles localStorage operations safely for Vercel deployment
 * Prevents JSON parsing errors and storage conflicts
 */

import { supabase } from './supabase';

// =======================================================
// SAFE LOCALSTORAGE OPERATIONS
// =======================================================

export function safeGetLocalStorage(key: string): any | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    // Handle non-JSON strings
    if (item.startsWith('"') && item.endsWith('"')) {
      return item.slice(1, -1); // Remove quotes for plain strings
    }
    
    return JSON.parse(item);
  } catch (error) {
    console.warn(`[Storage] Failed to parse localStorage item '${key}':`, error);
    // Remove corrupted item
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Storage] Failed to remove corrupted item '${key}':`, e);
    }
    return null;
  }
}

export function safeSetLocalStorage(key: string, value: any): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`[Storage] Failed to set localStorage item '${key}':`, error);
    return false;
  }
}

export function safeRemoveLocalStorage(key: string): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[Storage] Failed to remove localStorage item '${key}':`, error);
    return false;
  }
}

// =======================================================
// USER STORAGE WITH SUPABASE BACKUP
// =======================================================

export async function getUserStorage(userId: string, storageKey: string): Promise<any | null> {
  try {
    // Try localStorage first for performance
    const localValue = safeGetLocalStorage(`user_${userId}_${storageKey}`);
    if (localValue !== null) return localValue;
    
    // Fallback to Supabase user_settings table
    const { data, error } = await supabase
      .from('user_settings')
      .select('setting_value')
      .eq('user_id', userId)
      .eq('setting_key', storageKey)
      .single();
    
    if (error) {
      console.warn(`[UserStorage] No Supabase data for ${storageKey}:`, error);
      return null;
    }
    
    return data?.setting_value || null;
  } catch (error) {
    console.error(`[UserStorage] Error getting ${storageKey}:`, error);
    return null;
  }
}

export async function setUserStorage(userId: string, storageKey: string, value: any): Promise<boolean> {
  try {
    // Save to localStorage immediately
    safeSetLocalStorage(`user_${userId}_${storageKey}`, value);
    
    // Also save to Supabase for persistence
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        setting_key: storageKey,
        setting_value: value,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.warn(`[UserStorage] Failed to save to Supabase:`, error);
      return false; // localStorage saved, but Supabase failed
    }
    
    return true;
  } catch (error) {
    console.error(`[UserStorage] Error setting ${storageKey}:`, error);
    return false;
  }
}

// =======================================================
// READING HISTORY SAFE OPERATIONS
// =======================================================

export async function addToReadingHistory(userId: string, articleId: number): Promise<boolean> {
  try {
    // Use fallback to user_bookmarks if reading_history table doesn't exist
    const { error } = await supabase
      .from('user_bookmarks')
      .upsert({
        user_id: userId,
        article_id: articleId,
        created_at: new Date().toISOString(),
        bookmark_type: 'read' // Use bookmark_type to distinguish from actual bookmarks
      });
    
    if (error) {
      console.warn('[ReadingHistory] Failed to save reading history:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[ReadingHistory] Error adding to reading history:', error);
    return false;
  }
}

export async function getReadingHistory(userId: string): Promise<any[]> {
  try {
    // Try reading_history table first
    const { data: historyData, error: historyError } = await supabase
      .from('reading_history')
      .select(`
        article_id, created_at,
        articles(id, title, slug, excerpt, image_url, published_at, categories(name, slug))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!historyError && historyData) {
      return historyData;
    }
    
    // Fallback to user_bookmarks with 'read' type
    const { data: bookmarkData, error: bookmarkError } = await supabase
      .from('user_bookmarks')
      .select(`
        article_id, created_at,
        articles(id, title, slug, excerpt, image_url, published_at, categories(name, slug))
      `)
      .eq('user_id', userId)
      .eq('bookmark_type', 'read')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (bookmarkError) {
      console.warn('[ReadingHistory] Both reading_history and user_bookmarks failed:', bookmarkError);
      return [];
    }
    
    return bookmarkData || [];
  } catch (error) {
    console.error('[ReadingHistory] Error fetching reading history:', error);
    return [];
  }
}

// =======================================================
// WEATHER DATA SAFE OPERATIONS
// =======================================================

export async function getWeatherSafely(city?: string): Promise<any | null> {
  try {
    let query = supabase
      .from('weather')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (city) {
      query = query.eq('city', city);
    }
    
    const { data, error } = await query.limit(1).single();
    
    if (error) {
      console.warn('[Weather] Weather data not available:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[Weather] Error fetching weather:', error);
    return null;
  }
}