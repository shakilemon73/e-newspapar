import { Router } from 'express';
import { bengaliAIService } from './ai-services';
import { supabase } from './supabase';

const router = Router();

/**
 * AI Routes for Bengali News Website
 * All AI processing handled on backend with Supabase integration
 */

// Process single article with AI - Available to all users
router.post('/ai/process-article/:id', async (req, res) => {
  console.log('[AI Processing] AI processing request from:', req.ip);
  try {
    const articleId = parseInt(req.params.id);
    
    // Get article content
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, content')
      .eq('id', articleId)
      .single();

    if (error || !article) {
      return res.status(404).json({ 
        success: false, 
        error: 'Article not found' 
      });
    }

    // Process with AI
    const result = await bengaliAIService.processArticleAI(
      article.id, 
      article.content, 
      article.title
    );

    res.json(result);

  } catch (error) {
    console.error('[AI Routes] Process article error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'AI processing failed' 
    });
  }
});

// Batch process articles with AI - Available to all users  
router.post('/ai/batch-process', async (req, res) => {
  console.log('[AI Processing] Batch processing request from:', req.ip);
  try {
    const { limit = 10 } = req.body;
    
    const result = await bengaliAIService.batchProcessArticles(limit);
    res.json(result);

  } catch (error) {
    console.error('[AI Routes] Batch process error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Batch processing failed' 
    });
  }
});

// Get AI analysis for article
router.get('/ai/analysis/:id', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    
    const result = await bengaliAIService.getArticleAIAnalysis(articleId);
    res.json(result);

  } catch (error) {
    console.error('[AI Routes] Get analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get AI analysis' 
    });
  }
});

// Generate article summary
router.post('/ai/summarize', async (req, res) => {
  try {
    const { text, articleId } = req.body;

    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Text is required' 
      });
    }

    // Use AI service to generate summary
    const analysis = await (bengaliAIService as any).generateArticleAnalysis(text, '');
    
    // If articleId provided, update the article
    if (articleId && analysis.summary) {
      await supabase
        .from('articles')
        .update({ 
          summary: analysis.summary,
          ai_processed: true 
        })
        .eq('id', articleId);
    }

    res.json({ 
      success: true, 
      data: { 
        summary: analysis.summary,
        readingTime: analysis.readingTime,
        complexity: analysis.complexity
      } 
    });

  } catch (error) {
    console.error('[AI Routes] Summarize error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Summarization failed' 
    });
  }
});

// Analyze sentiment
router.post('/ai/sentiment', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Text is required' 
      });
    }

    const sentiment = await (bengaliAIService as any).analyzeSentiment(text);

    res.json({ 
      success: true, 
      data: sentiment 
    });

  } catch (error) {
    console.error('[AI Routes] Sentiment analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Sentiment analysis failed' 
    });
  }
});

// Generate tags for content
router.post('/ai/generate-tags', async (req, res) => {
  try {
    const { content, title } = req.body;

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }

    const tags = await (bengaliAIService as any).generateTags(content, title || '');

    res.json({ 
      success: true, 
      data: { tags } 
    });

  } catch (error) {
    console.error('[AI Routes] Tag generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Tag generation failed' 
    });
  }
});

// Get AI statistics
router.get('/ai/stats', async (req, res) => {
  try {
    // Get processing statistics
    const { data: processedCount } = await supabase
      .from('articles')
      .select('id', { count: 'exact' })
      .eq('ai_processed', true);

    const { data: totalCount } = await supabase
      .from('articles')
      .select('id', { count: 'exact' });

    const { data: recentAnalysis } = await supabase
      .from('article_ai_analysis')
      .select('processed_at')
      .order('processed_at', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalArticles: totalCount?.length || 0,
        processedArticles: processedCount?.length || 0,
        processingRate: totalCount?.length ? 
          Math.round((processedCount?.length || 0) / totalCount.length * 100) : 0,
        recentProcessing: recentAnalysis?.map(a => a.processed_at) || []
      }
    });

  } catch (error) {
    console.error('[AI Routes] Stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get AI statistics' 
    });
  }
});

export { router as aiRoutes };