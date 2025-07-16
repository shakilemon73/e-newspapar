-- UX Enhancement Tables for Bengali News Website
-- Run this in your Supabase SQL Editor

-- 1. User Reading History Table
CREATE TABLE IF NOT EXISTS user_reading_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id INTEGER NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reading_time_seconds INTEGER DEFAULT 0,
  scroll_percentage FLOAT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- 2. User Saved Articles Table
CREATE TABLE IF NOT EXISTS user_saved_articles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id INTEGER NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  folder_name VARCHAR(100) DEFAULT 'default',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  UNIQUE(user_id, article_id)
);

-- 3. User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_name VARCHAR(200) NOT NULL,
  achievement_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_value INTEGER DEFAULT 0,
  target_value INTEGER DEFAULT 100,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  font_size INTEGER DEFAULT 16,
  font_family VARCHAR(50) DEFAULT 'system',
  line_height FLOAT DEFAULT 1.6,
  dark_mode BOOLEAN DEFAULT FALSE,
  high_contrast BOOLEAN DEFAULT FALSE,
  reduced_motion BOOLEAN DEFAULT FALSE,
  dyslexia_friendly BOOLEAN DEFAULT FALSE,
  color_blind_friendly BOOLEAN DEFAULT FALSE,
  text_to_speech BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{}',
  reading_goal_weekly INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Interactions Table (likes, shares, comments tracking)
CREATE TABLE IF NOT EXISTS user_interactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id INTEGER NOT NULL,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'share', 'comment', 'bookmark', 'view')),
  interaction_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- 6. Article Analytics Table
CREATE TABLE IF NOT EXISTS article_analytics (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_bookmarks INTEGER DEFAULT 0,
  average_reading_time FLOAT DEFAULT 0,
  bounce_rate FLOAT DEFAULT 0,
  engagement_score FLOAT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  UNIQUE(article_id)
);

-- 7. User Search History Table
CREATE TABLE IF NOT EXISTS user_search_history (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  search_query VARCHAR(500) NOT NULL,
  search_results_count INTEGER DEFAULT 0,
  category_filter VARCHAR(100),
  search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  result_clicked BOOLEAN DEFAULT FALSE,
  clicked_article_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (clicked_article_id) REFERENCES articles(id) ON DELETE SET NULL
);

-- 8. Trending Topics Table
CREATE TABLE IF NOT EXISTS trending_topics (
  id SERIAL PRIMARY KEY,
  topic_name VARCHAR(200) NOT NULL,
  topic_slug VARCHAR(200) NOT NULL,
  mention_count INTEGER DEFAULT 0,
  growth_percentage FLOAT DEFAULT 0,
  category_id INTEGER,
  trending_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  UNIQUE(topic_slug, trending_date)
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_reading_history_user_id ON user_reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_history_article_id ON user_reading_history(article_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_history_read_at ON user_reading_history(read_at);

CREATE INDEX IF NOT EXISTS idx_user_saved_articles_user_id ON user_saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_article_id ON user_saved_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_saved_at ON user_saved_articles(saved_at);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_article_analytics_article_id ON article_analytics(article_id);
CREATE INDEX IF NOT EXISTS idx_article_analytics_engagement ON article_analytics(engagement_score);

CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_timestamp ON user_search_history(search_timestamp);

CREATE INDEX IF NOT EXISTS idx_trending_topics_date ON trending_topics(trending_date);
CREATE INDEX IF NOT EXISTS idx_trending_topics_growth ON trending_topics(growth_percentage);

-- Enable Row Level Security
ALTER TABLE user_reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User Reading History
CREATE POLICY "Users can view own reading history" ON user_reading_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reading history" ON user_reading_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading history" ON user_reading_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reading history" ON user_reading_history
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for User Saved Articles
CREATE POLICY "Users can view own saved articles" ON user_saved_articles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved articles" ON user_saved_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved articles" ON user_saved_articles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved articles" ON user_saved_articles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for User Achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for User Preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for User Interactions
CREATE POLICY "Users can view own interactions" ON user_interactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interactions" ON user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for User Search History
CREATE POLICY "Users can view own search history" ON user_search_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own search history" ON user_search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert Sample Data for Testing
INSERT INTO trending_topics (topic_name, topic_slug, mention_count, growth_percentage, trending_date) VALUES
('নির্বাচন', 'election', 247, 15.5, CURRENT_DATE),
('অর্থনীতি', 'economy', 189, 8.2, CURRENT_DATE),
('খেলাধুলা', 'sports', 156, 22.1, CURRENT_DATE),
('প্রযুক্তি', 'technology', 134, 12.4, CURRENT_DATE),
('বিনোদন', 'entertainment', 98, 5.7, CURRENT_DATE),
('স্বাস্থ্য', 'health', 87, 18.3, CURRENT_DATE),
('শিক্ষা', 'education', 76, 9.8, CURRENT_DATE),
('পরিবেশ', 'environment', 65, 25.6, CURRENT_DATE);

-- Insert Sample Achievement Types
INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description, target_value, is_completed) VALUES
(gen_random_uuid(), 'reading_streak', 'নিয়মিত পাঠক', 'পরপর ৭ দিন নিবন্ধ পড়ুন', 7, false),
(gen_random_uuid(), 'articles_read', 'বিশেষজ্ঞ পাঠক', '১০০টি নিবন্ধ পড়ুন', 100, false),
(gen_random_uuid(), 'time_spent', 'দীর্ঘ সময় পাঠক', '১০ ঘণ্টা পড়ার সময় সম্পন্ন করুন', 600, false),
(gen_random_uuid(), 'categories_explored', 'বিচিত্র পাঠক', '৫টি ভিন্ন বিষয়ে নিবন্ধ পড়ুন', 5, false);

-- Success message
SELECT 'UX Enhancement tables created successfully!' as message;