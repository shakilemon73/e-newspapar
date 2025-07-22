// Complete static query client with direct Supabase API calls
import { QueryClient } from '@tanstack/react-query';
import * as SupabaseAPI from './supabase-api-direct';

export const createStaticQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: async ({ queryKey }) => {
          const [endpoint, ...params] = queryKey as string[];
          
          switch (endpoint) {
            case 'categories':
              return SupabaseAPI.getCategories();
            
            case 'category':
              if (params[0]) {
                return SupabaseAPI.getCategoryBySlug(params[0] as string);
              }
              throw new Error('Category slug required');
            
            case 'articles':
              const [limit, category, featured] = params;
              return SupabaseAPI.getArticles({
                limit: limit as number,
                category: category as string,
                featured: featured as boolean
              });
            
            case 'articles/popular':
              return SupabaseAPI.getPopularArticles(params[0] as number || 5);
            
            case 'articles/latest':
              return SupabaseAPI.getLatestArticles(params[0] as number || 10);
            
            case 'articles/featured':
              return SupabaseAPI.getFeaturedArticles(params[0] as number || 5);
            
            case 'article':
              if (params[0]) {
                return SupabaseAPI.getArticleBySlug(params[0] as string);
              }
              throw new Error('Article slug required');
            
            case 'weather':
              if (params[0]) {
                return SupabaseAPI.getWeatherByCity(params[0] as string);
              }
              return SupabaseAPI.getWeather();
            
            case 'breaking-news':
              return SupabaseAPI.getBreakingNews();
            
            case 'epapers':
              return SupabaseAPI.getEPapers();
            
            case 'epapers/latest':
              return SupabaseAPI.getLatestEPaper();
            
            case 'videos':
              return SupabaseAPI.getVideoContent();
            
            case 'video':
              if (params[0]) {
                return SupabaseAPI.getVideoBySlug(params[0] as string);
              }
              throw new Error('Video slug required');
            
            case 'audio-articles':
              return SupabaseAPI.getAudioArticles();
            
            case 'social-media':
              return SupabaseAPI.getSocialMediaPosts();
            
            case 'trending-topics':
              return SupabaseAPI.getTrendingTopics();
            
            case 'search':
              if (params[0]) {
                return SupabaseAPI.searchArticles(params[0] as string, params[1] as number || 20);
              }
              throw new Error('Search query required');
            
            case 'settings':
              return SupabaseAPI.getSiteSettings();
            
            default:
              throw new Error(`Unknown endpoint: ${endpoint}`);
          }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        mutationFn: async ({ mutationType, data }) => {
          switch (mutationType) {
            case 'incrementViewCount':
              return SupabaseAPI.incrementViewCount(data.articleId);
            
            default:
              throw new Error(`Unknown mutation: ${mutationType}`);
          }
        },
      },
    },
  });
};

export const staticQueryClient = createStaticQueryClient();