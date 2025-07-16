/**
 * Create Advanced Tables - Final Working Version
 * This script creates tables using direct SQL execution via service role
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createTablesDirectly() {
  console.log('🚀 Creating advanced tables directly...');
  
  // Create each table using individual SQL commands
  const tableDefinitions = [
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
        CREATE INDEX IF NOT EXISTS idx_community_posts_published ON community_posts(is_published);
      `
    }
  ];

  console.log('Executing table creation SQL...');
  
  // Create all tables in one transaction
  const allSQL = tableDefinitions.map(table => table.sql).join('\n\n');
  
  try {
    // Use the REST API to execute SQL directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        query: allSQL
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ All tables created successfully');
    
    // Verify tables exist by trying to insert sample data
    console.log('Verifying table creation...');
    
    const verifications = [
      {
        table: 'user_notifications',
        data: {
          user_id: 'fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d',
          title: 'স্বাগতম',
          content: 'প্রথম আলো-তে আপনাকে স্বাগতম!'
        }
      },
      {
        table: 'reading_goals',
        data: {
          user_id: 'fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d',
          goal_type: 'articles_read',
          target_value: 50
        }
      },
      {
        table: 'performance_metrics',
        data: {
          metric_name: 'page_load_time',
          metric_value: 1.2,
          metric_type: 'performance',
          category: 'frontend'
        }
      }
    ];

    for (const verification of verifications) {
      try {
        const { data, error } = await supabase
          .from(verification.table)
          .insert([verification.data])
          .select();

        if (error) {
          console.log(`❌ ${verification.table} verification failed: ${error.message}`);
        } else {
          console.log(`✅ ${verification.table} verified and working`);
        }
      } catch (err) {
        console.log(`❌ ${verification.table} verification error: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    
    // Try alternative approach - create tables via direct SQL execution
    console.log('Trying alternative approach...');
    
    for (const table of tableDefinitions) {
      try {
        console.log(`Creating ${table.name}...`);
        
        // Use a direct SQL approach
        const { error } = await supabase.rpc('exec', {
          query: table.sql
        });

        if (error) {
          console.log(`❌ ${table.name} creation failed: ${error.message}`);
        } else {
          console.log(`✅ ${table.name} created successfully`);
        }
      } catch (err) {
        console.log(`❌ ${table.name} creation error: ${err.message}`);
      }
    }
  }
}

// Run the creation
createTablesDirectly()
  .then(() => {
    console.log('\n🎉 Table creation process completed!');
    console.log('Check your Supabase dashboard to verify table creation.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });