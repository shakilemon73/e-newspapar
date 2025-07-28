-- Fix Vercel Deployment Errors for Bengali News Website
-- Execute these SQL commands in your Supabase SQL Editor to fix all deployment issues

-- 1. Create missing user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- 2. Create missing user_storage table  
CREATE TABLE IF NOT EXISTS user_storage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  storage_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, storage_key)
);

-- 3. Create missing reading_history table
CREATE TABLE IF NOT EXISTS reading_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  reading_progress INTEGER DEFAULT 0,
  reading_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- 4. Fix weather table RLS policies (allow public read, service role write)
DROP POLICY IF EXISTS "Public can read weather" ON weather;
DROP POLICY IF EXISTS "Service role can manage weather" ON weather;

CREATE POLICY "Public can read weather" ON weather
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage weather" ON weather
  FOR ALL USING (auth.role() = 'service_role');

-- Allow anonymous users to read weather data
CREATE POLICY "Anonymous can read weather" ON weather
  FOR SELECT USING (auth.role() = 'anon');

-- 5. Enable Row Level Security for new tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Create RLS policies for user_storage
CREATE POLICY "Users can view their own storage" ON user_storage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storage" ON user_storage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storage" ON user_storage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storage" ON user_storage
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create RLS policies for reading_history
CREATE POLICY "Users can view their own reading history" ON reading_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading history" ON reading_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading history" ON reading_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading history" ON reading_history
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(user_id, setting_key);
CREATE INDEX IF NOT EXISTS idx_user_storage_user_id ON user_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_storage_key ON user_storage(user_id, storage_key);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_last_read ON reading_history(user_id, last_read_at DESC);

-- 10. Create helper functions for upserts
CREATE OR REPLACE FUNCTION upsert_user_setting(
  p_user_id UUID,
  p_setting_key TEXT,
  p_setting_value JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_settings (user_id, setting_key, setting_value, updated_at)
  VALUES (p_user_id, p_setting_key, p_setting_value, NOW())
  ON CONFLICT (user_id, setting_key)
  DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION upsert_user_storage(
  p_user_id UUID,
  p_storage_key TEXT,
  p_storage_value JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_storage (user_id, storage_key, storage_value, updated_at)
  VALUES (p_user_id, p_storage_key, p_storage_value, NOW())
  ON CONFLICT (user_id, storage_key)
  DO UPDATE SET 
    storage_value = EXCLUDED.storage_value,
    updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION track_reading_history(
  p_user_id UUID,
  p_article_id BIGINT,
  p_reading_progress INTEGER DEFAULT 0,
  p_reading_duration INTEGER DEFAULT 0
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO reading_history (user_id, article_id, last_read_at, reading_progress, reading_duration)
  VALUES (p_user_id, p_article_id, NOW(), p_reading_progress, p_reading_duration)
  ON CONFLICT (user_id, article_id)
  DO UPDATE SET 
    last_read_at = NOW(),
    reading_progress = GREATEST(reading_history.reading_progress, EXCLUDED.reading_progress),
    reading_duration = reading_history.reading_duration + EXCLUDED.reading_duration;
END;
$$;

-- 11. Grant permissions for RPC functions
GRANT EXECUTE ON FUNCTION upsert_user_setting TO anon, authenticated;
GRANT EXECUTE ON FUNCTION upsert_user_storage TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_reading_history TO anon, authenticated;

-- 12. Insert sample data to prevent empty table errors
INSERT INTO user_settings (user_id, setting_key, setting_value) 
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'site_name', '"Bengali News"'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'site_description', '"বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম"'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'default_language', '"bn"'::jsonb)
ON CONFLICT (user_id, setting_key) DO NOTHING;

-- 13. Ensure weather table exists and has proper structure
ALTER TABLE weather ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE weather ADD COLUMN IF NOT EXISTS temperature INTEGER;
ALTER TABLE weather ADD COLUMN IF NOT EXISTS condition TEXT;
ALTER TABLE weather ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE weather ADD COLUMN IF NOT EXISTS forecast JSONB;

-- 14. Insert sample weather data to prevent 403 errors
INSERT INTO weather (city, temperature, condition, icon, forecast) 
VALUES 
  ('ঢাকা', 28, 'মেঘলা', 'cloudy', '{"today": "মেঘলা", "tomorrow": "বৃষ্টি"}'::jsonb),
  ('চট্টগ্রাম', 26, 'রৌদ্রোজ্জ্বল', 'sunny', '{"today": "রৌদ্রোজ্জ্বল", "tomorrow": "আংশিক মেঘলা"}'::jsonb),
  ('সিলেট', 24, 'বৃষ্টি', 'rainy', '{"today": "বৃষ্টি", "tomorrow": "ঝড়বৃষ্টি"}'::jsonb)
ON CONFLICT DO NOTHING;

-- 15. Comments for documentation
COMMENT ON TABLE user_settings IS 'User-specific application settings and preferences';
COMMENT ON TABLE user_storage IS 'User data storage for offline functionality and preferences';
COMMENT ON TABLE reading_history IS 'Track user reading history for personalization';

-- Confirmation message
SELECT 'All missing tables and RLS policies have been created successfully!' as status;