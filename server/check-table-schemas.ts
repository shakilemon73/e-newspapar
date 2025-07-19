import { supabase } from './supabase';

async function checkTableSchemas() {
  console.log('🔍 Checking table schemas...');
  
  const tables = [
    'social_media_posts',
    'video_content', 
    'audio_articles',
    'polls'
  ];
  
  for (const table of tables) {
    try {
      console.log(`\n📋 Table: ${table}`);
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.log(`❌ Error accessing ${table}:`, error.message);
        continue;
      }
      
      if (data && data.length > 0) {
        console.log('✅ Columns found:', Object.keys(data[0]).join(', '));
      } else {
        // Try inserting a minimal record to see what columns are required
        console.log('📝 Trying to detect required columns...');
        const testInsert = await supabase.from(table).insert({}).select();
        console.log('Insert result:', testInsert.error?.message || 'Success');
      }
    } catch (err) {
      console.log(`❌ Error with ${table}:`, err);
    }
  }
}

checkTableSchemas().catch(console.error);