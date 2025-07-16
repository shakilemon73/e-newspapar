import { supabase } from './server/supabase.js';

async function testMigration() {
  console.log('🧪 Testing Supabase migration...');
  
  // Test each table we created
  const tables = [
    'user_reading_history',
    'user_saved_articles',
    'user_preferences',
    'user_interactions',
    'article_analytics',
    'user_search_history',
    'trending_topics'
  ];
  
  for (const table of tables) {
    try {
      console.log(`\n📊 Testing ${table}...`);
      
      // Test if table exists and can be queried
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Error accessing ${table}:`, error.message);
        continue;
      }
      
      console.log(`✅ ${table} accessible`);
      
      // Show some data if available
      if (data && data.length > 0) {
        console.log(`📋 Sample data from ${table}:`, data[0]);
      } else {
        console.log(`📋 ${table} is empty`);
      }
      
      // Test insert capability
      if (table === 'trending_topics') {
        console.log(`🧪 Testing insert into ${table}...`);
        const { data: insertData, error: insertError } = await supabase
          .from(table)
          .insert({
            topic_name: 'Test Topic',
            topic_type: 'test',
            mention_count: 1,
            trend_score: 0.1
          })
          .select();
        
        if (insertError) {
          console.error(`❌ Insert error for ${table}:`, insertError.message);
        } else {
          console.log(`✅ Insert successful for ${table}:`, insertData);
          
          // Clean up test data
          await supabase
            .from(table)
            .delete()
            .eq('topic_name', 'Test Topic');
        }
      }
      
    } catch (e) {
      console.error(`❌ Exception testing ${table}:`, e.message);
    }
  }
  
  console.log('\n🎯 Testing API endpoints...');
  
  // Test trending topics endpoint
  try {
    const response = await fetch('http://localhost:5000/api/trending-topics');
    const data = await response.json();
    console.log('📡 Trending topics API response:', data);
  } catch (e) {
    console.error('❌ API test failed:', e.message);
  }
  
  console.log('\n✅ Migration test completed');
}

testMigration().catch(console.error);