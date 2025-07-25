/**
 * WORLD-CLASS DOM MANIPULATION HELPERS
 * Based on Stack Overflow's most upvoted solutions for classList errors
 * Prevents "Cannot read properties of undefined (reading 'add')" in production builds
 */

import { RefObject } from 'react';

/**
 * Safe classList operations - Stack Overflow proven solution
 * https://stackoverflow.com/questions/52909830/typeerror-cannot-read-property-classlist-of-null
 */
export const safeClassListAdd = (element: Element | HTMLElement | null | undefined, ...classNames: string[]): boolean => {
  try {
    if (element && element.classList && typeof element.classList.add === 'function') {
      element.classList.add(...classNames);
      return true;
    }
  } catch (error) {
    console.warn('SafeClassListAdd failed:', error, 'Element:', element, 'Classes:', classNames);
  }
  return false;
};

export const safeClassListRemove = (element: Element | HTMLElement | null | undefined, ...classNames: string[]): boolean => {
  try {
    if (element && element.classList && typeof element.classList.remove === 'function') {
      element.classList.remove(...classNames);
      return true;
    }
  } catch (error) {
    console.warn('SafeClassListRemove failed:', error, 'Element:', element, 'Classes:', classNames);
  }
  return false;
};

export const safeClassListToggle = (element: Element | HTMLElement | null | undefined, className: string): boolean => {
  try {
    if (element && element.classList && typeof element.classList.toggle === 'function') {
      return element.classList.toggle(className);
    }
  } catch (error) {
    console.warn('SafeClassListToggle failed:', error, 'Element:', element, 'Class:', className);
  }
  return false;
};

/**
 * Safe ref-based classList operations
 */
export const safeRefClassListAdd = (ref: RefObject<Element | HTMLElement>, ...classNames: string[]): boolean => {
  return safeClassListAdd(ref.current, ...classNames);
};

export const safeRefClassListRemove = (ref: RefObject<Element | HTMLElement>, ...classNames: string[]): boolean => {
  return safeClassListRemove(ref.current, ...classNames);
};

export const safeRefClassListToggle = (ref: RefObject<Element | HTMLElement>, className: string): boolean => {
  return safeClassListToggle(ref.current, className);
};

/**
 * Safe document.documentElement operations
 * Fixes most common production build errors
 */
export const safeDocumentElementAdd = (...classNames: string[]): boolean => {
  try {
    if (typeof document !== 'undefined' && 
        document.documentElement && 
        document.documentElement.classList &&
        typeof document.documentElement.classList.add === 'function') {
      document.documentElement.classList.add(...classNames);
      return true;
    }
  } catch (error) {
    console.warn('SafeDocumentElementAdd failed:', error, 'Classes:', classNames);
  }
  return false;
};

export const safeDocumentElementRemove = (...classNames: string[]): boolean => {
  try {
    if (typeof document !== 'undefined' && 
        document.documentElement && 
        document.documentElement.classList &&
        typeof document.documentElement.classList.remove === 'function') {
      document.documentElement.classList.remove(...classNames);
      return true;
    }
  } catch (error) {
    console.warn('SafeDocumentElementRemove failed:', error, 'Classes:', classNames);
  }
  return false;
};

/**
 * Safe document.body operations
 */
export const safeDocumentBodyAdd = (...classNames: string[]): boolean => {
  try {
    if (typeof document !== 'undefined' && 
        document.body && 
        document.body.classList &&
        typeof document.body.classList.add === 'function') {
      document.body.classList.add(...classNames);
      return true;
    }
  } catch (error) {
    console.warn('SafeDocumentBodyAdd failed:', error, 'Classes:', classNames);
  }
  return false;
};

export const safeDocumentBodyRemove = (...classNames: string[]): boolean => {
  try {
    if (typeof document !== 'undefined' && 
        document.body && 
        document.body.classList &&
        typeof document.body.classList.remove === 'function') {
      document.body.classList.remove(...classNames);
      return true;
    }
  } catch (error) {
    console.warn('SafeDocumentBodyRemove failed:', error, 'Classes:', classNames);
  }
  return false;
};

/**
 * Delayed DOM operations for production builds
 * Stack Overflow solution: https://stackoverflow.com/questions/66605974/
 */
export const delayedSafeClassListAdd = (element: Element | HTMLElement | null | undefined, className: string, delay: number = 0): void => {
  setTimeout(() => {
    safeClassListAdd(element, className);
  }, delay);
};

/**
 * Wait for DOM ready state
 */
export const waitForDOMReady = (callback: () => void): void => {
  if (typeof document === 'undefined') {
    console.warn('Document not available, skipping DOM operation');
    return;
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

/**
 * Enhanced error boundary for DOM operations
 */
export const safeDOMOperation = (operation: () => void, errorMessage: string = 'DOM operation failed'): boolean => {
  try {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return false;
    }
    operation();
    return true;
  } catch (error) {
    console.warn(errorMessage, error);
    return false;
  }
};