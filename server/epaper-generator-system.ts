// Professional E-Paper Generation System
// Article-based layout generation like real newspapers

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { adminSupabase } from './supabase.js';

interface Article {
  id: number;
  title: string;
  content: string;
  author_id?: number;
  published_at: string;
  image_url?: string;
  priority?: number;
  is_breaking?: boolean;
  is_published?: boolean;
  category_id?: number;
  categories?: { name: string };
  users?: { full_name: string };
}

interface LayoutTemplate {
  name: string;
  description: string;
  sections: LayoutSection[];
  pageSize: { width: number; height: number };
  margins: { top: number; bottom: number; left: number; right: number };
}

interface LayoutSection {
  type: 'header' | 'breaking' | 'main' | 'secondary' | 'sidebar' | 'footer';
  position: { x: number; y: number; width: number; height: number };
  maxArticles: number;
  articleLayout: 'single' | 'double' | 'triple' | 'grid';
}

interface EPaperGenerationOptions {
  title: string;
  date: string;
  layout: string;
  includeCategories: string[];
  excludeCategories: string[];
  maxArticles: number;
  includeBreakingNews: boolean;
  includeWeather: boolean;
  includedSections: string[];
}

export class EPaperGenerator {
  private templates: Map<string, LayoutTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Traditional Bengali Newspaper Layout
    this.templates.set('traditional', {
      name: 'Traditional Bengali',
      description: 'Classic Bengali newspaper layout with masthead and columns',
      pageSize: { width: 595, height: 842 }, // A4
      margins: { top: 50, bottom: 50, left: 40, right: 40 },
      sections: [
        {
          type: 'header',
          position: { x: 40, y: 50, width: 515, height: 80 },
          maxArticles: 0,
          articleLayout: 'single'
        },
        {
          type: 'breaking',
          position: { x: 40, y: 140, width: 515, height: 60 },
          maxArticles: 1,
          articleLayout: 'single'
        },
        {
          type: 'main',
          position: { x: 40, y: 210, width: 340, height: 400 },
          maxArticles: 3,
          articleLayout: 'single'
        },
        {
          type: 'sidebar',
          position: { x: 390, y: 210, width: 165, height: 400 },
          maxArticles: 4,
          articleLayout: 'single'
        },
        {
          type: 'secondary',
          position: { x: 40, y: 620, width: 515, height: 120 },
          maxArticles: 6,
          articleLayout: 'triple'
        },
        {
          type: 'footer',
          position: { x: 40, y: 750, width: 515, height: 40 },
          maxArticles: 0,
          articleLayout: 'single'
        }
      ]
    });

    // Modern Digital Layout
    this.templates.set('modern', {
      name: 'Modern Digital',
      description: 'Clean, modern layout optimized for digital reading',
      pageSize: { width: 595, height: 842 }, // A4
      margins: { top: 30, bottom: 30, left: 30, right: 30 },
      sections: [
        {
          type: 'header',
          position: { x: 30, y: 30, width: 535, height: 60 },
          maxArticles: 0,
          articleLayout: 'single'
        },
        {
          type: 'breaking',
          position: { x: 30, y: 100, width: 535, height: 80 },
          maxArticles: 1,
          articleLayout: 'single'
        },
        {
          type: 'main',
          position: { x: 30, y: 190, width: 535, height: 300 },
          maxArticles: 2,
          articleLayout: 'double'
        },
        {
          type: 'secondary',
          position: { x: 30, y: 500, width: 535, height: 200 },
          maxArticles: 4,
          articleLayout: 'grid'
        },
        {
          type: 'footer',
          position: { x: 30, y: 710, width: 535, height: 40 },
          maxArticles: 0,
          articleLayout: 'single'
        }
      ]
    });

