// Professional Newspaper PDF Generator
// Mimics real printing newspaper layout with authentic design patterns

export interface NewspaperArticleData {
  title: string;
  content: string;
  author?: string;
  publishedAt: string;
  category?: string;
  imageUrl?: string;
  siteName?: string;
  websiteUrl?: string;
  tags?: string[];
  excerpt?: string;
  viewCount?: number;
  readingTime?: number;
}

interface NewspaperConfig {
  format: 'tabloid' | 'broadsheet' | 'a4';
  columns: 3 | 4 | 5 | 6;
  masthead: {
    title: string;
    subtitle?: string;
    established?: string;
    website?: string;
  };
  edition: {
    date: string;
    issue?: string;
    volume?: string;
    price?: string;
  };
}

export async function generateNewspaperPDF(
  article: NewspaperArticleData, 
  config: NewspaperConfig = {
    format: 'a4',
    columns: 3,
    masthead: {
      title: 'Bengali News Time',
      subtitle: 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম',
      established: '২০২৪',
      website: 'www.dainiktni.news'
    },
    edition: {
      date: new Date().toLocaleDateString('bn-BD'),
      issue: 'সংখ্যা ১',
      price: '৳ ১০'
    }
  }
): Promise<string> {
  
  // Create newspaper HTML with professional layout
  const newspaperHTML = generateNewspaperHTML(article, config);
  
  // Convert to PDF using browser's printing capabilities
  return await convertHTMLToPDF(newspaperHTML, config.format);
}

