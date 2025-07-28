-- Create user_storage table with proper RLS security
CREATE TABLE IF NOT EXISTS user_storage (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  storage_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, storage_key)
);

-- Enable RLS
ALTER TABLE user_storage ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies
CREATE POLICY "Users manage own storage" ON user_storage
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin view all storage" ON user_storage
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_storage_user_id ON user_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_storage_key ON user_storage(storage_key);
CREATE INDEX IF NOT EXISTS idx_user_storage_updated ON user_storage(updated_at);

-- Insert sample data for testing
INSERT INTO user_storage (user_id, storage_key, storage_value) VALUES
('00000000-0000-0000-0000-000000000000', 'theme_preference', '{"theme": "light", "language": "bn"}'),
('00000000-0000-0000-0000-000000000000', 'reading_preferences', '{"font_size": "medium", "auto_scroll": false}')
ON CONFLICT (user_id, storage_key) DO NOTHING;