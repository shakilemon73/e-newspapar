/**
 * Supabase-based storage solution to replace localStorage
 * Fixes JSON parse errors by storing data in Supabase database
 */

import { supabase } from './supabase';

interface UserStorageData {
  id?: number;
  user_id: string;
  storage_key: string;
  storage_value: any;
  created_at?: string;
  updated_at?: string;
}

// Media type for file uploads (required by admin components)
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'pdf';

// File upload class for admin components
export class SupabaseStorage {
  static async uploadFile(file: File, mediaType: MediaType): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${mediaType}s/${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (error) {
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        };
      }

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error: any) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message || 'Unknown upload error'
      };
    }
  }
}

// File validator function for admin components
export function getFileValidator(mediaType: MediaType) {
  const validators = {
    image: (file: File) => file.type.startsWith('image/'),
    video: (file: File) => file.type.startsWith('video/'),
    audio: (file: File) => file.type.startsWith('audio/'),
    document: (file: File) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
    pdf: (file: File) => file.type === 'application/pdf'
  };

  return validators[mediaType] || (() => true);
}

/**
 * Store data in Supabase instead of localStorage
 */
export async function setSupabaseStorage(key: string, value: any, userId?: string): Promise<boolean> {
  try {
    // Get current user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user found for Supabase storage');
        return false;
      }
      userId = user.id;
    }

    // Upsert the data
    const { error } = await supabase
      .from('user_storage')
      .upsert({
        user_id: userId,
        storage_key: key,
        storage_value: value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,storage_key'
      });

    if (error) {
      console.error('Error storing data in Supabase:', error);
      return false;
    }

    console.log(`✅ Stored ${key} in Supabase storage`);
    return true;
  } catch (error) {
    console.error('Failed to store in Supabase:', error);
    return false;
  }
}

/**
 * Get data from Supabase instead of localStorage
 */
export async function getSupabaseStorage<T = any>(key: string, userId?: string): Promise<T | null> {
  try {
    // Get current user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user found for Supabase storage');
        return null;
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('user_storage')
      .select('storage_value')
      .eq('user_id', userId)
      .eq('storage_key', key)
      .maybeSingle();

    if (error) {
      console.error('Error getting data from Supabase:', error);
      return null;
    }

    return data?.storage_value || null;
  } catch (error) {
    console.error('Failed to get from Supabase:', error);
    return null;
  }
}

/**
 * Remove data from Supabase storage
 */
export async function removeSupabaseStorage(key: string, userId?: string): Promise<boolean> {
  try {
    // Get current user if userId not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user found for Supabase storage');
        return false;
      }
      userId = user.id;
    }

    const { error } = await supabase
      .from('user_storage')
      .delete()
      .eq('user_id', userId)
      .eq('storage_key', key);

    if (error) {
      console.error('Error removing data from Supabase:', error);
      return false;
    }

    console.log(`✅ Removed ${key} from Supabase storage`);
    return true;
  } catch (error) {
    console.error('Failed to remove from Supabase:', error);
    return false;
  }
}

/**
 * Migrate existing localStorage data to Supabase
 */
export async function migrateLocalStorageToSupabase(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found, skipping localStorage migration');
      return;
    }

    console.log('🔄 Migrating localStorage to Supabase...');

    const keysToMigrate = [
      'theme',
      'language',
      'article-theme',
      'userSettings',
      'user-preferences',
      'site-settings'
    ];

    let migratedCount = 0;

    for (const key of keysToMigrate) {
      try {
        const value = localStorage.getItem(key);
        if (value && value !== 'null' && value !== 'undefined' && value !== '[object Object]') {
          // Try to parse JSON if it looks like JSON
          let parsedValue = value;
          if (value.startsWith('{') || value.startsWith('[') || value.startsWith('"')) {
            try {
              parsedValue = JSON.parse(value);
            } catch {
              // Keep as string if parsing fails
            }
          }

          const success = await setSupabaseStorage(key, parsedValue, user.id);
          if (success) {
            // Remove from localStorage after successful migration
            localStorage.removeItem(key);
            migratedCount++;
            console.log(`✅ Migrated ${key} to Supabase`);
          }
        }
      } catch (error) {
        console.warn(`Failed to migrate ${key}:`, error);
      }
    }

    if (migratedCount > 0) {
      console.log(`✅ Migrated ${migratedCount} localStorage items to Supabase`);
    } else {
      console.log('✅ No localStorage items to migrate');
    }
  } catch (error) {
    console.error('Failed to migrate localStorage to Supabase:', error);
  }
}

/**
 * Hybrid storage: Try Supabase first, fallback to safe localStorage
 */
export async function hybridStorageGet<T = any>(key: string): Promise<T | null> {
  try {
    // Try Supabase first
    const supabaseValue = await getSupabaseStorage<T>(key);
    if (supabaseValue !== null) {
      return supabaseValue;
    }

    // Fallback to safe localStorage
    const { safeLocalStorageGet } = await import('./storage-cleanup');
    return safeLocalStorageGet<T>(key);
  } catch (error) {
    console.warn(`Hybrid storage get failed for ${key}:`, error);
    return null;
  }
}

/**
 * Hybrid storage: Store in both Supabase and localStorage for reliability
 */
export async function hybridStorageSet(key: string, value: any): Promise<boolean> {
  try {
    const promises: Promise<boolean>[] = [];

    // Store in Supabase
    promises.push(setSupabaseStorage(key, value));

    // Store in localStorage safely
    promises.push(
      (async () => {
        try {
          const { safeLocalStorageSet } = await import('./storage-cleanup');
          return safeLocalStorageSet(key, value);
        } catch {
          return false;
        }
      })()
    );

    const results = await Promise.allSettled(promises);
    
    // Return true if at least one storage method succeeded
    return results.some(result => result.status === 'fulfilled' && result.value === true);
  } catch (error) {
    console.warn(`Hybrid storage set failed for ${key}:`, error);
    return false;
  }
}