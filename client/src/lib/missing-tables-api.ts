// ========================================
// MISSING TABLES API IMPLEMENTATION
// Direct Supabase API calls for missing database functionality
// ========================================

import { supabase } from './supabase';
import { getPublicSupabase } from './jwt-handler';

// Helper to get public client for unauthenticated operations
function getPublicClient() {
  return getPublicSupabase();
}

// ====== POLLS FUNCTIONALITY ======

export interface Poll {
  id: number;
  question: string;
  description?: string;
  expires_at?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  total_votes?: number;
  options?: PollOption[];
}

export interface PollOption {
  id: number;
  poll_id: number;
  option_text: string;
  vote_count: number;
  created_at: string;
}

export interface PollVote {
  id: number;
  poll_id: number;
  option_id: number;
  user_id: string;
  created_at: string;
}

// Get active polls with options
export async function getActivePolls(): Promise<Poll[]> {
  try {
    const { data: polls, error } = await getPublicClient()
      .from('polls')
      .select(`
        *,
        poll_options:poll_options(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate total votes for each poll
    const pollsWithVotes = polls?.map(poll => ({
      ...poll,
      total_votes: poll.poll_options?.reduce((sum: number, option: any) => sum + (option.vote_count || 0), 0) || 0,
      options: poll.poll_options || []
    })) || [];

    return pollsWithVotes;
  } catch (error) {
    console.error('[Polls] Error fetching active polls:', error);
    return [];
  }
}

// Get featured polls
export async function getFeaturedPolls(): Promise<Poll[]> {
  try {
    const { data: polls, error } = await getPublicClient()
      .from('polls')
      .select(`
        *,
        poll_options:poll_options(*)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;

    const pollsWithVotes = polls?.map(poll => ({
      ...poll,
      total_votes: poll.poll_options?.reduce((sum: number, option: any) => sum + (option.vote_count || 0), 0) || 0,
      options: poll.poll_options || []
    })) || [];

    return pollsWithVotes;
  } catch (error) {
    console.error('[Polls] Error fetching featured polls:', error);
    return [];
  }
}

// Vote on a poll (requires authentication)
export async function voteOnPoll(pollId: number, optionId: number): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: 'অনুগ্রহ করে লগইন করুন' };
    }

    // Check if user already voted
    const { data: existingVote, error: checkError } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingVote) {
      return { success: false, message: 'আপনি ইতিমধ্যে ভোট দিয়েছেন' };
    }

    // Record the vote
    const { error: voteError } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id
      });

    if (voteError) throw voteError;

    // Update option vote count (use a database function if available)
    const { error: updateError } = await supabase.rpc('increment_poll_votes', {
      option_id: optionId
    });

    if (updateError) {
      // Fallback: manual increment
      const { data: currentOption } = await supabase
        .from('poll_options')
        .select('vote_count')
        .eq('id', optionId)
        .single();

      if (currentOption) {
        await supabase
          .from('poll_options')
          .update({ vote_count: currentOption.vote_count + 1 })
          .eq('id', optionId);
      }
    }

    return { success: true, message: 'ভোট সফলভাবে জমা হয়েছে' };
  } catch (error) {
    console.error('[Polls] Error voting on poll:', error);
    return { success: false, message: 'ভোট দিতে সমস্যা হয়েছে' };
  }
}

// Get user's poll votes
export async function getUserPollVotes(userId: string): Promise<PollVote[]> {
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Polls] Error fetching user votes:', error);
    return [];
  }
}

// ====== TAGS FUNCTIONALITY ======

export interface Tag {
  id: number;
  name: string;
  slug: string;
  usage_count: number;
  created_at: string;
}

export interface ArticleTag {
  id: number;
  article_id: number;
  tag_id: number;
  created_at: string;
}

// Get all tags
export async function getTags(): Promise<Tag[]> {
  try {
    const { data, error } = await getPublicClient()
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Tags] Error fetching tags:', error);
    return [];
  }
}

// Get popular tags
export async function getPopularTags(limit: number = 20): Promise<Tag[]> {
  try {
    const { data, error } = await getPublicClient()
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Tags] Error fetching popular tags:', error);
    return [];
  }
}

