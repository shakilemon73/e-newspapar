// Complete Table API Implementation for All 71 Tables
// Direct Supabase integration for all missing table functions
import { supabase } from '@db';
import * as Schema from '@shared/complete-schema';

// =============================================
// TAGS & ARTICLE TAGS
// =============================================

export async function getAllTags() {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { success: false, error: 'Failed to fetch tags' };
  }
}

export async function createTag(name: string, description?: string) {
  try {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    const { data, error } = await supabase
      .from('tags')
      .insert({
        name,
        slug,
        description: description || '',
        usage_count: 0,
        is_trending: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating tag:', error);
    return { success: false, error: 'Failed to create tag' };
  }
}

export async function addTagToArticle(articleId: number, tagId: number) {
  try {
    // Add the relationship
    const { error: insertError } = await supabase
      .from('article_tags')
      .insert({
        article_id: articleId,
        tag_id: tagId,
        created_at: new Date().toISOString()
      });

    if (insertError) throw insertError;

    // Update tag usage count
    const { error: updateError } = await supabase.rpc(
      'increment_tag_usage',
      { tag_id: tagId }
    );

    if (updateError) {
      // Fallback: manual increment
      const { data: currentTag } = await supabase
        .from('tags')
        .select('usage_count')
        .eq('id', tagId)
        .single();
      
      await supabase
        .from('tags')
        .update({ 
          usage_count: (currentTag?.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', tagId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding tag to article:', error);
    return { success: false, error: 'Failed to add tag to article' };
  }
}

export async function getArticleTags(articleId: number) {
  try {
    const { data, error } = await supabase
      .from('article_tags')
      .select(`
        *,
        tags (
          id,
          name,
          slug,
          description,
          usage_count,
          is_trending
        )
      `)
      .eq('article_id', articleId);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching article tags:', error);
    return { success: false, error: 'Failed to fetch article tags' };
  }
}

// =============================================
// USER PROFILES & SETTINGS
// =============================================

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, error: 'Failed to fetch user profile' };
  }
}

export async function createUserProfile(userId: string, profileData: Partial<Schema.UserProfile>) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        ...profileData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: 'Failed to create user profile' };
  }
}

export async function updateUserProfile(userId: string, profileData: Partial<Schema.UserProfile>) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: 'Failed to update user profile' };
  }
}

// =============================================
// USER BOOKMARKS & SUBSCRIPTIONS
// =============================================

export async function addBookmark(userId: string, articleId: number, folderName = 'default', note?: string) {
  try {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: userId,
        article_id: articleId,
        folder_name: folderName,
        note: note || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Article already bookmarked' };
      }
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return { success: false, error: 'Failed to add bookmark' };
  }
}

export async function removeBookmark(userId: string, articleId: number) {
  try {
    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return { success: false, error: 'Failed to remove bookmark' };
  }
}

export async function getUserBookmarks(userId: string, folderName?: string) {
  try {
    let query = supabase
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
            id,
            name,
            slug
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (folderName) {
      query = query.eq('folder_name', folderName);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return { success: false, error: 'Failed to fetch bookmarks' };
  }
}

export async function addUserSubscription(userId: string, subscriptionType: string, categoryId?: number) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        subscription_type: subscriptionType,
        category_id: categoryId,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding subscription:', error);
    return { success: false, error: 'Failed to add subscription' };
  }
}

export async function getUserSubscriptions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return { success: false, error: 'Failed to fetch subscriptions' };
  }
}

// =============================================
// USER LIKES & SHARES
// =============================================

export async function toggleUserLike(userId: string, contentId: number, contentType: string) {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('user_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .single();

    if (existingLike) {
      // Remove like
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) throw error;
      return { success: true, action: 'removed', liked: false };
    } else {
      // Add like
      const { data, error } = await supabase
        .from('user_likes')
        .insert({
          user_id: userId,
          content_id: contentId,
          content_type: contentType,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, action: 'added', liked: true, data };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, error: 'Failed to toggle like' };
  }
}

