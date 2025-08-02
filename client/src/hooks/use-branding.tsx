/**
 * Hook for managing branding settings across the application
 */
import { useState, useEffect } from 'react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { loadBengaliFont, applyBrandingTheme, getBrandingSettings } from '@/lib/font-loader';
import { brandingThemes, fontOptions } from '@/lib/branding-themes';

export interface BrandingSettings {
  theme: string;
  headlineFont: string;
  bodyFont: string;
  displayFont: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const useBranding = () => {
  const { settings: siteSettings, refreshSettings } = useSiteSettings();
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({
    theme: 'traditional-red',
    headlineFont: 'noto-sans-bengali',
    bodyFont: 'siyam-rupali',
    displayFont: 'kalpurush',
    customColors: {
      primary: '#ec1f27',
      secondary: '#509478',
      accent: '#fbcc44'
    }
  });

  // Update branding settings when site settings change
  useEffect(() => {
    if (siteSettings) {
      const newBrandingSettings: BrandingSettings = {
        theme: (siteSettings as any).theme || 'traditional-red',
        headlineFont: (siteSettings as any).headlineFont || 'noto-sans-bengali',
        bodyFont: (siteSettings as any).bodyFont || 'siyam-rupali',
        displayFont: (siteSettings as any).displayFont || 'kalpurush',
        customColors: {
          primary: (siteSettings as any).primaryColor || '#ec1f27',
          secondary: (siteSettings as any).secondaryColor || '#509478',
          accent: (siteSettings as any).accentColor || '#fbcc44'
        }
      };

      setBrandingSettings(newBrandingSettings);
      
      // Apply branding theme
      applyBrandingTheme(newBrandingSettings);
    }
  }, [siteSettings]);

  // Get current theme details
  const currentTheme = brandingThemes.find(theme => theme.id === brandingSettings.theme) || brandingThemes[0];
  
  // Get current font details
  const currentFonts = {
    headline: fontOptions.find(font => font.id === brandingSettings.headlineFont),
    body: fontOptions.find(font => font.id === brandingSettings.bodyFont),
    display: fontOptions.find(font => font.id === brandingSettings.displayFont)
  };

  const loadFonts = async () => {
    const fontsToLoad = [
      brandingSettings.headlineFont,
      brandingSettings.bodyFont,
      brandingSettings.displayFont
    ];

    const results = await Promise.all(
      fontsToLoad.map(fontId => loadBengaliFont(fontId))
    );

    return results;
  };

  return {
    brandingSettings,
    currentTheme,
    currentFonts,
    loadFonts,
    refreshBranding: refreshSettings
  };
};