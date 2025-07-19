# UX Implementation Plan: Bengali News Website Enhancement

## Phase 1: Critical UX Fixes (Priority: Immediate)

### 1. Mobile Navigation Enhancement

#### Current Issues:
- Basic header navigation without mobile optimization
- No hamburger menu for mobile devices
- Missing touch-friendly navigation

#### Implementation:
```typescript
// Enhanced Mobile Navigation Component
interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  categories: Category[];
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onToggle,
  categories
}) => {
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-black/50 fixed inset-0" onClick={onToggle} />
      <nav className="bg-white dark:bg-gray-900 fixed left-0 top-0 h-full w-80 shadow-xl">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-6"></h2>
          <ul className="space-y-4">
            {categories.map(category => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="block py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={onToggle}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};
```

### 2. Enhanced Search Experience

#### Current Issues:
- Basic search without autocomplete
- No search filters or advanced options
- Poor search results presentation

#### Implementation:
```typescript
// Advanced Search Component
interface SearchSuggestion {
  id: string;
  text: string;
  type: 'article' | 'category' | 'author';
  icon: React.ReactNode;
}

const EnhancedSearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/search/suggestions?q=${searchQuery}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Search suggestions error:', error);
      }
    }, 300),
    []
  );

  useEffect(() => {
    handleSearch(query);
  }, [query, handleSearch]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="খবর খুঁজুন..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <ul className="py-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                  onClick={() => {
                    setQuery(suggestion.text);
                    setIsOpen(false);
                    // Navigate to search results
                  }}
                >
                  {suggestion.icon}
                  <span>{suggestion.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

### 3. Content Discovery Enhancement

#### Current Issues:
- Basic article display without engagement features
- No related articles or suggestions
- Missing reading progress indicators

#### Implementation:
```typescript
// Enhanced Article Card with Discovery Features
interface EnhancedArticleCardProps {
  article: Article;
  showRelated?: boolean;
  trackReading?: boolean;
}

const EnhancedArticleCard: React.FC<EnhancedArticleCardProps> = ({
  article,
  showRelated = false,
  trackReading = false
}) => {
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleReadingProgress = useCallback(() => {
    if (!trackReading) return;
    
    const scrolled = window.scrollY;
    const viewHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const progress = (scrolled / (documentHeight - viewHeight)) * 100;
    
    setReadingProgress(Math.min(progress, 100));
  }, [trackReading]);

  useEffect(() => {
    if (trackReading) {
      window.addEventListener('scroll', handleReadingProgress);
      return () => window.removeEventListener('scroll', handleReadingProgress);
    }
  }, [trackReading, handleReadingProgress]);

  const handleBookmark = async () => {
    try {
      await fetch(`/api/articles/${article.id}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
      });
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      {trackReading && (
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-t-xl">
          <div
            className="h-full bg-blue-500 rounded-t-xl transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {article.category?.name}
            </Badge>
            <span className="text-sm text-gray-500">
              {formatRelativeTime(article.published_at)}
            </span>
          </div>
          
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100 text-gray-400'
            }`}
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
        
        <h3 className="text-xl font-semibold mb-3 leading-tight">
          <Link href={`/article/${article.slug}`} className="hover:text-blue-600">
            {article.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.view_count}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {calculateReadingTime(article.content)} মিনিট
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
```

## Phase 2: Performance & Accessibility (Priority: High)

### 1. Image Optimization & Lazy Loading

#### Implementation:
```typescript
// Optimized Image Component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const optimizedSrc = useMemo(() => {
    const baseUrl = src.startsWith('http') ? src : `/api/media/optimize?url=${encodeURIComponent(src)}`;
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', '80'); // Quality
    params.append('f', 'webp'); // Format
    
    return `${baseUrl}${params.toString() ? '&' + params.toString() : ''}`;
  }, [src, width, height]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {error && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      )}
    </div>
  );
};
```

### 2. Accessibility Enhancements

#### Implementation:
```typescript
// Accessible Skip Navigation
const SkipNavigation: React.FC = () => {
  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50">
      <a
        href="#main-content"
        className="bg-blue-600 text-white px-4 py-2 rounded-br-lg font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        মূল কন্টেন্টে যান
      </a>
    </div>
  );
};

