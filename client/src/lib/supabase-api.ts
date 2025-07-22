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
      read_time,
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
    throw new Error('Failed to fetch articles');
  }

  return data;
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
      read_time,
      views,
      published_at,
      is_featured,
      categories(id, name, slug)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    throw new Error('Article not found');
  }

  return data;
}

// Increment article views
export async function incrementArticleViews(id: number) {
  const { error } = await supabase.rpc('increment_views', { article_id: id });
  
  if (error) {
    console.error('Error incrementing views:', error);
  }
}

// Categories API
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }

  return data;
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
    throw new Error('Category not found');
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
    throw new Error('Failed to fetch breaking news');
  }

  return data;
}

// Weather API
export async function getWeather() {
  const { data, error } = await supabase
    .from('weather')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching weather:', error);
    throw new Error('Failed to fetch weather data');
  }

  return data;
}

// Get weather by location
export async function getWeatherByLocation(lat: number, lng: number) {
  // For now, return Dhaka weather as default
  const { data, error } = await supabase
    .from('weather')
    .select('*')
    .eq('city', 'ঢাকা')
    .single();

  if (error) {
    console.error('Error fetching location weather:', error);
    throw new Error('Failed to fetch weather data');
  }

  return data;
}

// E-Papers API
export async function getEPapers() {
  const { data, error } = await supabase
    .from('epapers')
    .select('*')
    .order('publish_date', { ascending: false });

  if (error) {
    console.error('Error fetching e-papers:', error);
    throw new Error('Failed to fetch e-papers');
  }

  return data;
}

// Get latest e-paper
export async function getLatestEPaper() {
  const { data, error } = await supabase
    .from('epapers')
    .select('*')
    .eq('is_latest', true)
    .single();

  if (error) {
    console.error('Error fetching latest e-paper:', error);
    throw new Error('Failed to fetch latest e-paper');
  }

  return data;
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
      read_time,
      views,
      published_at,
      categories(id, name, slug)
    `)
    .order('views', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching popular articles:', error);
    throw new Error('Failed to fetch popular articles');
  }

  return data;
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
      read_time,
      views,
      published_at,
      categories(id, name, slug)
    `)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest articles:', error);
    throw new Error('Failed to fetch latest articles');
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
      content: 'সর্বশেষ সংবাদ এবং আপডেটের জন্য আমাদের ফেসবুক পেজ ফলো করুন।',
      created_at: new Date().toISOString()
    },
    {
      id: 2, 
      platform: 'twitter',
      content: 'আজকের হেডলাইন: বাংলাদেশের সর্বশেষ সংবাদ',
      created_at: new Date().toISOString()
    }
  ];

  if (platform) {
    return mockData.filter(post => post.platform === platform);
  }

  return mockData;
}

// Videos API
export async function getVideos() {
  const { data, error } = await supabase
    .from('video_content')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    throw new Error('Failed to fetch videos');
  }

  return data;
}

// Audio Articles API
export async function getAudioArticles() {
  const { data, error } = await supabase
    .from('audio_articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching audio articles:', error);
    throw new Error('Failed to fetch audio articles');
  }

  return data;
}

// Trending Topics API
export async function getTrendingTopics() {
  const { data, error } = await supabase
    .from('trending_topics')
    .select('*')
    .order('trend_score', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching trending topics:', error);
    throw new Error('Failed to fetch trending topics');
  }

  return data;
}

// Site Settings API
export async function getSiteSettings() {
  // Return default settings for now since system_settings table schema needs updating
  return {
    siteName: 'Emon\'s Daily News',
    siteDescription: 'বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র',
    logoUrl: '',
    defaultLanguage: 'bn',
    siteUrl: 'https://emonsdaily.com'
  };
}

// Comments API
export async function getArticleComments(articleId: number) {
  const { data, error } = await supabase
    .from('article_comments')
    .select(`
      id,
      content,
      author_name,
      created_at,
      is_approved
    `)
    .eq('article_id', articleId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments');
  }

  return data;
}

// Add comment (requires authentication)
export async function addComment(articleId: number, content: string, authorName: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('article_comments')
    .insert({
      article_id: articleId,
      content,
      author_name: authorName,
      user_id: user.id,
      is_approved: false // Comments need approval
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }

  return data;
}

// User likes API
export async function isArticleLiked(articleId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data, error } = await supabase
    .from('user_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', 'article')
    .eq('content_id', articleId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking like status:', error);
  }

  return !!data;
}

export async function toggleArticleLike(articleId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }

  const isLiked = await isArticleLiked(articleId);

  if (isLiked) {
    // Remove like
    const { error } = await supabase
      .from('user_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('content_type', 'article')
      .eq('content_id', articleId);

    if (error) {
      console.error('Error removing like:', error);
      throw new Error('Failed to remove like');
    }
  } else {
    // Add like
    const { error } = await supabase
      .from('user_likes')
      .insert({
        user_id: user.id,
        content_type: 'article',
        content_id: articleId
      });

    if (error) {
      console.error('Error adding like:', error);
      throw new Error('Failed to add like');
    }
  }

  return !isLiked;
}

// Newsletter subscription
export async function subscribeToNewsletter(email: string) {
  const { data, error } = await supabase
    .from('newsletters')
    .insert({
      email,
      is_subscribed: true
    })
    .select()
    .single();

  if (error) {
    // Check if email already exists
    if (error.code === '23505') {
      throw new Error('Email already subscribed');
    }
    console.error('Error subscribing to newsletter:', error);
    throw new Error('Failed to subscribe to newsletter');
  }

  return data;
}