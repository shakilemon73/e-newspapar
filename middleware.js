/**
 * Vercel Edge Middleware for Dynamic Open Graph Tags
 * Detects social media crawlers and serves optimized HTML with proper meta tags
 * Based on Stack Overflow best practices and official Vercel documentation
 */

import { NextResponse } from 'next/server';

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

// Routes that need dynamic OG tags
const OG_ROUTES = [
  '/article/',
  '/video/',
  '/audio/',
  '/category/',
  '/epaper',
  '/search',
  '/videos',
  '/audio-articles'
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
 * Check if the route needs dynamic OG tags
 */
function needsOGTags(pathname) {
  return OG_ROUTES.some(route => pathname.startsWith(route)) || pathname === '/';
}

/**
 * Extract metadata based on route
 */
async function getRouteMetadata(pathname, searchParams) {
  const baseUrl = 'https://www.dainiktni.news';
  
  // Default Bengali news site metadata
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

    // Article pages
    if (pathname.startsWith('/article/')) {
      const slug = pathname.replace('/article/', '');
      return {
        ...defaultMeta,
        title: `${slug.replace(/-/g, ' ')} - Bengali News`,
        description: 'বিস্তারিত সংবাদ পড়ুন Bengali News এ। বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম।',
        type: 'article',
        image: `${baseUrl}/api/og-image?title=${encodeURIComponent(slug.replace(/-/g, ' '))}&type=article`
      };
    }

    // Video pages
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

    // Audio pages
    if (pathname.startsWith('/audio/')) {
      const slug = pathname.replace('/audio/', '');
      return {
        ...defaultMeta,
        title: `${slug.replace(/-/g, ' ')} - অডিও - Bengali News`,
        description: 'অডিও সংবাদ শুনুন Bengali News এ।',
        type: 'music.song',
        image: `${baseUrl}/api/og-image?title=${encodeURIComponent(slug.replace(/-/g, ' '))}&type=audio`
      };
    }

    // Category pages
    if (pathname.startsWith('/category/')) {
      const slug = pathname.replace('/category/', '');
      const categoryName = slug.replace(/-/g, ' ');
      return {
        ...defaultMeta,
        title: `${categoryName} - Bengali News`,
        description: `${categoryName} বিভাগের সর্বশেষ সংবাদ পড়ুন Bengali News এ।`,
        image: `${baseUrl}/api/og-image?title=${encodeURIComponent(categoryName)}&type=category`
      };
    }

    // Videos section
    if (pathname === '/videos') {
      return {
        ...defaultMeta,
        title: 'ভিডিও সংবাদ - Bengali News',
        description: 'সর্বশেষ ভিডিও সংবাদ এবং ভিডিও রিপোর্ট দেখুন Bengali News এ।',
        image: `${baseUrl}/api/og-image?title=ভিডিও সংবাদ&type=videos`
      };
    }

    // Audio articles section
    if (pathname === '/audio-articles') {
      return {
        ...defaultMeta,
        title: 'অডিও সংবাদ - Bengali News',
        description: 'সংবাদ শুনুন আমাদের অডিও সংবাদ সেবায়। Bengali News এর অডিও রিপোর্ট।',
        image: `${baseUrl}/api/og-image?title=অডিও সংবাদ&type=audio`
      };
    }

    // E-Paper
    if (pathname === '/epaper') {
      return {
        ...defaultMeta,
        title: 'ই-পেপার - Bengali News',
        description: 'আজকের পত্রিকা অনলাইনে পড়ুন। Bengali News এর ডিজিটাল পত্রিকা।',
        image: `${baseUrl}/api/og-image?title=ই-পেপার&type=epaper`
      };
    }

    // Search page
    if (pathname === '/search') {
      const query = searchParams.get('q') || '';
      return {
        ...defaultMeta,
        title: query ? `"${query}" অনুসন্ধান - Bengali News` : 'অনুসন্ধান - Bengali News',
        description: query ? `"${query}" সম্পর্কিত সংবাদ খুঁজুন Bengali News এ।` : 'Bengali News এ সংবাদ খুঁজুন।',
        image: `${baseUrl}/api/og-image?title=${encodeURIComponent(query || 'অনুসন্ধান')}&type=search`
      };
    }

    return defaultMeta;
  } catch (error) {
    console.error('Error generating metadata:', error);
    return defaultMeta;
  }
}

/**
 * Generate HTML with Open Graph tags for social media crawlers
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
  <meta property="article:author" content="${metadata.siteName}">
  <meta property="article:section" content="News">
  <meta property="article:published_time" content="${new Date().toISOString()}">
  ` : ''}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${url}">
  
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="shortcut icon" href="/favicon.ico">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${metadata.type === 'article' ? 'NewsArticle' : 'WebSite'}",
    "name": "${metadata.title}",
    "headline": "${metadata.title}",
    "description": "${metadata.description}",
    "image": "${metadata.image}",
    "url": "${url}",
    "publisher": {
      "@type": "Organization",
      "name": "${metadata.siteName}",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.dainiktni.news/logo.png"
      }
    },
    "inLanguage": "bn",
    "dateModified": "${new Date().toISOString()}"
  }
  </script>
  
  <!-- Auto-redirect for crawlers that support JavaScript -->
  <script>
    if (window.location.href !== "${url}") {
      window.location.href = "${url}";
    }
  </script>
</head>
<body>
  <h1>${metadata.title}</h1>
  <p>${metadata.description}</p>
  <img src="${metadata.image}" alt="${metadata.title}" style="max-width: 100%; height: auto;">
  <p><a href="${url}">Read more at Bengali News</a></p>
</body>
</html>`;
}

/**
 * Main middleware function
 */
export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Only process requests from social crawlers for routes that need OG tags
  if (isSocialCrawler(userAgent) && needsOGTags(pathname)) {
    try {
      // Get metadata for this route
      const metadata = getRouteMetadata(pathname, searchParams);
      const fullUrl = request.url;
      
      // Generate and return HTML with OG tags
      const ogHTML = generateOGHTML(metadata, fullUrl);
      
      return new Response(ogHTML, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (error) {
      console.error('Middleware error:', error);
      // Fall through to normal response on error
    }
  }

  // For non-crawler requests or routes that don't need OG tags, continue normally
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (asset files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};