/**
 * Admin API using Direct Supabase calls with Service Role Key
 * NO EXPRESS SERVER DEPENDENCIES - Pure client-side with service role bypass
 */

// Import all functions from the direct Supabase implementation
export { 
  createArticleDirect as createArticle,
  createVideoContentDirect as createVideoContent,
  createCategoryDirect as createCategory,
  getAdminArticlesDirect as getAdminArticles,
  getAdminCategoriesDirect as getAdminCategories
} from './admin-supabase-direct';

import { createClient } from '@supabase/supabase-js';

// Standard client for non-admin operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==============================================
// ADDITIONAL CRUD OPERATIONS
// ==============================================

export async function updateArticle(id: number, updates: any) {
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
}

export async function deleteArticle(id: number) {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
}

// Breaking News additional operations
export async function getBreakingNews() {
  try {
    const { data, error } = await supabase
      .from('breaking_news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return [];
  }
}

export async function updateBreakingNews(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('breaking_news')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating breaking news:', error);
    throw error;
  }
}

export async function deleteBreakingNews(id: number) {
  try {
    const { error } = await supabase
      .from('breaking_news')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting breaking news:', error);
    throw error;
  }
}

// Video content additional operations
export async function getAdminVideos() {
  try {
    const { data, error } = await supabase
      .from('video_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      videos: data || [],
      totalCount: data?.length || 0,
      currentPage: 1,
      totalPages: 1
    };
  } catch (error) {
    console.error('Error fetching videos:', error);
    return { videos: [], totalCount: 0, currentPage: 1, totalPages: 0 };
  }
}

export async function updateVideoContent(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('video_content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
}

export async function deleteVideoContent(id: number) {
  try {
    const { error } = await supabase
      .from('video_content')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}

// Category additional operations  
export async function updateCategory(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: number) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// Dashboard Statistics
export async function getDashboardStats() {
  try {
    console.log('🔐 Fetching dashboard stats with service role key...');
    
    // Import admin client from direct implementation
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    // Get counts from all major tables using service role key
    const [
      articlesResult,
      categoriesResult,
      videosResult,
      usersResult,
      breakingNewsResult
    ] = await Promise.all([
      adminSupabase.from('articles').select('id', { count: 'exact', head: true }),
      adminSupabase.from('categories').select('id', { count: 'exact', head: true }),
      adminSupabase.from('video_content').select('id', { count: 'exact', head: true }),
      adminSupabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      adminSupabase.from('breaking_news').select('id', { count: 'exact', head: true })
    ]);

    const stats = {
      totalArticles: articlesResult.count || 0,
      totalCategories: categoriesResult.count || 0,
      totalVideos: videosResult.count || 0,
      totalUsers: usersResult.count || 0,
      totalBreakingNews: breakingNewsResult.count || 0,
      // Add some calculated metrics
      publishedToday: 0, // Can be calculated if needed
      activeUsers: 0, // Can be calculated if needed
      totalViews: 0 // Can be calculated if needed
    };

    console.log('✅ Dashboard stats fetched successfully:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalArticles: 0,
      totalCategories: 0,
      totalVideos: 0,
      totalUsers: 0,
      totalBreakingNews: 0,
      publishedToday: 0,
      activeUsers: 0,
      totalViews: 0
    };
  }
}

// E-Papers additional operations
export async function getAdminEPapers() {
  try {
    const { data, error } = await supabase
      .from('epapers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      epapers: data || [],
      totalCount: data?.length || 0,
      currentPage: 1,
      totalPages: 1
    };
  } catch (error) {
    console.error('Error fetching e-papers:', error);
    return { epapers: [], totalCount: 0, currentPage: 1, totalPages: 0 };
  }
}

export async function updateEPaper(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('epapers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating e-paper:', error);
    throw error;
  }
}

export async function deleteEPaper(id: number) {
  try {
    const { error } = await supabase
      .from('epapers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting e-paper:', error);
    throw error;
  }
}

// Audio Articles additional operations
export async function getAdminAudioArticles() {
  try {
    const { data, error } = await supabase
      .from('audio_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      audioArticles: data || [],
      totalCount: data?.length || 0,
      currentPage: 1,
      totalPages: 1
    };
  } catch (error) {
    console.error('Error fetching audio articles:', error);
    return { audioArticles: [], totalCount: 0, currentPage: 1, totalPages: 0 };
  }
}

export async function updateAudioArticle(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('audio_articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating audio article:', error);
    throw error;
  }
}

export async function deleteAudioArticle(id: number) {
  try {
    const { error } = await supabase
      .from('audio_articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting audio article:', error);
    throw error;
  }
}

