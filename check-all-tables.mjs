import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAllTablesAndUsage() {
  console.log('🔍 Checking all 41 Supabase tables...\n');
  
  try {
    // Get all tables in the public schema
    const { data: tables, error } = await supabase
      .rpc('get_all_tables');
    
    if (error) {
      // Alternative method: use information_schema if rpc fails
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name');
      
      if (schemaError) {
        console.log('❌ Cannot access table schema directly. Using manual table list...');
        
        // Manual list of common tables to check
        const tablesToCheck = [
          // Core content tables
          'categories', 'articles', 'epapers', 'weather', 'breaking_news',
          'video_content', 'audio_articles', 'social_media_posts',
          
          // User management tables
          'users', 'user_profiles', 'user_settings', 'user_preferences',
          'user_roles', 'user_sessions', 'user_permissions',
          
          // User interaction tables
          'user_reading_history', 'user_saved_articles', 'user_interactions',
          'user_search_history', 'user_comments', 'user_likes', 'user_shares',
          'user_bookmarks', 'user_subscriptions', 'user_notifications',
          
          // Analytics tables
          'article_analytics', 'user_analytics', 'page_views', 'click_tracking',
          'trending_topics', 'popular_content', 'engagement_metrics',
          
          // Content management tables
          'tags', 'article_tags', 'media_files', 'images', 'documents',
          'newsletters', 'polls', 'surveys', 'comments', 'reviews',
          
          // System tables
          'logs', 'error_logs', 'audit_logs', 'backups', 'migrations'
        ];
        
        return await checkTablesList(tablesToCheck);
      } else {
        const tableNames = schemaData.map(t => t.table_name);
        return await checkTablesList(tableNames);
      }
    } else {
      return await checkTablesList(tables);
    }
    
  } catch (error) {
    console.error('❌ Error getting tables:', error);
    
    // Fallback: check known tables manually
    const knownTables = [
      'categories', 'articles', 'epapers', 'weather', 'breaking_news',
      'video_content', 'audio_articles', 'social_media_posts',
      'user_reading_history', 'user_saved_articles', 'user_preferences',
      'user_interactions', 'article_analytics', 'user_search_history',
      'trending_topics'
    ];
    
    return await checkTablesList(knownTables);
  }
}

async function checkTablesList(tableNames) {
  const results = {
    used: [],
    empty: [],
    missing: [],
    total: tableNames.length
  };
  
  console.log(`📊 Checking ${tableNames.length} tables...\n`);
  
  for (const tableName of tableNames) {
    try {
      // Check if table exists and get row count
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log(`❌ ${tableName}: Table does not exist`);
          results.missing.push(tableName);
        } else {
          console.log(`⚠️  ${tableName}: Error - ${error.message}`);
          results.missing.push(tableName);
        }
      } else {
        const rowCount = count || 0;
        if (rowCount > 0) {
          console.log(`✅ ${tableName}: ${rowCount} rows (USED)`);
          results.used.push({ name: tableName, count: rowCount });
        } else {
          console.log(`⚪ ${tableName}: 0 rows (EMPTY)`);
          results.empty.push(tableName);
        }
      }
    } catch (e) {
      console.log(`❌ ${tableName}: ${e.message}`);
      results.missing.push(tableName);
    }
  }
  
  return results;
}

async function analyzeUsageAndSuggestions(results) {
  console.log('\n📈 DETAILED ANALYSIS:\n');
  
  console.log(`✅ USED TABLES (${results.used.length}):`);
  results.used.forEach(table => {
    console.log(`   ${table.name}: ${table.count} records`);
  });
  
  console.log(`\n⚪ EMPTY TABLES (${results.empty.length}):`);
  results.empty.forEach(table => {
    console.log(`   ${table}: Ready for data`);
  });
  
  console.log(`\n❌ MISSING TABLES (${results.missing.length}):`);
  results.missing.forEach(table => {
    console.log(`   ${table}: Needs creation`);
  });
  
  console.log('\n🔧 RECOMMENDATIONS:');
  
  // Suggest connections for empty tables
  if (results.empty.length > 0) {
    console.log('\n📋 Empty tables to connect:');
    results.empty.forEach(table => {
      switch(table) {
        case 'user_reading_history':
          console.log(`   ${table}: Connect to article view tracking`);
          break;
        case 'user_saved_articles':
          console.log(`   ${table}: Connect to bookmark functionality`);
          break;
        case 'user_search_history':
          console.log(`   ${table}: Connect to search tracking`);
          break;
        case 'trending_topics':
          console.log(`   ${table}: Connect to trend analysis`);
          break;
        case 'user_notifications':
          console.log(`   ${table}: Connect to notification system`);
          break;
        case 'user_comments':
          console.log(`   ${table}: Connect to article comments`);
          break;
        default:
          console.log(`   ${table}: Needs functionality implementation`);
      }
    });
  }
  
  return results;
}

// Run the analysis
getAllTablesAndUsage()
  .then(analyzeUsageAndSuggestions)
  .catch(console.error);