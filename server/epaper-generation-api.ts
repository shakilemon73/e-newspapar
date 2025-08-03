// E-Paper Generation API Routes
import { Router } from 'express';
import { epaperGenerator } from './epaper-generator-system';
import { adminSupabase } from './supabase.js';

const router = Router();

interface EPaperGenerationOptions {
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

// Get available templates
router.get('/templates', async (req, res) => {
  try {
    const templates = epaperGenerator.getAvailableTemplates();
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate e-paper
router.post('/generate', async (req, res) => {
  try {
    const options: EPaperGenerationOptions = req.body;

    // Validate required fields
    if (!options.title || !options.date || !options.layout) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, date, and layout'
      });
    }

    console.log('🚀 Starting e-paper generation:', options);

    const result = await epaperGenerator.generateEPaper(options);

    if (result.success) {
      res.json({
        success: true,
        message: 'E-paper generated successfully',
        data: {
          pdfUrl: result.pdfUrl,
          title: result.title,
          date: result.date,
          articleCount: result.articleCount
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Generation failed',
        data: {
          title: result.title,
          date: result.date,
          articleCount: result.articleCount
        }
      });
    }

  } catch (error) {
    console.error('❌ E-paper generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during generation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get articles preview for e-paper
router.post('/preview-articles', async (req, res) => {
  try {
    const options: EPaperGenerationOptions = req.body;
    console.log('🔐 Fetching preview articles using admin Supabase client');

    // Fetch actual articles from database using admin client
    let query = adminSupabase
      .from('articles')
      .select('id, title, category_name, author, publish_date, content')
      .eq('is_published', true)
      .order('priority', { ascending: false })
      .order('publish_date', { ascending: false })
      .limit(options.maxArticles || 10);

    // Filter by categories if specified
    if (options.includeCategories && options.includeCategories.length > 0) {
      query = query.in('category_name', options.includeCategories);
    }

    if (options.excludeCategories && options.excludeCategories.length > 0) {
      for (const category of options.excludeCategories) {
        query = query.neq('category_name', category);
      }
    }

    // Date range filter (last 7 days)
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 7);
    query = query.gte('publish_date', dateThreshold.toISOString());

    const { data: articles, error } = await query;

    if (error) {
      console.error('Error fetching preview articles:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch preview articles from database',
        error: error.message
      });
    }

    // Format articles for preview display
    const formattedArticles = (articles || []).map(article => ({
      id: article.id,
      title: article.title,
      category: article.category_name,
      author: article.author,
      publish_date: article.publish_date,
      content: article.content?.substring(0, 200) + '...' // Truncate for preview
    }));

    res.json({
      success: true,
      articles: formattedArticles,
      totalCount: formattedArticles.length
    });

  } catch (error) {
    console.error('Error fetching preview articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preview articles',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available categories
router.get('/categories', async (req, res) => {
  try {
    console.log('🔐 Fetching categories using admin Supabase client');
    
    // Fetch actual categories from database using admin client
    const { data: categories, error } = await adminSupabase
      .from('categories')
      .select('name')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching categories from database:', error);
      // Fallback to hardcoded categories if database fails
      const fallbackCategories = [
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
      
      return res.json({
        success: true,
        categories: fallbackCategories
      });
    }

    const categoryNames = categories?.map(cat => cat.name) || [];

    res.json({
      success: true,
      categories: categoryNames
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;