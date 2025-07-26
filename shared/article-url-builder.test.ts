/**
 * Comprehensive Tests and Examples for Article URL Builder
 * Demonstrates all URL patterns with Bengali content
 */

import {
  ArticleUrlBuilder,
  ArticleInfo,
  ArticleUrlPattern,
  generateArticleUrl,
  parseArticleUrl,
  getUrlVariations,
  URL_PRESETS
} from './article-url-builder';

// Sample Bengali articles for testing
const sampleArticles: ArticleInfo[] = [
  {
    id: 1,
    title: 'বাংলাদেশে নতুন প্রযুক্তির উন্নতি',
    category: 'প্রযুক্তি',
    subcategory: 'কৃত্রিম বুদ্ধিমত্তা',
    publishDate: new Date(2025, 0, 26), // January 26, 2025
    dailyCount: 1,
    totalCount: 1,
    language: 'bn',
    author: 'জাহিদ হাসান',
    region: 'ঢাকা'
  },
  {
    id: 2,
    title: 'ঢাকায় আজকের আবহাওয়া: বৃষ্টির সম্ভাবনা',
    category: 'আবহাওয়া',
    publishDate: new Date(2025, 0, 26),
    dailyCount: 2,
    totalCount: 2,
    language: 'bn',
    isBreaking: true,
    region: 'ঢাকা'
  },
  {
    id: 3,
    title: 'Cricket News: বাংলাদেশ vs ভারত ম্যাচ',
    category: 'খেলাধুলা',
    subcategory: 'ক্রিকেট',
    publishDate: new Date(2025, 0, 26),
    dailyCount: 3,
    totalCount: 3,
    language: 'bn',
    tags: ['ক্রিকেট', 'বাংলাদেশ', 'ভারত']
  },
  {
    id: 4,
    title: 'রাজনীতি ও অর্থনীতি - নতুন দিগন্ত',
    category: 'রাজনীতি',
    subcategory: 'অর্থনীতি',
    publishDate: new Date(2025, 0, 25),
    dailyCount: 1,
    totalCount: 4,
    language: 'bn'
  },
  {
    id: 5,
    title: '২০২৫ সালের বাজেট পরিকল্পনা',
    category: 'অর্থনীতি',
    publishDate: new Date(2025, 0, 24),
    dailyCount: 1,
    totalCount: 5,
    language: 'bn'
  }
];

/**
 * Test all URL patterns with sample articles
 */
export function testAllUrlPatterns() {
  console.log('=== Article URL Builder - Comprehensive Tests ===\n');
  
  const builder = new ArticleUrlBuilder();
  const baseUrl = 'https://bengali-news.com';
  
  // Test each pattern with multiple articles
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

  patterns.forEach(pattern => {
    console.log(`\n=== Pattern: ${pattern.toUpperCase()} ===`);
    
    sampleArticles.slice(0, 3).forEach((article, index) => {
      const url = builder.generateUrl(article, { pattern, baseUrl });
      const encoded = builder.generateUrl(article, { pattern, baseUrl, encoded: true });
      const sharing = builder.generateUrl(article, { pattern, baseUrl, forSharing: true });
      
      console.log(`\nArticle ${index + 1}: "${article.title}"`);
      console.log(`Display URL: ${url}`);
      console.log(`Encoded URL: ${encoded}`);
      console.log(`Sharing URL: ${sharing}`);
      
      // Test parsing
      const parsed = builder.parseUrl(url, pattern);
      console.log(`Parsed Data:`, JSON.stringify(parsed, null, 2));
    });
  });
}

/**
 * Test URL variations for a single article
 */
export function testUrlVariations() {
  console.log('\n=== URL Variations for Single Article ===');
  
  const article = sampleArticles[0];
  const baseUrl = 'https://bengali-news.com';
  
  console.log(`\nArticle: "${article.title}"`);
  console.log(`Category: ${article.category}`);
  console.log(`Date: ${article.publishDate.toDateString()}`);
  console.log(`ID: ${article.id}\n`);
  
  const variations = getUrlVariations(article, baseUrl);
  
  Object.entries(variations).forEach(([pattern, url]) => {
    console.log(`${pattern.padEnd(20)}: ${url}`);
  });
}

