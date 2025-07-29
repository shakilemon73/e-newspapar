/**
 * Server-side Admin API using Service Role Key
 * This file should be used from Express endpoints only
 */
import { adminSupabase } from './supabase';

// Helper function to generate slugs
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 100);
}

// ==============================================
// ARTICLES MANAGEMENT (with Service Role Key)
// ==============================================

export async function createArticleServerSide(articleData: {
  title: string;
  content: string;
  excerpt?: string;
  category_id: number;
  image_url?: string;
  is_featured?: boolean;
  slug?: string;
  published_at?: string;
}) {
  try {
    const slug = articleData.slug || generateSlug(articleData.title);

    // Use service role key to bypass RLS - match actual table schema
    const { data, error } = await adminSupabase
      .from('articles')
      .insert({
        title: articleData.title,
        slug: slug,
        content: articleData.content,
        excerpt: articleData.excerpt,
        image_url: articleData.image_url,
        category_id: articleData.category_id,
        is_featured: articleData.is_featured || false,
        published_at: articleData.published_at || new Date().toISOString(),
        view_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating article:', error);
      throw new Error(error.message || 'Failed to create article');
    }

    return data;
  } catch (error) {
    console.error('Error creating article server-side:', error);
    throw error;
  }
}

export async function createVideoContentServerSide(videoData: {
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  slug?: string;
}) {
  try {
    const slug = videoData.slug || generateSlug(videoData.title);

    // Match actual video_content table schema
    const { data, error } = await adminSupabase
      .from('video_content')
      .insert({
        title: videoData.title,
        slug: slug,
        description: videoData.description,
        video_url: videoData.video_url,
        thumbnail_url: videoData.thumbnail_url,
        duration: videoData.duration,
        views: 0,
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating video:', error);
      throw new Error(error.message || 'Failed to create video');
    }

    return data;
  } catch (error) {
    console.error('Error creating video server-side:', error);
    throw error;
  }
}

export async function createAudioArticleServerSide(audioData: {
  title: string;
  excerpt?: string;
  image_url?: string;
  audio_url?: string;
  duration?: number;
  slug?: string;
}) {
  try {
    const slug = audioData.slug || generateSlug(audioData.title);

    // Match actual audio_articles table schema
    const { data, error } = await adminSupabase
      .from('audio_articles')
      .insert({
        title: audioData.title,
        slug: slug,
        excerpt: audioData.excerpt,
        image_url: audioData.image_url,
        audio_url: audioData.audio_url,
        duration: audioData.duration,
        published_at: new Date().toISOString(),
        view_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating audio article:', error);
      throw new Error(error.message || 'Failed to create audio article');
    }

    return data;
  } catch (error) {
    console.error('Error creating audio article server-side:', error);
    throw error;
  }
}

export async function createEPaperServerSide(epaperData: {
  title: string;
  publication_date: string;
  pdf_url: string;
  thumbnail_url?: string;
  pages?: number;
}) {
  try {
    // Match actual epapers table schema
    const { data, error } = await adminSupabase
      .from('epapers')
      .insert({
        title: epaperData.title,
        publication_date: epaperData.publication_date,
        pdf_url: epaperData.pdf_url,
        thumbnail_url: epaperData.thumbnail_url,
        pages: epaperData.pages || 1
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating e-paper:', error);
      throw new Error(error.message || 'Failed to create e-paper');
    }

    return data;
  } catch (error) {
    console.error('Error creating e-paper server-side:', error);
    throw error;
  }
}

export async function createCategoryServerSide(categoryData: {
  name: string;
  slug?: string;
  description?: string;
}) {
  try {
    const slug = categoryData.slug || generateSlug(categoryData.name);

    const { data, error } = await adminSupabase
      .from('categories')
      .insert({
        name: categoryData.name,
        slug: slug,
        description: categoryData.description
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating category:', error);
      throw new Error(error.message || 'Failed to create category');
    }

    return data;
  } catch (error) {
    console.error('Error creating category server-side:', error);
    throw error;
  }
}

export async function createBreakingNewsServerSide(newsData: {
  title: string;
  content: string;
  priority?: number;
  is_active?: boolean;
  expires_at?: string;
}) {
  try {
    const { data, error } = await adminSupabase
      .from('breaking_news')
      .insert({
        title: newsData.title,
        content: newsData.content,
        priority: newsData.priority || 1,
        is_active: newsData.is_active !== undefined ? newsData.is_active : true,
        expires_at: newsData.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating breaking news:', error);
      throw new Error(error.message || 'Failed to create breaking news');
    }

    return data;
  } catch (error) {
    console.error('Error creating breaking news server-side:', error);
    throw error;
  }
}

// ==============================================
// UPDATE OPERATIONS (with Service Role Key)
// ==============================================

export async function updateArticleServerSide(id: number, updates: any) {
  try {
    const { data, error } = await adminSupabase
      .from('articles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating article:', error);
      throw new Error(error.message || 'Failed to update article');
    }

    return data;
  } catch (error) {
    console.error('Error updating article server-side:', error);
    throw error;
  }
}

export async function deleteArticleServerSide(id: number) {
  try {
    const { error } = await adminSupabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting article:', error);
      throw new Error(error.message || 'Failed to delete article');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting article server-side:', error);
    throw error;
  }
}

// UPDATE/DELETE functions for Videos, Categories, E-Papers, Audio Articles

export async function updateVideoServerSide(id: number, updates: any) {
  try {
    const { data, error } = await adminSupabase
      .from('video_content')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating video:', error);
      throw new Error(error.message || 'Failed to update video');
    }

    return data;
  } catch (error) {
    console.error('Error updating video server-side:', error);
    throw error;
  }
}

export async function deleteVideoServerSide(id: number) {
  try {
    const { error } = await adminSupabase
      .from('video_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting video:', error);
      throw new Error(error.message || 'Failed to delete video');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting video server-side:', error);
    throw error;
  }
}

export async function updateCategoryServerSide(id: number, updates: any) {
  try {
    const { data, error } = await adminSupabase
      .from('categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating category:', error);
      throw new Error(error.message || 'Failed to update category');
    }

    return data;
  } catch (error) {
    console.error('Error updating category server-side:', error);
    throw error;
  }
}

export async function deleteCategoryServerSide(id: number) {
  try {
    const { error } = await adminSupabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting category:', error);
      throw new Error(error.message || 'Failed to delete category');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting category server-side:', error);
    throw error;
  }
}

export async function updateEPaperServerSide(id: number, updates: any) {
  try {
    const { data, error } = await adminSupabase
      .from('epapers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating e-paper:', error);
      throw new Error(error.message || 'Failed to update e-paper');
    }

    return data;
  } catch (error) {
    console.error('Error updating e-paper server-side:', error);
    throw error;
  }
}

export async function deleteEPaperServerSide(id: number) {
  try {
    const { error } = await adminSupabase
      .from('epapers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting e-paper:', error);
      throw new Error(error.message || 'Failed to delete e-paper');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting e-paper server-side:', error);
    throw error;
  }
}

export async function updateAudioArticleServerSide(id: number, updates: any) {
  try {
    const { data, error } = await adminSupabase
      .from('audio_articles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating audio article:', error);
      throw new Error(error.message || 'Failed to update audio article');
    }

    return data;
  } catch (error) {
    console.error('Error updating audio article server-side:', error);
    throw error;
  }
}

export async function deleteAudioArticleServerSide(id: number) {
  try {
    const { error } = await adminSupabase
      .from('audio_articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting audio article:', error);
      throw new Error(error.message || 'Failed to delete audio article');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting audio article server-side:', error);
    throw error;
  }
}
export async function updateBreakingNewsServerSide(id: number, updates: any) {
  try {
    const { data, error } = await adminSupabase
      .from('breaking_news')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating breaking news:', error);
      throw new Error(error.message || 'Failed to update breaking news');
    }

    return data;
  } catch (error) {
    console.error('Error updating breaking news server-side:', error);
    throw error;
  }
}

export async function deleteBreakingNewsServerSide(id: number) {
  try {
    const { error } = await adminSupabase
      .from('breaking_news')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting breaking news:', error);
      throw new Error(error.message || 'Failed to delete breaking news');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting breaking news server-side:', error);
    throw error;
  }
}