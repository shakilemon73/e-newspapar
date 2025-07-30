/**
 * Fixed Admin CRUD Operations 
 * Proper server-side integration with date formatting and error handling
 */

// Custom API request function for admin operations
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Import the centralized timestamp utilities
import { createUTCTimestamp, normalizeSupabaseTimestamp } from './utils/dates';

// Proper date formatting function for database operations
export function formatDateForDatabase(date: string | Date): string {
  if (!date) return createUTCTimestamp();
  
  const d = typeof date === 'string' ? normalizeSupabaseTimestamp(date) : date;
  if (isNaN(d.getTime())) {
    return createUTCTimestamp();
  }
  return d.toISOString();
}

// ========================================
// ARTICLES CRUD (Fixed)
// ========================================

export async function createArticle(articleData: {
  title: string;
  content: string;
  excerpt?: string;
  category_id: number;
  image_url?: string;
  is_featured?: boolean;
  slug?: string;
  published_at?: string;
}) {
  // Use direct Supabase instead of Express API
  const { createArticleDirect } = await import('./admin-direct-supabase');
  return createArticleDirect(articleData);
}

export async function updateArticle(id: number, updates: any) {
  // Use direct Supabase instead of Express API
  const { updateArticleDirect } = await import('./admin-direct-supabase');
  return updateArticleDirect(id, updates);
}

export async function deleteArticle(id: number) {
  // Use direct Supabase instead of Express API
  const { deleteArticleDirect } = await import('./admin-direct-supabase');
  return deleteArticleDirect(id);
}

// ========================================
// BREAKING NEWS CRUD (Fixed)
// ========================================

export async function createBreakingNews(newsData: {
  title: string;
  content: string;
  priority?: number;
  is_active?: boolean;
  expires_at?: string;
}) {
  try {
    const formattedData = {
      ...newsData,
      expires_at: newsData.expires_at ? 
        formatDateForDatabase(newsData.expires_at) : 
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      is_active: newsData.is_active !== undefined ? newsData.is_active : true,
      priority: newsData.priority || 1
    };

    const response = await apiRequest('/api/admin/breaking-news', {
      method: 'POST',
      body: JSON.stringify(formattedData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error creating breaking news:', error);
    throw error;
  }
}

export async function updateBreakingNews(id: number, updates: any) {
  try {
    const formattedUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.expires_at) {
      formattedUpdates.expires_at = formatDateForDatabase(updates.expires_at);
    }

    const response = await apiRequest(`/api/admin/breaking-news/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(formattedUpdates),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error updating breaking news:', error);
    throw error;
  }
}

export async function deleteBreakingNews(id: number) {
  try {
    const response = await apiRequest(`/api/admin/breaking-news/${id}`, {
      method: 'DELETE'
    });
    
    return response;
  } catch (error) {
    console.error('Error deleting breaking news:', error);
    throw error;
  }
}

// ========================================
// CATEGORIES CRUD (Fixed)
// ========================================

export async function createCategory(categoryData: {
  name: string;
  slug?: string;
  description?: string;
  parent_id?: number;
}) {
  try {
    const response = await apiRequest('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function updateCategory(id: number, updates: any) {
  try {
    const formattedUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const response = await apiRequest(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(formattedUpdates),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: number) {
  try {
    const response = await apiRequest(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    });
    
    return response;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// ========================================
// VIDEOS CRUD (Fixed)
// ========================================

export async function createVideo(videoData: {
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  slug?: string;
}) {
  try {
    const response = await apiRequest('/api/admin/videos', {
      method: 'POST',
      body: JSON.stringify(videoData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
}

export async function updateVideo(id: number, updates: any) {
  try {
    const formattedUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const response = await apiRequest(`/api/admin/videos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(formattedUpdates),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
}

export async function deleteVideo(id: number) {
  try {
    const response = await apiRequest(`/api/admin/videos/${id}`, {
      method: 'DELETE'
    });
    
    return response;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}

// ========================================
// E-PAPERS CRUD (Fixed)
// ========================================

export async function createEPaper(epaperData: {
  title: string;
  publication_date: string;
  pdf_url: string;
  thumbnail_url?: string;
  pages?: number;
}) {
  try {
    const formattedData = {
      ...epaperData,
      publication_date: formatDateForDatabase(epaperData.publication_date)
    };

    const response = await apiRequest('/api/admin/epapers', {
      method: 'POST',
      body: JSON.stringify(formattedData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error creating e-paper:', error);
    throw error;
  }
}

export async function updateEPaper(id: number, updates: any) {
  try {
    const formattedUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.publication_date) {
      formattedUpdates.publication_date = formatDateForDatabase(updates.publication_date);
    }

    const response = await apiRequest(`/api/admin/epapers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(formattedUpdates),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error updating e-paper:', error);
    throw error;
  }
}

export async function deleteEPaper(id: number) {
  try {
    const response = await apiRequest(`/api/admin/epapers/${id}`, {
      method: 'DELETE'
    });
    
    return response;
  } catch (error) {
    console.error('Error deleting e-paper:', error);
    throw error;
  }
}

// ========================================
// AUDIO ARTICLES CRUD (Fixed)
// ========================================

export async function createAudioArticle(audioData: {
  title: string;
  excerpt?: string;
  image_url?: string;
  audio_url?: string;
  duration?: number;
  slug?: string;
}) {
  try {
    const response = await apiRequest('/api/admin/audio', {
      method: 'POST',
      body: JSON.stringify(audioData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error creating audio article:', error);
    throw error;
  }
}

export async function updateAudioArticle(id: number, updates: any) {
  try {
    const formattedUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const response = await apiRequest(`/api/admin/audio/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(formattedUpdates),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error updating audio article:', error);
    throw error;
  }
}

export async function deleteAudioArticle(id: number) {
  try {
    const response = await apiRequest(`/api/admin/audio/${id}`, {
      method: 'DELETE'
    });
    
    return response;
  } catch (error) {
    console.error('Error deleting audio article:', error);
    throw error;
  }
}