// Users management operations
export async function getAdminUsers(options: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
} = {}) {
  try {
    const { page = 1, limit = 20, search, role } = options;

    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      users: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return { users: [], totalCount: 0, currentPage: 1, totalPages: 0 };
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// Social Media operations
export async function createSocialPost(postData: {
  content: string;
  platform?: string;
  scheduled_for?: string;
  is_active?: boolean;
}) {
  try {
    console.log('Creating social post with service role key...');
    
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    const { data, error } = await adminSupabase
      .from('social_media_posts')
      .insert({
        content: postData.content,
        platform: postData.platform || 'general',
        scheduled_for: postData.scheduled_for || new Date().toISOString(),
        is_active: postData.is_active !== false
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to create social post');
    }

    console.log('✅ Social post created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating social post:', error);
    throw error;
  }
}

export async function getSocialPosts() {
  try {
    const { data, error } = await supabase
      .from('social_media_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching social posts:', error);
    return [];
  }
}

export async function getAdminSocialPosts() {
  try {
    const { data, error } = await supabase
      .from('social_media_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      posts: data || [],
      totalCount: data?.length || 0,
      currentPage: 1,
      totalPages: 1
    };
  } catch (error) {
    console.error('Error fetching admin social posts:', error);
    return { posts: [], totalCount: 0, currentPage: 1, totalPages: 0 };
  }
}

export async function updateSocialPost(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('social_media_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating social post:', error);
    throw error;
  }
}

export async function deleteSocialPost(id: number) {
  try {
    const { error } = await supabase
      .from('social_media_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting social post:', error);
    throw error;
  }
}

// Additional admin operations that might be needed
export async function createEmailTemplate(templateData: {
  name: string;
  subject: string;
  content: string;
  template_type?: string;
}) {
  try {
    console.log('Creating email template with service role key...');
    
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    const { data, error } = await adminSupabase
      .from('email_templates')
      .insert({
        name: templateData.name,
        subject: templateData.subject,
        content: templateData.content,
        template_type: templateData.template_type || 'newsletter'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to create email template');
    }

    console.log('✅ Email template created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating email template:', error);
    throw error;
  }
}

export async function createAdvertisement(adData: {
  title: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  placement?: string;
  is_active?: boolean;
}) {
  try {
    console.log('Creating advertisement with service role key...');
    
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    const { data, error } = await adminSupabase
      .from('advertisements')
      .insert({
        title: adData.title,
        content: adData.content,
        image_url: adData.image_url,
        link_url: adData.link_url,
        placement: adData.placement || 'sidebar',
        is_active: adData.is_active !== false
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to create advertisement');
    }

    console.log('✅ Advertisement created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating advertisement:', error);
    throw error;
  }
}

export async function getAdminAnalytics() {
  try {
    console.log('Fetching admin analytics with service role key...');
    
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    // Get analytics data from multiple tables
    const [
      pageViews,
      userInteractions,
      articleAnalytics
    ] = await Promise.all([
      adminSupabase.from('page_views').select('*').limit(100),
      adminSupabase.from('user_interactions').select('*').limit(100),
      adminSupabase.from('article_analytics').select('*').limit(100)
    ]);

    return {
      pageViews: pageViews.data || [],
      userInteractions: userInteractions.data || [],
      articleAnalytics: articleAnalytics.data || []
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      pageViews: [],
      userInteractions: [],
      articleAnalytics: []
    };
  }
}

// Advertisement management operations
export async function getAdminAdvertisements() {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      advertisements: data || [],
      totalCount: data?.length || 0,
      currentPage: 1,
      totalPages: 1
    };
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    return { advertisements: [], totalCount: 0, currentPage: 1, totalPages: 0 };
  }
}

export async function updateAdvertisement(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating advertisement:', error);
    throw error;
  }
}

export async function deleteAdvertisement(id: number) {
  try {
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    throw error;
  }
}

// Weather data management operations
export async function createWeatherData(weatherData: {
  city: string;
  temperature?: number;
  condition?: string;
  humidity?: number;
  wind_speed?: number;
  forecast?: any;
}) {
  try {
    console.log('Creating weather data with service role key...');
    
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    const { data, error } = await adminSupabase
      .from('weather')
      .insert({
        city: weatherData.city,
        temperature: weatherData.temperature || 25,
        condition: weatherData.condition || 'Clear',
        humidity: weatherData.humidity || 60,
        wind_speed: weatherData.wind_speed || 10,
        forecast: weatherData.forecast || {},
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to create weather data');
    }

    console.log('✅ Weather data created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating weather data:', error);
    throw error;
  }
}

export async function getAdminWeatherData() {
  try {
    const { data, error } = await supabase
      .from('weather')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return {
      weatherData: data || [],
      totalCount: data?.length || 0,
      currentPage: 1,
      totalPages: 1
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return { weatherData: [], totalCount: 0, currentPage: 1, totalPages: 0 };
  }
}

export async function updateWeatherData(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('weather')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating weather data:', error);
    throw error;
  }
}

export async function deleteWeatherData(id: number) {
  try {
    const { error } = await supabase
      .from('weather')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting weather data:', error);
    throw error;
  }
}

// Breaking News creation operation
export async function createBreakingNews(newsData: {
  title: string;
  content?: string;
  is_active?: boolean;
  priority?: number;
}) {
  try {
    console.log('Creating breaking news with service role key...');
    
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    const { data, error } = await adminSupabase
      .from('breaking_news')
      .insert({
        title: newsData.title,
        content: newsData.content || '',
        is_active: newsData.is_active !== false,
        priority: newsData.priority || 1,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to create breaking news');
    }

    console.log('✅ Breaking news created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating breaking news:', error);
    throw error;
  }
}

// Video content creation operation
export async function createVideo(videoData: {
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  category_id?: number;
}) {
  try {
    console.log('Creating video with service role key...');
    
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    const { data, error } = await adminSupabase
      .from('video_content')
      .insert({
        title: videoData.title,
        description: videoData.description || '',
        video_url: videoData.video_url || '',
        thumbnail_url: videoData.thumbnail_url || '',
        duration: videoData.duration || 0,
        category_id: videoData.category_id || 1,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to create video');
    }

    console.log('✅ Video created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
}

// E-Paper creation operation
export async function createEPaper(epaperData: {
  title: string;
  edition_date?: string;
  pdf_url?: string;
  cover_image_url?: string;
  is_published?: boolean;
}) {
  try {
    console.log('Creating e-paper with service role key...');
    
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    const { data, error } = await adminSupabase
      .from('epapers')
      .insert({
        title: epaperData.title,
        edition_date: epaperData.edition_date || new Date().toISOString(),
        pdf_url: epaperData.pdf_url || '',
        cover_image_url: epaperData.cover_image_url || '',
        is_published: epaperData.is_published !== false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to create e-paper');
    }

    console.log('✅ E-paper created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating e-paper:', error);
    throw error;
  }
}

// Audio Article creation operation
export async function createAudioArticle(audioData: {
  title: string;
  content?: string;
  audio_url?: string;
  duration?: number;
  transcript?: string;
}) {
  try {
    console.log('Creating audio article with service role key...');
    
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    const { data, error } = await adminSupabase
      .from('audio_articles')
      .insert({
        title: audioData.title,
        content: audioData.content || '',
        audio_url: audioData.audio_url || '',
        duration: audioData.duration || 0,
        transcript: audioData.transcript || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to create audio article');
    }

    console.log('✅ Audio article created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating audio article:', error);
    throw error;
  }
}

// User Dashboard Statistics
export async function getUserDashboardStats() {
  try {
    console.log('Fetching user dashboard stats with service role key...');
    
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    // Get user-specific statistics
    const [
      usersResult,
      activeUsersResult,
      totalInteractionsResult
    ] = await Promise.all([
      adminSupabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      adminSupabase.from('user_sessions').select('id', { count: 'exact', head: true }).gte('last_seen', new Date(Date.now() - 24*60*60*1000).toISOString()),
      adminSupabase.from('user_interactions').select('id', { count: 'exact', head: true })
    ]);

    return {
      totalUsers: usersResult.count || 0,
      activeUsers: activeUsersResult.count || 0,
      totalInteractions: totalInteractionsResult.count || 0,
      newUsersToday: 0, // Can be calculated if needed
      userGrowthRate: 0 // Can be calculated if needed
    };
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalInteractions: 0,
      newUsersToday: 0,
      userGrowthRate: 0
    };
  }
}

// User Engagement Data
export async function getUserEngagementData() {
  try {
    console.log('Fetching user engagement data with service role key...');
    
    const { default: adminSupabase } = await import('./admin-supabase-direct');
    
    // Get engagement statistics
    const [
      likesResult,
      sharesResult,
      commentsResult,
      bookmarksResult
    ] = await Promise.all([
      adminSupabase.from('user_likes').select('id', { count: 'exact', head: true }),
      adminSupabase.from('user_shares').select('id', { count: 'exact', head: true }),
      adminSupabase.from('article_comments').select('id', { count: 'exact', head: true }),
      adminSupabase.from('user_bookmarks').select('id', { count: 'exact', head: true })
    ]);

    return {
      totalLikes: likesResult.count || 0,
      totalShares: sharesResult.count || 0,
      totalComments: commentsResult.count || 0,
      totalBookmarks: bookmarksResult.count || 0,
      engagementRate: 0, // Can be calculated if needed
      avgSessionDuration: 0 // Can be calculated if needed
    };
  } catch (error) {
    console.error('Error fetching user engagement data:', error);
    return {
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      totalBookmarks: 0,
      engagementRate: 0,
      avgSessionDuration: 0
    };
  }
}

// Comment Management Operations
export async function getAdminComments() {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .select(`
        *,
        articles(title, slug),
        user_profiles(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      comments: data || [],
      totalCount: data?.length || 0,
      currentPage: 1,
      totalPages: 1
    };
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    return { comments: [], totalCount: 0, currentPage: 1, totalPages: 0 };
  }
}

export async function updateCommentStatus(id: number, status: string) {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating comment status:', error);
    throw error;
  }
}

export async function deleteComment(id: number) {
  try {
    const { error } = await supabase
      .from('article_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// Email Template Management Operations
export async function getAdminEmailTemplates() {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      emailTemplates: data || [],
      totalCount: data?.length || 0,
      currentPage: 1,
      totalPages: 1
    };
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return { emailTemplates: [], totalCount: 0, currentPage: 1, totalPages: 0 };
  }
}

export async function updateEmailTemplate(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating email template:', error);
    throw error;
  }
}

export async function deleteEmailTemplate(id: number) {
  try {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting email template:', error);
    throw error;
  }
}