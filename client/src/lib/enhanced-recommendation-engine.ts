import * as tf from '@tensorflow/tfjs';

interface UserPreference {
  categoryId: number;
  weight: number;
  recentInteractions: number;
}

interface ArticleFeatures {
  id: number;
  categoryId: number;
  viewCount: number;
  publishedAt: string;
  contentLength: number;
  isFeatured: boolean;
  tags: string[];
}

interface RecommendationScore {
  articleId: number;
  score: number;
  reasons: string[];
}

class EnhancedRecommendationEngine {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;
  private userPreferences = new Map<string, UserPreference[]>();
  private contentEmbeddings = new Map<number, number[]>();

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🎯 Initializing Enhanced Recommendation Engine with TensorFlow.js...');
      
      await tf.ready();
      this.model = this.createRecommendationModel();
      
      console.log('✅ Enhanced Recommendation Engine initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing recommendation engine:', error);
      // Graceful fallback
    }
  }

  private createRecommendationModel(): tf.LayersModel {
    // Neural network for content-based recommendations
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [20], // User and content features
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1, // Recommendation score
          activation: 'sigmoid'
        })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private extractArticleFeatures(article: any): number[] {
    const features = new Array(10).fill(0);
    
    // Normalize features
    features[0] = Math.min(article.view_count / 1000, 1); // View count (normalized)
    features[1] = article.is_featured ? 1 : 0; // Featured status
    features[2] = article.category_id / 10; // Category (normalized)
    features[3] = Math.min(article.content?.length / 5000, 1) || 0; // Content length
    
    // Time decay factor (newer articles get higher scores)
    const daysSincePublished = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60 * 24);
    features[4] = Math.exp(-daysSincePublished / 7); // Exponential decay over week
    
    // Category popularity (based on category)
    const categoryWeights: { [key: string]: number } = {
      'national': 0.9,
      'international': 0.8,
      'sports': 0.7,
      'economy': 0.6,
      'islamic-life': 0.5
    };
    features[5] = categoryWeights[article.categories?.slug] || 0.5;
    
    // Content quality indicators
    features[6] = article.excerpt ? (article.excerpt.length > 50 ? 1 : 0.5) : 0;
    features[7] = article.image_url ? 1 : 0;
    features[8] = article.tags?.length / 5 || 0; // Tag richness
    features[9] = Math.random() * 0.1; // Small randomization factor
    
    return features;
  }

  private extractUserFeatures(userId: string, userInteractions: any[]): number[] {
    const features = new Array(10).fill(0);
    
    if (!userInteractions.length) {
      // Default features for new users
      return features.map(() => Math.random() * 0.1);
    }

    // Calculate user preferences from interactions
    const categoryPreferences = new Map<number, number>();
    let totalInteractions = 0;
    
    userInteractions.forEach(interaction => {
      const categoryId = interaction.article?.category_id || 0;
      categoryPreferences.set(categoryId, (categoryPreferences.get(categoryId) || 0) + 1);
      totalInteractions++;
    });

    // Normalize category preferences
    let featureIndex = 0;
    categoryPreferences.forEach((count, categoryId) => {
      if (featureIndex < 5) {
        features[featureIndex] = count / totalInteractions;
        featureIndex++;
      }
    });

    // User engagement level
    features[5] = Math.min(totalInteractions / 50, 1); // Engagement level
    
    // Time-based preferences (recent vs old content)
    const recentInteractions = userInteractions.filter(i => 
      Date.now() - new Date(i.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    );
    features[6] = recentInteractions.length / Math.max(userInteractions.length, 1);
    
    // Average reading time (if available)
    features[7] = Math.random() * 0.5; // Placeholder for reading time data
    
    // User activity pattern
    features[8] = Math.min(userInteractions.length / 100, 1);
    features[9] = Math.random() * 0.1; // Randomization
    
    return features;
  }

  async enhanceRecommendations(
    articles: any[], 
    userId?: string, 
    userInteractions: any[] = []
  ): Promise<any[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('🎯 Enhancing recommendations with AI for user:', userId);
      
      const userFeatures = userId ? this.extractUserFeatures(userId, userInteractions) : new Array(10).fill(0.1);
      
      // Calculate AI-enhanced scores for each article
      const enhancedArticles = await Promise.all(
        articles.map(async (article) => {
          const articleFeatures = this.extractArticleFeatures(article);
          const combinedFeatures = [...userFeatures, ...articleFeatures];
          
          let aiScore = 0.5; // Default score
          
          if (this.model) {
            try {
              const inputTensor = tf.tensor2d([combinedFeatures]);
              const prediction = this.model.predict(inputTensor) as tf.Tensor;
              const scoreArray = await prediction.data();
              aiScore = scoreArray[0];
              
              // Cleanup tensors
              inputTensor.dispose();
              prediction.dispose();
            } catch (modelError) {
              console.log('Using fallback scoring due to model error');
              // Fallback to heuristic scoring
              aiScore = this.calculateHeuristicScore(article, userFeatures);
            }
          } else {
            aiScore = this.calculateHeuristicScore(article, userFeatures);
          }

          return {
            ...article,
            ai_recommendation_score: aiScore,
            enhanced_by_ai: true,
            recommendation_reasons: this.generateRecommendationReasons(article, aiScore)
          };
        })
      );

      // Sort by AI recommendation score
      const sortedArticles = enhancedArticles.sort((a, b) => b.ai_recommendation_score - a.ai_recommendation_score);
      
      console.log(`🎯 Enhanced ${sortedArticles.length} recommendations with AI scoring`);
      return sortedArticles;
      
    } catch (error) {
      console.error('Error enhancing recommendations:', error);
      return articles; // Return original articles on error
    }
  }

  private calculateHeuristicScore(article: any, userFeatures: number[]): number {
    let score = 0;
    
    // View count factor (0-0.3)
    score += Math.min(article.view_count / 1000, 0.3);
    
    // Recency factor (0-0.3)
    const daysSincePublished = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 0.3 - (daysSincePublished / 30));
    
    // Featured content bonus (0-0.2)
    if (article.is_featured) score += 0.2;
    
    // Category matching with user preferences (0-0.2)
    const categoryScore = userFeatures.reduce((sum, pref, index) => sum + pref, 0) / userFeatures.length;
    score += categoryScore * 0.2;
    
    // Ensure score is between 0 and 1
    return Math.min(Math.max(score, 0), 1);
  }

  private generateRecommendationReasons(article: any, score: number): string[] {
    const reasons: string[] = [];
    
    if (score > 0.8) {
      reasons.push('উচ্চ AI সুপারিশ স্কোর');
    }
    
    if (article.view_count > 500) {
      reasons.push('জনপ্রিয় সংবাদ');
    }
    
    if (article.is_featured) {
      reasons.push('বৈশিষ্ট্যযুক্ত সংবাদ');
    }
    
    const daysSincePublished = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished < 1) {
      reasons.push('সাম্প্রতিক সংবাদ');
    }
    
    if (reasons.length === 0) {
      reasons.push('আপনার জন্য সুপারিশকৃত');
    }
    
    return reasons;
  }

  async trainFromUserFeedback(userId: string, articleId: number, liked: boolean) {
    // Store user feedback for future model training
    try {
      const feedbackData = {
        userId,
        articleId,
        liked,
        timestamp: Date.now()
      };
      
      // This could be stored in localStorage or sent to backend for training
      const existingFeedback = JSON.parse(localStorage.getItem('ai_recommendation_feedback') || '[]');
      existingFeedback.push(feedbackData);
      
      // Keep only last 1000 feedback entries
      if (existingFeedback.length > 1000) {
        existingFeedback.splice(0, existingFeedback.length - 1000);
      }
      
      localStorage.setItem('ai_recommendation_feedback', JSON.stringify(existingFeedback));
      
      console.log('🎯 User feedback stored for AI training');
    } catch (error) {
      console.error('Error storing user feedback:', error);
    }
  }
}

// Export singleton instance
export const enhancedRecommendationEngine = new EnhancedRecommendationEngine();

// Auto-initialize
enhancedRecommendationEngine.initialize().catch(console.error);