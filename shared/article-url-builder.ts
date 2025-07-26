/**
 * Advanced Article URL Builder System
 * Based on major news sites best practices (CNN, NY Times, BBC, Guardian)
 * Supports date-based, category-based, and count-based URL patterns
 */

import { generateBengaliSlug, encodeBengaliSlug, decodeBengaliSlug } from './slug-utils';

// URL Pattern Types
export type ArticleUrlPattern = 
  | 'date-category-title'     // /2025/01/26/politics/article-title (NY Times style)
  | 'category-date-title'     // /politics/2025/01/26/article-title (Guardian style)
  | 'date-count-title'        // /2025/01/26/001/article-title (With daily count)
  | 'category-count-title'    // /politics/001/article-title (Category with count)
  | 'hierarchical'            // /news/politics/local/article-title (Deep categories)
  | 'simple-dated'            // /20250126/article-title (Simple date format)
  | 'count-only'              // /article/001/article-title (Count-based)
  | 'bengali-traditional';    // /সংবাদ/রাজনীতি/article-title (Bengali categories)

// Article Information Interface
export interface ArticleInfo {
  id: number;
  title: string;
  category: string;
  subcategory?: string;
  publishDate: Date;
  dailyCount?: number;
  totalCount?: number;
  tags?: string[];
  language?: 'bn' | 'en';
  isBreaking?: boolean;
  author?: string;
  region?: string;
}

// URL Generation Options
export interface UrlOptions {
  pattern: ArticleUrlPattern;
  baseUrl?: string;
  forSharing?: boolean;
  encoded?: boolean;
  includeYear?: boolean;
  maxTitleLength?: number;
  fallbackToId?: boolean;
  useCountPadding?: boolean;
  customDateFormat?: string;
}

/**
 * Main Article URL Builder Class
 */
export class ArticleUrlBuilder {
  private readonly defaultOptions: Partial<UrlOptions> = {
    pattern: 'date-category-title',
    baseUrl: '',
    forSharing: false,
    encoded: false,
    includeYear: true,
    maxTitleLength: 100,
    fallbackToId: true,
    useCountPadding: true,
    customDateFormat: 'YYYY/MM/DD'
  };

  /**
   * Generate article URL based on pattern
   */
  generateUrl(article: ArticleInfo, options: Partial<UrlOptions> = {}): string {
    const opts = { ...this.defaultOptions, ...options };
    const { pattern, baseUrl } = opts;

    let urlPath = '';

    switch (pattern) {
      case 'date-category-title':
        urlPath = this.buildDateCategoryTitle(article, opts);
        break;
      case 'category-date-title':
        urlPath = this.buildCategoryDateTitle(article, opts);
        break;
      case 'date-count-title':
        urlPath = this.buildDateCountTitle(article, opts);
        break;
      case 'category-count-title':
        urlPath = this.buildCategoryCountTitle(article, opts);
        break;
      case 'hierarchical':
        urlPath = this.buildHierarchical(article, opts);
        break;
      case 'simple-dated':
        urlPath = this.buildSimpleDated(article, opts);
        break;
      case 'count-only':
        urlPath = this.buildCountOnly(article, opts);
        break;
      case 'bengali-traditional':
        urlPath = this.buildBengaliTraditional(article, opts);
        break;
      default:
        urlPath = this.buildDateCategoryTitle(article, opts);
    }

    return `${baseUrl}${urlPath}`;
  }

  /**
   * Parse URL to extract article information
   */
  parseUrl(url: string, pattern: ArticleUrlPattern): Partial<ArticleInfo> | null {
    const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, '');
    