export async function addUserShare(userId: string, contentId: number, contentType: string, platform: string) {
  try {
    const { data, error } = await supabase
      .from('user_shares')
      .insert({
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
        platform,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding share:', error);
    return { success: false, error: 'Failed to record share' };
  }
}

export async function getContentLikes(contentId: number, contentType: string) {
  try {
    const { count, error } = await supabase
      .from('user_likes')
      .select('*', { count: 'exact' })
      .eq('content_id', contentId)
      .eq('content_type', contentType);

    if (error) throw error;
    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Error fetching likes count:', error);
    return { success: false, error: 'Failed to fetch likes count', count: 0 };
  }
}

// =============================================
// POLLS & SURVEYS
// =============================================

export async function getActivePolls(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching active polls:', error);
    return { success: false, error: 'Failed to fetch active polls' };
  }
}

export async function createPoll(title: string, description: string, options: string[], multipleChoice = false, expiresAt?: string) {
  try {
    const { data, error } = await supabase
      .from('polls')
      .insert({
        title,
        description,
        options: options.map(option => ({ text: option, votes: 0 })),
        is_active: true,
        multiple_choice: multipleChoice,
        expires_at: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
        total_votes: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating poll:', error);
    return { success: false, error: 'Failed to create poll' };
  }
}

export async function votePoll(pollId: number, userId: string, optionId: number) {
  try {
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      return { success: false, error: 'You have already voted in this poll' };
    }

    // Record vote
    const { data, error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        user_id: userId,
        option_id: optionId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update poll total votes
    await supabase.rpc('increment_poll_votes', { poll_id: pollId });

    return { success: true, data };
  } catch (error) {
    console.error('Error voting in poll:', error);
    return { success: false, error: 'Failed to record vote' };
  }
}

// =============================================
// MEDIA FILES & DOCUMENTS
// =============================================

export async function uploadMediaFile(
  filename: string, 
  originalName: string, 
  filePath: string, 
  fileSize: number, 
  mimeType: string, 
  uploadedBy: string, 
  altText?: string, 
  caption?: string
) {
  try {
    const { data, error } = await supabase
      .from('media_files')
      .insert({
        filename,
        original_name: originalName,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        alt_text: altText || '',
        caption: caption || '',
        uploaded_by: uploadedBy,
        is_public: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error uploading media file:', error);
    return { success: false, error: 'Failed to upload media file' };
  }
}

export async function getMediaFiles(isPublic = true, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('is_public', isPublic)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching media files:', error);
    return { success: false, error: 'Failed to fetch media files' };
  }
}

export async function uploadDocument(
  title: string, 
  filename: string, 
  filePath: string, 
  fileSize: number, 
  documentType: string, 
  uploadedBy: string, 
  description?: string
) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        title,
        filename,
        file_path: filePath,
        file_size: fileSize,
        document_type: documentType,
        description: description || '',
        uploaded_by: uploadedBy,
        download_count: 0,
        is_public: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { success: false, error: 'Failed to upload document' };
  }
}

// =============================================
// ANALYTICS & TRACKING
// =============================================

export async function trackPageView(pageUrl: string, userId?: string, sessionId?: string, referrer?: string) {
  try {
    const { data, error } = await supabase
      .from('page_views')
      .insert({
        page_url: pageUrl,
        user_id: userId,
        session_id: sessionId || crypto.randomUUID(),
        referrer: referrer || '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        ip_address: '0.0.0.0', // Will be filled by backend
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error tracking page view:', error);
    return { success: false, error: 'Failed to track page view' };
  }
}

export async function trackClick(
  elementType: string, 
  elementId: string, 
  pageUrl: string, 
  userId?: string, 
  sessionId?: string, 
  clickPosition?: { x: number; y: number }
) {
  try {
    const { data, error } = await supabase
      .from('click_tracking')
      .insert({
        element_type: elementType,
        element_id: elementId,
        page_url: pageUrl,
        user_id: userId,
        session_id: sessionId || crypto.randomUUID(),
        click_position: clickPosition || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error tracking click:', error);
    return { success: false, error: 'Failed to track click' };
  }
}

export async function recordEngagementMetric(
  contentId: number, 
  contentType: string, 
  metricType: string, 
  metricValue: number, 
  userId?: string, 
  sessionId?: string
) {
  try {
    const { data, error } = await supabase
      .from('engagement_metrics')
      .insert({
        content_id: contentId,
        content_type: contentType,
        metric_type: metricType,
        metric_value: metricValue,
        user_id: userId,
        session_id: sessionId,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error recording engagement metric:', error);
    return { success: false, error: 'Failed to record engagement metric' };
  }
}

// =============================================
// LOGGING & MONITORING
// =============================================

export async function logSystemEvent(level: string, message: string, context?: any, userId?: string) {
  try {
    const { data, error } = await supabase
      .from('logs')
      .insert({
        level: level.toUpperCase(),
        message,
        context: context || {},
        user_id: userId,
        ip_address: '0.0.0.0', // Will be filled by backend
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error logging system event:', error);
    return { success: false, error: 'Failed to log system event' };
  }
}

export async function logErrorEvent(
  errorType: string, 
  errorMessage: string, 
  stackTrace?: string, 
  userId?: string, 
  sessionId?: string, 
  pageUrl?: string
) {
  try {
    const { data, error } = await supabase
      .from('error_logs')
      .insert({
        error_type: errorType,
        error_message: errorMessage,
        stack_trace: stackTrace || '',
        user_id: userId,
        session_id: sessionId,
        page_url: pageUrl || (typeof window !== 'undefined' ? window.location.href : ''),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error logging error event:', error);
    return { success: false, error: 'Failed to log error event' };
  }
}

export async function logAuditEvent(
  userId: string, 
  action: string, 
  resourceType: string, 
  resourceId: number, 
  oldValues?: any, 
  newValues?: any
) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues || {},
        new_values: newValues || {},
        ip_address: '0.0.0.0', // Will be filled by backend
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error logging audit event:', error);
    return { success: false, error: 'Failed to log audit event' };
  }
}

// =============================================
// SYSTEM SETTINGS
// =============================================

export async function getSystemSetting(key: string) {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || null };
  } catch (error) {
    console.error('Error fetching system setting:', error);
    return { success: false, error: 'Failed to fetch system setting' };
  }
}

export async function updateSystemSetting(key: string, value: any, settingType: string, description?: string) {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        setting_type: settingType,
        description: description || '',
        is_public: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating system setting:', error);
    return { success: false, error: 'Failed to update system setting' };
  }
}

// =============================================
// EXPORT ALL FUNCTIONS
// =============================================

export const CompleteTableAPI = {
  // Tags
  getAllTags,
  createTag,
  addTagToArticle,
  getArticleTags,
  
  // User Profiles
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  
  // Bookmarks & Subscriptions
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  addUserSubscription,
  getUserSubscriptions,
  
  // Likes & Shares
  toggleUserLike,
  addUserShare,
  getContentLikes,
  
  // Polls & Surveys
  getActivePolls,
  createPoll,
  votePoll,
  
  // Media & Documents
  uploadMediaFile,
  getMediaFiles,
  uploadDocument,
  
  // Analytics & Tracking
  trackPageView,
  trackClick,
  recordEngagementMetric,
  
  // Logging & Monitoring
  logSystemEvent,
  logErrorEvent,
  logAuditEvent,
  
  // System Settings
  getSystemSetting,
  updateSystemSetting
};

export default CompleteTableAPI;