// Get articles by tag
export async function getArticlesByTag(tagSlug: string, limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await getPublicClient()
      .from('article_tags')
      .select(`
        articles:article_id(
          id, title, slug, excerpt, image_url, published_at, view_count,
          categories:category_id(id, name, slug)
        )
      `)
      .eq('tags.slug', tagSlug)
      .limit(limit);

    if (error) throw error;

    const articles = data?.map((item: any) => item.articles).filter(Boolean) || [];
    return articles;
  } catch (error) {
    console.error('[Tags] Error fetching articles by tag:', error);
    return [];
  }
}

// Get tags for an article
export async function getArticleTags(articleId: number): Promise<Tag[]> {
  try {
    const { data, error } = await getPublicClient()
      .from('article_tags')
      .select(`
        tags:tag_id(*)
      `)
      .eq('article_id', articleId);

    if (error) throw error;

    const tags = data?.map((item: any) => item.tags).filter(Boolean) || [];
    return tags;
  } catch (error) {
    console.error('[Tags] Error fetching article tags:', error);
    return [];
  }
}

// ====== REVIEWS FUNCTIONALITY ======

export interface Review {
  id: number;
  content_type: 'article' | 'video' | 'audio';
  content_id: number;
  user_id: string;
  rating: number;
  review_text?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

// Get reviews for content
export async function getContentReviews(contentType: string, contentId: number): Promise<Review[]> {
  try {
    const { data, error } = await getPublicClient()
      .from('reviews')
      .select(`
        *,
        user_profiles:user_id(name, avatar_url)
      `)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Reviews] Error fetching reviews:', error);
    return [];
  }
}

// Submit a review (requires authentication)
export async function submitReview(contentType: string, contentId: number, rating: number, reviewText?: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: 'অনুগ্রহ করে লগইন করুন' };
    }

    // Check if user already reviewed this content
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('user_id', user.id)
      .single();

    if (existingReview) {
      return { success: false, message: 'আপনি ইতিমধ্যে রিভিউ দিয়েছেন' };
    }

    const { error } = await supabase
      .from('reviews')
      .insert({
        content_type: contentType,
        content_id: contentId,
        user_id: user.id,
        rating: rating,
        review_text: reviewText,
        is_approved: false // Requires admin approval
      });

    if (error) throw error;

    return { success: true, message: 'রিভিউ সফলভাবে জমা হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন।' };
  } catch (error) {
    console.error('[Reviews] Error submitting review:', error);
    return { success: false, message: 'রিভিউ জমা দিতে সমস্যা হয়েছে' };
  }
}

// ====== SOCIAL MEDIA POSTS FUNCTIONALITY ======

export interface SocialMediaPost {
  id: number;
  platform: 'facebook' | 'twitter' | 'instagram' | 'youtube';
  post_url: string;
  embed_code?: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  is_featured: boolean;
  created_at: string;
}

// Get social media posts
export async function getSocialMediaPosts(platform?: string, limit: number = 10): Promise<SocialMediaPost[]> {
  try {
    let query = getPublicClient()
      .from('social_media_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Social] Error fetching social media posts:', error);
    return [];
  }
}

// Get featured social media posts
export async function getFeaturedSocialPosts(limit: number = 5): Promise<SocialMediaPost[]> {
  try {
    const { data, error } = await getPublicClient()
      .from('social_media_posts')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Social] Error fetching featured social posts:', error);
    return [];
  }
}

// ====== MEDIA FILES FUNCTIONALITY ======

export interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'video' | 'audio' | 'document';
  uploaded_by: string;
  is_public: boolean;
  metadata?: any;
  created_at: string;
}

// Get public media files
export async function getPublicMediaFiles(fileType?: string, limit: number = 20): Promise<MediaFile[]> {
  try {
    let query = getPublicClient()
      .from('media')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Media] Error fetching media files:', error);
    return [];
  }
}

