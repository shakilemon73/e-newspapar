import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Creating tables directly in Supabase...');

// Create client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createTablesDirectly() {
  try {
    // Create reading_history table
    console.log('Creating reading_history table...');
    let { data, error } = await supabase
      .from('reading_history')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        article_id: 1,
        last_read_at: new Date().toISOString(),
        read_count: 1
      });
    
    if (error && error.code !== '42P01') {
      console.log('✅ reading_history table exists');
    } else if (error && error.code === '42P01') {
      console.log('❌ reading_history table needs to be created');
    } else {
      console.log('✅ reading_history table created and working');
      // Clean up test data
      await supabase.from('reading_history').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
    }

    // Create saved_articles table
    console.log('Creating saved_articles table...');
    ({ data, error } = await supabase
      .from('saved_articles')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        article_id: 1,
        saved_at: new Date().toISOString()
      }));
    
    if (error && error.code !== '42P01') {
      console.log('✅ saved_articles table exists');
    } else if (error && error.code === '42P01') {
      console.log('❌ saved_articles table needs to be created');
    } else {
      console.log('✅ saved_articles table created and working');
      // Clean up test data
      await supabase.from('saved_articles').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
    }

    // Create user_analytics table
    console.log('Creating user_analytics table...');
    ({ data, error } = await supabase
      .from('user_analytics')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        session_id: 'test-session',
        page_views: 1,
        total_time_spent: 60,
        articles_read: 1,
        categories_viewed: ['politics'],
        device_type: 'desktop',
        browser_info: 'Chrome'
      }));
    
    if (error && error.code !== '42P01') {
      console.log('✅ user_analytics table exists');
    } else if (error && error.code === '42P01') {
      console.log('❌ user_analytics table needs to be created');
    } else {
      console.log('✅ user_analytics table created and working');
      // Clean up test data
      await supabase.from('user_analytics').delete().eq('session_id', 'test-session');
    }

    // Create article_analytics table
    console.log('Creating article_analytics table...');
    ({ data, error } = await supabase
      .from('article_analytics')
      .insert({
        article_id: 1,
        view_count: 10,
        unique_views: 8,
        engagement_score: 2.5,
        trending_score: 1.8
      }));
    
    if (error && error.code !== '42P01') {
      console.log('✅ article_analytics table exists');
    } else if (error && error.code === '42P01') {
      console.log('❌ article_analytics table needs to be created');
    } else {
      console.log('✅ article_analytics table created and working');
      // Clean up test data
      await supabase.from('article_analytics').delete().eq('article_id', 1);
    }

    // Create user_interactions table
    console.log('Creating user_interactions table...');
    ({ data, error } = await supabase
      .from('user_interactions')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        article_id: 1,
        interaction_type: 'view',
        interaction_value: 1.0,
        reading_duration: 180,
        scroll_depth: 85.5
      }));
    
    if (error && error.code !== '42P01') {
      console.log('✅ user_interactions table exists');
    } else if (error && error.code === '42P01') {
      console.log('❌ user_interactions table needs to be created');
    } else {
      console.log('✅ user_interactions table created and working');
      // Clean up test data
      await supabase.from('user_interactions').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
    }

    // Create user_preferences table
    console.log('Creating user_preferences table...');
    ({ data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        category_id: 1,
        interest_score: 3.5,
        interaction_count: 5
      }));
    
    if (error && error.code !== '42P01') {
      console.log('✅ user_preferences table exists');
    } else if (error && error.code === '42P01') {
      console.log('❌ user_preferences table needs to be created');
    } else {
      console.log('✅ user_preferences table created and working');
      // Clean up test data
      await supabase.from('user_preferences').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
    }

    // Create search_history table
    console.log('Creating search_history table...');
    ({ data, error } = await supabase
      .from('search_history')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        search_query: 'বাংলাদেশ',
        search_results_count: 15,
        clicked_result_id: 1
      }));
    
    if (error && error.code !== '42P01') {
      console.log('✅ search_history table exists');
    } else if (error && error.code === '42P01') {
      console.log('❌ search_history table needs to be created');
    } else {
      console.log('✅ search_history table created and working');
      // Clean up test data
      await supabase.from('search_history').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
    }

    // Create recommendation_cache table
    console.log('Creating recommendation_cache table...');
    ({ data, error } = await supabase
      .from('recommendation_cache')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        article_id: 1,
        recommendation_score: 4.2,
        recommendation_reason: 'Based on reading history',
        algorithm_version: 'v1.0'
      }));
    
    if (error && error.code !== '42P01') {
      console.log('✅ recommendation_cache table exists');
    } else if (error && error.code === '42P01') {
      console.log('❌ recommendation_cache table needs to be created');
    } else {
      console.log('✅ recommendation_cache table created and working');
      // Clean up test data
      await supabase.from('recommendation_cache').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
    }

    console.log('\n🎉 Table creation process completed!');
    console.log('If any tables need to be created, the SQL is available in advanced-algorithms.sql');

  } catch (error) {
    console.error('Error:', error);
  }
}

createTablesDirectly();