function generateNewspaperHTML(article: NewspaperArticleData, config: NewspaperConfig): string {
  const date = new Date();
  const bengaliDate = date.toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  });
  
  const todayDateBengali = new Date().toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.masthead.title} - ${article.title}</title>
    <style>
        /* Authentic Bengali Newspaper CSS - Based on Daily Amar Desh */
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Kalpurush&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=SolaimanLipi&display=swap');

        /* Page Setup for Print - Full Page Layout */
        @page {
            size: ${config.format === 'broadsheet' ? '11in 17in' : config.format === 'tabloid' ? '11in 17in' : 'A4'};
            margin: 0.3in 0.2in;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Kalpurush', 'Noto Sans Bengali', 'SolaimanLipi', Arial, sans-serif;
            line-height: 1.2;
            color: #000;
            background: white;
            font-size: 8pt;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            margin: 0;
            padding: 4pt;
            overflow-x: hidden;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Full Page Newspaper Layout */
        .newspaper {
            max-width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            page-break-after: avoid;
            overflow: hidden;
        }

        /* Authentic Masthead - Daily Amar Desh Style */
        .masthead {
            border-bottom: 4px solid #000;
            padding-bottom: 6pt;
            margin-bottom: 8pt;
            position: relative;
        }

        .top-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 7pt;
            color: #000;
            margin-bottom: 6pt;
            border-bottom: 1px solid #000;
            padding-bottom: 3pt;
        }

        .date-weather {
            display: flex;
            gap: 20pt;
        }

        .masthead-title {
            font-family: 'Kalpurush', 'Noto Sans Bengali', serif;
            font-size: 36pt;
            font-weight: 900;
            color: #000;
            text-align: center;
            letter-spacing: 1pt;
            margin: 8pt 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .masthead-subtitle {
            text-align: center;
            font-size: 8pt;
            color: #000;
            margin-bottom: 4pt;
            font-weight: 500;
        }

        .edition-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 7pt;
            color: #000;
            border-top: 1px solid #000;
            padding-top: 3pt;
            font-weight: 600;
        }

        /* Main Content Layout - Real Newspaper Style */
        .main-content {
            display: block;
            margin-top: 4pt;
            flex: 1;
            height: auto;
            min-height: calc(100vh - 120pt);
        }

        /* Three Column Newspaper Layout */
        .article-layout {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8pt;
            margin-top: 6pt;
            column-rule: 1px solid #ccc;
        }

        .article-column {
            padding: 0 4pt;
            text-align: justify;
            break-inside: avoid-column;
        }

        .sidebar-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6pt;
            margin-top: 8pt;
            border-top: 2px solid #000;
            padding-top: 6pt;
        }

        .info-box {
            border: 1px solid #ccc;
            padding: 4pt;
            background: #f9f9f9;
        }

        /* Breaking News Banner */
        .breaking-banner {
            background: #ff0000;
            color: white;
            padding: 4pt 8pt;
            font-weight: 800;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            margin-bottom: 8pt;
            text-align: center;
        }

        /* Optimized Typography for Full Page */
        .main-headline {
            font-family: 'Kalpurush', 'Noto Sans Bengali', serif;
            font-size: 16pt;
            font-weight: 800;
            line-height: 1.1;
            color: #000;
            margin-bottom: 5pt;
            text-align: justify;
            hyphens: auto;
        }

        .secondary-headline {
            font-family: 'Kalpurush', 'Noto Sans Bengali', serif;
            font-size: 14pt;
            font-weight: 700;
            line-height: 1.2;
            color: #000;
            margin-bottom: 4pt;
            text-align: justify;
        }

        .sidebar-headline {
            font-family: 'Kalpurush', 'Noto Sans Bengali', serif;
            font-size: 11pt;
            font-weight: 700;
            line-height: 1.2;
            color: #000;
            margin-bottom: 3pt;
        }

        .byline {
            font-size: 6pt;
            color: #333;
            margin-bottom: 3pt;
            font-weight: 500;
        }

        /* Full Page Article Body Styles */
        .article-body {
            text-align: justify;
            font-size: 8pt;
            line-height: 1.3;
            color: #000;
        }

        .article-body p {
            margin-bottom: 4pt;
        }

        .main-article-body {
            font-size: 8pt;
            line-height: 1.35;
            flex: 1;
        }

        .secondary-article-body {
            font-size: 8pt;
            line-height: 1.3;
        }

        .sidebar-article-body {
            font-size: 7pt;
            line-height: 1.25;
        }

        /* Half-Cut Image Style - Real Newspaper */
        .main-image {
            width: 40%;
            max-width: 150pt;
            height: auto;
            max-height: 60pt;
            margin: 3pt 6pt 3pt 0;
            border: 1px solid #000;
            float: left;
            object-fit: cover;
            shape-outside: margin-box;
        }

        .image-caption {
            font-size: 5pt;
            color: #333;
            margin-top: 1pt;
            text-align: left;
            font-style: italic;
            clear: left;
        }

        /* Ultra Compact News Items */
        .news-item {
            margin-bottom: 2pt;
            padding-bottom: 2pt;
            border-bottom: 1px dotted #999;
        }

        .sidebar-headline {
            font-size: 8pt;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 2pt;
        }

        .sidebar-article-body {
            font-size: 6pt;
            line-height: 1.2;
        }

        .sidebar-article-body p {
            margin-bottom: 2pt;
        }

        .news-item:last-child {
            border-bottom: none;
        }

        /* Advertisement boxes */
        .ad-box {
            border: 2px solid #000;
            padding: 6pt;
            text-align: center;
            margin: 6pt 0;
            background: #f8f8f8;
        }

        .ad-text {
            font-weight: 700;
            font-size: 8pt;
        }

        /* Footer - Fixed at Bottom */
        .newspaper-footer {
            border-top: 2px solid #000;
            padding-top: 3pt;
            margin-top: auto;
            text-align: center;
            font-size: 6pt;
            color: #000;
            flex-shrink: 0;
        }

        /* Bottom Page Info - Compact */
        .page-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 5pt;
            color: #000;
            margin-top: 3pt;
            font-weight: 600;
        }

        /* Print Optimizations - Single Page */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                margin: 0;
                padding: 0;
            }
            
            .newspaper {
                page-break-inside: avoid;
                page-break-after: avoid;
                height: auto;
                min-height: auto;
            }
            
            .main-content {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .news-item {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            img {
                page-break-inside: avoid;
                break-inside: avoid;
                max-width: 100%;
                height: auto;
            }
        }

        /* Bengali Text Optimizations */
        .bengali-text {
            font-family: 'Kalpurush', 'Noto Sans Bengali', 'SolaimanLipi', Arial, sans-serif;
            font-feature-settings: "liga" 1, "calt" 1;
            text-rendering: optimizeLegibility;
        }

        /* Divider lines */
        .section-divider {
            border-top: 2px solid #000;
            margin: 6pt 0;
        }

        .thin-divider {
            border-top: 1px solid #999;
            margin: 4pt 0;
        }
    </style>
</head>
<body>
    <div class="newspaper">
        <!-- Authentic Masthead - Daily Amar Desh Style -->
        <header class="masthead">
            <!-- Top Header with Date and Info -->
            <div class="top-header bengali-text">
                <div class="date-weather">
                    <span><strong>${bengaliDate}</strong></span>
                    <span>ঢাকা: ২৮°সে | চট্টগ্রাম: ৩০°সে</span>
                </div>
                <div>
                    <span>প্রথম পাতা</span>
                    <span style="margin-left: 15pt;">মূল্য: ${config.edition.price || '১০ টাকা'}</span>
                </div>
            </div>

            <!-- Main Title -->
            <h1 class="masthead-title bengali-text">${config.masthead.title}</h1>
            
            <!-- Edition Info -->
            <div class="edition-info bengali-text">
                <div>প্রতিষ্ঠিত: ${config.masthead.established} | অনলাইন সংস্করণ</div>
                <div>শনিবার, ${todayDateBengali}</div>
                <div>${config.masthead.website}</div>
            </div>
        </header>

        <!-- Breaking News Banner -->
        <div class="breaking-banner bengali-text">
            ${config.masthead.title} বিশেষ: ${article.category || 'সর্বশেষ সংবাদ'}
        </div>

        <!-- Main Content Layout - Authentic Newspaper Style -->
        <div class="main-content">
            <!-- Article Header -->
            <h1 class="main-headline bengali-text">${article.title}</h1>
            
            <div class="byline bengali-text">
                ${article.author ? `প্রতিবেদক: ${article.author}` : 'নিজস্ব প্রতিবেদক'} | 
                ${new Date(article.publishedAt).toLocaleDateString('bn-BD')} | 
                বিভাগ: ${article.category || 'সাধারণ'}
            </div>

            ${article.imageUrl ? `
                <img src="${article.imageUrl}" alt="${article.title}" class="main-image" />
                <p class="image-caption bengali-text">ছবি: ${article.title}</p>
            ` : ''}

            <!-- Three Column Article Layout -->
            <div class="article-layout bengali-text">
                ${formatArticleContentInColumns(article.content)}
            </div>

            <!-- Bottom Information Section -->
            <div class="sidebar-info">
                <div class="info-box">
                    <h3 class="sidebar-headline bengali-text">আবহাওয়া</h3>
                    <div class="sidebar-article-body bengali-text">
                        <p><strong>ঢাকা:</strong> ২৮°/২২° | <strong>চট্টগ্রাম:</strong> ৩০°/২৪°</p>
                        <p><strong>সিলেট:</strong> ২৬°/২০° | <strong>খুলনা:</strong> ২৯°/২৩°</p>
                    </div>
                </div>
                
                <div class="info-box">
                    <h3 class="sidebar-headline bengali-text">নামাজের সময়</h3>
                    <div class="sidebar-article-body bengali-text">
                        <p>ফজর: ৫:১৫ | জোহর: ১২:০৫ | আসর: ৪:৩০</p>
                        <p>মাগরিব: ৬:১৫ | এশা: ৭:৩০</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer with Website Credit -->
        <footer class="newspaper-footer">
            <div class="page-info bengali-text">
                <div>সম্পাদক ও প্রকাশক: ${config.masthead.title} টিম</div>
                <div>ওয়েবসাইট: ${config.masthead.website}</div>
                <div>প্রকাশিত: ${todayDateBengali}</div>
            </div>
            <div class="thin-divider"></div>
            <p class="bengali-text" style="font-size: 5pt; text-align: center; margin-top: 3pt;">
                <strong>© ${new Date().getFullYear()} ${config.masthead.title}</strong> | সর্বস্বত্ব সংরক্ষিত | ওয়েবসাইট: <strong>${config.masthead.website}</strong>
            </p>
        </footer>
    </div>
</body>
</html>`;
}

function formatArticleContent(content: string): string {
  // Remove HTML tags and format for newspaper
  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  
  // Split into paragraphs
  const paragraphs = cleanContent.split('\n\n').filter(p => p.trim());
  
  // Format each paragraph
  return paragraphs
    .map(paragraph => `<p>${paragraph.trim()}</p>`)
    .join('\n            ');
}

function formatArticleContentInColumns(content: string): string {
  // Remove HTML tags and clean content
  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  
  // Split into paragraphs
  const paragraphs = cleanContent.split('\n\n').filter(p => p.trim());
  
  // If content is too short, put all in first column
  if (paragraphs.length <= 3) {
    return `
      <div class="article-column">
        ${paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n        ')}
      </div>
      <div class="article-column"></div>
      <div class="article-column"></div>
    `;
  }
  
  // Distribute paragraphs across 3 columns (newspaper style)
  const totalParagraphs = paragraphs.length;
  const col1Count = Math.ceil(totalParagraphs / 3);
  const col2Count = Math.ceil((totalParagraphs - col1Count) / 2);
  
  const column1 = paragraphs.slice(0, col1Count);
  const column2 = paragraphs.slice(col1Count, col1Count + col2Count);
  const column3 = paragraphs.slice(col1Count + col2Count);
  
  return `
    <div class="article-column">
      ${column1.map(p => `<p>${p.trim()}</p>`).join('\n      ')}
    </div>
    <div class="article-column">
      ${column2.map(p => `<p>${p.trim()}</p>`).join('\n      ')}
    </div>
    <div class="article-column">
      ${column3.map(p => `<p>${p.trim()}</p>`).join('\n      ')}
    </div>
  `;
}

async function convertHTMLToPDF(html: string, format: string): Promise<string> {
  // Convert any external images to base64 to ensure they appear in PDF
  const processedHTML = await processImagesForPDF(html);
  return processedHTML;
}

async function processImagesForPDF(html: string): Promise<string> {
  // Convert all img src URLs to base64 data URLs
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images = doc.querySelectorAll('img');
  
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    try {
      const src = img.getAttribute('src');
      if (src && (src.startsWith('http') || src.startsWith('/'))) {
        const base64 = await convertImageToBase64(src);
        if (base64) {
          img.setAttribute('src', base64);
        }
      }
    } catch (error) {
      console.warn('Failed to convert image to base64:', error);
      // Keep original src if conversion fails
    }
  }
  
  return doc.documentElement.outerHTML;
}

async function convertImageToBase64(imageUrl: string): Promise<string | null> {
  try {
    // Create a canvas to convert image to base64
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        try {
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64);
        } catch (e) {
          reject(e);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

export async function downloadNewspaperPDF(
  article: NewspaperArticleData, 
  filename?: string,
  config?: NewspaperConfig
): Promise<boolean> {
  try {
    const newspaperHTML = await generateNewspaperPDF(article, config);
    
    // Create a new window for printing with proper sizing
    const printWindow = window.open('', '_blank', 'width=800,height=1200');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    // Write the newspaper HTML to the new window
    printWindow.document.write(newspaperHTML);
    printWindow.document.close();

    // Wait for all content including images to load
    await new Promise((resolve) => {
      const checkImagesLoaded = () => {
        const images = printWindow.document.querySelectorAll('img');
        let loadedCount = 0;
        
        if (images.length === 0) {
          resolve(undefined);
          return;
        }
        
        images.forEach((img) => {
          if (img.complete) {
            loadedCount++;
          } else {
            img.onload = () => {
              loadedCount++;
              if (loadedCount === images.length) {
                resolve(undefined);
              }
            };
            img.onerror = () => {
              loadedCount++;
              if (loadedCount === images.length) {
                resolve(undefined);
              }
            };
          }
        });
        
        if (loadedCount === images.length) {
          resolve(undefined);
        }
      };
      
      if (printWindow.document.readyState === 'complete') {
        checkImagesLoaded();
      } else {
        printWindow.onload = checkImagesLoaded;
      }
      
      // Fallback timeout
      setTimeout(resolve, 3000);
    });

    // Focus and print with single page settings
    printWindow.focus();
    
    // Print with specific settings to ensure single page
    setTimeout(() => {
      printWindow.print();
    }, 500);

    // Close after printing
    setTimeout(() => {
      printWindow.close();
    }, 3000);

    return true;
  } catch (error) {
    console.error('Error generating newspaper PDF:', error);
    return false;
  }
}

// Advanced newspaper layout with multiple articles
export interface NewspaperEdition {
  masthead: {
    title: string;
    subtitle?: string;
    established?: string;
    website?: string;
  };
  edition: {
    date: string;
    issue?: string;
    volume?: string;
    price?: string;
  };
  articles: {
    headline: NewspaperArticleData;
    secondary: NewspaperArticleData[];
    sidebar: NewspaperArticleData[];
  };
  advertisements?: {
    position: 'top' | 'middle' | 'bottom' | 'sidebar';
    content: string;
  }[];
}

export async function generateFullNewspaperEdition(
  edition: NewspaperEdition
): Promise<string> {
  // This would generate a complete multi-article newspaper
  // Implementation would involve complex layout algorithms
  // For now, we'll focus on single article generation
  return generateNewspaperPDF(edition.articles.headline);
}