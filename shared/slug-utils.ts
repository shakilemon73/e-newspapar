/**
 * Enhanced Bengali URL Slug Utilities
 * Robust functions to handle Bengali text in URL slugs with better browser compatibility
 */

// Bengali Unicode ranges and common punctuation
const BENGALI_RANGE = '\u0980-\u09FF';
const SAFE_CHARS = '\u0020\u002D\u005F\u0041-\u005A\u0061-\u007A\u0030-\u0039';
const BENGALI_PUNCTUATION_MAP: Record<string, string> = {
  '\u0964': '-',  // Bengali danda (।)
  '\u0965': '--', // Bengali double danda (॥)
  '\u2013': '-',  // En dash (–)
  '\u2014': '-',  // Em dash (—)
  '\u201C': '',   // Left double quotation (")
  '\u201D': '',   // Right double quotation (")
  '\u2018': '',   // Left single quotation (')
  '\u2019': '',   // Right single quotation (')
  '\u2026': '',   // Ellipsis (…)
};

/**
 * Generate a clean Bengali URL slug from title with enhanced processing
 * @param title - The Bengali title to convert to slug
 * @param options - Configuration options
 * @returns Clean URL slug that preserves Bengali characters
 */
export function generateBengaliSlug(
  title: string, 
  options: {
    maxLength?: number;
    includeEnglish?: boolean;
    fallbackToId?: number;
  } = {}
): string {
  const { maxLength = 150, includeEnglish = true, fallbackToId } = options;
  
  if (!title?.trim()) {
    return fallbackToId ? `article-${fallbackToId}` : 'untitled';
  }

  let slug = title
    .trim()
    .normalize('NFC') // Normalize Unicode characters
    .toLowerCase();

  // Replace Bengali punctuation with appropriate alternatives
  Object.entries(BENGALI_PUNCTUATION_MAP).forEach(([char, replacement]) => {
    slug = slug.replace(new RegExp(char, 'g'), replacement);
  });

  // Keep only Bengali characters and optionally English
  const allowedChars = includeEnglish 
    ? `[^${BENGALI_RANGE}${SAFE_CHARS}]`
    : `[^${BENGALI_RANGE}\u0020\u002D\u005F\u0030-\u0039]`;
  
  slug = slug
    .replace(new RegExp(allowedChars, 'g'), '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s\-_]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  // Truncate if too long, ensuring we don't break Bengali characters
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove any trailing incomplete Bengali character
    slug = slug.replace(/[\u0980-\u09FF]*$/, '');
    slug = slug.replace(/-+$/, '');
  }

  // Fallback to ID if slug is empty or too short
  if (!slug || slug.length < 2) {
    return fallbackToId ? `article-${fallbackToId}` : 'untitled';
  }

  return slug;
}

/**
 * Advanced encoding for Bengali slugs with better URL compatibility
 * @param slug - The Bengali slug to encode
 * @param preserveDisplay - Whether to preserve display format
 * @returns URL-encoded slug
 */
