// ========================================
// ADVANCED ALGORITHMS (Direct Supabase - No Express)
// Replacing advanced-algorithms.js with direct Supabase calls
// ========================================

import { supabase } from './supabase';

export interface PersonalizedRecommendation {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  published_at: string;
  relevance_score: number;
  category_name: string;
}

export interface UserAnalytics {
  totalReads: number;
  readingStreak: number;
  favoriteCategories: string[];
  readingTime: number;
  engagementScore: number;
}

export interface TrendingTopic {
  id: number;
  name: string;
  slug: string;
  score: number;
  article_count: number;
  growth_rate: number;
}

class DirectAdvancedAlgorithms {
  // ========================================
  // 1. PERSONALIZED RECOMMENDATIONS
  // ========================================
  
  async getPersonalizedRecommendations(userId?: string, limit = 10): Promise<PersonalizedRecommendation[]> {
    try {
      if (!userId) {
        // Return popular articles for anonymous users
        return await this.getPopularArticles(limit);
      }

      // Get user's reading history to understand preferences
      const { data: readingHistory } = await supabase
        .from('user_reading_history')
        .select('article_id, categories!inner(id, name)')
        .eq('user_id', userId)
        .limit(50);

      // Get user's favorite categories based on reading history
      const categoryPreferences = this.analyzeCategoryPreferences(readingHistory || []);
      
      // Get recommended articles based on preferences
      const { data: recommendations } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          view_count,
          categories (
            id,
            name,
            slug
          )
        `)
        .in('category_id', categoryPreferences.map(cat => cat.categoryId))
        .order('view_count', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(limit);

      // Calculate relevance scores and format response
      return (recommendations || []).map((article, index) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        image_url: article.image_url || '',
        published_at: article.published_at,
        relevance_score: this.calculateRelevanceScore(article, categoryPreferences),
        category_name: (article.categories as any)?.name || 'সাধারণ',
      }));

    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      // Fallback to popular articles
      return await this.getPopularArticles(limit);
    }
  }

  private analyzeCategoryPreferences(readingHistory: any[]) {
    const categoryCount: Record<number, { count: number; categoryId: number }> = {};
    
    readingHistory.forEach(item => {
      const categoryId = item.categories?.id;
      if (categoryId) {
        categoryCount[categoryId] = {
          categoryId,
          count: (categoryCount[categoryId]?.count || 0) + 1
        };
      }
    });

    return Object.values(categoryCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 preferred categories
  }

  private calculateRelevanceScore(article: any, categoryPreferences: any[]): number {
    let score = 0;
    
    // Category preference score (0-50)
    const categoryMatch = categoryPreferences.find(pref => pref.categoryId === article.category_id);
    if (categoryMatch) {
      score += Math.min(categoryMatch.count * 10, 50);
    }
    
    // Popularity score (0-30)
    const viewCount = article.view_count || 0;
    score += Math.min(viewCount / 100, 30);
    
    // Recency score (0-20)
    const publishedDate = new Date(article.published_at);
    const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(20 - daysSincePublished, 0);
    
    return Math.round(score);
  }

  // ========================================
  // 2. POPULAR ARTICLES ALGORITHM
  // ========================================

  async getPopularArticles(limit = 10, timeRange = 'all'): Promise<PersonalizedRecommendation[]> {
    try {
      let query = supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          view_count,
          categories (
            id,
            name,
            slug
          )
        `);

      // Apply time range filter
      if (timeRange !== 'all') {
        const dateFilter = this.getDateFilter(timeRange);
        query = query.gte('published_at', dateFilter);
      }

      const { data: articles } = await query
        .order('view_count', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(limit);

      return (articles || []).map((article, index) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        image_url: article.image_url || '',
        published_at: article.published_at,
        relevance_score: 100 - index, // Higher score for more popular articles
        category_name: (article.categories as any)?.name || 'সাধারণ',
      }));

    } catch (error) {
      console.error('Error fetching popular articles:', error);
      return [];
    }
  }

  // ========================================
  // 3. TRENDING ARTICLES ALGORITHM
  // ========================================

  async getTrendingArticles(limit = 10): Promise<PersonalizedRecommendation[]> {
    try {
      // Get articles from the last 7 days with high engagement
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: articles } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          view_count,
          categories (
            id,
            name,
            slug
          )
        `)
        .gte('published_at', sevenDaysAgo.toISOString())
        .order('view_count', { ascending: false })
        .limit(limit);

      return (articles || []).map((article, index) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        image_url: article.image_url || '',
        published_at: article.published_at,
        relevance_score: this.calculateTrendingScore(article),
        category_name: (article.categories as any)?.name || 'সাধারণ',
      }));

    } catch (error) {
      console.error('Error fetching trending articles:', error);
      return [];
    }
  }

  private calculateTrendingScore(article: any): number {
    const publishedDate = new Date(article.published_at);
    const hoursAgo = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
    const viewCount = article.view_count || 0;
    
    // Trending score: views per hour with recency boost
    const hourlyViews = viewCount / Math.max(hoursAgo, 1);
    const recencyBoost = Math.max(168 - hoursAgo, 0) / 168; // Boost for articles in last 7 days
    
    return Math.round((hourlyViews * 10) + (recencyBoost * 50));
  }

  // ========================================
  // 4. USER INTERACTION TRACKING
  // ========================================

  async trackUserInteraction(userId: string, articleId: number, interactionType: string, metadata?: any): Promise<void> {
    try {
      // Insert interaction record
      await supabase
        .from('user_interactions')
        .insert({
          user_id: userId,
          article_id: articleId,
          interaction_type: interactionType,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
        });

      // Update reading history if it's a read interaction
      if (interactionType === 'read') {
        await supabase
          .from('user_reading_history')
          .upsert({
            user_id: userId,
            article_id: articleId,
            read_at: new Date().toISOString(),
            read_duration: metadata?.duration || 0,
          });
      }

      console.log(`[Analytics] Tracked ${interactionType} interaction for user ${userId} on article ${articleId}`);
    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  }

  // ========================================
  // 5. ADVANCED BENGALI SEARCH
  // ========================================

  async advancedBengaliSearch(query: string, limit = 20, offset = 0): Promise<any[]> {
    try {
      // Clean and prepare search query
      const cleanQuery = query.trim().toLowerCase();
      
      // Use PostgreSQL full-text search for Bengali content
      const { data: articles } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          view_count,
          categories (
            id,
            name,
            slug
          )
        `)
        .or(`title.ilike.%${cleanQuery}%,content.ilike.%${cleanQuery}%,excerpt.ilike.%${cleanQuery}%`)
        .order('view_count', { ascending: false })
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Calculate search relevance scores
      return (articles || []).map(article => ({
        ...article,
        relevance_score: this.calculateSearchRelevance(article, cleanQuery),
      })).sort((a, b) => b.relevance_score - a.relevance_score);

    } catch (error) {
      console.error('Error in Bengali search:', error);
      return [];
    }
  }

  private calculateSearchRelevance(article: any, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = (article.title || '').toLowerCase();
    const excerptLower = (article.excerpt || '').toLowerCase();
    
    // Title match (highest weight)
    if (titleLower.includes(queryLower)) {
      score += 100;
      if (titleLower.startsWith(queryLower)) {
        score += 50; // Bonus for title starting with query
      }
    }
    
    // Excerpt match
    if (excerptLower.includes(queryLower)) {
      score += 30;
    }
    
    // Popularity bonus
    score += Math.min((article.view_count || 0) / 10, 20);
    
    return score;
  }

  // ========================================
  // 6. USER ANALYTICS
  // ========================================

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      // Get user's reading history
      const { data: readingHistory } = await supabase
        .from('user_reading_history')
        .select(`
          *,
          articles (
            id,
            category_id,
            categories (
              name
            )  
          )
        `)
        .eq('user_id', userId)
        .order('read_at', { ascending: true });

      if (!readingHistory || readingHistory.length === 0) {
        return {
          totalReads: 0,
          readingStreak: 0,
          favoriteCategories: [],
          readingTime: 0,
          engagementScore: 0,
        };
      }

      // Calculate metrics
      const totalReads = readingHistory.length;
      const readingStreak = this.calculateReadingStreak(readingHistory);
      const favoriteCategories = this.getFavoriteCategories(readingHistory);
      const readingTime = readingHistory.reduce((total, record) => total + (record.read_duration || 0), 0);
      const engagementScore = this.calculateEngagementScore(readingHistory);

      return {
        totalReads,
        readingStreak,
        favoriteCategories,
        readingTime,
        engagementScore,
      };

    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return {
        totalReads: 0,
        readingStreak: 0,
        favoriteCategories: [],
        readingTime: 0,
        engagementScore: 0,
      };
    }
  }

  private calculateReadingStreak(readingHistory: any[]): number {
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = readingHistory.length - 1; i >= 0; i--) {
      const readDate = new Date(readingHistory[i].read_at);
      const diffDays = Math.floor((currentDate.getTime() - readDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        currentDate = readDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private getFavoriteCategories(readingHistory: any[]): string[] {
    const categoryCount: Record<string, number> = {};
    
    readingHistory.forEach(record => {
      const categoryName = record.articles?.categories?.name;
      if (categoryName) {
        categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
      }
    });
    
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  private calculateEngagementScore(readingHistory: any[]): number {
    const totalReads = readingHistory.length;
    const avgReadingTime = readingHistory.reduce((total, record) => total + (record.read_duration || 0), 0) / totalReads;
    const recentActivity = readingHistory.filter(record => {
      const readDate = new Date(record.read_at);
      const daysSince = (Date.now() - readDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length;
    
    // Score based on total reads, average time, and recent activity
    const readsScore = Math.min(totalReads * 2, 40);
    const timeScore = Math.min(avgReadingTime / 60, 30); // Minutes to points
    const activityScore = Math.min(recentActivity * 3, 30);
    
    return Math.round(readsScore + timeScore + activityScore);
  }

  // ========================================
  // 7. TRENDING TOPICS GENERATION
  // ========================================

  async getTrendingTopics(limit = 10): Promise<TrendingTopic[]> {
    try {
      const { data: topics } = await supabase
        .from('trending_topics')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      return topics || [];
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return [];
    }
  }

  async updateTrendingTopics(): Promise<void> {
    try {
      // Get articles from the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: recentArticles } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          view_count,
          published_at,
          categories (
            name
          )
        `)
        .gte('published_at', yesterday.toISOString());

      // Analyze and extract trending topics
      const topicScores = this.analyzeTopics(recentArticles || []);
      
      // Clear existing trending topics
      await supabase
        .from('trending_topics')
        .delete()
        .neq('id', 0);

      // Insert new trending topics
      const trendingTopics = Object.entries(topicScores)
        .sort(([,a], [,b]) => b.score - a.score)
        .slice(0, 20)
        .map(([name, data]) => ({
          name,
          slug: this.generateSlug(name),
          score: data.score,
          article_count: data.count,
          growth_rate: data.growth,
        }));

      if (trendingTopics.length > 0) {
        await supabase
          .from('trending_topics')
          .insert(trendingTopics);
      }

      console.log(`[TrendingTopics] Updated ${trendingTopics.length} trending topics`);
    } catch (error) {
      console.error('Error updating trending topics:', error);
    }
  }

  private analyzeTopics(articles: any[]): Record<string, { score: number; count: number; growth: number }> {
    const topics: Record<string, { score: number; count: number; growth: number }> = {};
    
    articles.forEach(article => {
      // Extract keywords from title
      const keywords = this.extractKeywords(article.title);
      const viewScore = Math.log10((article.view_count || 0) + 1) * 10;
      
      keywords.forEach(keyword => {
        if (!topics[keyword]) {
          topics[keyword] = { score: 0, count: 0, growth: 0 };
        }
        
        topics[keyword].score += viewScore;
        topics[keyword].count += 1;
        topics[keyword].growth += this.calculateGrowthRate(article);
      });
      
      // Also include category as a topic
      const categoryName = article.categories?.name;
      if (categoryName) {
        if (!topics[categoryName]) {
          topics[categoryName] = { score: 0, count: 0, growth: 0 };
        }
        topics[categoryName].score += viewScore * 0.5; // Lower weight for categories
        topics[categoryName].count += 1;
      }
    });
    
    return topics;
  }

  private extractKeywords(title: string): string[] {
    // Simple keyword extraction for Bengali text
    // In a real implementation, you'd use proper NLP libraries
    const words = title.split(/\s+/).filter(word => word.length > 2);
    return words.slice(0, 3); // Take first 3 meaningful words
  }

  private calculateGrowthRate(article: any): number {
    const publishedDate = new Date(article.published_at);
    const hoursAgo = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
    const viewCount = article.view_count || 0;
    
    return viewCount / Math.max(hoursAgo, 1); // Views per hour
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0980-\u09FF]/g, '') // Keep Bengali characters
      .replace(/\s+/g, '-')
      .trim();
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private getDateFilter(timeRange: string): string {
    const now = new Date();
    let daysBack = 0;
    
    switch (timeRange) {
      case 'today':
        daysBack = 1;
        break;
      case 'week':
        daysBack = 7;
        break;
      case 'month':
        daysBack = 30;
        break;
      default:
        return '1900-01-01';
    }
    
    const filterDate = new Date();
    filterDate.setDate(now.getDate() - daysBack);
    return filterDate.toISOString();
  }
}

// Export singleton instance
export const directAdvancedAlgorithms = new DirectAdvancedAlgorithms();

// Initialize trending topics update (runs every hour)
if (typeof window !== 'undefined') {
  setInterval(() => {
    directAdvancedAlgorithms.updateTrendingTopics();
  }, 60 * 60 * 1000); // 1 hour
}