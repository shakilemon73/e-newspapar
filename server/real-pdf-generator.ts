import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

// Real PDF Generation using Puppeteer - Professional Quality
export class RealPDFGenerator {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async generateProfessionalPDF(htmlContent: string, options: any = {}): Promise<Buffer> {
    console.log('🎯 Starting professional PDF generation with Puppeteer');
    
    let browser;
    try {
      // Launch browser with optimized settings for PDF generation
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--font-render-hinting=none',
          '--disable-font-subpixel-positioning'
        ]
      });

      const page = await browser.newPage();
      
      // Set optimal viewport for newspaper layout
      await page.setViewport({
        width: 2100,  // A3 width
        height: 2970, // A3 height
        deviceScaleFactor: 2 // High DPI for crisp text
      });

      // Load HTML content
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');

      // Generate PDF with professional settings
      const pdfBuffer = await page.pdf({
        format: 'A3',
        orientation: 'portrait',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0mm',
          bottom: '0mm',
          left: '0mm',
          right: '0mm'
        },
        displayHeaderFooter: false,
        scale: 1.0,
        quality: 100
      });

      console.log(`✅ Professional PDF generated successfully (${pdfBuffer.length} bytes)`);
      return pdfBuffer;

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Upload PDF to Supabase Storage
  async uploadPDFToStorage(pdfBuffer: Buffer, fileName: string): Promise<string> {
    try {
      console.log(`📤 Uploading PDF to Supabase storage: ${fileName}`);
      
      const { data, error } = await this.supabase.storage
        .from('epapers')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (error) {
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('epapers')
        .getPublicUrl(fileName);

      console.log(`✅ PDF uploaded successfully: ${urlData.publicUrl}`);
      return urlData.publicUrl;

    } catch (error) {
      console.error('❌ PDF upload failed:', error);
      throw error;
    }
  }

  // Complete PDF generation and storage workflow
  async generateAndStorePDF(htmlContent: string, title: string, date: string): Promise<string> {
    try {
      // Generate PDF
      const pdfBuffer = await this.generateProfessionalPDF(htmlContent);
      
      // Create unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `epaper-${date}-${timestamp}.pdf`;
      
      // Upload to storage
      const publicUrl = await this.uploadPDFToStorage(pdfBuffer, fileName);
      
      return publicUrl;

    } catch (error) {
      console.error('❌ Complete PDF workflow failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const realPDFGenerator = new RealPDFGenerator(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);