// Direct Supabase E-Paper Generation Service
// Bypasses Express server for better performance and reliability

import { createClient } from '@supabase/supabase-js';

// Create admin client for server operations (service role key)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface EPaperGenerationOptions {
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

export interface Article {
  id: number;
  title: string;
  content: string;
  author_id?: number;
  published_at: string;
  image_url?: string;
  is_featured?: boolean;
  view_count?: number;
  category_id?: number;
  categories?: { name: string };
  users?: { full_name: string };
  author?: string; // Computed field for compatibility
}

export class EpaperService {
  
  // Fetch articles directly from Supabase using service role key
  async fetchArticles(options: EPaperGenerationOptions): Promise<Article[]> {
    console.log('🔐 Using service role key to fetch articles (bypassing RLS)');
    
    try {
      let query = adminSupabase
        .from('articles')
        .select(`
          id,
          title,
          content,
          author_id,
          published_at,
          image_url,
          is_featured,
          view_count,
          category_id,
          categories!inner(name)
        `)
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('view_count', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(options.maxArticles);

      // Filter by categories if specified
      if (options.includeCategories && options.includeCategories.length > 0) {
        query = query.in('categories.name', options.includeCategories);
      }

      if (options.excludeCategories && options.excludeCategories.length > 0) {
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
        console.error('❌ Supabase error fetching articles:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`✅ Successfully fetched ${data?.length || 0} articles`);
      
      // Fetch author names separately if articles have author_id
      const articlesWithAuthors = await Promise.all(
        (data || []).map(async (article) => {
          if (article.author_id) {
            try {
              const { data: userData } = await adminSupabase
                .from('users')
                .select('full_name')
                .eq('id', article.author_id)
                .single();
              
              return {
                ...article,
                users: userData ? { full_name: userData.full_name } : null
              };
            } catch (error) {
              console.warn(`Could not fetch author for article ${article.id}:`, error);
              return {
                ...article,
                users: { full_name: 'সংবাদ ডেস্ক' }
              };
            }
          }
          return {
            ...article,
            users: { full_name: 'সংবাদ ডেস্ক' }
          };
        })
      );
      
      return articlesWithAuthors;

    } catch (error) {
      console.error('❌ Error in fetchArticles:', error);
      throw error;
    }
  }

  // Fetch categories directly from Supabase
  async fetchCategories(): Promise<string[]> {
    console.log('🔐 Fetching categories using service role key');
    
    try {
      const { data: categories, error } = await adminSupabase
        .from('categories')
        .select('name')
        .order('name');

      if (error) {
        console.error('❌ Error fetching categories:', error);
        // Return fallback categories if database fails
        return [
          'জাতীয়',
          'আন্তর্জাতিক', 
          'রাজনীতি',
          'অর্থনীতি',
          'খেলাধুলা',
          'বিনোদন',
          'প্রযুক্তি',
          'শিক্ষা',
          'স্বাস্থ্য'
        ];
      }

      return categories?.map(cat => cat.name) || [];

    } catch (error) {
      console.error('❌ Error in fetchCategories:', error);
      // Return fallback categories
      return [
        'জাতীয়',
        'আন্তর্জাতিক',
        'রাজনীতি',
        'অর্থনীতি',
        'খেলাধুলা',
        'বিনোদন',
        'প্রযুক্তি',
        'শিক্ষা',
        'স্বাস্থ্য'
      ];
    }
  }

  // Preview articles for e-paper generation
  async previewArticles(options: EPaperGenerationOptions): Promise<{ articles: Article[]; totalCount: number }> {
    try {
      const articles = await this.fetchArticles(options);
      
      return {
        articles: articles.map(article => ({
          ...article,
          content: article.content?.substring(0, 200) + '...', // Truncate for preview
          category: article.categories?.name || 'সাধারণ', // Add category field for compatibility
          author: article.users?.full_name || 'সংবাদ ডেস্ক' // Add author field for compatibility
        })),
        totalCount: articles.length
      };

    } catch (error) {
      console.error('❌ Error in previewArticles:', error);
      throw error;
    }
  }

  // Generate e-paper (simplified PDF creation)
  async generateEPaper(options: EPaperGenerationOptions): Promise<{
    success: boolean;
    pdfUrl?: string;
    title: string;
    date: string;
    articleCount: number;
    error?: string;
  }> {
    try {
      console.log('🚀 Starting e-paper generation with direct Supabase calls');
      
      // Fetch articles
      const articles = await this.fetchArticles(options);
      
      if (articles.length === 0) {
        return {
          success: false,
          error: 'No articles found matching the criteria. Please check your filters or try expanding the date range.',
          title: options.title,
          date: options.date,
          articleCount: 0
        };
      }

      // Create a real HTML-based e-paper that can be previewed
      const htmlContent = this.generateHTMLEPaper(articles, options);
      
      // Create a blob URL for immediate preview
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const pdfUrl = URL.createObjectURL(blob);
      
      // Store the HTML content for later retrieval
      const epaperData = {
        htmlContent,
        articles,
        options,
        generatedAt: new Date().toISOString()
      };
      
      // Store in localStorage for preview access
      localStorage.setItem(`epaper-${Date.now()}`, JSON.stringify(epaperData));
      
      console.log('✅ E-Paper generated successfully');
      
      return {
        success: true,
        pdfUrl: pdfUrl,
        title: options.title,
        date: options.date,
        articleCount: articles.length
      };

    } catch (error) {
      console.error('❌ E-Paper generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        title: options.title,
        date: options.date,
        articleCount: 0
      };
    }
  }

  // Generate World-Class HTML E-Paper with Professional Layout
  private generateHTMLEPaper(articles: Article[], options: EPaperGenerationOptions): string {
    const date = new Date(options.date).toLocaleDateString('bn-BD');
    const breakingNews = articles.filter(a => a.is_breaking);
    const leadStory = articles.find(a => !a.is_breaking && a.priority >= 80) || articles[0];
    const secondaryStories = articles.filter(a => a !== leadStory && !a.is_breaking).slice(0, 3);
    const sidebarStories = articles.filter(a => a !== leadStory && !a.is_breaking).slice(3, 7);
    const bottomStories = articles.filter(a => a !== leadStory && !a.is_breaking).slice(7, 13);
    
    return `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;
            background: #ffffff;
            color: #000000;
            line-height: 1.6;
        }
        
        .newspaper-container {
            width: 2100px;  /* A3 landscape */
            height: 2970px; /* A3 portrait */
            margin: 0 auto;
            background: white;
            position: relative;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            transform-origin: top center;
            transform: scale(0.4); /* Scale down for web viewing */
        }
        
        .newspaper-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            grid-template-rows: repeat(20, 1fr);
            gap: 18px;
            padding: 72px;
            height: 100%;
        }
        
        /* Professional Masthead */
        .masthead {
            grid-column: 1 / -1;
            grid-row: 1 / 3;
            text-align: center;
            border-bottom: 4px solid #c41e3a;
            padding: 24px 0;
            position: relative;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        }
        
        .masthead::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 2px;
            background: #c41e3a;
        }
        
        .newspaper-title {
            font-size: 84px;
            font-weight: 800;
            color: #000000;
            margin-bottom: 12px;
            letter-spacing: -2px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .newspaper-subtitle {
            font-size: 24px;
            color: #666666;
            font-weight: 400;
            margin-bottom: 8px;
        }
        
        .newspaper-date {
            font-size: 18px;
            color: #888888;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
        }
        
        .weather-widget {
            grid-column: 11 / -1;
            grid-row: 1 / 3;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 16px;
            font-size: 14px;
            text-align: center;
        }
        
        /* Breaking News Banner */
        .breaking-banner {
            grid-column: 1 / -1;
            grid-row: 3 / 4;
            background: linear-gradient(90deg, #dc3545, #c82333);
            color: white;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            overflow: hidden;
        }
        
        .breaking-label {
            background: white;
            color: #dc3545;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 14px;
            margin-right: 16px;
            text-transform: uppercase;
        }
        
        .breaking-text {
            font-size: 16px;
            font-weight: 600;
            white-space: nowrap;
            animation: scroll-left 30s linear infinite;
        }
        
        @keyframes scroll-left {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
        
        /* Lead Story - Main article */
        .lead-story {
            grid-column: 1 / 8;
            grid-row: ${breakingNews.length > 0 ? '4' : '3'} / 14;
            border-right: 2px solid #e9ecef;
            padding-right: 18px;
            position: relative;
        }
        
        .lead-headline {
            font-size: 48px;
            font-weight: 700;
            line-height: 1.1;
            color: #000000;
            margin-bottom: 16px;
            text-align: justify;
        }
        
        .lead-image {
            width: 100%;
            height: 300px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            margin: 16px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            font-size: 14px;
        }
        
        .byline {
            font-size: 14px;
            color: #6c757d;
            font-style: italic;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .article-content {
            font-size: 16px;
            line-height: 1.7;
            text-align: justify;
            column-count: 2;
            column-gap: 20px;
            column-rule: 1px solid #e9ecef;
        }
        
        /* Secondary Stories Sidebar */
        .secondary-stories {
            grid-column: 8 / -1;
            grid-row: ${breakingNews.length > 0 ? '4' : '3'} / 9;
            padding-left: 18px;
        }
        
        .sidebar-stories {
            grid-column: 8 / -1;
            grid-row: 9 / 14;
            padding-left: 18px;
        }
        
        .story-card {
            border-bottom: 2px solid #e9ecef;
            padding: 20px 0;
            margin-bottom: 16px;
        }
        
        .story-card:last-child {
            border-bottom: none;
        }
        
        .story-headline {
            font-size: 22px;
            font-weight: 600;
            line-height: 1.3;
            color: #000000;
            margin-bottom: 8px;
        }
        
        .story-meta {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .story-excerpt {
            font-size: 14px;
            line-height: 1.5;
            color: #495057;
            text-align: justify;
        }
        
        /* Bottom Stories Grid */
        .bottom-stories {
            grid-column: 1 / -1;
            grid-row: 14 / -2;
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 18px;
            border-top: 3px solid #c41e3a;
            padding-top: 24px;
        }
        
        .bottom-story {
            padding: 16px;
            border: 1px solid #e9ecef;
            background: #fafafa;
        }
        
        .bottom-headline {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #000000;
        }
        
        .bottom-content {
            font-size: 12px;
            line-height: 1.4;
            color: #495057;
        }
        
        /* Footer */
        .newspaper-footer {
            grid-column: 1 / -1;
            grid-row: -2 / -1;
            border-top: 1px solid #dee2e6;
            padding: 16px 0;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            background: #f8f9fa;
        }
        
        /* Responsive scaling for different screen sizes */
        @media (max-width: 1920px) {
            .newspaper-container {
                transform: scale(0.35);
            }
        }
        
        @media (max-width: 1440px) {
            .newspaper-container {
                transform: scale(0.25);
            }
        }
        
        @media (max-width: 1024px) {
            .newspaper-container {
                transform: scale(0.2);
            }
        }
        
        /* Print optimizations */
        @media print {
            .newspaper-container {
                transform: none;
                box-shadow: none;
            }
            
            @page {
                size: A3 portrait;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="newspaper-container">
        <div class="newspaper-grid">
            <!-- Professional Masthead -->
            <header class="masthead">
                <h1 class="newspaper-title">${options.title}</h1>
                <p class="newspaper-subtitle">বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম</p>
                <div class="newspaper-date">
                    <span>${date}</span>
                    <span>প্রথম সংস্করণ</span>
                    <span>পৃষ্ঠা ১</span>
                </div>
            </header>
            
            <!-- Weather Widget -->
            <div class="weather-widget">
                <h4>আজকের আবহাওয়া</h4>
                <div style="margin: 8px 0;">
                    <strong>ঢাকা:</strong> ২৮°সে<br>
                    <small>আংশিক মেঘলা</small>
                </div>
            </div>
            
            ${breakingNews.length > 0 ? `
            <!-- Breaking News Banner -->
            <div class="breaking-banner">
                <div class="breaking-label">জরুরি খবর</div>
                <div class="breaking-text">
                    ${breakingNews.map(a => a.title).join(' • ')}
                </div>
            </div>
            ` : ''}
            
            <!-- Lead Story -->
            <article class="lead-story">
                ${leadStory ? `
                    <h1 class="lead-headline">${leadStory.title}</h1>
                    <div class="lead-image">
                        ${leadStory.image_url ? `<img src="${leadStory.image_url}" alt="" style="width:100%;height:100%;object-fit:cover;">` : 'ছবি: সংবাদ ডেস্ক'}
                    </div>
                    <div class="byline">
                        ${leadStory.users?.full_name || leadStory.author || 'সংবাদ ডেস্ক'} • ${leadStory.categories?.name || leadStory.category || 'প্রধান সংবাদ'}
                    </div>
                    <div class="article-content">
                        ${leadStory.content || 'বিস্তারিত সংবাদ শীঘ্রই প্রকাশিত হবে। এই সংবাদটি গুরুত্বপূর্ণ এবং আমাদের প্রতিনিধিরা ঘটনাস্থল থেকে সংবাদ সংগ্রহ করে আনছেন। পাঠকদের জন্য সঠিক এবং নিরপেক্ষ তথ্য উপস্থাপন করাই আমাদের লক্ষ্য। এই ঘটনার প্রভাব সমাজের বিভিন্ন স্তরে পড়বে বলে বিশেষজ্ঞরা মনে করছেন।'}
                    </div>
                ` : '<p>কোন প্রধান সংবাদ পাওয়া যায়নি।</p>'}
            </article>
            
            <!-- Secondary Stories -->
            <aside class="secondary-stories">
                <h2 style="font-size: 24px; margin-bottom: 16px; color: #c41e3a; border-bottom: 2px solid #c41e3a; padding-bottom: 8px;">গুরুত্বপূর্ণ সংবাদ</h2>
                ${secondaryStories.map(article => `
                    <div class="story-card">
                        <h3 class="story-headline">${article.title}</h3>
                        <div class="story-meta">${article.categories?.name || article.category || 'সাধারণ'} • ${article.users?.full_name || article.author || 'সংবাদ ডেস্ক'}</div>
                        <p class="story-excerpt">${article.content ? article.content.substring(0, 150) + '...' : 'সংবাদ বিস্তারিত শীঘ্রই প্রকাশিত হবে।'}</p>
                    </div>
                `).join('')}
                ${secondaryStories.length === 0 ? '<p style="color: #666;">আরও সংবাদ শীঘ্রই যুক্ত হবে।</p>' : ''}
            </aside>
            
            <!-- Sidebar Stories -->
            <aside class="sidebar-stories">
                <h2 style="font-size: 24px; margin-bottom: 16px; color: #c41e3a; border-bottom: 2px solid #c41e3a; padding-bottom: 8px;">অন্যান্য সংবাদ</h2>
                ${sidebarStories.map(article => `
                    <div class="story-card">
                        <h3 class="story-headline">${article.title}</h3>
                        <div class="story-meta">${article.categories?.name || article.category || 'সাধারণ'}</div>
                        <p class="story-excerpt">${article.content ? article.content.substring(0, 120) + '...' : 'বিস্তারিত শীঘ্রই প্রকাশিত হবে।'}</p>
                    </div>
                `).join('')}
                ${sidebarStories.length === 0 ? '<p style="color: #666;">আরও সংবাদ শীঘ্রই যুক্ত হবে।</p>' : ''}
            </aside>
            
            <!-- Bottom Stories Grid -->
            <section class="bottom-stories">
                ${bottomStories.map(article => `
                    <div class="bottom-story">
                        <h4 class="bottom-headline">${article.title}</h4>
                        <div class="story-meta" style="margin-bottom: 4px;">${article.categories?.name || article.category || 'সাধারণ'}</div>
                        <p class="bottom-content">${article.content ? article.content.substring(0, 100) + '...' : 'বিস্তারিত শীঘ্রই প্রকাশিত হবে।'}</p>
                    </div>
                `).join('')}
                ${Array.from({length: Math.max(0, 6 - bottomStories.length)}, (_, i) => `
                    <div class="bottom-story" style="opacity: 0.5;">
                        <h4 class="bottom-headline">আরও সংবাদ আসছে...</h4>
                        <div class="story-meta" style="margin-bottom: 4px;">সাধারণ</div>
                        <p class="bottom-content">নতুন সংবাদ শীঘ্রই যুক্ত হবে।</p>
                    </div>
                `).join('')}
            </section>
            
            <!-- Professional Footer -->
            <footer class="newspaper-footer">
                <p><strong>${options.title}</strong> | www.dainiktni.news | © ${new Date().getFullYear()} | সম্পাদক: মুহাম্মদ রাসেল | প্রকাশক: বাংলা নিউজ টাইম লিমিটেড</p>
                <p style="font-size: 10px; margin-top: 4px;">প্রকাশনা ঠিকানা: ঢাকা, বাংলাদেশ | ফোন: +৮৮০-২-৫৫০৩৫৯৮৫ | ইমেইল: info@dainiktni.news</p>
            </footer>
        </div>
    </div>
</body>
</html>`;
  }

  // Get available templates
  getAvailableTemplates(): { id: string; name: string; description: string }[] {
    return [
      {
        id: 'traditional',
        name: 'Traditional Bengali',
        description: 'Classic Bengali newspaper layout with masthead and columns'
      },
      {
        id: 'modern',
        name: 'Modern Layout',
        description: 'Contemporary design with clean sections and visual hierarchy'
      },
      {
        id: 'compact',
        name: 'Compact Edition',
        description: 'Dense layout optimized for maximum content per page'
      }
    ];
  }
}

export const epaperService = new EpaperService();