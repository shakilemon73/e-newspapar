import { supabase } from './supabase';

export interface LaTeXEpaperOptions {
  title: string;
  date: string;
  articles: any[];
  categoryPriority?: string[];
  minArticles?: number;
  maxArticles?: number;
}

export interface LaTeXGenerationResult {
  success: boolean;
  epaper?: any;
  pdfUrl?: string;
  error?: string;
  aiMetrics?: {
    articlesConsidered: number;
    articlesSelected: number;
    diversityScore: number;
    categories: string[];
  };
  message?: string;
}

export interface LaTeXStatus {
  success: boolean;
  latex?: {
    installed: boolean;
    missing: string[];
  };
  recommendation?: string;
  error?: string;
}

/**
 * Generate e-paper using LaTeX with professional typography
 */
export async function generateLaTeXEpaper(options: LaTeXEpaperOptions): Promise<LaTeXGenerationResult> {
  try {
    const response = await fetch('/api/epaper/generate-latex', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('LaTeX e-paper generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'LaTeX generation failed'
    };
  }
}

/**
 * Generate AI-enhanced e-paper using LaTeX with intelligent article selection
 */
export async function generateAILaTeXEpaper(options: LaTeXEpaperOptions): Promise<LaTeXGenerationResult> {
  try {
    const response = await fetch('/api/epaper/generate-ai-latex', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('AI LaTeX e-paper generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI LaTeX generation failed'
    };
  }
}

/**
 * Check LaTeX installation status
 */
export async function checkLaTeXStatus(): Promise<LaTeXStatus> {
  try {
    const response = await fetch('/api/epaper/latex-status');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('LaTeX status check failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed'
    };
  }
}

/**
 * Install LaTeX dependencies (development only)
 */
export async function installLaTeX(): Promise<{ success: boolean; message: string; nextSteps?: string }> {
  try {
    const response = await fetch('/api/epaper/install-latex', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('LaTeX installation failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Installation failed'
    };
  }
}

/**
 * Fetch articles for e-paper generation with smart filtering
 */
export async function fetchArticlesForEpaper(options: {
  limit?: number;
  categories?: string[];
  dateRange?: { start: string; end: string };
  featured?: boolean;
}) {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.categories && options.categories.length > 0) {
      query = query.in('category', options.categories);
    }

    if (options.dateRange) {
      query = query
        .gte('published_at', options.dateRange.start)
        .lte('published_at', options.dateRange.end);
    }

    if (options.featured) {
      query = query.eq('featured', true);
    }

    const { data: articles, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    return {
      success: true,
      articles: articles || [],
      count: articles?.length || 0
    };
  } catch (error) {
    console.error('Failed to fetch articles for e-paper:', error);
    return {
      success: false,
      articles: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch articles'
    };
  }
}

/**
 * Get available categories for e-paper generation
 */
export async function getAvailableCategories() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return {
      success: true,
      categories: categories || []
    };
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return {
      success: false,
      categories: [],
      error: error instanceof Error ? error.message : 'Failed to fetch categories'
    };
  }
}

/**
 * Enhanced e-paper generation with multiple quality options
 */
export async function generateEnhancedEpaper(options: {
  title: string;
  date: string;
  generationType: 'standard' | 'ai-enhanced' | 'premium';
  categoryPriority?: string[];
  customization?: {
    layout: 'traditional' | 'modern' | 'magazine';
    columns: 2 | 3 | 4;
    colorScheme: 'default' | 'professional' | 'modern';
  };
}) {
  try {
    // Fetch articles based on generation type
    const articlesResult = await fetchArticlesForEpaper({
      limit: options.generationType === 'premium' ? 15 : 12,
      categories: options.categoryPriority,
      featured: options.generationType !== 'standard'
    });

    if (!articlesResult.success || articlesResult.articles.length === 0) {
      throw new Error('No articles available for e-paper generation');
    }

    // Choose generation method
    const generationOptions: LaTeXEpaperOptions = {
      title: options.title,
      date: options.date,
      articles: articlesResult.articles,
      categoryPriority: options.categoryPriority,
      minArticles: options.generationType === 'standard' ? 6 : 8,
      maxArticles: options.generationType === 'premium' ? 15 : 12
    };

    let result: LaTeXGenerationResult;

    if (options.generationType === 'ai-enhanced' || options.generationType === 'premium') {
      result = await generateAILaTeXEpaper(generationOptions);
    } else {
      result = await generateLaTeXEpaper(generationOptions);
    }

    return {
      ...result,
      generationType: options.generationType,
      articlesConsidered: articlesResult.count
    };
  } catch (error) {
    console.error('Enhanced e-paper generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Enhanced generation failed'
    };
  }
}

export default {
  generateLaTeXEpaper,
  generateAILaTeXEpaper,
  checkLaTeXStatus,
  installLaTeX,
  fetchArticlesForEpaper,
  getAvailableCategories,
  generateEnhancedEpaper
};