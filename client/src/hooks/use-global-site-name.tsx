import { useSiteSettings } from '@/contexts/SiteSettingsContext';

/**
 * Hook to get the global site name that controls all 81 instances
 * This ensures centralized control from admin settings
 */
export const useGlobalSiteName = () => {
  const { settings, isLoading } = useSiteSettings();
  
  // Return the centrally managed site name
  return {
    siteName: settings.siteName,
    isLoading
  };
};

/**
 * Component to display site name consistently across the app
 */
export const SiteName = ({ fallback = 'প্রথম আলো' }: { fallback?: string }) => {
  const { siteName, isLoading } = useGlobalSiteName();
  
  if (isLoading) return fallback;
  
  return siteName || fallback;
};

/**
 * Get site name for non-component usage (e.g., document title, meta tags)
 */
export const getSiteName = (fallback = 'প্রথম আলো') => {
  // Access global settings if available
  if (typeof window !== 'undefined' && (window as any).globalSiteSettings) {
    return (window as any).globalSiteSettings.siteName || fallback;
  }
  return fallback;
};

/**
 * Update global site name across all components
 */
export const updateGlobalSiteName = (newSiteName: string) => {
  // Store in window for immediate access
  if (typeof window !== 'undefined') {
    (window as any).globalSiteSettings = {
      ...(window as any).globalSiteSettings,
      siteName: newSiteName
    };
    
    // Dispatch custom event to trigger updates
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated', {
      detail: { siteName: newSiteName }
    }));
  }
};