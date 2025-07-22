// Client-side Supabase API functions to replace server API calls
import { supabase } from './supabase';

// Articles API
export async function getArticles(params: {
  limit?: number;
  offset?: number;
  category?: string;
  featured?: boolean;
} = {}) {
  let query = supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      image_url,
      views,
      published_at,
      is_featured,
      categories(id, name, slug)
    `)
    .order('published_at', { ascending: false });

  if (params.featured) {
    query = query.eq('is_featured', true);
  }

  if (params.category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single();
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id);
    }
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data || [];
}

// Search articles
export async function searchArticles(searchQuery: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      image_url,
      views,
      published_at,
      categories(id, name, slug)
    `)
    .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error searching articles:', error);
    return [];
  }

  return data || [];
}

// Get article by ID
export async function getArticleById(id: number) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      image_url,
      views,
      published_at,
      is_featured,
      categories(id, name, slug)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data;
}

// Get article by slug
export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      image_url,
      views,
      published_at,
      is_featured,
      categories(id, name, slug)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data;
}

// Categories API
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

// Get category by slug
export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}

// Breaking News API
export async function getBreakingNews() {
  const { data, error } = await supabase
    .from('breaking_news')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching breaking news:', error);
    return [];
  }

  return data || [];
}

// Weather API
export async function getWeather() {
  const { data, error } = await supabase
    .from('weather')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching weather:', error);
    return [];
  }

  return data || [];
}

// Popular Articles API
export async function getPopularArticles(limit = 5) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      image_url,
      views,
      published_at,
      categories(id, name, slug)
    `)
    .order('views', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching popular articles:', error);
    return [];
  }

  return data || [];
}

// Latest Articles API
export async function getLatestArticles(limit = 10) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      image_url,
      views,
      published_at,
      categories(id, name, slug)
    `)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }

  return data || [];
}

// Videos API
export async function getVideos() {
  const { data, error } = await supabase
    .from('video_content')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }

  return data || [];
}

// Get video by slug
export async function getVideoBySlug(slug: string) {
  const { data, error } = await supabase
    .from('video_content')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching video:', error);
    return null;
  }

  return data;
}

// Audio Articles API
export async function getAudioArticles() {
  const { data, error } = await supabase
    .from('audio_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching audio articles:', error);
    return [];
  }

  return data || [];
}

// E-Papers API
export async function getEPapers() {
  const { data, error } = await supabase
    .from('epapers')
    .select('*')
    .order('published_date', { ascending: false });

  if (error) {
    console.error('Error fetching e-papers:', error);
    return [];
  }

  return data || [];
}

// Get latest e-paper
export async function getLatestEPaper() {
  const { data, error } = await supabase
    .from('epapers')
    .select('*')
    .order('published_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching latest e-paper:', error);
    return null;
  }

  return data;
}

// Social Media API
export async function getSocialMediaPosts(platform?: string) {
  // Return mock data for now since social_media table doesn't exist
  const mockData = [
    {
      id: 1,
      platform: 'facebook',
      content: 'সর্বশেষ খবর: বাংলাদেশে নতুন উন্নয়ন প্রকল্প শুরু',
      url: 'https://facebook.com/example',
      published_at: new Date().toISOString()
    },
    {
      id: 2,
      platform: 'twitter',
      content: 'ব্রেকিং: আজকের গুরুত্বপূর্ণ সংবাদ',
      url: 'https://twitter.com/example',
      published_at: new Date().toISOString()
    }
  ];

  if (platform) {
    return mockData.filter(post => post.platform === platform);
  }

  return mockData;
}

// Trending Topics API
export async function getTrendingTopics() {
  const { data, error } = await supabase
    .from('trending_topics')
    .select('*')
    .order('score', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching trending topics:', error);
    return [];
  }

  return data || [];
}

// Site Settings API
export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching site settings:', error);
    return {
      siteName: "Emon's Daily News",
      siteDescription: "বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র",
      logoUrl: "",
      defaultLanguage: "bn",
      siteUrl: "https://emonsdaily.com"
    };
  }

  return {
    siteName: data.site_name || "Emon's Daily News",
    siteDescription: data.site_description || "বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র",
    logoUrl: data.logo_url || "",
    defaultLanguage: data.default_language || "bn",
    siteUrl: data.site_url || "https://emonsdaily.com"
  };
}

// User interactions
export async function incrementArticleViews(articleId: number) {
  const { error } = await supabase.rpc('increment_article_views', {
    article_id: articleId
  });

  if (error) {
    console.error('Error incrementing views:', error);
  }
}

export async function toggleArticleLike(articleId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: existingLike } = await supabase
    .from('user_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', 'article')
    .eq('content_id', articleId)
    .single();

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('user_likes')
      .delete()
      .eq('id', existingLike.id);
    
    if (error) throw error;
    return { liked: false };
  } else {
    // Like
    const { error } = await supabase
      .from('user_likes')
      .insert({
        user_id: user.id,
        content_type: 'article',
        content_id: articleId
      });
    
    if (error) throw error;
    return { liked: true };
  }
}

export async function addComment(articleId: number, content: string, authorName: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('article_comments')
    .insert({
      article_id: articleId,
      user_id: user.id,
      content,
      author_name: authorName
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function subscribeToNewsletter(email: string) {
  const { data, error } = await supabase
    .from('newsletters')
    .insert({
      email,
      subscribed_at: new Date().toISOString(),
      is_active: true
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Duplicate email
      throw new Error('This email is already subscribed');
    }
    throw error;
  }

  return data;
}