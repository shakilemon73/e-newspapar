// Updated static query client for complete Express replacement
import { QueryClient, type QueryFunction } from '@tanstack/react-query';
import { supabase } from './supabase';
import * as SupabaseAPI from './supabase-api-complete';

// Static query function that routes ALL requests to Supabase
export const getStaticQueryFn: QueryFunction = async ({ queryKey }) => {
  const url = queryKey[0] as string;
  
  // Parse URL and parameters
  const [baseUrl, queryString] = url.split('?');
  const urlParams = new URLSearchParams(queryString || '');
  
  // Route all API calls to Supabase functions
  switch (baseUrl) {
    case '/api/articles':
      const featured = urlParams.get('featured') === 'true';
      const category = urlParams.get('category');
      const limit = parseInt(urlParams.get('limit') || '10');
      const offset = parseInt(urlParams.get('offset') || '0');
      return await SupabaseAPI.getArticles({ featured, category, limit, offset });
      
    case '/api/articles/latest':
      const latestLimit = parseInt(urlParams.get('limit') || '10');
      return await SupabaseAPI.getLatestArticles(latestLimit);
      
    case '/api/articles/popular':
      const popularLimit = parseInt(urlParams.get('limit') || '5');
      return await SupabaseAPI.getPopularArticles(popularLimit);
      
    case '/api/categories':
      return await SupabaseAPI.getCategories();
      
    case '/api/breaking-news':
      return await SupabaseAPI.getBreakingNews();
      
    case '/api/weather':
      return await SupabaseAPI.getWeather();
      
    case '/api/epapers':
      return await SupabaseAPI.getEPapers();
      
    case '/api/epapers/latest':
      return await SupabaseAPI.getLatestEPaper();
      
    case '/api/videos':
      return await SupabaseAPI.getVideos();
      
    case '/api/audio-articles':
      return await SupabaseAPI.getAudioArticles();
      
    case '/api/trending-topics':
      return await SupabaseAPI.getTrendingTopics();
      
    case '/api/settings':
      return await SupabaseAPI.getSiteSettings();
      
    default:
      // Handle parameterized routes
      if (baseUrl.startsWith('/api/articles/search')) {
        const query = urlParams.get('q') || '';
        const limit = parseInt(urlParams.get('limit') || '20');
        const offset = parseInt(urlParams.get('offset') || '0');
        return await SupabaseAPI.searchArticles(query, limit, offset);
      }
      
      if (baseUrl.startsWith('/api/articles/') && !baseUrl.includes('search')) {
        const id = parseInt(baseUrl.split('/').pop() || '0');
        if (id > 0) {
          return await SupabaseAPI.getArticleById(id);
        }
      }
      
      if (baseUrl.startsWith('/api/categories/')) {
        const slug = baseUrl.split('/').pop();
        if (slug) {
          return await SupabaseAPI.getCategoryBySlug(slug);
        }
      }
      
      if (baseUrl.startsWith('/api/videos/')) {
        const slug = baseUrl.split('/').pop();
        if (slug) {
          return await SupabaseAPI.getVideoBySlug(slug);
        }
      }
      
      // Fallback: return empty array or null
      console.warn(`No handler found for: ${url}`);
      return [];
  }
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
        return failureCount < 2; // Reduced retries for faster failures
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
  
  // Route mutation endpoints to Supabase functions
  switch (true) {
    case endpoint === '/api/newsletter' && method === 'POST':
      if (data) {
        return await SupabaseAPI.subscribeToNewsletter((data as any).email);
      }
      break;
      
    case endpoint === '/api/comments' && method === 'POST':
      if (data && user) {
        const { articleId, content, authorName } = data as any;
        return await SupabaseAPI.addComment(articleId, content, authorName);
      }
      break;
      
    case endpoint.includes('/like') && method === 'POST':
      if (user) {
        const articleId = parseInt(endpoint.split('/')[2]);
        return await SupabaseAPI.toggleArticleLike(articleId);
      }
      break;
      
    case endpoint.includes('/view') && method === 'POST':
      const articleId = parseInt(endpoint.split('/')[2]);
      return await SupabaseAPI.incrementArticleViews(articleId);
      
    default:
      throw new Error(`No static handler for ${method} ${endpoint}`);
  }
  
  throw new Error('Authentication required or invalid endpoint');
}