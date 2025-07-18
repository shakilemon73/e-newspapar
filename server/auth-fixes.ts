import { Express, Request, Response } from 'express';
import { supabase } from './supabase';

/**
 * Fix authentication and broken API endpoints
 * This addresses the user's issues with comments, likes, newsletter signup, and other functionality
 */

// Enhanced authentication middleware with better error handling
export const requireAuth = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Bearer token is required' });
  }
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      console.error('Auth error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Add user information to request object
    (req as any).user = {
      ...data.user,
      role: data.user.user_metadata?.role || 'user',
      email: data.user.email
    };
    
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin-only middleware - requires Supabase auth with admin role
export const requireAdmin = async (req: Request, res: Response, next: Function) => {
  // First verify authentication
  await new Promise((resolve, reject) => {
    requireAuth(req, res, (error: any) => {
      if (error) reject(error);
      else resolve(null);
    });
  }).catch(() => {
    return; // Error already handled by requireAuth
  });
  
  // Check if user has admin role
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'অ্যাডমিন অনুমতি প্রয়োজন'
    });
  }
  
  next();
};

// Fix broken API endpoints
export function setupFixedAPI(app: Express) {
  const apiPrefix = '/api';

  // 1. Fix Comments System
  app.post(`${apiPrefix}/articles/:articleId/comments`, requireAuth, async (req, res) => {
    try {
      const { articleId } = req.params;
      const { content } = req.body;
      const user = (req as any).user;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content is required' });
      }
      
      const { data, error } = await supabase
        .from('article_comments')
        .insert({
          article_id: parseInt(articleId),
          user_id: user.id,
          content: content.trim(),
          author_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
          author_email: user.email,
          status: 'pending', // Require moderation
          is_approved: false,
          likes_count: 0,
          dislikes_count: 0
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating comment:', error);
        throw error;
      }
      
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
        .from('article_comments')
        .select('*')
        .eq('article_id', parseInt(articleId))
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
      
      res.json(data || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  // 2. Fix Like System
  app.post(`${apiPrefix}/articles/:articleId/like`, requireAuth, async (req, res) => {
    try {
      const { articleId } = req.params;
      const user = (req as any).user;
      
      const { data, error } = await supabase
        .from('user_likes')
        .insert({
          user_id: user.id,
          content_id: parseInt(articleId),
          content_type: 'article'
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Already liked' });
        }
        console.error('Error liking article:', error);
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
        .eq('content_id', parseInt(articleId))
        .eq('content_type', 'article');
      
      if (error) {
        console.error('Error unliking article:', error);
        throw error;
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error unliking article:', error);
      res.status(500).json({ error: 'Failed to unlike article' });
    }
  });



  // 3. Fix Newsletter Signup
  app.post(`${apiPrefix}/newsletter/subscribe`, async (req, res) => {
    try {
      const { email, preferences } = req.body;
      
      if (!email || !email.trim()) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.trim().toLowerCase(),
          preferences: preferences || {
            breaking_news: true,
            daily_digest: true,
            weekly_summary: true
          },
          subscribed_at: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Email already subscribed' });
        }
        console.error('Error subscribing to newsletter:', error);
        throw error;
      }
      
      res.json(data);
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      res.status(500).json({ error: 'Failed to subscribe to newsletter' });
    }
  });

  // 4. Fix Report Article (User Feedback)
  app.post(`${apiPrefix}/articles/:articleId/report`, async (req, res) => {
    try {
      const { articleId } = req.params;
      const { reason, description } = req.body;
      
      if (!reason || !reason.trim()) {
        return res.status(400).json({ error: 'Reason is required' });
      }
      
      const { data, error } = await supabase
        .from('user_feedback')
        .insert({
          article_id: parseInt(articleId),
          feedback_type: 'report',
          rating: null,
          comment: `Reason: ${reason}${description ? ` | Description: ${description}` : ''}`,
          metadata: { user_agent: req.headers['user-agent'] || 'Unknown' },
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error reporting article:', error);
        throw error;
      }
      
      res.json({ success: true, message: 'Report submitted successfully' });
    } catch (error: any) {
      console.error('Error reporting article:', error);
      res.status(500).json({ error: 'Failed to submit report' });
    }
  });

  // 5. Fix Save Article for Offline Reading
  app.post(`${apiPrefix}/articles/:articleId/save`, requireAuth, async (req, res) => {
    try {
      const { articleId } = req.params;
      const { folderName = 'default', notes } = req.body;
      const user = (req as any).user;
      
      const { data, error } = await supabase
        .from('user_bookmarks')
        .insert({
          user_id: user.id,
          article_id: parseInt(articleId),
          folder_name: folderName,
          notes: notes || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Article already saved' });
        }
        console.error('Error saving article:', error);
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
        .from('user_bookmarks')
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
      
      if (error) {
        console.error('Error fetching saved articles:', error);
        throw error;
      }
      
      res.json(data || []);
    } catch (error: any) {
      console.error('Error fetching saved articles:', error);
      res.status(500).json({ error: 'Failed to fetch saved articles' });
    }
  });

  console.log('✅ Authentication fixes and API endpoints setup completed');
}