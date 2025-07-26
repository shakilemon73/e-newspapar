/**
 * Social Media Meta Tags API for React SPA
 * Generates dynamic HTML with Open Graph tags for social media crawlers
 * Works with Vercel deployment for React SPAs
 */

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Social media crawlers that need pre-rendered OG tags
const SOCIAL_CRAWLERS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'LinkedInBot/1.0',
  'Slackbot',
  'TelegramBot',
  'WhatsApp',
  'SkypeUriPreview',
  'GoogleBot',
  'Googlebot',
  'Discordbot',
  'DiscordBot',
  'Applebot',
  'iMessageBot',
  'Snapchat',
  'Pinterest',
  'InstagramBot',
  'redditbot'
];

/**
 * Check if the request is from a social media crawler
 */
function isSocialCrawler(userAgent) {
  if (!userAgent) return false;
  return SOCIAL_CRAWLERS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
}

/**
 * Fetch article data from Supabase
 */
async function fetchArticleData(slug) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase configuration');
    return null;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?slug=eq.${slug}&select=*,categories(name)`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const articles = await response.json();
      if (articles && articles.length > 0) {
        return articles[0];
      }
    }
  } catch (error) {
    console.error('Error fetching article data:', error);
  }
  
  return null;
}

/**
 * Get metadata for different routes
 */
async function getRouteMetadata(pathname, query) {
  const baseUrl = 'https://www.dainiktni.news';
  
  // Default metadata
  const defaultMeta = {
    title: 'Bengali News - বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র',
    description: 'সর্বশেষ সংবাদ, রাজনীতি, খেলা, বিনোদন, আন্তর্জাতিক এবং আরো অনেক কিছু পড়ুন বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যমে।',
    image: `${baseUrl}/og-image.png`,
    type: 'website',
    siteName: 'Bengali News',
    locale: 'bn_BD'
  };

  try {
    // Homepage
    if (pathname === '/') {
      return {
        ...defaultMeta,
        title: 'Bengali News - বাংলাদেশের প্রধান সংবাদপত্র',
        description: 'বাংলাদেশের সর্বশেষ সংবাদ, রাজনীতি, খেলাধুলা, বিনোদন, ব্যবসা এবং আন্তর্জাতিক খবর পড়ুন।'
      };
    }

    // Article pages - Fetch real article data
    if (pathname.startsWith('/article/')) {
      const slug = pathname.replace('/article/', '');
      const articleData = await fetchArticleData(slug);
      
      if (articleData) {
        // Use article's original image or generate dynamic OG image
        const articleImage = articleData.image_url || articleData.imageUrl;
        const ogImage = articleImage || `${baseUrl}/api/og-image?title=${encodeURIComponent(articleData.title)}&type=article&slug=${slug}`;
        
        // Create proper meta description from article content
        let metaDescription = '';
        if (articleData.excerpt) {
          metaDescription = articleData.excerpt.substring(0, 160);
        } else if (articleData.content) {
          // Remove HTML tags and get clean text for description
          const cleanContent = articleData.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
          metaDescription = cleanContent.substring(0, 160);
        } else {
          metaDescription = 'বিস্তারিত সংবাদ পড়ুন Bengali News এ। বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম।';
        }
        
        // Add ellipsis if description was truncated
        if (metaDescription.length === 160 && (articleData.excerpt?.length > 160 || articleData.content?.length > 160)) {
          metaDescription += '...';
        }
        
        return {
          ...defaultMeta,
          title: `${articleData.title} - Bengali News`,
          description: metaDescription,
          type: 'article',
          image: ogImage,
          publishedTime: articleData.published_at,
          author: articleData.author || 'Bengali News',
          section: articleData.categories?.name || articleData.category_name || 'সংবাদ',
          articleSection: articleData.categories?.name || articleData.category_name || 'সংবাদ',
          tags: articleData.tags || []
        };
      }
      
      // Fallback if API fails
      return {
        ...defaultMeta,
        title: `${slug.replace(/-/g, ' ')} - Bengali News`,
        description: 'বিস্তারিত সংবাদ পড়ুন Bengali News এ। বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম।',
        type: 'article',
        image: `${baseUrl}/api/og-image?title=${encodeURIComponent(slug.replace(/-/g, ' '))}&type=article`
      };
    }

    // Other routes...
    if (pathname.startsWith('/video/')) {
      const slug = pathname.replace('/video/', '');
      return {
        ...defaultMeta,
        title: `${slug.replace(/-/g, ' ')} - ভিডিও - Bengali News`,
        description: 'সর্বশেষ ভিডিও সংবাদ দেখুন Bengali News এ।',
        type: 'video.other',
        image: `${baseUrl}/api/og-image?title=${encodeURIComponent(slug.replace(/-/g, ' '))}&type=video`
      };
    }

    return defaultMeta;
  } catch (error) {
    console.error('Error generating metadata:', error);
    return defaultMeta;
  }
}

/**
 * Generate HTML with Open Graph tags
 */
function generateOGHTML(metadata, url) {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${metadata.title}</title>
  <meta name="title" content="${metadata.title}">
  <meta name="description" content="${metadata.description}">
  <meta name="keywords" content="বাংলা সংবাদ, Bangladesh news, bengali news, dhaka news, bd news, breaking news">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Bengali">
  <meta name="author" content="${metadata.siteName}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${metadata.type}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${metadata.title}">
  <meta property="og:description" content="${metadata.description}">
  <meta property="og:image" content="${metadata.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${metadata.title}">
  <meta property="og:site_name" content="${metadata.siteName}">
  <meta property="og:locale" content="${metadata.locale}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${url}">
  <meta property="twitter:title" content="${metadata.title}">
  <meta property="twitter:description" content="${metadata.description}">
  <meta property="twitter:image" content="${metadata.image}">
  <meta property="twitter:image:alt" content="${metadata.title}">
  <meta property="twitter:site" content="@bengalinews">
  <meta property="twitter:creator" content="@bengalinews">
  
  <!-- LinkedIn -->
  <meta property="linkedin:title" content="${metadata.title}">
  <meta property="linkedin:description" content="${metadata.description}">
  <meta property="linkedin:image" content="${metadata.image}">
  
  <!-- WhatsApp (uses Open Graph) -->
  <meta property="og:image:type" content="image/png">
  <meta name="theme-color" content="#075e54">
  
  <!-- Telegram (uses Open Graph) -->
  <meta property="telegram:image" content="${metadata.image}">
  
  <!-- Article specific tags -->
  ${metadata.type === 'article' ? `
  <meta property="article:author" content="${metadata.author || 'Bengali News'}">
  <meta property="article:section" content="${metadata.section || 'সংবাদ'}">
  <meta property="article:published_time" content="${metadata.publishedTime || new Date().toISOString()}">
  ${metadata.tags && Array.isArray(metadata.tags) && metadata.tags.length > 0 ? 
    metadata.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n  ') : 
    '<meta property="article:tag" content="Bengali News">'}
  ` : ''}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${url}">
  
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="shortcut icon" href="/favicon.ico">
  
  <!-- Auto-redirect for regular users -->
  <script>
    setTimeout(function() {
      window.location.href = "${url}";
    }, 100);
  </script>
</head>
<body>
  <h1>${metadata.title}</h1>
  <p>${metadata.description}</p>
  <img src="${metadata.image}" alt="${metadata.title}" style="max-width: 100%; height: auto;">
  <p><a href="${url}">Read more at Bengali News</a></p>
  <p>Redirecting...</p>
</body>
</html>`;
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const url = req.url;
    const pathname = new URL(`http://localhost${url}`).pathname;
    const searchParams = new URL(`http://localhost${url}`).searchParams;
    
    // Only process requests from social crawlers
    if (isSocialCrawler(userAgent)) {
      console.log(`Social crawler detected: ${userAgent} for ${pathname}`);
      
      // Get metadata for this route
      const metadata = await getRouteMetadata(pathname, searchParams);
      const fullUrl = `https://www.dainiktni.news${pathname}`;
      
      // Generate and return HTML with OG tags
      const ogHTML = generateOGHTML(metadata, fullUrl);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=1800'); // Cache for 30 minutes
      return res.send(ogHTML);
    }
    
    // For regular users, return 404 (this API should only be called by middleware)
    res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Social meta API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}