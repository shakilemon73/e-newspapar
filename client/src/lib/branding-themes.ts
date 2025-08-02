/**
 * Branding Themes for Bengali News Portal
 * Based on research of top Bengali news portals and 2025 design trends
 */

export interface BrandingTheme {
  id: string;
  name: string;
  nameBengali: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    destructive: string;
    success: string;
    warning: string;
  };
  darkColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    destructive: string;
    success: string;
    warning: string;
  };
}

export interface FontOption {
  id: string;
  name: string;
  bengaliName: string;
  cssName: string;
  category: 'headlines' | 'body' | 'display';
  source: 'google' | 'system' | 'cdn';
  weight: string[];
  description: string;
  preview: string;
  cdnUrl?: string;
}

// Color themes based on Bengali news portal research
export const brandingThemes: BrandingTheme[] = [
  {
    id: 'traditional-red',
    name: 'Traditional Bengali',
    nameBengali: 'ঐতিহ্যবাহী বাংলা',
    description: 'Classic red and green theme inspired by Bangladesh flag and traditional news portals',
    preview: 'Red header with green accents',
    colors: {
      primary: '#ec1f27',       // Traditional news red
      secondary: '#509478',     // Bengali green
      accent: '#fbcc44',        // Golden yellow
      background: '#ffffff',
      foreground: '#1c1c1c',
      muted: '#f8f9fa',
      border: '#e5e7eb',
      destructive: '#dc2626',
      success: '#16a34a',
      warning: '#d97706',
    },
    darkColors: {
      primary: '#f47c84',
      secondary: '#a1ccae',
      accent: '#f0bd45',
      background: '#1a1a1a',
      foreground: '#ffffff',
      muted: '#2a2a2a',
      border: '#374151',
      destructive: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
    }
  },
  {
    id: 'modern-blue',
    name: 'Modern Professional',
    nameBengali: 'আধুনিক পেশাদার',
    description: 'Clean blue theme for professional journalism and business news',
    preview: 'Deep blue with corporate feel',
    colors: {
      primary: '#1c7090',       // Professional blue
      secondary: '#3e3b38',     // Charcoal
      accent: '#ad9450',        // Muted gold
      background: '#ffffff',
      foreground: '#1c1c1c',
      muted: '#f8f9fa',
      border: '#e5e7eb',
      destructive: '#dc2626',
      success: '#16a34a',
      warning: '#d97706',
    },
    darkColors: {
      primary: '#60a5fa',
      secondary: '#6b7280',
      accent: '#fbbf24',
      background: '#111827',
      foreground: '#f9fafb',
      muted: '#1f2937',
      border: '#374151',
      destructive: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
    }
  },
  {
    id: 'vibrant-modern',
    name: 'Vibrant 2025',
    nameBengali: 'প্রাণবন্ত ২০২৫',
    description: 'Hyper-saturated palette for confidence and vitality - 2025 trend',
    preview: 'Bold colors with high contrast',
    colors: {
      primary: '#7c3aed',       // Vibrant purple
      secondary: '#059669',     // Emerald green
      accent: '#f59e0b',        // Amber
      background: '#fefefe',
      foreground: '#111827',
      muted: '#f3f4f6',
      border: '#d1d5db',
      destructive: '#dc2626',
      success: '#059669',
      warning: '#d97706',
    },
    darkColors: {
      primary: '#a78bfa',
      secondary: '#34d399',
      accent: '#fbbf24',
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#1e293b',
      border: '#334155',
      destructive: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
    }
  },
  {
    id: 'nature-inspired',
    name: 'Nature Distilled',
    nameBengali: 'প্রকৃতি অনুপ্রাণিত',
    description: 'Earthy tones of skin, wood and soil - Pantone 2025 trend',
    preview: 'Muted earth tones with sophistication',
    colors: {
      primary: '#8b5a2b',       // Mocha mousse (Pantone 2025)
      secondary: '#6d5a47',     // Warm brown
      accent: '#d2691e',        // Chocolate
      background: '#faf9f7',
      foreground: '#2d2d2d',
      muted: '#f5f4f1',
      border: '#e2e0db',
      destructive: '#b91c1c',
      success: '#15803d',
      warning: '#a16207',
    },
    darkColors: {
      primary: '#d4a574',
      secondary: '#a8927d',
      accent: '#f4a460',
      background: '#1c1917',
      foreground: '#f7f6f3',
      muted: '#2c2823',
      border: '#3c3530',
      destructive: '#dc2626',
      success: '#16a34a',
      warning: '#ca8a04',
    }
  },
  {
    id: 'bangladesh-pride',
    name: 'Bangladesh Pride',
    nameBengali: 'বাংলাদেশের গর্ব',
    description: 'Colors representing Bangladesh culture and heritage',
    preview: 'Green and red with golden accents',
    colors: {
      primary: '#006a4e',       // Bangladesh green
      secondary: '#f42a41',     // Bangladesh red
      accent: '#ffbf00',        // Golden yellow
      background: '#ffffff',
      foreground: '#1f2937',
      muted: '#f9fafb',
      border: '#e5e7eb',
      destructive: '#dc2626',
      success: '#059669',
      warning: '#d97706',
    },
    darkColors: {
      primary: '#10b981',
      secondary: '#f87171',
      accent: '#fcd34d',
      background: '#0f172a',
      foreground: '#f1f5f9',
      muted: '#1e293b',
      border: '#334155',
      destructive: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
    }
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    nameBengali: 'সহজ পরিচ্ছন্ন',
    description: 'Clean, minimal design for easy reading and focus',
    preview: 'Subtle grays with minimal color',
    colors: {
      primary: '#374151',       // Neutral gray
      secondary: '#6b7280',     // Medium gray
      accent: '#3b82f6',        // Clean blue
      background: '#ffffff',
      foreground: '#111827',
      muted: '#f9fafb',
      border: '#e5e7eb',
      destructive: '#dc2626',
      success: '#059669',
      warning: '#d97706',
    },
    darkColors: {
      primary: '#9ca3af',
      secondary: '#6b7280',
      accent: '#60a5fa',
      background: '#111827',
      foreground: '#f9fafb',
      muted: '#1f2937',
      border: '#374151',
      destructive: '#f87171',
      success: '#34d399',
      warning: '#fbbf24',
    }
  }
];

