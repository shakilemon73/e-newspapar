# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage for your Bengali news website to store images, videos, and audio files.

## 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to Storage → Buckets
3. Click "Create Bucket"
4. Bucket name: `media`
5. Make bucket public: ✅ Yes (so files can be accessed via URLs)

## 2. Create Folder Structure

After creating the bucket, create these folders:
- `images/` - For image files (JPEG, PNG, WebP)
- `videos/` - For video files (MP4, WebM, OGG)
- `audio/` - For audio files (MP3, WAV, OGG, MPEG)

## 3. Set Storage Policies

### Policy for Public Read Access

```sql
-- Allow public read access to all files
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');
```

### Policy for Authenticated Uploads

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
```

### Policy for Admin Delete/Update

```sql
-- Allow admin users to delete and update files
CREATE POLICY "Admin Manage" ON storage.objects
FOR ALL USING (
  bucket_id = 'media' AND 
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
);
```

## 4. Environment Variables

Make sure your `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 5. File Size Limits

The application enforces these limits:
- **Images**: 500MB maximum
- **Videos**: 500MB maximum  
- **Audio**: 500MB maximum

## 6. Supported File Types

### Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### Videos
- MP4 (.mp4)
- WebM (.webm)
- OGG (.ogg)

### Audio
- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- MPEG (.mpeg)

## 7. Usage in Admin Panel

1. Go to Admin Dashboard → Storage → File Manager
2. Select the type of media you want to upload (Images/Videos/Audio)
3. Drag and drop files or click "Select Files"
4. Files will be uploaded to Supabase Storage automatically
5. You can copy URLs, download, or delete files from the interface

## 8. Integration with Articles

When creating articles, you can:
1. Upload images through the Storage tab
2. Copy the public URL 
3. Use the URL in your article content or as the featured image

## 9. API Endpoints

- `GET /api/admin/media/:type` - List files by type
- `DELETE /api/admin/media/:id` - Delete a file
- `GET /api/admin/media/upload-info` - Get upload configuration

## 10. Security Notes

- Only admin users can upload/delete files
- All files are publicly readable via URLs
- File uploads are validated for type and size
- Malicious file uploads are prevented through client-side validation

## Troubleshooting

If uploads fail:
1. Check your Supabase project is active
2. Verify storage policies are set correctly
3. Ensure the 'media' bucket exists and is public
4. Check file size doesn't exceed limits
5. Verify file type is supported