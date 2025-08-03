import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Filter, Clock, TrendingUp, Eye, Star } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';

interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
  image_url: string;
  published_at: string;
  category_name: string;
  search_rank: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface SearchHistory {
  id: number;
  search_query: string;
  search_results_count: number;
  search_timestamp: string;
}

export const AdvancedBengaliSearch = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    fetchCategories();
    if (user) {
      fetchSearchHistory();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { getCategories } = await import('../lib/supabase-api-direct');
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      if (!user?.id) return;
      const { getUserSearchHistory } = await import('../lib/supabase-api-direct');
      const data = await getUserSearchHistory(user.id, 5);
      setSearchHistory(data);
    } catch (err) {
      console.error('Error fetching search history:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const { searchArticles } = await import('../lib/supabase-api-direct');
      const data = await searchArticles(query, selectedCategory, 20);
      
      // Transform articles to search results format
      const transformedResults: SearchResult[] = data.map((article: any) => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt || '',
        image_url: article.image_url || article.imageUrl || '',
        published_at: article.published_at || article.publishedAt || '',
        category_name: article.category?.name || article.categories?.name || 'সাধারণ',
        search_rank: 1 // Default rank for now
      }));
      
      setSearchResults(transformedResults);
      
      // Save search to history if user is logged in
      if (user) {
        await saveSearchToHistory(query, transformedResults.length);
        fetchSearchHistory();
      }
    } catch (err) {
      setError('সার্চ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSearchToHistory = async (searchQuery: string, resultCount: number) => {
    try {
      if (!user?.id) return;
      const { saveUserSearchHistory } = await import('../lib/supabase-api-direct');
      await saveUserSearchHistory(user.id, searchQuery, resultCount);
    } catch (err) {
      console.error('Error saving search history:', err);
    }
  };

  const handleHistoryClick = (historyItem: SearchHistory) => {
    setQuery(historyItem.search_query);
    setSelectedCategory('');
    // Trigger search
    setTimeout(() => {
      const form = document.getElementById('search-form') as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  const handleResultClick = (result: SearchResult) => {
    // Track interaction if user is logged in
    if (user) {
      trackInteraction(result.id, 'view');
    }
    window.open(`/article/${result.id}`, '_blank');
  };

  const trackInteraction = async (articleId: number, interactionType: string) => {
    try {
      if (!user?.id) return;
      const { recordUserInteraction } = await import('../lib/supabase-api-direct');
      await recordUserInteraction(user.id, articleId, interactionType, {
        source: 'advanced_search',
        search_query: query,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error tracking interaction:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRelevanceColor = (rank: number) => {
    if (rank >= 0.8) return 'bg-green-100 text-green-800';
    if (rank >= 0.6) return 'bg-blue-100 text-blue-800';
    if (rank >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Search className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">উন্নত বাংলা সার্চ</h2>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>খবর অনুসন্ধান</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form id="search-form" onSubmit={handleSearch} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="এখানে আপনার খোঁজার বিষয় লিখুন..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="সব বিভাগ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">সব বিভাগ</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} className="px-6">
                {loading ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    খোঁজা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    খুঁজুন
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search History */}
      {user && searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>সাম্প্রতিক অনুসন্ধান</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item) => (
                <Badge 
                  key={item.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleHistoryClick(item)}
                >
                  {item.search_query}
                  <span className="ml-1 text-xs text-gray-500">
                    ({item.search_results_count})
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <Skeleton className="w-24 h-24 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search Results */}
      {hasSearched && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>অনুসন্ধানের ফলাফল</span>
              </div>
              <Badge variant="secondary">
                {searchResults.length} টি ফলাফল
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>কোন ফলাফল পাওয়া যায়নি</p>
                <p className="text-sm mt-1">
                  অন্য কোন শব্দ দিয়ে চেষ্টা করুন
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div 
                    key={result.id}
                    className="flex space-x-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <img 
                      src={result.image_url || '/placeholder-news.jpg'} 
                      alt={result.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          className={`${getRelevanceColor(result.search_rank)} text-xs`}
                        >
                          {Math.round(result.search_rank * 100)}% প্রাসঙ্গিক
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.category_name}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                        {result.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {result.excerpt}
                      </p>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(result.published_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>সার্চ টিপস</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🔍 সার্চ করার উপায়:</h4>
              <ul className="space-y-1">
                <li>• সঠিক বানান ব্যবহার করুন</li>
                <li>• একাধিক শব্দ ব্যবহার করুন</li>
                <li>• বিষয়ভিত্তিক ফিল্টার ব্যবহার করুন</li>
                <li>• সাধারণ শব্দ ব্যবহার করুন</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">✨ বৈশিষ্ট্য:</h4>
              <ul className="space-y-1">
                <li>• স্মার্ট বাংলা টেক্সট অনুসন্ধান</li>
                <li>• বানান সংশোধন সাপোর্ট</li>
                <li>• প্রাসঙ্গিকতা অনুযায়ী র‍্যাঙ্কিং</li>
                <li>• সার্চ ইতিহাস সংরক্ষণ</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedBengaliSearch;