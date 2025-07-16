/**
 * Router utilities for handling Bengali URLs
 */
import { createBengaliSlug } from './url-utils';

/**
 * Navigate to article with proper URL handling
 * @param article - The article object
 */
export function navigateToArticle(article: { slug: string; title: string; id: number }) {
  // Create clean Bengali slug from title
  const cleanSlug = createBengaliSlug(article.title);
  
  // Navigate to the clean URL
  const cleanUrl = `/article/${cleanSlug}`;
  
  // Use pushState to navigate with clean URL
  window.history.pushState(null, '', cleanUrl);
  
  // Dispatch a custom event to trigger re-render
  const popStateEvent = new PopStateEvent('popstate', { state: null });
  window.dispatchEvent(popStateEvent);
}

/**
 * Get shareable URL for an article
 * @param article - The article object  
 * @returns Clean shareable URL
 */
export function getShareableUrl(article: { slug: string; title: string; id: number }): string {
  const cleanSlug = createBengaliSlug(article.title);
  const baseUrl = window.location.origin;
  return `${baseUrl}/article/${cleanSlug}`;
}

/**
 * Fix current URL if it's encoded
 * @param article - The article object
 */
export function fixCurrentUrl(article: { slug: string; title: string; id: number }) {
  const cleanSlug = createBengaliSlug(article.title);
  const cleanUrl = `/article/${cleanSlug}`;
  const currentPath = window.location.pathname;
  
  // Only update if the current path is different (likely encoded)
  if (currentPath !== cleanUrl && currentPath.includes('%')) {
    window.history.replaceState(null, '', cleanUrl);
  }
}