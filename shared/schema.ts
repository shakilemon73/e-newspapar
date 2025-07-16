// Supabase-compatible schema file
// Using Supabase types directly instead of Drizzle ORM

export * from './supabase-types';

// Export commonly used types for backwards compatibility
export type {
  Category,
  Article,
  EPaper,
  Weather,
  BreakingNews,
  User,
  Achievement,
  UserAchievement,
  ReadingHistory,
  SavedArticle,
  VideoContent,
  AudioArticle,
  SocialMediaPost
} from './supabase-types';