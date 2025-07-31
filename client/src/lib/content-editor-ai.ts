/**
 * AI-Enhanced Content Editor Services
 * Provides AI-powered features for the ContentEditor component
 */

import { supabase } from './supabase';

export interface TitleSuggestion {
  title: string;
  confidence: number;
  reason: string;
}

export interface ArticleSummary {
  summary: string;
  keyPoints: string[];
  readingTime: number;
}

export interface SEOSuggestions {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  socialImage: string;
}

export interface BreakingNewsData {
  urgency: 'high' | 'medium' | 'low';
  category: string;
  keywords: string[];
  suggestedTitle: string;
}

class ContentEditorAI {
  /**
   * AI-powered title suggestions based on content
   */
  async suggestTitles(content: string, category?: string): Promise<TitleSuggestion[]> {
    try {
      // Extract key phrases from content
      const keyPhrases = this.extractKeyPhrases(content);
      const contentWords = content.split(' ').slice(0, 50).join(' ');
      
      // Generate title suggestions using Bengali patterns
      const suggestions: TitleSuggestion[] = [];
      
      // Pattern 1: Question-based titles
      if (content.includes('কেন') || content.includes('কিভাবে') || content.includes('কী')) {
        suggestions.push({
          title: `${keyPhrases[0]}: জানুন বিস্তারিত`,
          confidence: 0.8,
          reason: 'প্রশ্ন-ভিত্তিক শিরোনাম'
        });
      }
      
      // Pattern 2: Breaking news style
      if (content.includes('ঘটনা') || content.includes('সংবাদ') || content.includes('আজ')) {
        suggestions.push({
          title: `${keyPhrases[0]} নিয়ে চাঞ্চল্য`,
          confidence: 0.9,
          reason: 'ব্রেকিং নিউজ স্টাইল'
        });
      }
      
      // Pattern 3: Analytical titles
      suggestions.push({
        title: `${keyPhrases[0]}: যা জানা দরকার`,
        confidence: 0.7,
        reason: 'বিশ্লেষণধর্মী শিরোনাম'
      });
      
      return suggestions.slice(0, 3);
      
    } catch (error) {
      console.error('Title suggestion error:', error);
      return [];
    }
  }

  /**
   * Auto-generate article summary from content
   */
  async generateSummary(content: string, title: string): Promise<ArticleSummary> {
    try {
      // Clean HTML content
      const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Extract first paragraph for summary
      const paragraphs = cleanContent.split('\n').filter(p => p.trim().length > 20);
      const firstParagraph = paragraphs[0] || cleanContent.substring(0, 200);
      
      // Extract key points
      const sentences = cleanContent.split(/[।।]/).filter(s => s.trim().length > 10);
      const keyPoints = sentences.slice(0, 3).map(s => s.trim());
      
      // Calculate reading time (200 Bengali words per minute)
      const wordCount = cleanContent.split(' ').length;
      const readingTime = Math.ceil(wordCount / 200);
      
      return {
        summary: firstParagraph + (firstParagraph.length > 200 ? '...' : ''),
        keyPoints,
        readingTime
      };
      
    } catch (error) {
      console.error('Summary generation error:', error);
      return {
        summary: 'সারসংক্ষেপ তৈরি করা যায়নি',
        keyPoints: [],
        readingTime: 1
      };
    }
  }

  /**
   * AI-powered SEO optimization
   */
  async generateSEO(title: string, content: string, category?: string): Promise<SEOSuggestions> {
    try {
      const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Generate meta title (55-60 characters)
      let metaTitle = title.length > 55 ? title.substring(0, 52) + '...' : title;
      if (!metaTitle.includes('বাংলা') && !metaTitle.includes('বাংলাদেশ')) {
        metaTitle += ' | বাংলা সংবাদ';
      }
      
      // Generate meta description (150-160 characters)
      const firstSentence = cleanContent.split(/[।।]/)[0] || cleanContent.substring(0, 150);
      const metaDescription = firstSentence.length > 155 
        ? firstSentence.substring(0, 152) + '...'
        : firstSentence;
      
      // Extract keywords
      const keywords = this.extractKeywords(title + ' ' + cleanContent);
      
      return {
        metaTitle,
        metaDescription,
        keywords: keywords.slice(0, 5),
        socialImage: '/images/og-default.jpg'
      };
      
    } catch (error) {
      console.error('SEO generation error:', error);
      return {
        metaTitle: title,
        metaDescription: 'বাংলাদেশের সর্বশেষ সংবাদ',
        keywords: [],
        socialImage: '/images/og-default.jpg'
      };
    }
  }

