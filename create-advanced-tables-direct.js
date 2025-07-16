/**
 * Direct Database Table Creation Script for Supabase
 * This script creates all advanced tables directly using Supabase client
 */
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdvancedTablesDirectly() {
  console.log('🚀 Creating advanced tables directly in Supabase...');
  
  const tables = [
    {
      name: 'user_notifications',
      sql: `
        CREATE TABLE IF NOT EXISTS user_notifications (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
        DROP POLICY IF EXISTS "Users can view their own notifications" ON user_notifications;
        CREATE POLICY "Users can view their own notifications" ON user_notifications
          FOR SELECT USING (auth.uid() = user_id);
        DROP POLICY IF EXISTS "Users can update their own notifications" ON user_notifications;
        CREATE POLICY "Users can update their own notifications" ON user_notifications
          FOR UPDATE USING (auth.uid() = user_id);
      `
    },
    {
      name: 'user_sessions',
      sql: `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
        DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
        CREATE POLICY "Users can view their own sessions" ON user_sessions
          FOR SELECT USING (auth.uid() = user_id);
      `
    },
    {
      name: 'user_feedback',
      sql: `
        CREATE TABLE IF NOT EXISTS user_feedback (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
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
        DROP POLICY IF EXISTS "Users can view their own feedback" ON user_feedback;
        CREATE POLICY "Users can view their own feedback" ON user_feedback
          FOR SELECT USING (auth.uid() = user_id);
        DROP POLICY IF EXISTS "Users can create feedback" ON user_feedback;
        CREATE POLICY "Users can create feedback" ON user_feedback
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        DROP POLICY IF EXISTS "Users can update their own feedback" ON user_feedback;
        CREATE POLICY "Users can update their own feedback" ON user_feedback
          FOR UPDATE USING (auth.uid() = user_id);
      `
    },
    {
      name: 'reading_goals',
      sql: `
        CREATE TABLE IF NOT EXISTS reading_goals (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
        DROP POLICY IF EXISTS "Users can manage their own goals" ON reading_goals;
        CREATE POLICY "Users can manage their own goals" ON reading_goals
          FOR ALL USING (auth.uid() = user_id);
      `
    },
    {
      name: 'user_clustering',
      sql: `
        CREATE TABLE IF NOT EXISTS user_clustering (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
        DROP POLICY IF EXISTS "Users can view their own cluster data" ON user_clustering;
        CREATE POLICY "Users can view their own cluster data" ON user_clustering
          FOR SELECT USING (auth.uid() = user_id);
      `
    },
    {
      name: 'content_similarity',
      sql: `
        CREATE TABLE IF NOT EXISTS content_similarity (
          id SERIAL PRIMARY KEY,
          article_id_1 INTEGER REFERENCES articles(id) ON DELETE CASCADE,
          article_id_2 INTEGER REFERENCES articles(id) ON DELETE CASCADE,
          similarity_score DECIMAL(5,4) NOT NULL,
          similarity_type VARCHAR(50) DEFAULT 'content',
          features JSONB DEFAULT '{}',
          calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(article_id_1, article_id_2)
        );
        
        CREATE INDEX IF NOT EXISTS idx_content_similarity_article_1 ON content_similarity(article_id_1);
        CREATE INDEX IF NOT EXISTS idx_content_similarity_article_2 ON content_similarity(article_id_2);
        CREATE INDEX IF NOT EXISTS idx_content_similarity_score ON content_similarity(similarity_score);
      `
    },
    {
      name: 'performance_metrics',
      sql: `
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
      `
    },
    {
      name: 'ab_test_results',
      sql: `
        CREATE TABLE IF NOT EXISTS ab_test_results (
          id SERIAL PRIMARY KEY,
          test_name VARCHAR(100) NOT NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
        DROP POLICY IF EXISTS "Users can view their own test results" ON ab_test_results;
        CREATE POLICY "Users can view their own test results" ON ab_test_results
          FOR SELECT USING (auth.uid() = user_id);
      `
    },
    {
      name: 'article_comments',
      sql: `
        CREATE TABLE IF NOT EXISTS article_comments (
          id SERIAL PRIMARY KEY,
          article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          parent_comment_id INTEGER REFERENCES article_comments(id) ON DELETE CASCADE,
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
        DROP POLICY IF EXISTS "Users can view approved comments" ON article_comments;
        CREATE POLICY "Users can view approved comments" ON article_comments
          FOR SELECT USING (is_approved = true);
        DROP POLICY IF EXISTS "Users can create comments" ON article_comments;
        CREATE POLICY "Users can create comments" ON article_comments
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        DROP POLICY IF EXISTS "Users can update their own comments" ON article_comments;
        CREATE POLICY "Users can update their own comments" ON article_comments
          FOR UPDATE USING (auth.uid() = user_id);
      `
    },
    {
      name: 'user_follows',
      sql: `
        CREATE TABLE IF NOT EXISTS user_follows (
          id SERIAL PRIMARY KEY,
          follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT TRUE,
          UNIQUE(follower_id, following_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
        CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
        CREATE INDEX IF NOT EXISTS idx_user_follows_active ON user_follows(is_active);
        
        ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view their own follows" ON user_follows;
        CREATE POLICY "Users can view their own follows" ON user_follows
          FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);
        DROP POLICY IF EXISTS "Users can create follows" ON user_follows;
        CREATE POLICY "Users can create follows" ON user_follows
          FOR INSERT WITH CHECK (auth.uid() = follower_id);
        DROP POLICY IF EXISTS "Users can update their own follows" ON user_follows;
        CREATE POLICY "Users can update their own follows" ON user_follows
          FOR UPDATE USING (auth.uid() = follower_id);
      `
    },
    {
      name: 'community_posts',
      sql: `
        CREATE TABLE IF NOT EXISTS community_posts (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
        DROP POLICY IF EXISTS "Users can view published posts" ON community_posts;
        CREATE POLICY "Users can view published posts" ON community_posts
          FOR SELECT USING (is_published = true);
        DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
        CREATE POLICY "Users can create posts" ON community_posts
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
        CREATE POLICY "Users can update their own posts" ON community_posts
          FOR UPDATE USING (auth.uid() = user_id);
      `
    }
  ];

  const results = [];
  
  for (const table of tables) {
    try {
      console.log(`Creating table: ${table.name}...`);
      
      // Execute SQL directly using rpc call
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_text: table.sql
      });
      
      if (error) {
        console.error(`Error creating table ${table.name}:`, error);
        results.push({ table: table.name, success: false, error: error.message });
      } else {
        console.log(`✅ Table ${table.name} created successfully`);
        results.push({ table: table.name, success: true });
      }
    } catch (err) {
      console.error(`Exception creating table ${table.name}:`, err);
      results.push({ table: table.name, success: false, error: err.message });
    }
  }

  // Insert sample data
  console.log('\n📦 Inserting sample data...');
  
  try {
    // Sample reading goals
    const { error: goalsError } = await supabase
      .from('reading_goals')
      .insert([
        { user_id: '00000000-0000-0000-0000-000000000001', goal_type: 'articles_read', target_value: 50, time_period: 'monthly' },
        { user_id: '00000000-0000-0000-0000-000000000002', goal_type: 'reading_time', target_value: 120, time_period: 'weekly' },
        { user_id: '00000000-0000-0000-0000-000000000003', goal_type: 'categories_explored', target_value: 5, time_period: 'monthly' }
      ]);
      
    if (goalsError) {
      console.log('Sample reading goals may already exist:', goalsError.message);
    } else {
      console.log('✅ Sample reading goals inserted');
    }

    // Sample performance metrics
    const { error: metricsError } = await supabase
      .from('performance_metrics')
      .insert([
        { metric_name: 'avg_page_load_time', metric_value: 1.2, metric_type: 'performance', category: 'frontend' },
        { metric_name: 'articles_per_second', metric_value: 15.5, metric_type: 'throughput', category: 'backend' },
        { metric_name: 'user_engagement_rate', metric_value: 0.85, metric_type: 'engagement', category: 'analytics' },
        { metric_name: 'search_accuracy', metric_value: 0.92, metric_type: 'quality', category: 'search' }
      ]);
      
    if (metricsError) {
      console.log('Sample performance metrics may already exist:', metricsError.message);
    } else {
      console.log('✅ Sample performance metrics inserted');
    }

  } catch (err) {
    console.log('Note: Sample data insertion may have failed (this is expected if tables already exist)');
  }

  console.log('\n🎉 Advanced tables creation completed!');
  console.log('Results:', results);
  
  return results;
}

// Run the script
createAdvancedTablesDirectly().catch(console.error);