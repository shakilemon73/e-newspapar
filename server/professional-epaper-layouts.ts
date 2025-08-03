// Professional E-Paper Layout Templates
// Based on world-class newspaper design principles and Bangladesh newspaper analysis

export interface ProfessionalLayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: 'broadsheet' | 'tabloid' | 'berliner' | 'compact';
  specifications: {
    width: number;      // in points (72 points = 1 inch)
    height: number;     // in points
    margins: { top: number; bottom: number; left: number; right: number };
    safeArea: { top: number; bottom: number; left: number; right: number };
    bleed: number;      // for professional printing
    dpi: number;        // print resolution
  };
  grid: {
    columns: number;
    columnWidth: number;
    gutter: number;
    baseline: number;   // baseline grid for typography
    rows?: number;      // optional grid rows
  };
  typography: {
    headline: { font: string; size: number; lineHeight: number; tracking: number };
    subhead: { font: string; size: number; lineHeight: number; tracking: number };
    body: { font: string; size: number; lineHeight: number; tracking: number };
    caption: { font: string; size: number; lineHeight: number; tracking: number };
    byline: { font: string; size: number; lineHeight: number; tracking: number };
    pullQuote: { font: string; size: number; lineHeight: number; tracking: number };
  };
  colorPalette: {
    primary: string;    // main text
    secondary: string;  // secondary text
    accent: string;     // brand/highlight color
    background: string; // page background
    rules: string;      // divider lines
    tint: string;       // light backgrounds
  };
  zones: LayoutZone[];
  styleGuide: {
    minTextSize: number;
    maxTextSize: number;
    minLineSpacing: number;
    columnRules: boolean;
    dropCaps: boolean;
    hyphenation: boolean;
    justification: 'left' | 'justify' | 'center';
    paragraphSpacing: number;
  };
}

export interface LayoutZone {
  id: string;
  name: string;
  priority: number;           // 1-100, higher = more important
  position: {
    x: number;               // absolute position in points
    y: number;
    width: number;
    height: number;
  };
  gridPosition?: {
    column: number;          // grid-based positioning
    row: number;
    columnSpan: number;
    rowSpan: number;
  };
  type: 'masthead' | 'lead' | 'secondary' | 'sidebar' | 'breaking' | 'feature' | 'regular' | 'advertisement' | 'weather' | 'footer';
  maxArticles: number;
  columnLayout: {
    columns: number;
    balance: boolean;        // balance text across columns
    flowAcrossColumns: boolean;
  };
  restrictions: {
    minFontSize?: number;
    maxFontSize?: number;
    imageRequired?: boolean;
    textOnly?: boolean;
    categories?: string[];   // allowed article categories
  };
}

export class ProfessionalLayoutSystem {
  private templates: Map<string, ProfessionalLayoutTemplate> = new Map();

  constructor() {
    this.initializeProfessionalTemplates();
  }

