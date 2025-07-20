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
      const response = await fetch('/api/settings', {
        headers: {
          'Cache-Control': 'max-age=60'
        }
      });
      if (response.ok) {
        const data = await response.json();
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
      refreshSettings();
    };

    // Set up periodic refresh to check for admin changes
    const intervalId = setInterval(() => {
      refreshSettings();
    }, 300000); // Refresh every 5 minutes instead of 10 seconds

    window.addEventListener('siteSettingsUpdated', handleSettingsUpdate);
    
    return () => {
      clearInterval(intervalId);
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