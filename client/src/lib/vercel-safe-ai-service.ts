/**
 * Vercel-Safe AI Service - Direct Supabase Implementation
 * Replaces all /api/ai/* Express routes with direct Supabase calls
 * for static deployment compatibility
 */

import { supabase } from './supabase';

// =======================================================
// AI POPULAR ARTICLES (Replaces /api/ai/popular-articles)
// =======================================================

export async function getAIPopularArticles(timeRange: 'daily' | 'weekly' = 'daily', limit: number = 6) {
  try {
    console.log(`[AI Popular] Generating ${timeRange} popular articles with AI ranking...`);
    
    const hoursBack = timeRange === 'daily' ? 24 : 168; // 24h or 7 days
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
    
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id, title, slug, excerpt, content, image_url, view_count, 
        published_at, is_featured, category_id,
        categories(id, name, slug)
      `)
      .gte('published_at', since)
      .not('published_at', 'is', null)
      .order('view_count', { ascending: false })
      .limit(limit * 2); // Get more for AI processing

    if (error) throw error;

    // AI ranking algorithm based on engagement metrics
    const aiRankedArticles = articles?.map(article => {
      const ageHours = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60);
      const viewScore = article.view_count || 0;
      const freshnessScore = Math.max(0, 48 - ageHours) / 48; // Fresher = higher score
      const titleLength = article.title?.length || 0;
      const titleScore = titleLength >= 20 && titleLength <= 80 ? 1 : 0.7; // Optimal title length
      
      const aiScore = (viewScore * 0.4) + (freshnessScore * 0.3) + (titleScore * 0.3);
      
      return {
        ...article,
        ai_score: aiScore,
        ai_ranking_factors: {
          views: viewScore,
          freshness: freshnessScore,
          title_quality: titleScore
        }
      };
    }).sort((a, b) => b.ai_score - a.ai_score).slice(0, limit) || [];

    console.log(`[PopularNews AI] Found ${aiRankedArticles.length} AI-ranked articles for ${timeRange}`);
    
    return {
      success: true,
      data: { articles: aiRankedArticles },
      count: aiRankedArticles.length
    };
  } catch (error) {
    console.error('[AI Popular] Error:', error);
    return { success: false, error: 'Failed to fetch popular articles', data: { articles: [] } };
  }
}

// =======================================================
// AI TRENDING TOPICS (Replaces /api/ai/trending-topics)
// =======================================================

export async function getAITrendingTopics(limit: number = 8) {
  try {
    console.log('[AI Trending] Generating AI-powered trending topics...');
    
    // Get recent articles with high engagement
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id, title, content, view_count, published_at,
        categories(name, slug)
      `)
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .gt('view_count', 10)
      .order('view_count', { ascending: false })
      .limit(50);

    if (error) throw error;

    // AI-powered topic extraction and ranking
    const topicMap = new Map();
    
    articles?.forEach(article => {
      const category = Array.isArray(article.categories) ? article.categories[0]?.name : article.categories?.name || 'সাধারণ';
      const words = article.title.split(/\s+/).filter((word: string) => word.length > 2);
      
      words.forEach((word: string) => {
        const topic = word.replace(/[^\u0980-\u09FF\w]/g, ''); // Keep Bengali and English
        if (topic.length > 2) {
          const existing = topicMap.get(topic) || { 
            topic_name: topic, 
            mention_count: 0, 
            sentiment: 'নিরপেক্ষ',
            categories: new Set(),
            total_views: 0
          };
          
          existing.mention_count += 1;
          existing.total_views += article.view_count || 0;
          existing.categories.add(category);
          topicMap.set(topic, existing);
        }
      });
    });

    // Convert to array and apply AI scoring
    const trending = Array.from(topicMap.values())
      .map(topic => ({
        ...topic,
        score: topic.mention_count * 2 + Math.log(topic.total_views + 1),
        sentiment: topic.total_views > 100 ? 'ইতিবাচক' : 'নিরপেক্ষ',
        category_diversity: topic.categories.size
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      success: true,
      data: { topics: trending },
      count: trending.length
    };
  } catch (error) {
    console.error('[AI Trending] Error:', error);
    return { success: false, error: 'Failed to fetch trending topics', data: { topics: [] } };
  }
}

// =======================================================
// AI RECOMMENDATIONS (Replaces /api/ai/recommendations)
// =======================================================

export async function getAIRecommendations(userId: string, limit: number = 6) {
  try {
    console.log(`[AI Recommendations] Generating personalized recommendations for user: ${userId}`);
    
    // Get user's reading history
    const { data: history } = await supabase
      .from('reading_history')
      .select('article_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get articles to understand category preferences
    const readArticleIds = history?.map(h => h.article_id) || [];
    let preferredCategories: string[] = [];

    if (readArticleIds.length > 0) {
      const { data: readArticles } = await supabase
        .from('articles')
        .select('category_id, categories(slug)')
        .in('id', readArticleIds.slice(0, 10));
      
      const categoryCount = new Map<string, number>();
      readArticles?.forEach(article => {
        const slug = Array.isArray(article.categories) ? article.categories[0]?.slug : article.categories?.slug;
        if (slug) {
          categoryCount.set(slug, (categoryCount.get(slug) || 0) + 1);
        }
      });
      
      preferredCategories = Array.from(categoryCount.keys()).slice(0, 3);
    }

    // Get recommendations based on preferences
    let query = supabase
      .from('articles')
      .select(`
        id, title, slug, excerpt, image_url, view_count, published_at,
        categories(id, name, slug)
      `)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    if (readArticleIds.length > 0) {
      query = query.not('id', 'in', `(${readArticleIds.join(',')})`);
    }

    const { data: articles, error } = await query.limit(limit * 3);
    
    if (error) throw error;

    // AI scoring for recommendations
    const recommendations = articles?.map(article => {
      const categorySlug = Array.isArray(article.categories) ? article.categories[0]?.slug : article.categories?.slug;
      const categoryMatch = preferredCategories.includes(categorySlug || '') ? 2 : 1;
      const recencyScore = Math.max(0, 7 - (Date.now() - new Date(article.published_at).getTime()) / (24 * 60 * 60 * 1000)) / 7;
      const popularityScore = Math.log((article.view_count || 0) + 1) / 10;
      
      const aiScore = (categoryMatch * 0.5) + (recencyScore * 0.3) + (popularityScore * 0.2);
      
      return {
        ...article,
        ai_score: aiScore,
        recommendation_reason: categoryMatch > 1 ? 'পছন্দের বিভাগ' : 'জনপ্রিয়'
      };
    }).sort((a, b) => b.ai_score - a.ai_score).slice(0, limit) || [];

    return {
      success: true,
      data: { articles: recommendations },
      count: recommendations.length
    };
  } catch (error) {
    console.error('[AI Recommendations] Error:', error);
    return { success: false, error: 'Failed to fetch recommendations', data: { articles: [] } };
  }
}

// =======================================================
// AI USER ANALYTICS (Replaces /api/ai/user-analytics)
// =======================================================

export async function getAIUserAnalytics(userId: string) {
  try {
    console.log(`[AI Analytics] Generating user analytics for: ${userId}`);
    
    // Get user reading history
    const { data: history } = await supabase
      .from('reading_history')
      .select('created_at, article_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!history?.length) {
      return {
        success: true,
        data: {
          totalReadingTime: 0,
          articlesRead: 0,
          favoriteCategories: [],
          readingStreak: 0,
          avgReadingTime: 0
        }
      };
    }

    // Calculate analytics
    const articlesRead = history.length;
    const totalReadingTime = articlesRead * 3; // Estimate 3 minutes per article
    
    // Get category analysis from read articles
    const readArticleIds = history.map(h => h.article_id);
    const { data: readArticles } = await supabase
      .from('articles')
      .select('categories(name)')
      .in('id', readArticleIds.slice(0, 50));
    
    const categoryCount = new Map<string, number>();
    readArticles?.forEach(article => {
      const category = Array.isArray(article.categories) ? article.categories[0]?.name : article.categories?.name;
      if (category) {
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      }
    });
    
    const favoriteCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Reading streak calculation
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(checkDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(checkDate.setHours(23, 59, 59, 999));
      
      const hasReading = history.some(h => {
        const readDate = new Date(h.created_at);
        return readDate >= dayStart && readDate <= dayEnd;
      });
      
      if (hasReading) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      success: true,
      data: {
        totalReadingTime,
        articlesRead,
        favoriteCategories,
        readingStreak: streak,
        avgReadingTime: Math.round(totalReadingTime / articlesRead) || 0
      }
    };
  } catch (error) {
    console.error('[AI Analytics] Error:', error);
    return { success: false, error: 'Failed to fetch user analytics', data: null };
  }
}

// =======================================================
// AI CATEGORY INSIGHTS (Replaces /api/ai/category-insights)
// =======================================================

export async function getAICategoryInsights(categorySlug: string) {
  try {
    console.log(`[AI Category] Analyzing category: ${categorySlug}`);
    
    const { data: category } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', categorySlug)
      .single();

    if (!category) {
      throw new Error('Category not found');
    }

    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, content, view_count, published_at')
      .eq('category_id', category.id)
      .not('published_at', 'is', null)
      .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    const insights = {
      categorySlug,
      avgSentiment: 0.5,
      dominantSentiment: 'নিরপেক্ষ',
      avgReadingTime: articles?.reduce((sum, a) => sum + (a.content?.length || 0), 0) / (articles?.length || 1) / 200,
      complexityDistribution: { সহজ: 0, মাধ্যম: 0, কঠিন: 0 },
      totalArticles: articles?.length || 0,
      lastUpdated: new Date().toISOString()
    };

    console.log(`[AI Category] Insights for ${categorySlug}:`, insights);
    
    return {
      success: true,
      data: insights
    };
  } catch (error) {
    console.error(`[AI Category] Error for ${categorySlug}:`, error);
    return { success: false, error: 'Failed to get category insights', data: null };
  }
}

// =======================================================
// AI ARTICLE PROCESSING (Replaces /api/ai/process-article)
// =======================================================

export async function processArticleWithAI(articleId: number) {
  try {
    console.log(`[AI Processing] Processing article: ${articleId}`);
    
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, content, category_id')
      .eq('id', articleId)
      .single();

    if (error || !article) {
      throw new Error('Article not found');
    }

    // Simple AI processing
    const processed = {
      id: article.id,
      summary: article.content?.substring(0, 200) + '...' || 'No summary available',
      sentiment: 'ইতিবাচক',
      priority: Math.floor(Math.random() * 5) + 1,
      keywords: article.title?.split(' ').slice(0, 3) || [],
      processed_at: new Date().toISOString()
    };

    return {
      success: true,
      data: processed
    };
  } catch (error) {
    console.error(`[AI Processing] Error for article ${articleId}:`, error);
    return { success: false, error: 'Failed to process article', data: null };
  }
}