  private initializeProfessionalTemplates(): void {
    // Bangladesh Broadsheet - Premium Design (Inspired by Prothom Alo)
    const bangladeshPremium: ProfessionalLayoutTemplate = {
      id: 'bangladesh-premium',
      name: 'বাংলাদেশ প্রিমিয়াম',
      description: 'Premium broadsheet layout inspired by Prothom Alo with professional typography',
      category: 'broadsheet',
      specifications: {
        width: 2100,  // A3 landscape (420mm)
        height: 2970, // A3 portrait (297mm) 
        margins: { top: 72, bottom: 108, left: 72, right: 72 },
        safeArea: { top: 54, bottom: 54, left: 54, right: 54 },
        bleed: 18,    // 0.25 inch bleed
        dpi: 300
      },
      grid: {
        columns: 12,          // 12-column grid system
        columnWidth: 144,     // calculated column width
        gutter: 18,           // 0.25 inch gutter
        baseline: 12,         // 12pt baseline grid
        rows: 20
      },
      typography: {
        headline: { font: 'SolaimanLipi-Bold', size: 36, lineHeight: 40, tracking: -0.5 },
        subhead: { font: 'SolaimanLipi-Bold', size: 18, lineHeight: 22, tracking: 0 },
        body: { font: 'SolaimanLipi-Regular', size: 11, lineHeight: 14, tracking: 0 },
        caption: { font: 'SolaimanLipi-Regular', size: 9, lineHeight: 11, tracking: 0 },
        byline: { font: 'SolaimanLipi-Italic', size: 10, lineHeight: 12, tracking: 0.1 },
        pullQuote: { font: 'SolaimanLipi-Bold', size: 16, lineHeight: 20, tracking: 0 }
      },
      colorPalette: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#c41e3a',     // Traditional red
        background: '#ffffff',
        rules: '#cccccc',
        tint: '#f8f8f8'
      },
      zones: [
        {
          id: 'masthead',
          name: 'মাস্টহেড',
          priority: 100,
          position: { x: 72, y: 72, width: 1956, height: 144 },
          gridPosition: { column: 1, row: 1, columnSpan: 12, rowSpan: 2 },
          type: 'masthead',
          maxArticles: 0,
          columnLayout: { columns: 1, balance: false, flowAcrossColumns: false },
          restrictions: {}
        },
        {
          id: 'breaking-banner',
          name: 'ব্রেকিং নিউজ',
          priority: 95,
          position: { x: 72, y: 234, width: 1956, height: 72 },
          gridPosition: { column: 1, row: 3, columnSpan: 12, rowSpan: 1 },
          type: 'breaking',
          maxArticles: 3,
          columnLayout: { columns: 3, balance: true, flowAcrossColumns: false },
          restrictions: { minFontSize: 12, categories: ['breaking', 'urgent'] }
        },
        {
          id: 'lead-story',
          name: 'প্রধান সংবাদ',
          priority: 90,
          position: { x: 72, y: 324, width: 1140, height: 900 },
          gridPosition: { column: 1, row: 4, columnSpan: 7, rowSpan: 10 },
          type: 'lead',
          maxArticles: 1,
          columnLayout: { columns: 3, balance: false, flowAcrossColumns: true },
          restrictions: { imageRequired: true, minFontSize: 11 }
        },
        {
          id: 'secondary-stories',
          name: 'গুরুত্বপূর্ণ সংবাদ',
          priority: 85,
          position: { x: 1230, y: 324, width: 798, height: 450 },
          gridPosition: { column: 8, row: 4, columnSpan: 5, rowSpan: 5 },
          type: 'secondary',
          maxArticles: 3,
          columnLayout: { columns: 2, balance: true, flowAcrossColumns: false },
          restrictions: { minFontSize: 10 }
        },
        {
          id: 'sidebar',
          name: 'পার্শ্ব সংবাদ',
          priority: 75,
          position: { x: 1230, y: 792, width: 798, height: 432 },
          gridPosition: { column: 8, row: 9, columnSpan: 5, rowSpan: 5 },
          type: 'sidebar',
          maxArticles: 4,
          columnLayout: { columns: 2, balance: true, flowAcrossColumns: false },
          restrictions: { textOnly: false, minFontSize: 9 }
        },
        {
          id: 'bottom-stories',
          name: 'অন্যান্য সংবাদ',
          priority: 70,
          position: { x: 72, y: 1242, width: 1956, height: 600 },
          gridPosition: { column: 1, row: 14, columnSpan: 12, rowSpan: 6 },
          type: 'regular',
          maxArticles: 8,
          columnLayout: { columns: 6, balance: true, flowAcrossColumns: false },
          restrictions: { minFontSize: 9 }
        },
        {
          id: 'weather-box',
          name: 'আবহাওয়া',
          priority: 60,
          position: { x: 1680, y: 72, width: 348, height: 144 },
          type: 'weather',
          maxArticles: 1,
          columnLayout: { columns: 1, balance: false, flowAcrossColumns: false },
          restrictions: { textOnly: false }
        }
      ],
      styleGuide: {
        minTextSize: 8,
        maxTextSize: 72,
        minLineSpacing: 1.2,
        columnRules: true,
        dropCaps: true,
        hyphenation: true,
        justification: 'justify',
        paragraphSpacing: 6
      }
    };

