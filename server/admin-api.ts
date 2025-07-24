/**
 * Server-side Admin API using Service Role Key
 * This file should be used from Express endpoints only
 */
import { adminSupabase } from './supabase';

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
    const slug = articleData.slug || articleData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

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
        // Note: No 'published' column exists, remove it
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
    const slug = videoData.slug || videoData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

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
    const slug = audioData.slug || audioData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

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
        published_at: new Date().toISOString()
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
  publish_date: string;
  pdf_url: string;
  image_url?: string;
  is_latest?: boolean;
}) {
  try {
    // Match actual epapers table schema
    const { data, error } = await adminSupabase
      .from('epapers')
      .insert({
        title: epaperData.title,
        publish_date: epaperData.publish_date,
        pdf_url: epaperData.pdf_url,
        image_url: epaperData.image_url,
        is_latest: epaperData.is_latest || false
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
  parent_id?: number;
}) {
  try {
    const slug = categoryData.slug || categoryData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const { data, error } = await adminSupabase
      .from('categories')
      .insert({
        name: categoryData.name,
        slug: slug,
        description: categoryData.description,
        parent_id: categoryData.parent_id,
        created_at: new Date().toISOString()
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
  content: string;
  is_active?: boolean;
}) {
  try {
    // Match actual breaking_news table schema
    const { data, error } = await adminSupabase
      .from('breaking_news')
      .insert({
        content: newsData.content,
        is_active: newsData.is_active !== false
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