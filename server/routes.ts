import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { articlesInsertSchema, breakingNewsInsertSchema, categoriesInsertSchema, epapersInsertSchema, weatherInsertSchema } from "@shared/schema";
import { z } from "zod";
import supabase from './supabase';

// Middleware to verify authentication
const requireAuth = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Bearer token is required' });
  }
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Get user from database to check role
    const dbUser = await storage.getUserByEmail(data.user.email || '');
    
    if (!dbUser) {
      return res.status(401).json({ error: 'User not found in database' });
    }
    
    // Add user with role information to request object
    (req as any).user = {
      ...data.user,
      role: dbUser.role, // Include role from database
      dbUserId: dbUser.id // Include database user ID
    };
    
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to verify admin permissions
const requireAdmin = async (req: Request, res: Response, next: Function) => {
  try {
    await requireAuth(req, res, () => {
      // Check if user has admin role
      if ((req as any).user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin permission required' });
      }
      next();
    });
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = '/api';
  
  // Supabase user routes
  app.post(`${apiPrefix}/update-profile`, requireAuth, async (req, res) => {
    try {
      const { name } = req.body;
      const user = (req as any).user;
      
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          name 
        }
      });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.json({ success: true, user: data.user });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  app.post(`${apiPrefix}/update-password`, requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (req as any).user.email,
        password: currentPassword
      });
      
      if (signInError) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Update to the new password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating password:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  app.get(`${apiPrefix}/saved-articles`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      
      const { data, error } = await supabase
        .from('saved_articles')
        .select(`
          article_id,
          articles:article_id(*)
        `)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Extract the articles from the joined data
      const articles = data.map(item => item.articles);
      
      return res.json(articles);
    } catch (error: any) {
      console.error('Error fetching saved articles:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  app.post(`${apiPrefix}/save-article`, requireAuth, async (req, res) => {
    try {
      const { articleId } = req.body;
      const user = (req as any).user;
      
      // Check if article is already saved
      const { data: existingSaved, error: checkError } = await supabase
        .from('saved_articles')
        .select()
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .maybeSingle();
      
      if (checkError) {
        throw checkError;
      }
      
      if (existingSaved) {
        return res.status(400).json({ error: 'Article already saved' });
      }
      
      // Save the article
      const { data, error } = await supabase
        .from('saved_articles')
        .insert({
          user_id: user.id,
          article_id: articleId,
          saved_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Error saving article:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  app.delete(`${apiPrefix}/unsave-article/:articleId`, requireAuth, async (req, res) => {
    try {
      const { articleId } = req.params;
      const user = (req as any).user;
      
      const { error } = await supabase
        .from('saved_articles')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);
      
      if (error) {
        throw error;
      }
      
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Error unsaving article:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Reading history routes
  app.post(`${apiPrefix}/track-reading`, requireAuth, async (req, res) => {
    try {
      const { articleId } = req.body;
      const user = (req as any).user;
      
      // Check if this article is already in reading history
      const { data: existingEntry, error: checkError } = await supabase
        .from('reading_history')
        .select()
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .maybeSingle();
      
      if (checkError) {
        throw checkError;
      }
      
      if (existingEntry) {
        // Update last read timestamp
        const { error: updateError } = await supabase
          .from('reading_history')
          .update({
            last_read_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
        
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new reading history entry
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
      
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Error tracking reading history:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  app.get(`${apiPrefix}/reading-history`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { limit = '20', offset = '0' } = req.query;
      
      const { data, error } = await supabase
        .from('reading_history')
        .select(`
          id,
          last_read_at,
          read_count,
          articles:article_id(*)
        `)
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false })
        .range(
          parseInt(offset as string), 
          parseInt(offset as string) + parseInt(limit as string) - 1
        );
      
      if (error) {
        throw error;
      }
      
      // Extract the articles and add read information
      const history = data.map(item => ({
        ...item.articles,
        last_read_at: item.last_read_at,
        read_count: item.read_count
      }));
      
      return res.json(history);
    } catch (error: any) {
      console.error('Error fetching reading history:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  app.get(`${apiPrefix}/personalized-recommendations`, requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { limit = '6' } = req.query;
      
      // First get the user's reading history to determine category preferences
      const { data: historyData, error: historyError } = await supabase
        .from('reading_history')
        .select(`
          article_id,
          articles:article_id(category_id, category:category_id(id, name))
        `)
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false })
        .limit(10);
      
      if (historyError) {
        throw historyError;
      }
      
      // If no reading history, return some popular articles
      if (!historyData || historyData.length === 0) {
        const popularArticles = await storage.getPopularArticles(parseInt(limit as string));
        return res.json(popularArticles);
      }
      
      // Extract category IDs from reading history and count occurrences
      const categoryCount: { [key: number]: number } = {};
      historyData.forEach(item => {
        try {
          // Using type assertion to access properties safely
          const articleData = item.articles as any;
          if (articleData) {
            let categoryId = null;
            
            // Try different ways to get the category ID
            if (articleData.category_id) {
              categoryId = articleData.category_id;
            } else if (articleData.category && typeof articleData.category === 'object') {
              categoryId = articleData.category.id;
            }
            
            if (categoryId) {
              categoryCount[categoryId] = (categoryCount[categoryId] || 0) + 1;
            }
          }
        } catch (error) {
          console.error('Error accessing category from article:', error);
        }
      });
      
      // Sort categories by frequency
      const sortedCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .map(entry => parseInt(entry[0]));
      
      // Get articles from the top 3 categories (or fewer if less than 3 categories)
      const topCategories = sortedCategories.slice(0, 3);
      
      let recommendedArticles: any[] = [];
      
      // Get articles from each top category
      for (const categoryId of topCategories) {
        const articlesPerCategory = Math.ceil(parseInt(limit as string) / topCategories.length);
        
        // Get already read article IDs to exclude them
        const { data: readData, error: readError } = await supabase
          .from('reading_history')
          .select('article_id')
          .eq('user_id', user.id);
        
        if (readError) {
          throw readError;
        }
        
        const readArticleIds = readData.map(item => item.article_id);
        
        // Get articles from this category, excluding already read ones
        const categoryArticles = await storage.getArticlesByCategory(
          categoryId, 
          articlesPerCategory,
          0
        );
        
        // Filter out articles the user has already read
        const filteredArticles = categoryArticles.filter(
          article => !readArticleIds.includes(article.id)
        );
        
        recommendedArticles = [...recommendedArticles, ...filteredArticles];
      }
      
      // If we don't have enough articles, add some popular ones
      if (recommendedArticles.length < parseInt(limit as string)) {
        const popularArticles = await storage.getPopularArticles(
          parseInt(limit as string) - recommendedArticles.length
        );
        
        // Avoid duplicates
        const existingIds = recommendedArticles.map(a => a.id);
        const filteredPopular = popularArticles.filter(a => !existingIds.includes(a.id));
        
        recommendedArticles = [...recommendedArticles, ...filteredPopular];
      }
      
      // Limit to the requested number
      recommendedArticles = recommendedArticles.slice(0, parseInt(limit as string));
      
      return res.json(recommendedArticles);
    } catch (error: any) {
      console.error('Error fetching personalized recommendations:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // Categories routes
  app.get(`${apiPrefix}/categories`, async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      return res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.get(`${apiPrefix}/categories/:slug`, async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      return res.status(500).json({ error: 'Failed to fetch category' });
    }
  });

  app.post(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const validatedData = categoriesInsertSchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      return res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating category:', error);
      return res.status(500).json({ error: 'Failed to create category' });
    }
  });

  // Articles routes
  app.get(`${apiPrefix}/articles`, async (req, res) => {
    try {
      const { limit = '10', offset = '0', category, featured } = req.query;
      
      if (featured === 'true') {
        const articles = await storage.getFeaturedArticles(parseInt(limit as string));
        return res.json(articles);
      }
      
      if (category) {
        const articles = await storage.getArticlesByCategorySlug(
          category as string, 
          parseInt(limit as string), 
          parseInt(offset as string)
        );
        return res.json(articles);
      }
      
      const articles = await storage.getAllArticles(
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      return res.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }
  });

  app.get(`${apiPrefix}/articles/latest`, async (req, res) => {
    try {
      const { limit = '10' } = req.query;
      const articles = await storage.getLatestArticles(parseInt(limit as string));
      return res.json(articles);
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      return res.status(500).json({ error: 'Failed to fetch latest articles' });
    }
  });

  app.get(`${apiPrefix}/articles/popular`, async (req, res) => {
    try {
      const { limit = '5' } = req.query;
      const articles = await storage.getPopularArticles(parseInt(limit as string));
      return res.json(articles);
    } catch (error) {
      console.error('Error fetching popular articles:', error);
      return res.status(500).json({ error: 'Failed to fetch popular articles' });
    }
  });

  app.get(`${apiPrefix}/articles/search`, async (req, res) => {
    try {
      const { q, limit = '10', offset = '0' } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const articles = await storage.searchArticles(
        q as string, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      return res.json(articles);
    } catch (error) {
      console.error('Error searching articles:', error);
      return res.status(500).json({ error: 'Failed to search articles' });
    }
  });

  app.get(`${apiPrefix}/articles/:slug`, async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getArticleBySlug(slug);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      return res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      return res.status(500).json({ error: 'Failed to fetch article' });
    }
  });

  // Protected admin routes for article management
  app.post(`${apiPrefix}/articles`, requireAdmin, async (req, res) => {
    try {
      const validatedData = articlesInsertSchema.parse(req.body);
      const article = await storage.createArticle(validatedData);
      return res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating article:', error);
      return res.status(500).json({ error: 'Failed to create article' });
    }
  });
  
  // Update article
  app.put(`${apiPrefix}/articles/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);
      const validatedData = articlesInsertSchema.partial().parse(req.body);
      
      // Check if article exists
      const existingArticle = await storage.getArticleById(articleId);
      if (!existingArticle) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      const article = await storage.updateArticle(articleId, validatedData);
      return res.json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating article:', error);
      return res.status(500).json({ error: 'Failed to update article' });
    }
  });
  
  // Delete article
  app.delete(`${apiPrefix}/articles/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);
      
      // Check if article exists
      const existingArticle = await storage.getArticleById(articleId);
      if (!existingArticle) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      await storage.deleteArticle(articleId);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting article:', error);
      return res.status(500).json({ error: 'Failed to delete article' });
    }
  });

  // EPaper routes
  app.get(`${apiPrefix}/epapers`, async (req, res) => {
    try {
      const { limit = '10', offset = '0' } = req.query;
      const epapers = await storage.getAllEPapers(
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      return res.json(epapers);
    } catch (error) {
      console.error('Error fetching epapers:', error);
      return res.status(500).json({ error: 'Failed to fetch epapers' });
    }
  });

  app.get(`${apiPrefix}/epapers/latest`, async (req, res) => {
    try {
      const epaper = await storage.getLatestEPaper();
      if (!epaper) {
        return res.status(404).json({ error: 'No e-paper found' });
      }
      return res.json(epaper);
    } catch (error) {
      console.error('Error fetching latest epaper:', error);
      return res.status(500).json({ error: 'Failed to fetch latest epaper' });
    }
  });

  app.post(`${apiPrefix}/epapers`, async (req, res) => {
    try {
      const validatedData = epapersInsertSchema.parse(req.body);
      const epaper = await storage.createEPaper(validatedData);
      return res.status(201).json(epaper);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating epaper:', error);
      return res.status(500).json({ error: 'Failed to create epaper' });
    }
  });

  // Weather routes
  app.get(`${apiPrefix}/weather`, async (_req, res) => {
    try {
      const weather = await storage.getAllWeather();
      return res.json(weather);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });

  app.get(`${apiPrefix}/weather/:city`, async (req, res) => {
    try {
      const { city } = req.params;
      const weatherData = await storage.getWeatherByCity(city);
      if (!weatherData) {
        return res.status(404).json({ error: 'Weather data not found for this city' });
      }
      return res.json(weatherData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });

  app.post(`${apiPrefix}/weather/:city`, async (req, res) => {
    try {
      const { city } = req.params;
      const validatedData = weatherInsertSchema.omit({ id: true, city: true }).parse(req.body);
      const weatherData = await storage.updateWeather(city, validatedData);
      return res.status(201).json(weatherData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating weather data:', error);
      return res.status(500).json({ error: 'Failed to update weather data' });
    }
  });

  // Breaking News routes
  app.get(`${apiPrefix}/breaking-news`, async (_req, res) => {
    try {
      const news = await storage.getActiveBreakingNews();
      return res.json(news);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      return res.status(500).json({ error: 'Failed to fetch breaking news' });
    }
  });

  app.post(`${apiPrefix}/breaking-news`, async (req, res) => {
    try {
      const validatedData = breakingNewsInsertSchema.parse(req.body);
      const news = await storage.createBreakingNews(validatedData);
      return res.status(201).json(news);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating breaking news:', error);
      return res.status(500).json({ error: 'Failed to create breaking news' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
