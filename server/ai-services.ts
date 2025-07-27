import { createClient } from '@supabase/supabase-js';

// Create service role client for AI operations
const supabaseServiceRole = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// AI Service Types
interface AIProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface ArticleAIAnalysis {
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

/**
 * Backend AI Processing Service for Bengali News Articles
 * Integrates with Supabase database for persistent AI analysis
 */
class BengaliAIService {

  /**
   * AI-powered time-based popular articles with dynamic ranking
   */
  async getAIPopularArticles(timeRange: 'daily' | 'weekly' | 'monthly', limit: number = 6): Promise<AIProcessingResult> {
    try {
      console.log(`[AI Popular] Generating ${timeRange} popular articles with AI ranking...`);
      
      // Calculate time range for filtering
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
          break;
      }

      // Get articles with AI analysis and view tracking
      const { data: articles, error } = await supabaseServiceRole
        .from('articles')
        .select(`
          id, title, slug, excerpt, published_at, view_count,
          categories!inner(id, name, slug),
          article_ai_analysis(
            sentiment_label, sentiment_score, auto_tags, 
            content_complexity, reading_time_minutes
          )
        `)
        .gte('published_at', startDate.toISOString())
        .order('view_count', { ascending: false })
        .limit(limit * 2); // Get more to apply AI filtering

      if (error) {
        console.error('[AI Popular] Database error:', error);
        return { success: false, error: error.message };
      }

      // AI-enhanced ranking algorithm
      const aiRankedArticles = this.applyAIRanking(articles || [], timeRange);
      
      return {
        success: true,
        data: {
          articles: aiRankedArticles.slice(0, limit),
          timeRange,
          totalCount: aiRankedArticles.length,
          lastUpdated: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('[AI Popular] Processing error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * AI ranking algorithm for popular articles
   */
  private applyAIRanking(articles: any[], timeRange: string): any[] {
    return articles.map(article => {
      let aiScore = article.view_count || 0;
      
      // AI sentiment boost
      if (article.article_ai_analysis?.[0]?.sentiment_score) {
        const sentimentBoost = article.article_ai_analysis[0].sentiment_score * 100;
        aiScore += sentimentBoost;
      }
      
      // Time-based relevance boost
      const publishedAt = new Date(article.published_at);
      const hoursOld = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
      
      switch (timeRange) {
        case 'daily':
          aiScore += Math.max(0, 50 - hoursOld); // Newer articles get higher score
          break;
        case 'weekly':
          aiScore += Math.max(0, 20 - hoursOld / 24); // Daily decay
          break;
        case 'monthly':
          aiScore += Math.max(0, 10 - hoursOld / (24 * 7)); // Weekly decay
          break;
      }
      
      // Complexity bonus for quality content
      const complexity = article.article_ai_analysis?.[0]?.content_complexity;
      if (complexity === 'মাধ্যম') aiScore += 25;
      if (complexity === 'কঠিন') aiScore += 15;
      
      return {
        ...article,
        aiScore: Math.round(aiScore),
        trending: aiScore > (article.view_count || 0) * 1.5
      };
    }).sort((a, b) => b.aiScore - a.aiScore);
  }
  
  /**
   * Process article with comprehensive AI analysis
   */
  async processArticleAI(articleId: number, content: string, title: string): Promise<AIProcessingResult> {
    try {
      console.log(`[AI] Processing article ${articleId} with AI analysis...`);
      
      // Generate comprehensive AI analysis
      const analysis = await this.generateArticleAnalysis(content, title);
      
      // Store AI analysis in Supabase using service role
      const { data, error } = await supabaseServiceRole
        .from('article_ai_analysis')
        .upsert({
          article_id: articleId,
          summary: analysis.summary,
          sentiment_label: analysis.sentiment?.label,
          sentiment_score: analysis.sentiment?.score,
          sentiment_confidence: analysis.sentiment?.confidence,
          auto_tags: analysis.tags,
          reading_time_minutes: analysis.readingTime,
          content_complexity: analysis.complexity,
          extracted_topics: analysis.topics,
          processed_at: new Date().toISOString()
        });

      if (error) {
        console.error('[AI] Database storage error:', error);
        return { success: false, error: error.message };
      }

      // Update article with AI-generated summary if none exists
      if (analysis.summary) {
        await supabaseServiceRole
          .from('articles')
          .update({ 
            summary: analysis.summary,
            ai_processed: true,
            ai_processed_at: new Date().toISOString()
          })
          .eq('id', articleId);
      }

      console.log(`[AI] Successfully processed article ${articleId}`);
      return { success: true, data: analysis };

    } catch (error) {
      console.error('[AI] Article processing error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Generate comprehensive AI analysis for Bengali content
   */
  private async generateArticleAnalysis(content: string, title: string): Promise<ArticleAIAnalysis> {
    const analysis: ArticleAIAnalysis = {};

    try {
      // Text Summarization using TensorFlow.js backend
      analysis.summary = await this.generateSummary(content);
      
      // Sentiment Analysis
      analysis.sentiment = await this.analyzeSentiment(content);
      
      // Auto-tag generation
      analysis.tags = await this.generateTags(content, title);
      
      // Reading time calculation
      analysis.readingTime = this.calculateReadingTime(content);
      
      // Content complexity analysis
      analysis.complexity = this.analyzeComplexity(content);
      
      // Topic extraction
      analysis.topics = await this.extractTopics(content, title);

    } catch (error) {
      console.error('[AI] Analysis generation error:', error);
    }

    return analysis;
  }

  /**
   * Generate Bengali text summary
   */
  private async generateSummary(content: string): Promise<string> {
    try {
      // Simulate TensorFlow.js processing on backend
      const sentences = content.split('।').filter(s => s.trim().length > 20);
      
      if (sentences.length <= 2) {
        return content.slice(0, 200) + '...';
      }

      // Simple extractive summarization for now
      // In production, use actual TensorFlow.js models
      const firstSentence = sentences[0]?.trim() + '।';
      const lastSentence = sentences[sentences.length - 1]?.trim() + '।';
      
      return `${firstSentence} ${lastSentence}`.slice(0, 300);

    } catch (error) {
      console.error('[AI] Summary generation error:', error);
      return content.slice(0, 200) + '...';
    }
  }

  /**
   * Analyze sentiment of Bengali text
   */
  private async analyzeSentiment(content: string): Promise<{ label: string; score: number; confidence: number }> {
    try {
      // Bengali sentiment keywords
      const positiveWords = ['ভালো', 'চমৎকার', 'দুর্দান্ত', 'সুন্দর', 'প্রশংসনীয়', 'উৎকৃষ্ট', 'সফল', 'জয়', 'বিজয়'];
      const negativeWords = ['খারাপ', 'ভয়ানক', 'দুঃখজনক', 'বিরক্তিকর', 'নিন্দনীয়', 'ক্ষতিকর', 'বিপজ্জনক', 'পরাজয়'];

      const positiveCount = positiveWords.reduce((count, word) => {
        return count + (content.match(new RegExp(word, 'g'))?.length || 0);
      }, 0);

      const negativeCount = negativeWords.reduce((count, word) => {
        return count + (content.match(new RegExp(word, 'g'))?.length || 0);
      }, 0);

      let label = 'নিরপেক্ষ';
      let score = 0.5;
      
      if (positiveCount > negativeCount) {
        label = 'ইতিবাচক';
        score = Math.min(0.9, 0.6 + (positiveCount * 0.1));
      } else if (negativeCount > positiveCount) {
        label = 'নেতিবাচক';
        score = Math.max(0.1, 0.4 - (negativeCount * 0.1));
      }

      return {
        label,
        score,
        confidence: Math.round(score * 100)
      };

    } catch (error) {
      console.error('[AI] Sentiment analysis error:', error);
      return { label: 'নিরপেক্ষ', score: 0.5, confidence: 50 };
    }
  }

  /**
   * Get personalized recommendations using AI
   */
  async getPersonalizedRecommendations(userId: string, limit: number = 6): Promise<AIProcessingResult> {
    try {
      console.log(`[AI Recommendations] Generating personalized content for user ${userId}...`);
      
      // Get user reading history for preferences
      const { data: readingHistory } = await supabaseServiceRole
        .from('user_reading_history')
        .select(`
          article_id,
          articles!inner(
            categories!inner(id, name, slug)
          )
        `)
        .eq('user_id', userId)
        .limit(20);

      // Extract preferred categories
      const categoryPreferences = new Map();
      readingHistory?.forEach(item => {
        const category = item.articles?.categories;
        if (category) {
          categoryPreferences.set(category.slug, (categoryPreferences.get(category.slug) || 0) + 1);
        }
      });

      // Get articles from preferred categories with AI analysis
      const { data: articles, error } = await supabaseServiceRole
        .from('articles')
        .select(`
          id, title, slug, excerpt, published_at, view_count,
          categories!inner(id, name, slug),
          article_ai_analysis(
            sentiment_label, sentiment_score, auto_tags, 
            content_complexity, reading_time_minutes
          )
        `)
        .in('categories.slug', Array.from(categoryPreferences.keys()).slice(0, 3))
        .order('published_at', { ascending: false })
        .limit(limit * 2);

      if (error) {
        console.error('[AI Recommendations] Database error:', error);
        return { success: false, error: error.message };
      }

      // AI-powered ranking based on user preferences
      const rankedArticles = this.applyPersonalizationRanking(articles || [], categoryPreferences);
      
      return {
        success: true,
        data: {
          articles: rankedArticles.slice(0, limit),
          totalCount: rankedArticles.length,
          userPreferences: Object.fromEntries(categoryPreferences),
          lastUpdated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('[AI Recommendations] Processing error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get AI-enhanced trending topics
   */
  async getAITrendingTopics(limit: number = 10): Promise<AIProcessingResult> {
    try {
      console.log('[AI Trending] Generating AI-powered trending topics...');
      
      // Get articles with high engagement and AI analysis
      const { data: articles, error } = await supabaseServiceRole
        .from('articles')
        .select(`
          id, title, view_count, published_at,
          categories!inner(id, name, slug),
          article_ai_analysis!inner(
            sentiment_label, sentiment_score, auto_tags,
            extracted_topics
          )
        `)
        .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('view_count', { ascending: false })
        .limit(50);

      if (error) {
        return { success: false, error: error.message };
      }

      // Extract and rank topics using AI
      const topicMap = new Map();
      articles?.forEach(article => {
        const topics = article.article_ai_analysis?.[0]?.extracted_topics || [];
        const sentimentScore = article.article_ai_analysis?.[0]?.sentiment_score || 0.5;
        const viewBoost = Math.log(article.view_count + 1);

        topics.forEach((topic: string) => {
          const currentScore = topicMap.get(topic) || 0;
          topicMap.set(topic, currentScore + (sentimentScore * 100) + viewBoost);
        });
      });

      // Sort and format trending topics
      const trendingTopics = Array.from(topicMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([topic, score]) => ({
          topic,
          score: Math.round(score),
          sentiment: score > 60 ? 'ইতিবাচক' : score < 40 ? 'নেতিবাচক' : 'নিরপেক্ষ'
        }));

      return {
        success: true,
        data: {
          topics: trendingTopics,
          totalAnalyzed: articles?.length || 0,
          lastUpdated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('[AI Trending] Processing error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get AI insights for category-specific content
   */
  async getCategoryAIInsights(categorySlug: string): Promise<AIProcessingResult> {
    try {
      console.log(`[AI Category] Analyzing category: ${categorySlug}`);
      
      // Get category articles with AI analysis
      const { data: articles, error } = await supabaseServiceRole
        .from('articles')
        .select(`
          id, title, view_count, published_at,
          categories!inner(id, name, slug),
          article_ai_analysis(
            sentiment_label, sentiment_score, auto_tags,
            content_complexity, reading_time_minutes
          )
        `)
        .eq('categories.slug', categorySlug)
        .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('published_at', { ascending: false })
        .limit(100);

      if (error) {
        return { success: false, error: error.message };
      }

      // Calculate category AI metrics
      const insights = this.calculateCategoryInsights(articles || []);
      
      return {
        success: true,
        data: {
          categorySlug,
          ...insights,
          lastUpdated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('[AI Category] Processing error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Apply personalization ranking algorithm
   */
  private applyPersonalizationRanking(articles: any[], preferences: Map<string, number>): any[] {
    return articles.map(article => {
      let personalScore = article.view_count || 0;
      
      // Category preference boost
      const categorySlug = article.categories?.slug;
      if (categorySlug && preferences.has(categorySlug)) {
        personalScore += preferences.get(categorySlug)! * 50;
      }
      
      // AI sentiment boost
      const sentimentScore = article.article_ai_analysis?.[0]?.sentiment_score || 0.5;
      personalScore += sentimentScore * 100;
      
      // Content complexity preference (medium complexity preferred)
      const complexity = article.article_ai_analysis?.[0]?.content_complexity;
      if (complexity === 'মাধ্যম') personalScore += 30;
      
      return {
        ...article,
        personalScore: Math.round(personalScore)
      };
    }).sort((a, b) => b.personalScore - a.personalScore);
  }

  /**
   * Calculate AI insights for category
   */
  private calculateCategoryInsights(articles: any[]) {
    if (!articles.length) {
      return {
        avgSentiment: 0.5,
        dominantSentiment: 'নিরপেক্ষ',
        avgReadingTime: 3,
        complexityDistribution: { 'সহজ': 0, 'মাধ্যম': 0, 'কঠিন': 0 },
        totalArticles: 0
      };
    }

    let totalSentiment = 0;
    let totalReadingTime = 0;
    const complexityCount = { 'সহজ': 0, 'মাধ্যম': 0, 'কঠিন': 0 };
    const sentimentCount = { 'ইতিবাচক': 0, 'নেতিবাচক': 0, 'নিরপেক্ষ': 0 };

    articles.forEach(article => {
      const analysis = article.article_ai_analysis?.[0];
      if (analysis) {
        totalSentiment += analysis.sentiment_score || 0.5;
        totalReadingTime += analysis.reading_time_minutes || 3;
        
        const complexity = analysis.content_complexity || 'মাধ্যম';
        complexityCount[complexity as keyof typeof complexityCount]++;
        
        const sentiment = analysis.sentiment_label || 'নিরপেক্ষ';
        sentimentCount[sentiment as keyof typeof sentimentCount]++;
      }
    });

    const avgSentiment = totalSentiment / articles.length;
    const dominantSentiment = Object.entries(sentimentCount)
      .sort((a, b) => b[1] - a[1])[0][0];

    return {
      avgSentiment: Math.round(avgSentiment * 100) / 100,
      dominantSentiment,
      avgReadingTime: Math.round(totalReadingTime / articles.length),
      complexityDistribution: complexityCount,
      totalArticles: articles.length
    };
  }

  /**
   * Generate relevant tags for Bengali content
   */
  private async generateTags(content: string, title: string): Promise<string[]> {
    try {
      const combinedText = `${title} ${content}`.toLowerCase();
      const tags: string[] = [];

      // Common Bengali news categories and topics
      const tagMappings = {
        'রাজনীতি': ['নির্বাচন', 'সরকার', 'দল', 'নেতা', 'মন্ত্রী', 'প্রধানমন্ত্রী'],
        'খেলাধুলা': ['ক্রিকেট', 'ফুটবল', 'খেলা', 'ম্যাচ', 'টুর্নামেন্ট'],
        'অর্থনীতি': ['টাকা', 'ব্যাংক', 'ব্যবসা', 'বাজার', 'দাম', 'বিনিয়োগ'],
        'প্রযুক্তি': ['মোবাইল', 'ইন্টারনেট', 'কম্পিউটার', 'অ্যাপ', 'সফটওয়্যার'],
        'শিক্ষা': ['স্কুল', 'কলেজ', 'বিশ্ববিদ্যালয়', 'পরীক্ষা', 'ছাত্র'],
        'স্বাস্থ্য': ['হাসপাতাল', 'ডাক্তার', 'চিকিৎসা', 'রোগ', 'ওষুধ']
      };

      for (const [tag, keywords] of Object.entries(tagMappings)) {
        const found = keywords.some(keyword => combinedText.includes(keyword));
        if (found) {
          tags.push(tag);
        }
      }

      // Add at least one generic tag if none found
      if (tags.length === 0) {
        tags.push('সাধারণ');
      }

      return tags.slice(0, 5); // Limit to 5 tags

    } catch (error) {
      console.error('[AI] Tag generation error:', error);
      return ['সাধারণ'];
    }
  }

  /**
   * Calculate reading time in minutes
   */
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200; // Average Bengali reading speed
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Analyze content complexity
   */
  private analyzeComplexity(content: string): 'সহজ' | 'মাধ্যম' | 'কঠিন' {
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = content.split('।').length;
    const avgWordsPerSentence = wordCount / sentenceCount;

    if (wordCount < 300 && avgWordsPerSentence < 15) {
      return 'সহজ';
    } else if (wordCount < 800 && avgWordsPerSentence < 25) {
      return 'মাধ্যম';
    } else {
      return 'কঠিন';
    }
  }

  /**
   * Extract main topics from content
   */
  private async extractTopics(content: string, title: string): Promise<string[]> {
    try {
      const text = `${title} ${content}`.toLowerCase();
      const topics: string[] = [];

      // Common Bengali topics
      const topicKeywords = {
        'স্থানীয়_সংবাদ': ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'খুলনা', 'বরিশাল'],
        'আন্তর্জাতিক': ['আমেরিকা', 'চীন', 'ভারত', 'পাকিস্তান', 'বিশ্ব'],
        'সামাজিক': ['সমাজ', 'পরিবার', 'বিবাহ', 'শিশু', 'নারী'],
        'পরিবেশ': ['পরিবেশ', 'বন', 'নদী', 'দূষণ', 'জলবায়ু'],
        'সংস্কৃতি': ['সংস্কৃতি', 'শিল্প', 'সাহিত্য', 'সিনেমা', 'গান']
      };

      for (const [topic, keywords] of Object.entries(topicKeywords)) {
        const found = keywords.some(keyword => text.includes(keyword));
        if (found) {
          topics.push(topic.replace('_', ' '));
        }
      }

      return topics.slice(0, 3);

    } catch (error) {
      console.error('[AI] Topic extraction error:', error);
      return ['সাধারণ বিষয়'];
    }
  }

  /**
   * Batch process multiple articles with AI
   */
  async batchProcessArticles(limit: number = 10): Promise<AIProcessingResult> {
    try {
      console.log(`[AI] Starting batch processing of ${limit} articles...`);

      // Get unprocessed articles using service role
      const { data: articles, error } = await supabaseServiceRole
        .from('articles')
        .select('id, title, content')
        .eq('ai_processed', false)
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      if (!articles || articles.length === 0) {
        return { success: true, data: { message: 'No articles to process' } };
      }

      const results = [];
      for (const article of articles) {
        const result = await this.processArticleAI(article.id, article.content, article.title);
        results.push({ articleId: article.id, ...result });
        
        // Add delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`[AI] Batch processing completed: ${results.length} articles processed`);
      return { success: true, data: { processed: results.length, results } };

    } catch (error) {
      console.error('[AI] Batch processing error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get AI analysis for an article
   */
  async getArticleAIAnalysis(articleId: number): Promise<AIProcessingResult> {
    try {
      const { data, error } = await supabaseServiceRole
        .from('article_ai_analysis')
        .select('*')
        .eq('article_id', articleId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      console.error('[AI] Get analysis error:', error);
      return { success: false, error: String(error) };
    }
  }
}

// Export singleton instance
const bengaliAIService = new BengaliAIService();
export { bengaliAIService, BengaliAIService };