import { ReactNode } from 'react';
import { HeaderBannerAdSense, SidebarAdSense, InContentAdSense, MobileAdSense } from './GoogleAdSenseAds';
import { SidebarAdsWidget, HeaderBannerAd, ContentAd } from './AdvertisementWidget';

interface AdSenseOptimizedLayoutProps {
  children: ReactNode;
  showAds?: boolean;
  adPlacement?: 'minimal' | 'standard' | 'optimized';
  className?: string;
}

export default function AdSenseOptimizedLayout({
  children,
  showAds = true,
  adPlacement = 'standard',
  className = ''
}: AdSenseOptimizedLayoutProps) {
  
  // Check if user has consented to advertising cookies
  const hasAdConsent = typeof window !== 'undefined' && 
    localStorage.getItem('adsense_consent') === 'true';

  // Don't show ads if no consent
  if (!showAds || !hasAdConsent) {
    return <div className={className}>{children}</div>;
  }

  if (adPlacement === 'minimal') {
    return (
      <div className={className}>
        {/* Mobile banner only for minimal */}
        <MobileAdSense />
        {children}
        {/* Single footer ad */}
        <div className="mt-8">
          <SidebarAdSense />
        </div>
      </div>
    );
  }

  if (adPlacement === 'optimized') {
    return (
      <div className={className}>
        {/* Header banner - high visibility */}
        <div className="mb-6">
          <HeaderBannerAdSense />
        </div>
        
        {/* Mobile responsive ad */}
        <MobileAdSense />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content with in-content ads */}
          <div className="lg:col-span-3">
            {children}
            {/* In-content ad after first section */}
            <InContentAdSense />
          </div>
          
          {/* Sidebar with multiple ad units */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-4 space-y-6">
              <SidebarAdSense />
              <SidebarAdsWidget />
              {/* Additional sidebar ad for high-traffic */}
              <SidebarAdSense />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard layout
  return (
    <div className={className}>
      {/* Header banner */}
      <HeaderBannerAd />
      
      {/* Mobile ad */}
      <MobileAdSense />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3">
          {children}
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            <SidebarAdsWidget />
            <SidebarAdSense />
          </div>
        </div>
      </div>
      
      {/* Content ad at bottom */}
      <ContentAd />
    </div>
  );
}

// Specific layouts for different page types
export function ArticleAdSenseLayout({ children }: { children: ReactNode }) {
  return (
    <AdSenseOptimizedLayout adPlacement="optimized">
      {children}
    </AdSenseOptimizedLayout>
  );
}

export function HomepageAdSenseLayout({ children }: { children: ReactNode }) {
  return (
    <AdSenseOptimizedLayout adPlacement="standard">
      {children}
    </AdSenseOptimizedLayout>
  );
}

export function CategoryAdSenseLayout({ children }: { children: ReactNode }) {
  return (
    <AdSenseOptimizedLayout adPlacement="standard">
      {children}
    </AdSenseOptimizedLayout>
  );
}

// Ad placement helper for content insertion
export function InsertContentAd({ afterParagraphs = 2 }: { afterParagraphs?: number }) {
  const hasAdConsent = typeof window !== 'undefined' && 
    localStorage.getItem('adsense_consent') === 'true';

  if (!hasAdConsent) return null;

  return (
    <div className="my-6 flex justify-center">
      <div className="max-w-md w-full">
        <InContentAdSense />
      </div>
    </div>
  );
}

// Ad-friendly content wrapper
export function AdFriendlyContentWrapper({ 
  children, 
  contentType = 'article' 
}: { 
  children: ReactNode;
  contentType?: 'article' | 'category' | 'homepage' | 'other';
}) {
  const adDensity = {
    article: 'optimized',
    category: 'standard',
    homepage: 'standard',
    other: 'minimal'
  } as const;

  return (
    <AdSenseOptimizedLayout 
      adPlacement={adDensity[contentType]}
      className="min-h-screen"
    >
      {children}
    </AdSenseOptimizedLayout>
  );
}