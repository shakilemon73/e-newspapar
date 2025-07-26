/**
 * Social Media Crawler Detection and Meta Tag Generation
 * This API detects social media crawlers and serves them optimized HTML with proper Open Graph tags
 * Designed specifically for React SPAs deployed on Vercel
 */

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Social media crawlers that need pre-rendered meta tags
const SOCIAL_CRAWLERS = [
  // Facebook
  'facebookexternalhit', 'Facebot',
  // Twitter/X
  'Twitterbot', 'twitterbot',
  // LinkedIn
  'LinkedInBot', 'LinkedInBot/1.0', 'linkedin',
  // Slack
  'Slackbot', 'Slackbot-LinkExpanding',
  // Telegram
  'TelegramBot', 'telegram',
  // WhatsApp
  'WhatsApp', 'whatsapp',
  // Skype
  'SkypeUriPreview',
  // Discord
  'Discordbot', 'DiscordBot', 'discord',
  // Google
  'GoogleBot', 'Googlebot', 'Google-Structured-Data-Testing-Tool',
  // Apple
  'Applebot', 'iMessageBot',
  // Other platforms
  'Snapchat', 'Pinterest', 'InstagramBot', 'redditbot',
  // Generic crawlers
  'crawler', 'spider', 'bot'
];

/**
 * Check if the request is from a social media crawler
 */
function isSocialCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return SOCIAL_CRAWLERS.some(bot => ua.includes(bot.toLowerCase()));
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
    console.log(`Fetching article data for slug: ${slug}`);
    
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
        console.log(`Found article: ${articles[0].title}`);
        return articles[0];
      }
    } else {
      console.error('Supabase response error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error fetching article data:', error);
  }
  
  return null;
}

/**
 * Generate meta tags based on route and data
 */
