// RSS feed generation for news articles
import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get latest published articles
    const { data: articles } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        content,
        slug,
        image_url,
        published_at,
        created_at,
        categories!inner(name, slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50);

    const baseUrl = 'https://www.dainiktni.news';
    const currentDate = new Date().toISOString();

    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bengali News Time - বাংলা সংবাদ</title>
    <description>বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম - Latest Bengali news and updates from Bangladesh</description>
    <link>${baseUrl}</link>
    <language>bn-BD</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <generator>Bengali News Time RSS Generator</generator>
    <image>
      <url>${baseUrl}/og-default.svg</url>
      <title>Bengali News Time</title>
      <link>${baseUrl}</link>
    </image>`;

    if (articles) {
      articles.forEach(article => {
        const articleUrl = `${baseUrl}/article/${article.slug}`;
        const pubDate = new Date(article.published_at || article.created_at).toUTCString();
        const excerpt = article.excerpt || (article.content ? article.content.substring(0, 200) + '...' : '');
        const categoryName = article.categories?.name || 'সাধারণ';
        
        // Clean HTML from content for RSS
        const cleanContent = excerpt.replace(/<[^>]*>/g, '');
        
        rss += `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${cleanContent}]]></description>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${categoryName}]]></category>
      ${article.image_url ? `<enclosure url="${article.image_url}" type="image/jpeg"/>` : ''}
      <content:encoded><![CDATA[${excerpt}]]></content:encoded>
    </item>`;
      });
    }

    rss += `
  </channel>
</rss>`;

    return new Response(rss, {
      status: 200,
      headers: {
        'content-type': 'application/rss+xml; charset=utf-8',
        'cache-control': 'public, max-age=1800, s-maxage=1800'
      }
    });
  } catch (error) {
    console.error('RSS generation error:', error);
    
    // Fallback RSS feed
    const fallbackRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Bengali News Time</title>
    <description>বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম</description>
    <link>https://www.dainiktni.news</link>
    <language>bn-BD</language>
    <lastBuildDate>${new Date().toISOString()}</lastBuildDate>
  </channel>
</rss>`;
    
    return new Response(fallbackRss, {
      status: 500,
      headers: {
        'content-type': 'application/rss+xml'
      }
    });
  }
}