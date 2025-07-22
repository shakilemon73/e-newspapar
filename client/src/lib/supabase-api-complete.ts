// Complete Supabase API with proper error handling and fallbacks
import { supabase } from './supabase';

// Articles API with proper fallbacks
export async function getArticles(params: {
  limit?: number;
  offset?: number;
  category?: string;
  featured?: boolean;
} = {}) {
  try {
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

    return data?.map(article => ({
      ...article,
      readTime: 5, // Default read time
      imageUrl: article.image_url,
      publishedAt: article.published_at,
      isFeatured: article.is_featured
    })) || [];
  } catch (error) {
    console.error('Articles API error:', error);
    return [];
  }
}

// Popular Articles API with fallbacks
export async function getPopularArticles(limit = 5) {
  try {
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

    return data?.map(article => ({
      ...article,
      readTime: 5,
      imageUrl: article.image_url,
      publishedAt: article.published_at
    })) || [];
  } catch (error) {
    console.error('Popular articles API error:', error);
    return [];
  }
}

// Latest Articles API
export async function getLatestArticles(limit = 10) {
  try {
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

    return data?.map(article => ({
      ...article,
      readTime: 5,
      imageUrl: article.image_url,
      publishedAt: article.published_at
    })) || [];
  } catch (error) {
    console.error('Latest articles API error:', error);
    return [];
  }
}

// Search Articles API
export async function searchArticles(searchQuery: string, limit = 20, offset = 0) {
  try {
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

    return data?.map(article => ({
      ...article,
      readTime: 5,
      imageUrl: article.image_url,
      publishedAt: article.published_at
    })) || [];
  } catch (error) {
    console.error('Search articles API error:', error);
    return [];
  }
}

// Categories API
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Categories API error:', error);
    return [];
  }
}

// Get category by slug
export async function getCategoryBySlug(slug: string) {
  try {
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
  } catch (error) {
    console.error('Category by slug API error:', error);
    return null;
  }
}

// Breaking News API
export async function getBreakingNews() {
  try {
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
  } catch (error) {
    console.error('Breaking news API error:', error);
    return [];
  }
}

// Videos API
export async function getVideos() {
  try {
    const { data, error } = await supabase
      .from('video_content')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Videos API error:', error);
    return [];
  }
}

// Get video by slug
export async function getVideoBySlug(slug: string) {
  try {
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
  } catch (error) {
    console.error('Video by slug API error:', error);
    return null;
  }
}

// E-Papers API
export async function getEPapers() {
  try {
    const { data, error } = await supabase
      .from('epapers')
      .select('*')
      .order('published_date', { ascending: false });

    if (error) {
      console.error('Error fetching e-papers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('E-papers API error:', error);
    return [];
  }
}

// Get latest e-paper
export async function getLatestEPaper() {
  try {
    const { data, error } = await supabase
      .from('epapers')
      .select('*')
      .order('published_date', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest e-paper:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Latest e-paper API error:', error);
    return null;
  }
}

// Audio Articles API
export async function getAudioArticles() {
  try {
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
  } catch (error) {
    console.error('Audio articles API error:', error);
    return [];
  }
}

// Weather API
export async function getWeather() {
  try {
    const { data, error } = await supabase
      .from('weather')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching weather:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Weather API error:', error);
    return [];
  }
}

// Site Settings API
export async function getSiteSettings() {
  try {
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
  } catch (error) {
    console.error('Site settings API error:', error);
    return {
      siteName: "Emon's Daily News",
      siteDescription: "বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র",
      logoUrl: "",
      defaultLanguage: "bn",
      siteUrl: "https://emonsdaily.com"
    };
  }
}

// User interactions with error handling
export async function incrementArticleViews(articleId: number) {
  try {
    const { error } = await supabase.rpc('increment_article_views', {
      article_id: articleId
    });

    if (error) {
      console.error('Error incrementing views:', error);
    }
  } catch (error) {
    console.error('Increment views API error:', error);
  }
}

export async function toggleArticleLike(articleId: number) {
  try {
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
  } catch (error) {
    console.error('Toggle like API error:', error);
    throw error;
  }
}

export async function addComment(articleId: number, content: string, authorName: string) {
  try {
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
  } catch (error) {
    console.error('Add comment API error:', error);
    throw error;
  }
}

export async function subscribeToNewsletter(email: string) {
  try {
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
  } catch (error) {
    console.error('Subscribe newsletter API error:', error);
    throw error;
  }
}