    switch (pattern) {
      case 'date-category-title':
        return this.parseDateCategoryTitle(cleanUrl);
      case 'category-date-title':
        return this.parseCategoryDateTitle(cleanUrl);
      case 'date-count-title':
        return this.parseDateCountTitle(cleanUrl);
      case 'category-count-title':
        return this.parseCategoryCountTitle(cleanUrl);
      case 'hierarchical':
        return this.parseHierarchical(cleanUrl);
      case 'simple-dated':
        return this.parseSimpleDated(cleanUrl);
      case 'count-only':
        return this.parseCountOnly(cleanUrl);
      case 'bengali-traditional':
        return this.parseBengaliTraditional(cleanUrl);
      default:
        return null;
    }
  }

  /**
   * Generate multiple URL variations for the same article
   */
  generateVariations(article: ArticleInfo, baseUrl: string = ''): Record<string, string> {
    const patterns: ArticleUrlPattern[] = [
      'date-category-title',
      'category-date-title', 
      'date-count-title',
      'category-count-title',
      'hierarchical',
      'simple-dated',
      'count-only',
      'bengali-traditional'
    ];

    const variations: Record<string, string> = {};
    
    patterns.forEach(pattern => {
      variations[pattern] = this.generateUrl(article, { pattern, baseUrl });
    });

    return variations;
  }

  // Pattern Implementation Methods

  private buildDateCategoryTitle(article: ArticleInfo, opts: Partial<UrlOptions>): string {
    const date = this.formatDate(article.publishDate, 'YYYY/MM/DD');
    const category = this.formatCategory(article.category);
    const title = this.formatTitle(article.title, opts.maxTitleLength, article.id, opts.fallbackToId);
    
    const path = `/${date}/${category}/${title}`;
    return opts.encoded ? this.encodePath(path) : path;
  }

  private buildCategoryDateTitle(article: ArticleInfo, opts: Partial<UrlOptions>): string {
    const date = this.formatDate(article.publishDate, 'YYYY/MM/DD');
    const category = this.formatCategory(article.category);
    const title = this.formatTitle(article.title, opts.maxTitleLength, article.id, opts.fallbackToId);
    
    const path = `/${category}/${date}/${title}`;
    return opts.encoded ? this.encodePath(path) : path;
  }

  private buildDateCountTitle(article: ArticleInfo, opts: Partial<UrlOptions>): string {
    const date = this.formatDate(article.publishDate, 'YYYY/MM/DD');
    const count = this.formatCount(article.dailyCount || article.id, opts.useCountPadding);
    const title = this.formatTitle(article.title, opts.maxTitleLength, article.id, opts.fallbackToId);
    
    const path = `/${date}/${count}/${title}`;
    return opts.encoded ? this.encodePath(path) : path;
  }

  private buildCategoryCountTitle(article: ArticleInfo, opts: Partial<UrlOptions>): string {
    const category = this.formatCategory(article.category);
    const count = this.formatCount(article.totalCount || article.id, opts.useCountPadding);
    const title = this.formatTitle(article.title, opts.maxTitleLength, article.id, opts.fallbackToId);
    
    const path = `/${category}/${count}/${title}`;
    return opts.encoded ? this.encodePath(path) : path;
  }

  private buildHierarchical(article: ArticleInfo, opts: Partial<UrlOptions>): string {
    const category = this.formatCategory(article.category);
    const subcategory = article.subcategory ? this.formatCategory(article.subcategory) : '';
    const region = article.region ? this.formatCategory(article.region) : '';
    const title = this.formatTitle(article.title, opts.maxTitleLength, article.id, opts.fallbackToId);
    
    let path = '/news';
    if (category) path += `/${category}`;
    if (subcategory) path += `/${subcategory}`;
    if (region) path += `/${region}`;
    path += `/${title}`;
    
    return opts.encoded ? this.encodePath(path) : path;
  }

  private buildSimpleDated(article: ArticleInfo, opts: Partial<UrlOptions>): string {
    const date = this.formatDate(article.publishDate, 'YYYYMMDD');
    const title = this.formatTitle(article.title, opts.maxTitleLength, article.id, opts.fallbackToId);
    
    const path = `/${date}/${title}`;
    return opts.encoded ? this.encodePath(path) : path;
  }

  private buildCountOnly(article: ArticleInfo, opts: Partial<UrlOptions>): string {
    const count = this.formatCount(article.id, opts.useCountPadding);
    const title = this.formatTitle(article.title, opts.maxTitleLength, article.id, opts.fallbackToId);
    
    const path = `/article/${count}/${title}`;
    return opts.encoded ? this.encodePath(path) : path;
  }

  private buildBengaliTraditional(article: ArticleInfo, opts: Partial<UrlOptions>): string {
    const category = generateBengaliSlug(article.category);
    const subcategory = article.subcategory ? generateBengaliSlug(article.subcategory) : '';
    const title = this.formatTitle(article.title, opts.maxTitleLength, article.id, opts.fallbackToId);
    
    let path = '/সংবাদ';
    if (category) path += `/${category}`;
    if (subcategory) path += `/${subcategory}`;
    path += `/${title}`;
    
    return opts.encoded ? this.encodePath(path) : path;
  }

  // Parsing Methods

  private parseDateCategoryTitle(url: string): Partial<ArticleInfo> | null {
    const pattern = /^\/(\d{4})\/(\d{2})\/(\d{2})\/([^\/]+)\/(.+)$/;
    const match = url.match(pattern);
    
    if (!match) return null;
    
    const [, year, month, day, category, title] = match;
    
    return {
      publishDate: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
      category: decodeBengaliSlug(category),
      title: decodeBengaliSlug(title).replace(/-/g, ' ')
    };
  }

  private parseCategoryDateTitle(url: string): Partial<ArticleInfo> | null {
    const pattern = /^\/([^\/]+)\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)$/;
    const match = url.match(pattern);
    
    if (!match) return null;
    
    const [, category, year, month, day, title] = match;
    
    return {
      category: decodeBengaliSlug(category),
      publishDate: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
      title: decodeBengaliSlug(title).replace(/-/g, ' ')
    };
  }

  private parseDateCountTitle(url: string): Partial<ArticleInfo> | null {
    const pattern = /^\/(\d{4})\/(\d{2})\/(\d{2})\/(\d+)\/(.+)$/;
    const match = url.match(pattern);
    
    if (!match) return null;
    
    const [, year, month, day, count, title] = match;
    
    return {
      publishDate: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
      dailyCount: parseInt(count),
      title: decodeBengaliSlug(title).replace(/-/g, ' ')
    };
  }

  private parseCategoryCountTitle(url: string): Partial<ArticleInfo> | null {
    const pattern = /^\/([^\/]+)\/(\d+)\/(.+)$/;
    const match = url.match(pattern);
    
    if (!match) return null;
    
    const [, category, count, title] = match;
    
    return {
      category: decodeBengaliSlug(category),
      totalCount: parseInt(count),
      title: decodeBengaliSlug(title).replace(/-/g, ' ')
    };
  }

  private parseHierarchical(url: string): Partial<ArticleInfo> | null {
    const parts = url.split('/').filter(part => part.length > 0);
    
    if (parts.length < 3 || parts[0] !== 'news') return null;
    
    const title = parts[parts.length - 1];
    const category = parts[1];
    const subcategory = parts.length > 3 ? parts[2] : undefined;
    const region = parts.length > 4 ? parts[3] : undefined;
    
    return {
      category: decodeBengaliSlug(category),
      subcategory: subcategory ? decodeBengaliSlug(subcategory) : undefined,
      region: region ? decodeBengaliSlug(region) : undefined,
      title: decodeBengaliSlug(title).replace(/-/g, ' ')
    };
  }

  private parseSimpleDated(url: string): Partial<ArticleInfo> | null {
    const pattern = /^\/(\d{8})\/(.+)$/;
    const match = url.match(pattern);
    
    if (!match) return null;
    
    const [, dateStr, title] = match;
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6));
    const day = parseInt(dateStr.substring(6, 8));
    
    return {
      publishDate: new Date(year, month - 1, day),
      title: decodeBengaliSlug(title).replace(/-/g, ' ')
    };
  }

  private parseCountOnly(url: string): Partial<ArticleInfo> | null {
    const pattern = /^\/article\/(\d+)\/(.+)$/;
    const match = url.match(pattern);
    
    if (!match) return null;
    
    const [, count, title] = match;
    
    return {
      id: parseInt(count),
      title: decodeBengaliSlug(title).replace(/-/g, ' ')
    };
  }

  private parseBengaliTraditional(url: string): Partial<ArticleInfo> | null {
    const parts = url.split('/').filter(part => part.length > 0);
    
    if (parts.length < 3 || parts[0] !== 'সংবাদ') return null;
    
    const title = parts[parts.length - 1];
    const category = parts[1];
    const subcategory = parts.length > 3 ? parts[2] : undefined;
    
    return {
      category: decodeBengaliSlug(category),
      subcategory: subcategory ? decodeBengaliSlug(subcategory) : undefined,
      title: decodeBengaliSlug(title).replace(/-/g, ' ')
    };
  }

  // Helper Methods

  private formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    switch (format) {
      case 'YYYY/MM/DD':
        return `${year}/${month}/${day}`;
      case 'YYYYMMDD':
        return `${year}${month}${day}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${year}/${month}/${day}`;
    }
  }

  private formatCategory(category: string): string {
    return generateBengaliSlug(category, { includeEnglish: true });
  }

  private formatTitle(title: string, maxLength: number = 100, articleId?: number, fallback: boolean = true): string {
    const slug = generateBengaliSlug(title, {
      maxLength,
      fallbackToId: fallback ? articleId : undefined,
      includeEnglish: true
    });
    
    return slug || `article-${articleId || 'untitled'}`;
  }

  private formatCount(count: number, padded: boolean = true): string {
    return padded ? String(count).padStart(3, '0') : String(count);
  }

  private encodePath(path: string): string {
    return path.split('/').map(segment => 
      segment === '' ? '' : encodeBengaliSlug(segment)
    ).join('/');
  }
}

