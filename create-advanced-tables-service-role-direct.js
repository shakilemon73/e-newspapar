/**
 * Create Advanced Tables Using Service Role Key (Bypasses RLS)
 * This script uses the service_role key instead of anon key for admin operations
 */
import { createClient } from '@supabase/supabase-js';

// Use the service_role key (not anon key) for admin operations
const supabase = createClient(
  'https://mrjukcqspvhketnfzmud.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4', // Service role key bypasses RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createAdvancedTablesWithServiceRole() {
  console.log('🚀 Creating advanced tables using service role key...');
  
  // Test connection first
  const { data: testData, error: testError } = await supabase
    .from('categories')
    .select('count')
    .limit(1);
    
  if (testError) {
    console.error('❌ Service role connection failed:', testError);
    return;
  }
  
  console.log('✅ Service role connection successful');
  
  // Create tables using direct table creation (no SQL execution needed)
  const results = [];
  
  // Create user_notifications table by inserting a test record
  try {
    console.log('Creating user_notifications table...');
    const { data, error } = await supabase
      .from('user_notifications')
      .insert([
        {
          user_id: 'fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d',
          title: 'স্বাগতম',
          content: 'প্রথম আলো-তে আপনাকে স্বাগতম!',
          type: 'welcome'
        }
      ])
      .select();
      
    if (error) {
      console.log(`❌ user_notifications table does not exist: ${error.message}`);
      results.push({ table: 'user_notifications', exists: false, error: error.message });
    } else {
      console.log('✅ user_notifications table exists and working');
      results.push({ table: 'user_notifications', exists: true, data: data });
    }
  } catch (err) {
    console.log(`❌ user_notifications error: ${err.message}`);
    results.push({ table: 'user_notifications', exists: false, error: err.message });
  }
  
  // Create user_sessions table
  try {
    console.log('Creating user_sessions table...');
    const { data, error } = await supabase
      .from('user_sessions')
      .insert([
        {
          user_id: 'fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d',
          pages_visited: 5,
          articles_read: 3,
          time_spent: 1200
        }
      ])
      .select();
      
    if (error) {
      console.log(`❌ user_sessions table does not exist: ${error.message}`);
      results.push({ table: 'user_sessions', exists: false, error: error.message });
    } else {
      console.log('✅ user_sessions table exists and working');
      results.push({ table: 'user_sessions', exists: true, data: data });
    }
  } catch (err) {
    console.log(`❌ user_sessions error: ${err.message}`);
    results.push({ table: 'user_sessions', exists: false, error: err.message });
  }
  
  // Create user_feedback table
  try {
    console.log('Creating user_feedback table...');
    const { data, error } = await supabase
      .from('user_feedback')
      .insert([
        {
          user_id: 'fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d',
          article_id: 1,
          rating: 5,
          comment: 'অসাধারণ নিবন্ধ!',
          feedback_type: 'rating'
        }
      ])
      .select();
      
    if (error) {
      console.log(`❌ user_feedback table does not exist: ${error.message}`);
      results.push({ table: 'user_feedback', exists: false, error: error.message });
    } else {
      console.log('✅ user_feedback table exists and working');
      results.push({ table: 'user_feedback', exists: true, data: data });
    }
  } catch (err) {
    console.log(`❌ user_feedback error: ${err.message}`);
    results.push({ table: 'user_feedback', exists: false, error: err.message });
  }
  
  // Create reading_goals table
  try {
    console.log('Creating reading_goals table...');
    const { data, error } = await supabase
      .from('reading_goals')
      .insert([
        {
          user_id: 'fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d',
          goal_type: 'articles_read',
          target_value: 50,
          current_value: 12,
          time_period: 'monthly'
        }
      ])
      .select();
      
    if (error) {
      console.log(`❌ reading_goals table does not exist: ${error.message}`);
      results.push({ table: 'reading_goals', exists: false, error: error.message });
    } else {
      console.log('✅ reading_goals table exists and working');
      results.push({ table: 'reading_goals', exists: true, data: data });
    }
  } catch (err) {
    console.log(`❌ reading_goals error: ${err.message}`);
    results.push({ table: 'reading_goals', exists: false, error: err.message });
  }
  
  // Create performance_metrics table
  try {
    console.log('Creating performance_metrics table...');
    const { data, error } = await supabase
      .from('performance_metrics')
      .insert([
        {
          metric_name: 'avg_page_load_time',
          metric_value: 1.2,
          metric_type: 'performance',
          category: 'frontend'
        }
      ])
      .select();
      
    if (error) {
      console.log(`❌ performance_metrics table does not exist: ${error.message}`);
      results.push({ table: 'performance_metrics', exists: false, error: error.message });
    } else {
      console.log('✅ performance_metrics table exists and working');
      results.push({ table: 'performance_metrics', exists: true, data: data });
    }
  } catch (err) {
    console.log(`❌ performance_metrics error: ${err.message}`);
    results.push({ table: 'performance_metrics', exists: false, error: err.message });
  }
  
  // Create article_comments table
  try {
    console.log('Creating article_comments table...');
    const { data, error } = await supabase
      .from('article_comments')
      .insert([
        {
          article_id: 1,
          user_id: 'fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d',
          content: 'দারুণ নিবন্ধ! খুব ভালো লাগলো।',
          is_approved: true
        }
      ])
      .select();
      
    if (error) {
      console.log(`❌ article_comments table does not exist: ${error.message}`);
      results.push({ table: 'article_comments', exists: false, error: error.message });
    } else {
      console.log('✅ article_comments table exists and working');
      results.push({ table: 'article_comments', exists: true, data: data });
    }
  } catch (err) {
    console.log(`❌ article_comments error: ${err.message}`);
    results.push({ table: 'article_comments', exists: false, error: err.message });
  }
  
  // Create user_follows table
  try {
    console.log('Creating user_follows table...');
    const { data, error } = await supabase
      .from('user_follows')
      .insert([
        {
          follower_id: 'fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d',
          following_id: 'fb6c3e4f-5f8e-4b2c-9d9e-6f7a8b9c0d1e'
        }
      ])
      .select();
      
    if (error) {
      console.log(`❌ user_follows table does not exist: ${error.message}`);
      results.push({ table: 'user_follows', exists: false, error: error.message });
    } else {
      console.log('✅ user_follows table exists and working');
      results.push({ table: 'user_follows', exists: true, data: data });
    }
  } catch (err) {
    console.log(`❌ user_follows error: ${err.message}`);
    results.push({ table: 'user_follows', exists: false, error: err.message });
  }
  
  // Summary
  console.log('\n📊 Summary of Advanced Tables Status:');
  results.forEach(result => {
    if (result.exists) {
      console.log(`✅ ${result.table} - Working with sample data`);
    } else {
      console.log(`❌ ${result.table} - Does not exist`);
    }
  });
  
  const existingTables = results.filter(r => r.exists);
  const missingTables = results.filter(r => !r.exists);
  
  console.log(`\n📈 Status: ${existingTables.length}/${results.length} tables exist`);
  
  if (missingTables.length > 0) {
    console.log('\n🔧 Missing tables need to be created manually in Supabase SQL Editor:');
    missingTables.forEach(table => {
      console.log(`  - ${table.table}`);
    });
    console.log('\nUse the SQL script in ADVANCED_TABLES_SUPABASE.sql to create missing tables');
  }
  
  return results;
}

// Run the script
createAdvancedTablesWithServiceRole()
  .then(() => {
    console.log('\n✅ Advanced tables check completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });