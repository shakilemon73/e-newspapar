// Complete Database Schema for Bengali News Website
// All 71 tables with proper type definitions and relationships

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  created_at?: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string;
  author?: string;
  category_id: number;
  is_featured: boolean;
  view_count: number;
  read_time?: number;
  published_at: string;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

export interface BreakingNews {
  id: number;
  content: string;
  is_active: boolean;
  priority?: number;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  sort_order?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EPaper {
  id: number;
  title: string;
  publish_date: string;
  image_url: string;
  pdf_url: string;
  is_latest: boolean;
  download_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserAchievement {
  id: number;
  user_id: string;
  achievement_id: number;
  earned_at: string;
  progress?: number;
  is_completed: boolean;
  user?: User;
  achievement?: Achievement;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Weather {
  id: number;
  city: string;
  temperature: number;
  condition: string;
  icon: string;
  forecast: any;
  humidity?: number;
  wind_speed?: number;
  wind_direction?: number;
  pressure?: number;
  visibility?: number;
  uv_index?: number;
  last_updated: string;
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
  narrator?: string;
  category_id?: number;
  view_count: number;
  like_count: number;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface VideoContent {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: string;
  category_id?: number;
  view_count: number;
  like_count: number;
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

export interface UserAnalytics {
  id: number;
  user_id: string;
  session_id: string;
  page_views: number;
  time_spent: number;
  articles_read: number;
  interactions: number;
  device_type: string;
  browser: string;
  location?: string;
  created_at: string;
}

export interface ArticleAnalytics {
  id: number;
  article_id: number;
  date: string;
  view_count: number;
  unique_views: number;
  read_time_avg: number;
  bounce_rate: number;
  shares: number;
  likes: number;
  comments: number;
  created_at?: string;
}

export interface UserInteraction {
  id: number;
  user_id: string;
  content_id: number;
  content_type: string;
  interaction_type: string;
  metadata?: any;
  created_at: string;
}

export interface UserPreference {
  id: number;
  user_id: string;
  preference_key: string;
  preference_value: any;
  created_at?: string;
  updated_at?: string;
}

export interface RecommendationCache {
  id: number;
  user_id: string;
  article_id: number;
  score: number;
  reason: string;
  expires_at: string;
  created_at?: string;
}

export interface UserSearchHistory {
  id: number;
  user_id: string;
  search_query: string;
  results_count: number;
  clicked_result_id?: number;
  created_at: string;
}

export interface TrendingTopic {
  id: number;
  keyword: string;
  mention_count: number;
  trend_score: number;
  category?: string;
  time_frame: string;
  created_at: string;
  updated_at?: string;
}

export interface ArticleSimilarity {
  id: number;
  article_a_id: number;
  article_b_id: number;
  similarity_score: number;
  algorithm_used: string;
  created_at?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio?: string;
  image_url?: string;
  email?: string;
  social_links?: any;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyInfo {
  id: number;
  field_name: string;
  field_value: string;
  field_type: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactInfo {
  id: number;
  type: string;
  value: string;
  label: string;
  is_primary: boolean;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  response?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdPackage {
  id: number;
  name: string;
  description: string;
  position: string;
  dimensions: string;
  duration_days: number;
  price: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdRate {
  id: number;
  package_id: number;
  rate_type: string;
  rate_value: number;
  effective_from: string;
  effective_to?: string;
  created_at?: string;
}

export interface EditorialPolicy {
  id: number;
  title: string;
  content: string;
  section: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EditorialGuideline {
  id: number;
  title: string;
  content: string;
  category: string;
  is_mandatory: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PrivacyPolicySection {
  id: number;
  section_title: string;
  section_content: string;
  section_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TermsOfServiceSection {
  id: number;
  section_title: string;
  section_content: string;
  section_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserReadingHistory {
  id: number;
  user_id: string;
  article_id: number;
  read_percentage: number;
  time_spent: number;
  last_position: number;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserNotification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserSession {
  id: number;
  user_id: string;
  session_token: string;
  device_info: string;
  ip_address: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  updated_at?: string;
}

export interface UserFeedback {
  id: number;
  user_id: string;
  feedback_type: string;
  content: string;
  rating?: number;
  status: string;
  metadata?: any;
  created_at: string;
  updated_at?: string;
}

export interface ReadingGoal {
  id: number;
  user_id: string;
  goal_type: string;
  target_value: number;
  current_progress: number;
  start_date: string;
  end_date: string;
  is_achieved: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PerformanceMetric {
  id: number;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  category: string;
  recorded_at: string;
  created_at?: string;
}

export interface ArticleComment {
  id: number;
  article_id: number;
  user_id: string;
  content: string;
  parent_comment_id?: number;
  is_approved: boolean;
  like_count: number;
  created_at: string;
  updated_at?: string;
}

export interface UserFollow {
  id: number;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface CommunityPost {
  id: number;
  user_id: string;
  title: string;
  content: string;
  post_type: string;
  is_published: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: number;
  user_id: string;
  full_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  birth_date?: string;
  gender?: string;
  profession?: string;
  interests: string[];
  reading_level?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSetting {
  id: number;
  user_id: string;
  setting_key: string;
  setting_value: any;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: number;
  role_name: string;
  description: string;
  permissions: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserPermission {
  id: number;
  user_id: string;
  permission: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  usage_count: number;
  is_trending: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleTag {
  id: number;
  article_id: number;
  tag_id: number;
  created_at?: string;
}

export interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  alt_text?: string;
  caption?: string;
  uploaded_by: string;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Document {
  id: number;
  title: string;
  filename: string;
  file_path: string;
  file_size: number;
  document_type: string;
  description?: string;
  uploaded_by: string;
  download_count: number;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Newsletter {
  id: number;
  title: string;
  content: string;
  template_id?: number;
  status: string;
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  open_rate?: number;
  click_rate?: number;
  created_at: string;
  updated_at?: string;
}

export interface PageView {
  id: number;
  page_url: string;
  user_id?: string;
  session_id: string;
  referrer?: string;
  user_agent: string;
  ip_address: string;
  view_duration?: number;
  created_at: string;
}

export interface ClickTracking {
  id: number;
  element_type: string;
  element_id: string;
  page_url: string;
  user_id?: string;
  session_id: string;
  click_position?: any;
  created_at: string;
}

export interface EngagementMetric {
  id: number;
  content_id: number;
  content_type: string;
  metric_type: string;
  metric_value: number;
  user_id?: string;
  session_id?: string;
  recorded_at: string;
}

export interface ViewTracking {
  id: number;
  content_id: number;
  content_type: string;
  user_id?: string;
  session_id: string;
  view_start: string;
  view_end?: string;
  scroll_depth?: number;
  created_at: string;
}

export interface InteractionLog {
  id: number;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: number;
  metadata?: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface UserBookmark {
  id: number;
  user_id: string;
  article_id: number;
  folder_name?: string;
  note?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserSubscription {
  id: number;
  user_id: string;
  subscription_type: string;
  category_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserLike {
  id: number;
  user_id: string;
  content_id: number;
  content_type: string;
  created_at: string;
}

export interface UserShare {
  id: number;
  user_id: string;
  content_id: number;
  content_type: string;
  platform: string;
  created_at: string;
}

export interface Poll {
  id: number;
  title: string;
  description?: string;
  options: any[];
  is_active: boolean;
  multiple_choice: boolean;
  expires_at?: string;
  total_votes: number;
  created_at: string;
  updated_at?: string;
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  questions: any[];
  is_active: boolean;
  response_count: number;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Log {
  id: number;
  level: string;
  message: string;
  context?: any;
  user_id?: string;
  ip_address?: string;
  created_at: string;
}

export interface ErrorLog {
  id: number;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: number;
  old_values?: any;
  new_values?: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface SystemSetting {
  id: number;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description?: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminAction {
  id: number;
  admin_user_id: string;
  action_type: string;
  target_resource: string;
  target_id: number;
  action_details?: any;
  ip_address: string;
  created_at: string;
}

export interface PopularContent {
  id: number;
  content_id: number;
  content_type: string;
  popularity_score: number;
  time_frame: string;
  category?: string;
  calculated_at: string;
  created_at?: string;
}

export interface Review {
  id: number;
  content_id: number;
  content_type: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at?: string;
}

export interface Rating {
  id: number;
  content_id: number;
  content_type: string;
  user_id: string;
  rating_value: number;
  created_at: string;
  updated_at?: string;
}

export interface UserMetadata {
  id: number;
  user_id: string;
  metadata_key: string;
  metadata_value: any;
  created_at?: string;
  updated_at?: string;
}

export interface UserBadge {
  id: number;
  user_id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  earned_at: string;
  is_visible: boolean;
}

export interface UserActivity {
  id: number;
  user_id: string;
  activity_type: string;
  activity_data: any;
  points_earned?: number;
  created_at: string;
}

export interface PollVote {
  id: number;
  poll_id: number;
  user_id: string;
  option_id: number;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  name?: string;
  subscription_date: string;
  is_active: boolean;
  preferences?: any;
  unsubscribe_token: string;
  created_at?: string;
  updated_at?: string;
}

// Insert types for creating new records
export type AchievementInsert = Omit<Achievement, 'id' | 'created_at'>;
export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at' | 'category'>;
export type BreakingNewsInsert = Omit<BreakingNews, 'id' | 'created_at' | 'updated_at'>;
export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type EPaperInsert = Omit<EPaper, 'id' | 'created_at' | 'updated_at'>;
export type UserAchievementInsert = Omit<UserAchievement, 'id' | 'user' | 'achievement'>;
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type WeatherInsert = Omit<Weather, 'id' | 'updated_at'>;

// Update types for updating existing records
export type ArticleUpdate = Partial<ArticleInsert>;
export type CategoryUpdate = Partial<CategoryInsert>;
export type UserUpdate = Partial<UserInsert>;