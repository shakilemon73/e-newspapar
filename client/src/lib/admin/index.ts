/**
 * Admin API Module - Centralized Exports
 * Organizes all admin Supabase API functions in one place
 */

// Main comprehensive admin API (26 sections)
export { adminSupabaseAPI, dashboardAPI } from './admin-supabase-complete';

// Export specific dashboard functions for convenience
export const getDashboardStats = () => dashboardAPI.getStats();

// Specialized analytics and trending functions  
export { 
  getTrendingAnalytics, 
  getSEOAnalytics, 
  getUserStats, 
  getMetaTags,
  adminSupabase,
  getAlgorithmStats,
  getUserAnalytics,
  getSearchAnalytics,
  getSearchHistory,
  getSearchIndex,
  reindexSearch,
  generateSitemap,
  updateMetaTag,
  getSecurityAuditLogs,
  getAccessPolicies,
  getSecuritySettings,
  updateSecuritySetting,
  getPerformanceMetrics,
  getErrorLogs,
  getApiMetrics,
  getUXAnalytics
} from './admin-supabase-direct';

// Additional utilities and CRUD operations (without conflicts)
export { 
  updateArticle, 
  deleteArticle, 
  getBreakingNews, 
  updateBreakingNews 
} from './admin-api-direct';

// Re-export specific admin functions from direct files
export { 
  getAdminArticlesDirect,
  getAdminCategoriesDirect,
  deleteArticleDirect 
} from './admin-supabase-direct';

// Also export with cleaned names  
export { 
  getAdminArticles,
  getAdminCategories,
  getAdminAuthors 
} from './admin-api-direct';

// Comment management functions
export { 
  getAdminComments,
  updateCommentStatus,
  deleteCommentAdmin,
  replyToComment
} from './admin-supabase-direct';