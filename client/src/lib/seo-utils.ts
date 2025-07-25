// Types for article data - using the actual article structure from our API
interface Article {
  id: number;
  title: string;
  content?: string;
  excerpt?: string;
  summary?: string;
  image_url?: string;
  imageUrl?: string;
  slug?: string;
  author?: string;
  published_at?: string;
  updated_at?: string;
  category_name?: string;
  tags?: string[];
}

export interface SEOData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'article' | 'profile' | 'video' | 'music';
  keywords: string;
  author: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags: string[];
}

export const DEFAULT_SEO: SEOData = {
  title: "Bengali News - বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র",
  description: "সর্বশেষ সংবাদ, রাজনীতি, খেলা, বিনোদন, আন্তর্জাতিক এবং আরো অনেক কিছু পড়ুন বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যমে। Breaking news, politics, sports, entertainment from Bangladesh's most trusted news source.",
  image: "/og-image.png",
  url: "/",
  type: "website",
  keywords: "বাংলা সংবাদ, Bangladesh news, bengali news, dhaka news, bd news, breaking news, রাজনীতি, খেলা, বিনোদন",
  author: "Bengali News Team",
  tags: ["news", "bangladesh", "bengali", "সংবাদ"]
};

export function generateArticleSEO(article: Article, baseUrl: string = ''): SEOData {
  const cleanTitle = article.title.replace(/[<>]/g, '').trim();
  const cleanDescription = article.excerpt || article.content?.substring(0, 160) || article.summary || DEFAULT_SEO.description;
  
  // Create optimized image URL for social sharing
  let imageUrl = article.image_url || article.imageUrl || DEFAULT_SEO.image;
  if (!imageUrl.startsWith('http')) {
    imageUrl = baseUrl + imageUrl;
  }
  
  // Generate keywords from title and content
  const titleKeywords = cleanTitle.split(' ').filter(word => word.length > 3).slice(0, 5);
  const categoryKeywords = article.category_name ? [article.category_name] : [];
  const defaultKeywords = ['বাংলা সংবাদ', 'Bangladesh news', 'bengali news'];
  const allKeywords = [...titleKeywords, ...categoryKeywords, ...defaultKeywords].join(', ');
  
  return {
    title: `${cleanTitle} | Bengali News`,
    description: cleanDescription.length > 160 ? cleanDescription.substring(0, 157) + '...' : cleanDescription,
    image: imageUrl,
    url: `${baseUrl}/article/${article.id}/${article.slug || ''}`,
    type: "article",
    keywords: allKeywords,
    author: article.author || "Bengali News Team",
    publishedTime: article.published_at ? new Date(article.published_at).toISOString() : undefined,
    modifiedTime: article.updated_at ? new Date(article.updated_at).toISOString() : undefined,
    section: article.category_name || "সাধারণ",
    tags: [
      article.category_name || "সাধারণ",
      "বাংলা সংবাদ",
      "Bangladesh",
      ...(article.tags || [])
    ].filter(Boolean)
  };
}

export function generateCategorySEO(categoryName: string, baseUrl: string = ''): SEOData {
  const categoryTitles: { [key: string]: string } = {
    'politics': 'রাজনীতি - রাজনৈতিক সংবাদ ও আপডেট',
    'sports': 'খেলাধুলা - ক্রীড়া সংবাদ ও ফলাফল',
    'entertainment': 'বিনোদন - সিনেমা, নাটক ও সেলিব্রিটি সংবাদ',
    'technology': 'প্রযুক্তি - টেক নিউজ ও গ্যাজেট রিভিউ',
    'business': 'ব্যবসা-বাণিজ্য - অর্থনৈতিক সংবাদ',
    'international': 'আন্তর্জাতিক - বিশ্ব সংবাদ',
    'lifestyle': 'জীবনযাত্রা - স্বাস্থ্য, ফ্যাশন ও লাইফস্টাইল'
  };
  
  const title = categoryTitles[categoryName.toLowerCase()] || `${categoryName} - সংবাদ ও আপডেট`;
  
  return {
    title: `${title} | Bengali News`,
    description: `${categoryName} বিভাগের সর্বশেষ সংবাদ ও আপডেট পড়ুন বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম Bengali News-এ।`,
    image: `/og-category-${categoryName.toLowerCase()}.png`,
    url: `${baseUrl}/category/${categoryName.toLowerCase()}`,
    type: "website",
    keywords: `${categoryName}, বাংলা সংবাদ, Bangladesh news, ${categoryName} news`,
    author: "Bengali News Team",
    tags: [categoryName, "বাংলা সংবাদ", "category"]
  };
}

export function generateVideoSEO(video: any, baseUrl: string = ''): SEOData {
  return {
    title: `${video.title} | Bengali News Video`,
    description: video.description || `${video.title} - Watch latest Bengali news video on Bengali News`,
    image: video.thumbnail_url || '/og-video.png',
    url: `${baseUrl}/video/${video.id}`,
    type: "video",
    keywords: `${video.title}, video news, বাংলা ভিডিও, Bangladesh video news`,
    author: "Bengali News Team",
    publishedTime: video.created_at ? new Date(video.created_at).toISOString() : undefined,
    tags: ["video", "news", "বাংলা", "Bangladesh"]
  };
}

// Social Media Platform Bot Detection
export const SOCIAL_BOTS = [
  'facebookexternalhit',
  'Facebookbot',
  'twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'TelegramBot',
  'SkypeBot',
  'SlackBot',
  'vkShare',
  'W3C_Validator',
  'RedditBot'
];

export function isSocialBot(userAgent: string): boolean {
  if (!userAgent) return false;
  return SOCIAL_BOTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
}

// Generate optimized social media image URL
export function getOptimizedImageUrl(originalUrl: string, width: number = 1200, height: number = 630): string {
  if (!originalUrl) return '/og-image.png';
  
  // If it's already an optimized URL, return as is
  if (originalUrl.includes('w_1200,h_630')) return originalUrl;
  
  // For external images, we might want to proxy them through our own service
  // For now, return the original URL
  return originalUrl;
}

// Create social media-specific image
export function createSocialImage(title: string, category?: string): string {
  // This would integrate with a service like Cloudinary or our own image generation
  // For now, return default image
  return '/og-image.png';
}