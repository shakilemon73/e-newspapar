import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create service role client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getAllTables() {
  console.log('🔍 Getting all tables using service role key...');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Service Key: ${serviceRoleKey ? 'CONFIGURED' : 'MISSING'}`);
  console.log('');

  try {
    // Make direct POST request to get table names
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_table_names`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      console.log('RPC failed, trying direct query...');
      
      // Alternative: Query information_schema directly
      const queryResponse = await fetch(`${supabaseUrl}/rest/v1/information_schema.tables?select=table_name&table_schema=eq.public&table_type=eq.BASE TABLE&order=table_name`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Accept': 'application/json'
        }
      });

      if (!queryResponse.ok) {
        console.log('Direct query failed, using Supabase client...');
        
        // Fallback: Use known table names and test each one
        const knownTables = [
          'articles', 'categories', 'breaking_news', 'video_content', 'audio_articles',
          'epapers', 'weather', 'user_profiles', 'user_settings', 'reading_history',
          'user_storage', 'article_ai_analysis', 'user_likes', 'user_bookmarks',
          'user_interactions', 'page_views', 'trending_topics', 'polls', 'tags',
          'article_tags', 'media_files', 'newsletters', 'surveys', 'reviews',
          'ratings', 'logs', 'error_logs', 'audit_logs', 'system_settings',
          'admin_actions', 'interaction_logs', 'click_tracking', 'engagement_metrics',
          'user_reading_history', 'article_analytics', 'documents', 'user_roles',
          'user_sessions', 'user_permissions', 'user_bookmarks', 'user_shares'
        ];

        console.log('📋 TESTING ALL KNOWN TABLES:');
        console.log('============================');
        
        let existingTables = [];
        let tableCount = 0;

        for (const tableName of knownTables) {
          try {
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);

            if (!error) {
              existingTables.push(tableName);
              tableCount++;
              console.log(`${tableCount}. ${tableName} ✅`);
            } else if (error.code === '42P01') {
              console.log(`   ${tableName} ❌ (missing)`);
            } else {
              console.log(`   ${tableName} ⚠️  (${error.message})`);
            }
          } catch (e) {
            console.log(`   ${tableName} ❌ (error)`);
          }
        }

        console.log('');
        console.log(`📊 SUMMARY:`);
        console.log(`Total existing tables: ${existingTables.length}`);
        console.log(`Missing tables: ${knownTables.length - existingTables.length}`);
        console.log('');
        console.log('📝 EXISTING TABLES LIST:');
        existingTables.forEach((table, index) => {
          console.log(`${index + 1}. ${table}`);
        });

        return existingTables;
      }

      const data = await queryResponse.json();
      console.log('Tables from direct query:', data);
      return data;
    }

    const data = await response.json();
    console.log('Tables from RPC:', data);
    return data;

  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Execute
getAllTables().then((tables) => {
  console.log('\n✅ Table listing completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});