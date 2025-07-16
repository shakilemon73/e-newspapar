# Manual Table Creation Guide

## Current Status
Your Bengali news website is working perfectly with basic features, but the advanced tables for user experience and analytics are missing.

## ✅ What's Working
- Articles, categories, weather, breaking news
- E-papers, videos, audio articles
- Social media integration
- Basic user functionality

## ❌ What's Missing
The following advanced tables need to be created manually:

1. **user_notifications** - User notification system
2. **user_sessions** - Session tracking
3. **user_feedback** - User ratings and feedback
4. **reading_goals** - Gamification features
5. **performance_metrics** - Analytics tracking
6. **article_comments** - Comment system
7. **user_follows** - Social following
8. **community_posts** - User-generated content

## 🔧 Solution: Manual Creation in Supabase

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `mrjukcqspvhketnfzmud`
3. Navigate to "SQL Editor"

### Step 2: Execute Table Creation SQL
Copy and paste this SQL script into the SQL Editor:

```sql
-- Advanced Tables for Bengali News Website

-- User Notifications Table
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

-- User Sessions Table
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

-- User Feedback Table
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

-- Reading Goals Table
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

-- Performance Metrics Table
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

-- Article Comments Table
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

-- User Follows Table
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

-- Community Posts Table
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

-- Insert sample data for testing
INSERT INTO user_notifications (user_id, title, content, type) VALUES
  ('fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d', 'স্বাগতম', 'প্রথম আলো-তে আপনাকে স্বাগতম!', 'welcome'),
  ('fb6c3e4f-5f8e-4b2c-9d9e-6f7a8b9c0d1e', 'নতুন নিবন্ধ', 'আপনার পছন্দের বিষয়ে নতুন নিবন্ধ', 'article');

INSERT INTO reading_goals (user_id, goal_type, target_value, time_period) VALUES
  ('fa5b2d3e-4f7e-4a1b-9c8d-5e6f7a8b9c0d', 'articles_read', 50, 'monthly'),
  ('fb6c3e4f-5f8e-4b2c-9d9e-6f7a8b9c0d1e', 'reading_time', 120, 'weekly');

INSERT INTO performance_metrics (metric_name, metric_value, metric_type, category) VALUES
  ('page_load_time', 1.2, 'performance', 'frontend'),
  ('user_engagement', 0.85, 'engagement', 'analytics');

-- Success message
SELECT 'All advanced tables created successfully!' as message;
```

### Step 3: Execute the SQL
1. Click "Run" button in the SQL Editor
2. You should see "All advanced tables created successfully!" message
3. Check the "Tables" section to verify all tables are created

### Step 4: Test the Tables
After creation, test that the website can access the advanced features:
- User notifications
- Reading goals
- Performance metrics
- Comment system
- Social features

## 🎯 Expected Result
Once the tables are created, your website will have:
- Complete user experience features
- Analytics and performance tracking
- Social interaction capabilities
- Gamification elements
- Community features

The website will immediately recognize the new tables and enable all advanced functionality.