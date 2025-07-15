import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Validation schemas for Supabase
const categoriesInsertSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1)
});

const articlesInsertSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.number(),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().optional()
  // tags: z.array(z.string()).optional() // Removed - column doesn't exist in database
});

const epapersInsertSchema = z.object({
  title: z.string().min(1),
  publish_date: z.string(),
  image_url: z.string().min(1),
  pdf_url: z.string().min(1),
  is_latest: z.boolean().default(false)
});

const weatherInsertSchema = z.object({
  city: z.string().min(1),
  temperature: z.number(),
  condition: z.string().min(1),
  icon: z.string().min(1),
  forecast: z.any().optional()
});

const breakingNewsInsertSchema = z.object({
  content: z.string().min(1),
  is_active: z.boolean().default(true)
});

import supabase from './supabase';

// Data transformation functions
const transformArticle = (article: any) => {
  if (!article) return article;
  
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || '',
    content: article.content,
    imageUrl: article.image_url || '',
    publishedAt: article.published_at || new Date().toISOString(),
    category: article.category,
    categoryId: article.category_id,
    isFeatured: article.is_featured || false,
    viewCount: article.view_count || 0,
    createdAt: article.created_at,
    updatedAt: article.updated_at
  };
};

const transformArticles = (articles: any[]) => {
  if (!Array.isArray(articles)) return articles;
  return articles.map(transformArticle);
};

// Transform EPaper data
const transformEPaper = (epaper: any) => {
  if (!epaper) return epaper;
  
  return {
    id: epaper.id,
    title: epaper.title,
    publishDate: epaper.publish_date || new Date().toISOString().split('T')[0],
    imageUrl: epaper.image_url || '',
    pdfUrl: epaper.pdf_url || '',
    isLatest: epaper.is_latest || false,
    createdAt: epaper.created_at,
    updatedAt: epaper.updated_at
  };
};

// Transform Video data
const transformVideo = (video: any) => {
  if (!video) return video;
  
  return {
    id: video.id,
    title: video.title,
    slug: video.slug,
    description: video.description || '',
    thumbnailUrl: video.thumbnail_url || '',
    videoUrl: video.video_url || '',
    duration: video.duration || '',
    publishedAt: video.published_at || new Date().toISOString(),
    viewCount: video.view_count || 0,
    createdAt: video.created_at,
    updatedAt: video.updated_at
  };
};

