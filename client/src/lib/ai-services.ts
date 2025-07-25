import { supabase } from './supabase';

// ==========================================
// FREE OPEN SOURCE AI SERVICES INTEGRATION
// ==========================================

export interface AIServiceConfig {
  huggingFaceKey?: string; // Optional, has free tier
  ollamaUrl?: string;      // Local deployment
  openRouterKey?: string;  // Free tier available
}

class AIServices {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      ollamaUrl: config.ollamaUrl || 'http://localhost:11434',
      ...config
    };
  }

  // ==========================================
  // 1. HUGGING FACE INTEGRATION (FREE)
  // ==========================================
  
  async summarizeArticle(text: string, language: 'bengali' | 'english' = 'bengali'): Promise<string> {
    try {
      // Using Hugging Face Inference API (free tier)
      const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
        headers: {
          'Authorization': `Bearer ${this.config.huggingFaceKey || 'hf_free'}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: text.slice(0, 1000), // Free tier limits
          parameters: {
            max_length: 100,
            min_length: 30,
            do_sample: false
          }
        }),
      });
      
      const result = await response.json();
      return result[0]?.summary_text || 'Summary not available';
    } catch (error) {
      console.error('Hugging Face summarization error:', error);
      return this.fallbackSummary(text);
    }
  }

  // ==========================================
  // 2. OLLAMA LOCAL AI (100% FREE)
  // ==========================================
  
  async generateWithOllama(prompt: string, model: string = 'qwen2.5:7b'): Promise<string> {
    try {
      const response = await fetch(`${this.config.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Ollama not available - install with: curl -fsSL https://ollama.com/install.sh | sh');
      }
      
      const result = await response.json();
      return result.response;
    } catch (error) {
      console.error('Ollama error:', error);
      return 'AI service temporarily unavailable';
    }
  }

  // ==========================================
  // 3. BENGALI CONTENT ENHANCEMENT
  // ==========================================
  
  async enhanceBengaliContent(text: string): Promise<{
    summary: string;
    tags: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    readingTime: number;
  }> {
    const summary = await this.summarizeArticle(text, 'bengali');
    
    // Generate tags using local AI
    const tagsPrompt = `Extract 5 relevant Bengali tags for this article:\n\n${text.slice(0, 500)}\n\nTags (comma-separated):`;
    const tagsResponse = await this.generateWithOllama(tagsPrompt);
    const tags = tagsResponse.split(',').map(tag => tag.trim()).slice(0, 5);
    
    // Calculate reading time (Bengali words per minute: ~180)
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 180);
    
    // Simple sentiment analysis
    const sentiment = this.analyzeSentiment(text);
    
    return { summary, tags, sentiment, readingTime };
  }

  // ==========================================
  // 4. SMART SEARCH ENHANCEMENT
  // ==========================================
  
  async enhanceSearch(query: string): Promise<{
    expandedQuery: string;
    suggestions: string[];
    filters: string[];
  }> {
    const prompt = `
    User searched for: "${query}"
    
    Generate:
    1. Expanded search query (Bengali/English)
    2. 3 related search suggestions
    3. Relevant category filters
    
    Format as JSON:
    `;
    
    try {
      const response = await this.generateWithOllama(prompt);
      return JSON.parse(response);
    } catch {
      return {
        expandedQuery: query,
        suggestions: [],
        filters: []
      };
    }
  }

  // ==========================================
  // 5. COMMENT MODERATION
  // ==========================================
  
  async moderateComment(comment: string): Promise<{
    isAppropriate: boolean;
    reason?: string;
    suggestion?: string;
  }> {
    const prompt = `
    Moderate this Bengali comment for appropriateness:
    "${comment}"
    
    Check for: hate speech, spam, inappropriate content
    Respond with JSON: {"appropriate": true/false, "reason": "...", "suggestion": "..."}
    `;
    
    try {
      const response = await this.generateWithOllama(prompt);
      const result = JSON.parse(response);
      return {
        isAppropriate: result.appropriate,
        reason: result.reason,
        suggestion: result.suggestion
      };
    } catch {
      return { isAppropriate: true }; // Default to allowing if AI fails
    }
  }

  // ==========================================
  // 6. CONTENT RECOMMENDATIONS
  // ==========================================
  
  async generateRecommendations(userHistory: string[], currentArticle: string): Promise<string[]> {
    const prompt = `
    Based on user's reading history: ${userHistory.slice(0, 5).join(', ')}
    Current article: ${currentArticle.slice(0, 200)}
    
    Suggest 5 related Bengali news topics they might like:
    `;
    
    try {
      const response = await this.generateWithOllama(prompt);
      return response.split('\n').filter(line => line.trim()).slice(0, 5);
    } catch {
      return [];
    }
  }

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  
  private fallbackSummary(text: string): string {
    // Simple extractive summary fallback
    const sentences = text.split(/[।.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 2).join('। ') + '।';
  }
  
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    // Simple keyword-based sentiment (replace with AI when needed)
    const positiveWords = ['ভালো', 'উন্নতি', 'সফল', 'জয়', 'খুশি'];
    const negativeWords = ['খারাপ', 'সমস্যা', 'ক্ষতি', 'বিপদ', 'দুঃখ'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // ==========================================
  // 7. ARTICLE QUALITY CHECKER
  // ==========================================
  
  async checkArticleQuality(article: {
    title: string;
    content: string;
    category: string;
  }): Promise<{
    score: number;
    suggestions: string[];
    missingElements: string[];
  }> {
    const prompt = `
    Check this Bengali news article quality:
    
    Title: ${article.title}
    Category: ${article.category}
    Content: ${article.content.slice(0, 500)}...
    
    Rate quality (1-10) and suggest improvements.
    Format as JSON.
    `;
    
    try {
      const response = await this.generateWithOllama(prompt);
      return JSON.parse(response);
    } catch {
      return {
        score: 7,
        suggestions: ['Add more details', 'Include relevant images'],
        missingElements: []
      };
    }
  }
}

// Export singleton instance
export const aiServices = new AIServices();

// Export types
export type AIAnalysis = Awaited<ReturnType<typeof aiServices.enhanceBengaliContent>>;
export type SearchEnhancement = Awaited<ReturnType<typeof aiServices.enhanceSearch>>;
export type ModerationResult = Awaited<ReturnType<typeof aiServices.moderateComment>>;