/**
 * Test preset configurations
 */
export function testPresetConfigurations() {
  console.log('\n=== Preset Configurations Test ===');
  
  const article = sampleArticles[1]; // Weather article
  const baseUrl = 'https://bengali-news.com';
  
  console.log(`\nArticle: "${article.title}"`);
  
  Object.entries(URL_PRESETS).forEach(([presetName, config]) => {
    const url = generateArticleUrl(article, { ...config, baseUrl });
    console.log(`${presetName.padEnd(15)}: ${url}`);
  });
}

/**
 * Test specific scenarios
 */
export function testSpecificScenarios() {
  console.log('\n=== Specific Scenario Tests ===');
  
  // Test breaking news
  const breakingNews: ArticleInfo = {
    id: 999,
    title: 'জরুরি: প্রধানমন্ত্রীর গুরুত্বপূর্ণ ঘোষণা',
    category: 'জরুরি সংবাদ',
    publishDate: new Date(),
    dailyCount: 1,
    totalCount: 999,
    isBreaking: true,
    language: 'bn'
  };
  
  console.log('\n--- Breaking News URL ---');
  const breakingUrl = generateArticleUrl(breakingNews, {
    pattern: 'date-category-title',
    baseUrl: 'https://bengali-news.com'
  });
  console.log('Breaking News URL:', breakingUrl);
  
  // Test long title truncation
  const longTitleArticle: ArticleInfo = {
    id: 888,
    title: 'এই একটি অত্যন্ত দীর্ঘ শিরোনাম যা সাধারণত URL এ ব্যবহারের জন্য খুবই বড় এবং এটি truncate করা প্রয়োজন হবে',
    category: 'সাধারণ',
    publishDate: new Date(),
    dailyCount: 1,
    totalCount: 888,
    language: 'bn'
  };
  
  console.log('\n--- Long Title Truncation ---');
  const shortUrl = generateArticleUrl(longTitleArticle, {
    pattern: 'date-category-title',
    maxTitleLength: 50,
    baseUrl: 'https://bengali-news.com'
  });
  console.log('Truncated URL:', shortUrl);
  
  // Test fallback mechanism
  const emptyTitleArticle: ArticleInfo = {
    id: 777,
    title: '',
    category: 'test',
    publishDate: new Date(),
    language: 'bn'
  };
  
  console.log('\n--- Fallback Mechanism ---');
  const fallbackUrl = generateArticleUrl(emptyTitleArticle, {
    pattern: 'date-category-title',
    fallbackToId: true,
    baseUrl: 'https://bengali-news.com'
  });
  console.log('Fallback URL:', fallbackUrl);
}

/**
 * Test URL parsing accuracy
 */
export function testUrlParsing() {
  console.log('\n=== URL Parsing Accuracy Test ===');
  
  const testUrls = [
    {
      url: '/2025/01/26/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি',
      pattern: 'date-category-title' as ArticleUrlPattern
    },
    {
      url: '/আবহাওয়া/2025/01/26/ঢাকায়-আজকের-আবহাওয়া-বৃষ্টির-সম্ভাবনা',
      pattern: 'category-date-title' as ArticleUrlPattern
    },
    {
      url: '/2025/01/26/003/cricket-news-বাংলাদেশ-vs-ভারত-ম্যাচ',
      pattern: 'date-count-title' as ArticleUrlPattern
    },
    {
      url: '/news/রাজনীতি/অর্থনীতি/রাজনীতি-ও-অর্থনীতি-নতুন-দিগন্ত',
      pattern: 'hierarchical' as ArticleUrlPattern
    },
    {
      url: '/সংবাদ/অর্থনীতি/২০২৫-সালের-বাজেট-পরিকল্পনা',
      pattern: 'bengali-traditional' as ArticleUrlPattern
    }
  ];
  
  testUrls.forEach(({ url, pattern }) => {
    console.log(`\nURL: ${url}`);
    console.log(`Pattern: ${pattern}`);
    const parsed = parseArticleUrl(url, pattern);
    console.log('Parsed:', JSON.stringify(parsed, null, 2));
  });
}

