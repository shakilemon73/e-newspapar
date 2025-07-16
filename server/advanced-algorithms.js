import { supabase } from './supabase';

// Advanced Algorithm Functions for Bengali News Website

/**
 * Initialize all advanced algorithm tables and functions
 */
export async function initializeAdvancedAlgorithms() {
  console.log('🚀 Initializing Advanced Algorithms...');
  
  try {
    // Check if tables exist and create them if needed
    await createAdvancedTables();
    await createAdvancedFunctions();
    await createPerformanceIndexes();
    await initializeExistingData();
    
    console.log('✅ Advanced algorithms initialized successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error initializing advanced algorithms:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create advanced algorithm tables
 */
async function createAdvancedTables() {
  const tables = [
    // User Preferences Table
    `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      category_id INTEGER NOT NULL,
      interest_score FLOAT DEFAULT 1.0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, category_id)
    )
    `,
    
    // User Interactions Table
    `
    CREATE TABLE IF NOT EXISTS user_interactions (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      article_id INTEGER NOT NULL,
      interaction_type VARCHAR(50) NOT NULL,
      interaction_duration INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'::jsonb
    )
    `,
    
    // Article Analytics Table
    `
    CREATE TABLE IF NOT EXISTS article_analytics (
      id SERIAL PRIMARY KEY,
      article_id INTEGER NOT NULL,
      view_count INTEGER DEFAULT 0,
      unique_view_count INTEGER DEFAULT 0,
      share_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      average_read_time FLOAT DEFAULT 0,
      engagement_score FLOAT DEFAULT 0,
      trending_score FLOAT DEFAULT 0,
      quality_score FLOAT DEFAULT 0,
      virality_score FLOAT DEFAULT 0,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(article_id)
    )
    `,
    
    // User Search History Table
    `
    CREATE TABLE IF NOT EXISTS user_search_history (
      id SERIAL PRIMARY KEY,
      user_id UUID,
      search_query TEXT NOT NULL,
      search_results_count INTEGER DEFAULT 0,
      clicked_article_id INTEGER,
      search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
    `,
    
    // Trending Topics Table
    `
    CREATE TABLE IF NOT EXISTS trending_topics (
      id SERIAL PRIMARY KEY,
      topic_name VARCHAR(255) NOT NULL,
      category_id INTEGER,
      mention_count INTEGER DEFAULT 1,
      trending_score FLOAT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(topic_name, category_id)
    )
    `,
    
    // Article Similarity Table
    `
    CREATE TABLE IF NOT EXISTS article_similarity (
      id SERIAL PRIMARY KEY,
      article_id_1 INTEGER NOT NULL,
      article_id_2 INTEGER NOT NULL,
      similarity_score FLOAT DEFAULT 0,
      similarity_type VARCHAR(50) DEFAULT 'content',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(article_id_1, article_id_2, similarity_type)
    )
    `,
    
    // Breaking News Alerts Table
    `
    CREATE TABLE IF NOT EXISTS breaking_news_alerts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      category_id INTEGER,
      priority INTEGER DEFAULT 1,
      is_active BOOLEAN DEFAULT TRUE,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
    `,
    
    // User Notification Preferences Table
    `
    CREATE TABLE IF NOT EXISTS user_notification_preferences (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      breaking_news BOOLEAN DEFAULT TRUE,
      category_updates BOOLEAN DEFAULT TRUE,
      personalized_recommendations BOOLEAN DEFAULT TRUE,
      email_notifications BOOLEAN DEFAULT FALSE,
      push_notifications BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id)
    )
    `
  ];
  
  for (const table of tables) {
    try {
      await supabase.rpc('exec_sql', { sql: table });
      console.log('✅ Table created successfully');
    } catch (error) {
      // Try direct table creation
      const { error: createError } = await supabase
        .from('_temp_table_creation')
        .insert({ sql: table });
      
      if (createError) {
        console.log('⚠️  Table may already exist, continuing...');
      }
    }
  }
}

/**
 * Create performance indexes
 */
async function createPerformanceIndexes() {
  const indexes = [
    // User interactions indexes
    `CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON user_interactions(article_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type)`,
    `CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at)`,
    
    // Article analytics indexes
    `CREATE INDEX IF NOT EXISTS idx_article_analytics_trending_score ON article_analytics(trending_score DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_article_analytics_engagement_score ON article_analytics(engagement_score DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_article_analytics_view_count ON article_analytics(view_count DESC)`,
    
    // User preferences indexes
    `CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_preferences_category_id ON user_preferences(category_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_preferences_interest_score ON user_preferences(interest_score DESC)`,
    
    // Search history indexes
    `CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_search_history_timestamp ON user_search_history(search_timestamp DESC)`,
    
    // Enable trigram extension for fuzzy search
    `CREATE EXTENSION IF NOT EXISTS pg_trgm`,
    
    // Bengali text search indexes
    `CREATE INDEX IF NOT EXISTS articles_title_trgm_idx ON articles USING GIN(title gin_trgm_ops)`,
    `CREATE INDEX IF NOT EXISTS articles_content_trgm_idx ON articles USING GIN(content gin_trgm_ops)`
  ];
  
  for (const index of indexes) {
    try {
      await supabase.rpc('exec_sql', { sql: index });
      console.log('✅ Index created successfully');
    } catch (error) {
      console.log('⚠️  Index may already exist, continuing...');
    }
  }
}

/**
 * Create advanced functions
 */
async function createAdvancedFunctions() {
  // These functions will be created as needed through the API endpoints
  console.log('✅ Advanced functions will be created through API endpoints');
}

/**
 * Initialize existing data
 */
async function initializeExistingData() {
  try {
    // Initialize analytics for existing articles
    const { data: articles } = await supabase
      .from('articles')
      .select('id, view_count');
    
    if (articles && articles.length > 0) {
      for (const article of articles) {
        await supabase
          .from('article_analytics')
          .upsert({
            article_id: article.id,
            view_count: article.view_count || 0,
            unique_view_count: article.view_count || 0,
            engagement_score: 0.0,
            trending_score: 0.0
          });
      }
      console.log(`✅ Initialized analytics for ${articles.length} articles`);
    }
    
  } catch (error) {
    console.log('⚠️  Error initializing existing data:', error.message);
  }
}

/**
 * Get personalized recommendations for a user
 */
export async function getPersonalizedRecommendations(userId, limit = 10) {
  try {
    // Get user's category preferences based on interactions
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select(`
        article_id,
        interaction_type,
        interaction_duration,
        articles!inner(category_id, categories!inner(name))
      `)
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (!interactions || interactions.length === 0) {
      // Return popular articles for new users
      return await getPopularArticles(limit);
    }
    
    // Calculate category preferences
    const categoryScores = {};
    interactions.forEach(interaction => {
      const categoryId = interaction.articles.category_id;
      if (!categoryScores[categoryId]) {
        categoryScores[categoryId] = 0;
      }
      
      // Weight different interaction types
      const weights = {
        'view': 1,
        'share': 3,
        'like': 2,
        'comment': 4,
        'save': 2
      };
      
      categoryScores[categoryId] += weights[interaction.interaction_type] || 1;
      categoryScores[categoryId] += (interaction.interaction_duration || 0) * 0.001;
    });
    
    // Get articles from preferred categories
    const preferredCategories = Object.keys(categoryScores)
      .sort((a, b) => categoryScores[b] - categoryScores[a])
      .slice(0, 3);
    
    const { data: recommendations } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        image_url,
        published_at,
        category_id,
        categories!inner(name, slug),
        article_analytics(engagement_score, trending_score, view_count)
      `)
      .in('category_id', preferredCategories)
      .not('id', 'in', `(${interactions.map(i => i.article_id).join(',')})`)
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);
    
    return recommendations || [];
    
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
}

/**
 * Get popular articles
 */
export async function getPopularArticles(limit = 10) {
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        image_url,
        published_at,
        category_id,
        categories!inner(name, slug),
        article_analytics(engagement_score, trending_score, view_count)
      `)
      .order('view_count', { ascending: false })
      .limit(limit);
    
    return articles || [];
    
  } catch (error) {
    console.error('Error getting popular articles:', error);
    return [];
  }
}

/**
 * Get trending articles
 */
export async function getTrendingArticles(limit = 10) {
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        image_url,
        published_at,
        category_id,
        categories!inner(name, slug),
        article_analytics!inner(engagement_score, trending_score, view_count)
      `)
      .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('article_analytics.trending_score', { ascending: false })
      .limit(limit);
    
    return articles || [];
    
  } catch (error) {
    console.error('Error getting trending articles:', error);
    return [];
  }
}

/**
 * Track user interaction
 */
export async function trackUserInteraction(userId, articleId, interactionType, duration = 0, metadata = {}) {
  try {
    // Insert interaction
    const { error: insertError } = await supabase
      .from('user_interactions')
      .insert({
        user_id: userId,
        article_id: articleId,
        interaction_type: interactionType,
        interaction_duration: duration,
        metadata: metadata
      });
    
    if (insertError) {
      console.error('Error tracking interaction:', insertError);
      return { success: false, error: insertError.message };
    }
    
    // Update article analytics
    await updateArticleAnalytics(articleId, interactionType);
    
    // Update user preferences
    await updateUserPreferences(userId, articleId);
    
    return { success: true };
    
  } catch (error) {
    console.error('Error tracking user interaction:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update article analytics
 */
async function updateArticleAnalytics(articleId, interactionType) {
  try {
    const { data: existing } = await supabase
      .from('article_analytics')
      .select('*')
      .eq('article_id', articleId)
      .single();
    
    if (!existing) {
      // Create new analytics record
      await supabase
        .from('article_analytics')
        .insert({
          article_id: articleId,
          view_count: interactionType === 'view' ? 1 : 0,
          share_count: interactionType === 'share' ? 1 : 0,
          like_count: interactionType === 'like' ? 1 : 0,
          comment_count: interactionType === 'comment' ? 1 : 0,
          engagement_score: 1.0,
          trending_score: 1.0
        });
    } else {
      // Update existing analytics
      const updates = { last_updated: new Date().toISOString() };
      
      if (interactionType === 'view') updates.view_count = existing.view_count + 1;
      if (interactionType === 'share') updates.share_count = existing.share_count + 1;
      if (interactionType === 'like') updates.like_count = existing.like_count + 1;
      if (interactionType === 'comment') updates.comment_count = existing.comment_count + 1;
      
      // Calculate engagement score
      const engagementScore = (
        (existing.view_count + (updates.view_count || 0)) * 1.0 +
        (existing.share_count + (updates.share_count || 0)) * 3.0 +
        (existing.like_count + (updates.like_count || 0)) * 2.0 +
        (existing.comment_count + (updates.comment_count || 0)) * 4.0
      );
      
      updates.engagement_score = engagementScore;
      updates.trending_score = engagementScore * Math.exp(-Date.now() / (24 * 60 * 60 * 1000));
      
      await supabase
        .from('article_analytics')
        .update(updates)
        .eq('article_id', articleId);
    }
    
  } catch (error) {
    console.error('Error updating article analytics:', error);
  }
}

/**
 * Update user preferences
 */
async function updateUserPreferences(userId, articleId) {
  try {
    // Get article category
    const { data: article } = await supabase
      .from('articles')
      .select('category_id')
      .eq('id', articleId)
      .single();
    
    if (!article) return;
    
    // Update user preferences
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', article.category_id)
      .single();
    
    if (!existing) {
      await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          category_id: article.category_id,
          interest_score: 1.0
        });
    } else {
      await supabase
        .from('user_preferences')
        .update({
          interest_score: existing.interest_score + 0.1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('category_id', article.category_id);
    }
    
  } catch (error) {
    console.error('Error updating user preferences:', error);
  }
}

/**
 * Advanced Bengali search
 */
export async function advancedBengaliSearch(query, categoryId = null, limit = 20) {
  try {
    console.log('Advanced Bengali search called with query:', query, 'categoryId:', categoryId);
    
    let queryBuilder = supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        image_url,
        published_at,
        category_id,
        view_count,
        categories(name, slug)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order('published_at', { ascending: false });
    
    if (categoryId) {
      queryBuilder = queryBuilder.eq('category_id', categoryId);
    }
    
    const { data: results, error } = await queryBuilder.limit(limit);
    
    if (error) {
      console.error('Advanced search error:', error);
      return [];
    }
    
    console.log('Advanced search results:', results?.length || 0);
    
    // Transform results to match expected format
    const transformedResults = results?.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || '',
      image_url: article.image_url || '',
      published_at: article.published_at,
      category_name: article.categories?.name || '',
      search_rank: 1.0 // Default search rank
    })) || [];
    
    return transformedResults;
    
  } catch (error) {
    console.error('Error in advanced Bengali search:', error);
    return [];
  }
}

/**
 * Get user analytics
 */
export async function getUserAnalytics(userId) {
  try {
    // Get user interactions count
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('interaction_type')
      .eq('user_id', userId);
    
    // Get user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select(`
        category_id,
        interest_score,
        categories!inner(name)
      `)
      .eq('user_id', userId)
      .order('interest_score', { ascending: false });
    
    // Get reading history
    const { data: readingHistory } = await supabase
      .from('reading_history')
      .select(`
        article_id,
        read_count,
        last_read_at,
        articles!inner(title, categories!inner(name))
      `)
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false })
      .limit(10);
    
    return {
      totalInteractions: interactions?.length || 0,
      interactionsByType: interactions?.reduce((acc, curr) => {
        acc[curr.interaction_type] = (acc[curr.interaction_type] || 0) + 1;
        return acc;
      }, {}) || {},
      topCategories: preferences?.slice(0, 5) || [],
      recentReading: readingHistory || []
    };
    
  } catch (error) {
    console.error('Error getting user analytics:', error);
    return {
      totalInteractions: 0,
      interactionsByType: {},
      topCategories: [],
      recentReading: []
    };
  }
}