import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCompleteTableList() {
  console.log('📋 COMPLETE SUPABASE TABLE ANALYSIS\n');
  console.log('=' . repeat(60));
  
  // Get all actual tables from information_schema
  const { data: actualTables, error } = await supabase
    .rpc('sql', { 
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      ` 
    });
  
  if (error) {
    console.log('Using alternative method to get tables...');
    return await analyzeKnownTables();
  }
  
  console.log(`Found ${actualTables.length} actual tables in your database\n`);
  
  const analysis = {
    used: [],
    empty: [],
    missing: [],
    total: actualTables.length
  };
  
  for (const tableRow of actualTables) {
    const tableName = tableRow.table_name;
    
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${tableName}: Error accessing table`);
        analysis.missing.push(tableName);
      } else {
        const rowCount = count || 0;
        if (rowCount > 0) {
          analysis.used.push({ name: tableName, count: rowCount });
        } else {
          analysis.empty.push(tableName);
        }
      }
    } catch (e) {
      analysis.missing.push(tableName);
    }
  }
  
  return analysis;
}

async function analyzeKnownTables() {
  // Extended list of tables to check based on your 41+ table count
  const allTablesToCheck = [
    // Core content tables
    'categories', 'articles', 'epapers', 'weather', 'breaking_news',
    'video_content', 'audio_articles', 'social_media_posts',
    
    // User management
    'users', 'user_profiles', 'user_settings', 'user_preferences',
    'user_roles', 'user_sessions', 'user_permissions', 'user_metadata',
    
    // User interactions
    'user_reading_history', 'user_saved_articles', 'user_interactions',
    'user_search_history', 'user_comments', 'user_likes', 'user_shares',
    'user_bookmarks', 'user_subscriptions', 'user_notifications',
    'user_achievements', 'user_badges', 'user_activity',
    
    // Analytics and tracking
    'article_analytics', 'user_analytics', 'page_views', 'click_tracking',
    'trending_topics', 'popular_content', 'engagement_metrics',
    'view_tracking', 'interaction_logs', 'performance_metrics',
    
    // Content management
    'tags', 'article_tags', 'media_files', 'images', 'documents',
    'newsletters', 'polls', 'surveys', 'comments', 'reviews',
    'ratings', 'feedback', 'content_moderation',
    
    // System and admin
    'logs', 'error_logs', 'audit_logs', 'backups', 'migrations',
    'system_settings', 'admin_actions', 'api_logs'
  ];
  
  const analysis = {
    used: [],
    empty: [],
    missing: [],
    total: allTablesToCheck.length
  };
  
  console.log(`Checking ${allTablesToCheck.length} potential tables...\n`);
  
  for (const tableName of allTablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          analysis.missing.push(tableName);
        } else {
          analysis.missing.push(tableName);
        }
      } else {
        const rowCount = count || 0;
        if (rowCount > 0) {
          analysis.used.push({ name: tableName, count: rowCount });
        } else {
          analysis.empty.push(tableName);
        }
      }
    } catch (e) {
      analysis.missing.push(tableName);
    }
  }
  
  return analysis;
}

function categorizeTablesByPriority(analysis) {
  console.log('\n📊 TABLE CATEGORIZATION BY PRIORITY\n');
  
  const categories = {
    highPriority: [],
    mediumPriority: [],
    lowPriority: [],
    systemTables: []
  };
  
  analysis.empty.forEach(table => {
    if (['user_saved_articles', 'user_comments', 'comments', 'tags', 'article_tags'].includes(table)) {
      categories.highPriority.push(table);
    } else if (['user_likes', 'user_shares', 'page_views', 'newsletters', 'polls'].includes(table)) {
      categories.mediumPriority.push(table);
    } else if (['logs', 'error_logs', 'audit_logs', 'backups'].includes(table)) {
      categories.systemTables.push(table);
    } else {
      categories.lowPriority.push(table);
    }
  });
  
  console.log('🔥 HIGH PRIORITY (Immediate Implementation):');
  categories.highPriority.forEach(table => {
    console.log(`   ✅ ${table}: Core user functionality`);
  });
  
  console.log('\n🟡 MEDIUM PRIORITY (Next Phase):');
  categories.mediumPriority.forEach(table => {
    console.log(`   ⚡ ${table}: Enhanced user experience`);
  });
  
  console.log('\n📝 SYSTEM TABLES (Background):');
  categories.systemTables.forEach(table => {
    console.log(`   🔧 ${table}: System monitoring`);
  });
  
  console.log('\n⚪ OTHER TABLES:');
  categories.lowPriority.forEach(table => {
    console.log(`   📋 ${table}: Future features`);
  });
  
  return categories;
}

function generateImplementationPlan(categories, usedTables) {
  console.log('\n🚀 IMPLEMENTATION PLAN\n');
  console.log('=' . repeat(50));
  
  console.log('\n✅ CURRENTLY ACTIVE TABLES:');
  usedTables.forEach(table => {
    console.log(`   ${table.name}: ${table.count} records`);
  });
  
  console.log('\n📋 PHASE 1 - HIGH PRIORITY IMPLEMENTATIONS:');
  
  const implementations = {
    'user_saved_articles': {
      endpoint: '/api/saved-articles',
      frontend: 'BookmarkButton component',
      description: 'Save/unsave articles functionality'
    },
    'comments': {
      endpoint: '/api/articles/:id/comments',
      frontend: 'CommentSection component', 
      description: 'Article comment system'
    },
    'tags': {
      endpoint: '/api/tags',
      frontend: 'TagFilter component',
      description: 'Article tagging system'
    },
    'article_tags': {
      endpoint: '/api/articles/:id/tags',
      frontend: 'ArticleTagsList component',
      description: 'Many-to-many article-tag relationships'
    }
  };
  
  categories.highPriority.forEach(table => {
    if (implementations[table]) {
      const impl = implementations[table];
      console.log(`\n   📌 ${table}:`);
      console.log(`      API: ${impl.endpoint}`);
      console.log(`      UI: ${impl.frontend}`);
      console.log(`      Purpose: ${impl.description}`);
    }
  });
  
  console.log('\n📋 PHASE 2 - MEDIUM PRIORITY:');
  console.log('   • User engagement features (likes, shares)');
  console.log('   • Analytics and tracking');
  console.log('   • Newsletter system');
  console.log('   • Polls and surveys');
  
  console.log('\n📋 PHASE 3 - SYSTEM OPTIMIZATION:');
  console.log('   • Logging and monitoring');
  console.log('   • Performance tracking');
  console.log('   • Admin tools');
}

// Run complete analysis
async function runCompleteAnalysis() {
  try {
    const analysis = await getCompleteTableList();
    
    console.log('\n📈 SUMMARY STATISTICS:');
    console.log(`   Total Tables: ${analysis.total}`);
    console.log(`   Used Tables: ${analysis.used.length}`);
    console.log(`   Empty Tables: ${analysis.empty.length}`);
    console.log(`   Missing/Error Tables: ${analysis.missing.length}`);
    
    const categories = categorizeTablesByPriority(analysis);
    generateImplementationPlan(categories, analysis.used);
    
    return analysis;
  } catch (error) {
    console.error('Error in analysis:', error);
  }
}

runCompleteAnalysis();