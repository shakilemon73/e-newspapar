import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import SEO from '@/components/SEO';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string;
  imageUrl?: string;
  published_at?: string;
  publishedAt?: string;
  view_count?: number;
  category?: Category;
  categories?: Category;
}

const Search = () => {
  const [location] = useLocation();
  
  // Better URL parsing for wouter
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';
  
  // Debug logging
  console.log('Search page - location:', location);
  console.log('Search page - window.location.search:', window.location.search);
  console.log('Search page - query:', query);
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 10;

  useEffect(() => {
    const searchArticles = async () => {
      if (!query.trim()) {
        setArticles([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const { searchArticles } = await import('../lib/supabase-api-direct');
        const data = await searchArticles(query, undefined, limit);
        setArticles(data as any);
        setHasMore(data.length === limit);
        setPage(1);
        setError(null);
      } catch (err) {
        setError('অনুসন্ধান করতে সমস্যা হয়েছে');
        console.error('Error searching articles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    searchArticles();
    // Reset to the top of the page when search query changes
    window.scrollTo(0, 0);
  }, [query]);

  const loadMoreArticles = async () => {
    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const offset = page * limit;
      
      const { searchArticles } = await import('../lib/supabase-api-direct');
      const newArticles = await searchArticles(query, undefined, limit);
      
      if (newArticles.length > 0) {
        setArticles([...articles, ...newArticles as any]);
        setPage(nextPage);
        setHasMore(newArticles.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more search results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={query ? `"${query}" অনুসন্ধানের ফলাফল - Bengali News` : 'অনুসন্ধান - Bengali News'}
        description={query ? `"${query}" সম্পর্কিত সংবাদ খুঁজুন Bengali News-এ। ${articles.length}টি ফলাফল পাওয়া গেছে।` : 'Bengali News-এ সংবাদ অনুসন্ধান করুন। সর্বশেষ খবর, রাজনীতি, খেলা, বিনোদন এবং আরো অনেক কিছু।'}
        image="/og-image.svg"
        url={`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`}
        type="website"
        keywords={`search, অনুসন্ধান, ${query}, Bengali news, বাংলা সংবাদ`}
        tags={["search", "অনুসন্ধান", query || "news", "Bangladesh"]}
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 font-hind">
          {query 
            ? `"${query}" এর ফলাফল (${articles.length})`
            : 'অনুসন্ধান করুন'
          }
        </h1>
        
        {!query && (
          <div className="bg-white rounded shadow-sm p-8 text-center">
            <p className="text-lg mb-4">অনুসন্ধান করতে উপরের সার্চ বাক্সে আপনার কীওয়ার্ড লিখুন</p>
            <Link href="/" className="text-accent hover:underline">হোমপেজে ফিরে যান</Link>
          </div>
        )}
        
        {query && isLoading && articles.length === 0 && (
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded shadow-sm p-4 mb-4 flex">
                <div className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded mr-4"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {query && !isLoading && articles.length === 0 && (
          <div className="bg-white rounded shadow-sm p-8 text-center">
            <p className="text-lg mb-4">"{query}" এর জন্য কোন ফলাফল পাওয়া যায়নি</p>
            <Link href="/" className="text-accent hover:underline">হোমপেজে ফিরে যান</Link>
          </div>
        )}
        
        {query && articles.length > 0 && (
          <>
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="bg-white rounded shadow-sm p-4 hover:shadow-md transition flex flex-col md:flex-row">
                  <div className="flex-shrink-0 w-full md:w-32 h-48 md:h-24 mb-4 md:mb-0 md:mr-4">
                    <Link href={`/article/${article.slug}`}>
                      <img 
                        src={article.image_url || article.imageUrl || '/placeholder-image.jpg'} 
                        alt={article.title} 
                        className="w-full h-full object-cover rounded hover:opacity-90 transition cursor-pointer"
                      />
                    </Link>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <Link href={`/category/${article.category?.slug || article.categories?.slug || 'general'}`}>
                        <span className="text-xs bg-light px-2 py-1 rounded mr-2 hover:bg-accent hover:text-white transition cursor-pointer">
                          {article.category?.name || article.categories?.name || 'সাধারণ'}
                        </span>
                      </Link>
                      <span className="text-xs text-gray-500">{getRelativeTimeInBengali(article.published_at || article.publishedAt || new Date().toISOString())}</span>
                    </div>
                    <Link href={`/article/${article.slug}`}>
                      <h3 className="font-bold text-lg mb-2 font-hind hover:text-accent transition cursor-pointer">{article.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{article.excerpt}</p>
                    <Link href={`/article/${article.slug}`}>
                      <span className="text-accent text-sm hover:underline cursor-pointer">বিস্তারিত পড়ুন</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-8 text-center">
                <button 
                  onClick={loadMoreArticles}
                  disabled={isLoading}
                  className="bg-accent hover:bg-opacity-90 text-white px-6 py-2 rounded font-medium transition disabled:opacity-50"
                >
                  {isLoading ? 'লোড হচ্ছে...' : 'আরও ফলাফল দেখুন'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Search;