/**
 * Performance and benchmarking test
 */
export function performanceBenchmark() {
  console.log('\n=== Performance Benchmark ===');
  
  const article = sampleArticles[0];
  const iterations = 1000;
  
  // URL Generation benchmark
  const startGeneration = Date.now();
  for (let i = 0; i < iterations; i++) {
    generateArticleUrl(article, { pattern: 'date-category-title' });
  }
  const generationTime = Date.now() - startGeneration;
  
  // URL Parsing benchmark
  const testUrl = '/2025/01/26/প্রযুক্তি/বাংলাদেশে-নতুন-প্রযুক্তির-উন্নতি';
  const startParsing = Date.now();
  for (let i = 0; i < iterations; i++) {
    parseArticleUrl(testUrl, 'date-category-title');
  }
  const parsingTime = Date.now() - startParsing;
  
  console.log(`URL Generation: ${iterations} operations in ${generationTime}ms`);
  console.log(`Average: ${(generationTime / iterations).toFixed(3)}ms per operation`);
  console.log(`URL Parsing: ${iterations} operations in ${parsingTime}ms`);
  console.log(`Average: ${(parsingTime / iterations).toFixed(3)}ms per operation`);
}

/**
 * Real-world usage examples
 */
export function realWorldExamples() {
  console.log('\n=== Real-World Usage Examples ===');
  
  console.log('\n--- Major News Site Style (NY Times) ---');
  sampleArticles.slice(0, 2).forEach(article => {
    const url = generateArticleUrl(article, URL_PRESETS.majorNews);
    console.log(`${article.title.substring(0, 30)}... → ${url}`);
  });
  
  console.log('\n--- Bengali Traditional Style ---');
  sampleArticles.slice(0, 2).forEach(article => {
    const url = generateArticleUrl(article, URL_PRESETS.bengaliNews);
    console.log(`${article.title.substring(0, 30)}... → ${url}`);
  });
  
  console.log('\n--- Hierarchical Category Style ---');
  sampleArticles.filter(a => a.subcategory).forEach(article => {
    const url = generateArticleUrl(article, URL_PRESETS.hierarchical);
    console.log(`${article.title.substring(0, 30)}... → ${url}`);
  });
  
  console.log('\n--- Count-Based Style ---');
  sampleArticles.slice(0, 3).forEach(article => {
    const url = generateArticleUrl(article, URL_PRESETS.countBased);
    console.log(`${article.title.substring(0, 30)}... → ${url}`);
  });
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('🚀 Starting comprehensive Article URL Builder tests...\n');
  
  testUrlVariations();
  testPresetConfigurations();
  testSpecificScenarios();
  testUrlParsing();
  realWorldExamples();
  performanceBenchmark();
  
  console.log('\n✅ All tests completed successfully!');
}

// Quick test functions for development
export const quickTests = {
  nyTimes: (article: ArticleInfo) => generateArticleUrl(article, { 
    pattern: 'date-category-title',
    baseUrl: 'https://bengali-news.com'
  }),
  
  guardian: (article: ArticleInfo) => generateArticleUrl(article, { 
    pattern: 'category-date-title',
    baseUrl: 'https://bengali-news.com'
  }),
  
  withCount: (article: ArticleInfo) => generateArticleUrl(article, { 
    pattern: 'date-count-title',
    baseUrl: 'https://bengali-news.com'
  }),
  
  bengali: (article: ArticleInfo) => generateArticleUrl(article, { 
    pattern: 'bengali-traditional',
    baseUrl: 'https://bengali-news.com'
  })
};

// Export sample data for external testing
export { sampleArticles };