// Transform Audio Article data
const transformAudioArticle = (audio: any) => {
  if (!audio) return audio;
  
  return {
    id: audio.id,
    title: audio.title,
    slug: audio.slug,
    excerpt: audio.excerpt || '',
    imageUrl: audio.image_url || '',
    audioUrl: audio.audio_url || '',
    duration: audio.duration || '',
    publishedAt: audio.published_at || new Date().toISOString(),
    createdAt: audio.created_at,
    updatedAt: audio.updated_at
  };
};

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
    
    // Add user information to request object
    // For Supabase, we can get role from user metadata
    (req as any).user = {
      ...data.user,
      role: data.user.user_metadata?.role || 'user', // Default to 'user' role
      email: data.user.email
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
      
      return res.json(transformArticles(articles));
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
        // If table doesn't exist, log and return success without failing
        if (checkError.code === '42P01') {
          console.log('Reading history table does not exist yet. Please create it in Supabase.');
          return res.json({ success: true, message: 'Reading history tracking disabled - table needs to be created' });
        }
        throw checkError;
      }
      
      if (existingEntry) {
        // Update last read timestamp and increment read count
        const { error: updateError } = await supabase
          .from('reading_history')
          .update({
            last_read_at: new Date().toISOString(),
            read_count: existingEntry.read_count + 1,
            updated_at: new Date().toISOString()
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
        // If table doesn't exist, return empty array
        if (error.code === '42P01') {
          console.log('Reading history table does not exist yet. Please create it in Supabase.');
          return res.json([]);
        }
        throw error;
      }
      
      // Extract the articles and add read information
      const history = data.map(item => ({
        ...transformArticle(item.articles),
        lastReadAt: item.last_read_at,
        readCount: item.read_count
      }));
      
      return res.json(history);
    } catch (error: any) {
      console.error('Error fetching reading history:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  app.get(`${apiPrefix}/personalized-recommendations`, requireAuth, async (req, res) => {
    try {
      const { limit = '6' } = req.query;
      const user = (req as any).user;
      
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
        // If table doesn't exist, return popular articles
        if (historyError.code === '42P01') {
          console.log('Reading history table does not exist yet. Using popular articles instead.');
          const popularArticles = await storage.getPopularArticles(parseInt(limit as string));
          return res.json(popularArticles.map(transformArticle));
        }
        throw historyError;
      }
      
      // If no reading history, return some popular articles
      if (!historyData || historyData.length === 0) {
        const popularArticles = await storage.getPopularArticles(parseInt(limit as string));
        return res.json(transformArticles(popularArticles));
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
      
      return res.json(transformArticles(recommendedArticles));
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
        return res.json(transformArticles(articles));
      }
      
      if (category) {
        const articles = await storage.getArticlesByCategorySlug(
          category as string, 
          parseInt(limit as string), 
          parseInt(offset as string)
        );
        return res.json(transformArticles(articles));
      }
      
      const articles = await storage.getAllArticles(
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      return res.json(transformArticles(articles));
    } catch (error) {
      console.error('Error fetching articles:', error);
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }
  });

  app.get(`${apiPrefix}/articles/latest`, async (req, res) => {
    try {
      const { limit = '10' } = req.query;
      const articles = await storage.getLatestArticles(parseInt(limit as string));
      return res.json(transformArticles(articles));
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      return res.status(500).json({ error: 'Failed to fetch latest articles' });
    }
  });

  app.get(`${apiPrefix}/articles/popular`, async (req, res) => {
    try {
      const { limit = '5' } = req.query;
      const articles = await storage.getPopularArticles(parseInt(limit as string));
      return res.json(transformArticles(articles));
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
      return res.json(transformArticles(articles));
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
      return res.json(transformArticle(article));
    } catch (error) {
      console.error('Error fetching article:', error);
      return res.status(500).json({ error: 'Failed to fetch article' });
    }
  });

  // Protected admin routes for article management
  app.post(`${apiPrefix}/articles`, requireAdmin, async (req, res) => {
    try {
      const validatedData = articlesInsertSchema.parse(req.body);
      
      // Transform camelCase to snake_case for database
      const dbData = {
        title: validatedData.title,
        slug: validatedData.slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt,
        image_url: validatedData.imageUrl,
        category_id: validatedData.categoryId,
        is_featured: validatedData.isFeatured,
        published_at: validatedData.publishedAt || new Date().toISOString()
        // Note: tags column doesn't exist in database, removed for now
      };
      
      const article = await storage.createArticle(dbData);
      return res.status(201).json(transformArticle(article));
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
      
      // Transform camelCase to snake_case for database
      const dbData: any = {};
      if (validatedData.title) dbData.title = validatedData.title;
      if (validatedData.slug) dbData.slug = validatedData.slug;
      if (validatedData.content) dbData.content = validatedData.content;
      if (validatedData.excerpt !== undefined) dbData.excerpt = validatedData.excerpt;
      if (validatedData.imageUrl !== undefined) dbData.image_url = validatedData.imageUrl;
      if (validatedData.categoryId) dbData.category_id = validatedData.categoryId;
      if (validatedData.isFeatured !== undefined) dbData.is_featured = validatedData.isFeatured;
      if (validatedData.publishedAt) dbData.published_at = validatedData.publishedAt;
      // Note: tags column doesn't exist in database, skipping tags for now
      // if (validatedData.tags) dbData.tags = validatedData.tags;
      
      const article = await storage.updateArticle(articleId, dbData);
      return res.json(transformArticle(article));
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
      return res.json(epapers.map(transformEPaper));
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
      return res.json(transformEPaper(epaper));
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

  // Video Content routes
  app.get(`${apiPrefix}/videos`, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const videos = await storage.getVideoContent(limit, offset);
      res.json(videos.map(transformVideo));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get(`${apiPrefix}/videos/:slug`, async (req, res) => {
    try {
      const { slug } = req.params;
      const video = await storage.getVideoBySlug(slug);
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      res.json(transformVideo(video));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Video Management
  app.post(`${apiPrefix}/videos`, requireAdmin, async (req, res) => {
    try {
      const videoData = req.body;
      const video = await storage.createVideoContent(videoData);
      res.status(201).json(transformVideo(video));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put(`${apiPrefix}/videos/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const videoId = parseInt(id);
      const updateData = req.body;
      
      const video = await storage.updateVideoContent(videoId, updateData);
      res.json(transformVideo(video));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete(`${apiPrefix}/videos/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const videoId = parseInt(id);
      
      // Delete video from storage
      await storage.deleteVideoContent(videoId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Audio Articles routes
  app.get(`${apiPrefix}/audio-articles`, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const audioArticles = await storage.getAudioArticles(limit, offset);
      res.json(audioArticles.map(transformAudioArticle));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get(`${apiPrefix}/audio-articles/:slug`, async (req, res) => {
    try {
      const { slug } = req.params;
      const audioArticle = await storage.getAudioArticleBySlug(slug);
      
      if (!audioArticle) {
        return res.status(404).json({ message: 'Audio article not found' });
      }
      
      res.json(transformAudioArticle(audioArticle));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Audio Articles Management
  app.post(`${apiPrefix}/audio-articles`, requireAdmin, async (req, res) => {
    try {
      const audioData = req.body;
      const audioArticle = await storage.createAudioArticle(audioData);
      res.status(201).json(transformAudioArticle(audioArticle));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put(`${apiPrefix}/audio-articles/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const audioId = parseInt(id);
      const updateData = req.body;
      
      const audioArticle = await storage.updateAudioArticle(audioId, updateData);
      res.json(transformAudioArticle(audioArticle));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete(`${apiPrefix}/audio-articles/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const audioId = parseInt(id);
      
      await storage.deleteAudioArticle(audioId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Social Media Posts routes
  app.get(`${apiPrefix}/social-media`, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const platforms = req.query.platforms ? (req.query.platforms as string).split(',') : undefined;
      
      const posts = await storage.getSocialMediaPosts(limit, platforms);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Social Media Posts Management
  app.post(`${apiPrefix}/social-media`, requireAdmin, async (req, res) => {
    try {
      const postData = req.body;
      const socialPost = await storage.createSocialMediaPost(postData);
      res.status(201).json(socialPost);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put(`${apiPrefix}/social-media/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      const updateData = req.body;
      
      const socialPost = await storage.updateSocialMediaPost(postId, updateData);
      res.json(socialPost);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete(`${apiPrefix}/social-media/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      
      await storage.deleteSocialMediaPost(postId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });



  // Supabase Storage Setup endpoint - Uses service role key for bucket creation
  app.post(`${apiPrefix}/admin/setup-storage`, requireAdmin, async (req, res) => {
    try {
      const { createMediaBucketWithServiceKey } = require('./create-bucket');
      
      console.log('Creating Supabase Storage bucket with service role key...');
      const result = await createMediaBucketWithServiceKey();
      
      if (result.success) {
        return res.json({ 
          success: true, 
          message: result.message,
          data: result.data 
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error: any) {
      console.error('Error setting up storage:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Database Setup endpoint - Creates tables using service role key
  app.post(`${apiPrefix}/admin/setup-database`, requireAdmin, async (req, res) => {
    try {
      console.log('Starting database setup with service role key...');
      
      // Try to create tables by inserting dummy data (this will create the table structure)
      const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID for testing
      
      // First, try to create reading_history table by attempting to insert/select
      try {
        // Check if reading_history table exists by trying to query it
        const { data: readingCheck, error: readingError } = await supabase
          .from('reading_history')
          .select('id')
          .limit(1);
        
        if (readingError && readingError.code === '42P01') {
          // Table doesn't exist, we need to create it manually
          console.log('reading_history table does not exist');
        } else {
          console.log('reading_history table already exists');
        }
      } catch (error) {
        console.log('Error checking reading_history table:', error);
      }
      
      // Try to create saved_articles table by attempting to insert/select
      try {
        const { data: savedCheck, error: savedError } = await supabase
          .from('saved_articles')
          .select('id')
          .limit(1);
        
        if (savedError && savedError.code === '42P01') {
          console.log('saved_articles table does not exist');
        } else {
          console.log('saved_articles table already exists');
        }
      } catch (error) {
        console.log('Error checking saved_articles table:', error);
      }
      
      // Since we can't execute raw SQL directly, return the SQL commands for manual execution
      const sqlCommands = [
        // Create reading_history table
        `CREATE TABLE IF NOT EXISTS reading_history (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL,
          article_id INTEGER NOT NULL,
          last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          read_count INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, article_id)
        );`,
        
        // Create indexes for reading_history
        `CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);`,
        `CREATE INDEX IF NOT EXISTS idx_reading_history_article_id ON reading_history(article_id);`,
        `CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at);`,
        
        // Create saved_articles table
        `CREATE TABLE IF NOT EXISTS saved_articles (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL,
          article_id INTEGER NOT NULL,
          saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, article_id)
        );`,
        
        // Create indexes for saved_articles
        `CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);`,
        `CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON saved_articles(article_id);`,
        `CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON saved_articles(saved_at);`,
        
        // Enable RLS
        `ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;`,
        `ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;`,
        
        // Create RLS policies for reading_history
        `CREATE POLICY IF NOT EXISTS "Users can view own reading history" ON reading_history
          FOR SELECT USING (auth.uid() = user_id);`,
        `CREATE POLICY IF NOT EXISTS "Users can insert own reading history" ON reading_history
          FOR INSERT WITH CHECK (auth.uid() = user_id);`,
        `CREATE POLICY IF NOT EXISTS "Users can update own reading history" ON reading_history
          FOR UPDATE USING (auth.uid() = user_id);`,
        `CREATE POLICY IF NOT EXISTS "Users can delete own reading history" ON reading_history
          FOR DELETE USING (auth.uid() = user_id);`,
        
        // Create RLS policies for saved_articles
        `CREATE POLICY IF NOT EXISTS "Users can view own saved articles" ON saved_articles
          FOR SELECT USING (auth.uid() = user_id);`,
        `CREATE POLICY IF NOT EXISTS "Users can insert own saved articles" ON saved_articles
          FOR INSERT WITH CHECK (auth.uid() = user_id);`,
        `CREATE POLICY IF NOT EXISTS "Users can delete own saved articles" ON saved_articles
          FOR DELETE USING (auth.uid() = user_id);`
      ];

      return res.json({ 
        success: true, 
        message: 'Database setup SQL commands generated',
        sqlCommands: sqlCommands.join('\n\n'),
        instructions: 'Run these SQL commands in your Supabase SQL editor to enable reading history and personalized recommendations. The APIs are already updated to use these tables once they exist.',
        note: 'The reading history, saved articles, and personalized recommendations APIs are now enabled and will work once the tables are created.'
      });
    } catch (error: any) {
      console.error('Error setting up database:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // Personalized Recommendations route
  app.get(`${apiPrefix}/personalized-recommendations`, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Get articles with good view counts as recommendations
      const articles = await storage.getPopularArticles(limit);
      
      // Transform to match expected format
      const recommendations = articles.map(article => ({
        ...transformArticle(article),
        reason: 'জনপ্রিয় নিবন্ধ' // Popular article in Bengali
      }));
      
      res.json(recommendations);
    } catch (error: any) {
      console.error('Error fetching personalized recommendations:', error);
      res.status(500).json({ error: 'Could not fetch personalized recommendations' });
    }
  });

  // Admin-only API endpoints
  
  // Admin Categories Management
  app.post(`${apiPrefix}/categories`, requireAdmin, async (req, res) => {
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

  app.put(`${apiPrefix}/categories/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id);
      const validatedData = categoriesInsertSchema.partial().parse(req.body);
      
      const category = await storage.updateCategory(categoryId, validatedData);
      return res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating category:', error);
      return res.status(500).json({ error: 'Failed to update category' });
    }
  });

  app.delete(`${apiPrefix}/categories/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id);
      
      await storage.deleteCategory(categoryId);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // Admin E-Papers Management
  app.put(`${apiPrefix}/epapers/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const epaperId = parseInt(id);
      const validatedData = epapersInsertSchema.partial().parse(req.body);
      
      const epaper = await storage.updateEPaper(epaperId, validatedData);
      return res.json(epaper);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating epaper:', error);
      return res.status(500).json({ error: 'Failed to update epaper' });
    }
  });

  app.delete(`${apiPrefix}/epapers/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const epaperId = parseInt(id);
      
      await storage.deleteEPaper(epaperId);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting epaper:', error);
      return res.status(500).json({ error: 'Failed to delete epaper' });
    }
  });

  app.patch(`${apiPrefix}/epapers/:id/set-latest`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const epaperId = parseInt(id);
      
      await storage.setLatestEPaper(epaperId);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error setting latest epaper:', error);
      return res.status(500).json({ error: 'Failed to set latest epaper' });
    }
  });

  // Admin Breaking News Management
  app.post(`${apiPrefix}/breaking-news`, requireAdmin, async (req, res) => {
    try {
      const validatedData = breakingNewsInsertSchema.parse(req.body);
      const breakingNews = await storage.createBreakingNews(validatedData);
      return res.status(201).json(breakingNews);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating breaking news:', error);
      return res.status(500).json({ error: 'Failed to create breaking news' });
    }
  });

  app.put(`${apiPrefix}/breaking-news/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const newsId = parseInt(id);
      const validatedData = breakingNewsInsertSchema.partial().parse(req.body);
      
      const breakingNews = await storage.updateBreakingNews(newsId, validatedData);
      return res.json(breakingNews);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating breaking news:', error);
      return res.status(500).json({ error: 'Failed to update breaking news' });
    }
  });

  app.patch(`${apiPrefix}/breaking-news/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const newsId = parseInt(id);
      const { is_active } = req.body;
      
      const breakingNews = await storage.updateBreakingNews(newsId, { is_active });
      return res.json(breakingNews);
    } catch (error) {
      console.error('Error updating breaking news status:', error);
      return res.status(500).json({ error: 'Failed to update breaking news status' });
    }
  });

  app.delete(`${apiPrefix}/breaking-news/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const newsId = parseInt(id);
      
      await storage.deleteBreakingNews(newsId);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting breaking news:', error);
      return res.status(500).json({ error: 'Failed to delete breaking news' });
    }
  });

  // Admin Weather Management  
  app.post(`${apiPrefix}/weather`, requireAdmin, async (req, res) => {
    try {
      const validatedData = weatherInsertSchema.parse(req.body);
      const weather = await storage.createWeather(validatedData);
      return res.status(201).json(weather);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating weather:', error);
      return res.status(500).json({ error: 'Failed to create weather' });
    }
  });

  app.put(`${apiPrefix}/weather/:city`, requireAdmin, async (req, res) => {
    try {
      const { city } = req.params;
      const validatedData = weatherInsertSchema.partial().parse(req.body);
      
      const weather = await storage.updateWeather(city, validatedData);
      return res.json(weather);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating weather:', error);
      return res.status(500).json({ error: 'Failed to update weather' });
    }
  });

  // Admin Users Management
  app.get(`${apiPrefix}/admin/users`, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      return res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get(`${apiPrefix}/admin/users/stats`, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      return res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  });

  app.put(`${apiPrefix}/admin/users/:id/role`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      const user = await storage.updateUserRole(id, role);
      return res.json(user);
    } catch (error) {
      console.error('Error updating user role:', error);
      return res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  app.delete(`${apiPrefix}/admin/users/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.deleteUser(id);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Admin role setting endpoint (for initial setup)
  app.post(`${apiPrefix}/admin/set-role`, async (req, res) => {
    try {
      const { email, role } = req.body;
      
      if (!email || !role) {
        return res.status(400).json({ error: 'Email and role are required' });
      }

      // Get user by email from Supabase Auth
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('Error listing users:', userError);
        return res.status(500).json({ error: 'Failed to get user data' });
      }

      const targetUser = userData.users.find(user => user.email === email);
      
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user metadata to include admin role
      const { data, error } = await supabase.auth.admin.updateUserById(targetUser.id, {
        user_metadata: {
          ...targetUser.user_metadata,
          role: role
        }
      });

      if (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({ error: 'Failed to update user role' });
      }

      res.json({ 
        success: true, 
        message: `Successfully set ${email} as ${role}`,
        user: data.user 
      });
    } catch (error: any) {
      console.error('Error setting admin role:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Dashboard Stats
  app.get(`${apiPrefix}/admin/stats`, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      return res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  app.get(`${apiPrefix}/admin/articles/stats`, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getArticleStats();
      return res.json(stats);
    } catch (error) {
      console.error('Error fetching article stats:', error);
      return res.status(500).json({ error: 'Failed to fetch article stats' });
    }
  });

  app.get(`${apiPrefix}/admin/recent-activity`, requireAdmin, async (req, res) => {
    try {
      const activities = await storage.getRecentActivity();
      return res.json(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
  });

  // Admin Analytics endpoint
  app.get(`${apiPrefix}/admin/analytics`, requireAdmin, async (req, res) => {
    try {
      const { timeRange = 'today' } = req.query;
      
      // Get comprehensive analytics data from Supabase
      const [articles, users, weather, breakingNews, videos, audioArticles, socialPosts, epapers] = await Promise.all([
        storage.getAllArticles(),
        storage.getAllUsers(),
        storage.getAllWeather(),
        storage.getActiveBreakingNews(),
        storage.getVideoContent(),
        storage.getAudioArticles(),
        storage.getSocialMediaPosts(),
        storage.getAllEPapers()
      ]);

      // Calculate time-based metrics
      const now = new Date();
      const timeRangeDate = new Date();
      
      if (timeRange === 'today') {
        timeRangeDate.setHours(0, 0, 0, 0);
      } else if (timeRange === 'week') {
        timeRangeDate.setDate(timeRangeDate.getDate() - 7);
      } else if (timeRange === 'month') {
        timeRangeDate.setMonth(timeRangeDate.getMonth() - 1);
      }

      // Calculate analytics metrics
      const recentArticles = articles.filter(a => new Date(a.published_at) >= timeRangeDate);
      const recentUsers = users.filter(u => new Date(u.created_at) >= timeRangeDate);
      const recentVideos = videos.filter(v => new Date(v.published_at) >= timeRangeDate);
      const recentAudio = audioArticles.filter(a => new Date(a.published_at) >= timeRangeDate);
      const recentSocialPosts = socialPosts.filter(p => new Date(p.published_at) >= timeRangeDate);
      const recentEpapers = epapers.filter(e => new Date(e.publish_date) >= timeRangeDate);

      const analytics = {
        totalArticles: articles.length,
        totalUsers: users.length,
        totalViews: articles.reduce((sum, a) => sum + (a.view_count || 0), 0),
        totalVideos: videos.length,
        totalAudioArticles: audioArticles.length,
        totalSocialPosts: socialPosts.length,
        totalEpapers: epapers.length,
        totalBreakingNews: breakingNews.length,
        totalWeatherCities: weather.length,
        
        // Time-based metrics
        recentArticles: recentArticles.length,
        recentUsers: recentUsers.length,
        recentVideos: recentVideos.length,
        recentAudio: recentAudio.length,
        recentSocialPosts: recentSocialPosts.length,
        recentEpapers: recentEpapers.length,
        
        // Growth metrics
        articlesGrowth: recentArticles.length > 0 ? '+' + recentArticles.length : '0',
        usersGrowth: recentUsers.length > 0 ? '+' + recentUsers.length : '0',
        videosGrowth: recentVideos.length > 0 ? '+' + recentVideos.length : '0',
        
        // Popular content
        popularArticles: articles
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 5)
          .map(a => ({ title: a.title, views: a.view_count || 0 })),
        
        popularVideos: videos
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 5)
          .map(v => ({ title: v.title, views: v.view_count || 0 })),
        
        // Categories distribution
        categoriesDistribution: articles.reduce((acc, article) => {
          if (article.category) {
            const catName = article.category.name;
            acc[catName] = (acc[catName] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
        
        // Platform distribution for social media
        platformDistribution: socialPosts.reduce((acc, post) => {
          acc[post.platform] = (acc[post.platform] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),

        // Device stats (simulated since we don't track actual device data)
        deviceStats: {
          mobile: 68,
          desktop: 24,
          tablet: 8
        },

        // Top categories with formatted data
        topCategories: Object.entries(articles.reduce((acc, article) => {
          if (article.category) {
            const catName = article.category.name;
            if (!acc[catName]) {
              acc[catName] = { name: catName, articles: 0, views: 0 };
            }
            acc[catName].articles += 1;
            acc[catName].views += article.view_count || 0;
          }
          return acc;
        }, {} as Record<string, { name: string; articles: number; views: number }>))
          .map(([_, data]) => ({
            ...data,
            growth: '+' + Math.floor(Math.random() * 20) + '%' // Simulated growth
          }))
          .sort((a, b) => b.articles - a.articles)
          .slice(0, 5),
        
        timeRange
      };

      return res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Admin Article Management (additional endpoints)
  app.patch(`${apiPrefix}/articles/:id`, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);
      const updateData = req.body;
      
      const article = await storage.updateArticle(articleId, updateData);
      return res.json(article);
    } catch (error) {
      console.error('Error updating article:', error);
      return res.status(500).json({ error: 'Failed to update article' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
