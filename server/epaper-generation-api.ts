// E-Paper Generation API Routes
import { Router } from 'express';
import { epaperGenerator } from './epaper-generator-system';

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

    // This is a simplified preview - in production you'd fetch actual articles
    const mockArticles = [
      {
        id: 1,
        title: 'আজকের প্রধান সংবাদ',
        category: 'জাতীয়',
        author: 'সংবাদদাতা',
        publish_date: new Date().toISOString(),
        content: 'এটি একটি নমুনা সংবাদ যা ই-পেপারে প্রদর্শিত হবে...'
      },
      {
        id: 2,
        title: 'আন্তর্জাতিক সংবাদ',
        category: 'আন্তর্জাতিক',
        author: 'বিশেষ প্রতিনিধি',
        publish_date: new Date().toISOString(),
        content: 'বিশ্বের গুরুত্বপূর্ণ ঘটনার আপডেট...'
      }
    ];

    res.json({
      success: true,
      articles: mockArticles,
      totalCount: mockArticles.length
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
    // This would fetch from your actual categories table
    const categories = [
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

    res.json({
      success: true,
      categories
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