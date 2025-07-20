import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Basic API information endpoint
  res.status(200).json({
    message: 'Bengali News Portal API',
    version: '1.0.0',
    endpoints: [
      '/api/articles',
      '/api/audio-articles', 
      '/api/categories',
      '/api/settings',
      '/api/epapers',
      '/api/breaking-news',
      '/api/videos',
      '/api/social-media',
      '/api/weather',
      '/api/polls',
      '/api/admin/*'
    ]
  });
}