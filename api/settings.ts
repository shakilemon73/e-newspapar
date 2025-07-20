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
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to fetch settings' });
      }

      // Return default settings if none found
      const settings = data || {
        siteName: "Emon's Daily News",
        siteDescription: "বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র",
        logoUrl: "",
        defaultLanguage: "bn",
        siteUrl: "https://emonsdaily.com"
      };

      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      res.status(200).json(settings);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}