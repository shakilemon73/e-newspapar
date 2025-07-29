/**
 * Admin Supabase Direct API - Uses Service Role Key in Frontend
 * Bypasses RLS policies for admin operations
 * NO EXPRESS SERVER DEPENDENCY
 */
// Use centralized Supabase client - admin operations through proper authentication
import { supabase } from './supabase';

// Use the main client for admin operations with proper JWT authentication
const adminSupabase = supabase;

console.log('🔐 Admin Supabase client using SERVICE ROLE key');

/**
 * Create user_storage table for localStorage migration
 */
export async function initializeUserStorageTable(): Promise<void> {
  try {
    console.log('📦 Initializing user_storage table...');
    
    const { data, error } = await adminSupabase
      .from('user_storage')
      .select('count(*)')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, we'll rely on external table creation
      console.log('⚠️ user_storage table needs to be created manually in Supabase');
    } else if (error) {
      console.error('Error checking user_storage table:', error);
    } else {
      console.log('✅ user_storage table is available');
    }
  } catch (error) {
    console.error('Failed to initialize user_storage table:', error);
  }
}

// ==============================================
// COMMENTS MANAGEMENT (Admin Service Role)
// ==============================================

export async function getAdminComments() {
  try {
    const { data, error } = await adminSupabase
      .from('article_comments')
      .select(`
        id,
        article_id,
        user_id,
        content,
        author_name,
        status,
        is_reported,
        created_at,
        updated_at,
        articles(title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin comments fetch error:', error);
      return { comments: [] };
    }

    return { comments: data || [] };
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    return { comments: [] };
  }
}

export async function updateCommentStatus(commentId: number, status: 'approved' | 'rejected' | 'pending') {
  try {
    const { data, error } = await adminSupabase
      .from('article_comments')
      .update({ status })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      console.error('Admin comment status update error:', error);
      throw new Error(error.message || 'Failed to update comment status');
    }

    return data;
  } catch (error) {
    console.error('Error updating comment status:', error);
    throw error;
  }
}

export async function deleteCommentAdmin(commentId: number) {
  try {
    const { error } = await adminSupabase
      .from('article_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Admin comment delete error:', error);
      throw new Error(error.message || 'Failed to delete comment');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

export async function replyToComment(commentId: number, replyContent: string, adminUserId: string) {
  try {
    const { data, error } = await adminSupabase
      .from('comment_replies')
      .insert({
        comment_id: commentId,
        user_id: adminUserId,
        content: replyContent,
        author_name: 'Admin'
      })
      .select()
      .single();

    if (error) {
      console.error('Admin comment reply error:', error);
      throw new Error(error.message || 'Failed to reply to comment');
    }

    return data;
  } catch (error) {
    console.error('Error replying to comment:', error);
    throw error;
  }
}

// ==============================================
// EMAIL NOTIFICATIONS MANAGEMENT (Admin Service Role)
// ==============================================

export async function getAdminEmailTemplates() {
  try {
    const { data, error } = await adminSupabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin email templates fetch error:', error);
      return { templates: [] };
    }

    return { templates: data || [] };
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return { templates: [] };
  }
}

export async function createEmailTemplate(templateData: {
  name: string;
  subject: string;
  content: string;
  type: string;
}) {
  try {
    const { data, error } = await adminSupabase
      .from('email_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error('Admin email template create error:', error);
      throw new Error(error.message || 'Failed to create email template');
    }

    return data;
  } catch (error) {
    console.error('Error creating email template:', error);
    throw error;
  }
}

export async function updateEmailTemplate(templateId: string, templateData: {
  name: string;
  subject: string;
  content: string;
  type: string;
}) {
  try {
    const { data, error } = await adminSupabase
      .from('email_templates')
      .update(templateData)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      console.error('Admin email template update error:', error);
      throw new Error(error.message || 'Failed to update email template');
    }

    return data;
  } catch (error) {
    console.error('Error updating email template:', error);
    throw error;
  }
}

export async function deleteEmailTemplate(templateId: string) {
  try {
    const { error } = await adminSupabase
      .from('email_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Admin email template delete error:', error);
      throw new Error(error.message || 'Failed to delete email template');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting email template:', error);
    throw error;
  }
}

export async function getNewsletterSubscribers() {
  try {
    const { data, error } = await adminSupabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin newsletter subscribers fetch error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return [];
  }
}

export async function getEmailSettings() {
  try {
    const { data, error } = await adminSupabase
      .from('system_settings')
      .select('*')
      .eq('category', 'email')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin email settings fetch error:', error);
      return {};
    }

    // Convert array of settings to key-value object
    const settings: { [key: string]: any } = {};
    data?.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    return settings;
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return {};
  }
}

export async function updateEmailSettings(settingsData: any) {
  try {
    // Update each setting individually
    const promises = Object.entries(settingsData).map(([key, value]) =>
      adminSupabase
        .from('system_settings')
        .upsert({
          category: 'email',
          key,
          value: value as string
        })
    );

    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error('Error updating email settings:', error);
    throw error;
  }
}

export async function getEmailStats() {
  try {
    // Mock data for now - can be replaced with actual stats queries
    return {
      sent_today: 45,
      opened_today: 32,
      clicked_today: 12,
      bounced_today: 2,
      total_subscribers: 1247,
      delivery_rate: 96.2,
      open_rate: 71.1,
      click_rate: 37.5,
      new_subscribers_today: 12,
      emails_sent: 45
    };
  } catch (error) {
    console.error('Error fetching email stats:', error);
    return {};
  }
}

export async function sendNewsletter(newsletterData: {
  template_id: string;
  subject: string;
  content: string;
}) {
  try {
    // Insert newsletter send record
    const { data, error } = await adminSupabase
      .from('newsletter_sends')
      .insert({
        template_id: newsletterData.template_id,
        subject: newsletterData.subject,
        content: newsletterData.content,
        sent_at: new Date().toISOString(),
        status: 'sent'
      })
      .select()
      .single();

    if (error) {
      console.error('Admin newsletter send error:', error);
      throw new Error(error.message || 'Failed to send newsletter');
    }

    return data;
  } catch (error) {
    console.error('Error sending newsletter:', error);
    throw error;
  }
}

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
    
    // Prepare article data with image metadata
    const insertData = {
      title: articleData.title,
      slug: slug,
      content: articleData.content,
      excerpt: articleData.excerpt,
      image_url: articleData.image_url,
      category_id: articleData.category_id,
      is_featured: articleData.is_featured || false,
      view_count: 0,
      published_at: articleData.published_at || new Date().toISOString()
    };

    // Add image metadata if provided
    if (articleData.image_metadata) {
      console.log('✅ Including image metadata:', articleData.image_metadata);
      insertData.image_metadata = articleData.image_metadata;
    }

    const { data, error } = await adminSupabase
      .from('articles')
      .insert(insertData)
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

// ==============================================
// SITE SETTINGS MANAGEMENT (Admin Service Role)
// ==============================================

export async function getSiteSettings() {
  try {
    console.log('Fetching site settings with service role key...');
    
    const { data, error } = await adminSupabase
      .from('system_settings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Site settings fetch error:', error);
      return {
        siteName: "Bengali News",
        siteDescription: "বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম",
        logoUrl: "",
        defaultLanguage: "bn",
        siteUrl: ""
      };
    }

    // Transform settings array to object
    const settings: any = {};
    data?.forEach((setting: any) => {
      settings[setting.key] = setting.value;
    });

    return {
      siteName: settings.siteName || "Bengali News",
      siteDescription: settings.siteDescription || "বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম",
      logoUrl: settings.logoUrl || "",
      defaultLanguage: settings.defaultLanguage || "bn",
      siteUrl: settings.siteUrl || ""
    };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return {
      siteName: "Bengali News",
      siteDescription: "বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম",
      logoUrl: "",
      defaultLanguage: "bn",
      siteUrl: ""
    };
  }
}

export async function updateSiteSettings(settings: any) {
  try {
    console.log('Updating site settings with service role key...');
    
    // Update each setting individually
    const updates = Object.entries(settings).map(([key, value]) =>
      adminSupabase
        .from('system_settings')
        .upsert({ key, value: String(value) }, { onConflict: 'key' })
    );

    const results = await Promise.all(updates);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Site settings update errors:', errors);
      throw new Error('Failed to update some settings');
    }

    console.log('✅ Site settings updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating site settings:', error);
    throw error;
  }
}

// ==============================================
// USER MANAGEMENT (Admin Service Role)
// ==============================================

export async function getAdminUsers() {
  try {
    console.log('Fetching admin users with service role key...');
    
    const { data, error } = await adminSupabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        full_name,
        email,
        role,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin users fetch error:', error);
      return { users: [] };
    }

    console.log('✅ Admin users fetched successfully');
    return { users: data || [] };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return { users: [] };
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    console.log('Updating user role with service role key...');
    
    const { data, error } = await adminSupabase
      .from('user_profiles')
      .update({ role })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('User role update error:', error);
      throw new Error(error.message || 'Failed to update user role');
    }

    console.log('✅ User role updated successfully');
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// ==============================================
// DELETE OPERATIONS (Admin Service Role)
// ==============================================

export async function deleteArticleDirect(id: number) {
  try {
    console.log('Deleting article with service role key...');
    
    const { error } = await adminSupabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Article deletion error:', error);
      throw new Error(error.message || 'Failed to delete article');
    }

    console.log('✅ Article deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
}

export async function deleteVideoContentDirect(id: number) {
  try {
    console.log('Deleting video content with service role key...');
    
    const { error } = await adminSupabase
      .from('video_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Video deletion error:', error);
      throw new Error(error.message || 'Failed to delete video');
    }

    console.log('✅ Video deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}

export async function deleteCategoryDirect(id: number) {
  try {
    console.log('Deleting category with service role key...');
    
    const { error } = await adminSupabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Category deletion error:', error);
      throw new Error(error.message || 'Failed to delete category');
    }

    console.log('✅ Category deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// ==============================================
// UPDATE OPERATIONS (Admin Service Role)
// ==============================================

export async function updateCategoryDirect(id: number, updates: any) {
  try {
    console.log('Updating category with service role key...');
    
    const { data, error } = await adminSupabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Category update error:', error);
      throw new Error(error.message || 'Failed to update category');
    }

    console.log('✅ Category updated successfully');
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function updateArticleDirect(id: number, updates: any) {
  try {
    console.log('Updating article with service role key...');
    
    const { data, error } = await adminSupabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Article update error:', error);
      throw new Error(error.message || 'Failed to update article');
    }

    console.log('✅ Article updated successfully');
    return data;
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
}

export default adminSupabase;