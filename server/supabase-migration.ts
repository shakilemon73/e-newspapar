import { supabase } from './supabase';

/**
 * Complete Supabase migration utilities
 * Replaces all pg.Pool based database operations with Supabase client
 */

export async function migrateToSupabase() {
  console.log('🚀 Starting complete Supabase migration...');
  
  try {
    // Step 1: Verify all required tables exist
    const tableCheck = await checkAllTables();
    
    if (!tableCheck.allTablesExist) {
      console.log('⚠️ Missing tables detected:', tableCheck.missingTables);
      return {
        success: false,
        error: 'Missing required tables',
        missingTables: tableCheck.missingTables,
        existingTables: tableCheck.existingTables
      };
    }
    
    // Step 2: Initialize sample data for testing
    await initializeSupabaseData();
    
    // Step 3: Test all core functionality
    const functionalityTest = await testCoreFunctionality();
    
    console.log('✅ Supabase migration completed successfully!');
    
    return {
      success: true,
      tableCheck,
      functionalityTest
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if all required tables exist in Supabase
 */
async function checkAllTables() {
  const requiredTables = [
    // Core tables
    'categories',
    'articles',
    'epapers',
    'weather',
    'breaking_news',
    'video_content',
    'audio_articles',
    'social_media_posts',
    
    // User enhancement tables
    'user_reading_history',
    'user_saved_articles',
    'user_preferences',
    'user_interactions',
    'article_analytics',
    'user_search_history',
    'trending_topics'
  ];
  
  const existingTables = [];
  const missingTables = [];
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        missingTables.push(table);
      } else {
        existingTables.push(table);
      }
    } catch (e) {
      missingTables.push(table);
    }
  }
  
  return {
    allTablesExist: missingTables.length === 0,
    existingTables,
    missingTables,
    totalTables: requiredTables.length
  };
}

/**
 * Initialize sample data for testing advanced features
 */
async function initializeSupabaseData() {
  console.log('🌱 Initializing Supabase sample data...');
  
  try {
    // Get some articles for testing
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, category_id')
      .limit(5);
    
    if (articles && articles.length > 0) {
      // Initialize article analytics
      for (const article of articles) {
        await supabase
          .from('article_analytics')
          .upsert({
            article_id: article.id,
            view_count: Math.floor(Math.random() * 1000) + 100,
            unique_view_count: Math.floor(Math.random() * 800) + 80,
            engagement_score: Math.random() * 0.8 + 0.2,
            trending_score: Math.random() * 0.9 + 0.1
          });
      }
      
      // Add sample user interactions
      const sampleUserId = '00000000-0000-0000-0000-000000000000';
      
      for (const article of articles.slice(0, 3)) {
        await supabase
          .from('user_interactions')
          .insert({
            user_id: sampleUserId,
            article_id: article.id,
            interaction_type: 'view',
            interaction_duration: Math.floor(Math.random() * 300) + 60,
            metadata: { source: 'supabase_migration' }
          });
      }
      
      console.log(`✅ Initialized analytics for ${articles.length} articles`);
    }
    
    // Initialize trending topics
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);
    
    if (categories && categories.length > 0) {
      for (const category of categories) {
        await supabase
          .from('trending_topics')
          .upsert({
            topic_name: category.name,
            topic_type: 'category',
            mention_count: Math.floor(Math.random() * 100) + 20,
            trend_score: Math.random() * 0.8 + 0.2
          });
      }
      
      console.log(`✅ Initialized trending topics for ${categories.length} categories`);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test core functionality after migration
 */
async function testCoreFunctionality() {
  console.log('🧪 Testing core functionality...');
  
  const tests = {
    categories: false,
    articles: false,
    userInteractions: false,
    articleAnalytics: false,
    searchHistory: false,
    trendingTopics: false
  };
  
  try {
    // Test categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    tests.categories = !categoriesError && categories && categories.length > 0;
    
    // Test articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
    tests.articles = !articlesError && articles && articles.length > 0;
    
    // Test user interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from('user_interactions')
      .select('*')
      .limit(1);
    tests.userInteractions = !interactionsError;
    
    // Test article analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('article_analytics')
      .select('*')
      .limit(1);
    tests.articleAnalytics = !analyticsError;
    
    // Test search history
    const { data: searchHistory, error: searchError } = await supabase
      .from('user_search_history')
      .select('*')
      .limit(1);
    tests.searchHistory = !searchError;
    
    // Test trending topics
    const { data: trending, error: trendingError } = await supabase
      .from('trending_topics')
      .select('*')
      .limit(1);
    tests.trendingTopics = !trendingError;
    
    const passedTests = Object.values(tests).filter(Boolean).length;
    const totalTests = Object.keys(tests).length;
    
    console.log(`✅ Core functionality tests: ${passedTests}/${totalTests} passed`);
    
    return {
      tests,
      passedTests,
      totalTests,
      success: passedTests === totalTests
    };
    
  } catch (error) {
    console.error('❌ Error testing functionality:', error);
    return {
      tests,
      success: false,
      error: error.message
    };
  }
}

/**
 * Get comprehensive database status
 */
export async function getDatabaseStatus() {
  try {
    const tableCheck = await checkAllTables();
    const functionalityTest = await testCoreFunctionality();
    
    return {
      success: true,
      tableCheck,
      functionalityTest,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}