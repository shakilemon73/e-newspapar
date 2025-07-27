import express from 'express';
import LaTeXEpaperGenerator from './latex-epaper-generator.js';
import supabaseServiceRole from './supabase.js';

const router = express.Router();
const latexGenerator = new LaTeXEpaperGenerator();

/**
 * Generate e-paper using LaTeX - Advanced AI-powered layout
 */
router.post('/generate-latex', async (req, res) => {
  try {
    const { title, date, articles } = req.body;

    if (!title || !date || !articles || !Array.isArray(articles)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, date, and articles array'
      });
    }

    // Prepare e-paper data for LaTeX generation
    const epaperData = {
      title: title || 'বাংলা সংবাদপত্র',
      date: date,
      location: 'ঢাকা, বাংলাদেশ',
      slogan: 'সকল সংবাদ, সকল সময়',
      articles: articles.slice(0, 12) // Limit to 12 articles for optimal layout
    };

    console.log('Generating LaTeX e-paper with data:', { 
      title: epaperData.title, 
      articleCount: epaperData.articles.length 
    });

    // Generate e-paper using LaTeX
    const result = await latexGenerator.generateEpaper(epaperData);

    if (!result.success) {
      console.error('LaTeX generation failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'LaTeX compilation failed'
      });
    }

    // Save e-paper to database
    const epaperRecord = {
      title: epaperData.title,
      date: new Date(date).toISOString(),
      pdf_url: result.pdfPath,
      articles_count: epaperData.articles.length,
      generation_method: 'latex',
      created_at: new Date().toISOString()
    };

    const { data: savedEpaper, error: saveError } = await supabaseServiceRole
      .from('epapers')
      .insert([epaperRecord])
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save e-paper to database:', saveError);
      return res.status(500).json({
        success: false,
        error: 'Failed to save e-paper to database'
      });
    }

    console.log('LaTeX e-paper generated successfully:', savedEpaper.id);

    res.json({
      success: true,
      epaper: savedEpaper,
      pdfUrl: result.pdfPath,
      message: 'E-paper generated successfully using LaTeX'
    });

  } catch (error) {
    console.error('LaTeX e-paper generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during LaTeX generation'
    });
  }
});

/**
 * Check LaTeX installation status
 */
router.get('/latex-status', async (req, res) => {
  try {
    const status = await latexGenerator.checkLaTeXInstallation();
    
    res.json({
      success: true,
      latex: status,
      recommendation: status.installed 
        ? 'LaTeX is ready for professional newspaper generation' 
        : 'Install LaTeX for enhanced PDF quality and Bengali typography'
    });
  } catch (error) {
    console.error('LaTeX status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check LaTeX installation'
    });
  }
});

/**
 * Install LaTeX dependencies (development only)
 */
router.post('/install-latex', async (req, res) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'LaTeX installation not allowed in production'
      });
    }

    console.log('Installing LaTeX dependencies...');
    const result = await latexGenerator.installLaTeXDependencies();
    
    res.json({
      success: result.success,
      message: result.message,
      nextSteps: result.success 
        ? 'LaTeX installation completed. You can now generate professional Bengali newspapers.' 
        : 'LaTeX installation failed. Please install manually or contact system administrator.'
    });
  } catch (error) {
    console.error('LaTeX installation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to install LaTeX dependencies'
    });
  }
});

/**
 * Generate e-paper with AI-enhanced content selection
 */