async function generateMetaTags(pathname, query) {
  const baseUrl = 'https://www.dainiktni.news';
  
  // Default meta tags
  const defaultMeta = {
    title: 'Bengali News - বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র',
    description: 'সর্বশেষ সংবাদ, রাজনীতি, খেলা, বিনোদন, আন্তর্জাতিক এবং আরো অনেক কিছু পড়ুন বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যমে।',
    image: `${baseUrl}/og-image.png`,
    type: 'website',
    siteName: 'Bengali News',
    locale: 'bn_BD',
    url: `${baseUrl}${pathname}`
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
      const slug = pathname.replace('/article/', '').replace(/\/$/, '');
      
      if (slug) {
        const articleData = await fetchArticleData(slug);
        
        if (articleData) {
          // Use article's original image or generate dynamic OG image
          const articleImage = articleData.image_url || articleData.imageUrl;
          let ogImage;
          
          if (articleImage && (articleImage.startsWith('http') || articleImage.startsWith('//'))) {
            ogImage = articleImage;
          } else {
            ogImage = `${baseUrl}/api/og-image?title=${encodeURIComponent(articleData.title)}&type=article&slug=${slug}`;
          }
          
          // Create meta description from article content
          let metaDescription = '';
          if (articleData.excerpt && articleData.excerpt.trim()) {
            metaDescription = articleData.excerpt.substring(0, 160);
          } else if (articleData.content && articleData.content.trim()) {
            // Remove HTML tags and get clean text for description
            const cleanContent = articleData.content
              .replace(/<[^>]*>/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            metaDescription = cleanContent.substring(0, 160);
          } else {
            metaDescription = `${articleData.title} - বিস্তারিত সংবাদ পড়ুন Bengali News এ।`;
          }
          
          // Add ellipsis if truncated
          if (metaDescription.length === 160) {
            metaDescription += '...';
          }
          
          return {
            ...defaultMeta,
            title: `${articleData.title} - Bengali News`,
            description: metaDescription,
            type: 'article',
            image: ogImage,
            url: `${baseUrl}/article/${slug}`,
            publishedTime: articleData.published_at,
            modifiedTime: articleData.updated_at || articleData.published_at,
            author: articleData.author || 'Bengali News',
            section: articleData.categories?.name || articleData.category_name || 'সংবাদ',
            tags: articleData.tags || []
          };
        }
      }
      
      // Fallback for article pages without data
      const fallbackTitle = slug ? slug.replace(/-/g, ' ') : 'সংবাদ';
      return {
        ...defaultMeta,
        title: `${fallbackTitle} - Bengali News`,
        description: 'বিস্তারিত সংবাদ পড়ুন Bengali News এ। বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম।',
        type: 'article',
        image: `${baseUrl}/api/og-image?title=${encodeURIComponent(fallbackTitle)}&type=article`,
        url: `${baseUrl}/article/${slug}`
      };
    }

    // Video pages
    if (pathname.startsWith('/video/')) {
      const slug = pathname.replace('/video/', '').replace(/\/$/, '');
      const videoTitle = slug ? slug.replace(/-/g, ' ') : 'ভিডিও';
      return {
        ...defaultMeta,
        title: `${videoTitle} - ভিডিও সংবাদ - Bengali News`,
        description: 'সর্বশেষ ভিডিও সংবাদ দেখুন Bengali News এ।',
        type: 'video.other',
        image: `${baseUrl}/api/og-image?title=${encodeURIComponent(videoTitle)}&type=video`,
        url: `${baseUrl}/video/${slug}`
      };
    }

    // Category pages
    if (pathname.startsWith('/category/')) {
      const slug = pathname.replace('/category/', '').replace(/\/$/, '');
      const categoryName = slug ? slug.replace(/-/g, ' ') : 'বিভাগ';
      return {
        ...defaultMeta,
        title: `${categoryName} - Bengali News`,
        description: `${categoryName} বিভাগের সর্বশেষ সংবাদ পড়ুন Bengali News এ।`,
        image: `${baseUrl}/api/og-image?title=${encodeURIComponent(categoryName)}&type=category`,
        url: `${baseUrl}/category/${slug}`
      };
    }

    // Other specific pages
    const pageRoutes = {
      '/videos': {
        title: 'ভিডিও সংবাদ - Bengali News',
        description: 'সর্বশেষ ভিডিও সংবাদ এবং ভিডিও রিপোর্ট দেখুন Bengali News এ।',
        image: `${baseUrl}/api/og-image?title=ভিডিও সংবাদ&type=videos`
      },
      '/audio-articles': {
        title: 'অডিও সংবাদ - Bengali News',
        description: 'সংবাদ শুনুন আমাদের অডিও সংবাদ সেবায়। Bengali News এর অডিও রিপোর্ট।',
        image: `${baseUrl}/api/og-image?title=অডিও সংবাদ&type=audio`
      },
      '/epaper': {
        title: 'ই-পেপার - Bengali News',
        description: 'আজকের পত্রিকা অনলাইনে পড়ুন। Bengali News এর ডিজিটাল পত্রিকা।',
        image: `${baseUrl}/api/og-image?title=ই-পেপার&type=epaper`
      },
      '/search': {
        title: 'অনুসন্ধান - Bengali News',
        description: 'Bengali News এ সংবাদ খুঁজুন।',
        image: `${baseUrl}/api/og-image?title=অনুসন্ধান&type=search`
      }
    };

    if (pageRoutes[pathname]) {
      return {
        ...defaultMeta,
        ...pageRoutes[pathname],
        url: `${baseUrl}${pathname}`
      };
    }

    return defaultMeta;
  } catch (error) {
    console.error('Error generating meta tags:', error);
    return defaultMeta;
  }
}

/**
 * Generate HTML with proper Open Graph tags
 */
