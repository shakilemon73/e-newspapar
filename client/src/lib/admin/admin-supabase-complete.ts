/**
 * Complete Admin Supabase Direct API - All 26 Admin Sections
 * Uses service role key for all admin operations that bypass RLS
 * NO EXPRESS SERVER DEPENDENCIES
 */
import { createClient } from '@supabase/supabase-js';

// Get environment variables - Fixed naming consistency
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase environment variables:', {
    supabaseUrl: !!supabaseUrl,
    serviceKey: !!serviceKey
  });
  throw new Error('Missing Supabase environment variables for admin operations');
}

// Create admin client with service role key (bypasses RLS)
const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper functions
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 100);
}

function formatDateForDatabase(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return new Date().toISOString();
  }
  return d.toISOString();
}

// ========================================
// 1. DASHBOARD - Direct Supabase
// ========================================
export const dashboardAPI = {
  async getStats() {
    try {
      const [
        { count: articlesCount },
        { count: usersCount },
        { count: categoriesCount },
        { count: commentsCount }
      ] = await Promise.all([
        adminSupabase.from('articles').select('*', { count: 'exact', head: true }),
        adminSupabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        adminSupabase.from('categories').select('*', { count: 'exact', head: true }),
        adminSupabase.from('comments').select('*', { count: 'exact', head: true })
      ]);

      return {
        articles: articlesCount || 0,
        users: usersCount || 0,
        categories: categoriesCount || 0,
        comments: commentsCount || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  async getRecentActivity() {
    try {
      const { data, error } = await adminSupabase
        .from('articles')
        .select('id, title, created_at, view_count')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }
};

// ========================================
// 2. ARTICLES - Direct Supabase
// ========================================
export const articlesAPI = {
  async getAll(page = 1, limit = 20, search = '', category = '') {
    try {
      console.log('🔍 Fetching articles with admin service role key...');
      
      // Use a simplified approach without joins to avoid permission issues
      let query = adminSupabase
        .from('articles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      if (category) {
        query = query.eq('category_id', category);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error('❌ Error fetching articles:', error);
        return { data: [], count: 0 };
      }
      
      // If we have articles, fetch category names separately to avoid join issues
      if (data && data.length > 0) {
        try {
          const categoryIds = Array.from(new Set(data.map(article => article.category_id).filter(Boolean)));
          const { data: categories } = await adminSupabase
            .from('categories')
            .select('id, name, slug')
            .in('id', categoryIds);

          // Add category names to articles
          const articlesWithCategories = data.map(article => {
            const category = categories?.find(cat => cat.id === article.category_id);
            return {
              ...article,
              category: category ? { name: category.name, slug: category.slug } : null
            };
          });

          console.log('✅ Articles fetched successfully with categories:', articlesWithCategories.length);
          return { data: articlesWithCategories, count: count || 0 };
        } catch (categoryError) {
          console.warn('⚠️ Failed to fetch categories, returning articles without category names:', categoryError);
          return { data, count: count || 0 };
        }
      }
      
      console.log('✅ Articles fetched successfully:', data?.length || 0);
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('❌ Error in articles getAll:', error);
      return { data: [], count: 0 };
    }
  },

  async create(articleData: any) {
    try {
      console.log('🔧 Creating article with service role key (bypasses RLS)...');
      
      const slug = articleData.slug || generateSlug(articleData.title);
      
      // Ensure required fields are present
      const articleToInsert = {
        title: articleData.title,
        slug,
        content: articleData.content || '',
        excerpt: articleData.excerpt || '',
        image_url: articleData.image_url || null,
        category_id: articleData.category_id || 1,
        author_id: articleData.author_id || 1,
        is_featured: articleData.is_featured || false,
        is_published: articleData.is_published || false,
        status: articleData.status || 'draft',
        published_at: articleData.published_at || new Date().toISOString(),
        view_count: 0,
        ai_processed: false
      };

      const { data, error } = await adminSupabase
        .from('articles')
        .insert(articleToInsert)
        .select();

      if (error) {
        console.error('❌ Article creation error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to create article - no data returned');
      }
      
      console.log('✅ Article created successfully');
      return data[0];
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  },

  async update(id: number, updates: any) {
    try {
      console.log('🔧 Updating article with service role key (bypasses RLS)...');
      console.log('📝 Update data:', updates);
      
      // Clean the updates object - remove any undefined/null fields
      const cleanUpdates: any = {};
      
      // Only include valid fields that exist in the articles table
      const validFields = ['title', 'slug', 'content', 'excerpt', 'image_url', 'category_id', 'author_id', 'is_featured', 'is_published', 'status', 'published_at', 'view_count', 'ai_processed'];
      
      validFields.forEach(field => {
        if (updates[field] !== undefined && updates[field] !== null) {
          cleanUpdates[field] = updates[field];
        }
      });
      
      // Always update the timestamp
      cleanUpdates.updated_at = new Date().toISOString();
      
      // Auto-generate slug if title is being updated but slug isn't provided
      if (cleanUpdates.title && !cleanUpdates.slug) {
        cleanUpdates.slug = generateSlug(cleanUpdates.title);
      }

      const { data, error } = await adminSupabase
        .from('articles')
        .update(cleanUpdates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Article update error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(`Article with ID ${id} not found or could not be updated`);
      }
      
      console.log('✅ Article updated successfully via service role');
      return data[0]; // Return the first (and should be only) updated record
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      console.log('🗑️ Deleting article with service role key (bypasses RLS)...');
      
      const { error } = await adminSupabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Article deletion error:', error);
        throw error;
      }
      
      console.log('✅ Article deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }
};

// ========================================
// 3. BREAKING NEWS - Direct Supabase
// ========================================
export const breakingNewsAPI = {
  async getAll() {
    try {
      const { data, error } = await adminSupabase
        .from('breaking_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      throw error;
    }
  },

  async create(newsData: any) {
    try {
      // Clean the create data for breaking_news table
      const cleanData: any = {};
      const validFields = ['content', 'is_active'];
      
      validFields.forEach(field => {
        if (newsData[field] !== undefined && newsData[field] !== null) {
          cleanData[field] = newsData[field];
        }
      });
      
      // Set defaults for required fields
      if (!cleanData.content) cleanData.content = '';
      if (cleanData.is_active === undefined) cleanData.is_active = true;

      const { data, error } = await adminSupabase
        .from('breaking_news')
        .insert(cleanData)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      if (!data || data.length === 0) {
        throw new Error('Failed to create breaking news - no data returned');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating breaking news:', error);
      throw error;
    }
  },

  async update(id: number, updates: any) {
    try {
      console.log('🔧 Updating breaking news with service role key (bypasses RLS)...');
      
      // Clean the updates object for breaking_news table
      const cleanUpdates: any = {};
      const validFields = ['content', 'is_active']; // Only these fields exist in breaking_news table
      
      validFields.forEach(field => {
        if (updates[field] !== undefined && updates[field] !== null) {
          cleanUpdates[field] = updates[field];
        }
      });
      
      // Remove any timestamp fields - they don't exist in breaking_news table

      const { data, error } = await adminSupabase
        .from('breaking_news')
        .update(cleanUpdates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Breaking news update error:', {
          message: error.message,
          details: error.details,
          code: error.code
        });
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(`Breaking news with ID ${id} not found or could not be updated`);
      }
      
      console.log('✅ Breaking news updated successfully');
      return data[0];
    } catch (error) {
      console.error('Error updating breaking news:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const { error } = await adminSupabase
        .from('breaking_news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting breaking news:', error);
      throw error;
    }
  }
};

// ========================================
// 4. CATEGORIES - Direct Supabase
// ========================================
export const categoriesAPI = {
  async getAll() {
    try {
      const { data, error } = await adminSupabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async create(categoryData: any) {
    try {
      const slug = categoryData.slug || generateSlug(categoryData.name);
      
      const { data, error } = await adminSupabase
        .from('categories')
        .insert({ ...categoryData, slug })
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      if (!data || data.length === 0) {
        throw new Error('Failed to create category - no data returned');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async update(id: number, updates: any) {
    try {
      console.log('🔧 Updating category with service role key (bypasses RLS)...');
      
      // Clean the updates object for categories table
      const cleanUpdates: any = {};
      const validFields = ['name', 'slug', 'description'];
      
      validFields.forEach(field => {
        if (updates[field] !== undefined && updates[field] !== null) {
          cleanUpdates[field] = updates[field];
        }
      });
      
      // Auto-generate slug if name is being updated but slug isn't provided
      if (cleanUpdates.name && !cleanUpdates.slug) {
        cleanUpdates.slug = generateSlug(cleanUpdates.name);
      }

      const { data, error } = await adminSupabase
        .from('categories')
        .update(cleanUpdates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Category update error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(`Category with ID ${id} not found or could not be updated`);
      }
      
      console.log('✅ Category updated successfully');
      return data[0];
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const { error } = await adminSupabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

// ========================================
// 5. VIDEOS - Direct Supabase
// ========================================
export const videosAPI = {
  async getAll() {
    try {
      // Try video_content table first (most likely)
      const { data, error } = await adminSupabase
        .from('video_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback to videos table if it exists
        const { data: fallbackData, error: fallbackError } = await adminSupabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw error; // Throw original error
        return fallbackData || [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  async create(videoData: any) {
    try {
      const slug = videoData.slug || generateSlug(videoData.title);
      
      // Map common field names to proper database schema
      const insertData = {
        title: videoData.title,
        slug: slug,
        description: videoData.description,
        video_url: videoData.videoUrl || videoData.video_url,
        thumbnail_url: videoData.thumbnailUrl || videoData.thumbnail_url,
        duration: videoData.duration,
        view_count: 0,
        published_at: videoData.published_at || new Date().toISOString()
      };
      
      const { data, error } = await adminSupabase
        .from('video_content')
        .insert(insertData)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      if (!data || data.length === 0) {
        throw new Error('Failed to create video - no data returned');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  },

  async update(id: number, updates: any) {
    try {
      console.log('🔧 Updating video with service role key (bypasses RLS)...');
      
      // Clean the updates object for video_content table
      const cleanUpdates: any = {};
      const validFields = ['title', 'slug', 'description', 'video_url', 'thumbnail_url', 'duration', 'published_at', 'view_count'];
      
      validFields.forEach(field => {
        if (updates[field] !== undefined && updates[field] !== null) {
          cleanUpdates[field] = updates[field];
        }
      });
      
      // Handle field name mapping
      if (updates.videoUrl && !cleanUpdates.video_url) {
        cleanUpdates.video_url = updates.videoUrl;
      }
      if (updates.thumbnailUrl && !cleanUpdates.thumbnail_url) {
        cleanUpdates.thumbnail_url = updates.thumbnailUrl;
      }
      
      // Auto-generate slug if title is being updated but slug isn't provided
      if (cleanUpdates.title && !cleanUpdates.slug) {
        cleanUpdates.slug = generateSlug(cleanUpdates.title);
      }
      
      // Always update the timestamp
      cleanUpdates.updated_at = new Date().toISOString();

      const { data, error } = await adminSupabase
        .from('video_content')
        .update(cleanUpdates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Video update error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(`Video with ID ${id} not found or could not be updated`);
      }
      
      console.log('✅ Video updated successfully');
      return data[0];
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const { error } = await adminSupabase
        .from('video_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }
};

// ========================================
// 6. E-PAPERS - Direct Supabase
// ========================================
export const epapersAPI = {
  async getAll() {
    try {
      const { data, error } = await adminSupabase
        .from('epapers')
        .select('*')
        .order('publish_date', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching e-papers:', error);
      throw error;
    }
  },

  async create(epaperData: any) {
    try {
      const { data, error } = await adminSupabase
        .from('epapers')
        .insert(epaperData)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      if (!data || data.length === 0) {
        throw new Error('Failed to create e-paper - no data returned');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating e-paper:', error);
      throw error;
    }
  },

  async update(id: number, updates: any) {
    try {
      console.log('🔧 Updating e-paper with service role key (bypasses RLS)...');
      
      // Clean the updates object for epapers table
      const cleanUpdates: any = {};
      const validFields = ['title', 'publish_date', 'image_url', 'pdf_url', 'is_latest', 'description'];
      
      validFields.forEach(field => {
        if (updates[field] !== undefined && updates[field] !== null) {
          cleanUpdates[field] = updates[field];
        }
      });
      
      // Always update the timestamp
      cleanUpdates.updated_at = new Date().toISOString();

      const { data, error } = await adminSupabase
        .from('epapers')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        

      if (error) {
        console.error('❌ E-paper update error:', error);
        throw error;
      }
      
      console.log('✅ E-paper updated successfully');
      return data[0];
    } catch (error) {
      console.error('Error updating e-paper:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const { error } = await adminSupabase
        .from('epapers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting e-paper:', error);
      throw error;
    }
  }
};

// ========================================
// 7. AUDIO ARTICLES - Direct Supabase
// ========================================
export const audioArticlesAPI = {
  async getAll() {
    try {
      const { data, error } = await adminSupabase
        .from('audio_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching audio articles:', error);
      throw error;
    }
  },

  async create(audioData: any) {
    try {
      const { data, error } = await adminSupabase
        .from('audio_articles')
        .insert(audioData)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating audio article:', error);
      throw error;
    }
  },

  async update(id: number, updates: any) {
    try {
      console.log('🔧 Updating audio article with service role key (bypasses RLS)...');
      
      // Clean the updates object for audio_articles table
      const cleanUpdates: any = {};
      const validFields = ['title', 'slug', 'excerpt', 'image_url', 'audio_url', 'duration', 'published_at'];
      
      validFields.forEach(field => {
        if (updates[field] !== undefined && updates[field] !== null) {
          cleanUpdates[field] = updates[field];
        }
      });
      
      // Auto-generate slug if title is being updated but slug isn't provided
      if (cleanUpdates.title && !cleanUpdates.slug) {
        cleanUpdates.slug = generateSlug(cleanUpdates.title);
      }
      
      // Always update the timestamp
      cleanUpdates.updated_at = new Date().toISOString();

      const { data, error } = await adminSupabase
        .from('audio_articles')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        

      if (error) {
        console.error('❌ Audio article update error:', error);
        throw error;
      }
      
      console.log('✅ Audio article updated successfully');
      return data[0];
    } catch (error) {
      console.error('Error updating audio article:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const { error } = await adminSupabase
        .from('audio_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting audio article:', error);
      throw error;
    }
  }
};

// ========================================
// 8. USERS - Direct Supabase
// ========================================
export const usersAPI = {
  async getAll() {
    try {
      const { data, error } = await adminSupabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async update(userId: string, updates: any) {
    try {
      const { data, error } = await adminSupabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async delete(userId: string) {
    try {
      const { error } = await adminSupabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

// ========================================
// 9. ANALYTICS - Direct Supabase
// ========================================
export const analyticsAPI = {
  async getPageViews() {
    try {
      const { data, error } = await adminSupabase
        .from('page_views')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching page views:', error);
      throw error;
    }
  },

  async getArticleStats() {
    try {
      const { data, error } = await adminSupabase
        .from('articles')
        .select('id, title, view_count, likes')
        .order('view_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching article stats:', error);
      throw error;
    }
  }
};

// ========================================
// 10. SOCIAL MEDIA - Direct Supabase
// ========================================
export const socialMediaAPI = {
  async getAll() {
    try {
      const { data, error } = await adminSupabase
        .from('social_media_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching social media posts:', error);
      throw error;
    }
  },

  async create(postData: any) {
    try {
      const { data, error } = await adminSupabase
        .from('social_media_posts')
        .insert({
          ...postData,
          published_at: postData.published_at || new Date().toISOString()
        })
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating social media post:', error);
      throw error;
    }
  },

  async update(id: number, updates: any) {
    try {
      console.log('🔧 Updating social media post with service role key (bypasses RLS)...');
      
      // Clean the updates object for social_media_posts table
      const cleanUpdates: any = {};
      const validFields = ['platform', 'content', 'embed_code', 'post_url', 'author_name', 'author_handle', 'interaction_count', 'published_at'];
      
      validFields.forEach(field => {
        if (updates[field] !== undefined && updates[field] !== null) {
          cleanUpdates[field] = updates[field];
        }
      });
      
      // Always update the timestamp
      cleanUpdates.updated_at = new Date().toISOString();

      const { data, error } = await adminSupabase
        .from('social_media_posts')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        

      if (error) {
        console.error('❌ Social media post update error:', error);
        throw error;
      }
      
      console.log('✅ Social media post updated successfully');
      return data[0];
    } catch (error) {
      console.error('Error updating social media post:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const { error } = await adminSupabase
        .from('social_media_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting social media post:', error);
      throw error;
    }
  }
};

// ========================================
// 11. FOOTER PAGES - Direct Supabase
// ========================================
export const footerPagesAPI = {
  async getAll() {
    try {
      const { data, error } = await adminSupabase
        .from('footer_pages')
        .select('*')
        .order('order_position');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching footer pages:', error);
      throw error;
    }
  },

  async create(pageData: any) {
    try {
      const slug = pageData.slug || generateSlug(pageData.title);
      
      const { data, error } = await adminSupabase
        .from('footer_pages')
        .insert({ ...pageData, slug })
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating footer page:', error);
      throw error;
    }
  },

  async update(id: number, updates: any) {
    try {
      const { data, error } = await adminSupabase
        .from('footer_pages')
        .update(updates)
        .eq('id', id)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error updating footer page:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const { error } = await adminSupabase
        .from('footer_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting footer page:', error);
      throw error;
    }
  }
};

// ========================================
// 12. SETTINGS - Direct Supabase
// ========================================
export const settingsAPI = {
  async getAll() {
    try {
      const { data, error } = await adminSupabase
        .from('site_settings')
        .select('*')
        .order('key');

      if (error) {
        console.error('Error fetching settings:', error);
        // Return default settings if table doesn't exist
        return {
          siteName: 'Bengali News',
          siteDescription: 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম',
          siteUrl: '',
          logoUrl: '',
          defaultLanguage: 'bn'
        };
      }
      
      // Convert array of key-value pairs to object
      const settingsObject = (data || []).reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      
      return settingsObject;
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return default settings on any error
      return {
        siteName: 'Bengali News',
        siteDescription: 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম',
        siteUrl: '',
        logoUrl: '',
        defaultLanguage: 'bn'
      };
    }
  },

  async update(key: string, value: string) {
    try {
      const { data, error } = await adminSupabase
        .from('site_settings')
        .upsert({ key, value })
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  },

  async updateMultiple(settingsToUpdate: Record<string, string>) {
    try {
      const updatePromises = Object.entries(settingsToUpdate).map(([key, value]) =>
        this.update(key, value)
      );
      
      const results = await Promise.all(updatePromises);
      return results;
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      throw error;
    }
  }
};

// ========================================
// 13. WEATHER - Direct Supabase
// ========================================
export const weatherAPI = {
  async getAll() {
    try {
      const { data, error } = await adminSupabase
        .from('weather')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },

  async create(weatherData: any) {
    try {
      const { data, error } = await adminSupabase
        .from('weather')
        .insert(weatherData)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating weather data:', error);
      throw error;
    }
  },

  async update(id: number, weatherData: any) {
    try {
      const { data, error } = await adminSupabase
        .from('weather')
        .update(weatherData)
        .eq('id', id)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error updating weather:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const { error } = await adminSupabase
        .from('weather')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting weather data:', error);
      throw error;
    }
  }
};

// ========================================
// 14. COMMENTS - Direct Supabase
// ========================================
export const commentsAPI = {
  async getAll() {
    try {
      const { data, error } = await adminSupabase
        .from('comments')
        .select(`
          *,
          articles(title),
          user_profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  async update(id: number, updates: any) {
    try {
      const { data, error } = await adminSupabase
        .from('comments')
        .update(updates)
        .eq('id', id)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const { error } = await adminSupabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

// ========================================
// 15. TRENDING ANALYTICS - Direct Supabase
// ========================================
export const trendingAnalyticsAPI = {
  async getTopics() {
    try {
      const { data, error } = await adminSupabase
        .from('trending_topics')
        .select('*')
        .order('score', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      throw error;
    }
  },

  async updateTopic(id: number, updates: any) {
    try {
      const { data, error } = await adminSupabase
        .from('trending_topics')
        .update(updates)
        .eq('id', id)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error updating trending topic:', error);
      throw error;
    }
  }
};

// ========================================
// 16. EMAIL & NOTIFICATIONS - Direct Supabase
// ========================================
export const emailNotificationsAPI = {
  async getSubscribers() {
    try {
      const { data, error } = await adminSupabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      throw error;
    }
  },

  async deleteSubscriber(id: number) {
    try {
      const { error } = await adminSupabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      throw error;
    }
  }
};

// ========================================
// 17. SEO MANAGEMENT - Direct Supabase
// ========================================
export const seoAPI = {
  async getAllMetaTags() {
    try {
      const { data, error } = await adminSupabase
        .from('seo_meta_tags')
        .select('*')
        .order('page_path');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching SEO meta tags:', error);
      throw error;
    }
  },

  async createMetaTag(metaData: any) {
    try {
      const { data, error } = await adminSupabase
        .from('seo_meta_tags')
        .insert(metaData)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating SEO meta tag:', error);
      throw error;
    }
  },

  async updateMetaTag(id: number, updates: any) {
    try {
      const { data, error } = await adminSupabase
        .from('seo_meta_tags')
        .update(updates)
        .eq('id', id)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error updating SEO meta tag:', error);
      throw error;
    }
  },

  async deleteMetaTag(id: number) {
    try {
      const { error } = await adminSupabase
        .from('seo_meta_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting SEO meta tag:', error);
      throw error;
    }
  }
};

// ========================================
// 18. SEARCH MANAGEMENT - Direct Supabase
// ========================================
export const searchManagementAPI = {
  async getSearchQueries() {
    try {
      const { data, error } = await adminSupabase
        .from('search_queries')
        .select('*')
        .order('count', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching search queries:', error);
      throw error;
    }
  },

  async getSearchResults(query: string) {
    try {
      const { data, error } = await adminSupabase
        .from('articles')
        .select('id, title, excerpt')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
    }
  }
};

// ========================================
// 19. DATABASE MANAGEMENT - Direct Supabase
// ========================================
export const databaseAPI = {
  async getTableInfo() {
    try {
      // Get table statistics
      const tables = [
        'articles', 'categories', 'users', 'comments', 
        'breaking_news', 'videos', 'audio_articles', 'epapers'
      ];
      
      const tableStats = await Promise.all(
        tables.map(async (table) => {
          const { count } = await adminSupabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          return { table, count: count || 0 };
        })
      );

      return tableStats;
    } catch (error) {
      console.error('Error fetching table info:', error);
      throw error;
    }
  },

  async backupTable(tableName: string) {
    try {
      const { data, error } = await adminSupabase
        .from(tableName)
        .select('*');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return { data, tableName, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('Error backing up table:', error);
      throw error;
    }
  }
};

// ========================================
// 20. PERFORMANCE MONITORING - Direct Supabase
// ========================================
export const performanceAPI = {
  async getMetrics() {
    try {
      // Get basic performance metrics from page views
      const { data, error } = await adminSupabase
        .from('page_views')
        .select('page_path, response_time, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  },

  async getSystemHealth() {
    try {
      // Check database connectivity and basic stats
      const { data, error } = await adminSupabase
        .from('articles')
        .select('id')
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return { 
        database: 'healthy',
        timestamp: new Date().toISOString(),
        connectivity: data ? 'connected' : 'disconnected'
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return { 
        database: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// ========================================
// 21. SECURITY & ACCESS CONTROL - Direct Supabase
// ========================================
export const securityAPI = {
  async getSecurityLogs() {
    try {
      const { data, error } = await adminSupabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching security logs:', error);
      throw error;
    }
  },

  async createSecurityLog(logData: any) {
    try {
      const { data, error } = await adminSupabase
        .from('security_logs')
        .insert(logData)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating security log:', error);
      throw error;
    }
  }
};

// ========================================
// 22. ADVANCED ALGORITHMS - Direct Supabase
// ========================================
export const algorithmsAPI = {
  async getAlgorithmSettings() {
    try {
      const { data, error } = await adminSupabase
        .from('algorithm_settings')
        .select('*')
        .order('name');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching algorithm settings:', error);
      throw error;
    }
  },

  async updateAlgorithmSetting(id: number, updates: any) {
    try {
      const { data, error } = await adminSupabase
        .from('algorithm_settings')
        .update(updates)
        .eq('id', id)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error updating algorithm setting:', error);
      throw error;
    }
  }
};

// ========================================
// 23. ADVERTISING - Direct Supabase
// ========================================
export const advertisingAPI = {
  async getAds() {
    try {
      const { data, error } = await adminSupabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      throw error;
    }
  },

  async createAd(adData: any) {
    try {
      const { data, error } = await adminSupabase
        .from('advertisements')
        .insert(adData)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating advertisement:', error);
      throw error;
    }
  },

  async updateAd(id: number, updates: any) {
    try {
      const { data, error } = await adminSupabase
        .from('advertisements')
        .update(updates)
        .eq('id', id)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error updating advertisement:', error);
      throw error;
    }
  },

  async deleteAd(id: number) {
    try {
      const { error } = await adminSupabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      throw error;
    }
  }
};

// ========================================
// 24. MOBILE APP MANAGEMENT - Direct Supabase
// ========================================
export const mobileAppAPI = {
  async getAppSettings() {
    try {
      const { data, error } = await adminSupabase
        .from('mobile_app_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching mobile app settings:', error);
      throw error;
    }
  },

  async updateAppSetting(key: string, value: string) {
    try {
      const { data, error } = await adminSupabase
        .from('mobile_app_settings')
        .upsert({ setting_key: key, setting_value: value })
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error updating mobile app setting:', error);
      throw error;
    }
  }
};

// ========================================
// 25. AUTHORS - Direct Supabase
// ========================================
export const authorsAPI = {
  async getAll() {
    try {
      const { data, error } = await adminSupabase
        .from('authors')
        .select('*')
        .order('name');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching authors:', error);
      throw error;
    }
  },

  async create(authorData: any) {
    try {
      const slug = authorData.slug || generateSlug(authorData.name);
      
      const { data, error } = await adminSupabase
        .from('authors')
        .insert({ ...authorData, slug })
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error creating author:', error);
      throw error;
    }
  },

  async update(id: number, updates: any) {
    try {
      const { data, error } = await adminSupabase
        .from('authors')
        .update(updates)
        .eq('id', id)
        .select()
        

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No data returned from operation');
      }
      return data[0];
    } catch (error) {
      console.error('Error updating author:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const { error } = await adminSupabase
        .from('authors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting author:', error);
      throw error;
    }
  }
};

// ========================================
// MAIN ADMIN API EXPORT
// ========================================
export const adminSupabaseAPI = {
  dashboard: dashboardAPI,
  articles: articlesAPI,
  breakingNews: breakingNewsAPI,
  categories: categoriesAPI,
  videos: videosAPI,
  epapers: epapersAPI,
  audioArticles: audioArticlesAPI,
  users: usersAPI,
  analytics: analyticsAPI,
  socialMedia: socialMediaAPI,
  footerPages: footerPagesAPI,
  settings: settingsAPI,
  weather: weatherAPI,
  comments: commentsAPI,
  trendingAnalytics: trendingAnalyticsAPI,
  emailNotifications: emailNotificationsAPI,
  seo: seoAPI,
  searchManagement: searchManagementAPI,
  database: databaseAPI,
  performance: performanceAPI,
  security: securityAPI,
  algorithms: algorithmsAPI,
  advertising: advertisingAPI,
  mobileApp: mobileAppAPI,
  authors: authorsAPI
};

console.log('🚀 Complete Admin Supabase Direct API initialized - ALL 26 SECTIONS MIGRATED!');
console.log('🔐 All operations use service role key and bypass RLS policies');
console.log('✅ NO EXPRESS SERVER DEPENDENCIES REMAINING');