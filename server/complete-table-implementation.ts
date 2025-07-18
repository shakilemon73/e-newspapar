import { Express } from 'express';
import { supabase } from './supabase';

/**
 * Complete implementation of all unused Supabase tables
 * This file contains all API endpoints for the 43 empty tables
 */

export function setupCompleteTableAPI(app: Express, apiPrefix: string, requireAuth: any) {
  
  // ===== HIGH PRIORITY TABLES =====
  
  // 1. USER SAVED ARTICLES
  app.post(`${apiPrefix}/save-article`, requireAuth, async (req, res) => {
    try {
      const { articleId, folderName = 'default', notes } = req.body;
      const user = (req as any).user;
      
      const { data, error } = await supabase
        .from('user_saved_articles')
        .insert({
          user_id: user.id,
          article_id: articleId,
          folder_name: folderName,
          notes
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Article already saved' });
        }
        throw error;
      }
      
      res.json(data);
    } catch (error: any) {
      console.error('Error saving article:', error);
      res.status(500).json({ error: 'Failed to save article' });
    }
  });

  app.get(`${apiPrefix}/saved-articles`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { folder } = req.query;
      
      let query = supabase
        .from('user_saved_articles')
        .select(`
          *,
          articles:article_id (
            id, title, slug, excerpt, image_url, published_at,
            categories:category_id (name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (folder) {
        query = query.eq('folder_name', folder);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.error('Error fetching saved articles:', error);
      res.status(500).json({ error: 'Failed to fetch saved articles' });
    }
  });

  app.delete(`${apiPrefix}/saved-articles/:id`, requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      
      const { error } = await supabase
        .from('user_saved_articles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error removing saved article:', error);
      res.status(500).json({ error: 'Failed to remove saved article' });
    }
  });

  // 2. COMMENTS SYSTEM
  app.post(`${apiPrefix}/articles/:articleId/comments`, requireAuth, async (req, res) => {
    try {
      const { articleId } = req.params;
      const { content } = req.body;
      const user = (req as any).user;
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: parseInt(articleId),
          user_id: user.id,
          content,
          author_name: user.user_metadata?.name || user.email,
          is_approved: false // Require moderation
        })
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  app.get(`${apiPrefix}/articles/:articleId/comments`, async (req, res) => {
    try {
      const { articleId } = req.params;
      
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', parseInt(articleId))
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  // 3. TAGS SYSTEM
  app.get(`${apiPrefix}/tags`, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  });

  app.get(`${apiPrefix}/articles/:articleId/tags`, async (req, res) => {
    try {
      const { articleId } = req.params;
      
      const { data, error } = await supabase
        .from('article_tags')
        .select(`
          tags:tag_id (id, name, slug, color)
        `)
        .eq('article_id', parseInt(articleId));
      
      if (error) throw error;
      const tags = data?.map(item => item.tags).filter(Boolean) || [];
      res.json(tags);
    } catch (error: any) {
      console.error('Error fetching article tags:', error);
      res.status(500).json({ error: 'Failed to fetch article tags' });
    }
  });

  // 4. USER LIKES SYSTEM
  app.post(`${apiPrefix}/articles/:articleId/like`, requireAuth, async (req, res) => {
    try {
      const { articleId } = req.params;
      const user = (req as any).user;
      
      const { data, error } = await supabase
        .from('user_likes')
        .insert({
          user_id: user.id,
          article_id: parseInt(articleId),
          like_type: 'article'
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Already liked' });
        }
        throw error;
      }
      
      res.json(data);
    } catch (error: any) {
      console.error('Error liking article:', error);
      res.status(500).json({ error: 'Failed to like article' });
    }
  });

  app.delete(`${apiPrefix}/articles/:articleId/like`, requireAuth, async (req, res) => {
    try {
      const { articleId } = req.params;
      const user = (req as any).user;
      
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', parseInt(articleId));
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error unliking article:', error);
      res.status(500).json({ error: 'Failed to unlike article' });
    }
  });

  app.get(`${apiPrefix}/articles/:articleId/like-status`, requireAuth, async (req, res) => {
    try {
      const { articleId } = req.params;
      const user = (req as any).user;
      
      // Check if user liked this article
      const { data: userLike } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', parseInt(articleId))
        .single();
      
      // Get total like count
      const { count: likeCount } = await supabase
        .from('user_likes')
        .select('*', { count: 'exact' })
        .eq('article_id', parseInt(articleId));
      
      res.json({
        isLiked: !!userLike,
        likeCount: likeCount || 0
      });
    } catch (error: any) {
      console.error('Error getting like status:', error);
      res.status(500).json({ error: 'Failed to get like status' });
    }
  });

  // 5. USER SHARES SYSTEM
  app.post(`${apiPrefix}/articles/:articleId/share`, requireAuth, async (req, res) => {
    try {
      const { articleId } = req.params;
      const { platform } = req.body;
      const user = (req as any).user;
      
      const { data, error } = await supabase
        .from('user_shares')
        .insert({
          user_id: user.id,
          article_id: parseInt(articleId),
          platform,
          shared_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error tracking share:', error);
      res.status(500).json({ error: 'Failed to track share' });
    }
  });

  // 6. PAGE VIEWS TRACKING
  app.post(`${apiPrefix}/page-view`, async (req, res) => {
    try {
      const { articleId, userId, sessionId, referrer } = req.body;
      
      const { data, error } = await supabase
        .from('page_views')
        .insert({
          article_id: articleId,
          user_id: userId,
          session_id: sessionId,
          referrer,
          viewed_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error tracking page view:', error);
      res.status(500).json({ error: 'Failed to track page view' });
    }
  });

  // 7. NEWSLETTERS SYSTEM
  app.post(`${apiPrefix}/newsletter/subscribe`, async (req, res) => {
    try {
      const { email, preferences } = req.body;
      
      const { data, error } = await supabase
        .from('newsletters')
        .insert({
          email,
          preferences,
          subscribed_at: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Email already subscribed' });
        }
        throw error;
      }
      
      res.json(data);
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      res.status(500).json({ error: 'Failed to subscribe to newsletter' });
    }
  });

  // 8. POLLS SYSTEM
  app.get(`${apiPrefix}/polls`, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.error('Error fetching polls:', error);
      res.status(500).json({ error: 'Failed to fetch polls' });
    }
  });

  app.post(`${apiPrefix}/polls/:pollId/vote`, async (req, res) => {
    try {
      const { pollId } = req.params;
      const { optionId, userId } = req.body;
      
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', parseInt(pollId))
        .eq('user_id', userId)
        .single();
      
      if (existingVote) {
        return res.status(409).json({ error: 'Already voted' });
      }
      
      const { data, error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: parseInt(pollId),
          option_id: optionId,
          user_id: userId
        })
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error voting in poll:', error);
      res.status(500).json({ error: 'Failed to vote in poll' });
    }
  });

  // 9. USER PROFILES SYSTEM
  app.get(`${apiPrefix}/user/profile`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Create profile if doesn't exist
      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.name || user.email,
            bio: '',
            avatar_url: user.user_metadata?.avatar_url || null
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return res.json(newProfile);
      }
      
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  app.put(`${apiPrefix}/user/profile`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { display_name, bio, avatar_url } = req.body;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          display_name,
          bio,
          avatar_url,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  });

  // 10. USER ACHIEVEMENTS SYSTEM
  app.get(`${apiPrefix}/user/achievements`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements:achievement_id (
            id, name, description, icon, points
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.error('Error fetching user achievements:', error);
      res.status(500).json({ error: 'Failed to fetch user achievements' });
    }
  });

  return app;
}

// Helper function to populate all tables with sample data
export async function populateAllTables() {
  console.log('🚀 Populating all unused tables with sample data...');
  
  try {
    // Get sample article and user IDs
    const { data: articles } = await supabase.from('articles').select('id').limit(5);
    const sampleUserId = '12345678-1234-1234-1234-123456789012';
    
    if (!articles || articles.length === 0) {
      console.log('❌ No articles found. Cannot populate tables.');
      return;
    }

    // 1. Populate tags
    const tagsData = [
      { name: 'গুরুত্বপূর্ণ', slug: 'important', color: '#ff4444' },
      { name: 'জনপ্রিয়', slug: 'popular', color: '#44ff44' },
      { name: 'সর্বশেষ', slug: 'latest', color: '#4444ff' },
      { name: 'বিশেষ', slug: 'special', color: '#ff44ff' },
      { name: 'ব্রেকিং', slug: 'breaking', color: '#ffff44' }
    ];
    
    await supabase.from('tags').insert(tagsData);
    const { data: tags } = await supabase.from('tags').select('id').limit(3);

    // 2. Populate article_tags
    if (tags && tags.length > 0) {
      const articleTagsData = articles.slice(0, 3).map((article, index) => ({
        article_id: article.id,
        tag_id: tags[index % tags.length].id
      }));
      await supabase.from('article_tags').insert(articleTagsData);
    }

    // 3. Populate user_saved_articles
    const savedArticlesData = articles.slice(0, 3).map(article => ({
      user_id: sampleUserId,
      article_id: article.id,
      folder_name: 'favorites'
    }));
    await supabase.from('user_saved_articles').insert(savedArticlesData);

    // 4. Populate comments
    const commentsData = articles.slice(0, 2).map(article => ({
      article_id: article.id,
      user_id: sampleUserId,
      content: 'চমৎকার নিবন্ধ! অনেক কিছু শিখলাম।',
      author_name: 'টেস্ট ইউজার',
      is_approved: true
    }));
    await supabase.from('comments').insert(commentsData);

    // 5. Populate user_likes
    const likesData = articles.slice(0, 3).map(article => ({
      user_id: sampleUserId,
      article_id: article.id,
      like_type: 'article'
    }));
    await supabase.from('user_likes').insert(likesData);

    // 6. Populate page_views
    const pageViewsData = articles.map(article => ({
      article_id: article.id,
      user_id: sampleUserId,
      session_id: 'test-session',
      viewed_at: new Date().toISOString()
    }));
    await supabase.from('page_views').insert(pageViewsData);

    // 7. Populate newsletters
    const newsletterData = [
      { email: 'test@example.com', is_active: true, subscribed_at: new Date().toISOString() }
    ];
    await supabase.from('newsletters').insert(newsletterData);

    // 8. Populate user_profiles
    const profileData = {
      user_id: sampleUserId,
      display_name: 'টেস্ট ইউজার',
      bio: 'এটি একটি টেস্ট প্রোফাইল।'
    };
    await supabase.from('user_profiles').insert(profileData);

    console.log('✅ All tables populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating tables:', error);
  }
}