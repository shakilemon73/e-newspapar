/**
 * Admin API Direct Service - Replaces Express Server Dependencies
 * Provides direct Supabase API calls for all admin dashboard functionality
 * Ready for Vercel deployment without Express server
 */
import supabase from '@/lib/supabase';
// Types will be inferred from Supabase responses

// ==============================================
// AUTHENTICATION & AUTHORIZATION
// ==============================================

export async function checkAdminAuth(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    return profile?.role === 'admin';
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return false;
  }
}

export async function getAdminUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    return { 
      ...session.user, 
      profile,
      isAdmin: profile?.role === 'admin' 
    };
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

// ==============================================
// DASHBOARD STATS & ANALYTICS
// ==============================================

export async function getDashboardStats() {
  try {
    const [articlesCount, usersCount, categoriesCount, todayViews] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('articles').select('view_count').then(result => 
        result.data?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0
      )
    ]);

    // Calculate featured articles and published today
    const { count: featuredCount } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('is_featured', true);

    const { count: todayCount } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]);

    return {
      totalArticles: articlesCount.count || 0,
      totalUsers: usersCount.count || 0,
      totalCategories: categoriesCount.count || 0,
      totalViews: todayViews,
      featuredArticles: featuredCount || 0,
      publishedToday: todayCount || 0,
      // Recent stats (last 7 days)
      recentArticles: await getRecentCount('articles', 7),
      recentUsers: await getRecentCount('user_profiles', 7),
      // Growth calculations
      articlesGrowth: await calculateGrowth('articles'),
      usersGrowth: await calculateGrowth('user_profiles')
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalArticles: 0,
      totalUsers: 0,
      totalCategories: 0,
      totalViews: 0,
      recentArticles: 0,
      recentUsers: 0,
      articlesGrowth: '0%',
      usersGrowth: '0%'
    };
  }
}

async function getRecentCount(table: string, days: number) {
  try {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    const { count } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', date.toISOString());
    
    return count || 0;
  } catch (error) {
    console.error(`Error getting recent count for ${table}:`, error);
    return 0;
  }
}

async function calculateGrowth(table: string) {
  try {
    const thisWeek = await getRecentCount(table, 7);
    const lastWeek = await getRecentCount(table, 14) - thisWeek;
    
    if (lastWeek === 0) return thisWeek > 0 ? '+100%' : '0%';
    
    const growth = ((thisWeek - lastWeek) / lastWeek) * 100;
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  } catch (error) {
    console.error(`Error calculating growth for ${table}:`, error);
    return '0%';
  }
}

// ==============================================
// ARTICLES MANAGEMENT
// ==============================================

export async function getAdminArticles(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: 'published' | 'draft' | 'archived';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    let query = supabase
      .from('articles')
      .select(`
        *,
        categories(id, name, slug),
        user_profiles(id, name)
      `);

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    
    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }
    
    if (status) {
      if (status === 'published') {
        query = query.eq('is_published', true);
      } else if (status === 'draft') {
        query = query.eq('is_published', false);
      }
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      articles: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching admin articles:', error);
    return { articles: [], totalCount: 0, currentPage: 1, totalPages: 0 };
  }
}

