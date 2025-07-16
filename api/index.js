// Serverless API Handler for Bengali News Website
// Compatible with Vercel, Netlify, and other serverless platforms

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Transform snake_case to camelCase
const transformKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = transformKeys(obj[key]);
      return result;
    }, {});
  }
  return obj;
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Main handler function
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  const path = url.replace('/api', '');

  try {
    // Health check
    if (path === '/health') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Categories endpoints
    if (path === '/categories') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    if (path.startsWith('/categories/')) {
      const slug = path.replace('/categories/', '');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    // Articles endpoints
    if (path === '/articles') {
      const { limit = 10, offset = 0, category } = req.query;
      
      let query = supabase
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
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    if (path === '/articles/featured') {
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
        .limit(5);
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    if (path === '/articles/latest') {
      const { limit = 10 } = req.query;
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
        .limit(parseInt(limit));
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    if (path === '/articles/popular') {
      const { limit = 5 } = req.query;
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
        .limit(parseInt(limit));
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    if (path.startsWith('/articles/') && !path.includes('/articles/latest') && !path.includes('/articles/popular') && !path.includes('/articles/featured')) {
      const slug = path.replace('/articles/', '');
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
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      // Increment view count
      await supabase
        .from('articles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
      
      return res.json(transformKeys(data));
    }

    // Search endpoint
    if (path === '/search') {
      const { q, limit = 20 } = req.query;
      
      if (!q) {
        return res.json([]);
      }

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
        .or(`title.ilike.%${q}%, content.ilike.%${q}%, excerpt.ilike.%${q}%`)
        .order('published_at', { ascending: false })
        .limit(parseInt(limit));
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    // Weather endpoints
    if (path === '/weather') {
      const { data, error } = await supabase
        .from('weather')
        .select('*');
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    if (path.startsWith('/weather/')) {
      const city = decodeURIComponent(path.replace('/weather/', ''));
      const { data, error } = await supabase
        .from('weather')
        .select('*')
        .eq('city', city)
        .single();
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    // Breaking news endpoint
    if (path === '/breaking-news') {
      const { data, error } = await supabase
        .from('breaking_news')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    // E-papers endpoints
    if (path === '/epapers') {
      const { limit = 10 } = req.query;
      const { data, error } = await supabase
        .from('epapers')
        .select('*')
        .order('publish_date', { ascending: false })
        .limit(parseInt(limit));
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    if (path === '/epapers/latest') {
      const { data, error } = await supabase
        .from('epapers')
        .select('*')
        .eq('is_latest', true)
        .single();
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    // Videos endpoints
    if (path === '/videos') {
      const { limit = 10 } = req.query;
      const { data, error } = await supabase
        .from('video_content')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(parseInt(limit));
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    if (path.startsWith('/videos/')) {
      const slug = path.replace('/videos/', '');
      const { data, error } = await supabase
        .from('video_content')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      // Increment view count
      await supabase
        .from('video_content')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
      
      return res.json(transformKeys(data));
    }

    // Audio articles endpoints
    if (path === '/audio-articles') {
      const { limit = 10 } = req.query;
      const { data, error } = await supabase
        .from('audio_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(parseInt(limit));
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    if (path.startsWith('/audio-articles/')) {
      const slug = path.replace('/audio-articles/', '');
      const { data, error } = await supabase
        .from('audio_articles')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    // Social media endpoints
    if (path === '/social-media') {
      const { limit = 10, platforms } = req.query;
      
      let query = supabase
        .from('social_media_posts')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(parseInt(limit));

      if (platforms) {
        const platformArray = platforms.split(',');
        query = query.in('platform', platformArray);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return res.json(transformKeys(data));
    }

    // 404 for unmatched routes
    return res.status(404).json({ error: 'API endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}