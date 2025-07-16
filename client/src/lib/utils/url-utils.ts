/**
 * URL utilities for handling Bengali characters in URLs
 */

/**
 * Create a clean Bengali URL slug
 * @param title - The Bengali title
 * @returns Clean URL slug
 */
export function createBengaliSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    // Keep Bengali characters, letters, numbers, spaces, and hyphens
    .replace(/[^\u0980-\u09FF\u0020\u002D\u005F\u0041-\u005A\u0061-\u007A\u0030-\u0039]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Navigate to article with clean URL display
 * @param slug - The article slug
 * @param title - The article title (for display)
 */
export function navigateToArticle(slug: string, title?: string): void {
  const encodedSlug = encodeURIComponent(slug);
  const articleUrl = `/article/${encodedSlug}`;
  
  // Use History API to set clean display URL
  if (title) {
    const cleanSlug = createBengaliSlug(title);
    const displayUrl = `/article/${cleanSlug}`;
    
    // Set the displayed URL to clean Bengali
    try {
      window.history.replaceState(null, '', displayUrl);
    } catch (e) {
      console.log('Could not update URL display:', e);
    }
  }
  
  // Navigate to the encoded URL for routing
  window.location.href = articleUrl;
}

/**
 * Get clean URL for sharing
 * @param slug - The article slug
 * @param title - The article title
 * @returns Clean URL for sharing
 */
export function getCleanShareUrl(slug: string, title?: string): string {
  const baseUrl = window.location.origin;
  
  if (title) {
    const cleanSlug = createBengaliSlug(title);
    return `${baseUrl}/article/${cleanSlug}`;
  }
  
  return `${baseUrl}/article/${slug}`;
}

/**
 * Decode URL slug safely
 * @param slug - The encoded slug
 * @returns Decoded slug
 */
export function decodeSlug(slug: string): string {
  try {
    let decoded = decodeURIComponent(slug);
    
    // Handle double encoding
    if (decoded.includes('%')) {
      decoded = decodeURIComponent(decoded);
    }
    
    return decoded;
  } catch (e) {
    console.log('Error decoding slug:', e);
    return slug;
  }
}

/**
 * Update browser URL to show clean Bengali text
 * @param cleanUrl - The clean URL to display
 */
export function updateDisplayUrl(cleanUrl: string): void {
  try {
    if (window.history.replaceState) {
      window.history.replaceState(null, '', cleanUrl);
    }
  } catch (e) {
    console.log('Could not update display URL:', e);
  }
}