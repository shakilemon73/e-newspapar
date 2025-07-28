-- COMPREHENSIVE RLS SECURITY IMPLEMENTATION
-- World-class security system for Bengali News Website
-- ===================================================

-- 1. CREATE MISSING user_storage TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS user_storage (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  storage_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, storage_key)
);

-- 2. ENABLE RLS ON ALL CRITICAL TABLES
-- ====================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING PERMISSIVE POLICIES
-- ====================================
DROP POLICY IF EXISTS "Enable read access for anon" ON user_profiles;
DROP POLICY IF EXISTS "Allow anonymous access" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for anon" ON user_settings;
DROP POLICY IF EXISTS "Allow anonymous access" ON user_settings;
DROP POLICY IF EXISTS "Enable read access for anon" ON admin_actions;
DROP POLICY IF EXISTS "Allow anonymous access" ON admin_actions;
DROP POLICY IF EXISTS "Enable read access for anon" ON user_reading_history;
DROP POLICY IF EXISTS "Allow anonymous access" ON user_reading_history;

-- 4. USER PROFILE SECURITY POLICIES
-- =================================
CREATE POLICY "Users view own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin view all profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 5. USER SETTINGS SECURITY POLICIES
-- ==================================
CREATE POLICY "Users manage own settings" ON user_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin view all settings" ON user_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 6. USER STORAGE SECURITY POLICIES
-- =================================
CREATE POLICY "Users manage own storage" ON user_storage
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin view all storage" ON user_storage
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 7. USER READING HISTORY SECURITY
-- ================================
CREATE POLICY "Users manage own reading history" ON user_reading_history
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin analytics access on reading history" ON user_reading_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 8. USER INTERACTIONS SECURITY
-- =============================
CREATE POLICY "Users manage own interactions" ON user_interactions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin analytics access on interactions" ON user_interactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 9. USER LIKES SECURITY (Allow public read for counts)
-- =====================================================
CREATE POLICY "Users manage own likes" ON user_likes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public read like counts" ON user_likes
  FOR SELECT TO anon
  USING (true);

-- 10. USER BOOKMARKS SECURITY
-- ===========================
CREATE POLICY "Users manage own bookmarks" ON user_bookmarks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 11. ADMIN ONLY TABLE SECURITY
-- =============================
CREATE POLICY "Admin only access to admin_actions" ON admin_actions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin read audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Service create audit logs" ON audit_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Admin read error logs" ON error_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin read system logs" ON logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 12. CREATE INDEXES FOR PERFORMANCE
-- ==================================
CREATE INDEX IF NOT EXISTS idx_user_storage_user_id ON user_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_storage_key ON user_storage(storage_key);
CREATE INDEX IF NOT EXISTS idx_user_storage_updated ON user_storage(updated_at);

CREATE INDEX IF NOT EXISTS idx_user_reading_history_user_id ON user_reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);

-- 13. INSERT SAMPLE DATA FOR TESTING
-- ==================================
INSERT INTO user_storage (user_id, storage_key, storage_value) VALUES
('00000000-0000-0000-0000-000000000000', 'theme_preference', '{"theme": "light", "language": "bn"}'),
('00000000-0000-0000-0000-000000000000', 'reading_preferences', '{"font_size": "medium", "auto_scroll": false}')
ON CONFLICT (user_id, storage_key) DO NOTHING;

-- 14. VERIFY SECURITY IMPLEMENTATION
-- ==================================
-- This script creates a comprehensive security system with:
-- ✅ User data ownership policies (users only access their own data)
-- ✅ Admin role-based access for management functions
-- ✅ Public read access for non-sensitive data (like counts)
-- ✅ Service role access for system operations
-- ✅ Proper table creation with all required indexes
-- ✅ Sample data for testing functionality

-- DEPLOYMENT NOTES:
-- =================
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify all policies are created without errors
-- 3. Test anonymous access (should be blocked for user data)
-- 4. Test authenticated access (should work for owned data)
-- 5. Test admin access (should work for all data)
-- 6. Deploy Vercel application with confidence