router.post('/generate-ai-latex', async (req, res) => {
  try {
    const { title, date, categoryPriority = [], minArticles = 8, maxArticles = 12 } = req.body;

    // Fetch articles with AI-driven selection
    let query = supabaseServiceRole
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50); // Get more articles for AI selection

    const { data: allArticles, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`);
    }

    if (!allArticles || allArticles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No published articles found'
      });
    }

    // AI-powered article selection algorithm
    const selectedArticles = selectArticlesWithAI(allArticles, {
      categoryPriority,
      minArticles,
      maxArticles,
      diversityWeight: 0.7, // Ensure diverse content
      recencyWeight: 0.8,   // Prefer recent articles
      engagementWeight: 0.6 // Factor in view counts
    });

    // Generate e-paper with selected articles
    const epaperData = {
      title: title || 'বাংলা দৈনিক',
      date: date,
      location: 'ঢাকা, বাংলাদেশ',
      slogan: 'AI-চালিত সংবাদ নির্বাচন',
      articles: selectedArticles
    };

    const result = await latexGenerator.generateEpaper(epaperData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'AI-enhanced LaTeX generation failed'
      });
    }

    // Save with AI metadata
    const epaperRecord = {
      title: epaperData.title,
      date: new Date(date).toISOString(),
      pdf_url: result.pdfPath,
      articles_count: selectedArticles.length,
      generation_method: 'ai-latex',
      metadata: JSON.stringify({
        ai_selection: true,
        category_priority: categoryPriority,
        diversity_score: calculateDiversityScore(selectedArticles),
        generation_timestamp: new Date().toISOString()
      }),
      created_at: new Date().toISOString()
    };

    const { data: savedEpaper, error: saveError } = await supabaseServiceRole
      .from('epapers')
      .insert([epaperRecord])
      .select()
      .single();

    if (saveError) {
      throw new Error(`Failed to save AI e-paper: ${saveError.message}`);
    }

    res.json({
      success: true,
      epaper: savedEpaper,
      pdfUrl: result.pdfPath,
      aiMetrics: {
        articlesConsidered: allArticles.length,
        articlesSelected: selectedArticles.length,
        diversityScore: calculateDiversityScore(selectedArticles),
        categories: [...new Set(selectedArticles.map(a => a.category))],
      },
      message: 'AI-enhanced LaTeX e-paper generated successfully'
    });

  } catch (error) {
    console.error('AI LaTeX generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'AI LaTeX generation failed'
    });
  }
});

/**
 * AI-powered article selection algorithm
 */
function selectArticlesWithAI(articles: any[], options: {
  categoryPriority: string[];
  minArticles: number;
  maxArticles: number;
  diversityWeight: number;
  recencyWeight: number;
  engagementWeight: number;
}) {
  // Score each article based on multiple AI criteria
  const scoredArticles = articles.map(article => {
    let score = 0;
    
    // Recency score (newer articles score higher)
    const hoursSincePublished = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - (hoursSincePublished / 168)); // Decay over 1 week
    score += recencyScore * options.recencyWeight;
    
    // Category priority score
    const categoryIndex = options.categoryPriority.indexOf(article.category);
    if (categoryIndex !== -1) {
      score += (options.categoryPriority.length - categoryIndex) / options.categoryPriority.length;
    }
    
    // Engagement score (views, likes, etc.)
    const engagementScore = Math.min(1, (article.view_count || 0) / 1000); // Normalize to 0-1
    score += engagementScore * options.engagementWeight;
    
    // Content quality score (based on length, images, etc.)
    const contentScore = calculateContentQualityScore(article);
    score += contentScore * 0.5;
    
    return { ...article, aiScore: score };
  });

  // Sort by AI score
  scoredArticles.sort((a, b) => b.aiScore - a.aiScore);

  // Select diverse articles
  const selectedArticles = [];
  const usedCategories = new Set();
  
  // First pass: Select top articles ensuring category diversity
  for (const article of scoredArticles) {
    if (selectedArticles.length >= options.maxArticles) break;
    
    if (selectedArticles.length < options.minArticles || 
        !usedCategories.has(article.category) || 
        selectedArticles.length < 3) {
      selectedArticles.push(article);
      usedCategories.add(article.category);
    }
  }
  
  // Second pass: Fill remaining slots with highest scored articles
  for (const article of scoredArticles) {
    if (selectedArticles.length >= options.maxArticles) break;
    if (!selectedArticles.find(a => a.id === article.id)) {
      selectedArticles.push(article);
    }
  }

  return selectedArticles.slice(0, options.maxArticles);
}

/**
 * Calculate content quality score for an article
 */
function calculateContentQualityScore(article: any): number {
  let score = 0;
  
  // Length score (optimal range 500-2000 characters)
  const contentLength = (article.content || '').length;
  if (contentLength >= 500 && contentLength <= 2000) {
    score += 0.3;
  } else if (contentLength > 200) {
    score += 0.1;
  }
  
  // Has image
  if (article.image_url) {
    score += 0.3;
  }
  
  // Has excerpt/summary
  if (article.excerpt && article.excerpt.length > 50) {
    score += 0.2;
  }
  
  // Author specified
  if (article.author) {
    score += 0.1;
  }
  
  // Category specified
  if (article.category) {
    score += 0.1;
  }
  
  return Math.min(1, score);
}

/**
 * Calculate diversity score for selected articles
 */
function calculateDiversityScore(articles: any[]): number {
  const categories = new Set(articles.map(a => a.category));
  const authors = new Set(articles.map(a => a.author).filter(Boolean));
  const categoriesArray = Array.from(categories);
  const authorsArray = Array.from(authors);
  
  // Diversity based on categories and authors
  const categoryDiversity = categoriesArray.length / articles.length;
  const authorDiversity = authorsArray.length / articles.length;
  
  return Math.round((categoryDiversity + authorDiversity) * 50) / 100;
}

export default router;