// Upload media file (requires authentication)
export async function uploadMediaFile(file: File, isPublic: boolean = false): Promise<{ success: boolean; data?: MediaFile; message: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: 'অনুগ্রহ করে লগইন করুন' };
    }

    // Upload file to Supabase storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `media/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    // Determine file type
    let fileType: 'image' | 'video' | 'audio' | 'document' = 'document';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.startsWith('audio/')) fileType = 'audio';

    // Save file record to database
    const { data: mediaRecord, error: dbError } = await supabase
      .from('media')
      .insert({
        filename: fileName,
        original_name: file.name,
        file_path: filePath,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        file_type: fileType,
        uploaded_by: user.id,
        is_public: isPublic
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return { 
      success: true, 
      data: mediaRecord,
      message: 'ফাইল সফলভাবে আপলোড হয়েছে' 
    };
  } catch (error) {
    console.error('[Media] Error uploading file:', error);
    return { success: false, message: 'ফাইল আপলোড করতে সমস্যা হয়েছে' };
  }
}

// ====== COMPANY INFO FUNCTIONALITY ======

export interface CompanyInfo {
  id: number;
  field_name: string;
  field_value: string;
  field_type: 'text' | 'textarea' | 'url' | 'email' | 'phone';
  is_public: boolean;
  display_order: number;
  updated_at: string;
}

// Get public company information
export async function getCompanyInfo(): Promise<CompanyInfo[]> {
  try {
    const { data, error } = await getPublicClient()
      .from('company_info')
      .select('*')
      .eq('is_public', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Company] Error fetching company info:', error);
    return [];
  }
}

// ====== CONTACT INFO FUNCTIONALITY ======

export interface ContactInfo {
  id: number;
  contact_type: 'phone' | 'email' | 'address' | 'social' | 'other';
  label: string;
  value: string;
  is_primary: boolean;
  is_public: boolean;
  display_order: number;
  created_at: string;
}

// Get public contact information
export async function getContactInfo(): Promise<ContactInfo[]> {
  try {
    const { data, error } = await getPublicClient()
      .from('contact_info')
      .select('*')
      .eq('is_public', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Contact] Error fetching contact info:', error);
    return [];
  }
}

// ====== TEAM MEMBERS FUNCTIONALITY ======

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio?: string;
  photo_url?: string;
  email?: string;
  social_links?: any;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// Get active team members
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const { data, error } = await getPublicClient()
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Team] Error fetching team members:', error);
    return [];
  }
}

// ====== NEWSLETTER FUNCTIONALITY ======

// Get newsletter archives
export async function getNewsletterArchives(limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await getPublicClient()
      .from('newsletters')
      .select('*')
      .eq('is_published', true)
      .order('sent_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Newsletter] Error fetching archives:', error);
    return [];
  }
}

// Subscribe to newsletter
export async function subscribeToNewsletter(email: string, name?: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return { success: false, message: 'এই ইমেইল ইতিমধ্যে সাবস্ক্রাইব করা আছে' };
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email,
        name: name,
        is_active: true,
        subscribed_at: new Date().toISOString()
      });

    if (error) throw error;

    return { success: true, message: 'সফলভাবে নিউজলেটার সাবস্ক্রাইব হয়েছে' };
  } catch (error) {
    console.error('[Newsletter] Error subscribing:', error);
    return { success: false, message: 'সাবস্ক্রিপশনে সমস্যা হয়েছে' };
  }
}

// ====== CONTACT MESSAGES FUNCTIONALITY ======

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  is_read: boolean;
  replied_at?: string;
  created_at: string;
}

// Submit contact message
export async function submitContactMessage(name: string, email: string, subject: string, message: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: name,
        email: email,
        subject: subject,
        message: message,
        is_read: false
      });

    if (error) throw error;

    return { success: true, message: 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই উত্তর দেব।' };
  } catch (error) {
    console.error('[Contact] Error submitting message:', error);
    return { success: false, message: 'বার্তা পাঠাতে সমস্যা হয়েছে' };
  }
}

// ====== USER ANALYTICS FUNCTIONALITY ======

export interface UserAnalytics {
  id: number;
  user_id: string;
  reading_time_today: number;
  articles_read_today: number;
  reading_streak: number;
  total_reading_time: number;
  total_articles_read: number;
  preferred_categories: string[];
  last_active: string;
  created_at: string;
  updated_at: string;
}

// Get user analytics
export async function getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
  try {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('[Analytics] Error fetching user analytics:', error);
    return null;
  }
}

