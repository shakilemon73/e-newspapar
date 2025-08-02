/**
 * Complete Bengali News API with Admin and AI Routes
 * Full-featured Express server for development and production
 */

import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5000',
    'https://www.dainiktni.news',
    'https://dainiktni.news',
    /\.dainiktni\.news$/,
    /\.vercel\.app$/
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic API endpoints
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Bengali News API v1.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      sitemap: '/api/sitemap',
      robots: '/api/robots',
      rss: '/api/rss',
      ogImage: '/api/og-image',
      admin: '/api/admin/*',
      ai: '/api/ai/*'
    }
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

// Import and mount admin API routes with proper error handling
let adminFunctions: any = {};
let aiRoutes: any = null;

try {
  // Dynamic import to handle potential module loading issues
  adminFunctions = require('../server/admin-api');
  console.log('✅ Admin API modules loaded successfully');
} catch (error) {
  console.warn('⚠️ Admin API modules not available:', error);
}

try {
  // Dynamic import for AI routes
  const aiModule = require('../server/ai-routes');
  aiRoutes = aiModule.aiRoutes || aiModule.default;
  
  if (aiRoutes) {
    app.use('/api', aiRoutes);
    console.log('✅ AI routes mounted successfully');
  }
} catch (error) {
  console.warn('⚠️ AI routes not available:', error);
}

// Admin Articles CRUD
app.post('/api/admin/articles', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.createArticleServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const result = await adminFunctions.createArticleServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin article create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/articles/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.updateArticleServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.updateArticleServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin article update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/articles/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.deleteArticleServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.deleteArticleServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin article delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Videos CRUD
app.post('/api/admin/videos', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.createVideoContentServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const result = await adminFunctions.createVideoContentServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin video create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/videos/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.updateVideoServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.updateVideoServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin video update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/videos/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.deleteVideoServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.deleteVideoServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin video delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Categories CRUD
app.post('/api/admin/categories', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.createCategoryServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const result = await adminFunctions.createCategoryServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin category create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/categories/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.updateCategoryServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.updateCategoryServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin category update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/categories/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.deleteCategoryServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.deleteCategoryServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin category delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin E-Papers CRUD
app.post('/api/admin/epapers', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.createEPaperServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const result = await adminFunctions.createEPaperServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin epaper create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/epapers/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.updateEPaperServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.updateEPaperServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin epaper update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/epapers/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.deleteEPaperServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.deleteEPaperServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin epaper delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Breaking News CRUD
app.post('/api/admin/breaking-news', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.createBreakingNewsServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const result = await adminFunctions.createBreakingNewsServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin breaking news create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/breaking-news/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.updateBreakingNewsServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.updateBreakingNewsServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin breaking news update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/breaking-news/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.deleteBreakingNewsServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.deleteBreakingNewsServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin breaking news delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Audio Articles CRUD
app.post('/api/admin/audio-articles', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.createAudioArticleServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const result = await adminFunctions.createAudioArticleServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin audio article create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/audio-articles/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.updateAudioArticleServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.updateAudioArticleServerSide(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin audio article update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/audio-articles/:id', async (req: Request, res: Response) => {
  try {
    if (!adminFunctions.deleteAudioArticleServerSide) {
      return res.status(503).json({ error: 'Admin functions not available' });
    }
    
    const id = parseInt(req.params.id);
    const result = await adminFunctions.deleteAudioArticleServerSide(id);
    res.json(result);
  } catch (error: any) {
    console.error('Admin audio article delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    api: 'Bengali News API',
    version: '1.0.0',
    status: 'healthy',
    modules: {
      adminFunctions: !!adminFunctions.createArticleServerSide,
      aiRoutes: !!aiRoutes
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Default handler for unmatched routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'Unknown error occurred',
    timestamp: new Date().toISOString()
  });
});

export default app;