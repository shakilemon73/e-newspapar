// Social Media Image Generator Utilities
// Stack Overflow proven solutions for optimal social sharing

export interface SocialImageOptions {
  title: string;
  category?: string;
  author?: string;
  siteName?: string;
  backgroundColor?: string;
  textColor?: string;
  width?: number;
  height?: number;
}

// Standard social media image dimensions (Stack Overflow research)
export const SOCIAL_IMAGE_SIZES = {
  // Facebook, LinkedIn, WhatsApp preferred
  OG_STANDARD: { width: 1200, height: 630 },
  // Twitter optimal
  TWITTER_CARD: { width: 1024, height: 512 },
  // Square format for some platforms
  SQUARE: { width: 1080, height: 1080 },
  // WhatsApp specific (under 600KB)
  WHATSAPP_OPTIMIZED: { width: 1200, height: 630, quality: 80 }
};

// Platform-specific image requirements from research
export const PLATFORM_REQUIREMENTS = {
  FACEBOOK: {
    minWidth: 600,
    minHeight: 315,
    recommended: SOCIAL_IMAGE_SIZES.OG_STANDARD,
    maxSize: '8MB',
    formats: ['JPG', 'PNG', 'GIF', 'WEBP']
  },
  WHATSAPP: {
    minWidth: 300,
    maxSize: '600KB', // Critical requirement from research
    recommended: SOCIAL_IMAGE_SIZES.WHATSAPP_OPTIMIZED,
    formats: ['JPG', 'PNG'], // Avoid WEBP for compatibility
    aspectRatio: '4:1 or less'
  },
  TWITTER: {
    minWidth: 300,
    minHeight: 157,
    recommended: SOCIAL_IMAGE_SIZES.TWITTER_CARD,
    maxSize: '5MB',
    formats: ['JPG', 'PNG', 'WEBP', 'GIF']
  },
  TELEGRAM: {
    // Telegram prefers Twitter Card format
    recommended: SOCIAL_IMAGE_SIZES.TWITTER_CARD,
    formats: ['JPG', 'PNG'], // Avoid WEBP/AVIF per research
    note: 'Uses Twitter Card tags preferentially'
  },
  LINKEDIN: {
    minWidth: 1200,
    minHeight: 627,
    recommended: SOCIAL_IMAGE_SIZES.OG_STANDARD,
    formats: ['JPG', 'PNG', 'GIF']
  }
};

// Generate optimized image URL for different platforms
export function generateSocialImageUrl(
  baseUrl: string,
  options: SocialImageOptions,
  platform: keyof typeof PLATFORM_REQUIREMENTS = 'FACEBOOK'
): string {
  const { width, height } = PLATFORM_REQUIREMENTS[platform].recommended;
  
  // For static images, return optimized version
  if (options.title && options.category) {
    return `${baseUrl}/api/og-image?title=${encodeURIComponent(options.title)}&category=${encodeURIComponent(options.category)}&w=${width}&h=${height}`;
  }
  
  // Fallback to default OG image
  return `${baseUrl}/og-image.png`;
}

// Create platform-specific meta tags
export function createPlatformOptimizedTags(imageUrl: string, title: string, description: string, url: string) {
  return {
    // Universal Open Graph (works for Facebook, WhatsApp, LinkedIn)
    openGraph: {
      'og:title': title,
      'og:description': description,
      'og:image': imageUrl,
      'og:image:secure_url': imageUrl,
      'og:image:type': 'image/png',
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': title,
      'og:url': url,
      'og:type': 'article',
      'og:site_name': 'Bengali News',
      'og:locale': 'bn_BD'
    },
    
    // Twitter Cards (also used by Telegram)
    twitterCard: {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': imageUrl,
      'twitter:image:alt': title,
      'twitter:site': '@bengalinews'
    },
    
    // WhatsApp specific optimizations
    whatsappOptimized: {
      'theme-color': '#075e54', // WhatsApp brand color
      'og:image:type': 'image/png', // Preferred format
    }
  };
}

// SVG-based dynamic image generation (fallback for static hosting)
export function generateSVGSocialImage(options: SocialImageOptions): string {
  const {
    title,
    category = '',
    author = 'Bengali News',
    siteName = 'Bengali News',
    backgroundColor = '#075e54',
    textColor = '#ffffff',
    width = 1200,
    height = 630
  } = options;

  // Truncate title for better fit
  const truncatedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .title { 
            font: bold 48px 'Noto Sans Bengali', Arial, sans-serif; 
            fill: ${textColor}; 
          }
          .category { 
            font: 32px 'Noto Sans Bengali', Arial, sans-serif; 
            fill: #f0f0f0; 
          }
          .author { 
            font: 24px 'Noto Sans Bengali', Arial, sans-serif; 
            fill: #cccccc; 
          }
          .siteName { 
            font: bold 28px 'Noto Sans Bengali', Arial, sans-serif; 
            fill: ${textColor}; 
          }
        </style>
      </defs>
      
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      
      <!-- Site branding -->
      <text x="60" y="80" class="siteName">${siteName}</text>
      
      <!-- Category -->
      ${category ? `<text x="60" y="140" class="category">${category}</text>` : ''}
      
      <!-- Title -->
      <text x="60" y="${category ? '220' : '180'}" class="title">
        <tspan x="60" dy="0">${truncatedTitle.substring(0, 30)}</tspan>
        ${truncatedTitle.length > 30 ? `<tspan x="60" dy="60">${truncatedTitle.substring(30)}</tspan>` : ''}
      </text>
      
      <!-- Author -->
      <text x="60" y="${height - 80}" class="author">${author}</text>
      
      <!-- Logo/Icon area -->
      <rect x="${width - 120}" y="40" width="80" height="80" fill="${textColor}" opacity="0.1" rx="10"/>
    </svg>
  `)}`;
}

// Validate image for WhatsApp requirements
export function validateWhatsAppImage(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            // Check if under 600KB (WhatsApp requirement)
            const sizeInKB = blob.size / 1024;
            resolve(sizeInKB < 600);
          } else {
            resolve(false);
          }
        }, 'image/png');
      } else {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
}

// Get optimal image format for platform
export function getOptimalImageFormat(platform: keyof typeof PLATFORM_REQUIREMENTS): string {
  const formats = PLATFORM_REQUIREMENTS[platform].formats;
  
  // Return most compatible format based on research
  if (platform === 'WHATSAPP' || platform === 'TELEGRAM') {
    return 'PNG'; // Best compatibility
  }
  
  return 'PNG'; // Default to PNG for best compatibility
}