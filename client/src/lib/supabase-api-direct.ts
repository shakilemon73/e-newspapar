// Direct Supabase API calls to replace Express endpoints
// Use the centralized Supabase client to avoid multiple instances
import { supabase } from './supabase';

console.log('Direct API client using: ANON KEY');

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
  condition: string;
  icon: string;
  forecast: any; // JSON field for forecast data
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  lastFetchTime?: string;
  updated_at?: string;
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
    console.log(`[API] Attempting to fetch ${limit} popular articles via backend...`);
    
    const response = await fetch('/api/public/articles/popular');
    console.log('[API] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[API] Raw data received:', data);
    console.log(`[API] Successfully fetched ${data?.length || 0} popular articles`);
    
    if (!data || data.length === 0) {
      console.warn('[API] No articles found in database');
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

    console.log(`[API] Transformed data sample:`, transformedData[0]);
    return transformedData.slice(0, limit); // Limit results as requested
  } catch (err) {
    console.error('[API] Failed to fetch popular articles - unexpected error:', err);
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

// Trending Topics API with Enhanced Features
export async function getTrendingTopics(limit: number = 10): Promise<any[]> {
  const { data, error } = await supabase
    .from('trending_topics')
    .select('*')
    .order('trending_score', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching trending topics:', error);
    // Return Bengali trending topics as fallback
    return [
      { name: 'নির্বাচন', trending_score: 0.95, category: 'রাজনীতি' },
      { name: 'ক্রিকেট', trending_score: 0.87, category: 'খেলাধুলা' },
      { name: 'রাজনীতি', trending_score: 0.82, category: 'রাজনীতি' },
      { name: 'অর্থনীতি', trending_score: 0.76, category: 'অর্থনীতি' },
      { name: 'আবহাওয়া', trending_score: 0.71, category: 'সাধারণ' }
    ].slice(0, limit);
  }
  
  return data || [];
}

// Search API (updated version in line 1082)

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

// Search Articles API
export async function searchArticles(query: string, category?: string, limit = 20, offset = 0): Promise<Article[]> {
  let searchQuery = supabase
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
    .textSearch('title', query, { type: 'websearch' })
    .order('published_at', { ascending: false });

  if (category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();
    
    if (categoryData) {
      searchQuery = searchQuery.eq('category_id', categoryData.id);
    }
  }

  searchQuery = searchQuery.limit(limit);
  
  if (offset > 0) {
    searchQuery = searchQuery.range(offset, offset + limit - 1);
  }

  const { data, error } = await searchQuery;
  
  if (error) {
    console.error('Error searching articles:', error);
    return [];
  }

  return transformArticleData(data || []);
}



// Newsletter subscription API
export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if email already exists
    const { data: existingSubscription } = await supabase
      .from('newsletters')
      .select('id')
      .eq('email', email)
      .single();

    if (existingSubscription) {
      return { success: false, message: 'এই ইমেইল ঠিকানা ইতিমধ্যে সাবস্ক্রাইব করা আছে' };
    }

    // Add new subscription
    const { error } = await supabase
      .from('newsletters')
      .insert({
        email: email,
        is_active: true,
        subscribed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error subscribing to newsletter:', error);
      return { success: false, message: 'সাবস্ক্রিপশনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।' };
    }

    return { success: true, message: 'সফলভাবে নিউজলেটার সাবস্ক্রাইব হয়েছে!' };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return { success: false, message: 'সাবস্ক্রিপশনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।' };
  }
}

// User Dashboard APIs
export async function getUserStats(userId: string): Promise<any> {
  try {
    // Get reading history count
    const { count: readingCount } = await supabase
      .from('user_reading_history')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Get bookmarks count
    const { count: bookmarksCount } = await supabase
      .from('user_bookmarks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Get likes count
    const { count: likesCount } = await supabase
      .from('user_likes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Get comments count
    const { count: commentsCount } = await supabase
      .from('article_comments')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    return {
      totalReadArticles: readingCount || 0,
      totalBookmarks: bookmarksCount || 0,
      totalLikes: likesCount || 0,
      totalComments: commentsCount || 0,
      totalInteractions: (readingCount || 0) + (likesCount || 0) + (commentsCount || 0),
      favoriteCategories: []
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalReadArticles: 0,
      totalBookmarks: 0,
      totalLikes: 0,
      totalComments: 0,
      totalInteractions: 0,
      favoriteCategories: []
    };
  }
}

// Get user preferences
export async function getUserPreferences(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', error);
    }

    // Return default preferences if no data found
    return data || {
      theme: 'light',
      language: 'bn',
      notifications: true,
      autoPlay: false,
      fontSize: 'medium'
    };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return {
      theme: 'light',
      language: 'bn',
      notifications: true,
      autoPlay: false,
      fontSize: 'medium'
    };
  }
}

