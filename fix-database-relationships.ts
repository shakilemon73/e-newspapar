import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabaseRelationships() {
  console.log('🔍 Checking database relationships...');
  
  try {
    // Test reading_history with proper join
    console.log('📚 Testing reading_history relationship...');
    const { data: readingHistory, error: rhError } = await supabase
      .from('reading_history')
      .select(`
        id,
        user_id,
        article_id,
        created_at,
        last_read_at
      `)
      .limit(5);
    
    if (rhError) {
      console.log('⚠️ Reading history error:', rhError.message);
    } else {
      console.log('✅ Reading history table accessible, found', readingHistory?.length || 0, 'records');
    }
    
    // Test if user_reading_history exists (alternative table name)
    console.log('📚 Testing user_reading_history...');
    const { data: userReading, error: urError } = await supabase
      .from('user_reading_history')
      .select('*')
      .limit(1);
      
    if (urError) {
      console.log('⚠️ user_reading_history error:', urError.message);
    } else {
      console.log('✅ user_reading_history table exists');
    }
    
    // Check articles table structure
    console.log('📄 Checking articles table...');
    const { data: articles, error: artError } = await supabase
      .from('articles')
      .select('id, title, slug, category_id')
      .limit(3);
      
    if (artError) {
      console.log('❌ Articles error:', artError.message);
    } else {
      console.log('✅ Articles table accessible, found', articles?.length || 0, 'records');
    }
    
    // Check categories table
    console.log('🏷️ Checking categories table...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .limit(3);
      
    if (catError) {
      console.log('❌ Categories error:', catError.message);
    } else {
      console.log('✅ Categories table accessible, found', categories?.length || 0, 'records');
    }
    
    // Check weather table specifically
    console.log('🌤️ Checking weather table...');
    const { data: weather, error: wError } = await supabase
      .from('weather')
      .select('*')
      .limit(1);
      
    if (wError) {
      console.log('⚠️ Weather error:', wError.message);
    } else {
      console.log('✅ Weather table accessible');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

fixDatabaseRelationships().catch(console.error);