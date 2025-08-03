import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface ArticlePDFData {
  title: string;
  content: string;
  author?: string;
  publishedAt: string;
  category?: string;
  imageUrl?: string;
  siteName?: string;
  websiteUrl?: string;
  tags?: string[];
}

export async function generateArticlePDF(article: ArticlePDFData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  
  // Load fonts
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bengaliFont = await pdfDoc.embedFont(StandardFonts.Helvetica); // Fallback for Bengali
  
  const { width, height } = page.getSize();
  const margin = 50;
  const contentWidth = width - 2 * margin;
  
  let currentY = height - margin;
  
  // Colors matching Bengali newspaper style
  const primaryColor = rgb(0.0, 0.4, 0.0); // Dark green
  const accentColor = rgb(0.8, 0.0, 0.0); // Red
  const textColor = rgb(0.1, 0.1, 0.1); // Dark gray
  const borderColor = rgb(0.7, 0.7, 0.7); // Light gray
  
  // Header with site branding
  if (article.siteName) {
    page.drawText(article.siteName, {
      x: margin,
      y: currentY,
      size: 24,
      font: titleFont,
      color: primaryColor,
    });
    currentY -= 35;
    
    // Decorative line
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: width - margin, y: currentY },
      thickness: 2,
      color: accentColor,
    });
    currentY -= 20;
  }
  
  // Date and category
  const dateText = new Date(article.publishedAt).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  if (article.category) {
    page.drawText(`বিভাগ: ${article.category}`, {
      x: margin,
      y: currentY,
      size: 12,
      font: bodyFont,
      color: primaryColor,
    });
    
    page.drawText(`তারিখ: ${dateText}`, {
      x: width - margin - 150,
      y: currentY,
      size: 12,
      font: bodyFont,
      color: textColor,
    });
    currentY -= 25;
  }
  
  // Title
  const titleWords = article.title.split(' ');
  const titleLines = [];
  let currentLine = '';
  
  for (const word of titleWords) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const textWidth = titleFont.widthOfTextAtSize(testLine, 20);
    
    if (textWidth <= contentWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) titleLines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) titleLines.push(currentLine);
  
  for (const line of titleLines) {
    page.drawText(line, {
      x: margin,
      y: currentY,
      size: 20,
      font: titleFont,
      color: textColor,
    });
    currentY -= 28;
  }
  
  currentY -= 10;
  
  // Separator line
  page.drawLine({
    start: { x: margin, y: currentY },
    end: { x: width - margin, y: currentY },
    thickness: 1,
    color: borderColor,
  });
  currentY -= 20;
  
  // Author info
  if (article.author) {
    page.drawText(`লেখক: ${article.author}`, {
      x: margin,
      y: currentY,
      size: 12,
      font: bodyFont,
      color: primaryColor,
    });
    currentY -= 20;
  }
  
  // Content
  const contentText = article.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  const contentWords = contentText.split(' ');
  const contentLines = [];
  let currentContentLine = '';
  
  for (const word of contentWords) {
    const testLine = currentContentLine + (currentContentLine ? ' ' : '') + word;
    const textWidth = bodyFont.widthOfTextAtSize(testLine, 12);
    
    if (textWidth <= contentWidth) {
      currentContentLine = testLine;
    } else {
      if (currentContentLine) contentLines.push(currentContentLine);
      currentContentLine = word;
    }
  }
  if (currentContentLine) contentLines.push(currentContentLine);
  
  // Draw content with proper spacing
  const lineHeight = 18;
  for (const line of contentLines) {
    if (currentY < margin + 50) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([595, 842]);
      currentY = height - margin;
      
      newPage.drawText(line, {
        x: margin,
        y: currentY,
        size: 12,
        font: bodyFont,
        color: textColor,
      });
    } else {
      page.drawText(line, {
        x: margin,
        y: currentY,
        size: 12,
        font: bodyFont,
        color: textColor,
      });
    }
    currentY -= lineHeight;
  }
  
  // Tags section
  if (article.tags && article.tags.length > 0) {
    currentY -= 20;
    page.drawText('ট্যাগসমূহ:', {
      x: margin,
      y: currentY,
      size: 12,
      font: titleFont,
      color: primaryColor,
    });
    currentY -= 18;
    
    const tagsText = article.tags.join(', ');
    page.drawText(tagsText, {
      x: margin,
      y: currentY,
      size: 10,
      font: bodyFont,
      color: textColor,
    });
    currentY -= 20;
  }
  
  // Footer
  currentY = margin + 30;
  page.drawLine({
    start: { x: margin, y: currentY },
    end: { x: width - margin, y: currentY },
    thickness: 1,
    color: borderColor,
  });
  
  if (article.websiteUrl) {
    page.drawText(`ওয়েবসাইট: ${article.websiteUrl}`, {
      x: margin,
      y: currentY - 15,
      size: 10,
      font: bodyFont,
      color: primaryColor,
    });
  }
  
  page.drawText(`ডাউনলোড করা হয়েছে: ${new Date().toLocaleDateString('bn-BD')}`, {
    x: width - margin - 200,
    y: currentY - 15,
    size: 10,
    font: bodyFont,
    color: textColor,
  });
  
  return await pdfDoc.save();
}

export async function downloadArticleAsPDF(article: ArticlePDFData, filename?: string) {
  try {
    const pdfBytes = await generateArticlePDF(article);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${article.title.substring(0, 30)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}