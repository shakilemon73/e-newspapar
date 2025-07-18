import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStatus() {
  console.log('🔍 Checking Supabase table status...\n');
  
  const requiredTables = [
    // Core tables (actively used)
    'categories', 'articles', 'epapers', 'weather', 'breaking_news', 
    'video_content', 'audio_articles', 'social_media_posts',
    
    // User enhancement tables (may be unused)
    'user_reading_history', 'user_saved_articles', 'user_preferences', 
    'user_interactions', 'article_analytics', 'user_search_history', 
    'trending_topics'
  ];
  
  const usedTables = [];
  const unusedTables = [];
  const missingTables = [];
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        missingTables.push(table);
      } else {
        // Get count
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        const rowCount = countError ? 'unknown' : count || 0;
        console.log(`✅ ${table}: exists, ${rowCount} rows`);
        
        if (rowCount > 0) {
          usedTables.push(table);
        } else {
          unusedTables.push(table);
        }
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
      missingTables.push(table);
    }
  }
  
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Used tables (${usedTables.length}):`, usedTables.join(', '));
  console.log(`⚠️  Empty tables (${unusedTables.length}):`, unusedTables.join(', '));
  console.log(`❌ Missing tables (${missingTables.length}):`, missingTables.join(', '));
  
  return {
    usedTables,
    unusedTables,
    missingTables
  };
}

// Run the check
checkTableStatus().catch(console.error);