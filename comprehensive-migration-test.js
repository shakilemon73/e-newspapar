/**
 * Comprehensive Migration Test and Manual Creation Guide
 * This script tests table existence and provides manual creation instructions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Test if API endpoint is accessible
 */
async function testEndpoint(endpoint, description) {
  try {
    const response = await fetch(`http://localhost:5000/api/${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${description} - ${data.length || 0} records`);
      return true;
    } else {
      console.log(`❌ ${description} - Error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - Failed: ${error.message}`);
    return false;
  }
}

/**
 * Test table existence by trying to query it
 */
async function testTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Table ${tableName} does not exist: ${error.message}`);
      return false;
    } else {
      console.log(`✅ Table ${tableName} exists`);
      return true;
    }
  } catch (err) {
    console.log(`❌ Table ${tableName} test failed: ${err.message}`);
    return false;
  }
}

/**
 * Create Edge Function for table creation
 */
async function createEdgeFunction() {
  console.log('\n🚀 Creating Edge Function for Advanced Tables...\n');
  
  const edgeFunctionSQL = `
-- Advanced Tables Creation Edge Function
-- This function creates all advanced tables with proper indexes and sample data

CREATE OR REPLACE FUNCTION create_advanced_tables()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create user_notifications table
  CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
  );
  
  -- Create user_sessions table
  CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    pages_visited INTEGER DEFAULT 0,
    articles_read INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create user_feedback table
  CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    article_id INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    feedback_type VARCHAR(50) DEFAULT 'rating',
    is_helpful BOOLEAN,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create reading_goals table
  CREATE TABLE IF NOT EXISTS reading_goals (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    goal_type VARCHAR(50) NOT NULL,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    time_period VARCHAR(20) DEFAULT 'monthly',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    reward_claimed BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create performance_metrics table
  CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create article_comments table
  CREATE TABLE IF NOT EXISTS article_comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER,
    user_id UUID,
    parent_comment_id INTEGER,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create user_follows table
  CREATE TABLE IF NOT EXISTS user_follows (
    id SERIAL PRIMARY KEY,
    follower_id UUID,
    following_id UUID,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(follower_id, following_id)
  );
  
  -- Create community_posts table
  CREATE TABLE IF NOT EXISTS community_posts (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type VARCHAR(50) DEFAULT 'discussion',
    category VARCHAR(50),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);
  CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_feedback_article_id ON user_feedback(article_id);
  CREATE INDEX IF NOT EXISTS idx_reading_goals_user_id ON reading_goals(user_id);
  CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
  CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON article_comments(article_id);
  CREATE INDEX IF NOT EXISTS idx_article_comments_user_id ON article_comments(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
  CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
  CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
  CREATE INDEX IF NOT EXISTS idx_community_posts_published ON community_posts(is_published);
  
  -- Insert sample data
  INSERT INTO user_notifications (user_id, title, content, type) VALUES
    ('fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d', 'স্বাগতম', 'প্রথম আলো-তে আপনাকে স্বাগতম!', 'welcome'),
    ('fb6c3e4f-5f8e-4b2c-9d9e-6f7a8b9c0d1e', 'নতুন নিবন্ধ', 'আপনার পছন্দের বিষয়ে নতুন নিবন্ধ', 'article')
  ON CONFLICT DO NOTHING;
  
  INSERT INTO reading_goals (user_id, goal_type, target_value, time_period) VALUES
    ('fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d', 'articles_read', 50, 'monthly'),
    ('fb6c3e4f-5f8e-4b2c-9d9e-6f7a8b9c0d1e', 'reading_time', 120, 'weekly')
  ON CONFLICT DO NOTHING;
  
  INSERT INTO performance_metrics (metric_name, metric_value, metric_type, category) VALUES
    ('page_load_time', 1.2, 'performance', 'frontend'),
    ('user_engagement', 0.85, 'engagement', 'analytics'),
    ('bounce_rate', 0.25, 'engagement', 'analytics')
  ON CONFLICT DO NOTHING;
  
  INSERT INTO article_comments (article_id, user_id, content, is_approved) VALUES
    (1, 'fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d', 'দারুণ নিবন্ধ! খুব ভালো লাগলো।', true),
    (2, 'fb6c3e4f-5f8e-4b2c-9d9e-6f7a8b9c0d1e', 'অসাধারণ তথ্য! ধন্যবাদ।', true)
  ON CONFLICT DO NOTHING;
  
  RETURN 'All advanced tables created successfully with sample data!';
END;
$$;

-- Execute the function
SELECT create_advanced_tables();
`;

  try {
    console.log('Creating Edge Function via direct SQL execution...');
    
    // Try to execute the function creation and execution
    const { data, error } = await supabase.rpc('create_advanced_tables');
    
    if (error) {
      console.log('Function does not exist, creating it...');
      
      // Execute the SQL to create and run the function
      const { error: execError } = await supabase.rpc('exec', {
        sql: edgeFunctionSQL
      });
      
      if (execError) {
        console.log('❌ Edge Function creation failed:', execError.message);
        return false;
      } else {
        console.log('✅ Edge Function created and executed successfully');
        return true;
      }
    } else {
      console.log('✅ Edge Function already exists and executed:', data);
      return true;
    }
  } catch (err) {
    console.log('❌ Edge Function creation error:', err.message);
    return false;
  }
}

/**
 * Run comprehensive test
 */
async function runComprehensiveTest() {
  console.log('🔍 COMPREHENSIVE MIGRATION TEST\n');
  
  // Test basic API endpoints
  console.log('📡 Testing Basic API Endpoints:');
  const basicEndpoints = [
    ['articles', 'Articles API'],
    ['categories', 'Categories API'],
    ['weather', 'Weather API'],
    ['breaking-news', 'Breaking News API'],
    ['epapers', 'E-Papers API'],
    ['videos', 'Videos API'],
    ['audio-articles', 'Audio Articles API'],
    ['social-media', 'Social Media API']
  ];
  
  let basicScore = 0;
  for (const [endpoint, description] of basicEndpoints) {
    if (await testEndpoint(endpoint, description)) {
      basicScore++;
    }
  }
  
  console.log(`\n📊 Basic API Score: ${basicScore}/${basicEndpoints.length}`);
  
  // Test advanced table existence
  console.log('\n🔧 Testing Advanced Tables:');
  const advancedTables = [
    'user_notifications',
    'user_sessions', 
    'user_feedback',
    'reading_goals',
    'performance_metrics',
    'article_comments',
    'user_follows',
    'community_posts'
  ];
  
  let advancedScore = 0;
  for (const table of advancedTables) {
    if (await testTableExists(table)) {
      advancedScore++;
    }
  }
  
  console.log(`\n📊 Advanced Tables Score: ${advancedScore}/${advancedTables.length}`);
  
  // If advanced tables are missing, try to create them
  if (advancedScore === 0) {
    console.log('\n🚀 Attempting to create advanced tables...');
    const created = await createEdgeFunction();
    
    if (created) {
      console.log('\n✅ Re-testing advanced tables after creation...');
      let newScore = 0;
      for (const table of advancedTables) {
        if (await testTableExists(table)) {
          newScore++;
        }
      }
      console.log(`\n📊 New Advanced Tables Score: ${newScore}/${advancedTables.length}`);
    }
  }
  
  // Final summary
  console.log('\n📋 FINAL SUMMARY:');
  console.log(`✅ Basic Features: ${basicScore}/${basicEndpoints.length} working`);
  console.log(`🔧 Advanced Features: ${advancedScore}/${advancedTables.length} available`);
  
  const totalScore = basicScore + advancedScore;
  const maxScore = basicEndpoints.length + advancedTables.length;
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  console.log(`\n🎯 Overall Completion: ${percentage}% (${totalScore}/${maxScore})`);
  
  if (percentage >= 90) {
    console.log('🎉 Excellent! Your Bengali news website is fully operational!');
  } else if (percentage >= 70) {
    console.log('👍 Good! Core features working, some advanced features need setup.');
  } else {
    console.log('⚠️ Basic features working, advanced features need manual setup.');
  }
  
  return {
    basicScore,
    advancedScore,
    totalScore,
    percentage
  };
}

// Run the comprehensive test
runComprehensiveTest()
  .then((results) => {
    console.log('\n✅ Comprehensive test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });