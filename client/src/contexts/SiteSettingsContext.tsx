import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteSettings {
  siteName: string;
  logoUrl: string;
  siteDescription: string;
  siteUrl: string;
  defaultLanguage: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: SiteSettings = {
  siteName: '',
  logoUrl: '',
  siteDescription: 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম',
  siteUrl: '',
  defaultLanguage: 'bn'
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

interface SiteSettingsProviderProps {
  children: ReactNode;
}

export const SiteSettingsProvider: React.FC<SiteSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { getSiteSettings } = await import('../lib/supabase-api-direct');
      const data = await getSiteSettings();
      console.log('Fetched dynamic settings:', data);
      setSettings({
        siteName: data.siteName || defaultSettings.siteName,
        logoUrl: data.logoUrl || defaultSettings.logoUrl,
        siteDescription: data.siteDescription || defaultSettings.siteDescription,
        siteUrl: data.siteUrl || defaultSettings.siteUrl,
        defaultLanguage: data.defaultLanguage || defaultSettings.defaultLanguage,
      });
      
      // Update global window object for immediate access
      if (typeof window !== 'undefined') {
        (window as any).globalSiteSettings = data;
        
        // Apply branding theme if available
        if (data.theme && data.headlineFont) {
          const { applyBrandingTheme } = await import('../lib/font-loader');
          applyBrandingTheme({
            theme: data.theme,
            headlineFont: data.headlineFont,
            bodyFont: data.bodyFont || 'siyam-rupali',
            displayFont: data.displayFont || 'kalpurush',
            customColors: {
              primary: data.primaryColor || '#ec1f27',
              secondary: data.secondaryColor || '#509478',
              accent: data.accentColor || '#fbcc44'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    fetchSettings();

    // Listen for custom events to refresh settings
    const handleSettingsUpdate = (event: any) => {
      console.log('Site settings updated globally:', event.detail);
      if (event.detail?.siteName) {
        setSettings(prev => ({ ...prev, siteName: event.detail.siteName }));
      }
      
      // Apply branding if available
      if (event.detail?.branding) {
        const { applyBrandingTheme } = require('../lib/font-loader');
        applyBrandingTheme(event.detail.branding);
      }
      
      refreshSettings();
    };

    // Removed aggressive 10-second interval to prevent performance issues
    // Settings will refresh on-demand when admin makes changes

    window.addEventListener('siteSettingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('siteSettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const value: SiteSettingsContextType = {
    settings,
    updateSettings,
    refreshSettings,
    isLoading
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};