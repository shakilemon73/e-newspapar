-- Fix Vercel deployment issues for Bengali News Website
-- Execute these SQL commands in your Supabase SQL Editor

-- 1. Create missing user_storage table
CREATE TABLE IF NOT EXISTS user_storage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  storage_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, storage_key)
);

-- 2. Create missing reading_history table with proper foreign key
CREATE TABLE IF NOT EXISTS reading_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  reading_progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- 3. Enable Row Level Security for user_storage
ALTER TABLE user_storage ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_storage
CREATE POLICY "Users can view their own storage" ON user_storage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storage" ON user_storage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storage" ON user_storage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storage" ON user_storage
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Enable Row Level Security for reading_history
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for reading_history
CREATE POLICY "Users can view their own reading history" ON reading_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading history" ON reading_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading history" ON reading_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading history" ON reading_history
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_storage_user_id ON user_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_storage_key ON user_storage(user_id, storage_key);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_last_read ON reading_history(user_id, last_read_at DESC);

-- 8. Update function to handle upserts
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

-- 9. Create function to track reading history
CREATE OR REPLACE FUNCTION track_reading_history(
  p_user_id UUID,
  p_article_id BIGINT,
  p_reading_progress INTEGER DEFAULT 0
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO reading_history (user_id, article_id, last_read_at, reading_progress)
  VALUES (p_user_id, p_article_id, NOW(), p_reading_progress)
  ON CONFLICT (user_id, article_id)
  DO UPDATE SET 
    last_read_at = NOW(),
    reading_progress = GREATEST(reading_history.reading_progress, EXCLUDED.reading_progress);
END;
$$;

-- 10. Grant permissions for RPC functions
GRANT EXECUTE ON FUNCTION upsert_user_storage TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_reading_history TO anon, authenticated;