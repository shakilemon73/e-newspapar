import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateTables() {
  console.log('🔍 Checking existing tables...');
  
  // Check if articles table exists
  const { data: articlesCheck } = await supabase
    .from('articles')
    .select('id')
    .limit(1);
  
  if (!articlesCheck) {
    console.log('❌ Articles table missing - this is a core table needed');
    return;
  }
  
  console.log('✅ Articles table exists');
  
  // Check and create reading_history table
  const { data: readingHistoryCheck, error: rhError } = await supabase
    .from('reading_history')
    .select('id')
    .limit(1);
  
  if (rhError && rhError.code === 'PGRST106') {
    console.log('📝 Creating reading_history table...');
    const { error: createError } = await supabase.rpc('create_reading_history_table');
    if (createError) {
      console.log('⚠️  reading_history table creation may need manual setup');
    } else {
      console.log('✅ reading_history table created');
    }
  } else {
    console.log('✅ reading_history table exists');
  }
  
  // Check and create user_storage table
  const { data: userStorageCheck, error: usError } = await supabase
    .from('user_storage')
    .select('id')
    .limit(1);
  
  if (usError && usError.code === 'PGRST106') {
    console.log('📝 Creating user_storage table...');
    const { error: createError } = await supabase.rpc('create_user_storage_table');
    if (createError) {
      console.log('⚠️  user_storage table creation may need manual setup');
    } else {
      console.log('✅ user_storage table created');
    }
  } else {
    console.log('✅ user_storage table exists');
  }
  
  // Check weather table
  const { data: weatherCheck, error: wError } = await supabase
    .from('weather')
    .select('id')
    .limit(1);
  
  if (wError) {
    console.log('⚠️  Weather table may need setup');
  } else {
    console.log('✅ Weather table exists');
  }
  
  console.log('🎉 Database check completed!');
}

checkAndCreateTables().catch(console.error);