// Enhanced Focus Management
const useFocusManagement = () => {
  const focusableElements = 'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select';
  
  const trapFocus = (element: HTMLElement) => {
    const focusableContent = element.querySelectorAll(focusableElements);
    const firstFocusableElement = focusableContent[0] as HTMLElement;
    const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  };

  return { trapFocus };
};
```

## Phase 3: Advanced Features (Priority: Medium)

### 1. Personalized Reading Experience

#### Implementation:
```typescript
// Reading Preferences Hook
interface ReadingPreferences {
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'default' | 'serif' | 'sans-serif';
  theme: 'light' | 'dark' | 'auto';
  reducedMotion: boolean;
  highContrast: boolean;
}

const useReadingPreferences = () => {
  const [preferences, setPreferences] = useState<ReadingPreferences>(() => {
    const saved = localStorage.getItem('reading-preferences');
    return saved ? JSON.parse(saved) : {
      fontSize: 'medium',
      fontFamily: 'default',
      theme: 'auto',
      reducedMotion: false,
      highContrast: false
    };
  });

  const updatePreferences = (updates: Partial<ReadingPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    localStorage.setItem('reading-preferences', JSON.stringify(newPreferences));
    
    // Apply CSS custom properties
    document.documentElement.style.setProperty('--font-size', getFontSize(newPreferences.fontSize));
    document.documentElement.style.setProperty('--font-family', getFontFamily(newPreferences.fontFamily));
    
    if (newPreferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  return { preferences, updatePreferences };
};

// Reading Preferences Panel
const ReadingPreferencesPanel: React.FC = () => {
  const { preferences, updatePreferences } = useReadingPreferences();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">পড়ার সেটিংস</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">ফন্ট সাইজ</label>
          <div className="flex gap-2">
            {['small', 'medium', 'large'].map(size => (
              <button
                key={size}
                onClick={() => updatePreferences({ fontSize: size as any })}
                className={`px-3 py-1 rounded text-sm ${
                  preferences.fontSize === size
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {size === 'small' ? 'ছোট' : size === 'medium' ? 'মাঝারি' : 'বড়'}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.highContrast}
              onChange={(e) => updatePreferences({ highContrast: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">উচ্চ কন্ট্রাস্ট</span>
          </label>
        </div>
        
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.reducedMotion}
              onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">অ্যানিমেশন কমান</span>
          </label>
        </div>
      </div>
    </div>
  );
};
```

### 2. Advanced Analytics Integration

#### Implementation:
```typescript
// User Behavior Tracking
interface UserBehaviorEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
}

const useAnalytics = () => {
  const trackEvent = useCallback((event: string, properties: Record<string, any> = {}) => {
    const eventData: UserBehaviorEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId: localStorage.getItem('user-id') || undefined
    };

    // Send to analytics endpoint
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    }).catch(console.error);
  }, []);

  const trackPageView = useCallback((path: string) => {
    trackEvent('page_view', { path });
  }, [trackEvent]);

  const trackArticleRead = useCallback((articleId: number, readTime: number) => {
    trackEvent('article_read', { articleId, readTime });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, results: number) => {
    trackEvent('search', { query, results });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackArticleRead,
    trackSearch
  };
};
```

## Implementation Timeline

### Week 1: Mobile & Navigation
- [ ] Mobile hamburger menu
- [ ] Touch-friendly navigation
- [ ] Responsive layout fixes

### Week 2: Search & Discovery
- [ ] Enhanced search with autocomplete
- [ ] Content discovery features
- [ ] Related articles system

### Week 3: Performance & Accessibility
- [ ] Image optimization
- [ ] Lazy loading implementation
- [ ] Accessibility compliance

### Week 4: Advanced Features
- [ ] Reading preferences
- [ ] User behavior tracking
- [ ] Personalization engine

## Success Metrics

### User Experience
- Mobile bounce rate: < 25%
- Page load time: < 2 seconds
- Accessibility score: WCAG 2.1 AA

### Engagement
- Session duration: > 4 minutes
- Pages per session: > 3
- Return visitor rate: > 45%

### Performance
- Core Web Vitals: All green
- Lighthouse score: > 90
- Mobile-friendly test: Pass

This implementation plan will transform the Bengali news website into a world-class digital platform that rivals top international news sites while maintaining its unique cultural identity and Bengali language focus.