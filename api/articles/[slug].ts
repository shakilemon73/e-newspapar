import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../server/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug } = req.query;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('slug', slug)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Transform data to match expected format
      const transformedData = {
        ...data,
        imageUrl: data.image_url,
        publishedAt: data.published_at,
        category: data.category
      };

      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
      res.status(200).json(transformedData);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}