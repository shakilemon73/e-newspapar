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
      title: 'বাংলা নিউজ টাইমস',
      subtitle: 'Bangladesh\'s Leading News Source',
      established: '২০২৪',
      website: 'www.banglanews.com'
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
  
  const weatherInfo = {
    dhaka: { temp: '২৮°', condition: 'রৌদ্রোজ্জ্বল' },
    chittagong: { temp: '৩০°', condition: 'আংশিক মেঘলা' }
  };

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.masthead.title} - ${article.title}</title>
    <style>
        /* Professional Newspaper CSS - Print Optimized */
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&display=swap');

        /* Page Setup for Print */
        @page {
            size: ${config.format === 'broadsheet' ? '11in 17in' : config.format === 'tabloid' ? '11in 17in' : 'A4'};
            margin: 0.5in 0.3in;
            @top-center {
                content: "${config.masthead.title}";
            }
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans Bengali', 'Kalpurush', 'SolaimanLipi', Arial, sans-serif;
            line-height: 1.4;
            color: #1a1a1a;
            background: white;
            font-size: 10pt;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }

        /* Newspaper Grid Layout */
        .newspaper {
            display: grid;
            grid-template-columns: repeat(${config.columns}, 1fr);
            grid-gap: 12pt;
            max-width: 100%;
            min-height: 100vh;
        }

        /* Masthead (Header) */
        .masthead {
            grid-column: 1 / -1;
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 8pt;
            margin-bottom: 12pt;
            background: linear-gradient(to bottom, #f8f8f8, #ffffff);
        }

        .masthead-title {
            font-family: 'Playfair Display', serif;
            font-size: 48pt;
            font-weight: 900;
            color: #000;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            letter-spacing: 2pt;
            margin-bottom: 4pt;
        }

        .masthead-subtitle {
            font-family: 'Source Serif Pro', serif;
            font-size: 11pt;
            color: #666;
            font-style: italic;
            margin-bottom: 6pt;
        }

        .masthead-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8pt;
            color: #555;
            border-top: 1px solid #ddd;
            padding-top: 4pt;
        }

        .date-info {
            font-weight: 600;
        }

        .weather-info {
            display: flex;
            gap: 12pt;
        }

        /* News Header Info */
        .news-header {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 12pt;
            margin-bottom: 16pt;
            padding-bottom: 8pt;
            border-bottom: 2px solid #000;
        }

        .breaking-news {
            background: #d32f2f;
            color: white;
            padding: 6pt 12pt;
            font-weight: 700;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 1pt;
        }

        /* Main Article Layout */
        .main-article {
            grid-column: 1 / ${Math.ceil(config.columns * 0.7)};
        }

        .sidebar {
            grid-column: ${Math.ceil(config.columns * 0.7)} / -1;
        }

        /* Typography Hierarchy */
        .headline {
            font-family: 'Playfair Display', serif;
            font-size: 24pt;
            font-weight: 700;
            line-height: 1.1;
            color: #000;
            margin-bottom: 8pt;
            text-align: justify;
            hyphens: auto;
        }

        .subheadline {
            font-size: 14pt;
            font-weight: 500;
            color: #444;
            margin-bottom: 8pt;
            font-style: italic;
            line-height: 1.3;
        }

        .byline {
            font-size: 9pt;
            color: #666;
            margin-bottom: 12pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
        }

        .category-tag {
            background: #000;
            color: white;
            padding: 2pt 6pt;
            font-size: 7pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            margin-bottom: 8pt;
            display: inline-block;
        }

        /* Article Body */
        .article-body {
            text-align: justify;
            hyphens: auto;
            orphans: 3;
            widows: 3;
        }

        .article-body p {
            margin-bottom: 8pt;
            line-height: 1.4;
        }

        .article-body p:first-letter {
            float: left;
            font-family: 'Playfair Display', serif;
            font-size: 48pt;
            line-height: 40pt;
            padding-right: 6pt;
            padding-top: 2pt;
            font-weight: 700;
            color: #000;
        }

        /* Image Styles */
        .article-image {
            width: 100%;
            height: auto;
            margin: 12pt 0;
            border: 1px solid #ddd;
        }

        .image-caption {
            font-size: 8pt;
            color: #666;
            font-style: italic;
            margin-top: 4pt;
            text-align: center;
        }

        /* Sidebar Content */
        .sidebar-box {
            border: 1px solid #000;
            padding: 8pt;
            margin-bottom: 12pt;
            background: #f9f9f9;
        }

        .sidebar-title {
            font-weight: 700;
            font-size: 11pt;
            margin-bottom: 6pt;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            border-bottom: 1px solid #666;
            padding-bottom: 2pt;
        }

        .sidebar-content {
            font-size: 8pt;
            line-height: 1.3;
        }

        /* Footer */
        .newspaper-footer {
            grid-column: 1 / -1;
            border-top: 2px solid #000;
            padding-top: 8pt;
            margin-top: 16pt;
            text-align: center;
            font-size: 7pt;
            color: #666;
        }

        /* Advertisement Placeholder */
        .advertisement {
            border: 2px solid #000;
            padding: 12pt;
            text-align: center;
            background: #f5f5f5;
            margin: 8pt 0;
        }

        .ad-text {
            font-weight: 700;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 1pt;
        }

        /* Print Optimizations */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            .newspaper {
                page-break-inside: avoid;
            }

            .headline {
                page-break-after: avoid;
            }

            .article-body {
                orphans: 3;
                widows: 3;
            }

            .sidebar-box {
                page-break-inside: avoid;
            }
        }

        /* Bengali Text Optimizations */
        .bengali-text {
            font-family: 'Noto Sans Bengali', 'Kalpurush', 'SolaimanLipi', Arial, sans-serif;
            font-feature-settings: "liga" 1, "calt" 1;
            text-rendering: optimizeLegibility;
        }

        /* Column Rules */
        .column-rule {
            border-right: 1px solid #ddd;
            padding-right: 6pt;
        }

        /* Stats Box */
        .stats-box {
            background: #000;
            color: white;
            padding: 6pt;
            text-align: center;
            margin: 8pt 0;
        }

        .stats-number {
            font-size: 18pt;
            font-weight: 700;
            display: block;
        }

        .stats-label {
            font-size: 7pt;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
        }
    </style>