  /**
   * Analyze content for breaking news potential
   */
  async analyzeBreakingNews(title: string, content: string): Promise<BreakingNewsData> {
    try {
      const urgencyKeywords = {
        high: ['জরুরি', 'ব্রেকিং', 'চাঞ্চল্য', 'বিস্ফোরণ', 'হামলা', 'দুর্ঘটনা'],
        medium: ['ঘটনা', 'সংবাদ', 'আজ', 'এখন', 'সর্বশেষ'],
        low: ['আলোচনা', 'মতামত', 'বিশ্লেষণ', 'পর্যালোচনা']
      };
      
      const lowerContent = (title + ' ' + content).toLowerCase();
      
      let urgency: 'high' | 'medium' | 'low' = 'low';
      
      if (urgencyKeywords.high.some(keyword => lowerContent.includes(keyword))) {
        urgency = 'high';
      } else if (urgencyKeywords.medium.some(keyword => lowerContent.includes(keyword))) {
        urgency = 'medium';
      }
      
      // Determine category based on content
      const categoryKeywords = {
        'রাজনীতি': ['সরকার', 'মন্ত্রী', 'দল', 'নেতা', 'সংসদ'],
        'অর্থনীতি': ['টাকা', 'বাজার', 'ব্যাংক', 'ব্যবসা', 'দাম'],
        'খেলা': ['ক্রিকেট', 'ফুটবল', 'খেলা', 'দল', 'ম্যাচ'],
        'আন্তর্জাতিক': ['বিশ্ব', 'আমেরিকা', 'ভারত', 'চীন', 'ইউরোপ']
      };
      
      let category = 'সাধারণ';
      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerContent.includes(keyword))) {
          category = cat;
          break;
        }
      }
      
      return {
        urgency,
        category,
        keywords: this.extractKeywords(title + ' ' + content).slice(0, 3),
        suggestedTitle: urgency === 'high' ? `🔴 ${title}` : title
      };
      
    } catch (error) {
      console.error('Breaking news analysis error:', error);
      return {
        urgency: 'low',
        category: 'সাধারণ',
        keywords: [],
        suggestedTitle: title
      };
    }
  }

  /**
   * Extract key phrases from Bengali text
   */
  private extractKeyPhrases(text: string): string[] {
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Common Bengali stop words to filter out
    const stopWords = [
      'এই', 'সেই', 'যে', 'যা', 'কে', 'কি', 'এবং', 'অথবা', 'কিন্তু', 'তবে',
      'হয়', 'হয়েছে', 'করা', 'করে', 'করেছে', 'বলা', 'বলে', 'বলেছে'
    ];
    
    const words = cleanText.split(' ')
      .filter(word => word.length > 2)
      .filter(word => !stopWords.includes(word))
      .slice(0, 20);
    
    // Extract 2-3 word phrases
    const phrases: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i] && words[i + 1]) {
        phrases.push(words[i] + ' ' + words[i + 1]);
      }
    }
    
    return phrases.slice(0, 5);
  }

  /**
   * Extract keywords from Bengali text
   */
  private extractKeywords(text: string): string[] {
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Common Bengali stop words
    const stopWords = [
      'এই', 'সেই', 'যে', 'যা', 'কে', 'কি', 'এবং', 'অথবা', 'কিন্তু', 'তবে',
      'হয়', 'হয়েছে', 'করা', 'করে', 'করেছে', 'বলা', 'বলে', 'বলেছে',
      'একটি', 'একই', 'অন্য', 'আরো', 'আরও', 'সব', 'সকল', 'যখন', 'তখন'
    ];
    
    const words = cleanText
      .split(/[\s,।।\n]+/)
      .map(word => word.trim())
      .filter(word => word.length > 2)
      .filter(word => !stopWords.includes(word))
      .filter(word => !/^[a-zA-Z]+$/.test(word)); // Filter out English words
    
    // Count word frequency
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Get Bangladesh timezone formatted date
   */
  getBangladeshDateTime(): string {
    const bangladeshTime = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date());
    
    return bangladeshTime.replace(' ', 'T');
  }

  /**
   * Format date in Bengali
   */
  formatBengaliDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    try {
      return date.toLocaleDateString('bn-BD', options);
    } catch {
      return date.toLocaleDateString('en-US', options);
    }
  }
}

export const contentEditorAI = new ContentEditorAI();