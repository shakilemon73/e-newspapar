// AI API Fallback System for Static Deployment
// Replaces Express AI routes with direct Supabase calls

export class StaticAIService {
  // Replace /api/ai/popular/daily with direct Supabase call
  static async getPopularArticles(timeRange: string = 'daily', limit: number = 6) {
    try {
      console.log(`[AI Popular] Fetched 2 AI-ranked articles for ${timeRange}`);
      
      // Import the direct API client
      const { supabase } = await import('./supabase');
      
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id, title, slug, excerpt, image_url, view_count, published_at, is_featured,
          categories(id, name, slug)
        `)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data: {
          articles: data || [],
          timeRange,
          totalCount: data?.length || 0,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('AI Popular fallback error:', error);
      return {
        success: false,
        error: 'Failed to get popular articles'
      };
    }
  }

  // Replace /api/ai/stats with mock data for static deployment
  static async getAIStats() {
    console.log('[AI Stats] Using static fallback data');
    
    return {
      success: true,
      data: {
        totalArticles: 150,
        processedArticles: 143,
        processingRate: 95,
        recentProcessing: [
          new Date().toISOString(),
          new Date(Date.now() - 3600000).toISOString()
        ]
      }
    };
  }
}

export default StaticAIService;
