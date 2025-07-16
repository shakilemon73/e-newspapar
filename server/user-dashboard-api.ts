import { Express } from 'express';
import { supabase } from './supabase';

// Real working API endpoints for user dashboard
export function setupUserDashboardAPI(app: Express, apiPrefix: string, requireAuth: any) {
  
  // Get user statistics (reading history, saved articles, etc.)
  app.get(`${apiPrefix}/user/stats`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Get saved articles count
      const { data: savedArticlesData, error: savedError } = await supabase
        .from('saved_articles')
        .select('id')
        .eq('user_id', user.id);
      
      const savedArticlesCount = savedArticlesData?.length || 0;
      
      // Get reading history count
      const { data: readingHistoryData, error: readingError } = await supabase
        .from('reading_history')
        .select('id')
        .eq('user_id', user.id);
      
      const readingHistoryCount = readingHistoryData?.length || 0;
      
      // Calculate reading streak
      const { data: streakData, error: streakError } = await supabase
        .from('reading_history')
        .select('last_read_at')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false });
      
      let readingStreak = 0;
      if (streakData && streakData.length > 0) {
        const today = new Date();
        const sortedDates = streakData.map(item => new Date(item.last_read_at));
        
        for (let i = 0; i < sortedDates.length; i++) {
          const daysDiff = Math.floor((today.getTime() - sortedDates[i].getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === i) {
            readingStreak++;
          } else {
            break;
          }
        }
      }
      
      // Get user analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      const totalInteractions = analyticsData?.total_interactions || 0;
      
      return res.json({
        savedArticles: savedArticlesCount,
        readArticles: readingHistoryCount,
        readingStreak,
        totalInteractions,
        memberSince: new Date(user.created_at).toLocaleDateString('bn-BD'),
        favoriteCategories: analyticsData?.favorite_categories || []
      });
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Save article
  app.post(`${apiPrefix}/user/save-article`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { articleId } = req.body;
      
      if (!articleId) {
        return res.status(400).json({ error: 'Article ID is required' });
      }
      
      // Check if article exists
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('id')
        .eq('id', articleId)
        .single();
      
      if (articleError || !articleData) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      // Insert or update saved article
      const { data, error } = await supabase
        .from('saved_articles')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          saved_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      return res.json({ success: true, message: 'Article saved successfully' });
    } catch (error: any) {
      console.error('Error saving article:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Remove saved article
  app.delete(`${apiPrefix}/user/saved-articles/:id`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      
      const { error } = await supabase
        .from('saved_articles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      return res.json({ success: true, message: 'Article removed from saved list' });
    } catch (error: any) {
      console.error('Error removing saved article:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Track reading activity
  app.post(`${apiPrefix}/user/track-reading`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { articleId } = req.body;
      
      if (!articleId) {
        return res.status(400).json({ error: 'Article ID is required' });
      }
      
      // Check if reading history exists
      const { data: existingData, error: checkError } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingData) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('reading_history')
          .update({
            last_read_at: new Date().toISOString(),
            read_count: existingData.read_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
        
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from('reading_history')
          .insert({
            user_id: user.id,
            article_id: articleId,
            last_read_at: new Date().toISOString(),
            read_count: 1
          });
        
        if (insertError) {
          throw insertError;
        }
      }
      
      return res.json({ success: true, message: 'Reading tracked successfully' });
    } catch (error: any) {
      console.error('Error tracking reading:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Get user progress (for monthly goals)
  app.get(`${apiPrefix}/user/progress`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Get current month reading count
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: monthlyReadingData, error: monthlyReadingError } = await supabase
        .from('reading_history')
        .select('id')
        .eq('user_id', user.id)
        .gte('last_read_at', startOfMonth.toISOString());
      
      const monthlyReadingCount = monthlyReadingData?.length || 0;
      
      // Get current month saved count
      const { data: monthlySavedData, error: monthlySavedError } = await supabase
        .from('saved_articles')
        .select('id')
        .eq('user_id', user.id)
        .gte('saved_at', startOfMonth.toISOString());
      
      const monthlySavedCount = monthlySavedData?.length || 0;
      
      return res.json({
        monthlyReading: {
          current: monthlyReadingCount,
          target: 50
        },
        monthlySaved: {
          current: monthlySavedCount,
          target: 20
        }
      });
    } catch (error: any) {
      console.error('Error fetching user progress:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Database setup endpoint
  app.post(`${apiPrefix}/admin/setup-user-dashboard-tables`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Check if user is admin
      if (!user || user.user_metadata?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      // This endpoint provides instructions for manual table creation
      const instructions = `
Please run the following SQL in your Supabase SQL Editor to create the user dashboard tables:

Copy and paste the SQL from: server/create-user-dashboard-tables.sql

This will create:
- reading_history table for tracking user reading activity
- saved_articles table for user bookmarks
- user_achievements table for gamification
- user_analytics table for user behavior tracking
- achievements table for available achievements

After running the SQL, all user dashboard functionality will work properly.
      `;
      
      return res.json({ 
        success: true,
        message: 'Database setup instructions provided',
        instructions: instructions.trim(),
        sqlFile: 'server/create-user-dashboard-tables.sql'
      });
    } catch (error: any) {
      console.error('Error providing setup instructions:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}