import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupMissingTable() {
  try {
    console.log('📦 Creating missing user_saved_articles table...');
    
    // Read SQL file
    const sqlContent = fs.readFileSync('create-missing-tables.sql', 'utf8');
    
    // Execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error creating table:', error);
      
      // Try alternative method - create table directly
      console.log('🔄 Trying alternative creation method...');
      
      const { error: createError } = await supabase
        .from('user_saved_articles')
        .select('*')
        .limit(1);
      
      if (createError && createError.code === '42P01') {
        console.log('Table does not exist, needs manual creation in Supabase SQL Editor.');
        console.log('SQL to run in Supabase SQL Editor:');
        console.log(sqlContent);
      } else {
        console.log('✅ Table already exists or creation was successful');
      }
    } else {
      console.log('✅ Successfully created missing table');
    }
    
    // Verify table exists
    const { data: tableData, error: checkError } = await supabase
      .from('user_saved_articles')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log('❌ Table verification failed:', checkError.message);
    } else {
      console.log('✅ Table verified successfully');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupMissingTable();