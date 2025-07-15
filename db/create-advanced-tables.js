import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Read environment variables
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdvancedTables() {
  console.log('🚀 Creating Advanced Algorithm Tables...');
  
  try {
    // 1. Create user_preferences table
    console.log('📝 Creating user_preferences table...');
    const { error: error1 } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);
    
    if (error1 && error1.code === 'PGRST116') {
      // Table doesn't exist, create it
      await supabase.rpc('create_user_preferences_table');
    }
    
    // 2. Create user_interactions table
    console.log('📝 Creating user_interactions table...');
    const { error: error2 } = await supabase
      .from('user_interactions')
      .select('*')
      .limit(1);
    
    if (error2 && error2.code === 'PGRST116') {
      // Table doesn't exist, create it
      await supabase.rpc('create_user_interactions_table');
    }
    
    // 3. Create article_analytics table
    console.log('📝 Creating article_analytics table...');
    const { error: error3 } = await supabase
      .from('article_analytics')
      .select('*')
      .limit(1);
    
    if (error3 && error3.code === 'PGRST116') {
      // Table doesn't exist, create it
      await supabase.rpc('create_article_analytics_table');
    }
    
    // 4. Create user_search_history table
    console.log('📝 Creating user_search_history table...');
    const { error: error4 } = await supabase
      .from('user_search_history')
      .select('*')
      .limit(1);
    
    if (error4 && error4.code === 'PGRST116') {
      // Table doesn't exist, create it
      await supabase.rpc('create_user_search_history_table');
    }
    
    console.log('✅ Advanced algorithm tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

// Run the setup
createAdvancedTables().catch(console.error);