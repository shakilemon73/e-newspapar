/**
 * E-Paper Admin API - Direct Supabase Integration
 * Manages e-paper generation, publishing, and article selection using service role key
 */

// Admin Supabase client with service role key
let adminSupabase: any;

async function getAdminSupabase() {
  if (!adminSupabase) {
    const { default: client } = await import('./admin-supabase-direct');
    adminSupabase = client;
  }
  return adminSupabase;
}

export interface EPaperData {
  id?: number;
  title: string;
  publish_date: string;
  image_url: string;
  pdf_url: string;
  is_latest: boolean;
  is_published: boolean;
  article_count?: number;
  pages?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleForEPaper {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image_url?: string;
  category: string;
  view_count: number;
  published_at: string;
  author?: string;
}

export interface EPaperGenerationOptions {
  title: string;
  date: string;
  layout: 'traditional' | 'modern' | 'magazine';
  includeCategories: string[];
  excludeCategories: string[];
  maxArticles: number;
  includeBreakingNews: boolean;
  includeWeather: boolean;
  customLayout?: {
    columns: 2 | 3 | 4;
    headerStyle: 'classic' | 'modern';
    colorScheme: 'default' | 'professional' | 'vibrant';
  };
}

/**
 * Get all e-papers for admin management
 */
export async function getAdminEPapers() {
  try {
    const supabase = await getAdminSupabase();
    
    const { data, error } = await supabase
      .from('epapers')
      .select(`
        *,
        article_count:epapers_articles(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      epapers: data || [],
      totalCount: data?.length || 0
    };
  } catch (error) {
    console.error('Error fetching admin e-papers:', error);
    return {
      success: false,
      epapers: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch e-papers'
    };
  }
}

/**
 * Get articles from Supabase for e-paper generation
 */
export async function getArticlesForEPaper(options: {
  limit: number;
  categories?: string[];
  excludeCategories?: string[];
  includeBreaking?: boolean;
  dateRange?: { start: string; end: string };
}): Promise<{ success: boolean; articles: ArticleForEPaper[]; error?: string }> {
  try {
    const supabase = await getAdminSupabase();
    
    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        content,
        image_url,
        view_count,
        published_at,
        author,
        categories!inner(name)
      `)
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .order('published_at', { ascending: false });

    // Apply category filters
    if (options.categories && options.categories.length > 0) {
      query = query.in('categories.name', options.categories);
    }

    // Apply date range filter
    if (options.dateRange) {
      query = query
        .gte('published_at', options.dateRange.start)
        .lte('published_at', options.dateRange.end);
    }

    query = query.limit(options.limit);

    const { data, error } = await query;

    if (error) throw error;

    // Transform data for e-paper use
    const articles: ArticleForEPaper[] = (data || []).map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || article.content?.substring(0, 200) + '...',
      content: article.content,
      image_url: article.image_url,
      category: article.categories?.name || 'সাধারণ',
      view_count: article.view_count || 0,
      published_at: article.published_at,
      author: article.author
    }));

    return {
      success: true,
      articles
    };
  } catch (error) {
    console.error('Error fetching articles for e-paper:', error);
    return {
      success: false,
      articles: [],
      error: error instanceof Error ? error.message : 'Failed to fetch articles'
    };
  }
}

/**
 * Get breaking news for e-paper
 */
export async function getBreakingNewsForEPaper() {
  try {
    const supabase = await getAdminSupabase();
    
    const { data, error } = await supabase
      .from('breaking_news')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;
    return { success: true, breakingNews: data || [] };
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return { success: false, breakingNews: [] };
  }
}

/**
 * Get weather data for e-paper
 */
export async function getWeatherForEPaper() {
  try {
    const supabase = await getAdminSupabase();
    
    const { data, error } = await supabase
      .from('weather')
      .select('*')
      .in('city', ['ঢাকা', 'চট্টগ্রাম', 'খুলনা', 'রাজশাহী'])
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { success: true, weather: data || [] };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return { success: false, weather: [] };
  }
}

/**
 * Create new e-paper record
 */
