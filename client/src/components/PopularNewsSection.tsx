import { useState, useEffect } from 'react';
import { Link } from 'wouter';
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
  excerpt: string;
  publishedAt: string;
  category: Category;
  viewCount: number;
}

type TimeRange = 'daily' | 'weekly' | 'monthly';

export const PopularNewsSection = () => {
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularArticles = async () => {
      try {
        setIsLoading(true);
        // Add timestamp to prevent caching and get real-time data
        const timestamp = new Date().getTime();
        const { getPopularArticles } = await import('../lib/supabase-api-direct');
        const data = await getPopularArticles(5);
        console.log(`[PopularNews] Fetched ${data.length} popular articles for ${timeRange}`);
        
        // Transform data to match Article interface
        const transformedData = data.map((article: any) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          publishedAt: article.published_at || article.publishedAt,
          category: article.categories?.[0] || article.category || { id: 0, name: 'সাধারণ', slug: 'general' },
          viewCount: article.view_count || article.viewCount || 0
        }));
        
        setPopularArticles(transformedData);
        setError(null);
      } catch (err) {
        setError('জনপ্রিয় সংবাদ লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching popular articles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularArticles();
    
    // Auto-refresh every 30 seconds to show updated view counts
    const interval = setInterval(fetchPopularArticles, 30000);
    
    return () => clearInterval(interval);
  }, [timeRange]);

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded shadow-sm p-4 mb-8">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h3 className="text-lg font-bold text-foreground">সর্বাধিক পঠিত</h3>
          <div className="flex gap-2">
            <div className="w-12 h-8 bg-muted rounded animate-pulse"></div>
            <div className="w-20 h-8 bg-muted rounded animate-pulse"></div>
            <div className="w-16 h-8 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="flex-shrink-0 w-6 h-8 bg-muted rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || popularArticles.length === 0) {
    return (
      <div className="bg-card border border-border rounded shadow-sm p-4 mb-8 min-h-[300px]">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h3 className="text-lg font-bold text-foreground">সর্বাধিক পঠিত</h3>
          <div className="flex gap-2">
            <button 
              className={`${timeRange === 'daily' ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted'} px-3 py-1 rounded text-sm font-medium transition`}
              onClick={() => handleTimeRangeChange('daily')}
            >
              আজ
            </button>
            <button 
              className={`${timeRange === 'weekly' ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted'} px-3 py-1 rounded text-sm font-medium transition`}
              onClick={() => handleTimeRangeChange('weekly')}
            >
              সাপ্তাহিক
            </button>
            <button 
              className={`${timeRange === 'monthly' ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted'} px-3 py-1 rounded text-sm font-medium transition`}
              onClick={() => handleTimeRangeChange('monthly')}
            >
              মাসিক
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-muted-foreground">
              {error || 'এই মুহূর্তে কোন জনপ্রিয় সংবাদ পাওয়া যায়নি'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              অন্য সময়সীমা চেষ্টা করুন অথবা পরে আবার দেখুন
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded shadow-sm p-4 mb-8">
      <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
        <h3 className="text-lg font-bold text-foreground">সর্বাধিক পঠিত</h3>
        <div className="flex gap-2">
          <button 
            className={`${timeRange === 'daily' ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted'} px-3 py-1 rounded text-sm font-medium transition`}
            onClick={() => handleTimeRangeChange('daily')}
          >
            আজ
          </button>
          <button 
            className={`${timeRange === 'weekly' ? 'bg-accent text-white' : 'hover:bg-muted dark:hover:bg-muted'} px-3 py-1 rounded text-sm font-medium transition`}
            onClick={() => handleTimeRangeChange('weekly')}
          >
            সাপ্তাহিক
          </button>
          <button 
            className={`${timeRange === 'monthly' ? 'bg-accent text-white' : 'hover:bg-muted dark:hover:bg-muted'} px-3 py-1 rounded text-sm font-medium transition`}
            onClick={() => handleTimeRangeChange('monthly')}
          >
            মাসিক
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {popularArticles.map((article, index) => (
          <div className="flex gap-4" key={article.id}>
            <div className="flex-shrink-0 font-bold text-2xl text-accent w-6">
              {index + 1}
            </div>
            <div>
              <h4 className="news-title mb-1">
                <Link href={`/article/${article.slug}`} className="hover:text-accent transition">
                  {article.title}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>{getRelativeTimeInBengali(article.publishedAt)}</span>
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  {article.viewCount || 0} বার দেখা হয়েছে
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularNewsSection;
