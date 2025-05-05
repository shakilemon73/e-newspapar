import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { articlesInsertSchema, breakingNewsInsertSchema, categoriesInsertSchema, epapersInsertSchema, weatherInsertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = '/api';

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
