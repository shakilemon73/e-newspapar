import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GoogleAdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  adStyle?: {
    display?: string;
    width?: string;
    height?: string;
  };
  className?: string;
  responsive?: boolean;
}

export function GoogleAdSenseAd({
  adSlot,
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = '',
  responsive = true
}: GoogleAdSenseAdProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if AdSense script is loaded
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        // Push ad to AdSense queue
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, []);

  // Get consent status
  const hasConsent = typeof window !== 'undefined' && 
    localStorage.getItem('adsense_consent') === 'true';

  if (!hasConsent) {
    return (
      <Card className={`${className} border-dashed`}>
        <div className="p-6 text-center">
          <div className="text-sm text-gray-500 mb-2">
            <Badge variant="outline" className="mb-2">
              বিজ্ঞাপন এলাকা
            </Badge>
          </div>
          <p className="text-xs text-gray-400">
            বিজ্ঞাপন দেখতে কুকিজের জন্য সম্মতি প্রয়োজন
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={className} ref={adRef}>
      <div className="text-center mb-2">
        <Badge variant="outline" className="text-xs">
          বিজ্ঞাপন
        </Badge>
      </div>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-3287015775404935"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}

// Predefined AdSense ad components for different placements
export function HeaderBannerAdSense() {
  return (
    <GoogleAdSenseAd
      adSlot="5678901234" // Header banner slot ID
      adFormat="horizontal"
      adStyle={{
        display: 'block',
        width: '100%',
        height: '90px'
      }}
      className="mb-4"
    />
  );
}

export function SidebarAdSense() {
  return (
    <GoogleAdSenseAd
      adSlot="6789012345" // Sidebar ad slot ID
      adFormat="rectangle"
      adStyle={{
        display: 'block',
        width: '300px',
        height: '250px'
      }}
      className="mb-4"
    />
  );
}

export function InContentAdSense() {
  return (
    <div className="my-8">
      <GoogleAdSenseAd
        adSlot="7890123456" // In-content ad slot ID
        adFormat="rectangle"
        adStyle={{
          display: 'block',
          width: '100%',
          height: '280px'
        }}
        className="max-w-2xl mx-auto"
      />
    </div>
  );
}

export function MobileAdSense() {
  return (
    <GoogleAdSenseAd
      adSlot="8901234567" // Mobile ad slot ID
      adFormat="rectangle"
      adStyle={{
        display: 'block',
        width: '320px',
        height: '50px'
      }}
      className="md:hidden mb-4"
    />
  );
}

// AdSense Script Loader
export function AdSenseScriptLoader() {
  useEffect(() => {
    // Check if AdSense script already exists
    if (document.querySelector('script[src*="adsbygoogle"]')) {
      return;
    }

    // Only load if user has given consent
    const hasConsent = localStorage.getItem('adsense_consent') === 'true';
    if (!hasConsent) {
      return;
    }

    // Create and load AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXXX'; // Replace with actual client ID
    script.crossOrigin = 'anonymous';
    
    // Add error handling
    script.onerror = () => {
      console.error('Failed to load AdSense script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src*="adsbygoogle"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return null;
}