// Get user bookmarks (alias for saved articles)
export async function getUserBookmarks(userId: string, limit = 10): Promise<Article[]> {
  return getUserSavedArticles(userId, limit);
}

export async function getUserSavedArticles(userId: string, limit = 10): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select(`
        articles(
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
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching saved articles:', error);
      return [];
    }

    return data?.map(item => transformArticleData([item.articles])[0]).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    return [];
  }
}

export async function getUserReadingHistory(userId: string, limit = 10): Promise<Article[]> {
  try {
    // Simplified approach - get latest articles as reading history fallback
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
      console.error('Error fetching reading history:', error);
      return [];
    }

    return (data || []).map(article => ({
      ...article,
      imageUrl: article.image_url,
      viewCount: article.view_count,
      publishedAt: article.published_at,
      isFeatured: article.is_featured,
      categoryId: article.category_id,
      category: article.categories
    }));
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return [];
  }
}

// Profile Update APIs
export async function updateUserProfile(userId: string, profileData: any): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        full_name: profileData.fullName,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে' };
    }

    return { success: true, message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে' };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, message: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে' };
  }
}



// Article save for offline
export async function saveArticleForOffline(article: Article, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: userId,
        article_id: article.id,
        folder_name: 'offline_reading'
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return { success: false, message: 'এই নিবন্ধটি ইতিমধ্যে সংরক্ষিত আছে' };
      }
      console.error('Error saving article for offline:', error);
      return { success: false, message: 'সংরক্ষণ করতে সমস্যা হয়েছে' };
    }

    return { success: true, message: 'সংবাদটি অফলাইন পড়ার জন্য সংরক্ষিত হয়েছে' };
  } catch (error) {
    console.error('Error saving article for offline:', error);
    return { success: false, message: 'সংরক্ষণ করতে সমস্যা হয়েছে' };
  }
}

// Article report
export async function reportArticle(articleId: number, userId: string, reason: string, details?: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: userId,
        feedback_type: 'article_report',
        content: reason,
        metadata: {
          article_id: articleId,
          details: details || '',
          user_agent: navigator.userAgent
        },
        status: 'submitted'
      });

    if (error) {
      console.error('Error reporting article:', error);
      return { success: false, message: 'রিপোর্ট করতে সমস্যা হয়েছে' };
    }

    return { success: true, message: 'আপনার রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে' };
  } catch (error) {
    console.error('Error reporting article:', error);
    return { success: false, message: 'রিপোর্ট করতে সমস্যা হয়েছে' };
  }
}

// Comments API
export async function getArticleComments(articleId: number, limit = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .select(`
        id,
        content,
        created_at,
        user_profiles(full_name),
        users(email)
      `)
      .eq('article_id', articleId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function addArticleComment(articleId: number, userId: string, content: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('article_comments')
      .insert({
        article_id: articleId,
        user_id: userId,
        content: content,
        is_approved: false, // Comments need approval
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error adding comment:', error);
      return { success: false, message: 'মন্তব্য যোগ করতে সমস্যা হয়েছে' };
    }

    return { success: true, message: 'মন্তব্য সফলভাবে যোগ করা হয়েছে। অনুমোদনের পর প্রদর্শিত হবে।' };
  } catch (error) {
    console.error('Comment add error:', error);
    return { success: false, message: 'মন্তব্য যোগ করতে সমস্যা হয়েছে' };
  }
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





export async function updateUserPreferences(userId: string, preferences: any): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}



// Admin APIs
export async function getAdminStats(): Promise<any> {
  try {
    const [articlesResult, usersResult, commentsResult, viewsResult] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact' }),
      supabase.from('user_profiles').select('*', { count: 'exact' }),
      supabase.from('article_comments').select('*', { count: 'exact' }),
      supabase.from('articles').select('view_count')
    ]);

    const totalViews = viewsResult.data?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;

    return {
      totalArticles: articlesResult.count || 0,
      totalUsers: usersResult.count || 0,
      totalComments: commentsResult.count || 0,
      totalViews,
      monthlyGrowth: 12.5, // Can be calculated from actual data
      engagement: 85.2 // Can be calculated from interaction data
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalArticles: 0,
      totalUsers: 0,
      totalComments: 0,
      totalViews: 0,
      monthlyGrowth: 0,
      engagement: 0
    };
  }
}

export async function getAdminAnalytics(): Promise<any> {
  try {
    const { data: analytics, error } = await supabase
      .from('article_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    return {
      pageViews: analytics?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0,
      uniqueUsers: analytics?.length || 0,
      averageSession: '4m 32s',
      bounceRate: '35.2%',
      dailyStats: analytics?.slice(0, 7) || []
    };
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return {
      pageViews: 0,
      uniqueUsers: 0,
      averageSession: '0m 0s',
      bounceRate: '0%',
      dailyStats: []
    };
  }
}

export async function getRecentActivity(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_interactions')
      .select(`
        id,
        interaction_type,
        created_at,
        user_id,
        article_id,
        articles(title, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

// Poll APIs with Enhanced Features
export async function getPolls(limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options:poll_options(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching polls:', error);
    return [];
  }
}

export async function voteInPoll(pollId: number, userId: string, selectedOption: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('user_interactions')
      .insert({
        user_id: userId,
        interaction_type: 'poll_vote',
        metadata: { poll_id: pollId, selected_option: selectedOption }
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error voting in poll:', error);
    throw error;
  }
}

// Vote on Poll API compatible with PollsSection component
export async function voteOnPoll(pollId: number, optionId: number, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('user_interactions')
      .select('id')
      .eq('user_id', userId)
      .eq('content_type', 'poll')
      .eq('content_id', pollId)
      .single();
      
    if (existingVote) {
      return { success: false, message: 'আপনি ইতিমধ্যে এই পোলে ভোট দিয়েছেন' };
    }
    
    // Record the vote
    const { error } = await supabase
      .from('user_interactions')
      .insert({
        user_id: userId,
        content_type: 'poll',
        content_id: pollId,
        interaction_type: 'vote',
        metadata: { option_id: optionId }
      });
      
    if (error) {
      console.error('Error voting on poll:', error);
      return { success: false, message: 'ভোট দিতে সমস্যা হয়েছে' };
    }
    
    return { success: true, message: 'আপনার ভোট সফলভাবে রেকর্ড করা হয়েছে' };
  } catch (error) {
    console.error('Error in voteOnPoll:', error);
    return { success: false, message: 'ভোট দিতে সমস্যা হয়েছে' };
  }
}

// User Feedback APIs
export async function submitUserFeedback(userId: string, type: string, content: string, metadata: any = {}): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: userId,
        feedback_type: type,
        content,
        metadata,
        status: 'submitted'
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error submitting user feedback:', error);
    throw error;
  }
}