function generateSocialHTML(meta) {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${meta.title}</title>
  <meta name="title" content="${meta.title}">
  <meta name="description" content="${meta.description}">
  <meta name="keywords" content="বাংলা সংবাদ, Bangladesh news, bengali news, dhaka news, bd news, breaking news">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Bengali">
  <meta name="author" content="${meta.siteName}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${meta.type}">
  <meta property="og:url" content="${meta.url}">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:image" content="${meta.image}">
  <meta property="og:image:secure_url" content="${meta.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${meta.title}">
  <meta property="og:site_name" content="${meta.siteName}">
  <meta property="og:locale" content="${meta.locale}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${meta.url}">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  <meta name="twitter:image" content="${meta.image}">
  <meta name="twitter:image:alt" content="${meta.title}">
  <meta name="twitter:site" content="@bengalinews">
  <meta name="twitter:creator" content="@bengalinews">
  
  <!-- LinkedIn -->
  <meta property="linkedin:title" content="${meta.title}">
  <meta property="linkedin:description" content="${meta.description}">
  <meta property="linkedin:image" content="${meta.image}">
  
  <!-- WhatsApp -->
  <meta property="og:image:type" content="image/png">
  <meta name="theme-color" content="#075e54">
  
  <!-- Article-specific tags -->
  ${meta.type === 'article' ? `
  <meta property="article:author" content="${meta.author || 'Bengali News'}">
  <meta property="article:section" content="${meta.section || 'সংবাদ'}">
  <meta property="article:published_time" content="${meta.publishedTime || new Date().toISOString()}">
  <meta property="article:modified_time" content="${meta.modifiedTime || new Date().toISOString()}">
  ${meta.tags && Array.isArray(meta.tags) && meta.tags.length > 0 ? 
    meta.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n  ') : 
    '<meta property="article:tag" content="Bengali News">'}
  ` : ''}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${meta.url}">
  
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="shortcut icon" href="/favicon.ico">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${meta.type === 'article' ? 'NewsArticle' : 'WebSite'}",
    "name": "${meta.title}",
    "headline": "${meta.title}",
    "description": "${meta.description}",
    "image": "${meta.image}",
    "url": "${meta.url}",
    "publisher": {
      "@type": "Organization",
      "name": "${meta.siteName}",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.dainiktni.news/logo.png"
      }
    },
    "inLanguage": "bn"${meta.type === 'article' && meta.publishedTime ? `,
    "datePublished": "${meta.publishedTime}",
    "dateModified": "${meta.modifiedTime || meta.publishedTime}",
    "author": {
      "@type": "Person",
      "name": "${meta.author || 'Bengali News'}"
    },
    "articleSection": "${meta.section || 'সংবাদ'}"` : ''}
  }
  </script>
</head>
<body>
  <div style="font-family: 'SolaimanLipi', Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f8f9fa; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2c3e50; margin-bottom: 10px; font-size: 28px;">${meta.title}</h1>
      <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">${meta.description}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <img src="${meta.image}" alt="${meta.title}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
      <p style="color: #34495e; margin-bottom: 20px; font-size: 16px;">This content is optimized for social media sharing.</p>
      <a href="${meta.url}" style="display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; transition: background 0.3s;">সম্পূর্ণ সংবাদ পড়ুন</a>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
      <p style="color: #95a5a6; font-size: 14px;">© Bengali News - বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers.referer || '';
    
    // Get the path from query or referer
    const targetPath = req.query.path || req.url.replace('/api/crawler-detector', '') || '/';
    
    console.log(`Crawler detector called with User-Agent: ${userAgent}`);
    console.log(`Target path: ${targetPath}`);
    
    // Check if this is a social media crawler
    if (isSocialCrawler(userAgent)) {
      console.log('Social media crawler detected, generating meta tags...');
      
      // Generate meta tags for the requested path
      const metaTags = await generateMetaTags(targetPath, req.query);
      
      // Generate and return HTML optimized for social sharing
      const socialHTML = generateSocialHTML(metaTags);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      return res.send(socialHTML);
    }
    
    // For regular users or non-social crawlers, redirect to main site
    const redirectUrl = `https://www.dainiktni.news${targetPath}`;
    res.setHeader('Location', redirectUrl);
    res.status(302).end();
    
  } catch (error) {
    console.error('Crawler detector error:', error);
    
    // Return a basic HTML page on error
    const errorHTML = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>Bengali News</title>
  <meta property="og:title" content="Bengali News - বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম">
  <meta property="og:description" content="সর্বশেষ সংবাদ পড়ুন Bengali News এ।">
  <meta property="og:image" content="https://www.dainiktni.news/og-image.png">
</head>
<body>
  <h1>Bengali News</h1>
  <p>Loading...</p>
  <script>window.location.href = 'https://www.dainiktni.news';</script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(errorHTML);
  }
}