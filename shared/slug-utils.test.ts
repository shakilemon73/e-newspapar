/**
 * Test examples for Bengali URL Slug Utilities
 * Demonstrates usage of the enhanced Bengali slug functions
 */

import {
  generateBengaliSlug,
  encodeBengaliSlug,
  decodeBengaliSlug,
  createFriendlyBengaliUrl,
  generateSeoFriendlyUrl,
  parseBengaliUrl,
  isValidBengaliSlug,
  createBengaliBreadcrumbs,
  generateAlternateUrls,
  normalizeBengaliText
} from './slug-utils';

// Example usage and test cases
export function demonstrateSlugUtils() {
  console.log('=== Bengali URL Slug Utilities Demo ===\n');
  
  // Test titles
  const testTitles = [
    'বাংলাদেশে নতুন প্রযুক্তির উন্নতি',
    'ঢাকায় আজকের আবহাওয়া: বৃষ্টির সম্ভাবনা',
    'cricket news: বাংলাদেশ vs ভারত ম্যাচ',
    'রাজনীতি ও অর্থনীতি - নতুন দিগন্ত',
    '২০২৫ সালের বাজেট পরিকল্পনা',
  ];

  testTitles.forEach((title, index) => {
    console.log(`\n--- Test ${index + 1}: "${title}" ---`);
    
    // Basic slug generation
    const basicSlug = generateBengaliSlug(title);
    console.log('Basic Slug:', basicSlug);
    
    // Advanced slug with options
    const advancedSlug = generateBengaliSlug(title, {
      maxLength: 50,
      includeEnglish: true,
      fallbackToId: index + 1
    });
    console.log('Advanced Slug:', advancedSlug);
    
    // Encoding variations
    const encoded = encodeBengaliSlug(basicSlug);
    const encodedForDisplay = encodeBengaliSlug(basicSlug, true);
    console.log('Fully Encoded:', encoded);
    console.log('Display Encoded:', encodedForDisplay);
    
    // Decoding
    const decoded = decodeBengaliSlug(encoded);
    console.log('Decoded:', decoded);
    
    // Friendly URLs
    const friendlyUrl = createFriendlyBengaliUrl(title, {
      baseUrl: 'https://bengali-news.com',
      articleId: index + 1,
      forSharing: false
    });
    console.log('Friendly URL:', friendlyUrl);
    
    // SEO-friendly URLs
    const seoUrls = generateSeoFriendlyUrl(title, 'সংবাদ', index + 1);
    console.log('SEO URLs:', seoUrls);
    
    // Validation
    console.log('Is Valid Slug:', isValidBengaliSlug(basicSlug));
    
    // Alternate formats
    const alternates = generateAlternateUrls(title, index + 1);
    console.log('Alternates:', alternates);
  });

  // Test URL parsing
  console.log('\n=== URL Parsing Tests ===');
  const testUrls = [
    '/article/বাংলাদেশে-নতুন-প্রযুক্তি',
    '/article/সংবাদ/ঢাকায়-আবহাওয়া',
    '/article/cricket-news-বাংলাদেশ-vs-ভারত'
  ];

  testUrls.forEach(url => {
    const parsed = parseBengaliUrl(url);
    console.log(`URL: ${url}`);
    console.log('Parsed:', parsed);
    
    if (parsed) {
      const breadcrumbs = createBengaliBreadcrumbs(url, 'https://bengali-news.com');
      console.log('Breadcrumbs:', breadcrumbs);
    }
    console.log('---');
  });

  // Test normalization
  console.log('\n=== Text Normalization Tests ===');
  const unnormalizedTexts = [
    'বাংলাদেশ   ',
    '  ঢাকা  ',
    'BANGLADESH',
    'চট্টগ্রাম'
  ];

  unnormalizedTexts.forEach(text => {
    const normalized = normalizeBengaliText(text);
    console.log(`"${text}" -> "${normalized}"`);
  });
}

// Export for testing
export const testCases = {
  basicSlugGeneration: () => {
    const title = 'বাংলাদেশে নতুন প্রযুক্তির উন্নতি';
    return generateBengaliSlug(title);
  },
  
  urlEncoding: () => {
    const slug = 'বাংলাদেশে-নতুন-প্রযুক্তি';
    return {
      original: slug,
      encoded: encodeBengaliSlug(slug),
      displayEncoded: encodeBengaliSlug(slug, true)
    };
  },
  
  urlDecoding: () => {
    const encoded = '%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6%E0%A7%87-%E0%A6%A8%E0%A6%A4%E0%A7%81%E0%A6%A8';
    return decodeBengaliSlug(encoded);
  },
  
  seoUrlGeneration: () => {
    const title = 'ঢাকায় আজকের আবহাওয়া: বৃষ্টির সম্ভাবনা';
    return generateSeoFriendlyUrl(title, 'আবহাওয়া', 123);
  }
};