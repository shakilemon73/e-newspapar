import { Express, Request, Response } from 'express';
import { supabase } from './supabase';

// User Reading History Routes
export const setupUXEnhancementRoutes = (app: Express) => {
  
  // ========== USER READING HISTORY ==========
  
  // Track reading activity
  app.post('/api/user/reading-history', async (req: Request, res: Response) => {
    try {
      const { user_id, article_id, reading_time_seconds, scroll_percentage, completed } = req.body;
      
      if (!user_id || !article_id) {
        return res.status(400).json({ error: 'User ID and Article ID are required' });
      }

      // Check if record exists
      const { data: existing } = await supabase
        .from('user_reading_history')
        .select('*')
        .eq('user_id', user_id)
        .eq('article_id', article_id)
        .single();

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('user_reading_history')
          .update({
            reading_time_seconds: Math.max(existing.reading_time_seconds, reading_time_seconds || 0),
            scroll_percentage: Math.max(existing.scroll_percentage, scroll_percentage || 0),
            completed: completed || existing.completed,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        res.json(data);
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('user_reading_history')
          .insert({
            user_id,
            article_id,
            reading_time_seconds: reading_time_seconds || 0,
            scroll_percentage: scroll_percentage || 0,
            completed: completed || false
          })
          .select()
          .single();

        if (error) throw error;
        
        // Check for new achievements after reading activity
        if (completed && user_id && user_id !== 'anonymous') {
          try {
            const { checkAndAwardAchievements, calculateUserStatsForAchievements } = await import('./achievements-system.js');
            const userStats = await calculateUserStatsForAchievements(user_id);
            await checkAndAwardAchievements(user_id, userStats);
          } catch (achievementError) {
            console.error('Error checking achievements:', achievementError);
            // Don't fail the main request if achievements fail
          }
        }
        
        res.json(data);
      }
    } catch (error) {
      console.error('Error tracking reading history:', error);
      res.status(500).json({ error: 'Failed to track reading history' });
    }
  });

  // Get user reading history
  app.get('/api/user/:userId/reading-history', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = 20 } = req.query;

      // Use the advanced algorithms function which handles schema cache issues
      const { getUserReadingHistory } = await import('./advanced-algorithms.js');
      const history = await getUserReadingHistory(userId, parseInt(limit as string));
      
      res.json(history);
    } catch (error) {
      console.error('Error getting reading history:', error);
      res.status(500).json({ error: 'Failed to get reading history' });
    }
  });

  // ========== USER SAVED ARTICLES ==========
  
  // Save article
  app.post('/api/user/saved-articles', async (req: Request, res: Response) => {
    try {
      const { user_id, article_id, folder_name = 'default', notes } = req.body;
      
      if (!user_id || !article_id) {
        return res.status(400).json({ error: 'User ID and Article ID are required' });
      }

      const { data, error } = await supabase
        .from('user_saved_articles')
        .insert({
          user_id,
          article_id,
          folder_name,
          notes
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return res.status(409).json({ error: 'Article already saved' });
        }
        throw error;
      }

      // Check for new achievements after saving article
      if (user_id && user_id !== 'anonymous') {
        try {
          const { checkAndAwardAchievements, calculateUserStatsForAchievements } = await import('./achievements-system.js');
          const userStats = await calculateUserStatsForAchievements(user_id);
          await checkAndAwardAchievements(user_id, userStats);
        } catch (achievementError) {
          console.error('Error checking achievements:', achievementError);
          // Don't fail the main request if achievements fail
        }
      }

      res.json(data);
    } catch (error) {
      console.error('Error saving article:', error);
      res.status(500).json({ error: 'Failed to save article' });
    }
  });

  // Get saved articles
  app.get('/api/user/:userId/saved-articles', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = 20 } = req.query;

      // Use the advanced algorithms function which handles schema cache issues
      const { getUserSavedArticles } = await import('./advanced-algorithms.js');
      const savedArticles = await getUserSavedArticles(userId, parseInt(limit as string));
      
      res.json(savedArticles);
    } catch (error) {
      console.error('Error getting saved articles:', error);
      res.status(500).json({ error: 'Failed to get saved articles' });
    }
  });

  // Remove saved article
  app.delete('/api/user/saved-articles/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const { error } = await supabase
        .from('user_saved_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ message: 'Article removed from saved list' });
    } catch (error) {
      console.error('Error removing saved article:', error);
      res.status(500).json({ error: 'Failed to remove saved article' });
    }
  });

  // ========== USER ACHIEVEMENTS ==========
  
  // Get user achievements with details
  app.get('/api/user/:userId/achievements', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { getUserAchievements } = await import('./achievements-system.js');
      
      const achievements = await getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error('Error getting achievements:', error);
      res.status(500).json({ error: 'Failed to get achievements' });
    }
  });

  // Get achievement progress
  app.get('/api/user/:userId/achievement-progress', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { getAchievementProgress, calculateUserStatsForAchievements } = await import('./achievements-system.js');
      
      const userStats = await calculateUserStatsForAchievements(userId);
      const progress = await getAchievementProgress(userId, userStats);
      
      res.json(progress);
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      res.status(500).json({ error: 'Failed to get achievement progress' });
    }
  });

  // Update achievement progress
  app.put('/api/user/achievements/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { progress_value, is_completed } = req.body;

      const { data, error } = await supabase
        .from('user_achievements')
        .update({
          progress_value,
          is_completed,
          ...(is_completed && { earned_at: new Date().toISOString() })
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error updating achievement:', error);
      res.status(500).json({ error: 'Failed to update achievement' });
    }
  });

  // ========== USER PREFERENCES ==========
  
  // Get user preferences
  app.get('/api/user/:userId/preferences', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          // Create default preferences with category_id
          const { data: newPrefs, error: insertError } = await supabase
            .from('user_preferences')
            .upsert({ 
              user_id: userId,
              category_id: 1, // Default to first category
              interest_score: 0.5,
              interaction_count: 0
            })
            .select()
            .single();

          if (insertError) throw insertError;
          return res.json(newPrefs);
        }
        throw error;
      }

      res.json(data);
    } catch (error) {
      console.error('Error getting user preferences:', error);
      res.status(500).json({ error: 'Failed to get user preferences' });
    }
  });

  // Update user preferences
  app.put('/api/user/:userId/preferences', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const preferences = req.body;

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ error: 'Failed to update user preferences' });
    }
  });

  // ========== USER INTERACTIONS ==========
  
  // Track user interaction
  app.post('/api/user/interactions', async (req: Request, res: Response) => {
    try {
      const { user_id, article_id, interaction_type, interaction_data } = req.body;
      
      if (!user_id || !article_id || !interaction_type) {
        return res.status(400).json({ error: 'User ID, Article ID, and Interaction Type are required' });
      }

      const { data, error } = await supabase
        .from('user_interactions')
        .insert({
          user_id,
          article_id,
          interaction_type,
          interaction_data: interaction_data || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Update article analytics
      await updateArticleAnalytics(article_id, interaction_type);

      res.json(data);
    } catch (error) {
      console.error('Error tracking user interaction:', error);
      res.status(500).json({ error: 'Failed to track interaction' });
    }
  });

  // Get user interactions
  app.get('/api/user/:userId/interactions', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { type, limit = 20, offset = 0 } = req.query;

      let query = supabase
        .from('user_interactions')
        .select(`
          *,
          article:articles(id, title, slug, excerpt, image_url, published_at)
        `)
        .eq('user_id', userId);

      if (type) {
        query = query.eq('interaction_type', type);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error getting user interactions:', error);
      res.status(500).json({ error: 'Failed to get user interactions' });
    }
  });

  // ========== USER SEARCH HISTORY ==========
  
  // Track search
  app.post('/api/user/search-history', async (req: Request, res: Response) => {
    try {
      const { user_id, search_query, search_results_count, category_filter } = req.body;
      
      if (!search_query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const { data, error } = await supabase
        .from('user_search_history')
        .insert({
          user_id,
          search_query,
          search_results_count: search_results_count || 0,
          category_filter
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error tracking search history:', error);
      res.status(500).json({ error: 'Failed to track search history' });
    }
  });

  // Get search history
  app.get('/api/user/:userId/search-history', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const { data, error } = await supabase
        .from('user_search_history')
        .select('*')
        .eq('user_id', userId)
        .order('search_timestamp', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error getting search history:', error);
      res.status(500).json({ error: 'Failed to get search history' });
    }
  });

  // ========== TRENDING TOPICS ==========
  
  // Get trending topics
  app.get('/api/trending-topics', async (req: Request, res: Response) => {
    try {
      const { limit = 10, date } = req.query;
      
      let query = supabase
        .from('trending_topics')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .order('growth_percentage', { ascending: false });

      if (date) {
        query = query.eq('trending_date', date);
      } else {
        query = query.eq('trending_date', new Date().toISOString().split('T')[0]);
      }

      const { data, error } = await query.limit(Number(limit));

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error getting trending topics:', error);
      res.status(500).json({ error: 'Failed to get trending topics' });
    }
  });

  // ========== ARTICLE ANALYTICS ==========
  
  // Get article analytics
  app.get('/api/articles/:articleId/analytics', async (req: Request, res: Response) => {
    try {
      const { articleId } = req.params;

      const { data, error } = await supabase
        .from('article_analytics')
        .select('*')
        .eq('article_id', articleId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return res.json({
            article_id: articleId,
            total_views: 0,
            total_likes: 0,
            total_shares: 0,
            total_comments: 0,
            total_bookmarks: 0,
            average_reading_time: 0,
            bounce_rate: 0,
            engagement_score: 0
          });
        }
        throw error;
      }

      res.json(data);
    } catch (error) {
      console.error('Error getting article analytics:', error);
      res.status(500).json({ error: 'Failed to get article analytics' });
    }
  });

  // ========== PERSONALIZED RECOMMENDATIONS ==========
  
  // Get personalized recommendations
  app.get('/api/user/:userId/recommendations', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit = 10 } = req.query;

      // Get user's reading history to understand preferences
      const { data: readingHistory } = await supabase
        .from('user_reading_history')
        .select(`
          article:articles(category_id, category:categories(slug))
        `)
        .eq('user_id', userId)
        .order('read_at', { ascending: false })
        .limit(50);

      // Extract preferred categories
      const categoryPreferences = readingHistory?.reduce((acc: any, item: any) => {
        const categoryId = item.article?.category_id;
        if (categoryId) {
          acc[categoryId] = (acc[categoryId] || 0) + 1;
        }
        return acc;
      }, {});

      // Get top preferred categories
      const topCategories = Object.entries(categoryPreferences || {})
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([id]) => parseInt(id));

      let query = supabase
        .from('articles')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .eq('is_featured', true)
        .order('published_at', { ascending: false });

      if (topCategories.length > 0) {
        query = query.in('category_id', topCategories);
      }

      const { data, error } = await query.limit(Number(limit));

      if (error) throw error;

      // Transform data to match frontend expectations
      const transformedData = data?.map(article => ({
        ...article,
        imageUrl: article.image_url,
        publishedAt: article.published_at,
        categoryName: article.category?.name
      }));

      res.json(transformedData);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      res.status(500).json({ error: 'Failed to get personalized recommendations' });
    }
  });
};

