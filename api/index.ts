/**
 * Vercel-compatible API index
 * Minimal Express server for basic API endpoints
 * Admin functionality is handled by direct Supabase calls in the frontend
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
      ogImage: '/api/og-image'
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

// API status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    api: 'Bengali News API',
    version: '1.0.0',
    status: 'healthy',
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