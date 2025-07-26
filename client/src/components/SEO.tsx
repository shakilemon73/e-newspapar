import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'video' | 'video.other' | 'music';
  siteName?: string;
  locale?: string;
  twitterHandle?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export default function SEO({
  title = "Bengali News - বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র",
  description = "সর্বশেষ সংবাদ, রাজনীতি, খেলা, বিনোদন, আন্তর্জাতিক এবং আরো অনেক কিছু পড়ুন বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যমে।",
  image = "/og-image.png",
  url,
  type = "website",
  siteName = "Bengali News",
  locale = "bn_BD",
  twitterHandle = "@bengalinews",
  keywords = "বাংলা সংবাদ, Bangladesh news, bengali news, dhaka news, bd news, breaking news",
  author = "Bengali News Team",
  publishedTime,
  modifiedTime,
  section,
  tags = []
}: SEOProps) {
  
  // Get current URL if not provided
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://www.dainiktni.news');
  
  // Generate dynamic OG image for better social sharing
  const dynamicImage = type === 'article' || type === 'video' ? 
    `/api/og-image?title=${encodeURIComponent(title)}&type=${type}&subtitle=${encodeURIComponent(description.substring(0, 80))}` :
    image;
  
  // Ensure image is absolute URL
  const imageUrl = dynamicImage.startsWith('http') ? dynamicImage : `${currentUrl.split('/').slice(0, 3).join('/')}${dynamicImage}`;
  
  // Clean description for social media (max 160 characters)
  const cleanDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;
  
  // Create structured data for articles
  const structuredData = type === 'article' ? {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": cleanDescription,
    "image": imageUrl,
    "author": {
      "@type": "Organization",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${currentUrl.split('/').slice(0, 3).join('/')}/logo.png`
      }
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime,
    "articleSection": section,
    "keywords": tags.join(', ')
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={cleanDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta httpEquiv="Content-Language" content="bn" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph Tags (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* Article-specific Open Graph tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card Tags (Twitter/X, Telegram) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* WhatsApp Specific Optimizations */}
      <meta property="og:image:type" content="image/png" />
      <meta name="theme-color" content="#075e54" />
      
      {/* LinkedIn Specific */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Additional Meta Tags for Better SEO */}
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="application-name" content={siteName} />
      <meta name="msapplication-TileColor" content="#075e54" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}