// Font options based on Bengali typography research
export const fontOptions: FontOption[] = [
  // Headlines Fonts
  {
    id: 'noto-sans-bengali',
    name: 'Noto Sans Bengali',
    bengaliName: 'নোটো সান্স বাংলা',
    cssName: '"Noto Sans Bengali", sans-serif',
    category: 'headlines',
    source: 'google',
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    description: 'Modern, crisp, and digitally optimized with excellent cross-platform compatibility',
    preview: 'আধুনিক ও পরিষ্কার ফন্ট',
    cdnUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700;800;900&display=swap'
  },
  {
    id: 'nikosh',
    name: 'Nikosh',
    bengaliName: 'নিকোশ',
    cssName: '"Nikosh", serif',
    category: 'headlines',
    source: 'cdn',
    weight: ['400', '700'],
    description: 'Traditional style with excellent readability, widely recognized in Bangladesh',
    preview: 'ঐতিহ্যবাহী ও পাঠযোগ্য',
    cdnUrl: 'https://fonts.maateen.me/nikosh/nikosh.css'
  },
  {
    id: 'kalpurush',
    name: 'Kalpurush',
    bengaliName: 'কালপুরুষ',
    cssName: '"Kalpurush", sans-serif',
    category: 'headlines',
    source: 'cdn',
    weight: ['400', '700'],
    description: 'Clean, modern sans-serif aesthetic with bold, striking appearance',
    preview: 'পরিচ্ছন্ন ও আকর্ষণীয়',
    cdnUrl: 'https://fonts.maateen.me/kalpurush/kalpurush.css'
  },

  // Body Text Fonts
  {
    id: 'siyam-rupali',
    name: 'Siyam Rupali',
    bengaliName: 'শ্যাম রূপালী',
    cssName: '"SiyamRupali", serif',
    category: 'body',
    source: 'cdn',
    weight: ['400', '500'],
    description: 'Excellent readability for long passages of news text',
    preview: 'দীর্ঘ লেখা পড়ার জন্য উপযুক্ত',
    cdnUrl: 'https://fonts.maateen.me/siyam-rupali/siyamrupali.css'
  },
  {
    id: 'solaiman-lipi',
    name: 'SolaimanLipi',
    bengaliName: 'সোলাইমান লিপি',
    cssName: '"SolaimanLipi", serif',
    category: 'body',
    source: 'system',
    weight: ['400', '700'],
    description: 'Traditional look with cultural authenticity, perfect for news content',
    preview: 'সাংস্কৃতিক সত্যতা বজায় রাখে',
  },
  {
    id: 'mitra',
    name: 'Mitra',
    bengaliName: 'মিত্র',
    cssName: '"Mitra", serif',
    category: 'body',
    source: 'cdn',
    weight: ['400', '500', '700'],
    description: 'Elegant curves with high readability for editorial content',
    preview: 'সম্পাদকীয় কন্টেন্টের জন্য উপযুক্ত',
    cdnUrl: 'https://fonts.maateen.me/mitra/mitra.css'
  },

  // Display Fonts
  {
    id: 'akaash',
    name: 'Akaash',
    bengaliName: 'আকাশ',
    cssName: '"Akaash", sans-serif',
    category: 'display',
    source: 'cdn',
    weight: ['400', '600', '700'],
    description: 'Modern-traditional balance, versatile for mixed content',
    preview: 'আধুনিক ও ঐতিহ্যের মিশ্রণ',
    cdnUrl: 'https://fonts.maateen.me/akaash/akaash.css'
  },
  {
    id: 'likhan',
    name: 'Likhan',
    bengaliName: 'লিখন',
    cssName: '"Likhan", sans-serif',
    category: 'display',
    source: 'cdn',
    weight: ['400', '500', '700'],
    description: 'Clean, minimalist design perfect for digital interfaces',
    preview: 'ডিজিটাল ইন্টারফেসের জন্য',
    cdnUrl: 'https://fonts.maateen.me/likhan/likhan.css'
  },
  {
    id: 'apona-lohit',
    name: 'AponaLohit',
    bengaliName: 'আপোনা লহিত',
    cssName: '"AponaLohit", sans-serif',
    category: 'display',
    source: 'cdn',
    weight: ['400', '600'],
    description: 'Modern with unique flair for creative sections',
    preview: 'সৃজনশীল বিভাগের জন্য',
    cdnUrl: 'https://fonts.maateen.me/apona-lohit/apona-lohit.css'
  }
];

