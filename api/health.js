// Health check endpoint for Vercel serverless functions
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        deployment: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown'
      },
      supabase: {
        url: process.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
        anonKey: process.env.VITE_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      }
    };

    return new Response(JSON.stringify(health, null, 2), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'content-type': 'application/json'
      }
    });
  }
}