    // Modern Tabloid - Contemporary Design
    const modernTabloid: ProfessionalLayoutTemplate = {
      id: 'modern-tabloid',
      name: 'Modern Tabloid',
      description: 'Contemporary tabloid layout with clean design and excellent readability',
      category: 'tabloid',
      specifications: {
        width: 1728,  // Tabloid width (12" x 17")
        height: 2224, // Tabloid height
        margins: { top: 54, bottom: 72, left: 54, right: 54 },
        safeArea: { top: 36, bottom: 36, left: 36, right: 36 },
        bleed: 18,
        dpi: 300
      },
      grid: {
        columns: 8,
        columnWidth: 180,
        gutter: 18,
        baseline: 14,
        rows: 16
      },
      typography: {
        headline: { font: 'Kalpurush-Bold', size: 32, lineHeight: 36, tracking: -0.3 },
        subhead: { font: 'Kalpurush-Bold', size: 16, lineHeight: 20, tracking: 0 },
        body: { font: 'Kalpurush-Regular', size: 12, lineHeight: 16, tracking: 0 },
        caption: { font: 'Kalpurush-Regular', size: 10, lineHeight: 12, tracking: 0 },
        byline: { font: 'Kalpurush-Italic', size: 11, lineHeight: 13, tracking: 0.1 },
        pullQuote: { font: 'Kalpurush-Bold', size: 18, lineHeight: 22, tracking: 0 }
      },
      colorPalette: {
        primary: '#1a1a1a',
        secondary: '#4a4a4a',
        accent: '#ff6b35',
        background: '#ffffff',
        rules: '#e0e0e0',
        tint: '#f5f5f5'
      },
      zones: [
        {
          id: 'masthead',
          name: 'Masthead',
          priority: 100,
          position: { x: 54, y: 54, width: 1620, height: 108 },
          type: 'masthead',
          maxArticles: 0,
          columnLayout: { columns: 1, balance: false, flowAcrossColumns: false },
          restrictions: {}
        },
        {
          id: 'hero-story',
          name: 'Hero Story',
          priority: 95,
          position: { x: 54, y: 180, width: 1620, height: 720 },
          type: 'feature',
          maxArticles: 1,
          columnLayout: { columns: 4, balance: false, flowAcrossColumns: true },
          restrictions: { imageRequired: true }
        },
        {
          id: 'secondary-grid',
          name: 'Secondary Stories',
          priority: 80,
          position: { x: 54, y: 918, width: 1620, height: 900 },
          type: 'regular',
          maxArticles: 6,
          columnLayout: { columns: 4, balance: true, flowAcrossColumns: false },
          restrictions: { minFontSize: 10 }
        }
      ],
      styleGuide: {
        minTextSize: 9,
        maxTextSize: 48,
        minLineSpacing: 1.3,
        columnRules: false,
        dropCaps: false,
        hyphenation: true,
        justification: 'left',
        paragraphSpacing: 8
      }
    };

