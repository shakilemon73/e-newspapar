/**
 * Admin Supabase Direct API - Uses Service Role Key in Frontend
 * Bypasses RLS policies for admin operations
 * NO EXPRESS SERVER DEPENDENCY
 */
import { createClient } from '@supabase/supabase-js';

// Admin client with service role key (frontend usage for admin only)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials for admin operations');
}

// Service role client that bypasses RLS
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔐 Admin Supabase client using SERVICE ROLE key');

// ==============================================
// ARTICLES MANAGEMENT (Direct Supabase)
// ==============================================

export async function createArticleDirect(articleData: {
  title: string;
  content: string;
  excerpt?: string;
  category_id: number;
  image_url?: string;
  is_featured?: boolean;
  slug?: string;
  published_at?: string;
}) {
  try {
    const slug = articleData.slug || articleData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    console.log('Creating article with service role key...');
    
    const { data, error } = await adminSupabase
      .from('articles')
      .insert({
        title: articleData.title,
        slug: slug,
        content: articleData.content,
        excerpt: articleData.excerpt,
        image_url: articleData.image_url,
        category_id: articleData.category_id,
        is_featured: articleData.is_featured || false,
        view_count: 0,
        published_at: articleData.published_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to create article');
    }

    console.log('✅ Article created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
}

// ==============================================
// VIDEO CONTENT MANAGEMENT (Direct Supabase)
// ==============================================

export async function createVideoContentDirect(videoData: {
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  slug?: string;
}) {
  try {
    const slug = videoData.slug || videoData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    console.log('Creating video with service role key...');

    const { data, error } = await adminSupabase
      .from('video_content')
      .insert({
        title: videoData.title,
        slug: slug,
        description: videoData.description,
        video_url: videoData.video_url,
        thumbnail_url: videoData.thumbnail_url,
        duration: videoData.duration,
        views: 0,
        published_at: new Date().toISOString()
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

// ==============================================
// AUDIO ARTICLES MANAGEMENT (Direct Supabase)
// ==============================================

export async function createAudioArticleDirect(audioData: {
  title: string;
  excerpt?: string;
  image_url?: string;
  audio_url?: string;
  duration?: number;
  slug?: string;
}) {
  try {
    const slug = audioData.slug || audioData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    console.log('Creating audio article with service role key...');

    const { data, error } = await adminSupabase
      .from('audio_articles')
      .insert({
        title: audioData.title,
        slug: slug,
        excerpt: audioData.excerpt,
        image_url: audioData.image_url,
        audio_url: audioData.audio_url,
        duration: audioData.duration,
        published_at: new Date().toISOString()
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

// ==============================================
// E-PAPERS MANAGEMENT (Direct Supabase)
// ==============================================

export async function createEPaperDirect(epaperData: {
  title: string;
  publish_date: string;
  pdf_url: string;
  image_url?: string;
  is_latest?: boolean;
}) {
  try {
    console.log('Creating e-paper with service role key...');

    const { data, error } = await adminSupabase
      .from('epapers')
      .insert({
        title: epaperData.title,
        publish_date: epaperData.publish_date,
        pdf_url: epaperData.pdf_url,
        image_url: epaperData.image_url,
        is_latest: epaperData.is_latest || false
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

// ==============================================
// CATEGORIES MANAGEMENT (Direct Supabase)
// ==============================================

export async function createCategoryDirect(categoryData: {
  name: string;
  slug?: string;
  description?: string;
  parent_id?: number;
}) {
  try {
    const slug = categoryData.slug || categoryData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    console.log('Creating category with service role key...');

    const { data, error } = await adminSupabase
      .from('categories')
      .insert({
        name: categoryData.name,
        slug: slug,
        description: categoryData.description,
        parent_id: categoryData.parent_id
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to create category');
    }

    console.log('✅ Category created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

// ==============================================
// BREAKING NEWS MANAGEMENT (Direct Supabase)
// ==============================================

export async function createBreakingNewsDirect(newsData: {
  content: string;
  is_active?: boolean;
}) {
  try {
    console.log('Creating breaking news with service role key...');

    const { data, error } = await adminSupabase
      .from('breaking_news')
      .insert({
        content: newsData.content,
        is_active: newsData.is_active !== false
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

// ==============================================
// ADMIN LISTINGS (Direct Supabase)
// ==============================================

export async function getAdminArticlesDirect(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    console.log('Fetching admin articles with service role key...');

    let query = adminSupabase
      .from('articles')
      .select(`
        *,
        categories(id, name, slug)
      `, { count: 'exact' });

    // Apply filters
    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    
    if (category && category !== 'all') {
      query = query.eq('category_id', parseInt(category));
    }

    // Apply sorting
    const dbSortBy = sortBy === 'publishedAt' ? 'published_at' : sortBy;
    query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to fetch articles');
    }

    console.log('✅ Admin articles fetched successfully');
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

export async function getAdminCategoriesDirect() {
  try {
    console.log('Fetching admin categories with service role key...');
    
    const { data, error } = await adminSupabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase admin error:', error);
      throw new Error(error.message || 'Failed to fetch categories');
    }

    console.log('✅ Admin categories fetched successfully');
    return data || [];
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    return [];
  }
}

export default adminSupabase;