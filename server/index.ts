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
} from './admin-api';

// Import AI routes
import { aiRoutes } from './ai-routes';
// Import E-Paper routes
import epaperRoutes from './epaper-api';
import latexEpaperRoutes from './latex-epaper-api';

// Mount AI routes
app.use('/api', aiRoutes);
// Mount E-Paper routes
app.use('/api/epaper', epaperRoutes);
// Mount LaTeX E-Paper routes (Enhanced)
app.use('/api/epaper', latexEpaperRoutes);

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

// UPDATE and DELETE endpoints for CRUD functionality

// Articles UPDATE/DELETE
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

// Breaking News UPDATE/DELETE
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

// Videos UPDATE/DELETE
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

// Categories UPDATE/DELETE
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

// E-Papers UPDATE/DELETE
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

// Audio Articles UPDATE/DELETE
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

// Social Media Meta Tags Generator Endpoint
app.get('/api/social-meta/:path(*)', async (req: Request, res: Response) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const pathname = `/${req.params.path || ''}`;
    
    console.log(`[Social Meta] Request for path: ${pathname} with User-Agent: ${userAgent}`);
    
    // List of social media crawlers
    const socialCrawlers = [
      'facebookexternalhit', 'Facebot', 'Twitterbot', 'LinkedInBot',
      'Slackbot', 'TelegramBot', 'WhatsApp', 'SkypeUriPreview',
      'GoogleBot', 'Googlebot', 'Discordbot', 'DiscordBot',
      'Applebot', 'iMessageBot', 'Snapchat', 'Pinterest', 'InstagramBot',
      'redditbot', 'crawler', 'spider', 'bot'
    ];
    
    const isCrawler = socialCrawlers.some(bot => 
      userAgent.toLowerCase().includes(bot.toLowerCase())
    );
    
    if (!isCrawler) {
      console.log('[Social Meta] Not a social crawler, redirecting to main site');
      return res.redirect(`https://www.dainiktni.news${pathname}`);
    }
    
    console.log('[Social Meta] Social media crawler detected, generating meta tags...');
    
    // Import meta generator
    const { generateMetaTags, generateOGHTML } = await import('./social-meta-generator');
    
    // Generate meta tags for this path
    const metaTags = await generateMetaTags(pathname);
    
    // Generate and return HTML with OG tags
    const ogHTML = generateOGHTML(metaTags);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache for 1 hour
    res.setHeader('X-Social-Meta', 'true');
    res.send(ogHTML);
    
  } catch (error) {
    console.error('[Social Meta] Error generating meta tags:', error);
    
    // Return basic HTML on error
    const errorHTML = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>Bengali News</title>
  <meta property="og:title" content="Bengali News - বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম">
  <meta property="og:description" content="সর্বশেষ সংবাদ পড়ুন Bengali News এ।">
  <meta property="og:image" content="https://www.dainiktni.news/og-image.png">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.dainiktni.news">
</head>
<body>
  <h1>Bengali News</h1>
  <p>Loading...</p>
  <script>window.location.href = 'https://www.dainiktni.news';</script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(errorHTML);
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

  // Serve on dynamic port (frontend only)
  const port = process.env.PORT || 3000;
  server.listen({
    port: parseInt(port as string),
    host: "0.0.0.0",
  }, () => {
    log(`🚀 Frontend server with direct Supabase integration running on port ${port}`);
    log(`✅ All Express APIs replaced with direct Supabase calls`);
  });
})();
