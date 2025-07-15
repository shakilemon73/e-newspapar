import { supabase } from './supabase';

export type MediaType = 'images' | 'videos' | 'audio';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export class SupabaseStorage {
  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile(
    file: File,
    type: MediaType,
    fileName?: string
  ): Promise<UploadResult> {
    try {
      // Generate unique filename if not provided
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      
      // Define file path based on type
      const filePath = `${type}/${uniqueFileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      };

    } catch (error: any) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Get public URL for a file
   */
  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * List files in a directory
   */
  static async listFiles(folder: MediaType, limit = 100) {
    try {
      const { data, error } = await supabase.storage
        .from('media')
        .list(folder, {
          limit,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('List files error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('List files error:', error);
      return [];
    }
  }

  /**
   * Get file info
   */
  static async getFileInfo(filePath: string) {
    try {
      const { data, error } = await supabase.storage
        .from('media')
        .list(filePath.split('/')[0], {
          search: filePath.split('/')[1]
        });

      if (error) {
        console.error('Get file info error:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  }
}

// Utility functions for file validation
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const validateVideoFile = (file: File): boolean => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const validateAudioFile = (file: File): boolean => {
  const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const getFileValidator = (type: MediaType) => {
  switch (type) {
    case 'images':
      return validateImageFile;
    case 'videos':
      return validateVideoFile;
    case 'audio':
      return validateAudioFile;
    default:
      return () => false;
  }
};