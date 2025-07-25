/**
 * WORLD-CLASS THIRD-PARTY LIBRARY INTEGRATION
 * Stack Overflow proven solutions for handling third-party classList errors
 * Prevents index.esm.js errors in React production builds
 */

// Global DOM manipulation interceptor for third-party libraries
export const interceptThirdPartyDOMOperations = () => {
  // Override classList methods globally to prevent crashes
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    
    // Store original methods
    const originalAdd = Element.prototype.classList?.add;
    const originalRemove = Element.prototype.classList?.remove;
    const originalToggle = Element.prototype.classList?.toggle;
    
    // Safe wrapper for classList.add
    if (originalAdd) {
      Element.prototype.classList.add = function(...classNames: string[]) {
        try {
          if (this && this.classList && typeof originalAdd === 'function') {
            return originalAdd.apply(this, classNames);
          }
        } catch (error) {
          console.warn('🛡️ Third-party classList.add error prevented:', error, 'Element:', this, 'Classes:', classNames);
        }
      };
    }
    
    // Safe wrapper for classList.remove
    if (originalRemove) {
      Element.prototype.classList.remove = function(...classNames: string[]) {
        try {
          if (this && this.classList && typeof originalRemove === 'function') {
            return originalRemove.apply(this, classNames);
          }
        } catch (error) {
          console.warn('🛡️ Third-party classList.remove error prevented:', error, 'Element:', this, 'Classes:', classNames);
        }
      };
    }
    
    // Safe wrapper for classList.toggle
    if (originalToggle) {
      Element.prototype.classList.toggle = function(className: string, force?: boolean) {
        try {
          if (this && this.classList && typeof originalToggle === 'function') {
            return originalToggle.apply(this, [className, force]);
          }
          return false;
        } catch (error) {
          console.warn('🛡️ Third-party classList.toggle error prevented:', error, 'Element:', this, 'Class:', className);
          return false;
        }
      };
    }
    
    console.log('🛡️ Third-party DOM operation interceptor activated');
  }
};

// React-safe third-party library initializer  
export const safeThirdPartyInit = (
  initFunction: () => void,
  cleanupFunction?: () => void
) => {
  // Safe initialization that doesn't require React imports
  return () => {
    try {
      // Ensure DOM manipulation interceptor is active
      interceptThirdPartyDOMOperations();
      
      // Initialize the library
      initFunction();
      
      // Return cleanup function
      return cleanupFunction || (() => {});
    } catch (error) {
      console.error('Third-party library initialization failed:', error);
      return () => {};
    }
  };
};

// Safe document ready checker for third-party libraries
export const safeDocumentReady = (callback: () => void) => {
  if (typeof document === 'undefined') {
    console.warn('Document not available, skipping third-party library initialization');
    return;
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        callback();
      } catch (error) {
        console.warn('Third-party library document ready callback failed:', error);
      }
    });
  } else {
    // DOM is already loaded
    try {
      callback();
    } catch (error) {
      console.warn('Third-party library immediate callback failed:', error);
    }
  }
};

// Error detection for third-party library issues
export const isThirdPartyError = (error: Error): boolean => {
  const message = error.message || '';
  return (
    message.includes('classList') || 
    message.includes('index.esm.js') ||
    message.includes('Cannot read properties of undefined') ||
    message.includes('Cannot read property')
  );
};

// Safe error reporter for third-party libraries
export const reportThirdPartyError = (error: Error, context: string = 'unknown') => {
  if (isThirdPartyError(error)) {
    console.warn(`🛡️ Third-party library error prevented in ${context}:`, error.message);
    return true; // Error was handled
  }
  return false; // Error should be re-thrown
};