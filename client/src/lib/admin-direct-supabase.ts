/**
 * Direct Supabase Admin API - NO EXPRESS SERVER REQUIRED
 * Uses service role key for admin operations that bypass RLS
 */
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create admin client with service role key (bypasses RLS)
const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to generate slugs
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 100);
}

// Proper date formatting function
export function formatDateForDatabase(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return new Date().toISOString();
  }
  return d.toISOString();
}

// ========================================
// ARTICLES CRUD - DIRECT SUPABASE
// ========================================

export async function createArticleDirect(articleData: {
  title: string;
  content: string;
  excerpt?: string;
  category_id: number;
  image_url?: string;
  is_featured?: boolean;
  slug?: string;
  published_at?: string;
  author_id?: number;
}) {
  try {
    const slug = articleData.slug || generateSlug(articleData.title);

    const { data, error } = await adminSupabase
      .from('articles')
      .insert({
        title: articleData.title,
        slug: slug,
        content: articleData.content,
        excerpt: articleData.excerpt,
        image_url: articleData.image_url,
        category_id: articleData.category_id,
        author_id: articleData.author_id || 1, // Default to first author (Admin)
        is_featured: articleData.is_featured || false,
        published_at: articleData.published_at || new Date().toISOString(),
        view_count: 0
      })
      .select(`
        *,
        authors(name, slug),
        categories(name, slug)
      `)
      .single();

    if (error) {
      console.error('Direct Supabase error creating article:', error);
      throw new Error(error.message || 'Failed to create article');
    }

    console.log('✅ Article created successfully via direct Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error creating article via direct Supabase:', error);
    throw error;
  }
}

export async function updateArticleDirect(id: number, updates: any) {
  try {
    const formattedUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.published_at) {
      formattedUpdates.published_at = formatDateForDatabase(updates.published_at);
    }

    const { data, error } = await adminSupabase
      .from('articles')
      .update(formattedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Direct Supabase error updating article:', error);
      throw new Error(error.message || 'Failed to update article');
    }

    console.log('✅ Article updated successfully via direct Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error updating article via direct Supabase:', error);
    throw error;
  }
}

export async function deleteArticleDirect(id: number) {
  try {
    const { data, error } = await adminSupabase
      .from('articles')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Direct Supabase error deleting article:', error);
      throw new Error(error.message || 'Failed to delete article');
    }

    console.log('✅ Article deleted successfully via direct Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error deleting article via direct Supabase:', error);
    throw error;
  }
}

// ========================================
// CATEGORIES CRUD - DIRECT SUPABASE
// ========================================

export async function createCategoryDirect(categoryData: {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}) {
  try {
    const slug = categoryData.slug || generateSlug(categoryData.name);

    const { data, error } = await adminSupabase
      .from('categories')
      .insert({
        name: categoryData.name,
        slug: slug,
        description: categoryData.description,
        color: categoryData.color || '#3B82F6'
      })
      .select()
      .single();

    if (error) {
      console.error('Direct Supabase error creating category:', error);
      throw new Error(error.message || 'Failed to create category');
    }

    console.log('✅ Category created successfully via direct Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error creating category via direct Supabase:', error);
    throw error;
  }
}

// ========================================
// BREAKING NEWS CRUD - DIRECT SUPABASE
// ========================================

export async function createBreakingNewsDirect(newsData: {
  title: string;
  content?: string;
  priority?: number;
  is_active?: boolean;
}) {
  try {
    const { data, error } = await adminSupabase
      .from('breaking_news')
      .insert({
        title: newsData.title,
        content: newsData.content,
        priority: newsData.priority || 1,
        is_active: newsData.is_active !== false
      })
      .select()
      .single();

    if (error) {
      console.error('Direct Supabase error creating breaking news:', error);
      throw new Error(error.message || 'Failed to create breaking news');
    }

    console.log('✅ Breaking news created successfully via direct Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error creating breaking news via direct Supabase:', error);
    throw error;
  }
}

// ========================================
// VIDEO CONTENT CRUD - DIRECT SUPABASE
// ========================================

export async function createVideoDirect(videoData: {
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  slug?: string;
}) {
  try {
    const slug = videoData.slug || generateSlug(videoData.title);

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
      console.error('Direct Supabase error creating video:', error);
      throw new Error(error.message || 'Failed to create video');
    }

    console.log('✅ Video created successfully via direct Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error creating video via direct Supabase:', error);
    throw error;
  }
}

// ========================================
// AUTHORS CRUD - DIRECT SUPABASE
// ========================================

export async function getAuthorsDirect() {
  try {
    const { data, error } = await adminSupabase
      .from('authors')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Direct Supabase error fetching authors:', error);
      throw new Error(error.message || 'Failed to fetch authors');
    }

    return data;
  } catch (error) {
    console.error('Error fetching authors via direct Supabase:', error);
    return [];
  }
}

export async function createAuthorDirect(authorData: {
  name: string;
  slug?: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
  social_links?: any;
}) {
  try {
    const slug = authorData.slug || generateSlug(authorData.name);

    const { data, error } = await adminSupabase
      .from('authors')
      .insert({
        name: authorData.name,
        slug: slug,
        email: authorData.email,
        bio: authorData.bio,
        avatar_url: authorData.avatar_url,
        social_links: authorData.social_links || {},
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Direct Supabase error creating author:', error);
      throw new Error(error.message || 'Failed to create author');
    }

    console.log('✅ Author created successfully via direct Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error creating author via direct Supabase:', error);
    throw error;
  }
}

export async function updateAuthorDirect(id: number, updates: any) {
  try {
    const { data, error } = await adminSupabase
      .from('authors')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Direct Supabase error updating author:', error);
      throw new Error(error.message || 'Failed to update author');
    }

    console.log('✅ Author updated successfully via direct Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error updating author via direct Supabase:', error);
    throw error;
  }
}

export async function deleteAuthorDirect(id: number) {
  try {
    // Soft delete by setting is_active to false
    const { data, error } = await adminSupabase
      .from('authors')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Direct Supabase error deactivating author:', error);
      throw new Error(error.message || 'Failed to deactivate author');
    }

    console.log('✅ Author deactivated successfully via direct Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error deactivating author via direct Supabase:', error);
    throw error;
  }
}

console.log('🚀 Direct Supabase Admin API initialized - NO EXPRESS DEPENDENCY!');
console.log('📝 Authors table integration completed');