/**
 * Admin API Module - Centralized Exports
 * Organizes all admin Supabase API functions in one place
 */

// Main comprehensive admin API (26 sections)
export { adminSupabaseAPI, dashboardAPI } from './admin-supabase-complete';

// Import dashboardAPI to use in local exports
import { dashboardAPI } from './admin-supabase-complete';

// Export specific dashboard functions for convenience - REMOVED: Now using direct Supabase version

// All admin functions from direct Supabase implementation
export { 
  // Analytics and trending
  getTrendingAnalytics, 
  getSEOAnalytics, 
  getUserStats, 
  getMetaTags,
  adminSupabase,
  getAlgorithmStats,
  getUserAnalytics,
  
  // Search management
  getSearchAnalytics,
  getSearchHistory,
  getSearchIndex,
  reindexSearch,
  
  // SEO management
  generateSitemap,
  updateMetaTag,
  
  // Security and access control
  getSecurityAuditLogs,
  getAccessPolicies,
  getSecuritySettings,
  updateSecuritySetting,
  
  // Performance monitoring
  getPerformanceMetrics,
  getErrorLogs,
  getApiMetrics,
  getUXAnalytics,
  
  // Email management
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getAdminEmailTemplates,
  getEmailSettings,
  updateEmailSettings,
  getEmailStats,
  getNewsletterSubscribers,
  sendNewsletter,
  
  // Site settings
  getSiteSettings,
  updateSiteSettings,
  
  // Database management
  createDatabaseBackup,
  restoreDatabaseBackup,
  getDatabaseHealth,
  performDatabaseCleanup,
  getDatabaseStats,
  
  // Enhanced comment management with context
  getAdminComments,
  updateCommentStatus,
  addAdminReply,
  deleteComment,
  toggleCommentReport,
  
  // Article management (direct functions)
  getAdminArticlesDirect,
  getAdminCategoriesDirect,
  deleteArticleDirect,
  
  // Dashboard statistics
  getDashboardStats
} from './admin-supabase-direct';

// CRUD operations and utilities
export { 
  updateArticle, 
  deleteArticle, 
  getBreakingNews, 
  updateBreakingNews,
  getAdminArticles,
  getAdminCategories,
  getAdminAuthors,
  
  // Advertisement management
  getAdminAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  
  // Mobile app management
  getMobileAppConfig,
  updateMobileAppConfig,
  sendPushNotification,
  getMobileAppAnalytics,
  getPushNotificationHistory,
  
  // User management
  getAdminUsers,
  updateUserRole
} from './admin-api-direct';