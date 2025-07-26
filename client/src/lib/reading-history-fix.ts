// Reading History Fix for Database Relationship Errors
// Handles the "Could not find relationship" error properly

import { supabase } from './supabase';

export async function getUserReadingHistoryFixed(userId: string) {
  console.log(`[getUserReadingHistory] Fetching reading history for user: ${userId}`);
  
  try {
    // Method 1: Try direct query first
    const { data: historyData, error: historyError } = await supabase
      .from('reading_history')
      .select('article_id, last_read_at')
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.log('Reading history table not accessible, returning empty array');
      return [];
    }

    if (!historyData?.length) {
      console.log('No reading history found for user:', userId);
      return [];
    }

    // Method 2: Get articles separately to avoid relationship issues
    const articleIds = historyData.map(h => h.article_id);
    const { data: articlesData, error: articlesError } = await supabase
      .from('articles')
      .select(`
        id, title, slug, excerpt, image_url, view_count, published_at, is_featured,
        categories(id, name, slug)
      `)
      .in('id', articleIds);

    if (articlesError) {
      console.error('Error fetching articles for reading history:', articlesError);
      return [];
    }

    // Combine the data manually
    const combinedData = historyData.map(h => {
      const article = articlesData?.find(a => a.id === h.article_id);
      return article ? { ...article, last_read_at: h.last_read_at } : null;
    }).filter(Boolean);

    return combinedData || [];
  } catch (error) {
    console.error('Reading history fetch error:', error);
    return [];
  }
}
