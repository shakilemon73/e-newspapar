/**
 * Admin API using Direct Supabase calls with Service Role Key
 * NO EXPRESS SERVER DEPENDENCIES - Pure client-side with service role bypass
 */

// Import all functions from the direct Supabase implementation
export { 
  createArticleDirect as createArticle,
  createVideoContentDirect as createVideoContent,
  createAudioArticleDirect as createAudioArticle,
  createEPaperDirect as createEPaper,
  createCategoryDirect as createCategory,
  createBreakingNewsDirect as createBreakingNews,
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