    // Compact Layout for Mobile-First
    this.templates.set('compact', {
      name: 'Compact Mobile-First',
      description: 'Space-efficient layout for mobile viewing',
      pageSize: { width: 420, height: 595 }, // A5
      margins: { top: 20, bottom: 20, left: 20, right: 20 },
      sections: [
        {
          type: 'header',
          position: { x: 20, y: 20, width: 380, height: 50 },
          maxArticles: 0,
          articleLayout: 'single'
        },
        {
          type: 'breaking',
          position: { x: 20, y: 80, width: 380, height: 60 },
          maxArticles: 1,
          articleLayout: 'single'
        },
        {
          type: 'main',
          position: { x: 20, y: 150, width: 380, height: 300 },
          maxArticles: 3,
          articleLayout: 'single'
        },
        {
          type: 'secondary',
          position: { x: 20, y: 460, width: 380, height: 100 },
          maxArticles: 3,
          articleLayout: 'single'
        }
      ]
    });
  }

  async generateEPaper(options: EPaperGenerationOptions): Promise<{
    success: boolean;
    pdfUrl?: string;
    title: string;
    date: string;
    articleCount: number;
    error?: string;
  }> {
    try {
      console.log('🗞️ Starting E-Paper generation with options:', options);

      // 1. Fetch articles based on criteria
      const articles = await this.fetchArticles(options);
      console.log(`📰 Fetched ${articles.length} articles for generation`);

      if (articles.length === 0) {
        return {
          success: false,
          error: 'No articles found matching the criteria',
          title: options.title,
          date: options.date,
          articleCount: 0
        };
      }

      // 2. Get layout template
      const template = this.templates.get(options.layout);
      if (!template) {
        return {
          success: false,
          error: `Layout template '${options.layout}' not found`,
          title: options.title,
          date: options.date,
          articleCount: 0
        };
      }

      // 3. Generate PDF
      const pdfBuffer = await this.generatePDF(articles, template, options);

      // 4. Save PDF file
      const fileName = `epaper-${options.date}-${Date.now()}.pdf`;
      const filePath = path.join(process.cwd(), 'public', 'generated-epapers', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, pdfBuffer);

      const pdfUrl = `/generated-epapers/${fileName}`;

      console.log('✅ E-Paper generated successfully:', pdfUrl);

      return {
        success: true,
        pdfUrl,
        title: options.title,
        date: options.date,
        articleCount: articles.length
      };

    } catch (error) {
      console.error('❌ E-Paper generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        title: options.title,
        date: options.date,
        articleCount: 0
      };
    }
  }

  private async fetchArticles(options: EPaperGenerationOptions): Promise<Article[]> {
    console.log('🔐 Using admin Supabase client to fetch articles (bypassing RLS)');
    let query = adminSupabase
      .from('articles')
      .select(`
        *,
        categories!inner(name)
      `)
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('view_count', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(options.maxArticles);

    // Filter by categories if specified
    if (options.includeCategories.length > 0) {
      query = query.in('categories.name', options.includeCategories);
    }

    if (options.excludeCategories.length > 0) {
      for (const category of options.excludeCategories) {
        query = query.neq('categories.name', category);
      }
    }

    // Date range filter (last 7 days if not specified)
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 7);
    query = query.gte('published_at', dateThreshold.toISOString());

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

    let articles = data || [];

    // Separate breaking news if requested
    if (options.includeBreakingNews) {
      const breakingQuery = adminSupabase
        .from('breaking_news')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: breakingData } = await breakingQuery;
      
      if (breakingData && breakingData.length > 0) {
        // Convert breaking news to article format
        const breakingArticles = breakingData.map(bn => ({
          id: bn.id,
          title: bn.title,
          content: bn.content || '',
          published_at: bn.created_at,
          priority: 100, // High priority
          is_breaking: true,
          is_published: true,
          categories: { name: 'জরুরি খবর' },
          users: { full_name: 'সংবাদ ডেস্ক' }
        }));
        
        articles = [...breakingArticles, ...articles];
      }
    }

    return articles as Article[];
  }

  private async generatePDF(
    articles: Article[], 
    template: LayoutTemplate, 
    options: EPaperGenerationOptions
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: [template.pageSize.width, template.pageSize.height],
          margins: template.margins
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Generate header
        this.generateHeader(doc, template, options);

        // Distribute articles across sections
        const articlesBySection = this.distributeArticles(articles, template);

        // Generate each section
        for (const section of template.sections) {
          if (section.type === 'header' || section.type === 'footer') continue;
          
          const sectionArticles = articlesBySection.get(section.type) || [];
          this.generateSection(doc, section, sectionArticles, template);
        }

        // Generate footer
        this.generateFooter(doc, template, options);

        // Add weather if requested
        if (options.includeWeather) {
          this.addWeatherSection(doc, template);
        }

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  private generateHeader(doc: PDFKit.PDFDocument, template: LayoutTemplate, options: EPaperGenerationOptions) {
    const headerSection = template.sections.find(s => s.type === 'header');
    if (!headerSection) return;

    const { x, y, width, height } = headerSection.position;

    // Set font for Bengali text
    doc.fontSize(24)
       .font('Helvetica-Bold') // In production, use Bengali font
       .text(options.title, x, y, { width, align: 'center' });

    // Date and edition info
    doc.fontSize(12)
       .font('Helvetica')
       .text(`তারিখ: ${new Date(options.date).toLocaleDateString('bn-BD')}`, x, y + 35, { width: width/2 });
    
    doc.text(`সংস্করণ: ${options.date}`, x + width/2, y + 35, { width: width/2, align: 'right' });

    // Divider line
    doc.strokeColor('#000000')
       .lineWidth(2)
       .moveTo(x, y + height - 5)
       .lineTo(x + width, y + height - 5)
       .stroke();
  }

  private distributeArticles(articles: Article[], template: LayoutTemplate): Map<string, Article[]> {
    const distribution = new Map<string, Article[]>();
    let articleIndex = 0;

    // First, handle breaking news
    const breakingSection = template.sections.find(s => s.type === 'breaking');
    if (breakingSection) {
      const breakingArticles = articles.filter(a => a.is_breaking).slice(0, breakingSection.maxArticles);
      distribution.set('breaking', breakingArticles);
      articleIndex += breakingArticles.length;
    }

    // Then distribute remaining articles to other sections
    const otherSections = template.sections.filter(s => 
      s.type !== 'breaking' && s.type !== 'header' && s.type !== 'footer' && s.maxArticles > 0
    );

    const remainingArticles = articles.filter(a => !a.is_breaking);

    for (const section of otherSections) {
      const sectionArticles = remainingArticles.slice(articleIndex, articleIndex + section.maxArticles);
      distribution.set(section.type, sectionArticles);
      articleIndex += sectionArticles.length;
    }

    return distribution;
  }

  private generateSection(
    doc: PDFKit.PDFDocument, 
    section: LayoutSection, 
    articles: Article[], 
    template: LayoutTemplate
  ) {
    if (articles.length === 0) return;

    const { x, y, width, height } = section.position;
    let currentY = y;

    // Section title if not main
    if (section.type !== 'main') {
      const sectionTitle = this.getSectionTitle(section.type);
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(sectionTitle, x, currentY, { width, align: 'left' });
      currentY += 25;
    }

    // Layout articles based on section layout
    switch (section.articleLayout) {
      case 'single':
        this.layoutSingleColumn(doc, articles, x, currentY, width, height - (currentY - y));
        break;
      case 'double':
        this.layoutDoubleColumn(doc, articles, x, currentY, width, height - (currentY - y));
        break;
      case 'triple':
        this.layoutTripleColumn(doc, articles, x, currentY, width, height - (currentY - y));
        break;
      case 'grid':
        this.layoutGrid(doc, articles, x, currentY, width, height - (currentY - y));
        break;
    }
  }

  private layoutSingleColumn(
    doc: PDFKit.PDFDocument, 
    articles: Article[], 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ) {
    let currentY = y;
    const availableHeight = height;

    for (const article of articles) {
      if (currentY > y + availableHeight - 50) break; // Space check

      // Article title
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(article.title, x, currentY, { width, lineGap: 2 });
      
      currentY += doc.heightOfString(article.title, { width }) + 5;

      // Article content (truncated)
      const contentPreview = article.content.substring(0, 200) + '...';
      doc.fontSize(10)
         .font('Helvetica')
         .text(contentPreview, x, currentY, { width, lineGap: 1 });
      
      currentY += doc.heightOfString(contentPreview, { width }) + 15;
    }
  }

  private layoutDoubleColumn(
    doc: PDFKit.PDFDocument, 
    articles: Article[], 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ) {
    const columnWidth = (width - 10) / 2;
    const leftX = x;
    const rightX = x + columnWidth + 10;
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const isLeftColumn = i % 2 === 0;
      const columnX = isLeftColumn ? leftX : rightX;
      const currentY = y + Math.floor(i / 2) * 120;

      if (currentY > y + height - 100) break;

      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text(article.title, columnX, currentY, { width: columnWidth, lineGap: 2 });
      
      const titleHeight = doc.heightOfString(article.title, { width: columnWidth });
      
      const contentPreview = article.content.substring(0, 150) + '...';
      doc.fontSize(9)
         .font('Helvetica')
         .text(contentPreview, columnX, currentY + titleHeight + 3, { width: columnWidth, lineGap: 1 });
    }
  }

  private layoutTripleColumn(
    doc: PDFKit.PDFDocument, 
    articles: Article[], 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ) {
    const columnWidth = (width - 20) / 3;
    
    for (let i = 0; i < Math.min(articles.length, 3); i++) {
      const article = articles[i];
      const columnX = x + i * (columnWidth + 10);

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(article.title, columnX, y, { width: columnWidth, lineGap: 1 });
      
      const titleHeight = doc.heightOfString(article.title, { width: columnWidth });
      
      const contentPreview = article.content.substring(0, 100) + '...';
      doc.fontSize(8)
         .font('Helvetica')
         .text(contentPreview, columnX, y + titleHeight + 3, { width: columnWidth, lineGap: 1 });
    }
  }

  private layoutGrid(
    doc: PDFKit.PDFDocument, 
    articles: Article[], 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ) {
    const cols = 2;
    const rows = 2;
    const cellWidth = (width - 10) / cols;
    const cellHeight = (height - 10) / rows;

    for (let i = 0; i < Math.min(articles.length, 4); i++) {
      const article = articles[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellX = x + col * (cellWidth + 10);
      const cellY = y + row * (cellHeight + 10);

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(article.title, cellX, cellY, { width: cellWidth, lineGap: 1 });
      
      const titleHeight = doc.heightOfString(article.title, { width: cellWidth });
      
      const contentPreview = article.content.substring(0, 80) + '...';
      doc.fontSize(8)
         .font('Helvetica')
         .text(contentPreview, cellX, cellY + titleHeight + 3, { width: cellWidth, lineGap: 1 });
    }
  }

  private generateFooter(doc: PDFKit.PDFDocument, template: LayoutTemplate, options: EPaperGenerationOptions) {
    const footerSection = template.sections.find(s => s.type === 'footer');
    if (!footerSection) return;

    const { x, y, width, height } = footerSection.position;

    // Divider line
    doc.strokeColor('#000000')
       .lineWidth(1)
       .moveTo(x, y)
       .lineTo(x + width, y)
       .stroke();

    // Footer text
    doc.fontSize(8)
       .font('Helvetica')
       .text('Bengali News Time - www.dainiktni.news', x, y + 10, { width: width/2 });
    
    doc.text(`পৃষ্ঠা ১ | ${new Date().toLocaleDateString('bn-BD')}`, x + width/2, y + 10, { 
      width: width/2, 
      align: 'right' 
    });
  }

  private async addWeatherSection(doc: PDFKit.PDFDocument, template: LayoutTemplate) {
    // Add weather information - simplified for demo
    const weatherX = template.margins.left + 10;
    const weatherY = template.pageSize.height - template.margins.bottom - 80;

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('আজকের আবহাওয়া', weatherX, weatherY);

    doc.fontSize(8)
       .font('Helvetica')
       .text('ঢাকা: ২৮°সে | চট্টগ্রাম: ৩০°সে | সিলেট: ২৬°সে', weatherX, weatherY + 15);
  }

  private getSectionTitle(sectionType: string): string {
    const titles: Record<string, string> = {
      'breaking': 'জরুরি খবর',
      'main': 'প্রধান সংবাদ',
      'secondary': 'অন্যান্য সংবাদ',
      'sidebar': 'পার্শ্ব সংবাদ'
    };
    return titles[sectionType] || sectionType;
  }

  getAvailableTemplates(): { id: string; name: string; description: string }[] {
    return Array.from(this.templates.entries()).map(([id, template]) => ({
      id,
      name: template.name,
      description: template.description
    }));
  }
}

export const epaperGenerator = new EPaperGenerator();