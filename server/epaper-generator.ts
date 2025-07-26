// Auto E-Paper PDF Generator
// Collects articles from database and generates newspaper-style PDF with clickable links

import { PDFDocument, PDFPage, rgb, StandardFonts, PDFRef, PDFDict } from 'pdf-lib';
import { adminSupabase } from './supabase';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image_url?: string;
  author?: string;
  category_id: number;
  published_at: string;
  view_count: number;
  category?: { name: string };
}

interface LayoutConfig {
  pageWidth: number;
  pageHeight: number;
  margins: { top: number; bottom: number; left: number; right: number };
  columns: number;
  columnGap: number;
  headerHeight: number;
  footerHeight: number;
}

interface ArticleLayout {
  article: Article;
  x: number;
  y: number;
  width: number;
  height: number;
  column: number;
  hasImage: boolean;
  clickableRegion: { x: number; y: number; width: number; height: number };
}

export class EPaperGenerator {
  private config: LayoutConfig = {
    pageWidth: 595.28, // A4 width
    pageHeight: 841.89, // A4 height
    margins: { top: 50, bottom: 50, left: 40, right: 40 },
    columns: 3,
    columnGap: 20,
    headerHeight: 60,
    footerHeight: 30
  };

  private baseUrl: string;

  constructor(baseUrl: string = 'https://your-domain.com') {
    this.baseUrl = baseUrl;
  }

  // Main function to generate e-paper PDF
  async generateEPaper(date?: string): Promise<Uint8Array> {
    try {
      console.log('🏗️ Starting e-paper generation...');
      
      // 1. Collect articles from database
      const articles = await this.collectArticles(date);
      console.log(`📰 Collected ${articles.length} articles`);

      // 2. Create PDF document
      const pdfDoc = await PDFDocument.create();
      
      // 3. Generate newspaper layout
      await this.generateNewspaperPages(pdfDoc, articles);
      
      // 4. Return PDF as bytes
      const pdfBytes = await pdfDoc.save();
      console.log('✅ E-paper PDF generated successfully');
      
      return pdfBytes;
    } catch (error) {
      console.error('❌ Error generating e-paper:', error);
      throw error;
    }
  }

