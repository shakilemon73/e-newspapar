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
      const { limit = '10' } = req.query;
      
      const { data, error } = await supabase
        .from('epapers')
        .select('*')
        .order('publish_date', { ascending: false })
        .limit(parseInt(limit as string));

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to fetch epapers' });
      }

      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
      res.status(200).json(data || []);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}