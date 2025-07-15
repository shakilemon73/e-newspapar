/**
 * UX Enhancement System - Automatic Application of Design Principles
 * Based on Don Norman, Steve Krug, Luke Wroblewski, and other UX experts
 */

export class UXEnhancer {
  private static instance: UXEnhancer;
  private enhancedElements = new WeakSet();
  private observer: MutationObserver | null = null;

  constructor() {
    this.initializeEnhancer();
  }

  static getInstance(): UXEnhancer {
    if (!UXEnhancer.instance) {
      UXEnhancer.instance = new UXEnhancer();
    }
    return UXEnhancer.instance;
  }

  private initializeEnhancer() {
    // Start monitoring DOM changes
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.enhanceElement(node as Element);
            }
          });
        }
      });
    });

    // Start observing
    if (document.body) {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Initial enhancement
    this.enhanceAllElements();
  }

  private enhanceAllElements() {
    // Wait for DOM to be ready
    const enhance = () => {
      const elements = document.querySelectorAll('*');
      elements.forEach((element) => this.enhanceElement(element));
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', enhance);
    } else {
      enhance();
    }
  }

  private enhanceElement(element: Element) {
    if (this.enhancedElements.has(element)) {
      return;
    }

    // Apply Don Norman's Design Principles
    this.applyDiscoverability(element);
    this.applyFeedback(element);
    this.applyConstraints(element);
    this.applyMapping(element);
    this.applySignifiers(element);

    // Apply Steve Krug's Usability Principles
    this.applyClarity(element);
    this.applyScannability(element);
    this.applyNavigation(element);
    this.applyConventions(element);

    // Apply Luke Wroblewski's Mobile-First Principles
    this.applyMobileFirst(element);
    this.applyTouchTargets(element);
    this.applyFormSimplicity(element);

    // Apply Emotional Design Principles
    this.applyEmotionalDesign(element);
    this.applyMicroInteractions(element);

    // Apply Inclusive Design Principles
    this.applyAccessibility(element);
    this.applyKeyboardSupport(element);

    // Apply Psychology Principles
    this.applyAttentionGuidance(element);
    this.applyMemorySupport(element);
    this.applySocialProof(element);

    // Mark as enhanced
    this.enhancedElements.add(element);
  }

  // Don Norman's Design Principles
  private applyDiscoverability(element: Element) {
    if (element.matches('button, [role="button"], input[type="submit"], input[type="button"]')) {
      element.classList.add('cursor-pointer');
      if (!element.hasAttribute('aria-label') && !element.textContent?.trim()) {
        element.setAttribute('aria-label', 'Button');
      }
    }

    if (element.matches('a[href]')) {
      element.classList.add('cursor-pointer');
      if (!element.hasAttribute('aria-label') && !element.textContent?.trim()) {
        element.setAttribute('aria-label', 'Link');
      }
    }

    if (element.matches('input, textarea, select')) {
      element.classList.add('focus:ring-2', 'focus:ring-blue-500', 'focus:border-blue-500');
    }
  }

  private applyFeedback(element: Element) {
    if (element.matches('button, [role="button"]')) {
      element.classList.add('transition-all', 'duration-200');
      element.addEventListener('click', () => {
        element.classList.add('scale-95');
        setTimeout(() => element.classList.remove('scale-95'), 100);
      });
    }

    if (element.matches('form')) {
      const inputs = element.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        input.addEventListener('invalid', () => {
          input.classList.add('border-red-500', 'bg-red-50');
        });
        input.addEventListener('input', () => {
          input.classList.remove('border-red-500', 'bg-red-50');
        });
      });
    }
  }

  private applyConstraints(element: Element) {
    if (element.matches('input[type="email"]')) {
      element.setAttribute('pattern', '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$');
    }

    if (element.matches('input[type="tel"]')) {
      element.setAttribute('pattern', '[0-9]{3}-[0-9]{3}-[0-9]{4}');
    }
  }

  private applyMapping(element: Element) {
    if (element.matches('form')) {
      const labels = element.querySelectorAll('label');
      labels.forEach((label) => {
        if (label.hasAttribute('for')) {
          const input = element.querySelector(`#${label.getAttribute('for')}`);
          if (input) {
            label.style.cursor = 'pointer';
          }
        }
      });
    }
  }

  private applySignifiers(element: Element) {
    if (element.matches('input[required]')) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label && !label.textContent?.includes('*')) {
        label.innerHTML += ' <span class="text-red-500">*</span>';
      }
    }

    if (element.matches('[data-loading]')) {
      element.classList.add('opacity-50', 'pointer-events-none');
    }
  }

  // Steve Krug's Usability Principles
  private applyClarity(element: Element) {
    if (element.matches('p, span, div')) {
      const text = element.textContent?.trim();
      if (text && text.split(' ').length > 15) {
        element.classList.add('text-sm', 'leading-relaxed');
      }
    }
  }

  private applyScannability(element: Element) {
    if (element.matches('h1, h2, h3, h4, h5, h6')) {
      element.classList.add('font-bold', 'text-gray-900', 'dark:text-white');
    }

    if (element.matches('ul, ol')) {
      element.classList.add('space-y-2');
    }
  }

  private applyNavigation(element: Element) {
    if (element.matches('nav')) {
      element.setAttribute('role', 'navigation');
      const currentPage = element.querySelector('.active, [aria-current="page"]');
      if (currentPage) {
        currentPage.setAttribute('aria-current', 'page');
      }
    }
  }

  private applyConventions(element: Element) {
    if (element.matches('button[type="submit"]')) {
      element.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    }

    if (element.matches('button[type="button"]')) {
      element.classList.add('border', 'border-gray-300', 'hover:bg-gray-50');
    }
  }

  // Luke Wroblewski's Mobile-First Principles
  private applyMobileFirst(element: Element) {
    if (element.matches('table')) {
      element.classList.add('overflow-x-auto');
      element.style.minWidth = '100%';
    }
  }

  private applyTouchTargets(element: Element) {
    if (element.matches('button, [role="button"], a[href], input[type="submit"], input[type="button"]')) {
      element.classList.add('min-h-[44px]', 'min-w-[44px]', 'px-4', 'py-2');
    }
  }

  private applyFormSimplicity(element: Element) {
    if (element.matches('form')) {
      element.classList.add('space-y-4');
      const inputs = element.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        input.classList.add('w-full', 'px-3', 'py-2', 'border', 'rounded-md');
      });
    }
  }

  // Emotional Design Principles
  private applyEmotionalDesign(element: Element) {
    if (element.matches('button')) {
      element.classList.add('rounded-md', 'font-medium', 'shadow-sm');
    }

    if (element.matches('.success')) {
      element.classList.add('bg-green-50', 'text-green-700', 'border-green-200');
    }

    if (element.matches('.error')) {
      element.classList.add('bg-red-50', 'text-red-700', 'border-red-200');
    }

    if (element.matches('.warning')) {
      element.classList.add('bg-yellow-50', 'text-yellow-700', 'border-yellow-200');
    }
  }

  private applyMicroInteractions(element: Element) {
    if (element.matches('button, [role="button"], a[href]')) {
      element.classList.add('hover:shadow-md', 'transition-shadow', 'duration-200');
    }

    if (element.matches('input, textarea')) {
      element.classList.add('focus:shadow-sm', 'transition-shadow', 'duration-200');
    }
  }

  // Inclusive Design Principles
  private applyAccessibility(element: Element) {
    if (element.matches('img') && !element.hasAttribute('alt')) {
      element.setAttribute('alt', '');
    }

    if (element.matches('button, [role="button"]') && !element.hasAttribute('aria-label') && !element.textContent?.trim()) {
      element.setAttribute('aria-label', 'Button');
    }

    // Ensure color contrast
    if (element.matches('.text-gray-400')) {
      element.classList.remove('text-gray-400');
      element.classList.add('text-gray-600');
    }
  }

  private applyKeyboardSupport(element: Element) {
    if (element.matches('div[role="button"], span[role="button"]')) {
      element.setAttribute('tabindex', '0');
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (element as HTMLElement).click();
        }
      });
    }
  }

  // Psychology Principles
  private applyAttentionGuidance(element: Element) {
    if (element.matches('h1')) {
      element.classList.add('text-3xl', 'font-bold', 'mb-4');
    }

    if (element.matches('h2')) {
      element.classList.add('text-2xl', 'font-semibold', 'mb-3');
    }

    if (element.matches('h3')) {
      element.classList.add('text-xl', 'font-medium', 'mb-2');
    }
  }

  private applyMemorySupport(element: Element) {
    if (element.matches('form')) {
      const inputs = element.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
      inputs.forEach((input) => {
        input.setAttribute('autocomplete', 'on');
      });
    }
  }

  private applySocialProof(element: Element) {
    if (element.matches('[data-count]')) {
      const count = element.getAttribute('data-count');
      if (count && parseInt(count) > 0) {
        element.classList.add('relative');
        const badge = document.createElement('span');
        badge.className = 'absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full px-2 py-1';
        badge.textContent = count;
        element.appendChild(badge);
      }
    }
  }

  // Public method to manually enhance an element
  public enhance(element: Element) {
    this.enhanceElement(element);
  }

  // Public method to stop the enhancer
  public stop() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // Public method to start the enhancer
  public start() {
    if (!this.observer) {
      this.initializeEnhancer();
    }
  }
}

// Auto-start the enhancer when the module loads
export const uxEnhancer = UXEnhancer.getInstance();

// Export for manual use
export default UXEnhancer;