import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableSchemas() {
  console.log('🔍 Checking table schemas...\n');
  
  const tablesToCheck = [
    'user_reading_history',
    'user_search_history', 
    'trending_topics'
  ];
  
  for (const table of tablesToCheck) {
    try {
      console.log(`📋 Schema for ${table}:`);
      
      // Try to get one row to see the structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Error: ${error.message}\n`);
        continue;
      }
      
      // Try to insert empty record to see required columns
      const { error: insertError } = await supabase
        .from(table)
        .insert({});
      
      if (insertError) {
        // Parse error message to understand required fields
        const fields = insertError.message.match(/column "([^"]+)"/g);
        if (fields) {
          console.log(`Required fields: ${fields.join(', ')}`);
        } else {
          console.log(`Insert error: ${insertError.message}`);
        }
      }
      
      console.log('---\n');
      
    } catch (e) {
      console.log(`❌ ${table} error: ${e.message}\n`);
    }
  }
}

// Also populate with correct schema
async function populateWithCorrectSchema() {
  console.log('🔧 Attempting to populate with minimal data...\n');
  
  try {
    // Get some articles for reference
    const { data: articles } = await supabase
      .from('articles')
      .select('id')
      .limit(3);
    
    // Try user_reading_history with minimal fields
    console.log('📖 Trying user_reading_history...');
    const { error: historyError } = await supabase
      .from('user_reading_history')
      .insert({
        user_id: '12345678-1234-1234-1234-123456789012',
        article_id: articles[0]?.id || 1
      });
    
    if (historyError) {
      console.log(`❌ History error: ${historyError.message}`);
    } else {
      console.log('✅ Reading history populated');
    }
    
    // Try user_search_history
    console.log('🔍 Trying user_search_history...');
    const { error: searchError } = await supabase
      .from('user_search_history')
      .insert({
        user_id: '12345678-1234-1234-1234-123456789012',
        search_query: 'test search'
      });
    
    if (searchError) {
      console.log(`❌ Search error: ${searchError.message}`);
    } else {
      console.log('✅ Search history populated');
    }
    
    // Try trending_topics
    console.log('📈 Trying trending_topics...');
    const { error: trendingError } = await supabase
      .from('trending_topics')
      .insert({
        topic_name: 'Test Topic'
      });
    
    if (trendingError) {
      console.log(`❌ Trending error: ${trendingError.message}`);
    } else {
      console.log('✅ Trending topics populated');
    }
    
  } catch (error) {
    console.error('❌ Population error:', error);
  }
}

async function run() {
  await checkTableSchemas();
  await populateWithCorrectSchema();
}

run();