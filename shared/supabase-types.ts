// Supabase Database Types
// These types match the database structure in Supabase

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string;
  imageUrl?: string; // Compatibility field
  image_metadata?: {
    caption?: string;
    place?: string;
    date?: string;
    photographer?: string;
    id?: string;
  };
  author?: string;
  category_id: number;
  categoryId?: number; // Compatibility field
  status?: string; // 'draft', 'published', 'review', 'scheduled'
  is_published?: boolean; // Compatibility - calculated from status
  is_featured: boolean;
  isFeatured?: boolean; // Compatibility field
  view_count: number;
  viewCount?: number; // Compatibility field
  read_time?: number;
  published_at: string;
  publishedAt?: string; // Compatibility field
  created_at?: string;
  createdAt?: string; // Compatibility field
  updated_at?: string;
  updatedAt?: string; // Compatibility field
  category?: Category;
  categories?: Category | Category[]; // Compatibility field
}

export interface EPaper {
  id: number;
  title: string;
  publish_date: string;
  image_url: string;
  pdf_url: string;
  is_latest: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Weather {
  id: number;
  city: string;
  temperature: number;
  condition: string;
  icon: string;
  forecast: any; // JSON field for forecast data
  humidity?: number; // Added for Open-Meteo
  windSpeed?: number; // Added for Open-Meteo
  windDirection?: number; // Added for Open-Meteo
  lastFetchTime?: string; // Added for Open-Meteo
  updated_at?: string;
}

export interface BreakingNews {
  id: number;
  content: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  created_at?: string;
}

export interface VideoContent {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: string;
  view_count: number;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface AudioArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  audio_url: string;
  duration: string;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface SocialMediaPost {
  id: number;
  platform: string;
  content: string;
  embed_code?: string;
  post_url?: string;
  author_name?: string;
  author_handle?: string;
  interaction_count?: number;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  earned_at: string;
  user?: User;
  achievement?: Achievement;
}

export interface ReadingHistory {
  id: number;
  user_id: string;
  article_id: number;
  last_read_at: string;
  read_count: number;
  created_at?: string;
  updated_at?: string;
  article?: Article;
}

export interface SavedArticle {
  id: number;
  user_id: string;
  article_id: number;
  saved_at: string;
  created_at?: string;
  article?: Article;
}

// Insert types (for creating new records)
export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at' | 'category'>;
export type EPaperInsert = Omit<EPaper, 'id' | 'created_at' | 'updated_at'>;
export type WeatherInsert = Omit<Weather, 'id' | 'updated_at'>;
export type BreakingNewsInsert = Omit<BreakingNews, 'id' | 'created_at' | 'updated_at'>;
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type AchievementInsert = Omit<Achievement, 'id' | 'created_at'>;
export type UserAchievementInsert = Omit<UserAchievement, 'id' | 'user' | 'achievement'>;
export type VideoContentInsert = Omit<VideoContent, 'id' | 'created_at' | 'updated_at'>;
export type AudioArticleInsert = Omit<AudioArticle, 'id' | 'created_at' | 'updated_at'>;
export type SocialMediaPostInsert = Omit<SocialMediaPost, 'id' | 'created_at' | 'updated_at'>;

// Update types (for updating existing records)
export type CategoryUpdate = Partial<CategoryInsert>;
export type ArticleUpdate = Partial<ArticleInsert>;
export type EPaperUpdate = Partial<EPaperInsert>;
export type WeatherUpdate = Partial<WeatherInsert>;
export type BreakingNewsUpdate = Partial<BreakingNewsInsert>;
export type UserUpdate = Partial<UserInsert>;
export type AchievementUpdate = Partial<AchievementInsert>;
export type VideoContentUpdate = Partial<VideoContentInsert>;
export type AudioArticleUpdate = Partial<AudioArticleInsert>;
export type SocialMediaPostUpdate = Partial<SocialMediaPostInsert>;

// Missing Admin Tables
export interface MobileAppConfig {
  id: number;
  app_name: string;
  app_version: string;
  push_notifications_enabled: boolean;
  dark_mode_enabled: boolean;
  offline_reading_enabled: boolean;
  auto_update_enabled: boolean;
  analytics_enabled: boolean;
  force_update_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Advertisement {
  id: number;
  title: string;
  content?: string;
  image_url?: string;
  target_url?: string;
  link_url?: string;
  placement?: string;
  position?: string;
  status: string;
  is_active: boolean;
  impressions?: number;
  clicks?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
  type?: string;
  template_type?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SearchAnalytics {
  id: number;
  query: string;
  results_count: number;
  user_id?: string;
  timestamp: string;
  response_time?: number;
  created_at?: string;
}

export interface SecurityAuditLog {
  id: number;
  action: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: any;
  timestamp: string;
  created_at?: string;
}

export interface AccessPolicy {
  id: number;
  name: string;
  description?: string;
  resource: string;
  permissions: string[];
  conditions?: any;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SecuritySettings {
  id: number;
  setting_key: string;
  setting_value: any;
  description?: string;
  updated_at?: string;
}

export interface PerformanceMetric {
  id: number;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  timestamp: string;
  details?: any;
  created_at?: string;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: any;
  description?: string;
  category?: string;
  updated_at?: string;
}

// Insert types for new tables
export type MobileAppConfigInsert = Omit<MobileAppConfig, 'id' | 'created_at' | 'updated_at'>;
export type AdvertisementInsert = Omit<Advertisement, 'id' | 'created_at' | 'updated_at'>;
export type EmailTemplateInsert = Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>;
export type SearchAnalyticsInsert = Omit<SearchAnalytics, 'id' | 'created_at'>;
export type SecurityAuditLogInsert = Omit<SecurityAuditLog, 'id' | 'created_at'>;
export type AccessPolicyInsert = Omit<AccessPolicy, 'id' | 'created_at' | 'updated_at'>;
export type SecuritySettingsInsert = Omit<SecuritySettings, 'id' | 'updated_at'>;
export type PerformanceMetricInsert = Omit<PerformanceMetric, 'id' | 'created_at'>;
export type SystemSettingInsert = Omit<SystemSetting, 'id' | 'updated_at'>;

// Update types for new tables
export type MobileAppConfigUpdate = Partial<MobileAppConfigInsert>;
export type AdvertisementUpdate = Partial<AdvertisementInsert>;
export type EmailTemplateUpdate = Partial<EmailTemplateInsert>;
export type AccessPolicyUpdate = Partial<AccessPolicyInsert>;
export type SecuritySettingsUpdate = Partial<SecuritySettingsInsert>;
export type SystemSettingUpdate = Partial<SystemSettingInsert>;