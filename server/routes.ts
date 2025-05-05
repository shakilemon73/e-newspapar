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
    
    // Add user to request object
    (req as any).user = data.user;
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
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

  app.post(`${apiPrefix}/articles`, async (req, res) => {
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
