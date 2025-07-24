import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";

// ========================================
// MINIMAL EXPRESS SERVER (Frontend Only)
// All APIs replaced with direct Supabase calls
// ========================================

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Simple logging middleware for any remaining requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`[DEPRECATED] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms - Use direct Supabase instead`);
    }
  });
  next();
});

// Health check endpoint (minimal server functionality)
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Frontend server running with direct Supabase integration',
    timestamp: new Date().toISOString() 
  });
});

// ==============================================
// ADMIN API ENDPOINTS (Using Service Role Key)
// ==============================================

import { 
  createArticleServerSide, 
  createVideoContentServerSide, 
  createAudioArticleServerSide,
  createEPaperServerSide,
  createCategoryServerSide,
  createBreakingNewsServerSide 
} from './admin-api';

// Admin Articles
app.post('/api/admin/articles', async (req: Request, res: Response) => {
  try {
    const result = await createArticleServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin article create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Video Content
app.post('/api/admin/videos', async (req: Request, res: Response) => {
  try {
    const result = await createVideoContentServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin video create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Audio Articles
app.post('/api/admin/audio', async (req: Request, res: Response) => {
  try {
    const result = await createAudioArticleServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin audio create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin E-Papers
app.post('/api/admin/epapers', async (req: Request, res: Response) => {
  try {
    const result = await createEPaperServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin epaper create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Categories
app.post('/api/admin/categories', async (req: Request, res: Response) => {
  try {
    const result = await createCategoryServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin category create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Breaking News
app.post('/api/admin/breaking-news', async (req: Request, res: Response) => {
  try {
    const result = await createBreakingNewsServerSide(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Admin breaking news create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all for other deprecated API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(410).json({ 
    error: 'Express APIs have been replaced with direct Supabase calls',
    message: 'Please use the new direct Supabase API client',
    deprecatedRoute: req.path
  });
});

(async () => {
  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite for development or serve static files for production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve on port 5000 (frontend only)
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 Frontend server with direct Supabase integration running on port ${port}`);
    log(`✅ All Express APIs replaced with direct Supabase calls`);
  });
})();