export async function createEPaper(epaperData: {
  title: string;
  publish_date: string;
  image_url?: string;
  pdf_url?: string;
  is_latest?: boolean;
  is_published?: boolean;
}) {
  try {
    const supabase = await getAdminSupabase();

    // If this is set as latest, unset other latest e-papers
    if (epaperData.is_latest) {
      await supabase
        .from('epapers')
        .update({ is_latest: false })
        .eq('is_latest', true);
    }

    const { data, error } = await supabase
      .from('epapers')
      .insert({
        title: epaperData.title,
        publish_date: epaperData.publish_date,
        image_url: epaperData.image_url || '',
        pdf_url: epaperData.pdf_url || '',
        is_latest: epaperData.is_latest || false,
        is_published: epaperData.is_published !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, epaper: data };
  } catch (error) {
    console.error('Error creating e-paper:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create e-paper'
    };
  }
}

/**
 * Update e-paper
 */
export async function updateEPaper(id: number, updates: Partial<EPaperData>) {
  try {
    const supabase = await getAdminSupabase();

    // If this is set as latest, unset other latest e-papers
    if (updates.is_latest) {
      await supabase
        .from('epapers')
        .update({ is_latest: false })
        .eq('is_latest', true)
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('epapers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, epaper: data };
  } catch (error) {
    console.error('Error updating e-paper:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update e-paper'
    };
  }
}

/**
 * Delete e-paper
 */
export async function deleteEPaper(id: number) {
  try {
    const supabase = await getAdminSupabase();

    const { error } = await supabase
      .from('epapers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting e-paper:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete e-paper'
    };
  }
}

/**
 * Set e-paper as latest (for public display)
 */
export async function setLatestEPaper(id: number) {
  try {
    const supabase = await getAdminSupabase();

    // Unset all current latest e-papers
    await supabase
      .from('epapers')
      .update({ is_latest: false })
      .eq('is_latest', true);

    // Set the selected e-paper as latest
    const { data, error } = await supabase
      .from('epapers')
      .update({ is_latest: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, epaper: data };
  } catch (error) {
    console.error('Error setting latest e-paper:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set as latest'
    };
  }
}

/**
 * Toggle e-paper publish status
 */
export async function toggleEPaperPublishStatus(id: number, isPublished: boolean) {
  try {
    const supabase = await getAdminSupabase();

    const { data, error } = await supabase
      .from('epapers')
      .update({ 
        is_published: isPublished,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, epaper: data };
  } catch (error) {
    console.error('Error toggling publish status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle publish status'
    };
  }
}

/**
 * Generate e-paper from articles automatically
 */
export async function generateEPaperFromArticles(options: EPaperGenerationOptions) {
  try {
    console.log('🚀 Starting automatic e-paper generation from Supabase articles...');

    // Get articles based on options
    const articlesResult = await getArticlesForEPaper({
      limit: options.maxArticles,
      categories: options.includeCategories,
      excludeCategories: options.excludeCategories,
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
        end: new Date().toISOString()
      }
    });

    if (!articlesResult.success || articlesResult.articles.length === 0) {
      throw new Error('No suitable articles found for e-paper generation');
    }

    // Get additional content if requested
    const additionalContent: any = {};
    
    if (options.includeBreakingNews) {
      const breakingResult = await getBreakingNewsForEPaper();
      additionalContent.breakingNews = breakingResult.breakingNews;
    }

    if (options.includeWeather) {
      const weatherResult = await getWeatherForEPaper();
      additionalContent.weather = weatherResult.weather;
    }

    // Here you would integrate with your LaTeX or PDF generation system
    // For now, we'll create a mock PDF URL
    const pdfUrl = await generatePDFFromContent({
      title: options.title,
      date: options.date,
      articles: articlesResult.articles,
      layout: options.layout,
      additionalContent
    });

    // Create e-paper record in database
    const epaperResult = await createEPaper({
      title: options.title,
      publish_date: options.date,
      pdf_url: pdfUrl,
      image_url: '', // Generate thumbnail if needed
      is_latest: true,
      is_published: true
    });

    if (!epaperResult.success) {
      throw new Error(epaperResult.error || 'Failed to save e-paper record');
    }

    return {
      success: true,
      epaper: epaperResult.epaper,
      articleCount: articlesResult.articles.length,
      pdfUrl
    };

  } catch (error) {
    console.error('Error generating e-paper from articles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate e-paper'
    };
  }
}

/**
 * Mock PDF generation (replace with your actual PDF generation logic)
 */
async function generatePDFFromContent(data: {
  title: string;
  date: string;
  articles: ArticleForEPaper[];
  layout: string;
  additionalContent: any;
}): Promise<string> {
  // This is where you would integrate with your LaTeX system
  // For now, return a mock URL
  const timestamp = new Date().getTime();
  return `/generated-epapers/epaper-${timestamp}.pdf`;
}