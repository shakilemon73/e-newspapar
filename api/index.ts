// Vercel serverless function entry point
// This file serves as the main entry point for all API routes when deployed on Vercel

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
// Cors will be handled by vercel.json headers
import path from "path";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// CORS headers handled by Vercel configuration

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Request logging with performance monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Bengali News API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import and mount admin API routes
import { 
  createArticleServerSide, 
  createVideoContentServerSide, 
  createAudioArticleServerSide,
  createEPaperServerSide,
  createCategoryServerSide,
  createBreakingNewsServerSide,
  updateArticleServerSide,
  deleteArticleServerSide,
  updateBreakingNewsServerSide,
  deleteBreakingNewsServerSide,
  updateVideoServerSide,
  deleteVideoServerSide,
  updateCategoryServerSide,
  deleteCategoryServerSide,
  updateEPaperServerSide,
  deleteEPaperServerSide,
  updateAudioArticleServerSide,
  deleteAudioArticleServerSide
} from '../server/admin-api';

// Import AI routes
import { aiRoutes } from '../server/ai-routes';

// Mount AI routes
app.use('/api', aiRoutes);

// Admin Articles CRUD
app.post('/api/admin/articles', async (req: Request, res: Response) => {
  try {
    const result = await createArticleServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin article create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/articles/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await updateArticleServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin article update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/articles/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteArticleServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin article delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Videos CRUD
app.post('/api/admin/videos', async (req: Request, res: Response) => {
  try {
    const result = await createVideoContentServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin video create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/videos/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await updateVideoServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin video update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/videos/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteVideoServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin video delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Categories CRUD
app.post('/api/admin/categories', async (req: Request, res: Response) => {
  try {
    const result = await createCategoryServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin category create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/categories/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await updateCategoryServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin category update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/categories/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteCategoryServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin category delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Breaking News CRUD
app.post('/api/admin/breaking-news', async (req: Request, res: Response) => {
  try {
    const result = await createBreakingNewsServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin breaking news create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/breaking-news/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await updateBreakingNewsServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin breaking news update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/breaking-news/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteBreakingNewsServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin breaking news delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin E-Papers CRUD
app.post('/api/admin/epapers', async (req: Request, res: Response) => {
  try {
    const result = await createEPaperServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin e-paper create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/epapers/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await updateEPaperServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin e-paper update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/epapers/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteEPaperServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin e-paper delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Audio Articles CRUD
app.post('/api/admin/audio', async (req: Request, res: Response) => {
  try {
    const result = await createAudioArticleServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin audio create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/audio/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await updateAudioArticleServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin audio update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/audio/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deleteAudioArticleServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin audio delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export the Express app for Vercel serverless functions
export default app;