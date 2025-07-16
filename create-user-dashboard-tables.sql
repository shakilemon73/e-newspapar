-- Create user_reading_history table
CREATE TABLE IF NOT EXISTS user_reading_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id INTEGER NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Create user_saved_articles table
CREATE TABLE IF NOT EXISTS user_saved_articles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id INTEGER NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Create reading_history table (used by existing API endpoints)
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

-- Create saved_articles table (used by existing API endpoints)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  requirement_type VARCHAR(50),
  requirement_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table if not exists
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id INTEGER NOT NULL,
  interest_score DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Create user_interactions table if not exists
CREATE TABLE IF NOT EXISTS user_interactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id INTEGER NOT NULL,
  interaction_type VARCHAR(50) NOT NULL,
  interaction_duration INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_search_history table if not exists
CREATE TABLE IF NOT EXISTS user_search_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  search_query VARCHAR(255) NOT NULL,
  search_type VARCHAR(50) DEFAULT 'basic',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_analytics table if not exists
CREATE TABLE IF NOT EXISTS user_analytics (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_articles_read INTEGER DEFAULT 0,
  total_reading_time INTEGER DEFAULT 0,
  reading_streak INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE,
  favorite_categories JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_reading_history_user_id ON user_reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_history_article_id ON user_reading_history(article_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_history_last_read_at ON user_reading_history(last_read_at);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_user_id ON user_saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_article_id ON user_saved_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_saved_at ON user_saved_articles(saved_at);

CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);
CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category_id ON user_preferences(category_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_created_at ON user_search_history(created_at);

-- Insert some sample achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('নিয়মিত পাঠক', 'একদিনে ৫টি নিবন্ধ পড়ুন', 'BookOpen', 'daily_articles', 5),
('জ্ঞান পিপাসু', 'টানা ৭ দিন নিবন্ধ পড়ুন', 'Trophy', 'reading_streak', 7),
('সংগ্রাহক', '২০টি নিবন্ধ সংরক্ষণ করুন', 'Heart', 'saved_articles', 20),
('এক্সপ্লোরার', '৫টি ভিন্ন বিষয় পড়ুন', 'Search', 'categories_read', 5),
('বিশেষজ্ঞ', '১০০টি নিবন্ধ পড়ুন', 'Award', 'total_articles', 100)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE user_reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_reading_history
CREATE POLICY IF NOT EXISTS "Users can view own reading history" ON user_reading_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own reading history" ON user_reading_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own reading history" ON user_reading_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own reading history" ON user_reading_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_saved_articles
CREATE POLICY IF NOT EXISTS "Users can view own saved articles" ON user_saved_articles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own saved articles" ON user_saved_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own saved articles" ON user_saved_articles
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for reading_history
CREATE POLICY IF NOT EXISTS "Users can view own reading history" ON reading_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own reading history" ON reading_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own reading history" ON reading_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own reading history" ON reading_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved_articles
CREATE POLICY IF NOT EXISTS "Users can view own saved articles" ON saved_articles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own saved articles" ON saved_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own saved articles" ON saved_articles
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_achievements
CREATE POLICY IF NOT EXISTS "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY IF NOT EXISTS "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_interactions
CREATE POLICY IF NOT EXISTS "Users can view own interactions" ON user_interactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own interactions" ON user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_search_history
CREATE POLICY IF NOT EXISTS "Users can view own search history" ON user_search_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own search history" ON user_search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_analytics
CREATE POLICY IF NOT EXISTS "Users can view own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own analytics" ON user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own analytics" ON user_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for achievements
CREATE POLICY IF NOT EXISTS "Public can view achievements" ON achievements
  FOR SELECT USING (true);