import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Clock, TrendingUp, Filter, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'article' | 'category' | 'tag';
  category?: string;
  url: string;
}

interface SearchHistory {
  query: string;
  timestamp: number;
}

interface TrendingSearch {
  query: string;
  count: number;
}

interface EnhancedSearchSystemProps {
  placeholder?: string;
  showHistory?: boolean;
  showTrending?: boolean;
  showFilters?: boolean;
  className?: string;
}

export const EnhancedSearchSystem: React.FC<EnhancedSearchSystemProps> = ({
  placeholder = "খবর খুঁজুন...",
  showHistory = true,
  showTrending = true,
  showFilters = true,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Array<{id: number; name: string; slug: string}>>([]);
  
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { getCategories } = await import('../lib/supabase-api-direct');
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch trending searches
  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        // Mock trending searches - in a real app, this would come from analytics
        const mockTrending = [
          { query: 'নির্বাচন', count: 1250 },
          { query: 'ক্রিকেট', count: 980 },
          { query: 'অর্থনীতি', count: 760 },
          { query: 'শিক্ষা', count: 650 },
          { query: 'আবহাওয়া', count: 540 },
        ];
        setTrendingSearches(mockTrending);
      } catch (error) {
        console.error('Error fetching trending searches:', error);
      }
    };
    fetchTrendingSearches();
  }, []);

  // Fetch search suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        
        // Convert articles to suggestions
        const articleSuggestions: SearchSuggestion[] = data.map((article: any) => ({
          id: article.id.toString(),
          title: article.title,
          type: 'article' as const,
          category: article.category?.name,
          url: `/article/${article.slug}`
        }));

        // Add matching categories
        const matchingCategories = categories.filter(cat => 
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        const categorySuggestions: SearchSuggestion[] = matchingCategories.map(cat => ({
          id: `category-${cat.id}`,
          title: cat.name,
          type: 'category' as const,
          url: `/category/${cat.slug}`
        }));

        setSuggestions([...categorySuggestions, ...articleSuggestions]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [categories]);

  // Debounced search suggestions
  useEffect(() => {
    if (debouncedQuery && isOpen) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, isOpen, fetchSuggestions]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to search history
    const newHistory = [
      { query: searchQuery, timestamp: Date.now() },
      ...searchHistory.filter(h => h.query !== searchQuery)
    ].slice(0, 10);

    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Navigate to search page
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    
    setLocation(`/search?${params.toString()}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setLocation(suggestion.url);
    setIsOpen(false);
    setQuery('');
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    handleSearch(historyQuery);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    searchRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      searchRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="search"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-12 py-2 bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
              autoComplete="off"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearQuery}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent/10"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-96 p-0 bg-background border border-border shadow-lg"
          align="start"
          sideOffset={4}
        >
          <Command className="w-full">
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <CommandGroup heading="সাজেশন">
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.id}
                    value={suggestion.title}
                    onSelect={() => handleSuggestionClick(suggestion)}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {suggestion.type === 'article' && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                        {suggestion.type === 'category' && (
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {suggestion.title}
                        </p>
                        {suggestion.category && (
                          <p className="text-xs text-muted-foreground">
                            {suggestion.category}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Search History */}
            {showHistory && searchHistory.length > 0 && !query && (
              <>
                <Separator />
                <CommandGroup heading="সাম্প্রতিক অনুসন্ধান">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs text-muted-foreground">সাম্প্রতিক অনুসন্ধান</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="h-6 text-xs text-muted-foreground hover:text-foreground"
                    >
                      সব মুছুন
                    </Button>
                  </div>
                  {searchHistory.slice(0, 5).map((history, index) => (
                    <CommandItem
                      key={index}
                      value={history.query}
                      onSelect={() => handleHistoryClick(history.query)}
                      className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-accent/10 transition-colors"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{history.query}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Trending Searches */}
            {showTrending && trendingSearches.length > 0 && !query && (
              <>
                <Separator />
                <CommandGroup heading="জনপ্রিয় অনুসন্ধান">
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="text-xs text-muted-foreground">জনপ্রিয় অনুসন্ধান</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.slice(0, 5).map((trending, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-accent/20 transition-colors"
                          onClick={() => handleHistoryClick(trending.query)}
                        >
                          {trending.query}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CommandGroup>
              </>
            )}

            {/* Empty State */}
            {query && suggestions.length === 0 && !isLoading && (
              <CommandEmpty>
                <div className="text-center py-4">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">কোনো ফলাফল পাওয়া যায়নি</p>
                </div>
              </CommandEmpty>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">অনুসন্ধান করা হচ্ছে...</span>
                </div>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EnhancedSearchSystem;