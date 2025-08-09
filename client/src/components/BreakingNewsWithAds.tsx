import { BreakingNewsTicker } from './BreakingNewsTicker';
import { BreakingNewsTopBanner, BreakingNewsMobileStrip } from './BreakingNewsAds';

interface BreakingNewsWithAdsProps {
  className?: string;
}

export default function BreakingNewsWithAds({ className = '' }: BreakingNewsWithAdsProps) {
  return (
    <div className={`breaking-news-section ${className}`}>
      {/* Breaking News Ticker - Primary Content */}
      <div className="sticky top-0 z-50 mb-2">
        <BreakingNewsTicker />
      </div>

      {/* Breaking News Ads - Constrained Placement */}
      <div className="breaking-news-ads-container w-full bg-red-50/20 border-t border-red-100">
        {/* Desktop Breaking News Ad */}
        <div className="hidden md:block">
          <BreakingNewsTopBanner />
        </div>
        
        {/* Mobile Breaking News Ad */}
        <div className="md:hidden">
          <BreakingNewsMobileStrip />
        </div>
        
        {/* Ad Disclaimer */}
        <div className="text-center py-1">
          <span className="text-xs text-gray-500">
            বিজ্ঞাপন | ব্রেকিং নিউজ সংশ্লিষ্ট
          </span>
        </div>
      </div>
    </div>
  );
}

// Enhanced Breaking News Section with better ad integration
export function EnhancedBreakingNewsSection() {
  return (
    <section className="enhanced-breaking-news w-full">
      {/* Main Breaking News */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
        <BreakingNewsTicker />
        
        {/* Immediate Ad Placement Below Breaking News */}
        <div className="border-t border-red-100 bg-gradient-to-r from-red-50/30 via-orange-50/30 to-red-50/30">
          <div className="max-w-7xl mx-auto">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between py-2 px-4">
              <div className="flex-1">
                <BreakingNewsTopBanner />
              </div>
            </div>
            
            {/* Mobile Layout */}
            <div className="md:hidden py-1">
              <BreakingNewsMobileStrip />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}