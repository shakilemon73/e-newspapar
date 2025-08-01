-- Fix RLS policies for admin operations
-- This ensures service role has full access to all tables needed for admin functionality

-- ============================================
-- 1. ARTICLES TABLE - Admin access
-- ============================================

-- Drop any conflicting policies for articles
DROP POLICY IF EXISTS "Enable read access for all users" ON articles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON articles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON articles;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON articles;
DROP POLICY IF EXISTS "Admin only access" ON articles;
DROP POLICY IF EXISTS "Public read published articles" ON articles;
DROP POLICY IF EXISTS "Service role full access" ON articles;

-- Create comprehensive policies for articles
CREATE POLICY "Public read articles" ON articles
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access articles" ON articles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 2. CATEGORIES TABLE - Admin access
-- ============================================

-- Drop conflicting policies for categories
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categories;

-- Create policies for categories
CREATE POLICY "Public read categories" ON categories
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access categories" ON categories
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 3. AUTHORS TABLE - Admin access
-- ============================================

-- Drop conflicting policies for authors
DROP POLICY IF EXISTS "Enable read access for all users" ON authors;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON authors;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON authors;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON authors;

-- Create policies for authors
CREATE POLICY "Public read authors" ON authors
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access authors" ON authors
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. USER PROFILES TABLE - Admin access
-- ============================================

-- Drop conflicting policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;

-- Create policies for user_profiles
CREATE POLICY "Service role full access user_profiles" ON user_profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. VIDEO CONTENT TABLE - Admin access  
-- ============================================

-- Drop conflicting policies for video_content
DROP POLICY IF EXISTS "Enable read access for all users" ON video_content;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON video_content;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON video_content;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON video_content;

-- Create policies for video_content
CREATE POLICY "Public read video_content" ON video_content
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access video_content" ON video_content
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 6. SOCIAL MEDIA POSTS TABLE - Admin access
-- ============================================

-- Drop conflicting policies for social_media_posts
DROP POLICY IF EXISTS "Enable read access for all users" ON social_media_posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON social_media_posts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON social_media_posts;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON social_media_posts;

-- Create policies for social_media_posts
CREATE POLICY "Public read social_media_posts" ON social_media_posts
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access social_media_posts" ON social_media_posts
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 7. ALL OTHER ADMIN TABLES
-- ============================================

-- Breaking News
DROP POLICY IF EXISTS "Enable read access for all users" ON breaking_news;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON breaking_news;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON breaking_news;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON breaking_news;

CREATE POLICY "Public read breaking_news" ON breaking_news
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access breaking_news" ON breaking_news
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- E-Papers
DROP POLICY IF EXISTS "Enable read access for all users" ON epapers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON epapers;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON epapers;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON epapers;

CREATE POLICY "Public read epapers" ON epapers
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access epapers" ON epapers
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Audio Articles
DROP POLICY IF EXISTS "Enable read access for all users" ON audio_articles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON audio_articles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON audio_articles;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON audio_articles;

CREATE POLICY "Public read audio_articles" ON audio_articles
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access audio_articles" ON audio_articles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Weather
DROP POLICY IF EXISTS "Enable read access for all users" ON weather;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON weather;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON weather;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON weather;

CREATE POLICY "Public read weather" ON weather
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access weather" ON weather
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;