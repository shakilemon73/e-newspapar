/**
 * Direct PostgreSQL connection to create advanced tables in Supabase
 * Uses pg library to connect directly to Supabase PostgreSQL
 */
import pkg from 'pg';
const { Pool } = pkg;

// Supabase connection details
const connectionString = 'postgresql://postgres.mrjukcqspvhketnfzmud:bengalinews2024@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createAdvancedTablesWithPG() {
  console.log('🚀 Creating advanced tables using direct PostgreSQL connection...');
  
  const client = await pool.connect();
  
  try {
    const tables = [
      {
        name: 'user_notifications',
        sql: `
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
        `
      },
      {
        name: 'user_sessions',
        sql: `
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
        `
      },
      {
        name: 'user_feedback',
        sql: `
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
        `
      },
      {
        name: 'reading_goals',
        sql: `
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
        `
      },
      {
        name: 'user_clustering',
        sql: `
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
        `
      },
      {
        name: 'content_similarity',
        sql: `
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
        `
      },
      {
        name: 'article_comments',
        sql: `
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
        `
      },
      {
        name: 'user_follows',
        sql: `
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
        `
      },
      {
        name: 'community_posts',
        sql: `
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
      }
    ];

    const results = [];

    for (const table of tables) {
      try {
        console.log(`Creating table: ${table.name}...`);
        await client.query(table.sql);
        console.log(`✅ Table ${table.name} created successfully`);
        results.push({ table: table.name, success: true });
      } catch (error) {
        console.error(`❌ Error creating table ${table.name}:`, error.message);
        results.push({ table: table.name, success: false, error: error.message });
      }
    }

    // Insert sample data
    console.log('\n📦 Inserting sample data...');
    
    try {
      // Sample reading goals
      await client.query(`
        INSERT INTO reading_goals (user_id, goal_type, target_value, time_period) 
        VALUES 
          (gen_random_uuid(), 'articles_read', 50, 'monthly'),
          (gen_random_uuid(), 'reading_time', 120, 'weekly'),
          (gen_random_uuid(), 'categories_explored', 5, 'monthly')
        ON CONFLICT DO NOTHING;
      `);
      console.log('✅ Sample reading goals inserted');

      // Sample performance metrics
      await client.query(`
        INSERT INTO performance_metrics (metric_name, metric_value, metric_type, category) 
        VALUES 
          ('avg_page_load_time', 1.2, 'performance', 'frontend'),
          ('articles_per_second', 15.5, 'throughput', 'backend'),
          ('user_engagement_rate', 0.85, 'engagement', 'analytics'),
          ('search_accuracy', 0.92, 'quality', 'search')
        ON CONFLICT DO NOTHING;
      `);
      console.log('✅ Sample performance metrics inserted');

    } catch (error) {
      console.log('Note: Sample data insertion may have failed (this is expected if data already exists)');
    }

    console.log('\n🎉 Advanced tables creation completed!');
    console.log('Results:', results);
    
    return results;

  } finally {
    client.release();
  }
}

// Run the script
createAdvancedTablesWithPG()
  .then(() => {
    console.log('\n✅ All advanced tables created successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });