import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, X } from 'lucide-react';
import { getActiveAdvertisements, type Advertisement } from '@/lib/supabase-api-direct';

interface AdvertisementWidgetProps {
  placement: string; // 'sidebar', 'header', 'footer', 'content'
  limit?: number;
  className?: string;
}

export default function AdvertisementWidget({ placement, limit = 3, className = '' }: AdvertisementWidgetProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAds, setDismissedAds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const advertisements = await getActiveAdvertisements(placement);
        const limitedAds = limit ? advertisements.slice(0, limit) : advertisements;
        setAds(limitedAds);
        
        // Load dismissed ads from localStorage
        const dismissed = localStorage.getItem('dismissed_ads');
        if (dismissed) {
          try {
            const dismissedList = JSON.parse(dismissed);
            setDismissedAds(new Set(dismissedList));
          } catch (error) {
            console.error('Error parsing dismissed ads:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        setAds([]); // Set empty array if error occurs
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [placement, limit]);

  const handleAdClick = async (ad: Advertisement) => {
    try {
      // Track click (could be implemented with analytics API)
      console.log(`Ad clicked: ${ad.title}`);
      
      // Open link
      if (ad.target_url) {
        window.open(ad.target_url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const dismissAd = (adId: number) => {
    const newDismissed = new Set(Array.from(dismissedAds).concat([adId]));
    setDismissedAds(newDismissed);
    
    // Save to localStorage
    localStorage.setItem('dismissed_ads', JSON.stringify(Array.from(newDismissed)));
  };

  // Filter out dismissed ads
  const visibleAds = ads.filter(ad => !dismissedAds.has(ad.id));

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {Array.from({ length: Math.min(limit, 3) }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <CardContent className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (visibleAds.length === 0) {
    return null; // Don't show empty state for ads
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {visibleAds.map((ad) => (
          <Card key={ad.id} className="overflow-hidden relative group">
            {/* Dismiss Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              onClick={() => dismissAd(ad.id)}
            >
              <X className="w-3 h-3" />
            </Button>

            {/* Ad Content */}
            <div 
              className="cursor-pointer"
              onClick={() => handleAdClick(ad)}
            >
              {ad.image_url && (
                <div className="relative">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                    বিজ্ঞাপন
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-3">
                <h3 className="font-medium text-sm mb-1 line-clamp-2">
                  {ad.title}
                </h3>
                
                {ad.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {ad.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {ad.ad_type}
                  </Badge>
                  
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Sidebar Advertisement Widget
export function SidebarAdsWidget() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        স্পনসরড
      </h3>
      <AdvertisementWidget 
        placement="sidebar" 
        limit={2}
        className="space-y-3"
      />
    </div>
  );
}

// Header Banner Advertisement
export function HeaderBannerAd() {
  return (
    <AdvertisementWidget 
      placement="header" 
      limit={1}
      className="mb-4"
    />
  );
}

// Content Advertisement (between articles)
export function ContentAd() {
  return (
    <div className="my-8">
      <AdvertisementWidget 
        placement="content" 
        limit={1}
      />
    </div>
  );
}

// Footer Advertisement
export function FooterAd() {
  return (
    <AdvertisementWidget 
      placement="footer" 
      limit={1}
      className="mt-4"
    />
  );
}