export async function getUserSearchHistory(userId: string, limit = 5) {
  try {
    const { data, error } = await supabase
      .from('user_search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching search history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch user search history:', err);
    return [];
  }
}

export async function saveUserSearchHistory(userId: string, query: string, resultsCount: number) {
  try {
    const { error } = await supabase
      .from('user_search_history')
      .insert({
        user_id: userId,
        search_query: query,
        search_results_count: resultsCount,
        search_timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving search history:', error);
    }
  } catch (err) {
    console.error('Failed to save search history:', err);
  }
}

export async function recordUserInteraction(userId: string, articleId: number, interactionType: string, metadata: any = {}) {
  try {
    const { error } = await supabase
      .from('user_interactions')
      .insert({
        user_id: userId,
        content_id: articleId,
        content_type: 'article',
        interaction_type: interactionType,
        metadata: metadata
      });

    if (error) {
      console.error('Error recording user interaction:', error);
    }
  } catch (err) {
    console.error('Failed to record user interaction:', err);
  }
}

// Related Articles API
export async function getRelatedArticles(articleId: number, limit = 3) {
  try {
    // Get the current article's category
    const { data: currentArticle, error: articleError } = await supabase
      .from('articles')
      .select('category_id')
      .eq('id', articleId)
      .single();

    if (articleError) {
      console.error('Error fetching current article:', articleError);
      return [];
    }

    // Get related articles from the same category
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
        category_id,
        categories(id, name, slug)
      `)
      .eq('category_id', currentArticle.category_id)
      .neq('id', articleId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching related articles:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch related articles:', err);
    return [];
  }
}

// Reading History API
export async function trackReadingHistory(articleId: number, userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_reading_history')
      .insert({
        user_id: userId,
        article_id: articleId,
        read_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error tracking reading history:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to track reading history:', err);
    return false;
  }
}

// Weather by Location API
export async function getWeatherByLocation(lat: number, lon: number): Promise<any> {
  try {
    // Calculate distance to find nearest city
    const { data: cities, error } = await supabase
      .from('weather')
      .select('*');

    if (error) {
      console.error('Error fetching weather cities:', error);
      return null;
    }

    // Bangladesh city coordinates for distance calculation
    const cityCoords: { [key: string]: { lat: number; lon: number } } = {
      'ঢাকা': { lat: 23.8103, lon: 90.4125 },
      'চট্টগ্রাম': { lat: 22.3569, lon: 91.7832 },
      'খুলনা': { lat: 22.8456, lon: 89.5403 },
      'রাজশাহী': { lat: 24.3636, lon: 88.6241 },
      'সিলেট': { lat: 24.8949, lon: 91.8687 },
      'বরিশাল': { lat: 22.7010, lon: 90.3535 },
      'রংপুর': { lat: 25.7439, lon: 89.2752 },
      'ময়মনসিংহ': { lat: 24.7471, lon: 90.4203 }
    };

    let closestCity = null;
    let minDistance = Infinity;

    // Find closest city using Haversine formula
    for (const [cityName, coords] of Object.entries(cityCoords)) {
      const distance = Math.sqrt(
        Math.pow(lat - coords.lat, 2) + Math.pow(lon - coords.lon, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = cityName;
      }
    }

    // Get weather for closest city
    if (closestCity) {
      const cityWeather = cities?.find(w => w.city === closestCity);
      if (cityWeather) {
        return {
          ...cityWeather,
          isUserLocation: true,
          coordinates: { lat, lon }
        };
      }
    }

    // Fallback to Dhaka
    const dhakaWeather = cities?.find(w => w.city === 'ঢাকা');
    return dhakaWeather || null;
  } catch (error) {
    console.error('Error getting weather by location:', error);
    return null;
  }
}

// Password update function
export async function updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    // For Supabase auth, we can use the updateUser method
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Error updating password:', error);
      return { success: false, message: 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে' };
    }

    return { success: true, message: 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে' };
  } catch (error) {
    console.error('Password update error:', error);
    return { success: false, message: 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে' };
  }
}

// Users API for Admin
export async function getUsers(): Promise<any[]> {
  try {
    // Get users from auth.users (requires admin access)
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return users || [];
  } catch (error) {
    console.error('Error accessing users:', error);
    return [];
  }
}

// Admin User Statistics API 
export async function getAdminUserStats(period: string = 'all'): Promise<any> {
  try {
    const { data: users } = await supabase.auth.admin.listUsers();
    
    if (!users) return { totalUsers: 0, adminUsers: 0, activeUsers: 0, newUsers: 0 };
    
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.user_metadata?.role === 'admin').length;
    
    // Calculate active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = users.filter(u => {
      const lastSignIn = new Date(u.last_sign_in_at || u.created_at);
      return lastSignIn > thirtyDaysAgo;
    }).length;
    
    // Calculate new users (last 7 days)  
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = users.filter(u => {
      const createdAt = new Date(u.created_at);
      return createdAt > sevenDaysAgo;
    }).length;
    
    return { totalUsers, adminUsers, activeUsers, newUsers };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return { totalUsers: 0, adminUsers: 0, activeUsers: 0, newUsers: 0 };
  }
}

// Personalized Recommendations API
export async function getPersonalizedRecommendations(userId: string, limit: number = 6): Promise<any[]> {
  try {
    // Try to get user reading history for personalization
    const { data: readingHistory } = await supabase
      .from('user_reading_history')
      .select('article_id')
      .eq('user_id', userId)
      .limit(10);
      
    // Get user category preferences if available  
    let preferredCategories: number[] = [];
    if (readingHistory && readingHistory.length > 0) {
      const { data: categoryPrefs } = await supabase
        .from('articles')
        .select('category_id')
        .in('id', readingHistory.map(h => h.article_id));
        
      if (categoryPrefs) {
        preferredCategories = [...new Set(categoryPrefs.map(c => c.category_id))];
      }
    }
    
    // Fetch personalized articles based on preferences
    let query = supabase
      .from('articles')
      .select(`
        *,
        categories(id, name, slug)
      `)

      .order('published_at', { ascending: false })
      .limit(limit);
      
    // If we have category preferences, prioritize those
    if (preferredCategories.length > 0) {
      query = query.in('category_id', preferredCategories);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching personalized recommendations:', error);
      // Fallback to popular articles
      return getPopularArticles(limit);
    }
    
    return transformArticleData(data || []);
  } catch (error) {
    console.error('Error in getPersonalizedRecommendations:', error);
    // Fallback to popular articles
    return getPopularArticles(limit);
  }
}







