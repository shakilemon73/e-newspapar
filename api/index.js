// Main Vercel serverless function that handles all API routes
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTExNTksImV4cCI6MjA2ODA4NzE1OX0.GEhC-77JHGe1Oshtjg3FOSFSlJe5sLeyp_wqNWk6f1s';

const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Categories endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/categories/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', req.params.slug)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(404).json({ error: 'Category not found' });
  }
});

// Articles endpoints
app.get('/api/articles', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Transform data to match frontend expectations
    const transformedData = data?.map(article => ({
      ...article,
      imageUrl: article.image_url,
      publishedAt: article.published_at,
      category: article.categories
    })) || [];
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.get('/api/articles/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    const transformedData = data?.map(article => ({
      ...article,
      imageUrl: article.image_url,
      publishedAt: article.published_at,
      category: article.categories
    })) || [];
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    res.status(500).json({ error: 'Failed to fetch featured articles' });
  }
});

app.get('/api/articles/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    const transformedData = data?.map(article => ({
      ...article,
      imageUrl: article.image_url,
      publishedAt: article.published_at,
      category: article.categories
    })) || [];
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    res.status(500).json({ error: 'Failed to fetch latest articles' });
  }
});

app.get('/api/articles/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .order('view_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    const transformedData = data?.map(article => ({
      ...article,
      imageUrl: article.image_url,
      publishedAt: article.published_at,
      category: article.categories
    })) || [];
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching popular articles:', error);
    res.status(500).json({ error: 'Failed to fetch popular articles' });
  }
});

// Breaking News
app.get('/api/breaking-news', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('breaking_news')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    res.status(500).json({ error: 'Failed to fetch breaking news' });
  }
});

// Weather
app.get('/api/weather', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('weather')
      .select('*')
      .order('city');
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

app.get('/api/weather/:city', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('weather')
      .select('*')
      .eq('city', decodeURIComponent(req.params.city))
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather for city:', error);
    res.status(404).json({ error: 'Weather data not found' });
  }
});

// E-Papers
app.get('/api/epapers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('epapers')
      .select('*')
      .order('publish_date', { ascending: false });
    
    if (error) throw error;
    
    const transformedData = data?.map(epaper => ({
      ...epaper,
      publishDate: epaper.publish_date,
      imageUrl: epaper.image_url,
      pdfUrl: epaper.pdf_url,
      isLatest: epaper.is_latest
    })) || [];
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching epapers:', error);
    res.status(500).json({ error: 'Failed to fetch epapers' });
  }
});

app.get('/api/epapers/latest', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('epapers')
      .select('*')
      .eq('is_latest', true)
      .single();
    
    if (error) throw error;
    
    const transformedData = {
      ...data,
      publishDate: data.publish_date,
      imageUrl: data.image_url,
      pdfUrl: data.pdf_url,
      isLatest: data.is_latest
    };
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching latest epaper:', error);
    res.status(404).json({ error: 'Latest epaper not found' });
  }
});

// Videos
app.get('/api/videos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('video_content')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Audio Articles
app.get('/api/audio-articles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('audio_articles')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching audio articles:', error);
    res.status(500).json({ error: 'Failed to fetch audio articles' });
  }
});

// Social Media
app.get('/api/social-media', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('social_media_posts')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching social media posts:', error);
    res.status(500).json({ error: 'Failed to fetch social media posts' });
  }
});

// Export for Vercel serverless function
module.exports = (req, res) => {
  return app(req, res);
};