// Helper function to update article analytics
async function updateArticleAnalytics(articleId: number, interactionType: string) {
  try {
    const { data: existing } = await supabase
      .from('article_analytics')
      .select('*')
      .eq('article_id', articleId)
      .single();

    const updates: any = {
      last_updated: new Date().toISOString()
    };

    if (existing) {
      switch (interactionType) {
        case 'view':
          updates.total_views = (existing.total_views || 0) + 1;
          break;
        case 'like':
          updates.total_likes = (existing.total_likes || 0) + 1;
          break;
        case 'share':
          updates.total_shares = (existing.total_shares || 0) + 1;
          break;
        case 'comment':
          updates.total_comments = (existing.total_comments || 0) + 1;
          break;
        case 'bookmark':
          updates.total_bookmarks = (existing.total_bookmarks || 0) + 1;
          break;
      }

      // Calculate engagement score
      const totalInteractions = (updates.total_likes || existing.total_likes || 0) + 
                               (updates.total_shares || existing.total_shares || 0) + 
                               (updates.total_comments || existing.total_comments || 0) + 
                               (updates.total_bookmarks || existing.total_bookmarks || 0);
      const views = updates.total_views || existing.total_views || 1;
      updates.engagement_score = (totalInteractions / views) * 100;

      await supabase
        .from('article_analytics')
        .update(updates)
        .eq('article_id', articleId);
    } else {
      // Create new analytics record
      const newAnalytics = {
        article_id: articleId,
        total_views: interactionType === 'view' ? 1 : 0,
        total_likes: interactionType === 'like' ? 1 : 0,
        total_shares: interactionType === 'share' ? 1 : 0,
        total_comments: interactionType === 'comment' ? 1 : 0,
        total_bookmarks: interactionType === 'bookmark' ? 1 : 0,
        engagement_score: interactionType === 'view' ? 0 : 100,
        ...updates
      };

      await supabase
        .from('article_analytics')
        .insert(newAnalytics);
    }
  } catch (error) {
    console.error('Error updating article analytics:', error);
  }
}