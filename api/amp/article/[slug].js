// AMP (Accelerated Mobile Pages) Edge Function
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const slug = pathSegments[pathSegments.length - 1];
    
    if (!slug) {
      return new Response('Article not found', { status: 404 });
    }

    // Environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response('Configuration error', { status: 500 });
    }

    // Direct Supabase REST API call using only Web APIs
    const apiUrl = `${supabaseUrl}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=id,slug,title,excerpt,content,image_url,published_at,created_at`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return new Response('Article not found', { status: 404 });
    }

    const articles = await response.json();
    const article = articles?.[0];

    if (!article) {
      return new Response('Article not found', { status: 404 });
    }

    // Fallback data for missing fields
    const baseUrl = 'https://www.dainiktni.news';
    const articleUrl = `${baseUrl}/article/${article.slug}`;
    const publishedTime = article.published_at || article.created_at || new Date().toISOString();
    const categoryName = 'সাধারণ'; // Default category
    
    // Clean content for AMP compliance
    let cleanContent = article.content || article.excerpt || 'কোন বিস্তারিত তথ্য পাওয়া যায়নি।';
    
    // Remove potentially problematic HTML for AMP
    cleanContent = cleanContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
      .replace(/<input[^>]*>/gi, '')
      .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
      .replace(/style\s*=\s*"[^"]*"/gi, '')
      .replace(/onclick\s*=\s*"[^"]*"/gi, '')
      .replace(/javascript:/gi, '');

    // Generate AMP HTML using template literals only
    const ampHtml = `<!doctype html>
<html ⚡ lang="bn">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <title>${article.title} - Bengali News Time</title>
  <link rel="canonical" href="${articleUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  
  <meta name="description" content="${(article.excerpt || cleanContent).substring(0, 160)}">
  <meta name="author" content="Bengali News Time">
  
  <meta property="og:type" content="article">
  <meta property="og:title" content="${article.title}">
  <meta property="og:description" content="${(article.excerpt || cleanContent).substring(0, 160)}">
  <meta property="og:image" content="${article.image_url || baseUrl + '/og-default.svg'}">
  <meta property="og:url" content="${articleUrl}">
  <meta property="og:site_name" content="Bengali News Time">
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "${article.title}",
    "description": "${(article.excerpt || cleanContent).substring(0, 160)}",
    "image": "${article.image_url || baseUrl + '/og-default.svg'}",
    "datePublished": "${publishedTime}",
    "dateModified": "${article.updated_at || publishedTime}",
    "author": {
      "@type": "Organization",
      "name": "Bengali News Time"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bengali News Time",
      "logo": {
        "@type": "ImageObject",
        "url": "${baseUrl}/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${articleUrl}"
    }
  }
  </script>
  
  <style amp-custom>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap');
    
    body {
      font-family: 'Noto Sans Bengali', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      background: #2d5a27;
      color: white;
      padding: 16px 20px;
      margin: -20px -20px 20px -20px;
    }
    
    .site-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      text-decoration: none;
      color: white;
    }
    
    .article-meta {
      background: #f8f9fa;
      padding: 16px;
      margin: 20px 0;
      border-left: 4px solid #2d5a27;
      border-radius: 0 4px 4px 0;
    }
    
    .category {
      background: #2d5a27;
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
      margin-bottom: 8px;
    }
    
    .publish-date {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
    
    .article-title {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.2;
      margin: 24px 0;
      color: #1a1a1a;
    }
    
    .article-image {
      width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .article-content {
      font-size: 18px;
      line-height: 1.8;
      color: #333;
    }
    
    .article-content p {
      margin: 16px 0;
    }
    
    .article-content h2, .article-content h3 {
      color: #2d5a27;
      margin: 24px 0 16px 0;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 20px;
      margin: 40px -20px -20px -20px;
      text-align: center;
      border-top: 1px solid #dee2e6;
    }
    
    .footer-link {
      color: #2d5a27;
      text-decoration: none;
      font-weight: 600;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }
      
      .article-title {
        font-size: 24px;
      }
      
      .article-content {
        font-size: 16px;
      }
    }
  </style>
  
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
  <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
</head>
<body>
  <div class="container">
    <header class="header">
      <a href="${baseUrl}" class="site-title">📰 Bengali News Time</a>
    </header>
    
    <div class="article-meta">
      <span class="category">${categoryName}</span>
      <p class="publish-date">প্রকাশিত: ${new Date(publishedTime).toLocaleDateString('bn-BD')}</p>
    </div>
    
    <h1 class="article-title">${article.title}</h1>
    
    ${article.image_url ? `
    <amp-img 
      src="${article.image_url}" 
      alt="${article.title}"
      width="800" 
      height="400" 
      layout="responsive"
      class="article-image">
    </amp-img>` : ''}
    
    <div class="article-content">
      ${cleanContent}
    </div>
    
    <footer class="footer">
      <p>
        <a href="${articleUrl}" class="footer-link">সম্পূর্ণ নিবন্ধটি পড়ুন</a> |
        <a href="${baseUrl}" class="footer-link">আরও সংবাদ</a>
      </p>
      <p style="margin-top: 12px; color: #666; font-size: 14px;">
        © 2025 Bengali News Time - বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম
      </p>
    </footer>
  </div>
</body>
</html>`;

    return new Response(ampHtml, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600, s-maxage=3600',
        'x-robots-tag': 'index, follow'
      }
    });
    
  } catch (error) {
    console.error('AMP generation error:', error);
    return new Response(`<!doctype html>
<html>
<head><title>Error</title></head>
<body><h1>Error generating AMP page</h1><p>Please try again later.</p></body>
</html>`, { 
      status: 500,
      headers: { 'content-type': 'text/html' }
    });
  }
}