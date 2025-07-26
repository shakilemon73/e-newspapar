/**
 * Static AI Service - Fallback service for when AI APIs are unavailable
 * Provides consistent data structure for AI-enhanced features
 */

export interface AIPopularArticle {
  id: number;
  title: string;
  summary: string;
  category: string;
  ai_sentiment: 'positive' | 'negative' | 'neutral';
  ai_tags: string[];
  ai_reading_time: number;
  view_count?: number;
  created_at: string;
}

export interface AIPopularResponse {
  success: boolean;
  data?: AIPopularArticle[];
  error?: string;
  total: number;
  processed_count: number;
}

class StaticAIService {
  /**
   * Returns static AI-popular articles when AI service is unavailable
   */
  async getStaticPopularArticles(timeRange: 'daily' | 'weekly' | 'monthly' = 'daily', limit: number = 6): Promise<AIPopularResponse> {
    try {
      // Static fallback data with Bengali content
      const staticArticles: AIPopularArticle[] = [
        {
          id: 1,
          title: "বাংলাদেশে প্রযুক্তি খাতের উন্নতি",
          summary: "দেশের প্রযুক্তি খাতে নতুন উদ্যোগ এবং বিনিয়োগের মাধ্যমে উল্লেখযোগ্য অগ্রগতি সাধিত হয়েছে।",
          category: "প্রযুক্তি",
          ai_sentiment: "positive",
          ai_tags: ["প্রযুক্তি", "বিনিয়োগ", "উন্নয়ন"],
          ai_reading_time: 3,
          view_count: 1250,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: "শিক্ষা ব্যবস্থায় ডিজিটাল রূপান্তর",
          summary: "অনলাইন শিক্ষা এবং ডিজিটাল প্রযুক্তির ব্যবহারে শিক্ষা ক্ষেত্রে বিপ্লব ঘটছে।",
          category: "শিক্ষা",
          ai_sentiment: "positive",
          ai_tags: ["শিক্ষা", "ডিজিটাল", "অনলাইন"],
          ai_reading_time: 4,
          view_count: 980,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          title: "স্বাস্থ্য সেবায় AI এর ব্যবহার",
          summary: "কৃত্রিম বুদ্ধিমত্তার ব্যবহারে চিকিৎসা সেবার মান বৃদ্ধি পাচ্ছে।",
          category: "স্বাস্থ্য",
          ai_sentiment: "positive",
          ai_tags: ["স্বাস্থ্য", "AI", "চিকিৎসা"],
          ai_reading_time: 5,
          view_count: 756,
          created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 4,
          title: "পরিবেশ সংরক্ষণে নতুন উদ্যোগ",
          summary: "বায়ু দূষণ কমাতে এবং পরিবেশ রক্ষায় সরকারি ও বেসরকারি নতুন প্রকল্প শুরু।",
          category: "পরিবেশ",
          ai_sentiment: "positive",
          ai_tags: ["পরিবেশ", "সংরক্ষণ", "দূষণ"],
          ai_reading_time: 4,
          view_count: 634,
          created_at: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: 5,
          title: "কৃষি ক্ষেত্রে আধুনিক প্রযুক্তি",
          summary: "স্মার্ট কৃষি এবং প্রযুক্তির ব্যবহারে খাদ্য উৎপাদন বৃদ্ধি পাচ্ছে।",
          category: "কৃষি",
          ai_sentiment: "positive",
          ai_tags: ["কৃষি", "প্রযুক্তি", "উৎপাদন"],
          ai_reading_time: 3,
          view_count: 892,
          created_at: new Date(Date.now() - 345600000).toISOString()
        },
        {
          id: 6,
          title: "যুব উদ্যোক্তাদের সফলতার গল্প",
          summary: "তরুণ প্রজন্মের উদ্যোক্তারা বিভিন্ন ক্ষেত্রে সফলতার নতুন মাত্রা যোগ করছেন।",
          category: "ব্যবসা",
          ai_sentiment: "positive",
          ai_tags: ["উদ্যোক্তা", "সফলতা", "যুব"],
          ai_reading_time: 4,
          view_count: 1123,
          created_at: new Date(Date.now() - 432000000).toISOString()
        }
      ];

      // Filter by time range
      const now = Date.now();
      const timeFilters = {
        daily: 24 * 60 * 60 * 1000,     // 1 day
        weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
        monthly: 30 * 24 * 60 * 60 * 1000 // 30 days
      };

      const timeLimit = timeFilters[timeRange];
      const filteredArticles = staticArticles.filter(article => {
        const articleTime = new Date(article.created_at).getTime();
        return (now - articleTime) <= timeLimit;
      });

      // Sort by view count and limit results
      const sortedArticles = filteredArticles
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, limit);

      return {
        success: true,
        data: sortedArticles,
        total: sortedArticles.length,
        processed_count: staticArticles.length
      };

    } catch (error) {
      console.error('Static AI Service Error:', error);
      return {
        success: false,
        error: 'Failed to load static popular articles',
        total: 0,
        processed_count: 0
      };
    }
  }

  /**
   * Returns mock AI statistics
   */
  async getStaticAIStats() {
    return {
      success: true,
      data: {
        totalArticles: 150,
        processedArticles: 142,
        processingRate: 94.7,
        averageProcessingTime: 2.3,
        lastProcessed: new Date().toISOString()
      }
    };
  }

  /**
   * Mock AI enhancement for articles
   */
  async enhanceArticleContent(content: string) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        summary: content.slice(0, 150) + "...",
        sentiment: "positive" as const,
        tags: ["সংবাদ", "আপডেট", "তথ্য"],
        readingTime: Math.ceil(content.length / 200),
        enhancedContent: content
      }
    };
  }
}

// Export singleton instance
export const staticAIService = new StaticAIService();

// Export types
export type { AIPopularArticle, AIPopularResponse };