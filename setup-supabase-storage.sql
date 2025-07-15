-- Supabase Storage Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create the media bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for public access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- 3. Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- 4. Allow admin users to delete and update files
CREATE POLICY "Admin Manage" ON storage.objects
FOR ALL USING (
  bucket_id = 'media' AND 
  (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin' OR auth.role() = 'service_role')
);

-- 5. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;