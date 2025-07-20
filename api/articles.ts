import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../server/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { limit = '10', offset = '0', category, featured } = req.query;
      
      let query = supabase
        .from('articles')
        .select(`
          *,
          category:categories(*)
        `)
        .order('published_at', { ascending: false });

      // Apply filters
      if (category) {
        query = query.eq('category_slug', category);
      }
      
      if (featured === 'true') {
        query = query.eq('is_featured', true);
      }

      // Apply pagination
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      query = query.range(offsetNum, offsetNum + limitNum - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to fetch articles' });
      }

      // Transform data to match expected format
      const transformedData = data?.map(article => ({
        ...article,
        imageUrl: article.image_url,
        publishedAt: article.published_at,
        category: article.category
      })) || [];

      res.status(200).json(transformedData);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}