</head>
<body>
    <div class="newspaper">
        <!-- Masthead -->
        <header class="masthead">
            <h1 class="masthead-title bengali-text">${config.masthead.title}</h1>
            ${config.masthead.subtitle ? `<p class="masthead-subtitle">${config.masthead.subtitle}</p>` : ''}
            <div class="masthead-info">
                <div class="date-info bengali-text">
                    ${bengaliDate} | ${config.edition.issue || ''} | ${config.edition.volume || ''}
                </div>
                <div class="weather-info bengali-text">
                    <span>ঢাকা: ${weatherInfo.dhaka.temp} ${weatherInfo.dhaka.condition}</span>
                    <span>চট্টগ্রাম: ${weatherInfo.chittagong.temp} ${weatherInfo.chittagong.condition}</span>
                </div>
                <div class="price-info bengali-text">
                    ${config.edition.price || ''} | ${config.masthead.website || ''}
                </div>
            </div>
        </header>

        <!-- Breaking News Banner -->
        <div class="news-header">
            <div class="breaking-news bengali-text">
                🔴 ব্রেকিং নিউজ: ${article.category || 'সর্বশেষ সংবাদ'}
            </div>
        </div>

        <!-- Main Article -->
        <article class="main-article">
            ${article.category ? `<div class="category-tag bengali-text">${article.category}</div>` : ''}
            
            <h1 class="headline bengali-text">${article.title}</h1>
            
            ${article.excerpt ? `<p class="subheadline bengali-text">${article.excerpt}</p>` : ''}
            
            <div class="byline bengali-text">
                ${article.author ? `লিখেছেন: ${article.author}` : 'স্টাফ রিপোর্টার'} | 
                ${new Date(article.publishedAt).toLocaleDateString('bn-BD')}
                ${article.readingTime ? ` | পড়ার সময়: ${article.readingTime} মিনিট` : ''}
            </div>

            ${article.imageUrl ? `
                <img src="${article.imageUrl}" alt="${article.title}" class="article-image" />
                <p class="image-caption bengali-text">ছবি: ${article.title}</p>
            ` : ''}

            <div class="article-body bengali-text">
                ${formatArticleContent(article.content)}
            </div>

            ${article.tags && article.tags.length > 0 ? `
                <div style="margin-top: 12pt; padding-top: 8pt; border-top: 1px solid #ddd;">
                    <strong style="font-size: 8pt;">ট্যাগসমূহ:</strong>
                    <span style="font-size: 8pt; color: #666;">${article.tags.join(', ')}</span>
                </div>
            ` : ''}
        </article>

        <!-- Sidebar -->
        <aside class="sidebar">
            <!-- Statistics Box -->
            <div class="sidebar-box">
                <h3 class="sidebar-title bengali-text">পাঠক পরিসংখ্যান</h3>
                <div class="sidebar-content bengali-text">
                    <div class="stats-box">
                        <span class="stats-number">${article.viewCount || '১,২৩৪'}</span>
                        <span class="stats-label">বার পড়া হয়েছে</span>
                    </div>
                    <div class="stats-box" style="background: #d32f2f;">
                        <span class="stats-number">${article.readingTime || '৫'}</span>
                        <span class="stats-label">মিনিট পড়ার সময়</span>
                    </div>
                </div>
            </div>

            <!-- Today's Headlines -->
            <div class="sidebar-box">
                <h3 class="sidebar-title bengali-text">আজকের শিরোনাম</h3>
                <div class="sidebar-content bengali-text">
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 6pt; padding-bottom: 4pt; border-bottom: 1px dotted #ccc;">
                            • বাংলাদেশে নতুন প্রযুক্তি উদ্ভাবন
                        </li>
                        <li style="margin-bottom: 6pt; padding-bottom: 4pt; border-bottom: 1px dotted #ccc;">
                            • অর্থনৈতিক উন্নতির নতুন মাত্রা
                        </li>
                        <li style="margin-bottom: 6pt; padding-bottom: 4pt; border-bottom: 1px dotted #ccc;">
                            • শিক্ষা ক্ষেত্রে আধুনিকায়ন
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Advertisement -->
            <div class="advertisement">
                <div class="ad-text bengali-text">বিজ্ঞাপনের স্থান</div>
                <div style="font-size: 7pt; margin-top: 4pt; color: #666;">
                    বিজ্ঞাপনের জন্য যোগাযোগ করুন
                </div>
            </div>

            <!-- QR Code for Digital Version -->
            <div class="sidebar-box">
                <h3 class="sidebar-title bengali-text">ডিজিটাল সংস্করণ</h3>
                <div class="sidebar-content bengali-text" style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: #000; margin: 8pt auto; position: relative;">
                        <div style="color: white; font-size: 6pt; text-align: center; padding-top: 35pt;">QR CODE</div>
                    </div>
                    <p style="font-size: 7pt; margin-top: 4pt;">
                        স্ক্যান করুন ডিজিটাল সংস্করণের জন্য
                    </p>
                </div>
            </div>
        </aside>

        <!-- Footer -->
        <footer class="newspaper-footer bengali-text">
            <p>
                সম্পাদক ও প্রকাশক: ${config.masthead.title} | 
                ${config.masthead.website || 'www.newspaper.com'} | 
                মুদ্রণ: ${new Date().toLocaleDateString('bn-BD')}
            </p>
            <p style="margin-top: 4pt; font-size: 6pt;">
                এই পত্রিকার কোনো লেখা, ছবি, কার্টুন, কম্পিউটার গ্রাফিক্স, অডিও-ভিজুয়াল কনটেন্ট কর্তৃপক্ষের অনুমতি ছাড়া পুনর্প্রকাশ বা অন্যান্য মাধ্যমে ব্যবহার করা যাবে না।
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
  // Return the HTML for now - in a real implementation, you would use:
  // - Puppeteer for server-side generation
  // - Browser print API for client-side generation
  // - Or a PDF generation service

  // For client-side implementation, we'll use the browser's print functionality
  return html;
}

export async function downloadNewspaperPDF(
  article: NewspaperArticleData, 
  filename?: string,
  config?: NewspaperConfig
): Promise<boolean> {
  try {
    const newspaperHTML = await generateNewspaperPDF(article, config);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    // Write the newspaper HTML to the new window
    printWindow.document.write(newspaperHTML);
    printWindow.document.close();

    // Wait for content to load
    await new Promise(resolve => {
      printWindow.onload = resolve;
      // Fallback timeout
      setTimeout(resolve, 1000);
    });

    // Focus and print
    printWindow.focus();
    printWindow.print();

    // Close after a delay to allow printing
    setTimeout(() => {
      printWindow.close();
    }, 2000);

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