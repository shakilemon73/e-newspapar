/**
 * Static Open Graph Image API (Edge-compatible)
 * Returns static OG images without @vercel/og dependency
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    
    const title = searchParams.get('title') || 'Bengali News Time';
    const type = searchParams.get('type') || 'article';
    
    // For Edge compatibility, redirect to static images instead of generating dynamic ones
    const baseUrl = 'https://www.dainiktni.news';
    
    // Map content types to appropriate static images
    const imageMap = {
      article: `${baseUrl}/og-image.png`,
      video: `${baseUrl}/og-image.svg`,
      audio: `${baseUrl}/og-image.svg`,
      category: `${baseUrl}/og-image.svg`,
      search: `${baseUrl}/og-image.svg`,
      epaper: `${baseUrl}/og-image.svg`,
      videos: `${baseUrl}/og-image.svg`,
      default: `${baseUrl}/og-image.png`
    };
    
    const imageUrl = imageMap[type] || imageMap.default;
    
    // Redirect to the appropriate static image
    return Response.redirect(imageUrl, 302);
    
  } catch (error) {
    console.error('OG Image API error:', error);
    
    // Fallback to default static image
    const defaultImage = 'https://www.dainiktni.news/og-image.png';
    return Response.redirect(defaultImage, 302);
  }
}