// Direct Supabase API calls to replace Express endpoints
import { supabase } from './supabase';

// Type definitions
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt: string;
  image_url: string;
  imageUrl?: string;
  view_count: number;
  viewCount?: number;
  published_at: string;
  publishedAt?: string;
  is_featured: boolean;
  isFeatured?: boolean;
  category_id: number;
  categoryId?: number;
  categories?: Category | Category[];
  category?: Category;
}

interface BreakingNews {
  id: number;
  content: string;
  is_active: boolean;
  created_at: string;
}

interface EPaper {
  id: number;
  title: string;
  pdf_url: string;
  thumbnail_url: string;
  published_at: string;
}

interface Weather {
  id: number;
  city: string;
  temperature: number;
  description: string;
  updated_at: string;
}

// Categories API
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data || [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }
  
  return data;
}

// Articles API
export async function getArticles(params: {
  limit?: number;
  offset?: number;
  category?: string;
  featured?: boolean;
} = {}): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      image_url,
      view_count,
      published_at,
      is_featured,
      category_id,
      categories(id, name, slug)
    `)
    .order('published_at', { ascending: false });

  if (params.featured) {
    query = query.eq('is_featured', true);
  }

  if (params.category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single();
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id);
    }
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data || [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      image_url,
      view_count,
      published_at,
      is_featured,
      category_id,
      categories(id, name, slug)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }

  return data;
}

export async function getPopularArticles(limit = 5): Promise<Article[]> {
  try {
    console.log(`[Supabase] Attempting to fetch ${limit} popular articles...`);
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        image_url,
        view_count,
        published_at,
        is_featured,
        category_id,
        categories(id, name, slug)
      `)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Supabase] Error fetching popular articles:', error);
      console.error('[Supabase] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return [];
    }

    console.log(`[Supabase] Successfully fetched ${data?.length || 0} articles`);
    
    if (!data || data.length === 0) {
      console.warn('[Supabase] No articles found in database');
      return [];
    }

    // Transform data to include both naming conventions
    const transformedData = data.map((article: any) => ({
      ...article,
      imageUrl: article.image_url,
      viewCount: article.view_count,
      publishedAt: article.published_at,
      isFeatured: article.is_featured,
      categoryId: article.category_id,
      category: Array.isArray(article.categories) ? article.categories[0] : article.categories
    }));

    console.log(`[Supabase] Transformed data sample:`, transformedData[0]);
    return transformedData;
  } catch (err) {
    console.error('[Supabase] Failed to fetch popular articles - unexpected error:', err);
    return [];
  }
}

export async function getLatestArticles(limit = 10): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        image_url,
        view_count,
        published_at,
        is_featured,
        category_id,
        categories(id, name, slug)
      `)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching latest articles from Supabase:', error);
      return [];
    }

    // Transform data to include both naming conventions
    return (data || []).map((article: any) => ({
      ...article,
      imageUrl: article.image_url,
      viewCount: article.view_count,
      publishedAt: article.published_at,
      isFeatured: article.is_featured,
      categoryId: article.category_id,
      category: Array.isArray(article.categories) ? article.categories[0] : article.categories
    }));
  } catch (err) {
    console.error('Failed to fetch latest articles:', err);
    return [];
  }
}

export async function getFeaturedArticles(limit = 5): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      image_url,
      view_count,
      published_at,
      is_featured,
      category_id,
      categories(id, name, slug)
    `)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }

  return data || [];
}

// Weather API
export async function getWeather(): Promise<Weather[]> {
  const { data, error } = await supabase
    .from('weather')
    .select('*')
    .order('city', { ascending: true });
  
  if (error) {
    console.error('Error fetching weather:', error);
    return [];
  }
  
  return data || [];
}

export async function getWeatherByCity(city: string): Promise<Weather | null> {
  const { data, error } = await supabase
    .from('weather')
    .select('*')
    .eq('city', city)
    .single();
  
  if (error) {
    console.error('Error fetching weather by city:', error);
    return null;
  }
  
  return data;
}

// Breaking News API
export async function getBreakingNews(): Promise<BreakingNews[]> {
  try {
    const { data, error } = await supabase
      .from('breaking_news')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching breaking news from Supabase:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Failed to fetch breaking news:', err);
    return [];
  }
}

// E-Papers API
export async function getEPapers(): Promise<EPaper[]> {
  const { data, error } = await supabase
    .from('epapers')
    .select('*')
    .order('publish_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching e-papers:', error);
    return [];
  }
  
  return data || [];
}

export async function getLatestEPaper(): Promise<EPaper | null> {
  try {
    // First try to get e-papers marked as latest, order by publish_date descending
    const { data, error } = await supabase
      .from('epapers')
      .select('*')
      .eq('is_latest', true)
      .order('publish_date', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching latest e-paper (is_latest=true):', error);
      
      // Fallback: get the most recent e-paper by publish_date
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('epapers')
        .select('*')
        .order('publish_date', { ascending: false })
        .limit(1);
      
      if (fallbackError) {
        console.error('Error fetching fallback latest e-paper:', fallbackError);
        return null;
      }
      
      return fallbackData?.[0] || null;
    }
    
    return data?.[0] || null;
  } catch (err) {
    console.error('Error in getLatestEPaper:', err);
    return null;
  }
}

// Video Content API
export async function getVideoContent(): Promise<any[]> {
  const { data, error } = await supabase
    .from('video_content')
    .select('*')
    .order('published_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching video content:', error);
    return [];
  }
  
  return data || [];
}

export async function getVideoBySlug(slug: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('video_content')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching video by slug:', error);
    return null;
  }
  
  return data;
}

