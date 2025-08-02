/**
 * Font Loading System for Bengali News Portal
 * Dynamically loads Bengali fonts from CDN sources
 */

export interface FontLoadResult {
  success: boolean;
  fontFamily: string;
  error?: string;
}

const loadedFonts = new Set<string>();

export async function loadBengaliFont(fontId: string): Promise<FontLoadResult> {
  // Font CDN URLs based on research
  const fontCDNMap: Record<string, string> = {
    'noto-sans-bengali': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700;800;900&display=swap',
    'nikosh': 'https://fonts.maateen.me/nikosh/nikosh.css',
    'kalpurush': 'https://fonts.maateen.me/kalpurush/kalpurush.css',
    'siyam-rupali': 'https://fonts.maateen.me/siyam-rupali/siyamrupali.css',
    'mitra': 'https://fonts.maateen.me/mitra/mitra.css',
    'akaash': 'https://fonts.maateen.me/akaash/akaash.css',
    'likhan': 'https://fonts.maateen.me/likhan/likhan.css',
    'apona-lohit': 'https://fonts.maateen.me/apona-lohit/apona-lohit.css'
  };

  const fontCSSNames: Record<string, string> = {
    'noto-sans-bengali': '"Noto Sans Bengali", sans-serif',
    'nikosh': '"Nikosh", serif',
    'kalpurush': '"Kalpurush", sans-serif',
    'siyam-rupali': '"SiyamRupali", serif',
    'solaiman-lipi': '"SolaimanLipi", serif',
    'mitra': '"Mitra", serif',
    'akaash': '"Akaash", sans-serif',
    'likhan': '"Likhan", sans-serif',
    'apona-lohit': '"AponaLohit", sans-serif'
  };

  // Return early if font already loaded or is a system font
  if (loadedFonts.has(fontId) || fontId === 'solaiman-lipi') {
    return {
      success: true,
      fontFamily: fontCSSNames[fontId] || 'inherit'
    };
  }

  const cdnUrl = fontCDNMap[fontId];
  if (!cdnUrl) {
    return {
      success: false,
      fontFamily: fontCSSNames[fontId] || 'inherit',
      error: 'Font CDN URL not found'
    };
  }

  try {
    // Check if link already exists
    const existingLink = document.querySelector(`link[href="${cdnUrl}"]`);
    if (existingLink) {
      loadedFonts.add(fontId);
      return {
        success: true,
        fontFamily: fontCSSNames[fontId]
      };
    }

    // Create and load font
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cdnUrl;
    link.crossOrigin = 'anonymous';

    return new Promise((resolve) => {
      link.onload = () => {
        loadedFonts.add(fontId);
        resolve({
          success: true,
          fontFamily: fontCSSNames[fontId]
        });
      };

      link.onerror = () => {
        resolve({
          success: false,
          fontFamily: fontCSSNames[fontId] || 'inherit',
          error: 'Failed to load font from CDN'
        });
      };

      document.head.appendChild(link);

      // Timeout fallback
      setTimeout(() => {
        if (!loadedFonts.has(fontId)) {
          resolve({
            success: false,
            fontFamily: fontCSSNames[fontId] || 'inherit',
            error: 'Font loading timeout'
          });
        }
      }, 5000);
    });

  } catch (error) {
    return {
      success: false,
      fontFamily: fontCSSNames[fontId] || 'inherit',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function loadMultipleFonts(fontIds: string[]): Promise<FontLoadResult[]> {
  const loadPromises = fontIds.map(fontId => loadBengaliFont(fontId));
  return Promise.all(loadPromises);
}

export function applyBrandingTheme(settings: {
  theme: string;
  headlineFont: string;
  bodyFont: string;
  displayFont: string;
  customColors: {
    primary: string;  
    secondary: string;
    accent: string;
  };
}) {
  console.log('🎨 Applying branding theme:', settings);
  
  // Load fonts
  loadMultipleFonts([settings.headlineFont, settings.bodyFont, settings.displayFont]);

  // Apply CSS custom properties to root
  const root = document.documentElement;
  
  // Apply colors to Tailwind CSS variables
  root.style.setProperty('--color-primary', settings.customColors.primary);
  root.style.setProperty('--color-secondary', settings.customColors.secondary); 
  root.style.setProperty('--color-accent', settings.customColors.accent);
  
  // Apply brand-specific colors
  root.style.setProperty('--color-primary-brand', settings.customColors.primary);
  root.style.setProperty('--color-secondary-brand', settings.customColors.secondary);
  root.style.setProperty('--color-accent-brand', settings.customColors.accent);

  // Get font CSS names
  const fontCSSNames: Record<string, string> = {
    'noto-sans-bengali': '"Noto Sans Bengali", sans-serif',
    'nikosh': '"Nikosh", serif',
    'kalpurush': '"Kalpurush", sans-serif',
    'siyam-rupali': '"SiyamRupali", serif',
    'solaiman-lipi': '"SolaimanLipi", serif',
    'mitra': '"Mitra", serif',
    'akaash': '"Akaash", sans-serif',
    'likhan': '"Likhan", sans-serif',
    'apona-lohit': '"AponaLohit", sans-serif'
  };

  // Apply fonts
  root.style.setProperty('--font-headlines-brand', fontCSSNames[settings.headlineFont] || '"Noto Sans Bengali", sans-serif');
  root.style.setProperty('--font-body-brand', fontCSSNames[settings.bodyFont] || '"SiyamRupali", serif');
  root.style.setProperty('--font-display-brand', fontCSSNames[settings.displayFont] || '"Kalpurush", sans-serif');

  // Apply to common elements
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .headline, .news-title');
  headings.forEach(el => {
    (el as HTMLElement).style.fontFamily = fontCSSNames[settings.headlineFont] || '"Noto Sans Bengali", sans-serif';
  });

  const body = document.querySelectorAll('p, .body-text, .article-content, .news-content');
  body.forEach(el => {
    (el as HTMLElement).style.fontFamily = fontCSSNames[settings.bodyFont] || '"SiyamRupali", serif';
  });

  // Store settings in localStorage for persistence
  localStorage.setItem('brandingSettings', JSON.stringify(settings));
  
  console.log('✅ Branding theme applied successfully');
}

export function getBrandingSettings() {
  try {
    const stored = localStorage.getItem('brandingSettings');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function initializeBrandingOnPageLoad() {
  const settings = getBrandingSettings();
  if (settings) {
    applyBrandingTheme(settings);
  }
}