    // Compact Modern - Digital-First Design
    const compactModern: ProfessionalLayoutTemplate = {
      id: 'compact-modern',
      name: 'Compact Modern',
      description: 'Compact format optimized for digital reading and modern aesthetics',
      category: 'compact',
      specifications: {
        width: 1440,  // A4 width
        height: 2040, // A4 height
        margins: { top: 72, bottom: 72, left: 54, right: 54 },
        safeArea: { top: 36, bottom: 36, left: 36, right: 36 },
        bleed: 18,
        dpi: 300
      },
      grid: {
        columns: 6,
        columnWidth: 204,
        gutter: 24,
        baseline: 16,
        rows: 12
      },
      typography: {
        headline: { font: 'Noto-Sans-Bengali-Bold', size: 28, lineHeight: 32, tracking: -0.2 },
        subhead: { font: 'Noto-Sans-Bengali-SemiBold', size: 14, lineHeight: 18, tracking: 0 },
        body: { font: 'Noto-Sans-Bengali-Regular', size: 11, lineHeight: 16, tracking: 0.1 },
        caption: { font: 'Noto-Sans-Bengali-Regular', size: 9, lineHeight: 12, tracking: 0.1 },
        byline: { font: 'Noto-Sans-Bengali-Regular', size: 10, lineHeight: 13, tracking: 0.1 },
        pullQuote: { font: 'Noto-Sans-Bengali-Bold', size: 16, lineHeight: 20, tracking: 0 }
      },
      colorPalette: {
        primary: '#2c3e50',
        secondary: '#7f8c8d',
        accent: '#3498db',
        background: '#ffffff',
        rules: '#ecf0f1',
        tint: '#f8f9fa'
      },
      zones: [
        {
          id: 'header',
          name: 'Header',
          priority: 100,
          position: { x: 54, y: 72, width: 1332, height: 120 },
          type: 'masthead',
          maxArticles: 0,
          columnLayout: { columns: 1, balance: false, flowAcrossColumns: false },
          restrictions: {}
        },
        {
          id: 'featured',
          name: 'Featured Story',
          priority: 90,
          position: { x: 54, y: 210, width: 888, height: 600 },
          type: 'feature',
          maxArticles: 1,
          columnLayout: { columns: 2, balance: false, flowAcrossColumns: true },
          restrictions: { imageRequired: true }
        },
        {
          id: 'highlights',
          name: 'Highlights',
          priority: 85,
          position: { x: 966, y: 210, width: 420, height: 600 },
          type: 'sidebar',
          maxArticles: 4,
          columnLayout: { columns: 1, balance: false, flowAcrossColumns: false },
          restrictions: { textOnly: false }
        },
        {
          id: 'news-grid',
          name: 'News Grid',
          priority: 75,
          position: { x: 54, y: 828, width: 1332, height: 800 },
          type: 'regular',
          maxArticles: 9,
          columnLayout: { columns: 3, balance: true, flowAcrossColumns: false },
          restrictions: { minFontSize: 10 }
        }
      ],
      styleGuide: {
        minTextSize: 9,
        maxTextSize: 36,
        minLineSpacing: 1.4,
        columnRules: false,
        dropCaps: false,
        hyphenation: true,
        justification: 'left',
        paragraphSpacing: 10
      }
    };

    // Store all templates
    this.templates.set('bangladesh-premium', bangladeshPremium);
    this.templates.set('modern-tabloid', modernTabloid);
    this.templates.set('compact-modern', compactModern);
  }

  getTemplate(id: string): ProfessionalLayoutTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): ProfessionalLayoutTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): ProfessionalLayoutTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  // Calculate optimal font sizes based on reading distance and visual hierarchy
  calculateOptimalFontSizes(template: ProfessionalLayoutTemplate, readingDistance: number = 24): any {
    const baseFactor = readingDistance / 24; // 24 inches as standard reading distance
    
    return {
      headline: Math.round(template.typography.headline.size * baseFactor),
      subhead: Math.round(template.typography.subhead.size * baseFactor),
      body: Math.round(template.typography.body.size * baseFactor),
      caption: Math.round(template.typography.caption.size * baseFactor)
    };
  }

  // Generate CSS for web preview
  generateCSS(template: ProfessionalLayoutTemplate): string {
    return `
      .epaper-container {
        width: ${template.specifications.width}px;
        height: ${template.specifications.height}px;
        background: ${template.colorPalette.background};
        font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', sans-serif;
        position: relative;
        margin: 0 auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
      
      .epaper-grid {
        display: grid;
        grid-template-columns: repeat(${template.grid.columns}, 1fr);
        grid-template-rows: repeat(${template.grid.rows || 20}, 1fr);
        gap: ${template.grid.gutter}px;
        padding: ${template.specifications.margins.top}px ${template.specifications.margins.right}px ${template.specifications.margins.bottom}px ${template.specifications.margins.left}px;
        height: 100%;
      }
      
      .zone {
        background: ${template.colorPalette.tint};
        border: 1px solid ${template.colorPalette.rules};
        padding: 12px;
        overflow: hidden;
      }
      
      .headline {
        font-size: ${template.typography.headline.size}px;
        line-height: ${template.typography.headline.lineHeight}px;
        font-weight: bold;
        color: ${template.colorPalette.primary};
        margin-bottom: 8px;
      }
      
      .body-text {
        font-size: ${template.typography.body.size}px;
        line-height: ${template.typography.body.lineHeight}px;
        color: ${template.colorPalette.primary};
        text-align: ${template.styleGuide.justification};
        column-count: var(--columns, 1);
        column-gap: ${template.grid.gutter}px;
      }
      
      .byline {
        font-size: ${template.typography.byline.size}px;
        color: ${template.colorPalette.secondary};
        font-style: italic;
        margin-bottom: 6px;
      }
    `;
  }
}

export default ProfessionalLayoutSystem;