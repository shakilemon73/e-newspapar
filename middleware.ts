// This file is for Vercel Edge Middleware (if using Next.js)
// For our current setup, we'll implement bot detection differently
// This is kept as reference for when deploying to Vercel with middleware support

interface NextRequest {
  nextUrl: {
    protocol: string;
    host: string;
    pathname: string;
  };
  headers: {
    get(name: string): string | null;
  };
}

interface NextResponse {
  next(): any;
}

// Social Media Bot Detection - Stack Overflow proven solution
const SOCIAL_BOTS = [
  'facebookexternalhit',
  'Facebookbot', 
  'twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'TelegramBot',
  'Slackbot',
  'vkShare',
  'RedditBot',
  'DiscordBot',
  'SkypeBot',
  'Googlebot',
  'Bingbot'
];

function isSocialBot(userAgent: string): boolean {
  if (!userAgent) return false;
  return SOCIAL_BOTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
}

// Extract article ID from URL
function extractArticleId(pathname: string): string | null {
  const articleMatch = pathname.match(/\/article\/(\d+)/);
  return articleMatch ? articleMatch[1] : null;
}

// Extract category from URL  
function extractCategory(pathname: string): string | null {
  const categoryMatch = pathname.match(/\/category\/([^\/]+)/);
  return categoryMatch ? categoryMatch[1] : null;
}

// Generate dynamic meta tags based on route
async function generateMetaTags(req: NextRequest): Promise<string> {
  const { pathname } = req.nextUrl;
  const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  
  // Default meta tags
  let title = "Bengali News - বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র";
  let description = "সর্বশেষ সংবাদ, রাজনীতি, খেলা, বিনোদন, আন্তর্জাতিক এবং আরো অনেক কিছু";
  let image = `${baseUrl}/og-image.png`;
  let url = `${baseUrl}${pathname}`;
  let type = "website";
  let keywords = "বাংলা সংবাদ, Bangladesh news, bengali news, dhaka news";

  try {
    // Article page - fetch article data
    const articleId = extractArticleId(pathname);
    if (articleId) {
      // In production, you would fetch from your API
      // For now, we'll use basic article SEO
      title = `সংবাদ আর্টিকেল ${articleId} | Bengali News`;
      description = "পড়ুন এই গুরুত্বপূর্ণ সংবাদটি Bengali News-এ";
      image = `${baseUrl}/og-article-${articleId}.png`;
      type = "article";
      keywords = `article ${articleId}, বাংলা সংবাদ, Bangladesh news`;
    }
    
    // Category page
    const category = extractCategory(pathname);
    if (category) {
      const categoryTitles: { [key: string]: string } = {
        'politics': 'রাজনীতি',
        'sports': 'খেলাধুলা', 
        'entertainment': 'বিনোদন',
        'technology': 'প্রযুক্তি',
        'business': 'ব্যবসা-বাণিজ্য',
        'international': 'আন্তর্জাতিক'
      };
      
      const categoryTitle = categoryTitles[category] || category;
      title = `${categoryTitle} - সংবাদ ও আপডেট | Bengali News`;
      description = `${categoryTitle} বিভাগের সর্বশেষ সংবাদ ও আপডেট`;
      image = `${baseUrl}/og-category-${category}.png`;
      keywords = `${category}, ${categoryTitle}, বাংলা সংবাদ`;
    }
    
    // Video page
    if (pathname.startsWith('/video/')) {
      title = "ভিডিও সংবাদ | Bengali News";
      description = "দেখুন সর্বশেষ ভিডিও সংবাদ Bengali News-এ";
      image = `${baseUrl}/og-video.png`;
      type = "video";
      keywords = "video news, ভিডিও সংবাদ, Bangladesh video";
    }
    
  } catch (error) {
    console.error('Error generating meta tags:', error);
  }

  return `
<!DOCTYPE html>
<html lang="bn" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Basic Meta Tags -->
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="Bengali News Team">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph Meta Tags (Facebook, WhatsApp, LinkedIn) -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Bengali News">
  <meta property="og:locale" content="bn_BD">
  
  <!-- Twitter Card Meta Tags (Twitter/X, Telegram preferred) -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@bengalinews">
  <meta name="twitter:creator" content="@bengalinews">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${title}">
  
  <!-- WhatsApp Specific Optimizations -->
  <meta name="theme-color" content="#075e54">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${url}">
  
  <!-- Auto-redirect for bots (preserves SEO while showing content) -->
  <script>
    if (typeof window !== 'undefined') {
      window.location.href = "${url}";
    }
  </script>
  
  <!-- Fallback meta refresh -->
  <meta http-equiv="refresh" content="0; url=${url}">
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <img src="${image}" alt="${title}" style="max-width: 100%; height: auto;">
  <p><a href="${url}">Read full article on Bengali News</a></p>
</body>
</html>
  `.trim();
}

export async function middleware(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') || '';
  const { pathname } = req.nextUrl;
  
  // Only handle social media bots for content pages
  const isContentPage = pathname.startsWith('/article/') || 
                       pathname.startsWith('/category/') || 
                       pathname.startsWith('/video/') ||
                       pathname === '/';
  
  // Skip if not a content page or not a social bot
  if (!isContentPage || !isSocialBot(userAgent)) {
    return NextResponse.next();
  }
  
  // Generate and return dynamic HTML for social bots
  try {
    const dynamicHTML = await generateMetaTags(req);
    
    return new Response(dynamicHTML, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    '/',
    '/article/:id*',
    '/category/:category*',
    '/video/:id*',
    '/audio/:id*',
    '/search',
    '/about',
    '/contact'
  ],
};