export function encodeBengaliSlug(slug: string, preserveDisplay: boolean = false): string {
  if (!slug) return '';
  
  // For display URLs, we can keep Bengali characters visible
  if (preserveDisplay) {
    // Only encode special characters that must be encoded
    return slug.replace(/[&=?#+\s]/g, match => encodeURIComponent(match));
  }
  
  // Full encoding for routing
  return encodeURIComponent(slug);
}

/**
 * Robust Bengali slug decoder with error handling
 * @param encodedSlug - The URL-encoded slug
 * @returns Decoded Bengali slug
 */
export function decodeBengaliSlug(encodedSlug: string): string {
  if (!encodedSlug) return '';
  
  try {
    let decoded = encodedSlug;
    
    // Handle multiple levels of encoding
    while (decoded.includes('%') && decoded !== decodeURIComponent(decoded)) {
      const previous = decoded;
      decoded = decodeURIComponent(decoded);
      
      // Prevent infinite loops
      if (decoded === previous) break;
    }
    
    // Normalize the result
    return decoded.normalize('NFC');
  } catch (error) {
    console.error('Error decoding Bengali slug:', error);
    return encodedSlug;
  }
}

/**
 * Create a user-friendly display URL for Bengali articles with SEO optimization
 * @param title - The article title
 * @param options - URL generation options
 * @returns User-friendly URL with Bengali characters
 */
export function createFriendlyBengaliUrl(
  title: string, 
  options: {
    baseUrl?: string;
    articleId?: number;
    includeEnglish?: boolean;
    forSharing?: boolean;
  } = {}
): string {
  const { baseUrl = '', articleId, includeEnglish = true, forSharing = false } = options;
  
  const slug = generateBengaliSlug(title, {
    includeEnglish,
    fallbackToId: articleId,
    maxLength: forSharing ? 100 : 150
  });
  
  // For sharing, use encoded version for better compatibility
  const finalSlug = forSharing ? encodeBengaliSlug(slug) : slug;
  
  return `${baseUrl}/article/${finalSlug}`;
}

/**
 * Normalize Bengali text for comparison
 * @param text - Bengali text to normalize
 * @returns Normalized text
 */
export function normalizeBengaliText(text: string): string {
  return text
    .trim()
    .normalize('NFC') // Normalize Unicode
    .toLowerCase();
}

/**
 * Generate SEO-friendly URL structure for Bengali content
 * @param title - Article title
 * @param category - Article category (optional)
 * @param articleId - Article ID for fallback
 * @returns Complete URL structure
 */
export function generateSeoFriendlyUrl(
  title: string,
  category?: string,
  articleId?: number
): {
  displayUrl: string;
  routeUrl: string;
  shareUrl: string;
} {
  const slug = generateBengaliSlug(title, {
    fallbackToId: articleId,
    includeEnglish: true,
    maxLength: 120
  });

  const categoryPath = category ? `/${generateBengaliSlug(category)}` : '';
  
  return {
    displayUrl: `/article${categoryPath}/${slug}`,
    routeUrl: `/article${categoryPath}/${encodeBengaliSlug(slug)}`,
    shareUrl: `/article${categoryPath}/${encodeBengaliSlug(slug, false)}`
  };
}

/**
 * Extract article information from Bengali URL
 * @param url - The URL to parse
 * @returns Parsed URL information
 */
export function parseBengaliUrl(url: string): {
  slug: string;
  decodedSlug: string;
  category?: string;
} | null {
  const urlPattern = /\/article(?:\/([^/]+))?\/(.+)/;
  const match = url.match(urlPattern);
  
  if (!match) return null;
  
  const [, category, slug] = match;
  
  return {
    slug,
    decodedSlug: decodeBengaliSlug(slug),
    category: category ? decodeBengaliSlug(category) : undefined
  };
}

/**
 * Validate if a string is a valid Bengali slug
 * @param slug - Slug to validate
 * @returns Whether the slug is valid
 */
export function isValidBengaliSlug(slug: string): boolean {
  if (!slug || slug.length < 2) return false;
  
  // Check if it contains valid characters
  const validPattern = new RegExp(`^[${BENGALI_RANGE}${SAFE_CHARS}]+$`);
  return validPattern.test(slug);
}

/**
 * Create breadcrumb navigation from Bengali URL
 * @param url - Current URL
 * @param baseUrl - Base URL of the site
 * @returns Breadcrumb items
 */
export function createBengaliBreadcrumbs(
  url: string,
  baseUrl: string = ''
): Array<{ title: string; url: string; isActive: boolean }> {
  const breadcrumbs = [
    { title: 'হোম', url: `${baseUrl}/`, isActive: false }
  ];
  
  const parsed = parseBengaliUrl(url);
  if (!parsed) return breadcrumbs;
  
  if (parsed.category) {
    breadcrumbs.push({
      title: parsed.category,
      url: `${baseUrl}/category/${encodeBengaliSlug(parsed.category)}`,
      isActive: false
    });
  }
  
  breadcrumbs.push({
    title: parsed.decodedSlug.replace(/-/g, ' '),
    url: url,
    isActive: true
  });
  
  return breadcrumbs;
}

/**
 * Generate alternate URL formats for better browser/SEO compatibility
 * @param title - Article title
 * @param articleId - Article ID
 * @returns Multiple URL format options
 */
export function generateAlternateUrls(
  title: string,
  articleId: number
): {
  bengaliOnly: string;
  mixed: string;
  fallback: string;
  encoded: string;
} {
  const bengaliSlug = generateBengaliSlug(title, { includeEnglish: false });
  const mixedSlug = generateBengaliSlug(title, { includeEnglish: true });
  
  return {
    bengaliOnly: `/article/${bengaliSlug}`,
    mixed: `/article/${mixedSlug}`,
    fallback: `/article/article-${articleId}`,
    encoded: `/article/${encodeBengaliSlug(mixedSlug)}`
  };
}