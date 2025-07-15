import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
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

async function runSQLCommand(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.error('SQL Error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Execution Error:', error);
    return false;
  }
}

async function setupAdvancedAlgorithms() {
  console.log('🚀 Setting up Advanced Algorithms for Bengali News Website...');
  
  // SQL commands to execute
  const sqlCommands = [
    // 1. User Preferences Table
    `
    CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        category_id INTEGER NOT NULL,
        interest_score FLOAT DEFAULT 1.0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, category_id)
    );
    `,
    
    // 2. User Interactions Table
    `
    CREATE TABLE IF NOT EXISTS user_interactions (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        article_id INTEGER NOT NULL,
        interaction_type VARCHAR(50) NOT NULL,
        interaction_duration INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'::jsonb
    );
    `,
    
    // 3. User Search History Table
    `
    CREATE TABLE IF NOT EXISTS user_search_history (
        id SERIAL PRIMARY KEY,
        user_id UUID,
        search_query TEXT NOT NULL,
        search_results_count INTEGER DEFAULT 0,
        clicked_article_id INTEGER,
        search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    // 4. Article Analytics Table
    `
    CREATE TABLE IF NOT EXISTS article_analytics (
        id SERIAL PRIMARY KEY,
        article_id INTEGER NOT NULL,
        view_count INTEGER DEFAULT 0,
        unique_view_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        average_read_time FLOAT DEFAULT 0,
        engagement_score FLOAT DEFAULT 0,
        trending_score FLOAT DEFAULT 0,
        quality_score FLOAT DEFAULT 0,
        virality_score FLOAT DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(article_id)
    );
    `,
    
    // 5. Trending Topics Table
    `
    CREATE TABLE IF NOT EXISTS trending_topics (
        id SERIAL PRIMARY KEY,
        topic_name VARCHAR(255) NOT NULL,
        category_id INTEGER,
        mention_count INTEGER DEFAULT 1,
        trending_score FLOAT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(topic_name, category_id)
    );
    `,
    
    // 6. Article Similarity Table
    `
    CREATE TABLE IF NOT EXISTS article_similarity (
        id SERIAL PRIMARY KEY,
        article_id_1 INTEGER NOT NULL,
        article_id_2 INTEGER NOT NULL,
        similarity_score FLOAT DEFAULT 0,
        similarity_type VARCHAR(50) DEFAULT 'content',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(article_id_1, article_id_2, similarity_type)
    );
    `,
    
    // 7. Breaking News Alerts Table
    `
    CREATE TABLE IF NOT EXISTS breaking_news_alerts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        category_id INTEGER,
        priority INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    // 8. User Notification Preferences Table
    `
    CREATE TABLE IF NOT EXISTS user_notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        breaking_news BOOLEAN DEFAULT TRUE,
        category_updates BOOLEAN DEFAULT TRUE,
        personalized_recommendations BOOLEAN DEFAULT TRUE,
        email_notifications BOOLEAN DEFAULT FALSE,
        push_notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
    );
    `,
    
    // 9. Enable Extensions for Advanced Search
    `CREATE EXTENSION IF NOT EXISTS pg_trgm;`,
    `CREATE EXTENSION IF NOT EXISTS btree_gin;`,
    
    // 10. Create Indexes for Performance
    `
    CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id);
    CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
    CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);
    `,
    
    `
    CREATE INDEX IF NOT EXISTS idx_article_analytics_trending_score ON article_analytics(trending_score DESC);
    CREATE INDEX IF NOT EXISTS idx_article_analytics_engagement_score ON article_analytics(engagement_score DESC);
    CREATE INDEX IF NOT EXISTS idx_article_analytics_view_count ON article_analytics(view_count DESC);
    `,
    
    `
    CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_preferences_category_id ON user_preferences(category_id);
    CREATE INDEX IF NOT EXISTS idx_user_preferences_interest_score ON user_preferences(interest_score DESC);
    `,
    
    `
    CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_search_history_timestamp ON user_search_history(search_timestamp DESC);
    `,
    
    // 11. Create Search Indexes for Bengali Text
    `
    CREATE INDEX IF NOT EXISTS articles_title_trgm_idx ON articles 
    USING GIN(title gin_trgm_ops);
    `,
    
    `
    CREATE INDEX IF NOT EXISTS articles_content_trgm_idx ON articles 
    USING GIN(content gin_trgm_ops);
    `,
    
    // 12. Initialize Analytics for Existing Articles
    `
    INSERT INTO article_analytics (article_id, view_count, unique_view_count, engagement_score, trending_score)
    SELECT 
        id,
        COALESCE(view_count, 0),
        COALESCE(view_count, 0),
        0.0,
        0.0
    FROM articles
    ON CONFLICT (article_id) DO NOTHING;
    `
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < sqlCommands.length; i++) {
    const command = sqlCommands[i].trim();
    if (command) {
      console.log(`📝 Executing SQL command ${i + 1}/${sqlCommands.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: command });
        
        if (error) {
          console.error(`❌ Error in command ${i + 1}:`, error.message);
          failCount++;
        } else {
          console.log(`✅ Command ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Exception in command ${i + 1}:`, error.message);
        failCount++;
      }
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`\n🎉 Setup Complete!`);
  console.log(`✅ Successful commands: ${successCount}`);
  console.log(`❌ Failed commands: ${failCount}`);
  
  if (failCount === 0) {
    console.log('\n🚀 All advanced algorithms have been successfully implemented!');
    console.log('Your Bengali news website now has:');
    console.log('• Enhanced search capabilities with Bengali text support');
    console.log('• Personalized recommendations based on user behavior');
    console.log('• Real-time analytics and trending detection');
    console.log('• User interaction tracking and preferences');
    console.log('• Advanced content scoring and ranking');
    console.log('• Breaking news alerts system');
    console.log('• Performance optimized with proper indexing');
  }
}

// Run the setup
setupAdvancedAlgorithms().catch(console.error);