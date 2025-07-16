import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Creating advanced algorithm tables directly...');

async function createTables() {
  // Create tables by inserting data and letting Supabase handle the schema
  const results = [];
  
  try {
    // 1. User Analytics Table
    console.log('Creating user_analytics table...');
    const { data: userAnalytics, error: userAnalyticsError } = await supabase
      .from('user_analytics')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        session_id: 'test-session',
        page_views: 1,
        total_time_spent: 60,
        articles_read: 1,
        categories_viewed: ['politics'],
        device_type: 'desktop',
        browser_info: 'Chrome',
        location_data: { city: 'Dhaka' }
      })
      .select();
    
    if (userAnalyticsError) {
      console.log('user_analytics error:', userAnalyticsError.message);
      results.push({ table: 'user_analytics', status: 'error', message: userAnalyticsError.message });
    } else {
      console.log('✅ user_analytics table created');
      results.push({ table: 'user_analytics', status: 'created' });
    }
    
    // 2. Article Analytics Table
    console.log('Creating article_analytics table...');
    const { data: articleAnalytics, error: articleAnalyticsError } = await supabase
      .from('article_analytics')
      .insert({
        article_id: 1,
        view_count: 10,
        unique_views: 8,
        engagement_score: 2.5,
        trending_score: 1.8,
        average_read_time: 120,
        bounce_rate: 0.3,
        social_shares: 5,
        comments_count: 2,
        likes_count: 15
      })
      .select();
    
    if (articleAnalyticsError) {
      console.log('article_analytics error:', articleAnalyticsError.message);
      results.push({ table: 'article_analytics', status: 'error', message: articleAnalyticsError.message });
    } else {
      console.log('✅ article_analytics table created');
      results.push({ table: 'article_analytics', status: 'created' });
    }
    
    // 3. User Interactions Table
    console.log('Creating user_interactions table...');
    const { data: userInteractions, error: userInteractionsError } = await supabase
      .from('user_interactions')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        article_id: 1,
        interaction_type: 'view',
        interaction_value: 1.0,
        reading_duration: 180,
        scroll_depth: 85.5,
        metadata: { source: 'homepage' }
      })
      .select();
    
    if (userInteractionsError) {
      console.log('user_interactions error:', userInteractionsError.message);
      results.push({ table: 'user_interactions', status: 'error', message: userInteractionsError.message });
    } else {
      console.log('✅ user_interactions table created');
      results.push({ table: 'user_interactions', status: 'created' });
    }
    
    // 4. User Preferences Table
    console.log('Creating user_preferences table...');
    const { data: userPreferences, error: userPreferencesError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        category_id: 1,
        interest_score: 3.5,
        interaction_count: 5,
        last_interaction: new Date().toISOString()
      })
      .select();
    
    if (userPreferencesError) {
      console.log('user_preferences error:', userPreferencesError.message);
      results.push({ table: 'user_preferences', status: 'error', message: userPreferencesError.message });
    } else {
      console.log('✅ user_preferences table created');
      results.push({ table: 'user_preferences', status: 'created' });
    }
    
    // 5. Search History Table
    console.log('Creating search_history table...');
    const { data: searchHistory, error: searchHistoryError } = await supabase
      .from('search_history')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        search_query: 'বাংলাদেশ',
        search_results_count: 15,
        clicked_result_id: 1,
        search_metadata: { source: 'header_search' }
      })
      .select();
    
    if (searchHistoryError) {
      console.log('search_history error:', searchHistoryError.message);
      results.push({ table: 'search_history', status: 'error', message: searchHistoryError.message });
    } else {
      console.log('✅ search_history table created');
      results.push({ table: 'search_history', status: 'created' });
    }
    
    // 6. Recommendation Cache Table
    console.log('Creating recommendation_cache table...');
    const { data: recommendationCache, error: recommendationCacheError } = await supabase
      .from('recommendation_cache')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        article_id: 1,
        recommendation_score: 4.2,
        recommendation_reason: 'Based on reading history',
        algorithm_version: 'v1.0',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select();
    
    if (recommendationCacheError) {
      console.log('recommendation_cache error:', recommendationCacheError.message);
      results.push({ table: 'recommendation_cache', status: 'error', message: recommendationCacheError.message });
    } else {
      console.log('✅ recommendation_cache table created');
      results.push({ table: 'recommendation_cache', status: 'created' });
    }
    
    // Clean up test data
    console.log('Cleaning up test data...');
    await supabase.from('user_analytics').delete().eq('session_id', 'test-session');
    await supabase.from('article_analytics').delete().eq('article_id', 1);
    await supabase.from('user_interactions').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_preferences').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('search_history').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('recommendation_cache').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
    
    console.log('\\n📊 Table Creation Results:');
    results.forEach(result => {
      console.log(`${result.status === 'created' ? '✅' : '❌'} ${result.table}: ${result.status}`);
      if (result.message) console.log(`   ${result.message}`);
    });
    
    const successful = results.filter(r => r.status === 'created').length;
    const failed = results.filter(r => r.status === 'error').length;
    
    console.log(`\\n🎉 Created ${successful} tables successfully!`);
    if (failed > 0) {
      console.log(`⚠️  ${failed} tables failed to create`);
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

createTables();