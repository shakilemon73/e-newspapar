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
  category_id: number;
  is_featured: boolean;
  view_count: number;
  published_at: string;
  created_at?: string;
  updated_at?: string;
  category?: Category;
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

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  earned_at: string;
  user?: User;
  achievement?: Achievement;
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

// Update types (for updating existing records)
export type CategoryUpdate = Partial<CategoryInsert>;
export type ArticleUpdate = Partial<ArticleInsert>;
export type EPaperUpdate = Partial<EPaperInsert>;
export type WeatherUpdate = Partial<WeatherInsert>;
export type BreakingNewsUpdate = Partial<BreakingNewsInsert>;
export type UserUpdate = Partial<UserInsert>;
export type AchievementUpdate = Partial<AchievementInsert>;