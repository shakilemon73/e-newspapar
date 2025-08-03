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

        /* Page Setup for Print - Single Page Layout */
        @page {
            size: ${config.format === 'broadsheet' ? '11in 17in' : config.format === 'tabloid' ? '11in 17in' : 'A4'};
            margin: 0.4in 0.3in;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Kalpurush', 'Noto Sans Bengali', 'SolaimanLipi', Arial, sans-serif;
            line-height: 1.25;
            color: #000;
            background: white;
            font-size: 8pt;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            margin: 0;
            padding: 6pt;
            overflow-x: hidden;
        }

        /* Authentic Newspaper Layout - Single Page */
        .newspaper {
            max-width: 100%;
            height: auto;
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

        /* Main Content Layout - Responsive Single Page */
        .main-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 4pt;
            margin-top: 6pt;
            height: auto;
            max-height: calc(100vh - 200pt);
        }

        .main-story-column {
            padding-right: 4pt;
            border-right: 1px solid #ccc;
        }

        .sidebar-column {
            padding-left: 4pt;
            font-size: 6pt;
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

        /* Compact Typography for Single Page */
        .main-headline {
            font-family: 'Kalpurush', 'Noto Sans Bengali', serif;
            font-size: 14pt;
            font-weight: 800;
            line-height: 1.0;
            color: #000;
            margin-bottom: 4pt;
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

        /* Compact Article Body Styles */
        .article-body {
            text-align: justify;
            font-size: 7pt;
            line-height: 1.2;
            color: #000;
        }

        .article-body p {
            margin-bottom: 3pt;
        }

        .main-article-body {
            font-size: 7pt;
            line-height: 1.25;
        }

        .secondary-article-body {
            font-size: 8pt;
            line-height: 1.3;
        }

        .sidebar-article-body {
            font-size: 7pt;
            line-height: 1.25;
        }

        /* Compact Image Styles */
        .main-image {
            width: 100%;
            max-width: 100%;
            height: auto;
            max-height: 80pt;
            margin: 3pt 0;
            border: 1px solid #000;
            display: block;
            object-fit: cover;
        }

        .image-caption {
            font-size: 6pt;
            color: #333;
            margin-top: 2pt;
            text-align: center;
            font-style: italic;
        }

        /* Ultra Compact News Items */
        .news-item {
            margin-bottom: 2pt;
            padding-bottom: 2pt;
            border-bottom: 1px dotted #999;
        }

        .sidebar-headline {
            font-size: 7pt;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 1pt;
        }

        .sidebar-article-body {
            font-size: 5pt;
            line-height: 1.1;
        }

        .sidebar-article-body p {
            margin-bottom: 1pt;
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

        /* Footer */
        .newspaper-footer {
            border-top: 3px solid #000;
            padding-top: 4pt;
            margin-top: 12pt;
            text-align: center;
            font-size: 6pt;
            color: #000;
        }

        /* Bottom Page Info */
        .page-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 6pt;
            color: #000;
            margin-top: 8pt;
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

        <!-- Main Content Layout - Responsive Single Page -->
        <div class="main-content">
            <!-- Main Article Column -->
            <div class="main-story-column">
                <h1 class="main-headline bengali-text">${article.title}</h1>
                
                <div class="byline bengali-text">
                    ${article.author ? `প্রতিবেদক: ${article.author}` : 'নিজস্ব প্রতিবেদক'} | 
                    ${new Date(article.publishedAt).toLocaleDateString('bn-BD')}
                </div>

                ${article.imageUrl ? `
                    <img src="${article.imageUrl}" alt="${article.title}" class="main-image" />
                    <p class="image-caption bengali-text">ছবি: ${article.title}</p>
                ` : ''}

                <div class="main-article-body bengali-text">
                    ${formatArticleContent(article.content)}
                </div>

                <div class="thin-divider"></div>

                <!-- Compact Article Information -->
                <div class="news-item">
                    <h3 class="sidebar-headline bengali-text">নিবন্ধ তথ্য</h3>
                    <div class="sidebar-article-body bengali-text">
                        <p><strong>বিভাগ:</strong> ${article.category || 'সাধারণ'} | <strong>পাঠ সময়:</strong> ${article.readingTime || 5} মিনিট</p>
                        ${article.tags && article.tags.length > 0 ? `<p><strong>ট্যাগ:</strong> ${article.tags.join(', ')}</p>` : ''}
                    </div>
                </div>
            </div>

            <!-- Sidebar with Weather & Prayer Times -->
            <div class="sidebar-column">
                <div class="news-item">
                    <h3 class="sidebar-headline bengali-text">আবহাওয়া</h3>
                    <div class="sidebar-article-body bengali-text">
                        <p><strong>ঢাকা:</strong> সর্বোচ্চ ২৮°, সর্বনিম্ন ২২°</p>
                        <p><strong>চট্টগ্রাম:</strong> সর্বোচ্চ ৩০°, সর্বনিম্ন ২৪°</p>
                        <p><strong>সিলেট:</strong> সর্বোচ্চ ২৬°, সর্বনিম্ন ২০°</p>
                        <p><strong>খুলনা:</strong> সর্বোচ্চ ২৯°, সর্বনিম্ন ২৩°</p>
                    </div>
                </div>

                <div class="news-item">
                    <h3 class="sidebar-headline bengali-text">নামাজের সময়</h3>
                    <div class="sidebar-article-body bengali-text">
                        <p>ফজর: ৫:১৫ | জোহর: ১২:০৫</p>
                        <p>আসর: ৪:৩০ | মাগরিব: ৬:১৫</p>
                        <p>এশা: ৭:৩০</p>
                    </div>
                </div>

                <div class="news-item">
                    <h3 class="sidebar-headline bengali-text">${config.masthead.title} সম্পর্কে</h3>
                    <div class="sidebar-article-body bengali-text">
                        <p>${config.masthead.subtitle}</p>
                        <p><strong>প্রতিষ্ঠিত:</strong> ${config.masthead.established}</p>
                        <p><strong>ওয়েবসাইট:</strong> ${config.masthead.website}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="newspaper-footer">
            <div class="page-info bengali-text">
                <div>সম্পাদক ও প্রকাশক: ${config.masthead.title} টিম</div>
                <div>ঢাকা অফিস: ${config.masthead.website}</div>
                <div>যোগাযোগ: ${config.masthead.website}</div>
            </div>
            <div class="thin-divider"></div>
            <p class="bengali-text" style="font-size: 5pt; text-align: center; margin-top: 3pt;">
                প্রকাশিত: ${todayDateBengali} | সর্বস্বত্ব সংরক্ষিত - ${config.masthead.title} | ${config.masthead.website}
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