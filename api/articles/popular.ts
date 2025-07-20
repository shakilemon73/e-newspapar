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

  try {
    if (req.method === 'GET') {
      const { limit = '5', timeRange = 'daily' } = req.query;
      
      let query = supabase
        .from('articles')
        .select(`
          *,
          category:categories(*)
        `)
        .order('view_count', { ascending: false })
        .limit(parseInt(limit as string));

      // For time-based filtering, we'd typically filter by date
      // but for now, just return most viewed overall
      
      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to fetch popular articles' });
      }

      // Transform data to match expected format
      const transformedData = data?.map(article => ({
        ...article,
        imageUrl: article.image_url,
        publishedAt: article.published_at,
        viewCount: article.view_count || 0,
        category: article.category
      })) || [];

      res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');
      res.status(200).json(transformedData);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}