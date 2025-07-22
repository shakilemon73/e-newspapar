// Static query client for static site deployment - uses Supabase directly
import { QueryClient, type QueryFunction } from '@tanstack/react-query';
import { supabase } from './supabase';
import { 
  getArticles, 
  getLatestArticles, 
  getPopularArticles, 
  getCategories, 
  getBreakingNews,
  getWeather,
  getEPapers,
  getVideos,
  getAudioArticles,
  getTrendingTopics,
  getSiteSettings
} from './supabase-api';

// Map of static query functions - no server API calls
const staticQueryMap: Record<string, () => Promise<any>> = {
  '/api/articles': () => getArticles(),
  '/api/articles/latest': () => getLatestArticles(),
  '/api/articles/popular': () => getPopularArticles(),
  '/api/categories': () => getCategories(),
  '/api/breaking-news': () => getBreakingNews(),
  '/api/weather': () => getWeather(),
  '/api/epapers': () => getEPapers(),
  '/api/videos': () => getVideos(),
  '/api/audio-articles': () => getAudioArticles(),
  '/api/trending-topics': () => getTrendingTopics(),
  '/api/settings': () => getSiteSettings(),
};

// Static query function that routes to Supabase
export const getStaticQueryFn: QueryFunction = async ({ queryKey }) => {
  const url = queryKey[0] as string;
  
  // Remove query parameters for mapping
  const baseUrl = url.split('?')[0];
  
  // Check if we have a static handler for this endpoint
  if (staticQueryMap[baseUrl]) {
    return await staticQueryMap[baseUrl]();
  }
  
  // Handle parameterized routes
  if (baseUrl.startsWith('/api/articles/') && baseUrl !== '/api/articles/latest' && baseUrl !== '/api/articles/popular') {
    // Handle individual article requests
    const id = parseInt(baseUrl.split('/').pop() || '0');
    if (id > 0) {
      const { getArticleById } = await import('./supabase-api');
      return await getArticleById(id);
    }
  }
  
  if (baseUrl.startsWith('/api/categories/')) {
    // Handle category-specific requests
    const categorySlug = baseUrl.split('/').pop();
    if (categorySlug) {
      const { getCategoryBySlug } = await import('./supabase-api');
      return await getCategoryBySlug(categorySlug);
    }
  }
  
  // Fallback: try to use URL parameters to determine the query
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  
  if (baseUrl === '/api/articles') {
    const featured = urlParams.get('featured') === 'true';
    const category = urlParams.get('category');
    const limit = parseInt(urlParams.get('limit') || '10');
    const offset = parseInt(urlParams.get('offset') || '0');
    
    return await getArticles({ featured, category, limit, offset });
  }
  
  // If no handler found, throw error
  throw new Error(`No static handler found for: ${url}`);
};

// Create static query client
export const staticQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getStaticQueryFn,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on client-side errors
        if (error instanceof Error && error.message.includes('No static handler')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// API request helper for mutations (using Supabase directly)
export async function staticApiRequest(
  method: string,
  endpoint: string,
  data?: unknown
): Promise<any> {
  // Get current user for authenticated requests
  const { data: { user } } = await supabase.auth.getUser();
  
  // Handle specific endpoints with direct Supabase calls
  switch (endpoint) {
    case '/api/newsletter':
      if (method === 'POST' && data) {
        const { subscribeToNewsletter } = await import('./supabase-api');
        return await subscribeToNewsletter((data as any).email);
      }
      break;
      
    case '/api/comments':
      if (method === 'POST' && data && user) {
        const { addComment } = await import('./supabase-api');
        const { articleId, content, authorName } = data as any;
        return await addComment(articleId, content, authorName);
      }
      break;
      
    default:
      if (endpoint.includes('/like')) {
        if (method === 'POST' && user) {
          const articleId = parseInt(endpoint.split('/')[2]);
          const { toggleArticleLike } = await import('./supabase-api');
          return await toggleArticleLike(articleId);
        }
      }
      
      if (endpoint.includes('/view')) {
        if (method === 'POST') {
          const articleId = parseInt(endpoint.split('/')[2]);
          const { incrementArticleViews } = await import('./supabase-api');
          return await incrementArticleViews(articleId);
        }
      }
  }
  
  throw new Error(`No static handler for ${method} ${endpoint}`);
}