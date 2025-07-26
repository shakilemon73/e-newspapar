/**
 * Dynamic Open Graph Image Generation API
 * Generates optimized social media preview images using Vercel OG
 * Based on official Vercel OG documentation and best practices
 */

import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

/**
 * Get appropriate colors based on content type
 */
function getTypeColors(type) {
  const colors = {
    article: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff',
      accent: '#f8f9fa'
    },
    video: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      text: '#ffffff',
      accent: '#fff3e0'
    },
    audio: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      text: '#ffffff',
      accent: '#e8f5e5'
    },
    category: {
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      text: '#ffffff',
      accent: '#f1f8e9'
    },
    search: {
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      text: '#ffffff',
      accent: '#fff8e1'
    },
    epaper: {
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      text: '#2c3e50',
      accent: '#ffffff'
    },
    videos: {
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      text: '#2c3e50',
      accent: '#ffffff'
    },
    default: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff',
      accent: '#f8f9fa'
    }
  };
  
  return colors[type] || colors.default;
}

/**
 * Bengali font fallback for better text rendering
 */
function getBengaliText(text) {
  // Check if text contains Bengali characters
  const bengaliRegex = /[\u0980-\u09FF]/;
  return bengaliRegex.test(text);
}

export default function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract parameters
    const title = searchParams.get('title') || 'Bengali News';
    const type = searchParams.get('type') || 'default';
    const subtitle = searchParams.get('subtitle') || 'বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র';
    
    // Get colors based on type
    const colors = getTypeColors(type);
    
    // Determine if Bengali text is present
    const isBengali = getBengaliText(title) || getBengaliText(subtitle);
    
    // Truncate title if too long
    const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
    const displaySubtitle = subtitle.length > 80 ? subtitle.substring(0, 77) + '...' : subtitle;
    
    return new ImageResponse(
      (
        <div
          style={{
            background: colors.background,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 60px',
            fontFamily: isBengali ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'Inter, system-ui, sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              backgroundSize: '100px 100px',
            }}
          />
          
          {/* Logo/Site Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
              color: colors.accent,
              fontSize: '32px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
            }}
          >
            📰 Bengali News
          </div>
          
          {/* Main Title */}
          <div
            style={{
              fontSize: displayTitle.length > 30 ? '48px' : '64px',
              fontWeight: '800',
              color: colors.text,
              textAlign: 'center',
              lineHeight: '1.1',
              marginBottom: '30px',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              maxWidth: '900px',
            }}
          >
            {displayTitle}
          </div>
          
          {/* Subtitle */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: '400',
              color: colors.accent,
              textAlign: 'center',
              lineHeight: '1.3',
              maxWidth: '800px',
              opacity: 0.9,
            }}
          >
            {displaySubtitle}
          </div>
          
          {/* Type Badge */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              padding: '12px 24px',
              background: colors.accent,
              color: colors.background.includes('gradient') ? '#2c3e50' : colors.text,
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {type === 'article' ? 'সংবাদ' : 
             type === 'video' ? 'ভিডিও' :
             type === 'audio' ? 'অডিও' :
             type === 'category' ? 'বিভাগ' :
             type === 'search' ? 'অনুসন্ধান' :
             type === 'epaper' ? 'ই-পেপার' :
             type === 'videos' ? 'ভিডিওসমূহ' : 'সংবাদ'}
          </div>
          
          {/* Bottom Brand */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '60px',
              right: '60px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: colors.accent,
              fontSize: '20px',
              fontWeight: '500',
              opacity: 0.8,
            }}
          >
            <div>www.dainiktni.news</div>
            <div>বিশ্বস্ত • দ্রুত • নির্ভরযোগ্য</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // Add fonts for better Bengali support (if available)
        // Fonts configuration removed for edge runtime compatibility
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    
    // Fallback image generation
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: '72px', fontWeight: 'bold', marginBottom: '20px' }}>
            📰 Bengali News
          </div>
          <div style={{ fontSize: '32px', opacity: 0.8 }}>
            বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}