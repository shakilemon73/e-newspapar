/**
 * Admin API using Express endpoints with Service Role Key
 * Fixed to match actual database schema
 */

// ==============================================
// VIDEO CONTENT MANAGEMENT
// ==============================================

export async function createVideoContent(videoData: {
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  slug?: string;
}) {
  try {
    const response = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create video');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
}

// ==============================================
// AUDIO ARTICLES MANAGEMENT
// ==============================================

export async function createAudioArticle(audioData: {
  title: string;
  excerpt?: string;
  image_url?: string;
  audio_url?: string;
  duration?: number;
  slug?: string;
}) {
  try {
    const response = await fetch('/api/admin/audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(audioData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create audio article');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating audio article:', error);
    throw error;
  }
}

// ==============================================
// E-PAPERS MANAGEMENT
// ==============================================

export async function createEPaper(epaperData: {
  title: string;
  publish_date: string;
  pdf_url: string;
  image_url?: string;
  is_latest?: boolean;
}) {
  try {
    const response = await fetch('/api/admin/epapers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(epaperData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create e-paper');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating e-paper:', error);
    throw error;
  }
}

// ==============================================
// CATEGORIES MANAGEMENT
// ==============================================

export async function createCategory(categoryData: {
  name: string;
  slug?: string;
  description?: string;
  parent_id?: number;
}) {
  try {
    const response = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create category');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

// ==============================================
// BREAKING NEWS MANAGEMENT
// ==============================================

export async function createBreakingNews(newsData: {
  content: string;
  is_active?: boolean;
}) {
  try {
    const response = await fetch('/api/admin/breaking-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newsData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create breaking news');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating breaking news:', error);
    throw error;
  }
}