// Update user reading activity
export async function updateUserReadingActivity(userId: string, articleId: number, readingTime: number): Promise<boolean> {
  try {
    // Update or create user analytics
    const { error: upsertError } = await supabase.rpc('update_user_reading_stats', {
      p_user_id: userId,
      p_article_id: articleId,
      p_reading_time: readingTime
    });

    if (upsertError) {
      console.warn('[Analytics] RPC failed, using manual update:', upsertError);
      
      // Fallback: manual update
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const isToday = existing.last_active?.split('T')[0] === today;
        await supabase
          .from('user_analytics')
          .update({
            reading_time_today: isToday ? existing.reading_time_today + readingTime : readingTime,
            articles_read_today: isToday ? existing.articles_read_today + 1 : 1,
            total_reading_time: existing.total_reading_time + readingTime,
            total_articles_read: existing.total_articles_read + 1,
            last_active: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_analytics')
          .insert({
            user_id: userId,
            reading_time_today: readingTime,
            articles_read_today: 1,
            reading_streak: 1,
            total_reading_time: readingTime,
            total_articles_read: 1,
            last_active: new Date().toISOString()
          });
      }
    }

    return true;
  } catch (error) {
    console.error('[Analytics] Error updating reading activity:', error);
    return false;
  }
}

// ====== PAGE VIEWS FUNCTIONALITY ======

export interface PageView {
  id: number;
  page_url: string;
  page_title?: string;
  user_id?: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  visit_duration?: number;
  created_at: string;
}

// Track page view
export async function trackPageView(pageUrl: string, pageTitle?: string, sessionId?: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Generate session ID if not provided
    const trackingSessionId = sessionId || Math.random().toString(36).substr(2, 9);

    const { error } = await supabase
      .from('page_views')
      .insert({
        page_url: pageUrl,
        page_title: pageTitle,
        user_id: user?.id || null,
        session_id: trackingSessionId,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error);
    return false;
  }
}

// Get page view stats
export async function getPageViewStats(pageUrl?: string, timeframe: 'day' | 'week' | 'month' = 'day'): Promise<any> {
  try {
    let dateFilter = new Date();
    if (timeframe === 'day') {
      dateFilter.setHours(0, 0, 0, 0);
    } else if (timeframe === 'week') {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (timeframe === 'month') {
      dateFilter.setMonth(dateFilter.getMonth() - 1);
    }

    let query = supabase
      .from('page_views')
      .select('id, page_url, created_at')
      .gte('created_at', dateFilter.toISOString());

    if (pageUrl) {
      query = query.eq('page_url', pageUrl);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by page URL and count
    const stats = data?.reduce((acc: any, view: any) => {
      const url = view.page_url;
      acc[url] = (acc[url] || 0) + 1;
      return acc;
    }, {}) || {};

    return stats;
  } catch (error) {
    console.error('[Analytics] Error fetching page view stats:', error);
    return {};
  }
}

// ====== USER NOTIFICATIONS FUNCTIONALITY ======

export interface UserNotification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error' | 'news' | 'system';
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  expires_at?: string;
  created_at: string;
}

// Get user notifications
export async function getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<UserNotification[]> {
  try {
    let query = supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Notifications] Error fetching notifications:', error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Notifications] Error marking as read:', error);
    return false;
  }
}

// Create notification for user
export async function createNotification(
  userId: string, 
  title: string, 
  message: string, 
  type: 'info' | 'success' | 'warning' | 'error' | 'news' | 'system' = 'info',
  actionUrl?: string,
  actionLabel?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .insert({
        user_id: userId,
        title: title,
        message: message,
        notification_type: type,
        is_read: false,
        action_url: actionUrl,
        action_label: actionLabel
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Notifications] Error creating notification:', error);
    return false;
  }
}

// ====== USER ACHIEVEMENTS FUNCTIONALITY ======

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: 'reading' | 'social' | 'time' | 'special';
  requirement_type: 'articles_read' | 'reading_time' | 'streak' | 'comments' | 'shares' | 'custom';
  requirement_value: number;
  points: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: number;
  user_id: string;
  achievement_id: number;
  earned_at: string;
  achievement?: Achievement;
}

// Get all available achievements
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const { data, error } = await getPublicClient()
      .from('user_achievements')
      .select('*')
      .eq('is_active', true)
      .order('points', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Achievements] Error fetching achievements:', error);
    return [];
  }
}

