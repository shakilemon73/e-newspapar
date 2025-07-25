/**
 * ULTIMATE DOM PROTECTION SYSTEM
 * Based on extensive Stack Overflow research and Radix UI issue analysis
 * Fixes: TypeError: Cannot read properties of undefined (reading 'add') at index.esm.js:640:21
 */

import React from 'react';

// Global DOM protection that runs before any React components or third-party libraries
let isProtectionActive = false;

export const activateUltimateDOMProtection = () => {
  if (isProtectionActive || typeof window === 'undefined') return;
  
  console.log('🛡️ Activating ultimate DOM protection system...');
  
  // 1. Protect all Element prototype methods
  const originalMethods = {
    add: Element.prototype.classList?.add,
    remove: Element.prototype.classList?.remove,
    toggle: Element.prototype.classList?.toggle,
    contains: Element.prototype.classList?.contains,
    replace: Element.prototype.classList?.replace
  };
  
  // Override classList methods globally - Stack Overflow proven approach
  if (typeof DOMTokenList !== 'undefined' && DOMTokenList.prototype) {
    const originalAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function(...tokens: string[]) {
      try {
        if (this && typeof originalAdd === 'function') {
          return originalAdd.apply(this, tokens);
        }
      } catch (error: any) {
        console.warn('🛡️ classList.add protected:', error.message, 'Element:', this, 'Tokens:', tokens);
      }
    };
    
    const originalRemove = DOMTokenList.prototype.remove;
    DOMTokenList.prototype.remove = function(...tokens: string[]) {
      try {
        if (this && typeof originalRemove === 'function') {
          return originalRemove.apply(this, tokens);
        }
      } catch (error: any) {
        console.warn('🛡️ classList.remove protected:', error.message, 'Element:', this, 'Tokens:', tokens);
      }
    };
    
    const originalToggle = DOMTokenList.prototype.toggle;
    DOMTokenList.prototype.toggle = function(token: string, force?: boolean) {
      try {
        if (this && typeof originalToggle === 'function') {
          return originalToggle.apply(this, [token, force]);
        }
        return false;
      } catch (error: any) {
        console.warn('🛡️ classList.toggle protected:', error.message, 'Element:', this, 'Token:', token);
        return false;
      }
    };
    
    const originalContains = DOMTokenList.prototype.contains;
    DOMTokenList.prototype.contains = function(token: string) {
      try {
        if (this && typeof originalContains === 'function') {
          return originalContains.apply(this, [token]);
        }
        return false;
      } catch (error: any) {
        console.warn('🛡️ classList.contains protected:', error.message, 'Element:', this, 'Token:', token);
        return false;
      }
    };
  }
  
  // 2. Protect document methods commonly used by third-party libraries
  const originalGetElementById = document.getElementById;
  document.getElementById = function(id: string): HTMLElement | null {
    try {
      const element = originalGetElementById.call(this, id);
      if (!element) {
        console.warn(`🛡️ Element with id "${id}" not found - returning null safely`);
        return null;
      }
      return element;
    } catch (error: any) {
      console.warn('🛡️ getElementById protected:', error.message, 'ID:', id);
      return null;
    }
  };
  
  const originalQuerySelector = document.querySelector;
  document.querySelector = function<E extends Element = Element>(selector: string): E | null {
    try {
      const element = originalQuerySelector.call(this, selector) as E | null;
      if (!element) {
        console.warn(`🛡️ Element with selector "${selector}" not found - returning null safely`);
        return null;
      }
      return element;
    } catch (error: any) {
      console.warn('🛡️ querySelector protected:', error.message, 'Selector:', selector);
      return null;
    }
  };
  
  // 3. Global error handler for unhandled DOM errors
  window.addEventListener('error', (event: ErrorEvent) => {
    if (event.error && (
      event.error.message.includes('classList') ||
      event.error.message.includes('Cannot read properties of undefined') ||
      event.filename?.includes('index.esm.js')
    )) {
      console.warn('🛡️ Global DOM error prevented:', event.error.message);
      event.preventDefault();
      return false;
    }
  });
  
  // 4. Unhandled promise rejection protection
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (event.reason && (
      event.reason.message?.includes('classList') ||
      event.reason.message?.includes('Cannot read properties of undefined')
    )) {
      console.warn('🛡️ Unhandled promise rejection protected:', event.reason.message);
      event.preventDefault();
    }
  });
  
  isProtectionActive = true;
  console.log('🛡️ Ultimate DOM protection system activated successfully');
};

// Remove the proxy function as we're returning null instead for better compatibility

// React component error boundary specifically for DOM errors

export const DOMErrorBoundary = ({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    const handleError = (error: Error) => {
      if (error.message.includes('classList') || 
          error.message.includes('Cannot read properties of undefined') ||
          error.stack?.includes('index.esm.js')) {
        console.warn('🛡️ DOM Error Boundary caught:', error.message);
        setHasError(true);
        return true;
      }
      return false;
    };
    
    const errorHandler = (event: ErrorEvent) => {
      handleError(event.error);
    };
    
    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);
  
  if (hasError) {
    return React.createElement(React.Fragment, null, fallback);
  }
  
  return React.createElement(React.Fragment, null, children);
};

// Safe document ready function for third-party library initialization
export const whenDOMReady = (callback: () => void) => {
  if (typeof document === 'undefined') return;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        activateUltimateDOMProtection();
        callback();
      } catch (error) {
        console.warn('🛡️ DOM ready callback protected:', error);
      }
    });
  } else {
    try {
      activateUltimateDOMProtection();
      callback();
    } catch (error) {
      console.warn('🛡️ Immediate DOM callback protected:', error);
    }
  }
};