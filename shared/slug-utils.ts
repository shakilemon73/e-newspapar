/**
 * Bengali URL Slug Utilities
 * Functions to handle Bengali text in URL slugs properly
 */

/**
 * Generate a clean Bengali URL slug from title
 * @param title - The Bengali title to convert to slug
 * @returns Clean URL slug that preserves Bengali characters
 */
export function generateBengaliSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    // Remove special characters but keep Bengali characters
    .replace(/[^\u0980-\u09FF\u200D\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\u0020\u002D\u005F\u0041-\u005A\u0061-\u007A\u0030-\u0039]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Encode Bengali slug for URL
 * @param slug - The Bengali slug to encode
 * @returns URL-encoded slug
 */
export function encodeBengaliSlug(slug: string): string {
  return encodeURIComponent(slug);
}

/**
 * Decode Bengali slug from URL
 * @param encodedSlug - The URL-encoded slug
 * @returns Decoded Bengali slug
 */
export function decodeBengaliSlug(encodedSlug: string): string {
  try {
    let decoded = decodeURIComponent(encodedSlug);
    
    // Handle double encoding issues
    if (decoded.includes('%')) {
      decoded = decodeURIComponent(decoded);
    }
    
    return decoded;
  } catch (error) {
    console.error('Error decoding Bengali slug:', error);
    return encodedSlug;
  }
}

/**
 * Create a user-friendly display URL for Bengali articles
 * @param title - The article title
 * @param baseUrl - The base URL of the website
 * @returns User-friendly URL with Bengali characters
 */
export function createFriendlyBengaliUrl(title: string, baseUrl: string = ''): string {
  const slug = generateBengaliSlug(title);
  return `${baseUrl}/article/${slug}`;
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