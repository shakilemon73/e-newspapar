import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function analyzeTableUsage() {
  console.log('📊 ANALYZING TABLE USAGE FOR PUBLIC & USER FUNCTIONALITY');
  console.log('========================================================\n');

  const tables = [
    'articles', 'categories', 'breaking_news', 'video_content', 'audio_articles',
    'epapers', 'weather', 'user_profiles', 'user_settings', 'article_ai_analysis',
    'user_likes', 'user_bookmarks', 'user_interactions', 'page_views', 'trending_topics',
    'polls', 'tags', 'article_tags', 'media_files', 'newsletters', 'surveys',
    'reviews', 'ratings', 'logs', 'error_logs', 'audit_logs', 'system_settings',
    'admin_actions', 'interaction_logs', 'click_tracking', 'engagement_metrics',
    'user_reading_history', 'article_analytics', 'documents', 'user_roles',
    'user_sessions', 'user_permissions', 'user_bookmarks', 'user_shares'
  ];

  const analysis = {
    publicPages: [],
    userFeatures: [],
    adminOnly: [],
    analytics: [],
    system: []
  };

  console.log('🌍 PUBLIC PAGE TABLES (Anonymous Access):');
  console.log('==========================================');
  const publicTables = [
    'articles', 'categories', 'breaking_news', 'video_content', 'audio_articles',
    'epapers', 'weather', 'trending_topics', 'polls', 'tags', 'article_tags',
    'media_files', 'article_ai_analysis', 'reviews', 'ratings', 'system_settings'
  ];
  
  for (const table of publicTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        analysis.publicPages.push(table);
        console.log(`✅ ${table} - ${data?.length || 0} rows`);
      }
    } catch (e) {
      console.log(`❌ ${table} - error`);
    }
  }

  console.log('\n👤 USER FEATURE TABLES (Authenticated Access):');
  console.log('===============================================');
  const userTables = [
    'user_profiles', 'user_settings', 'user_likes', 'user_bookmarks', 
    'user_interactions', 'user_reading_history', 'user_shares', 'user_roles',
    'user_sessions', 'user_permissions', 'newsletters', 'surveys'
  ];
  
  for (const table of userTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        analysis.userFeatures.push(table);
        console.log(`✅ ${table} - ${data?.length || 0} rows`);
      }
    } catch (e) {
      console.log(`❌ ${table} - error`);
    }
  }

  console.log('\n🔧 ADMIN ONLY TABLES:');
  console.log('=====================');
  const adminTables = [
    'admin_actions', 'audit_logs', 'error_logs', 'logs', 'documents'
  ];
  
  for (const table of adminTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        analysis.adminOnly.push(table);
        console.log(`✅ ${table} - ${data?.length || 0} rows`);
      }
    } catch (e) {
      console.log(`❌ ${table} - error`);
    }
  }

  console.log('\n📈 ANALYTICS & TRACKING TABLES:');
  console.log('===============================');
  const analyticsTables = [
    'page_views', 'click_tracking', 'engagement_metrics', 'article_analytics',
    'interaction_logs'
  ];
  
  for (const table of analyticsTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        analysis.analytics.push(table);
        console.log(`✅ ${table} - ${data?.length || 0} rows`);
      }
    } catch (e) {
      console.log(`❌ ${table} - error`);
    }
  }

  console.log('\n📋 SUMMARY:');
  console.log('===========');
  console.log(`🌍 Public Pages: ${analysis.publicPages.length} tables`);
  console.log(`👤 User Features: ${analysis.userFeatures.length} tables`);
  console.log(`🔧 Admin Only: ${analysis.adminOnly.length} tables`);
  console.log(`📈 Analytics: ${analysis.analytics.length} tables`);
  console.log(`📊 Total Working: ${analysis.publicPages.length + analysis.userFeatures.length + analysis.adminOnly.length + analysis.analytics.length} tables`);

  console.log('\n🎯 CRITICAL MISSING TABLES:');
  console.log('============================');
  const allWorking = [...analysis.publicPages, ...analysis.userFeatures, ...analysis.adminOnly, ...analysis.analytics];
  const missing = tables.filter(t => !allWorking.includes(t));
  
  if (missing.length === 0) {
    console.log('✅ All tables are working correctly!');
  } else {
    missing.forEach(table => {
      if (table === 'user_storage') {
        console.log(`❌ ${table} - NEEDS MANUAL CREATION (causes Vercel 404s)`);
      } else {
        console.log(`⚠️  ${table} - needs verification`);
      }
    });
  }

  console.log('\n🚀 DEPLOYMENT STATUS:');
  console.log('=====================');
  if (missing.length <= 1 && missing[0] === 'user_storage') {
    console.log('✅ Ready for Vercel deployment after creating user_storage table');
  } else {
    console.log(`⚠️  ${missing.length} tables need fixing before deployment`);
  }

  return analysis;
}

analyzeTableUsage().then(() => {
  console.log('\n✅ Table analysis completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});