/**
 * Supabase Storage Setup Script
 * Run this once to set up the media storage bucket for images, videos, and audio
 * 
 * Usage: npx tsx setup-storage.ts
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('🚀 Starting Supabase Storage setup...\n');

  try {
    // Step 1: Check if bucket exists
    console.log('📁 Checking if media bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    const mediaExists = buckets?.some(bucket => bucket.name === 'media');
    
    if (mediaExists) {
      console.log('✅ Media bucket already exists!');
    } else {
      // Step 2: Create the bucket
      console.log('📦 Creating media bucket...');
      const { error: createError } = await supabase.storage.createBucket('media', {
        public: true,
        fileSizeLimit: 524288000, // 500MB
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        return;
      }
      console.log('✅ Media bucket created successfully!');
    }

    // Step 3: Set up storage policies
    console.log('\n🔐 Setting up storage policies...');
    console.log('Note: You need to run the following SQL in your Supabase SQL Editor:\n');
    
    const sql = `
-- Allow public read access to all files in media bucket
CREATE POLICY "Public Access to Media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');

-- Allow service role to do everything (for admin operations)
CREATE POLICY "Service role full access to media"
ON storage.objects
TO service_role
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');
`;

    console.log(sql);
    console.log('\n📋 Copy the SQL above and run it in Supabase SQL Editor');
    console.log('   Go to: https://app.supabase.com/project/[your-project-ref]/sql\n');
    
    console.log('✅ Storage setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run the SQL policies in Supabase SQL Editor');
    console.log('   2. Test file uploads in the admin dashboard');
    console.log('   3. Your images will be stored at: ' + supabaseUrl + '/storage/v1/object/public/media/\n');
    
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupStorage();
