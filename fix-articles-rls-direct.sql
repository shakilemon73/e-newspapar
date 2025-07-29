-- Fix RLS policies for articles table to allow admin access
-- This fixes the "new row violates row-level security policy" error

-- First, check if RLS is enabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'articles';

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Enable read access for anon" ON articles;
DROP POLICY IF EXISTS "Allow anonymous access" ON articles;
DROP POLICY IF EXISTS "Users can only read published articles" ON articles;
DROP POLICY IF EXISTS "Only authenticated users can create" ON articles;
DROP POLICY IF EXISTS "Restrict article creation" ON articles;

-- Create comprehensive articles RLS policies

-- 1. Public read access for published articles (anonymous users)
CREATE POLICY "Public read published articles" ON articles
  FOR SELECT 
  TO anon, authenticated
  USING (published_at IS NOT NULL AND published_at <= NOW());

-- 2. Service role full access (bypasses RLS completely)
CREATE POLICY "Service role full access" ON articles
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Admin users full access (for authenticated admin users)
CREATE POLICY "Admin users full access" ON articles
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'articles' 
ORDER BY policyname;