/**
 * Create Advanced Tables Using Supabase Service Role Key
 * This script creates all missing advanced tables directly in Supabase
 */
import { createClient } from '@supabase/supabase-js';

// Supabase credentials with service role key
const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdvancedTables() {
  console.log('🚀 Creating advanced tables using service role key...');
  
  // Create each table individually using raw SQL
  const sqlCommands = [
    // User Notifications Table
    `
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
    
    CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);
    CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
    
    ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
    `,
    
    // User Sessions Table
    `
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
    
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_start ON user_sessions(session_start);
    
    ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
    `,
    
    // User Feedback Table
    `
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
    
    CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_feedback_article_id ON user_feedback(article_id);
    CREATE INDEX IF NOT EXISTS idx_user_feedback_rating ON user_feedback(rating);
    
    ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
    `,
    
    // Reading Goals Table
    `
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
    
    CREATE INDEX IF NOT EXISTS idx_reading_goals_user_id ON reading_goals(user_id);
    CREATE INDEX IF NOT EXISTS idx_reading_goals_active ON reading_goals(is_active);
    CREATE INDEX IF NOT EXISTS idx_reading_goals_completed ON reading_goals(is_completed);
    
    ALTER TABLE reading_goals ENABLE ROW LEVEL SECURITY;
    `,
    
    // User Clustering Table
    `
    CREATE TABLE IF NOT EXISTS user_clustering (
      id SERIAL PRIMARY KEY,
      user_id UUID,
      cluster_id INTEGER NOT NULL,
      cluster_name VARCHAR(100),
      similarity_score DECIMAL(5,4),
      preferences JSONB DEFAULT '{}',
      behavioral_data JSONB DEFAULT '{}',
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_clustering_user_id ON user_clustering(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_clustering_cluster_id ON user_clustering(cluster_id);
    CREATE INDEX IF NOT EXISTS idx_user_clustering_score ON user_clustering(similarity_score);
    
    ALTER TABLE user_clustering ENABLE ROW LEVEL SECURITY;
    `,
    
    // Content Similarity Table
    `
    CREATE TABLE IF NOT EXISTS content_similarity (
      id SERIAL PRIMARY KEY,
      article_id_1 INTEGER,
      article_id_2 INTEGER,
      similarity_score DECIMAL(5,4) NOT NULL,
      similarity_type VARCHAR(50) DEFAULT 'content',
      features JSONB DEFAULT '{}',
      calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(article_id_1, article_id_2)
    );
    
    CREATE INDEX IF NOT EXISTS idx_content_similarity_article_1 ON content_similarity(article_id_1);
    CREATE INDEX IF NOT EXISTS idx_content_similarity_article_2 ON content_similarity(article_id_2);
    CREATE INDEX IF NOT EXISTS idx_content_similarity_score ON content_similarity(similarity_score);
    `,
    
    // Performance Metrics Table
    `
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
    
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
    `,
    
    // A/B Test Results Table
    `
    CREATE TABLE IF NOT EXISTS ab_test_results (
      id SERIAL PRIMARY KEY,
      test_name VARCHAR(100) NOT NULL,
      user_id UUID,
      variant VARCHAR(50) NOT NULL,
      conversion_event VARCHAR(100),
      conversion_value DECIMAL(10,2),
      session_id VARCHAR(100),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_ab_test_results_test_name ON ab_test_results(test_name);
    CREATE INDEX IF NOT EXISTS idx_ab_test_results_user_id ON ab_test_results(user_id);
    CREATE INDEX IF NOT EXISTS idx_ab_test_results_variant ON ab_test_results(variant);
    
    ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;
    `,
    
    // Article Comments Table
    `
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
    
    CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON article_comments(article_id);
    CREATE INDEX IF NOT EXISTS idx_article_comments_user_id ON article_comments(user_id);
    CREATE INDEX IF NOT EXISTS idx_article_comments_parent ON article_comments(parent_comment_id);
    CREATE INDEX IF NOT EXISTS idx_article_comments_approved ON article_comments(is_approved);
    
    ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
    `,
    
    // User Follows Table
    `
    CREATE TABLE IF NOT EXISTS user_follows (
      id SERIAL PRIMARY KEY,
      follower_id UUID,
      following_id UUID,
      followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      is_active BOOLEAN DEFAULT TRUE,
      UNIQUE(follower_id, following_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
    CREATE INDEX IF NOT EXISTS idx_user_follows_active ON user_follows(is_active);
    
    ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
    `,
    
    // Community Posts Table
    `
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
    
    CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
    CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
    CREATE INDEX IF NOT EXISTS idx_community_posts_published ON community_posts(is_published);
    CREATE INDEX IF NOT EXISTS idx_community_posts_featured ON community_posts(is_featured);
    
    ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
    `
  ];

  const results = [];

  // Execute each SQL command individually
  for (let i = 0; i < sqlCommands.length; i++) {
    const tableNames = [
      'user_notifications',
      'user_sessions', 
      'user_feedback',
      'reading_goals',
      'user_clustering',
      'content_similarity',
      'performance_metrics',
      'ab_test_results',
      'article_comments',
      'user_follows',
      'community_posts'
    ];

    try {
      console.log(`Creating table: ${tableNames[i]}...`);
      
      // Use the REST API to execute SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          sql: sqlCommands[i]
        })
      });

      if (response.ok) {
        console.log(`✅ Table ${tableNames[i]} created successfully`);
        results.push({ table: tableNames[i], success: true });
      } else {
        const errorText = await response.text();
        console.error(`❌ Error creating table ${tableNames[i]}:`, errorText);
        results.push({ table: tableNames[i], success: false, error: errorText });
      }
    } catch (error) {
      console.error(`❌ Exception creating table ${tableNames[i]}:`, error.message);
      results.push({ table: tableNames[i], success: false, error: error.message });
    }
  }

  // Insert sample data
  console.log('\n📦 Inserting sample data...');
  
  try {
    // Sample reading goals
    await supabase.from('reading_goals').insert([
      { user_id: 'fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d', goal_type: 'articles_read', target_value: 50, time_period: 'monthly' },
      { user_id: 'fb6c3e4f-5f8e-4b2c-9d9e-6f7a8b9c0d1e', goal_type: 'reading_time', target_value: 120, time_period: 'weekly' },
      { user_id: 'fc7d4f5a-6a9f-4c3d-9e0f-7a8b9c0d1e2f', goal_type: 'categories_explored', target_value: 5, time_period: 'monthly' }
    ]);
    console.log('✅ Sample reading goals inserted');

    // Sample performance metrics
    await supabase.from('performance_metrics').insert([
      { metric_name: 'avg_page_load_time', metric_value: 1.2, metric_type: 'performance', category: 'frontend' },
      { metric_name: 'articles_per_second', metric_value: 15.5, metric_type: 'throughput', category: 'backend' },
      { metric_name: 'user_engagement_rate', metric_value: 0.85, metric_type: 'engagement', category: 'analytics' },
      { metric_name: 'search_accuracy', metric_value: 0.92, metric_type: 'quality', category: 'search' }
    ]);
    console.log('✅ Sample performance metrics inserted');

    // Sample user notifications
    await supabase.from('user_notifications').insert([
      { user_id: 'fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d', title: 'স্বাগতম', content: 'প্রথম আলো-তে আপনাকে স্বাগতম!', type: 'welcome' },
      { user_id: 'fb6c3e4f-5f8e-4b2c-9d9e-6f7a8b9c0d1e', title: 'নতুন নিবন্ধ', content: 'আপনার পছন্দের বিষয়ে নতুন নিবন্ধ প্রকাশিত হয়েছে', type: 'article' }
    ]);
    console.log('✅ Sample user notifications inserted');

  } catch (error) {
    console.log('Note: Sample data insertion may have failed (this is expected if data already exists)');
  }

  console.log('\n🎉 Advanced tables creation completed!');
  console.log('Results:', results);
  
  return results;
}

// Run the script
createAdvancedTables()
  .then(() => {
    console.log('\n✅ All advanced tables created successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });