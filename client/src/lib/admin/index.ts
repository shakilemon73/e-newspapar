/**
 * Admin API Module - Centralized Exports
 * Organizes all admin Supabase API functions in one place
 */

// Main comprehensive admin API (26 sections)
export { adminSupabaseAPI } from './admin-supabase-complete';

// Specialized analytics and trending functions  
export { 
  getTrendingAnalytics, 
  getSEOAnalytics, 
  getUserStats, 
  getMetaTags,
  adminSupabase 
} from './admin-supabase-direct';

// Additional utilities and CRUD operations (without conflicts)
export { 
  updateArticle, 
  deleteArticle, 
  getBreakingNews, 
  updateBreakingNews 
} from './admin-api-direct';