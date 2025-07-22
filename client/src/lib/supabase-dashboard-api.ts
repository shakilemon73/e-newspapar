import { supabase } from '@db';

// Complete Supabase API for User Dashboard - Direct API calls
export interface DashboardStats {
  saved_articles: number;
  read_articles: number;
  reading_streak: number;
  total_interactions: number;
  achievements_count: number;
}

export interface BookmarkedArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url?: string;
  published_at: string;
  category?: {
    name: string;
    slug: string;
  };
  created_at: string;
}

export interface ReadingHistoryItem {
  id: number;
  article_id: number;
  read_percentage: number;
  time_spent: number;
  is_completed: boolean;
  updated_at: string;
  articles: {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    image_url?: string;
    published_at: string;
    category?: {
      name: string;
      slug: string;
    };
  };
}

export interface UserAchievement {
  id: number;
  name: string;
  description: string;
  badge_icon: string;
  points: number;
  earned_at: string;
  is_featured: boolean;
}

export interface UserActivity {
  id: number;
  activity_type: string;
  description: string;
  created_at: string;
  metadata?: any;
}

// Get current authenticated user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Fetch user statistics
export const fetchUserStats = async (userId: string): Promise<DashboardStats> => {
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
      .eq('user_id', userId)
      .eq('is_completed', true);

    // Get achievements count
    const { count: achievementsCount } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Get total interactions (likes + shares)
    const { count: likesCount } = await supabase
      .from('user_likes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    const { count: sharesCount } = await supabase
      .from('user_shares')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Calculate reading streak
    const { data: recentReadings } = await supabase
      .from('user_reading_history')
      .select('updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(30);

    let streak = 0;
    if (recentReadings && recentReadings.length > 0) {
      const today = new Date();
      const dates = recentReadings.map(r => new Date(r.updated_at).toDateString());
      const uniqueDates = Array.from(new Set(dates));
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        
        if (uniqueDates.includes(checkDate.toDateString())) {
          streak++;
        } else {
          break;
        }
      }
    }

    return {
      saved_articles: savedCount || 0,
      read_articles: readCount || 0,
      reading_streak: streak,
      total_interactions: (likesCount || 0) + (sharesCount || 0),
      achievements_count: achievementsCount || 0
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      saved_articles: 0,
      read_articles: 0,
      reading_streak: 0,
      total_interactions: 0,
      achievements_count: 0
    };
  }
};

// Fetch bookmarked articles
export const fetchBookmarkedArticles = async (userId: string): Promise<BookmarkedArticle[]> => {
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
          published_at,
          categories (
            name,
            slug
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return data?.map(bookmark => ({
      id: bookmark.articles.id,
      title: bookmark.articles.title,
      slug: bookmark.articles.slug,
      excerpt: bookmark.articles.excerpt || 'কোন সংক্ষিপ্ত বিবরণ নেই',
      image_url: bookmark.articles.image_url,
      published_at: bookmark.articles.published_at,
      category: bookmark.articles.categories,
      created_at: bookmark.created_at
    })) || [];
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
};

// Fetch reading history
export const fetchReadingHistory = async (userId: string): Promise<ReadingHistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('user_reading_history')
      .select(`
        *,
        articles (
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          categories (
            name,
            slug
          )
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return [];
  }
};

// Fetch user achievements
export const fetchUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (
          id,
          name,
          description,
          badge_icon,
          points,
          is_featured
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
      .limit(15);

    if (error) throw error;

    return data?.map(ua => ({
      id: ua.achievements.id,
      name: ua.achievements.name,
      description: ua.achievements.description,
      badge_icon: ua.achievements.badge_icon,
      points: ua.achievements.points,
      earned_at: ua.earned_at,
      is_featured: ua.achievements.is_featured
    })) || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
};

// Fetch user activities
export const fetchUserActivities = async (userId: string): Promise<UserActivity[]> => {
  try {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(25);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};

// Remove bookmark
export const removeBookmark = async (userId: string, articleId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

// Add bookmark
export const addBookmark = async (userId: string, articleId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: userId,
        article_id: articleId,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

// Fetch user profile
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Save user profile
export const saveUserProfile = async (userId: string, profileData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        ...profileData,
        user_id: userId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};