// Export singleton instance
export const articleUrlBuilder = new ArticleUrlBuilder();

// Convenience functions
export function generateArticleUrl(article: ArticleInfo, options?: Partial<UrlOptions>): string {
  return articleUrlBuilder.generateUrl(article, options);
}

export function parseArticleUrl(url: string, pattern: ArticleUrlPattern): Partial<ArticleInfo> | null {
  return articleUrlBuilder.parseUrl(url, pattern);
}

export function getUrlVariations(article: ArticleInfo, baseUrl?: string): Record<string, string> {
  return articleUrlBuilder.generateVariations(article, baseUrl);
}

// Preset configurations for different site types
export const URL_PRESETS = {
  majorNews: { pattern: 'date-category-title' as ArticleUrlPattern, useCountPadding: false },
  bengaliNews: { pattern: 'bengali-traditional' as ArticleUrlPattern, maxTitleLength: 80 },
  blogStyle: { pattern: 'category-date-title' as ArticleUrlPattern, includeYear: true },
  minimal: { pattern: 'simple-dated' as ArticleUrlPattern, maxTitleLength: 60 },
  hierarchical: { pattern: 'hierarchical' as ArticleUrlPattern, maxTitleLength: 100 },
  countBased: { pattern: 'count-only' as ArticleUrlPattern, useCountPadding: true }
} as const;