export async function createArticle(articleData: {
  title: string;
  content: string;
  excerpt?: string;
  category_id: number;
  image_url?: string;
  is_featured?: boolean;
  is_published?: boolean;
  tags?: string[];
}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const slug = articleData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    const { data, error } = await supabase
      .from('articles')
      .insert({
        ...articleData,
        slug,
        author_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Add tags if provided
    if (articleData.tags && articleData.tags.length > 0) {
      await addTagsToArticle(data.id, articleData.tags);
    }

    return data;
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
}

export async function updateArticle(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('articles')
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
    console.error('Error updating article:', error);
    throw error;
  }
}

export async function deleteArticle(id: number) {
  try {
    // Delete related data first
    await Promise.all([
      supabase.from('article_tags').delete().eq('article_id', id),
      supabase.from('article_comments').delete().eq('article_id', id),
      supabase.from('user_bookmarks').delete().eq('article_id', id)
    ]);

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

// ==============================================
// CATEGORIES MANAGEMENT
// ==============================================

export async function getAdminCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        articles(count)
      `)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function createCategory(categoryData: {
  name: string;
  description?: string;
  color?: string;
}) {
  try {
    const slug = categoryData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        slug,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

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

// ==============================================
// USERS MANAGEMENT
// ==============================================

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
      .select('*');

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

// ==============================================
// MEDIA MANAGEMENT
// ==============================================

export async function uploadMedia(file: File, folder: string = 'media') {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return { url: publicUrl, path: filePath };
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
}

// ==============================================
// SYSTEM SETTINGS MANAGEMENT
// ==============================================

export async function getSystemSettings() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key');

    if (error) throw error;

    // Convert to key-value object
    const settings: Record<string, string> = {};
    data?.forEach(setting => {
      settings[setting.setting_key] = setting.setting_value;
    });

    return settings;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return {};
  }
}

export async function updateSystemSetting(key: string, value: string) {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert(
        {
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'setting_key' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating system setting:', error);
    throw error;
  }
}

// ==============================================
// BREAKING NEWS MANAGEMENT
// ==============================================

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

export async function createBreakingNews(newsData: {
  title: string;
  content?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('breaking_news')
      .insert({
        ...newsData,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating breaking news:', error);
    throw error;
  }
}

export async function updateBreakingNews(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('breaking_news')
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

// ==============================================
// VIDEOS MANAGEMENT
// ==============================================

export async function getAdminVideos() {
  try {
    const { data, error } = await supabase
      .from('video_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin videos:', error);
    return [];
  }
}

export async function createVideoContent(videoData: {
  title: string;
  slug: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  category_id?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('video_content')
      .insert({
        ...videoData,
        published_at: new Date().toISOString(),
        is_published: true,
        view_count: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating video content:', error);
    throw error;
  }
}

export async function updateVideoContent(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('video_content')
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
    console.error('Error updating video content:', error);
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
    console.error('Error deleting video content:', error);
    throw error;
  }
}



// ==============================================
// AUDIO ARTICLES MANAGEMENT
// ==============================================

export async function getAdminAudioArticles() {
  try {
    const { data, error } = await supabase
      .from('audio_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin audio articles:', error);
    return [];
  }
}

export async function createAudioArticle(audioData: {
  title: string;
  slug: string;
  excerpt?: string;
  audio_url: string;
  image_url?: string;
  duration?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('audio_articles')
      .insert({
        ...audioData,
        published_at: new Date().toISOString(),
        is_published: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating audio article:', error);
    throw error;
  }
}

export async function updateAudioArticle(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('audio_articles')
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

// ==============================================
// E-PAPERS MANAGEMENT
// ==============================================

export async function getAdminEPapers() {
  try {
    const { data, error } = await supabase
      .from('epapers')
      .select('*')
      .order('publish_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin e-papers:', error);
    return [];
  }
}

export async function createEPaper(epaperData: {
  title: string;
  image_url: string;
  pdf_url: string;
  publish_date: string;
  is_latest?: boolean;
}) {
  try {
    const { data, error } = await supabase
      .from('epapers')
      .insert({
        ...epaperData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating e-paper:', error);
    throw error;
  }
}

export async function updateEPaper(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('epapers')
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

// ==============================================
// COMMENTS MANAGEMENT
// ==============================================

export async function getAdminComments() {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .select(`
        *,
        users:user_id(name, email),
        articles:article_id(title, slug)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    return [];
  }
}

export async function updateCommentStatus(id: number, status: 'approved' | 'rejected' | 'pending') {
  try {
    const { data, error } = await supabase
      .from('article_comments')
      .update({ status, updated_at: new Date().toISOString() })
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

// ==============================================
// ADVERTISEMENTS MANAGEMENT
// ==============================================

export async function getAdminAdvertisements() {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin advertisements:', error);
    return [];
  }
}

export async function createAdvertisement(adData: {
  title: string;
  description?: string;
  image_url: string;
  target_url: string;
  position: string;
  status: 'active' | 'inactive';
}) {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .insert({
        ...adData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating advertisement:', error);
    throw error;
  }
}

export async function updateAdvertisement(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('advertisements')
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

// ==============================================
// EMAIL TEMPLATES MANAGEMENT
// ==============================================

export async function getAdminEmailTemplates() {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin email templates:', error);
    return [];
  }
}

export async function createEmailTemplate(templateData: {
  name: string;
  subject: string;
  content: string;
  type: string;
}) {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        ...templateData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating email template:', error);
    throw error;
  }
}

export async function updateEmailTemplate(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('email_templates')
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

// ==============================================
// SOCIAL MEDIA MANAGEMENT
// ==============================================

export async function getAdminSocialPosts() {
  try {
    const { data, error } = await supabase
      .from('social_media_feed')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin social posts:', error);
    return [];
  }
}

export async function createSocialPost(postData: {
  platform: string;
  content: string;
  embed_code?: string;
  post_url?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('social_media_feed')
      .insert({
        ...postData,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating social post:', error);
    throw error;
  }
}

export async function updateSocialPost(id: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('social_media_feed')
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
    console.error('Error updating social post:', error);
    throw error;
  }
}

export async function deleteSocialPost(id: number) {
  try {
    const { error } = await supabase
      .from('social_media_feed')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting social post:', error);
    throw error;
  }
}

// ==============================================
// SYSTEM SETTINGS MANAGEMENT
// ==============================================

export async function getAdminSettings() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data || {};
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return {};
  }
}

export async function updateAdminSettings(settingsData: any) {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        ...settingsData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw error;
  }
}

// ==============================================
// ANALYTICS & REPORTS
// ==============================================

export async function getAdminAnalytics(timeRange: 'today' | 'week' | 'month' = 'week') {
  try {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const [
      articlesCount,
      usersCount,
      totalViews,
      commentsCount
    ] = await Promise.all([
      supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('articles')
        .select('view_count')
        .gte('updated_at', startDate.toISOString())
        .then(result => 
          result.data?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0
        ),
      supabase
        .from('article_comments')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
    ]);

    return {
      timeRange,
      articles: articlesCount.count || 0,
      users: usersCount.count || 0,
      views: totalViews,
      comments: commentsCount.count || 0,
    };
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return {
      timeRange,
      articles: 0,
      users: 0,
      views: 0,
      comments: 0,
    };
  }
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================

async function addTagsToArticle(articleId: number, tags: string[]) {
  try {
    for (const tagName of tags) {
      // Create or get tag
      let { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .single();

      if (!tag) {
        const { data: newTag } = await supabase
          .from('tags')
          .insert({
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-'),
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        tag = newTag;
      }

      if (tag) {
        await supabase
          .from('article_tags')
          .insert({
            article_id: articleId,
            tag_id: tag.id,
            created_at: new Date().toISOString()
          });
      }
    }
  } catch (error) {
    console.error('Error adding tags to article:', error);
  }
}

// Export all functions for easy importing
export const AdminAPI = {
  // Auth
  checkAdminAuth,
  getAdminUser,
  
  // Dashboard
  getDashboardStats,
  getAdminAnalytics,
  
  // Articles
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  
  // Categories
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Users
  getAdminUsers,
  updateUserRole,
  
  // Media
  uploadMedia,
  
  // Settings
  getSystemSettings,
  updateSystemSetting,
  
  // Breaking News
  getBreakingNews,
  createBreakingNews,
  updateBreakingNews,
  deleteBreakingNews,
};

export default AdminAPI;