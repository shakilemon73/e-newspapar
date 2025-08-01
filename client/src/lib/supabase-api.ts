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
      view_count,
      published_at,
      is_featured,
      categories(id, name, slug)
    `)
    .eq('is_published', true)
    .eq('status', 'published')
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
    // Return empty array instead of throwing to prevent crashes
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
      view_count,
      published_at,
      is_featured,
      categories(id, name, slug)
    `)
    .eq('id', id)
    .eq('is_published', true)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    throw new Error('Article not found');
  }

  return data;
}

// Get latest articles
export async function getLatestArticles(limit = 10) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      image_url,
      view_count,
      published_at,
      is_featured,
      categories(id, name, slug)
    `)
    .eq('is_published', true)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }

  return data || [];
}

// Popular Articles API - Use Express API instead of direct Supabase call
export async function getPopularArticles(limit = 5) {
  try {
    const response = await fetch(`/api/articles/popular?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching popular articles:', error);
    return [];
  }
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
    // Return fallback weather data
    return {
      city: 'ঢাকা',
      temperature: 25,
      condition: 'পরিষ্কার',
      icon: '☀️'
    };
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
    return [];
  }

  return data || [];
}

// Get latest e-paper
export async function getLatestEPaper() {
  try {
    const { data, error } = await supabase
      .from('epapers')
      .select('*')
      .eq('is_latest', true)
      .single();

    if (error) {
      console.error('Error fetching latest e-paper:', error);
      // Try to get the most recent e-paper instead
      const { data: latestData, error: latestError } = await supabase
        .from('epapers')
        .select('*')
        .order('publish_date', { ascending: false })
        .limit(1)
        .single();
      
      if (latestError) {
        return null;
      }
      return latestData;
    }

    return data;
  } catch (err) {
    console.error('Error in getLatestEPaper:', err);
    return null;
  }
}

// Videos API
export async function getVideos(limit = 10) {
  const { data, error } = await supabase
    .from('video_content')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }

  return data || [];
}

// Audio Articles API
export async function getAudioArticles(limit = 10) {
  const { data, error } = await supabase
    .from('audio_articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audio articles:', error);
    return [];
  }

  return data || [];
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
    return [];
  }

  return data || [];
}

// Site Settings API
export async function getSiteSettings() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching site settings:', error);
      // Return fallback settings when table doesn't exist or no data
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
  } catch (err) {
    console.error('Error in getSiteSettings:', err);
    return {
      siteName: "Emon's Daily News",
      siteDescription: "বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র",
      logoUrl: "",
      defaultLanguage: "bn",
      siteUrl: "https://emonsdaily.com"
    };
  }
}

// Newsletter subscription
export async function subscribeToNewsletter(email: string) {
  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .insert([{ email }])
    .select()
    .single();

  if (error) {
    console.error('Error subscribing to newsletter:', error);
    throw new Error('Failed to subscribe to newsletter');
  }

  return data;
}

// Comments API
export async function addComment(articleId: number, content: string, authorName: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      article_id: articleId,
      content,
      author_name: authorName,
      is_approved: false
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }

  return data;
}

// Article likes API
export async function toggleArticleLike(articleId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to like articles');
  }

  // Check if user already liked this article
  const { data: existingLike } = await supabase
    .from('user_likes')
    .select('*')
    .eq('article_id', articleId)
    .eq('user_id', user.id)
    .single();

  if (existingLike) {
    // Remove like
    const { error } = await supabase
      .from('user_likes')
      .delete()
      .eq('article_id', articleId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error removing like:', error);
      throw new Error('Failed to remove like');
    }

    return { liked: false };
  } else {
    // Add like
    const { error } = await supabase
      .from('user_likes')
      .insert([{
        article_id: articleId,
        user_id: user.id
      }]);

    if (error) {
      console.error('Error adding like:', error);
      throw new Error('Failed to add like');
    }

    return { liked: true };
  }
}

// Search articles
export async function searchArticles(query: string, limit = 20) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      image_url,
      view_count,
      published_at,
      categories(id, name, slug)
    `)
    .textSearch('title', query)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching articles:', error);
    return [];
  }

  return data || [];
}

// Social Media Posts API - Use Express API instead of direct Supabase call
export async function getSocialMediaPosts(platform?: string) {
  try {
    let url = '/api/social-media-posts';
    if (platform) {
      url += `?platform=${encodeURIComponent(platform)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching social media posts:', error);
    
    // Return mock data as fallback
    const mockData = [
      {
        id: 1,
        platform: 'facebook',
        content: 'সর্বশেষ খবর: বাংলাদেশে নতুন উন্নয়ন প্রকল্প শুরু',
        embed_code: '<div>Facebook embed placeholder</div>',
        published_at: new Date().toISOString()
      },
      {
        id: 2,
        platform: 'twitter',
        content: 'ব্রেকিং: আজকের গুরুত্বপূর্ণ সংবাদ',
        embed_code: '<div>Twitter embed placeholder</div>',
        published_at: new Date().toISOString()
      },
      {
        id: 3,
        platform: 'instagram',
        content: 'আজকের বিশেষ মুহূর্তের ছবি',
        embed_code: '<div>Instagram embed placeholder</div>',
        published_at: new Date().toISOString()
      }
    ];

    if (platform) {
      return mockData.filter(post => post.platform === platform);
    }

    return mockData;
  }
}