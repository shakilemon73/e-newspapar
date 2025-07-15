import { createClient } from '@supabase/supabase-js';

// Use service role key with full permissions for bucket creation
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function createMediaBucketWithServiceKey() {
  try {
    console.log('Creating Supabase Storage bucket with service role key...');
    
    // First check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return { success: false, error: listError.message };
    }
    
    console.log('Existing buckets:', buckets?.map(b => b.name));
    
    const mediaExists = buckets?.some(bucket => bucket.name === 'media');
    
    if (mediaExists) {
      console.log('Media bucket already exists');
      return { success: true, message: 'Media bucket already exists' };
    }
    
    // Create the bucket with service role key (minimal config)
    const { data, error } = await supabase.storage.createBucket('media', {
      public: true
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Media bucket created successfully:', data);
    
    // Create folder structure
    const folders = ['images', 'videos', 'audio'];
    
    for (const folder of folders) {
      try {
        // Create a placeholder file to establish the folder structure
        const placeholderContent = new TextEncoder().encode('# Placeholder file for folder structure');
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(`${folder}/.placeholder`, placeholderContent, {
            contentType: 'text/plain',
            upsert: true
          });
        
        if (uploadError) {
          console.warn(`Warning: Could not create ${folder} folder:`, uploadError.message);
        } else {
          console.log(`Created ${folder} folder`);
        }
      } catch (folderError) {
        console.warn(`Warning: Could not create ${folder} folder:`, folderError);
      }
    }
    
    return { success: true, message: 'Media bucket and folder structure created successfully', data };
    
  } catch (error: any) {
    console.error('Error in createMediaBucketWithServiceKey:', error);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createMediaBucketWithServiceKey()
    .then(result => {
      console.log('Bucket creation result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Failed to create bucket:', error);
      process.exit(1);
    });
}