// Get user's earned achievements
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievement_id(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Achievements] Error fetching user achievements:', error);
    return [];
  }
}

// Check and award achievements for user
export async function checkAndAwardAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    // Get user analytics
    const analytics = await getUserAnalytics(userId);
    if (!analytics) return [];

    // Get all achievements user hasn't earned yet
    const { data: availableAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select(`
        *,
        user_achievements!left(user_id)
      `)
      .eq('is_active', true)
      .is('user_achievements.user_id', null);

    if (achievementsError) throw achievementsError;

    const newAchievements: UserAchievement[] = [];

    // Check each achievement
    for (const achievement of availableAchievements || []) {
      let earned = false;

      switch (achievement.requirement_type) {
        case 'articles_read':
          earned = analytics.total_articles_read >= achievement.requirement_value;
          break;
        case 'reading_time':
          earned = analytics.total_reading_time >= achievement.requirement_value;
          break;
        case 'streak':
          earned = analytics.reading_streak >= achievement.requirement_value;
          break;
      }

      if (earned) {
        const { data: newAchievement, error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: new Date().toISOString()
          })
          .select(`
            *,
            achievement:achievement_id(*)
          `)
          .single();

        if (!insertError && newAchievement) {
          newAchievements.push(newAchievement);
          
          // Create notification for new achievement
          await createNotification(
            userId,
            'নতুন অর্জন!',
            `আপনি "${achievement.name}" অর্জন পেয়েছেন!`,
            'success'
          );
        }
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('[Achievements] Error checking achievements:', error);
    return [];
  }
}

// ====== USER STORAGE FUNCTIONALITY ======

export interface UserStorage {
  id: number;
  user_id: string;
  storage_key: string;
  storage_value: any;
  storage_type: 'json' | 'text' | 'number' | 'boolean';
  category?: string;
  is_encrypted: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Get user storage item
export async function getUserStorageItem(userId: string, key: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('user_storage')
      .select('storage_value, storage_type')
      .eq('user_id', userId)
      .eq('storage_key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) return null;

    // Parse value based on type
    switch (data.storage_type) {
      case 'json':
        return JSON.parse(data.storage_value);
      case 'number':
        return parseFloat(data.storage_value);
      case 'boolean':
        return data.storage_value === 'true';
      default:
        return data.storage_value;
    }
  } catch (error) {
    console.error('[Storage] Error getting user storage item:', error);
    return null;
  }
}

// Set user storage item
export async function setUserStorageItem(
  userId: string, 
  key: string, 
  value: any, 
  category?: string,
  expiresAt?: string
): Promise<boolean> {
  try {
    // Determine storage type and serialize value
    let storageType: 'json' | 'text' | 'number' | 'boolean' = 'text';
    let storageValue: string;

    if (typeof value === 'object') {
      storageType = 'json';
      storageValue = JSON.stringify(value);
    } else if (typeof value === 'number') {
      storageType = 'number';
      storageValue = value.toString();
    } else if (typeof value === 'boolean') {
      storageType = 'boolean';
      storageValue = value.toString();
    } else {
      storageValue = String(value);
    }

    const { error } = await supabase
      .from('user_storage')
      .upsert({
        user_id: userId,
        storage_key: key,
        storage_value: storageValue,
        storage_type: storageType,
        category: category,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Storage] Error setting user storage item:', error);
    return false;
  }
}

// Delete user storage item
export async function deleteUserStorageItem(userId: string, key: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_storage')
      .delete()
      .eq('user_id', userId)
      .eq('storage_key', key);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Storage] Error deleting user storage item:', error);
    return false;
  }
}

// Get all user storage items
export async function getUserStorageItems(userId: string, category?: string): Promise<Record<string, any>> {
  try {
    let query = supabase
      .from('user_storage')
      .select('storage_key, storage_value, storage_type')
      .eq('user_id', userId);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    const items: Record<string, any> = {};
    
    data?.forEach(item => {
      let value = item.storage_value;
      
      switch (item.storage_type) {
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.warn('[Storage] Failed to parse JSON:', e);
          }
          break;
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true';
          break;
      }
      
      items[item.storage_key] = value;
    });

    return items;
  } catch (error) {
    console.error('[Storage] Error getting user storage items:', error);
    return {};
  }
}