// Audio Articles API
export async function getAudioArticles(): Promise<any[]> {
  const { data, error } = await supabase
    .from('audio_articles')
    .select('*')
    .order('published_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching audio articles:', error);
    return [];
  }
  
  return data || [];
}

// Social Media API
export async function getSocialMediaPosts(): Promise<any[]> {
  const { data, error } = await supabase
    .from('social_media_posts')
    .select('*')
    .order('published_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching social media posts:', error);
    return [];
  }
  
  return data || [];
}

// Trending Topics API
export async function getTrendingTopics(): Promise<any[]> {
  const { data, error } = await supabase
    .from('trending_topics')
    .select('*')
    .order('trending_score', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error fetching trending topics:', error);
    return [];
  }
  
  return data || [];
}

// Search API
export async function searchArticles(query: string, limit = 20): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      image_url,
      view_count,
      published_at,
      is_featured,
      category_id,
      categories(id, name, slug)
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching articles:', error);
    return [];
  }

  return data || [];
}

// View tracking
export async function incrementViewCount(articleId: number): Promise<{ viewCount: number } | null> {
  try {
    // Get current view count
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('view_count')
      .eq('id', articleId)
      .single();

    if (fetchError) {
      console.error('Error fetching article for view count:', fetchError);
      return null;
    }

    const newViewCount = (article?.view_count || 0) + 1;

    // Update view count
    const { error: updateError } = await supabase
      .from('articles')
      .update({ view_count: newViewCount })
      .eq('id', articleId);

    if (updateError) {
      console.error('Error updating view count:', updateError);
      return null;
    }

    return { viewCount: newViewCount };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return null;
  }
}

// Site settings (fallback data)
export async function getSiteSettings() {
  // Since site_settings table doesn't exist, return fallback data
  return {
    siteName: "Emon's Daily News",
    siteDescription: "বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র",
    logoUrl: "",
    defaultLanguage: "bn",
    siteUrl: "https://emonsdaily.com"
  };
}

// Article Tags API
export async function getArticleTags(articleId: number): Promise<any[]> {
  const { data, error } = await supabase
    .from('article_tags')
    .select(`
      tags(id, name, slug, color)
    `)
    .eq('article_id', articleId);
  
  if (error) {
    console.error('Error fetching article tags:', error);
    return [];
  }
  
  return data?.map(item => item.tags).filter(Boolean) || [];
}

// User Like Status API
export async function getUserLikeStatus(articleId: number, userId: string): Promise<{ isLiked: boolean; likeCount: number }> {
  try {
    // Check if user has liked this article
    const { data: userLike, error: likeError } = await supabase
      .from('user_likes')
      .select('id')
      .eq('content_id', articleId)
      .eq('content_type', 'article')
      .eq('user_id', userId)
      .single();

    // Get total like count for this article
    const { count, error: countError } = await supabase
      .from('user_likes')
      .select('*', { count: 'exact' })
      .eq('content_id', articleId)
      .eq('content_type', 'article');

    if (likeError && likeError.code !== 'PGRST116') {
      console.error('Error checking like status:', likeError);
    }

    if (countError) {
      console.error('Error counting likes:', countError);
    }

    return {
      isLiked: !!userLike,
      likeCount: count || 0
    };
  } catch (error) {
    console.error('Error getting user like status:', error);
    return { isLiked: false, likeCount: 0 };
  }
}

// Toggle Article Like API
export async function toggleArticleLike(articleId: number, userId: string, shouldLike: boolean): Promise<{ success: boolean; alreadyExists?: boolean }> {
  try {
    if (shouldLike) {
      // Add like
      const { error } = await supabase
        .from('user_likes')
        .insert({
          user_id: userId,
          content_id: articleId,
          content_type: 'article'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { success: true, alreadyExists: true };
        }
        throw error;
      }
    } else {
      // Remove like
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', userId)
        .eq('content_id', articleId)
        .eq('content_type', 'article');

      if (error) {
        throw error;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error toggling article like:', error);
    throw error;
  }
}

// Toggle Bookmark API
export async function toggleBookmark(articleId: number, userId: string, shouldBookmark: boolean): Promise<{ success: boolean; alreadyExists?: boolean }> {
  try {
    if (shouldBookmark) {
      // Add bookmark
      const { error } = await supabase
        .from('user_bookmarks')
        .insert({
          user_id: userId,
          article_id: articleId,
          folder_name: 'default'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { success: true, alreadyExists: true };
        }
        throw error;
      }
    } else {
      // Remove bookmark
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleId);

      if (error) {
        throw error;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
}

// Newsletter Subscription API
export async function subscribeToNewsletter(email: string, preferences: any): Promise<{ success: boolean; alreadyExists?: boolean }> {
  try {
    const { error } = await supabase
      .from('newsletters')
      .insert({
        email,
        preferences,
        is_active: true
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return { success: true, alreadyExists: true };
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
}

// Comments API
export async function getArticleComments(articleId: number): Promise<any[]> {
  const { data, error } = await supabase
    .from('article_comments')
    .select('*')
    .eq('article_id', articleId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching article comments:', error);
    return [];
  }
  
  return data || [];
}

export async function addComment(articleId: number, userId: string, content: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('article_comments')
      .insert({
        article_id: articleId,
        user_id: userId,
        content,
        is_approved: false // Comments need approval
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

// Share tracking API
export async function trackArticleShare(articleId: number, userId: string, platform: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('user_interactions')
      .insert({
        user_id: userId,
        article_id: articleId,
        interaction_type: 'share',
        metadata: { platform }
      });

    if (error) {
      console.error('Error tracking share, ignoring:', error);
      // Don't throw error for tracking - it's not critical
    }

    return { success: true };
  } catch (error) {
    console.error('Error tracking article share:', error);
    return { success: true }; // Don't fail for tracking issues
  }
}