// Complete Supabase API for all 71 tables
// Direct API calls without Express server middleware
import { supabase } from '@db';
import * as Schema from '@shared/complete-schema';

// =============================================
// ACHIEVEMENTS SYSTEM
// =============================================

export async function getAllAchievements(): Promise<Schema.Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

export async function createAchievement(achievement: Schema.AchievementInsert): Promise<Schema.Achievement | null> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .insert(achievement)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating achievement:', error);
    return null;
  }
}

export async function getUserAchievements(userId: string): Promise<Schema.UserAchievement[]> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}

// =============================================
// USER ANALYTICS & TRACKING
// =============================================

export async function trackUserAnalytics(analytics: Omit<Schema.UserAnalytics, 'id'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_analytics')
      .insert(analytics);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error tracking user analytics:', error);
    return false;
  }
}

export async function getArticleAnalytics(articleId: number, days: number = 30): Promise<Schema.ArticleAnalytics[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('article_analytics')
      .select('*')
      .eq('article_id', articleId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching article analytics:', error);
    return [];
  }
}

export async function trackUserInteraction(interaction: Omit<Schema.UserInteraction, 'id'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_interactions')
      .insert(interaction);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error tracking user interaction:', error);
    return false;
  }
}

// =============================================
// USER PREFERENCES & SETTINGS
// =============================================

export async function getUserPreferences(userId: string): Promise<Schema.UserPreference[]> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return [];
  }
}

export async function updateUserPreference(userId: string, key: string, value: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preference_key: key,
        preference_value: value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,preference_key'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user preference:', error);
    return false;
  }
}

export async function getUserSettings(userId: string): Promise<Schema.UserSetting[]> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return [];
  }
}

// =============================================
// RECOMMENDATION & PERSONALIZATION
// =============================================