  // Collect articles from database based on criteria
  private async collectArticles(date?: string): Promise<Article[]> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Get top articles for today's e-paper
      const { data: articles, error } = await adminSupabase
        .from('articles')
        .select(`
          *,
          category:categories(name)
        `)
        .gte('published_at', `${targetDate}T00:00:00.000Z`)
        .lte('published_at', `${targetDate}T23:59:59.999Z`)
        .order('view_count', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(15); // Limit for front page

      if (error) {
        console.error('Database error collecting articles:', error);
        throw error;
      }

      // If no articles for today, get recent articles
      if (!articles || articles.length === 0) {
        const { data: recentArticles, error: recentError } = await adminSupabase
          .from('articles')
          .select(`
            *,
            category:categories(name)
          `)
          .order('published_at', { ascending: false })
          .limit(15);

        if (recentError) throw recentError;
        return recentArticles || [];
      }

      return articles;
    } catch (error) {
      console.error('Error collecting articles:', error);
      return [];
    }
  }

  // Generate newspaper-style pages with multiple columns
  private async generateNewspaperPages(pdfDoc: PDFDocument, articles: Article[]): Promise<void> {
    // Calculate layout dimensions
    const contentWidth = this.config.pageWidth - this.config.margins.left - this.config.margins.right;
    const contentHeight = this.config.pageHeight - this.config.margins.top - this.config.margins.bottom - this.config.headerHeight - this.config.footerHeight;
    const columnWidth = (contentWidth - (this.config.columns - 1) * this.config.columnGap) / this.config.columns;

    // Create first page
    const page = pdfDoc.addPage([this.config.pageWidth, this.config.pageHeight]);
    
    // Add newspaper header
    await this.addNewspaperHeader(page, pdfDoc);
    
    // Layout articles in columns
    const layouts = this.calculateArticleLayouts(articles, columnWidth, contentHeight);
    
    // Render articles with clickable links
    await this.renderArticlesWithLinks(page, pdfDoc, layouts);
    
    // Add footer
    await this.addNewspaperFooter(page, pdfDoc);
  }

  // Calculate article positions in newspaper layout
  private calculateArticleLayouts(articles: Article[], columnWidth: number, contentHeight: number): ArticleLayout[] {
    const layouts: ArticleLayout[] = [];
    const columnHeights = new Array(this.config.columns).fill(0);
    
    articles.forEach((article, index) => {
      // Find column with least content
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Calculate position
      const x = this.config.margins.left + shortestColumn * (columnWidth + this.config.columnGap);
      const y = this.config.pageHeight - this.config.margins.top - this.config.headerHeight - columnHeights[shortestColumn];
      
      // Estimate article height based on content
      const hasImage = !!article.image_url;
      const imageHeight = hasImage ? 80 : 0;
      const titleLines = Math.ceil(article.title.length / 40);
      const excerptLines = Math.ceil(article.excerpt.length / 50);
      const articleHeight = imageHeight + (titleLines * 18) + (excerptLines * 12) + 30; // Padding
      
      const layout: ArticleLayout = {
        article,
        x,
        y: y - articleHeight,
        width: columnWidth,
        height: articleHeight,
        column: shortestColumn,
        hasImage,
        clickableRegion: {
          x,
          y: y - articleHeight,
          width: columnWidth,
          height: articleHeight
        }
      };
      
      layouts.push(layout);
      columnHeights[shortestColumn] += articleHeight + 10; // Add spacing
    });

    return layouts;
  }

  // Render articles with clickable links to article detail pages
  private async renderArticlesWithLinks(page: PDFPage, pdfDoc: PDFDocument, layouts: ArticleLayout[]): Promise<void> {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const layout of layouts) {
      const { article, x, y, width, height, clickableRegion } = layout;
      
      let currentY = y + height - 10;

      // Draw article border (optional)
      page.drawRectangle({
        x: x - 2,
        y: y - 2,
        width: width + 4,
        height: height + 4,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1
      });

      // Add article image if available
      if (layout.hasImage && article.image_url) {
        try {
          // Create placeholder for image (in real implementation, fetch and embed actual image)
          page.drawRectangle({
            x,
            y: currentY - 80,
            width: width,
            height: 75,
            color: rgb(0.9, 0.9, 0.9),
            borderColor: rgb(0.7, 0.7, 0.7),
            borderWidth: 1
          });
          
          page.drawText('Image', {
            x: x + width/2 - 20,
            y: currentY - 45,
            size: 10,
            font,
            color: rgb(0.5, 0.5, 0.5)
          });
          
          currentY -= 85;
        } catch (error) {
          console.error('Error adding image:', error);
        }
      }

      // Add article title (clickable)
      const titleText = this.truncateText(article.title, 60);
      page.drawText(titleText, {
        x,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
        maxWidth: width
      });
      currentY -= 25;

      // Add article excerpt
      const excerptText = this.truncateText(article.excerpt, 150);
      const excerptLines = this.wrapText(excerptText, width - 10, 10);
      
      excerptLines.forEach((line) => {
        page.drawText(line, {
          x,
          y: currentY,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
          maxWidth: width
        });
        currentY -= 12;
      });

      // Add category and date
      const categoryText = article.category?.name || 'সাধারণ';
      const dateText = new Date(article.published_at).toLocaleDateString('bn-BD');
      
      page.drawText(`${categoryText} • ${dateText}`, {
        x,
        y: currentY - 5,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });

      // Create clickable link to article detail page
      const articleUrl = `${this.baseUrl}/article/${article.id}`;
      
      // Add clickable annotation
      const linkAnnotation = pdfDoc.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [clickableRegion.x, clickableRegion.y, clickableRegion.x + clickableRegion.width, clickableRegion.y + clickableRegion.height],
        A: {
          Type: 'Action',
          S: 'URI',
          URI: articleUrl
        },
        Border: [0, 0, 0] // Invisible border
      });

      try {
        const pageRef = pdfDoc.context.getObjectRef(page.ref);
        const pageObject = pdfDoc.context.lookup(pageRef) as PDFDict;
        
        if (pageObject && !pageObject.has('Annots')) {
          pageObject.set('Annots', pdfDoc.context.obj([]));
        }
        
        const annotsArray = pageObject?.lookup('Annots');
        if (annotsArray && Array.isArray(annotsArray)) {
          annotsArray.push(linkAnnotation);
        }
      } catch (error) {
        console.error('Error creating clickable link:', error);
        // Continue without link if annotation fails
      }
    }
  }

  // Add newspaper header with title and date
  private async addNewspaperHeader(page: PDFPage, pdfDoc: PDFDocument): Promise<void> {
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const centerX = this.config.pageWidth / 2;
    const headerY = this.config.pageHeight - this.config.margins.top - 20;

    // Newspaper title
    page.drawText('বেঙ্গলি নিউজ', {
      x: centerX - 60,
      y: headerY,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0)
    });

    // Date and edition
    const today = new Date().toLocaleDateString('bn-BD', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    page.drawText(today, {
      x: centerX - 80,
      y: headerY - 25,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3)
    });

    // Header line
    page.drawLine({
      start: { x: this.config.margins.left, y: headerY - 35 },
      end: { x: this.config.pageWidth - this.config.margins.right, y: headerY - 35 },
      thickness: 2,
      color: rgb(0, 0, 0)
    });
  }

  // Add newspaper footer
  private async addNewspaperFooter(page: PDFPage, pdfDoc: PDFDocument): Promise<void> {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const footerY = this.config.margins.bottom + 10;

    // Footer text
    page.drawText('Bengali News - www.your-domain.com', {
      x: this.config.margins.left,
      y: footerY,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });

    // Page number
    page.drawText('পৃষ্ঠা ১', {
      x: this.config.pageWidth - this.config.margins.right - 40,
      y: footerY,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });
  }

  // Utility functions
  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      // Rough character width estimation
      if (testLine.length * (fontSize * 0.6) < maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }
}

// API endpoint to generate e-paper
export async function generateEPaperPDF(date?: string): Promise<Uint8Array> {
  const generator = new EPaperGenerator('https://your-domain.com'); // Update with your actual domain
  return await generator.generateEPaper(date);
}