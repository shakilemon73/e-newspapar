// Vercel Edge Function for Social Media Meta Tags
// This handles social media crawlers and returns HTML with proper Open Graph tags

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const slug = pathSegments[pathSegments.length - 1] || url.searchParams.get('slug');
  
  if (!slug) {
    return new Response('Article not found', { status: 404 });
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch article from Supabase
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id,
        slug,
        title,
        excerpt,
        content,
        image_url,
        author_id,
        category_id,
        created_at,
        updated_at,
        published_at,
        status
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !article) {
      console.error('Article fetch error:', error);
      return new Response('Article not found', { status: 404 });
    }

    // Check if this is a social media crawler
    const userAgent = request.headers.get('user-agent') || '';
    const isSocialCrawler = 
      userAgent.includes('facebookexternalhit') ||
      userAgent.includes('Twitterbot') ||
      userAgent.includes('LinkedInBot') ||
      userAgent.includes('WhatsApp') ||
      userAgent.includes('Slack') ||
      userAgent.includes('Discord') ||
      userAgent.includes('TelegramBot') ||
      userAgent.includes('Applebot') ||
      userAgent.includes('GoogleBot');

    // If it's a social media crawler, return HTML with meta tags
    if (isSocialCrawler) {
      const metaTitle = article.title || 'Bengali News Time';
      const metaDescription = article.excerpt || article.content?.substring(0, 160) + '...' || 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম';
      const metaImage = article.image_url || 'https://www.dainiktni.news/og-default.svg';
      const metaUrl = `https://www.dainiktni.news/article/${article.slug}`;
      const publishedTime = article.published_at || article.created_at;
      const authorName = 'Bengali News Time'; // Will be enhanced to fetch from author_id later

      const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Basic Meta Tags -->
  <title>${metaTitle}</title>
  <meta name="description" content="${metaDescription}">
  <meta name="author" content="${authorName}">
  
  <!-- Open Graph Meta Tags for Facebook, LinkedIn, etc. -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${metaTitle}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:image" content="${metaImage}">
  <meta property="og:url" content="${metaUrl}">
  <meta property="og:site_name" content="Bengali News Time">
  <meta property="og:locale" content="bn_BD">
  
  <!-- Article-specific Open Graph tags -->
  <meta property="article:author" content="${authorName}">
  <meta property="article:published_time" content="${publishedTime}">
  <meta property="article:section" content="News">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${metaTitle}">
  <meta name="twitter:description" content="${metaDescription}">
  <meta name="twitter:image" content="${metaImage}">
  <meta name="twitter:site" content="@bengalinewstime">
  <meta name="twitter:creator" content="@bengalinewstime">
  
  <!-- WhatsApp Meta Tags -->
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/jpeg">
  
  <!-- Additional SEO Tags -->
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${metaUrl}">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "${metaTitle}",
    "description": "${metaDescription}",
    "image": "${metaImage}",
    "datePublished": "${publishedTime}",
    "dateModified": "${article.updated_at || publishedTime}",
    "author": {
      "@type": "Person",
      "name": "${authorName}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bengali News Time",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.dainiktni.news/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${metaUrl}"
    }
  }
  </script>
  
  <!-- Redirect to React App after meta tags are read -->
  <script>
    // Small delay to ensure crawlers read meta tags
    setTimeout(function() {
      window.location.href = "${metaUrl}";
    }, 100);
  </script>
</head>
<body>
  <div style="font-family: 'Noto Sans Bengali', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
    <h1 style="color: #2d5a27; margin-bottom: 20px;">${metaTitle}</h1>
    <p style="color: #666; margin-bottom: 15px;">
      <strong>লেখক:</strong> ${authorName} | 
      <strong>প্রকাশিত:</strong> ${new Date(publishedTime).toLocaleDateString('bn-BD')}
    </p>
    ${article.featured_image ? `<img src="${article.featured_image}" alt="${metaTitle}" style="width: 100%; height: auto; margin-bottom: 20px; border-radius: 8px;">` : ''}
    <p style="color: #333; font-size: 18px;">${metaDescription}</p>
    <p style="margin-top: 30px;">
      <a href="${metaUrl}" style="background: #2d5a27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        সম্পূর্ণ সংবাদ পড়ুন
      </a>
    </p>
  </div>
</body>
</html>`;

      return new Response(html, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=3600, s-maxage=3600'
        }
      });
    }

    // For regular users, redirect to React app
    const redirectUrl = `https://www.dainiktni.news/article/${article.slug}`;
    return Response.redirect(redirectUrl, 302);

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}