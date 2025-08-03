import * as tf from '@tensorflow/tfjs';

interface SearchEmbedding {
  query: string;
  embedding: number[];
  timestamp: number;
}

interface ArticleEmbedding {
  id: number;
  title: string;
  embedding: number[];
  content_preview: string;
}

class TensorFlowSearchEngine {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;
  private searchCache = new Map<string, SearchEmbedding>();
  private articleEmbeddings: ArticleEmbedding[] = [];

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🧠 Initializing TensorFlow.js search engine...');
      
      // Initialize TensorFlow.js backend
      await tf.ready();
      
      // Create a simple embedding model for Bengali/English text
      this.model = this.createTextEmbeddingModel();
      
      console.log('✅ TensorFlow.js search engine initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing TensorFlow search:', error);
      // Graceful fallback - don't throw error
    }
  }

  private createTextEmbeddingModel(): tf.LayersModel {
    // Create a simple neural network for text embeddings
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [100], // Input text features
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 16, // Output embedding dimension
          activation: 'tanh'
        })
      ]
    });

    // Compile the model
    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });

    return model;
  }

  private textToVector(text: string): number[] {
    // Convert text to numerical features for Bengali/English
    const words = text.toLowerCase().split(/\s+/);
    const vector = new Array(100).fill(0);
    
    // Simple character-based encoding for Bengali and English
    for (let i = 0; i < Math.min(words.length, 20); i++) {
      const word = words[i];
      for (let j = 0; j < Math.min(word.length, 5); j++) {
        const charCode = word.charCodeAt(j);
        const index = (i * 5 + j) % 100;
        vector[index] = (charCode % 1000) / 1000; // Normalize
      }
    }
    
    return vector;
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    if (!this.isInitialized || !this.model) {
      // Fallback to simple vector if TensorFlow not available
      return this.textToVector(text);
    }

    try {
      const inputVector = this.textToVector(text);
      const inputTensor = tf.tensor2d([inputVector]);
      
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const embedding = await prediction.data();
      
      // Cleanup tensors
      inputTensor.dispose();
      prediction.dispose();
      
      return Array.from(embedding);
    } catch (error) {
      console.error('Error generating embedding:', error);
      return this.textToVector(text); // Fallback
    }
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  async enhanceSearchResults(query: string, articles: any[]): Promise<any[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('🧠 Enhancing search results with TensorFlow.js...');
      
      // Get query embedding
      const queryEmbedding = await this.getTextEmbedding(query);
      
      // Calculate semantic similarity for each article
      const enhancedResults = await Promise.all(
        articles.map(async (article) => {
          const articleText = `${article.title} ${article.excerpt || ''} ${article.content?.substring(0, 200) || ''}`;
          const articleEmbedding = await this.getTextEmbedding(articleText);
          
          const semanticScore = this.cosineSimilarity(queryEmbedding, articleEmbedding);
          
          return {
            ...article,
            ai_relevance_score: semanticScore,
            search_enhanced: true
          };
        })
      );

      // Sort by AI relevance score
      const sortedResults = enhancedResults.sort((a, b) => b.ai_relevance_score - a.ai_relevance_score);
      
      console.log(`🧠 Enhanced ${sortedResults.length} results with AI relevance scores`);
      return sortedResults;
      
    } catch (error) {
      console.error('Error enhancing search results:', error);
      return articles; // Return original results on error
    }
  }

  async cacheSearchQuery(query: string) {
    try {
      const embedding = await this.getTextEmbedding(query);
      this.searchCache.set(query, {
        query,
        embedding,
        timestamp: Date.now()
      });

      // Limit cache size
      if (this.searchCache.size > 100) {
        const oldestKey = Array.from(this.searchCache.keys())[0];
        this.searchCache.delete(oldestKey);
      }
    } catch (error) {
      console.error('Error caching search query:', error);
    }
  }

  getSimilarQueries(query: string, limit = 5): string[] {
    if (this.searchCache.size === 0) return [];

    try {
      const queryVector = this.textToVector(query);
      const similarities = Array.from(this.searchCache.entries())
        .map(([cachedQuery, data]) => ({
          query: cachedQuery,
          similarity: this.cosineSimilarity(queryVector, data.embedding)
        }))
        .filter(item => item.query !== query)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return similarities.map(item => item.query);
    } catch (error) {
      console.error('Error finding similar queries:', error);
      return [];
    }
  }
}

// Export singleton instance
export const tensorFlowSearch = new TensorFlowSearchEngine();

// Auto-initialize on import
tensorFlowSearch.initialize().catch(console.error);