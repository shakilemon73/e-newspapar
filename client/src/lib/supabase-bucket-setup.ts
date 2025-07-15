import { supabase } from './supabase';

export async function createMediaBucket() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return { success: false, error: listError.message };
    }

    const mediaExists = buckets?.some(bucket => bucket.name === 'media');
    
    if (mediaExists) {
      console.log('Media bucket already exists');
      return { success: true, message: 'Bucket already exists' };
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('media', {
      public: true,
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/ogg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/mpeg'
      ],
      fileSizeLimit: 104857600 // 100MB
    });

    if (error) {
      console.error('Error creating bucket:', error);
      return { success: false, error: error.message };
    }

    console.log('Media bucket created successfully');
    return { success: true, data };
  } catch (error: any) {
    console.error('Error in createMediaBucket:', error);
    return { success: false, error: error.message };
  }
}

export async function ensureMediaBucketExists() {
  const result = await createMediaBucket();
  if (!result.success) {
    throw new Error(`Failed to create media bucket: ${result.error}`);
  }
  return result;
}