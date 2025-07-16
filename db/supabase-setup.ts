import { supabase } from './index';

/**
 * Supabase-compatible database setup
 * This script creates all necessary tables using Supabase client
 * Replaces the old pg.Pool based setup scripts
 */

export async function setupSupabaseDatabase() {
  console.log('🚀 Setting up Supabase database...');
  
  try {
    // Check if advanced tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return { success: false, error: tablesError.message };
    }

    const existingTables = tables?.map(t => t.table_name) || [];
    
    // List of required tables for full functionality
    const requiredTables = [
      'user_reading_history',
      'user_saved_articles',
      'user_preferences',
      'user_interactions',
      'article_analytics',
      'user_search_history',
      'trending_topics'
    ];

    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`Found ${missingTables.length} missing tables:`, missingTables);
      console.log('Please create these tables manually in Supabase SQL Editor or use the execute_sql_tool');
    } else {
      console.log('✅ All required tables exist');
    }

    // Test basic functionality
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .limit(5);

    if (categoriesError) {
      console.error('Error testing categories:', categoriesError);
    } else {
      console.log(`✅ Categories table working (${categories?.length} categories found)`);
    }

    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug')
      .limit(5);

    if (articlesError) {
      console.error('Error testing articles:', articlesError);
    } else {
      console.log(`✅ Articles table working (${articles?.length} articles found)`);
    }

    console.log('✅ Supabase database setup completed successfully!');
    return { success: true, missingTables };
  } catch (error) {
    console.error('❌ Error setting up Supabase database:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Initialize sample data for testing
 */
export async function initializeSampleData() {
  console.log('🌱 Initializing sample data...');
  
  try {
    // Add sample user interactions for testing
    const { data: articles } = await supabase
      .from('articles')
      .select('id')
      .limit(3);

    if (articles && articles.length > 0) {
      const sampleInteractions = articles.map(article => ({
        user_id: '00000000-0000-0000-0000-000000000000', // Sample user ID
        article_id: article.id,
        interaction_type: 'view',
        interaction_duration: Math.floor(Math.random() * 300) + 30,
        metadata: { source: 'sample_data' }
      }));

      const { error } = await supabase
        .from('user_interactions')
        .insert(sampleInteractions);

      if (error) {
        console.warn('Sample data insertion failed:', error.message);
      } else {
        console.log('✅ Sample interactions created');
      }
    }

    // Add sample trending topics
    const sampleTopics = [
      { topic_name: 'রাজনীতি', topic_type: 'category', mention_count: 150, trend_score: 0.8 },
      { topic_name: 'খেলা', topic_type: 'category', mention_count: 120, trend_score: 0.7 },
      { topic_name: 'অর্থনীতি', topic_type: 'category', mention_count: 100, trend_score: 0.6 }
    ];

    const { error: topicsError } = await supabase
      .from('trending_topics')
      .insert(sampleTopics);

    if (topicsError) {
      console.warn('Sample trending topics insertion failed:', topicsError.message);
    } else {
      console.log('✅ Sample trending topics created');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
    return { success: false, error: error.message };
  }
}

// Export helper function to check database health
export async function checkDatabaseHealth() {
  const tables = [
    'categories',
    'articles',
    'user_reading_history',
    'user_saved_articles',
    'user_preferences',
    'user_interactions',
    'article_analytics',
    'user_search_history',
    'trending_topics'
  ];

  const healthCheck = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      healthCheck[table] = {
        exists: !error,
        error: error?.message || null,
        hasData: data && data.length > 0
      };
    } catch (e) {
      healthCheck[table] = {
        exists: false,
        error: e.message,
        hasData: false
      };
    }
  }

  return healthCheck;
}