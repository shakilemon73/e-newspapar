/**
 * Frontend AI API Client for Bengali News Website
 * Communicates with backend Supabase-integrated AI services
 */

// API request helper
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

export interface AIAnalysisResult {
  summary?: string;
  sentiment?: {
    label: string;
    score: number;
    confidence: number;
  };
  tags?: string[];
  readingTime?: number;
  complexity?: 'সহজ' | 'মাধ্যম' | 'কঠিন';
  topics?: string[];
}

export interface AIProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * AI API Client Class
 */
class AIApiClient {
  
  /**
   * Process article with comprehensive AI analysis
   */
  async processArticle(articleId: number): Promise<AIProcessingResult> {
    try {
      const response = await apiRequest(`/api/ai/process-article/${articleId}`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('AI process article error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Batch process multiple articles
   */
  async batchProcessArticles(limit: number = 10): Promise<AIProcessingResult> {
    try {
      const response = await apiRequest('/api/ai/batch-process', {
        method: 'POST',
        body: JSON.stringify({ limit })
      });
      return response;
    } catch (error) {
      console.error('AI batch process error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get AI analysis for article
   */
  async getArticleAnalysis(articleId: number): Promise<AIProcessingResult> {
    try {
      const response = await apiRequest(`/api/ai/analysis/${articleId}`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('AI get analysis error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Generate summary for text
   */
  async generateSummary(text: string, articleId?: number): Promise<AIProcessingResult> {
    try {
      const response = await apiRequest('/api/ai/summarize', {
        method: 'POST',
        body: JSON.stringify({ text, articleId })
      });
      return response;
    } catch (error) {
      console.error('AI summarize error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text: string): Promise<AIProcessingResult> {
    try {
      const response = await apiRequest('/api/ai/sentiment', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      return response;
    } catch (error) {
      console.error('AI sentiment error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Generate tags for content
   */
  async generateTags(content: string, title?: string): Promise<AIProcessingResult> {
    try {
      const response = await apiRequest('/api/ai/generate-tags', {
        method: 'POST',
        body: JSON.stringify({ content, title })
      });
      return response;
    } catch (error) {
      console.error('AI generate tags error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get AI statistics
   */
  async getAIStats(): Promise<AIProcessingResult> {
    try {
      const response = await apiRequest('/api/ai/stats', {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('AI stats error:', error);
      return { success: false, error: String(error) };
    }
  }
}

// Export singleton instance
export const aiApiClient = new AIApiClient();

// Hook for React Query integration
export const useAIQueries = () => {
  return {
    processArticle: (articleId: number) => 
      aiApiClient.processArticle(articleId),
    
    getAnalysis: (articleId: number) => 
      aiApiClient.getArticleAnalysis(articleId),
    
    generateSummary: (text: string, articleId?: number) => 
      aiApiClient.generateSummary(text, articleId),
    
    analyzeSentiment: (text: string) => 
      aiApiClient.analyzeSentiment(text),
    
    generateTags: (content: string, title?: string) => 
      aiApiClient.generateTags(content, title),
    
    getStats: () => 
      aiApiClient.getAIStats()
  };
};