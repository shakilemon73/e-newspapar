import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoogleAdSenseAd } from './GoogleAdSenseAds';

interface BreakingNewsAdsProps {
  className?: string;
  showTopBanner?: boolean;
  showSideBanner?: boolean;
}

export default function BreakingNewsAds({
  className = '',
  showTopBanner = true,
  showSideBanner = false
}: BreakingNewsAdsProps) {
  const [hasAdConsent, setHasAdConsent] = useState(false);

  useEffect(() => {
    // Check if user has consented to advertising cookies
    const consent = localStorage.getItem('adsense_consent') === 'true';
    setHasAdConsent(consent);
    
    // For testing purposes, show ads even without consent
    // Remove this in production
    if (!consent) {
      setHasAdConsent(true);
    }
  }, []);

  // For testing - show placeholder when no consent
  if (!hasAdConsent) {
    return (
      <div className={`breaking-news-ads ${className}`}>
        <div className="mb-4">
          <div className="text-center mb-2">
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200">
              বিজ্ঞাপন স্থান (সম্মতি প্রয়োজন)
            </Badge>
          </div>
          <div className="w-full h-[90px] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-sm">AdSense বিজ্ঞাপন এখানে দেখানো হবে</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`breaking-news-ads ${className}`}>
      {/* Top Banner Ad - High Priority Placement */}
      {showTopBanner && (
        <div className="mb-4">
          <div className="text-center mb-2">
            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
              জরুরি বিজ্ঞাপন
            </Badge>
          </div>
          <GoogleAdSenseAd
            adSlot="1234567890" // Breaking news top banner slot
            adFormat="horizontal"
            adStyle={{
              display: 'block',
              width: '100%',
              height: '90px'
            }}
            className="breaking-news-top-banner border border-red-100 rounded-lg overflow-hidden"
          />
        </div>
      )}

      {/* Side Banner Ad for Desktop */}
      {showSideBanner && (
        <div className="hidden lg:block">
          <div className="text-center mb-2">
            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
              তাৎক্ষণিক বিজ্ঞাপন
            </Badge>
          </div>
          <GoogleAdSenseAd
            adSlot="2345678901" // Breaking news side banner slot
            adFormat="rectangle"
            adStyle={{
              display: 'block',
              width: '300px',
              height: '250px'
            }}
            className="breaking-news-side-banner border border-red-100 rounded-lg overflow-hidden"
          />
        </div>
      )}
    </div>
  );
}

// Specialized breaking news ad components
export function BreakingNewsTopBanner() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-2">
      <BreakingNewsAds showTopBanner={true} showSideBanner={false} />
    </div>
  );
}

export function BreakingNewsSideBanner() {
  return (
    <div className="sticky top-4">
      <BreakingNewsAds showTopBanner={false} showSideBanner={true} />
    </div>
  );
}

// Inline breaking news ad for content areas
export function BreakingNewsInlineAd() {
  const [hasAdConsent, setHasAdConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('adsense_consent') === 'true';
    setHasAdConsent(consent);
  }, []);

  if (!hasAdConsent) return null;

  return (
    <div className="my-6 flex justify-center">
      <Card className="border-2 border-red-200 bg-red-50/30 p-4 max-w-md w-full">
        <div className="text-center mb-3">
          <Badge className="bg-red-100 text-red-700 border-red-300">
            জরুরি বিজ্ঞাপন
          </Badge>
        </div>
        <GoogleAdSenseAd
          adSlot="3456789012" // Breaking news inline ad slot
          adFormat="rectangle"
          adStyle={{
            display: 'block',
            width: '100%',
            height: '200px'
          }}
        />
      </Card>
    </div>
  );
}

// Breaking news ad strip for mobile
export function BreakingNewsMobileStrip() {
  const [hasAdConsent, setHasAdConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('adsense_consent') === 'true';
    setHasAdConsent(consent);
  }, []);

  if (!hasAdConsent) return null;

  return (
    <div className="lg:hidden w-full px-4 py-2">
      <div className="text-center mb-2">
        <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
          মোবাইল বিজ্ঞাপন
        </Badge>
      </div>
      <GoogleAdSenseAd
        adSlot="4567890123" // Breaking news mobile strip slot
        adFormat="horizontal"
        adStyle={{
          display: 'block',
          width: '100%',
          height: '50px'
        }}
        className="border border-red-100 rounded-md overflow-hidden"
      />
    </div>
  );
}