/**
 * Social Media Meta Tags Utility
 * Generates comprehensive meta tags for all major platforms:
 * Facebook, Twitter, WhatsApp, Telegram, Instagram, and others
 */

export interface SocialMetaConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  siteName?: string;
  author?: string;
  publishedTime?: string;
  section?: string;
  tags?: string[];
  twitterHandle?: string;
}

/**
 * Default configuration for the website
 */
const DEFAULT_CONFIG: Partial<SocialMetaConfig> = {
  siteName: 'প্রথম আলো',
  image: '/og-default-image.svg', // Default fallback image
  type: 'website',
  twitterHandle: '@prothomalo',
  author: 'প্রথম আলো সংবাদদাতা'
};

/**
 * Generate optimized description for social media
 * Keeps under 160 characters for best compatibility
 */
function optimizeDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) return description;
  
  const truncated = description.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Ensure image URL is absolute and properly formatted
 */
function normalizeImageUrl(imageUrl?: string): string {
  if (!imageUrl) return DEFAULT_CONFIG.image!;
  
  // If already absolute URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If relative URL, make it absolute
  if (imageUrl.startsWith('/')) {
    return `${window.location.origin}${imageUrl}`;
  }
  
  return `${window.location.origin}/${imageUrl}`;
}

/**
 * Generate canonical URL for the page
 */
function generateCanonicalUrl(customUrl?: string): string {
  if (customUrl) {
    if (customUrl.startsWith('http://') || customUrl.startsWith('https://')) {
      return customUrl;
    }
    return `${window.location.origin}${customUrl.startsWith('/') ? '' : '/'}${customUrl}`;
  }
  
  return window.location.href;
}

/**
 * Generate complete meta tags for all social media platforms
 */
export function generateSocialMetaTags(config: SocialMetaConfig) {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    siteName = DEFAULT_CONFIG.siteName,
    author = DEFAULT_CONFIG.author,
    publishedTime,
    section,
    tags = [],
    twitterHandle = DEFAULT_CONFIG.twitterHandle
  } = config;

  const optimizedDescription = optimizeDescription(description);
  const imageUrl = normalizeImageUrl(image);
  const canonicalUrl = generateCanonicalUrl(url);

  return {
    // Basic HTML meta tags
    title: `${title} | ${siteName}`,
    description: optimizedDescription,
    
    // Open Graph tags (Facebook, WhatsApp, Telegram, Instagram)
    'og:title': title,
    'og:description': optimizedDescription,
    'og:image': imageUrl,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': title,
    'og:url': canonicalUrl,
    'og:type': type,
    'og:site_name': siteName || 'প্রথম আলো',
    'og:locale': 'bn_BD',
    
    // Article-specific Open Graph tags
    ...(type === 'article' && {
      'article:author': author || 'প্রথম আলো সংবাদদাতা',
      'article:section': section || '',
      'article:published_time': publishedTime || '',
      'article:tag': tags.join(', ')
    }),
    
    // Twitter Card tags (Twitter/X)
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': optimizedDescription,
    'twitter:image': imageUrl,
    'twitter:image:alt': title,
    'twitter:site': twitterHandle || DEFAULT_CONFIG.twitterHandle || '',
    'twitter:creator': twitterHandle || DEFAULT_CONFIG.twitterHandle || '',
    
    // Additional platform-specific tags
    
    // WhatsApp and Telegram (use Open Graph)
    // These platforms primarily use og: tags above
    
    // Instagram (in-app browser and link stickers)
    'instagram:title': title,
    'instagram:description': optimizedDescription,
    'instagram:image': imageUrl,
    
    // General social sharing
    'canonical': canonicalUrl,
    
    // Mobile app integration
    'apple-mobile-web-app-title': siteName || 'প্রথম আলো',
    'application-name': siteName || 'প্রথম আলো',
    
    // Additional SEO
    'robots': 'index, follow',
    'googlebot': 'index, follow',
    
    // Language and region
    'language': 'Bengali',
    'geo.region': 'BD',
    'geo.country': 'Bangladesh'
  };
}

/**
 * Generate meta tags specifically for article pages
 */
export function generateArticleMetaTags(article: {
  title: string;
  excerpt: string;
  image_url?: string;
  slug: string;
  published_at?: string;
  category?: { name: string };
  author?: string;
}) {
  return generateSocialMetaTags({
    title: article.title,
    description: article.excerpt,
    image: article.image_url,
    url: `/article/${encodeURIComponent(article.slug)}`,
    type: 'article',
    author: article.author,
    publishedTime: article.published_at,
    section: article.category?.name,
    tags: article.category?.name ? [article.category.name] : []
  });
}

/**
 * Generate meta tags for category pages
 */
export function generateCategoryMetaTags(category: {
  name: string;
  slug: string;
  description?: string;
}) {
  return generateSocialMetaTags({
    title: category.name,
    description: category.description || `${category.name} সম্পর্কিত সর্বশেষ খবর - প্রথম আলো`,
    url: `/category/${category.slug}`,
    section: category.name
  });
}

/**
 * Generate meta tags for home page
 */
export function generateHomeMetaTags() {
  return generateSocialMetaTags({
    title: 'প্রথম আলো',
    description: 'বাংলাদেশের শীর্ষস্থানীয় অনলাইন সংবাদপত্র। সর্বশেষ খবর, রাজনীতি, অর্থনীতি, খেলা, বিনোদন, আন্তর্জাতিক এবং আরও অনেক কিছু।',
    url: '/'
  });
}

/**
 * Generate meta tags for search pages
 */
export function generateSearchMetaTags(query?: string) {
  const title = query ? `"${query}" এর ফলাফল` : 'অনুসন্ধান';
  const description = query 
    ? `"${query}" এর সার্চ ফলাফল - প্রথম আলো` 
    : 'প্রথম আলো অনুসন্ধান পেজ - খবর, নিবন্ধ এবং আরও অনেক কিছু খুঁজুন';
    
  return generateSocialMetaTags({
    title,
    description,
    url: query ? `/search?q=${encodeURIComponent(query)}` : '/search'
  });
}

/**
 * Get separate meta tag groups for easier rendering in Helmet
 */
export function getMetaTagsForHelmet(metaTags: Record<string, string>) {
  const metaElements: Array<{ name?: string; property?: string; content: string }> = [];
  const linkElements: Array<{ rel: string; href: string }> = [];
  
  Object.entries(metaTags).forEach(([key, value]) => {
    if (key === 'title') {
      return; // Title is handled separately in Helmet
    }
    
    if (key === 'canonical') {
      linkElements.push({ rel: 'canonical', href: value });
      return;
    }
    
    if (key.startsWith('og:') || key.startsWith('article:') || key.startsWith('instagram:')) {
      metaElements.push({ property: key, content: value });
    } else {
      metaElements.push({ name: key, content: value });
    }
  });
  
  return { metaElements, linkElements };
}