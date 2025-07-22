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

// User Dashboard APIs
export async function getUserStats(userId: string): Promise<any> {
  try {
    // Get saved articles count
    const { count: savedCount } = await supabase
      .from('user_bookmarks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Get reading history count
    const { count: readCount } = await supabase
      .from('user_reading_history')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Get user likes count
    const { count: likesCount } = await supabase
      .from('user_likes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Get favorite categories
    const { data: categoryData } = await supabase
      .from('user_reading_history')
      .select('article_id, articles(category_id, categories(name))')
      .eq('user_id', userId)
      .limit(50);

    const categoryMap = new Map();
    categoryData?.forEach(item => {
      const category = item.articles?.categories?.name;
      if (category) {
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      }
    });

    const favoriteCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return {
      savedArticles: savedCount || 0,
      readArticles: readCount || 0,
      readingStreak: 0, // Can be calculated based on reading history
      totalInteractions: (likesCount || 0),
      memberSince: new Date().toLocaleDateString('bn-BD'),
      favoriteCategories
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      savedArticles: 0,
      readArticles: 0,
      readingStreak: 0,
      totalInteractions: 0,
      memberSince: new Date().toLocaleDateString('bn-BD'),
      favoriteCategories: []
    };
  }
}

export async function getUserPreferences(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

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

export async function getUserBookmarks(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select(`
        id,
        created_at,
        article_id,
        articles(
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          categories(name, slug)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return [];
  }
}

export async function getUserReadingHistory(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_reading_history')
      .select(`
        id,
        read_at,
        progress,
        article_id,
        articles(
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          categories(name, slug)
        )
      `)
      .eq('user_id', userId)
      .order('read_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return [];
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

// Poll APIs
export async function getPolls(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

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

// Search API Functions (Enhanced Version)
export async function searchArticles(query: string, categoryId?: string, limit = 20) {
  try {
    let queryBuilder = supabase
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
      .textSearch('title', query)
      .limit(limit);

    if (categoryId) {
      queryBuilder = queryBuilder.eq('category_id', categoryId);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error searching articles:', error);
      return [];
    }

    // Transform to match SearchResult interface
    return (data || []).map((article: any) => ({
      ...article,
      category_name: article.categories?.name || '',
      search_rank: 1
    }));
  } catch (err) {
    console.error('Failed to search articles:', err);
    return [];
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

// Report Article API
export async function reportArticle(articleId: number, reason: string, description: string) {
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        article_id: articleId,
        feedback_type: 'report',
        feedback_text: reason,
        metadata: { description, user_agent: navigator.userAgent }
      });

    if (error) {
      console.error('Error reporting article:', error);
      throw new Error('Failed to submit report');
    }

    return true;
  } catch (err) {
    console.error('Failed to report article:', err);
    throw err;
  }
}