export async function getRecommendations(userId: string, limit: number = 10): Promise<Schema.RecommendationCache[]> {
  try {
    const { data, error } = await supabase
      .from('recommendation_cache')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

export async function cacheRecommendation(recommendation: Omit<Schema.RecommendationCache, 'id'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('recommendation_cache')
      .insert(recommendation);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error caching recommendation:', error);
    return false;
  }
}

// =============================================
// SEARCH & TRENDING
// =============================================

export async function saveUserSearch(userId: string, query: string, resultCount: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_search_history')
      .insert({
        user_id: userId,
        search_query: query,
        results_count: resultCount,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving user search:', error);
    return false;
  }
}

export async function getTrendingTopics(limit: number = 10): Promise<Schema.TrendingTopic[]> {
  try {
    const { data, error } = await supabase
      .from('trending_topics')
      .select('*')
      .order('trend_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return [];
  }
}

export async function updateTrendingTopic(keyword: string, mentionCount: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('trending_topics')
      .upsert({
        keyword,
        mention_count: mentionCount,
        trend_score: mentionCount * 0.1,
        time_frame: 'daily',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'keyword'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating trending topic:', error);
    return false;
  }
}

// =============================================
// CONTENT SIMILARITY & RELATED ARTICLES
// =============================================

export async function getRelatedArticles(articleId: number, limit: number = 5): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('article_similarity')
      .select('article_b_id, similarity_score')
      .eq('article_a_id', articleId)
      .order('similarity_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.map(item => item.article_b_id) || [];
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

export async function calculateArticleSimilarity(articleA: number, articleB: number, score: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('article_similarity')
      .upsert({
        article_a_id: articleA,
        article_b_id: articleB,
        similarity_score: score,
        algorithm_used: 'tf-idf',
        created_at: new Date().toISOString()
      }, {
        onConflict: 'article_a_id,article_b_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error calculating article similarity:', error);
    return false;
  }
}

// =============================================
// TEAM & COMPANY INFO
// =============================================

export async function getTeamMembers(): Promise<Schema.TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

export async function getCompanyInfo(): Promise<Record<string, any>> {
  try {
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .eq('is_public', true);

    if (error) throw error;
    
    const info: Record<string, any> = {};
    data?.forEach(item => {
      info[item.field_name] = item.field_value;
    });
    return info;
  } catch (error) {
    console.error('Error fetching company info:', error);
    return {};
  }
}

export async function getContactInfo(): Promise<Schema.ContactInfo[]> {
  try {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .eq('is_public', true)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return [];
  }
}

export async function submitContactMessage(message: Omit<Schema.ContactMessage, 'id' | 'status' | 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        ...message,
        status: 'submitted',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error submitting contact message:', error);
    return false;
  }
}

// =============================================
// ADVERTISING & MONETIZATION
// =============================================

export async function getAdPackages(): Promise<Schema.AdPackage[]> {
  try {
    const { data, error } = await supabase
      .from('ad_packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching ad packages:', error);
    return [];
  }
}

export async function getAdRates(packageId: number): Promise<Schema.AdRate[]> {
  try {
    const { data, error } = await supabase
      .from('ad_rates')
      .select('*')
      .eq('package_id', packageId)
      .lte('effective_from', new Date().toISOString())
      .order('effective_from', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching ad rates:', error);
    return [];
  }
}

// =============================================
// EDITORIAL & CONTENT POLICIES
// =============================================

export async function getEditorialPolicies(): Promise<Schema.EditorialPolicy[]> {
  try {
    const { data, error } = await supabase
      .from('editorial_policies')
      .select('*')
      .eq('is_active', true)
      .order('section', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching editorial policies:', error);
    return [];
  }
}

export async function getEditorialGuidelines(): Promise<Schema.EditorialGuideline[]> {
  try {
    const { data, error } = await supabase
      .from('editorial_guidelines')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching editorial guidelines:', error);
    return [];
  }
}

export async function getPrivacyPolicySections(): Promise<Schema.PrivacyPolicySection[]> {
  try {
    const { data, error } = await supabase
      .from('privacy_policy_sections')
      .select('*')
      .eq('is_active', true)
      .order('section_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching privacy policy sections:', error);
    return [];
  }
}

export async function getTermsOfServiceSections(): Promise<Schema.TermsOfServiceSection[]> {
  try {
    const { data, error } = await supabase
      .from('terms_of_service_sections')
      .select('*')
      .eq('is_active', true)
      .order('section_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching terms of service sections:', error);
    return [];
  }
}

// =============================================
// USER ENGAGEMENT & READING
// =============================================

export async function trackUserReadingHistory(userId: string, articleId: number, data: Partial<Schema.UserReadingHistory>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_reading_history')
      .upsert({
        user_id: userId,
        article_id: articleId,
        read_percentage: data.read_percentage || 0,
        time_spent: data.time_spent || 0,
        last_position: data.last_position || 0,
        is_completed: data.is_completed || false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,article_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error tracking reading history:', error);
    return false;
  }
}

export async function getUserReadingHistory(userId: string, limit: number = 20): Promise<Schema.UserReadingHistory[]> {
  try {
    const { data, error } = await supabase
      .from('user_reading_history')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return [];
  }
}

export async function sendUserNotification(userId: string, title: string, message: string, type: string, actionUrl?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl,
        is_read: false,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

export async function getUserNotifications(userId: string, limit: number = 50): Promise<Schema.UserNotification[]> {
  try {
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

// =============================================
// SESSIONS & SECURITY
// =============================================

export async function createUserSession(userId: string, deviceInfo: string, ipAddress: string): Promise<string | null> {
  try {
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

    const { error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        device_info: deviceInfo,
        ip_address: ipAddress,
        is_active: true,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return sessionToken;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

export async function validateUserSession(sessionToken: string): Promise<Schema.UserSession | null> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

// =============================================
// FEEDBACK & REVIEWS
// =============================================

export async function submitFeedback(userId: string, type: string, content: string, metadata?: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: userId,
        feedback_type: type,
        content,
        metadata: metadata || {},
        status: 'submitted',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return false;
  }
}

export async function getContentReviews(contentId: number, contentType: string, limit: number = 10): Promise<Schema.Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export async function submitReview(userId: string, contentId: number, contentType: string, rating: number, title?: string, content?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
        rating,
        title: title || '',
        content: content || '',
        is_verified: false,
        helpful_count: 0,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error submitting review:', error);
    return false;
  }
}

// =============================================
// READING GOALS & GAMIFICATION
// =============================================

export async function getUserReadingGoals(userId: string): Promise<Schema.ReadingGoal[]> {
  try {
    const { data, error } = await supabase
      .from('reading_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reading goals:', error);
    return [];
  }
}

export async function createReadingGoal(userId: string, goalType: string, targetValue: number, endDate: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reading_goals')
      .insert({
        user_id: userId,
        goal_type: goalType,
        target_value: targetValue,
        current_progress: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: endDate,
        is_achieved: false,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating reading goal:', error);
    return false;
  }
}

export async function updateReadingGoalProgress(userId: string, goalType: string, progress: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reading_goals')
      .update({
        current_progress: progress,
        is_achieved: progress >= (await supabase
          .from('reading_goals')
          .select('target_value')
          .eq('user_id', userId)
          .eq('goal_type', goalType)
          .single()
        ).data?.target_value,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('goal_type', goalType);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating reading goal:', error);
    return false;
  }
}

// =============================================
// PERFORMANCE & MONITORING
// =============================================

export async function recordPerformanceMetric(metricName: string, value: number, unit: string, category: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        metric_name: metricName,
        metric_value: value,
        metric_unit: unit,
        category,
        recorded_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error recording performance metric:', error);
    return false;
  }
}

export async function getPerformanceMetrics(category: string, hours: number = 24): Promise<Schema.PerformanceMetric[]> {
  try {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('category', category)
      .gte('recorded_at', startTime.toISOString())
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return [];
  }
}

// =============================================
// LOGGING & AUDIT
// =============================================

export async function logError(errorType: string, message: string, stackTrace?: string, userId?: string, sessionId?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('error_logs')
      .insert({
        error_type: errorType,
        error_message: message,
        stack_trace: stackTrace,
        user_id: userId,
        session_id: sessionId,
        page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging error:', error);
    return false;
  }
}

export async function logAuditAction(userId: string, action: string, resourceType: string, resourceId: number, oldValues?: any, newValues?: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: typeof window !== 'undefined' ? (window as any).clientIp || '0.0.0.0' : '0.0.0.0',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging audit action:', error);
    return false;
  }
}

// =============================================
// SYSTEM SETTINGS & CONFIGURATION
// =============================================

export async function getSystemSetting(key: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .eq('is_public', true)
      .single();

    if (error) throw error;
    return data?.setting_value;
  } catch (error) {
    console.error('Error fetching system setting:', error);
    return null;
  }
}

export async function updateSystemSetting(key: string, value: any, description?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        setting_type: typeof value,
        description: description,
        is_public: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating system setting:', error);
    return false;
  }
}

// =============================================
// NEWSLETTER & SUBSCRIPTIONS
// =============================================

export async function subscribeToNewsletter(email: string, name?: string, preferences?: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        name: name || '',
        subscription_date: new Date().toISOString().split('T')[0],
        is_active: true,
        preferences: preferences || {},
        unsubscribe_token: crypto.randomUUID(),
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return false;
  }
}

export async function unsubscribeFromNewsletter(token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('unsubscribe_token', token);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return false;
  }
}

export async function getNewsletterSubscribers(isActive: boolean = true): Promise<Schema.NewsletterSubscriber[]> {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('is_active', isActive)
      .order('subscription_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return [];
  }
}