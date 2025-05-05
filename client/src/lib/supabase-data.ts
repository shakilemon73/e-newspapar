import supabase from './supabase';

// Articles related functions
export const getArticles = async (limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*)
    `)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }

  return data || [];
};

export const getArticleBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    throw error;
  }

  return data;
};

export const getArticlesByCategory = async (categorySlug: string, limit = 10, offset = 0) => {
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (categoryError) {
    console.error(`Error fetching category with slug ${categorySlug}:`, categoryError);
    throw categoryError;
  }

  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('category_id', category.id)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(`Error fetching articles for category ${categorySlug}:`, error);
    throw error;
  }

  return data || [];
};

export const getFeaturedArticles = async (limit = 5) => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured articles:', error);
    throw error;
  }

  return data || [];
};

export const getLatestArticles = async (limit = 10) => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*)
    `)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest articles:', error);
    throw error;
  }

  return data || [];
};

export const getPopularArticles = async (limit = 5, timeRange: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
  // Calculate date range based on timeRange
  const today = new Date();
  let startDate = new Date();
  
  switch (timeRange) {
    case 'daily':
      startDate.setDate(today.getDate() - 1);
      break;
    case 'weekly':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(today.getMonth() - 1);
      break;
  }

  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*)
    `)
    .gte('published_at', startDate.toISOString())
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Error fetching popular articles (${timeRange}):`, error);
    throw error;
  }

  return data || [];
};

export const searchArticles = async (query: string, limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*)
    `)
    .textSearch('search_vector', query)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(`Error searching articles with query "${query}":`, error);
    throw error;
  }

  return data || [];
};

// Categories related functions
export const getAllCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
};

export const getCategoryBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    throw error;
  }

  return data;
};

// E-Papers related functions
export const getAllEPapers = async (limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('epapers')
    .select('*')
    .order('publish_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching e-papers:', error);
    throw error;
  }

  return data || [];
};

export const getLatestEPaper = async () => {
  const { data, error } = await supabase
    .from('epapers')
    .select('*')
    .order('publish_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching latest e-paper:', error);
    throw error;
  }

  return data;
};

// Weather related functions
export const getAllWeather = async () => {
  const { data, error } = await supabase
    .from('weather')
    .select('*')
    .order('city');

  if (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }

  return data || [];
};

export const getWeatherByCity = async (city: string) => {
  const { data, error } = await supabase
    .from('weather')
    .select('*')
    .eq('city', city)
    .single();

  if (error) {
    console.error(`Error fetching weather for city ${city}:`, error);
    throw error;
  }

  return data;
};

// Breaking news related functions
export const getActiveBreakingNews = async () => {
  const { data, error } = await supabase
    .from('breaking_news')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching breaking news:', error);
    throw error;
  }

  return data || [];
};

// User preferences and reading history
export const getUserReadingHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_reading_history')
    .select(`
      article_slug,
      read_at
    `)
    .eq('user_id', userId)
    .order('read_at', { ascending: false });

  if (error) {
    console.error(`Error fetching reading history for user ${userId}:`, error);
    throw error;
  }

  return data || [];
};

export const addToReadingHistory = async (userId: string, articleSlug: string) => {
  const { error } = await supabase
    .from('user_reading_history')
    .upsert({
      user_id: userId,
      article_slug: articleSlug,
      read_at: new Date().toISOString(),
    });

  if (error) {
    console.error(`Error adding article ${articleSlug} to reading history for user ${userId}:`, error);
    throw error;
  }
};

export const getUserCategoryPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_category_preferences')
    .select(`
      category_id,
      categories(*)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error(`Error fetching category preferences for user ${userId}:`, error);
    throw error;
  }

  return data || [];
};

export const updateUserCategoryPreference = async (userId: string, categoryId: number, isPreferred: boolean) => {
  if (isPreferred) {
    // Add category preference
    const { error } = await supabase
      .from('user_category_preferences')
      .upsert({
        user_id: userId,
        category_id: categoryId,
      });

    if (error) {
      console.error(`Error adding category preference ${categoryId} for user ${userId}:`, error);
      throw error;
    }
  } else {
    // Remove category preference
    const { error } = await supabase
      .from('user_category_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('category_id', categoryId);

    if (error) {
      console.error(`Error removing category preference ${categoryId} for user ${userId}:`, error);
      throw error;
    }
  }
};

// Media content (audio/video)
export const getVideoContent = async (limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('video_content')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching video content:', error);
    throw error;
  }

  return data || [];
};

export const getAudioArticles = async (limit = 10, offset = 0) => {
  const { data, error } = await supabase
    .from('audio_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching audio articles:', error);
    throw error;
  }

  return data || [];
};

// Social media integration
export const getSocialMediaPosts = async (limit = 10, platforms?: string[]) => {
  let query = supabase
    .from('social_media_posts')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);
  
  if (platforms && platforms.length > 0) {
    query = query.in('platform', platforms);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching social media posts:', error);
    throw error;
  }

  return data || [];
};