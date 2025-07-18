import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data to populate unused tables
async function populateUnusedTables() {
  console.log('🔧 Populating unused tables with sample data...\n');

  try {
    // 1. Populate user_reading_history with sample data
    console.log('📖 Adding sample reading history...');
    const { data: articles } = await supabase
      .from('articles')
      .select('id')
      .limit(5);

    if (articles && articles.length > 0) {
      const readingHistoryData = articles.map((article, index) => ({
        user_id: '12345678-1234-1234-1234-123456789012', // Sample UUID
        article_id: article.id,
        reading_time_seconds: Math.floor(Math.random() * 300) + 60,
        scroll_percentage: Math.floor(Math.random() * 80) + 20,
        completed: Math.random() > 0.3,
        created_at: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString()
      }));

      const { error: historyError } = await supabase
        .from('user_reading_history')
        .insert(readingHistoryData);

      if (historyError) {
        console.log('❌ Reading history error:', historyError.message);
      } else {
        console.log('✅ Added sample reading history');
      }
    }

    // 2. Populate user_search_history with sample data
    console.log('🔍 Adding sample search history...');
    const searchQueries = [
      'বাংলাদেশ ক্রিকেট',
      'করোনা আপডেট',
      'আবহাওয়া পূর্বাভাস',
      'রাজনীতি সংবাদ',
      'অর্থনীতি'
    ];

    const searchHistoryData = searchQueries.map((query, index) => ({
      user_id: '12345678-1234-1234-1234-123456789012',
      search_query: query,
      search_timestamp: new Date(Date.now() - (index * 60 * 60 * 1000)).toISOString(),
      results_count: Math.floor(Math.random() * 50) + 5
    }));

    const { error: searchError } = await supabase
      .from('user_search_history')
      .insert(searchHistoryData);

    if (searchError) {
      console.log('❌ Search history error:', searchError.message);
    } else {
      console.log('✅ Added sample search history');
    }

    // 3. Populate trending_topics with dynamic data from categories
    console.log('📈 Adding trending topics...');
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .limit(7);

    if (categories && categories.length > 0) {
      const trendingData = categories.map((category, index) => ({
        topic_name: category.name,
        topic_slug: category.slug,
        trend_score: Math.random() * 0.8 + 0.2,
        mention_count: Math.floor(Math.random() * 1000) + 100,
        created_at: new Date(Date.now() - (index * 2 * 60 * 60 * 1000)).toISOString()
      }));

      const { error: trendingError } = await supabase
        .from('trending_topics')
        .insert(trendingData);

      if (trendingError) {
        console.log('❌ Trending topics error:', trendingError.message);
      } else {
        console.log('✅ Added trending topics');
      }
    }

    console.log('\n🎉 Successfully populated all unused tables!');
    
    // Verify the changes
    console.log('\n📊 Verification:');
    const tables = ['user_reading_history', 'user_search_history', 'trending_topics'];
    
    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      console.log(`✅ ${table}: ${count || 0} rows`);
    }

  } catch (error) {
    console.error('❌ Error populating tables:', error);
  }
}

populateUnusedTables();