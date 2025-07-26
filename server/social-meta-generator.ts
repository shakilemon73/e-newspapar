/**
 * Server-side Social Media Meta Tags Generator
 * Fetches real article data from Supabase for social media crawlers
 * Works with the existing direct Supabase architecture
 */

import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for server-side meta generation
const SUPABASE_URL = 'https://mrjukcqspvhketnfzmud.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTExNTksImV4cCI6MjA2ODA4NzE1OX0.GEhC-77JHGe1Oshtjg3FOSFSlJe5sLeyp_wqNWk6f1s';

// Create Supabase client for server-side operations
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('[Meta Generator] Supabase client initialized for social meta generation');

interface MetaTags {
  title: string;
  description: string;
  image: string;
  type: string;
  url: string;
  publishedTime?: string;
  author?: string;
  section?: string;
}

/**
 * Fetch article data by slug from Supabase
 */
async function fetchArticleBySlug(slug: string) {
  try {
    console.log(`[Meta Generator] Fetching article with slug: ${slug}`);
    
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('slug', slug)
      .limit(1);

    if (error) {
      console.error('[Meta Generator] Supabase error:', error);
      return null;
    }

    if (!articles || articles.length === 0) {
      console.log('[Meta Generator] No article found with slug:', slug);
      return null;
    }

    const article = articles[0];
    console.log(`[Meta Generator] Found article: "${article.title}"`);
    return article;

  } catch (error) {
    console.error('[Meta Generator] Error fetching article:', error);
    return null;
  }
}

/**
 * Generate meta tags for different routes
 */
export async function generateMetaTags(pathname: string): Promise<MetaTags> {
  const baseUrl = 'https://www.dainiktni.news';
  
  // Default meta tags
  const defaultMeta: MetaTags = {
    title: 'Bengali News - বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র',
    description: 'সর্বশেষ সংবাদ, রাজনীতি, খেলা, বিনোদন, আন্তর্জাতিক এবং আরো অনেক কিছু পড়ুন বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যমে।',
    image: `${baseUrl}/og-image.png`,
    type: 'website',
    url: `${baseUrl}${pathname}`
  };

  // Homepage
  if (pathname === '/') {
    return {
      ...defaultMeta,
      title: 'Bengali News - বাংলাদেশের প্রধান সংবাদপত্র',
      description: 'বাংলাদেশের সর্বশেষ সংবাদ, রাজনীতি, খেলাধুলা, বিনোদন, ব্যবসা এবং আন্তর্জাতিক খবর পড়ুন।'
    };
  }

  // Article pages - Fetch real data
  if (pathname.startsWith('/article/')) {
    const slug = pathname.replace('/article/', '').replace(/\/$/, '');
    
    if (slug) {
      const article = await fetchArticleBySlug(slug);
      
      if (article) {
        // Create meta description from article content
        let description = '';
        
        if (article.excerpt && article.excerpt.trim()) {
          description = article.excerpt.substring(0, 160);
        } else if (article.content && article.content.trim()) {
          // Remove HTML tags and clean content
          const cleanContent = article.content
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          description = cleanContent.substring(0, 160);
        } else {
          description = `${article.title} - বিস্তারিত সংবাদ পড়ুন Bengali News এ।`;
        }
        
        // Add ellipsis if truncated
        if (description.length === 160 && (article.excerpt?.length > 160 || article.content?.length > 160)) {
          description += '...';
        }
        
        // Use article's original image or fallback to OG image
        let articleImage = article.image_url || article.imageUrl;
        
        // Ensure image is a full URL
        if (articleImage) {
          if (!articleImage.startsWith('http') && !articleImage.startsWith('//')) {
            articleImage = `${baseUrl}${articleImage}`;
          }
        } else {
          // Generate dynamic OG image for article
          articleImage = `${baseUrl}/api/og-image?title=${encodeURIComponent(article.title)}&type=article&slug=${slug}`;
        }
        
        return {
          ...defaultMeta,
          title: `${article.title} - Bengali News`,
          description,
          image: articleImage,
          type: 'article',
          url: `${baseUrl}/article/${slug}`,
          publishedTime: article.published_at,
          author: article.author || 'Bengali News',
          section: article.categories?.name || article.category_name || 'সংবাদ'
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
  const pageRoutes: { [key: string]: Partial<MetaTags> } = {
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
}

/**
 * Generate HTML with proper Open Graph tags
 */
export function generateOGHTML(meta: MetaTags): string {
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
  <meta name="author" content="Bengali News">
  
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
  <meta property="og:site_name" content="Bengali News">
  <meta property="og:locale" content="bn_BD">
  
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
  
  <!-- Telegram -->
  <meta property="telegram:image" content="${meta.image}">
  
  ${meta.type === 'article' ? `
  <!-- Article-specific tags -->
  <meta property="article:author" content="${meta.author || 'Bengali News'}">
  <meta property="article:section" content="${meta.section || 'সংবাদ'}">
  <meta property="article:published_time" content="${meta.publishedTime || new Date().toISOString()}">
  <meta property="article:tag" content="Bengali News">
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
      "name": "Bengali News",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.dainiktni.news/logo.png"
      }
    },
    "inLanguage": "bn"${meta.type === 'article' && meta.publishedTime ? `,
    "datePublished": "${meta.publishedTime}",
    "dateModified": "${meta.publishedTime}",
    "author": {
      "@type": "Person",
      "name": "${meta.author || 'Bengali News'}"
    },
    "articleSection": "${meta.section || 'সংবাদ'}"` : ''}
  }
  </script>
  
  <!-- Auto-redirect for regular users -->
  <script>
    // Only redirect if not a crawler
    setTimeout(function() {
      if (!navigator.userAgent.match(/(facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Googlebot|Discordbot)/i)) {
        window.location.href = "${meta.url}";
      }
    }, 1000);
  </script>
</head>
<body style="font-family: 'Noto Sans Bengali', Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 20px;">
  <div style="max-width: 800px; margin: 50px auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 32px; font-weight: bold; line-height: 1.2;">${meta.title}</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <p style="color: #7f8c8d; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">${meta.description}</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <img src="${meta.image}" alt="${meta.title}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      </div>
      
      ${meta.type === 'article' ? `
      <div style="background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #2c3e50;">
          <strong>লেখক:</strong> ${meta.author || 'Bengali News'} |
          <strong>বিভাগ:</strong> ${meta.section || 'সংবাদ'} |
          <strong>প্রকাশ:</strong> ${meta.publishedTime ? new Date(meta.publishedTime).toLocaleDateString('bn-BD') : 'আজ'}
        </p>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${meta.url}" style="display: inline-block; background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);">
          সম্পূর্ণ সংবাদ পড়ুন
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #34495e; color: white; padding: 20px; text-align: center;">
      <p style="margin: 0; font-size: 14px;">© Bengali News - বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম</p>
      <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Social Media Optimized</p>
    </div>
  </div>
</body>
</html>`;
}