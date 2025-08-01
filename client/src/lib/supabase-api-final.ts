// Final complete Supabase API - removes all read_time column references
import { supabase } from './supabase';

// Articles API with correct column mapping
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

  return data?.map(article => ({
    ...article,
    readTime: 5, // Default read time since column doesn't exist
    imageUrl: article.image_url,
    publishedAt: article.published_at,
    isFeatured: article.is_featured
  })) || [];
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

  return data?.map(article => ({
    ...article,
    readTime: 5,
    imageUrl: article.image_url,
    publishedAt: article.published_at
  })) || [];
}

// Popular Articles API - Fixed column mapping
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

  return data?.map(article => ({
    ...article,
    readTime: 5,
    imageUrl: article.image_url,
    publishedAt: article.published_at
  })) || [];
}

// Latest Articles API - Fixed column mapping + DRAFT FILTER
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
    .eq('is_published', true)
    .eq('status', 'published')
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
}

// Export all other functions from the previous API
export {
  getArticleById,
  getCategoryBySlug,
  getCategories,
  getBreakingNews,
  getWeather,
  getVideos,
  getVideoBySlug,
  getAudioArticles,
  getEPapers,
  getLatestEPaper,
  getSocialMediaPosts,
  getTrendingTopics,
  getSiteSettings,
  incrementArticleViews,
  toggleArticleLike,
  addComment,
  subscribeToNewsletter
} from './supabase-api-fixed';