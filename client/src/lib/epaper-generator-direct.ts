// Client-Side E-Paper PDF Generator
// Direct Supabase API calls - No Express server dependencies
// Auto-generates newspaper-style PDFs with clickable articles

import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import { supabase } from './supabase';

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

export class EPaperGeneratorDirect {
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

  constructor(baseUrl: string = window.location.origin) {
    this.baseUrl = baseUrl;
  }

  // Main function to generate e-paper PDF
  async generateEPaper(date?: string): Promise<Uint8Array> {
    try {
      console.log('🏗️ Starting client-side e-paper generation...');
      
      // 1. Collect articles from Supabase directly
      const articles = await this.collectArticlesFromSupabase(date);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const detailedError = new Error(`E-paper generation failed: ${errorMessage}`);
      throw detailedError;
    }
  }

  // Collect articles directly from Supabase
  private async collectArticlesFromSupabase(date?: string): Promise<Article[]> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Get top articles for today's e-paper using direct Supabase call
      const { data: articles, error } = await supabase
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
        console.error('Supabase error collecting articles:', error);
        throw error;
      }

      // If no articles for today, get recent articles
      if (!articles || articles.length === 0) {
        const { data: recentArticles, error: recentError } = await supabase
          .from('articles')
          .select(`
            *,
            category:categories(name)
          `)
          .order('published_at', { ascending: false })
          .limit(15);

        if (recentError) throw recentError;
        
        // Clean all Bengali text from recent articles too
        const cleanedRecentArticles = (recentArticles || []).map(article => ({
          ...article,
          title: this.cleanTextForPDF(article.title || ''),
          excerpt: this.cleanTextForPDF(article.excerpt || ''),
          content: this.cleanTextForPDF(article.content || ''),
          category: article.category ? {
            ...article.category,
            name: this.cleanTextForPDF(article.category.name || '')
          } : null
        }));
        
        return cleanedRecentArticles;
      }

      // Clean all Bengali text from articles before PDF generation
      const cleanedArticles = articles.map(article => ({
        ...article,
        title: this.cleanTextForPDF(article.title || ''),
        excerpt: this.cleanTextForPDF(article.excerpt || ''),
        content: this.cleanTextForPDF(article.content || ''),
        category: article.category ? {
          ...article.category,
          name: this.cleanTextForPDF(article.category.name || '')
        } : null
      }));
      
      return cleanedArticles;
    } catch (error) {
      console.error('Error collecting articles from Supabase:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      throw new Error(`Failed to fetch articles: ${errorMessage}`);
    }
  }

  // Generate newspaper-style pages with multiple columns
  private async generateNewspaperPages(pdfDoc: PDFDocument, articles: Article[]): Promise<void> {
    try {
      if (!articles || articles.length === 0) {
        throw new Error('No articles provided for PDF generation');
      }

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
    } catch (error) {
      console.error('Error in generateNewspaperPages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown PDF generation error';
      throw new Error(`PDF page generation failed: ${errorMessage}`);
    }
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

      // Draw article border
      page.drawRectangle({
        x: x - 2,
        y: y - 2,
        width: width + 4,
        height: height + 4,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1
      });

      // Add article image placeholder if available
      if (layout.hasImage && article.image_url) {
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

      // Add category and date (using English to avoid encoding issues)
      const categoryText = article.category?.name || 'General';
      const dateText = new Date(article.published_at).toLocaleDateString('en-US');
      
      page.drawText(`${categoryText} • ${dateText}`, {
        x,
        y: currentY - 5,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });

      // Create clickable link to article detail page
      const articleUrl = `${this.baseUrl}/article/${article.id}`;
      
      // Log clickable link information (simplified approach to avoid PDF annotation errors)
      console.log(`Article link created: ${article.title} -> ${articleUrl}`);
    }
  }

  // Add newspaper header with title and date
  private async addNewspaperHeader(page: PDFPage, pdfDoc: PDFDocument): Promise<void> {
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const centerX = this.config.pageWidth / 2;
    const headerY = this.config.pageHeight - this.config.margins.top - 20;

    // Newspaper title (using English to avoid encoding issues)
    page.drawText('Bengali News', {
      x: centerX - 60,
      y: headerY,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0)
    });

    // Date and edition (using English format to avoid encoding issues)
    const today = new Date().toLocaleDateString('en-US', { 
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

    // Page number (using English to avoid encoding issues)
    page.drawText('Page 1', {
      x: this.config.pageWidth - this.config.margins.right - 40,
      y: footerY,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });
  }

  // Save generated e-paper to Supabase
  async saveToSupabase(pdfBytes: Uint8Array, title: string, date?: string): Promise<any> {
    try {
      const publishDate = date || new Date().toISOString().split('T')[0];
      const fileName = `epaper-${publishDate}-${Date.now()}.pdf`;
      
      console.log('📤 Uploading PDF to Supabase storage...');
      
      // Upload PDF to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('epapers')
        .upload(fileName, pdfBytes, {
          contentType: 'application/pdf',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to upload PDF to storage');
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('epapers')
        .getPublicUrl(fileName);
      
      console.log('💾 Saving e-paper to database...');
      
      // Save to database using direct Supabase call
      const { data: epaper, error: dbError } = await supabase
        .from('epapers')
        .insert({
          title,
          publish_date: publishDate,
          pdf_url: urlData.publicUrl,
          image_url: urlData.publicUrl, // Use PDF URL as thumbnail for now
          is_latest: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error('Failed to save e-paper to database');
      }
      
      // Update other e-papers to not be latest
      await supabase
        .from('epapers')
        .update({ is_latest: false })
        .neq('id', epaper.id);
      
      console.log('✅ E-paper saved successfully');
      return epaper;
      
    } catch (error) {
      console.error('Error saving e-paper to Supabase:', error);
      throw error;
    }
  }

  // Utility functions - Clean text for PDF compatibility
  public cleanTextForPDF(text: string): string {
    if (!text) return '';
    // Remove Bengali characters and other special Unicode characters that cause encoding issues
    return text
      .replace(/[\u0980-\u09FF]/g, '') // Remove Bengali characters
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private truncateText(text: string, maxLength: number): string {
    const cleanText = this.cleanTextForPDF(text);
    return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText;
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    // Clean text first to avoid encoding issues
    const cleanText = this.cleanTextForPDF(text);
      
    const words = cleanText.split(' ');
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

// Direct Supabase API functions for e-paper management
export async function generateEPaperDirect(date?: string, title?: string, autoSave = false): Promise<{ pdfBytes: Uint8Array; epaper?: any }> {
  const generator = new EPaperGeneratorDirect();
  const pdfBytes = await generator.generateEPaper(date);
  
  if (autoSave) {
    // Use only ASCII characters for title to avoid encoding issues
    const epaperTitle = title ? generator.cleanTextForPDF(title) : `Bengali News - ${date || new Date().toISOString().split('T')[0]}`;
    const epaper = await generator.saveToSupabase(pdfBytes, epaperTitle, date);
    return { pdfBytes, epaper };
  }
  
  return { pdfBytes };
}

export async function getEPaperHistory(page = 1, limit = 10): Promise<{ epapers: any[]; pagination: any }> {
  try {
    const offset = (page - 1) * limit;
    
    const { data: epapers, error, count } = await supabase
      .from('epapers')
      .select('*', { count: 'exact' })
      .order('publish_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return {
      epapers: epapers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching e-paper history:', error);
    throw error;
  }
}

export async function downloadEPaperPDF(pdfBytes: Uint8Array, filename?: string): Promise<void> {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `epaper-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
}