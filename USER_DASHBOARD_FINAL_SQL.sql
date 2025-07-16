-- User Dashboard Tables Creation Script
-- Copy and paste this entire script into your Supabase SQL Editor

-- Create reading_history table
CREATE TABLE IF NOT EXISTS reading_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id INTEGER NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Create saved_articles table
CREATE TABLE IF NOT EXISTS saved_articles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id INTEGER NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id INTEGER NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create user_analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  total_interactions INTEGER DEFAULT 0,
  reading_streak INTEGER DEFAULT 0,
  favorite_categories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL,
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);
CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);

-- Enable Row Level Security
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own reading history" ON reading_history;
DROP POLICY IF EXISTS "Users can insert own reading history" ON reading_history;
DROP POLICY IF EXISTS "Users can update own reading history" ON reading_history;
DROP POLICY IF EXISTS "Users can delete own reading history" ON reading_history;

DROP POLICY IF EXISTS "Users can view own saved articles" ON saved_articles;
DROP POLICY IF EXISTS "Users can insert own saved articles" ON saved_articles;
DROP POLICY IF EXISTS "Users can delete own saved articles" ON saved_articles;

DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;

DROP POLICY IF EXISTS "Users can view own analytics" ON user_analytics;
DROP POLICY IF EXISTS "Users can insert own analytics" ON user_analytics;
DROP POLICY IF EXISTS "Users can update own analytics" ON user_analytics;

DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;

-- Create RLS policies for reading_history
CREATE POLICY "Users can view own reading history" ON reading_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reading history" ON reading_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading history" ON reading_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reading history" ON reading_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved_articles
CREATE POLICY "Users can view own saved articles" ON saved_articles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved articles" ON saved_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved articles" ON saved_articles
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_analytics
CREATE POLICY "Users can view own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON user_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value)
VALUES 
  ('প্রথম পড়া', 'প্রথম নিবন্ধ পড়া সম্পন্ন করুন', 'BookOpen', 'articles_read', 1),
  ('নিয়মিত পাঠক', '৫টি নিবন্ধ পড়ুন', 'Target', 'articles_read', 5),
  ('সংগ্রাহক', 'প্রথম নিবন্ধ সংরক্ষণ করুন', 'Heart', 'articles_saved', 1),
  ('আগ্রহী পাঠক', '১০টি নিবন্ধ পড়ুন', 'Award', 'articles_read', 10),
  ('নিয়মিত দর্শক', '৭ দিন পরপর পড়ুন', 'Calendar', 'reading_streak', 7)
ON CONFLICT DO NOTHING;