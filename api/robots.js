// Dynamic robots.txt generation
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const baseUrl = 'https://www.dainiktni.news';
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/api/sitemap

# Disallow admin areas
Disallow: /admin*
Disallow: /api/admin*

# Allow important pages
Allow: /article/*
Allow: /category/*
Allow: /videos*
Allow: /epaper*
Allow: /search*

# Crawl delay for respectful crawling
Crawl-delay: 1

# Block AI training crawlers (optional)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

# Allow social media crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=86400'
    }
  });
}