// Helper functions
export function getThemeById(id: string): BrandingTheme | undefined {
  return brandingThemes.find(theme => theme.id === id);
}

export function getFontById(id: string): FontOption | undefined {
  return fontOptions.find(font => font.id === id);
}

export function getFontsByCategory(category: FontOption['category']): FontOption[] {
  return fontOptions.filter(font => font.category === category);
}

export function generateCSSVariables(theme: BrandingTheme, isDark = false): string {
  const colors = isDark && theme.darkColors ? theme.darkColors : theme.colors;
  
  return `
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-background: ${colors.background};
    --color-foreground: ${colors.foreground};
    --color-muted: ${colors.muted};
    --color-border: ${colors.border};
    --color-destructive: ${colors.destructive};
    --color-success: ${colors.success};
    --color-warning: ${colors.warning};
  `;
}

export function generateFontCSS(fonts: { headlines: string; body: string; display: string }): string {
  const headlineFont = getFontById(fonts.headlines);
  const bodyFont = getFontById(fonts.body);
  const displayFont = getFontById(fonts.display);

  return `
    --font-headlines: ${headlineFont?.cssName || '"Noto Sans Bengali", sans-serif'};
    --font-body: ${bodyFont?.cssName || '"Noto Sans Bengali", sans-serif'};
    --font-display: ${displayFont?.cssName || '"Noto Sans Bengali", sans-serif'};
  `;
}