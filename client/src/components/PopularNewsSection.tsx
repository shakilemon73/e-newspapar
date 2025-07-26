import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';
import { supabase } from '@/lib/supabase';

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
  aiScore?: number;
  trending?: boolean;
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
        setError(null);
        
        // Determine date filter based on time range
        let dateFilter = new Date();
        switch (timeRange) {
          case 'daily':
            dateFilter.setDate(dateFilter.getDate() - 1);
            break;
          case 'weekly':
            dateFilter.setDate(dateFilter.getDate() - 7);
            break;
          case 'monthly':
            dateFilter.setMonth(dateFilter.getMonth() - 1);
            break;
        }

        console.log(`[PopularNews] Fetching ${timeRange} popular articles since ${dateFilter.toISOString()}`);

        // Query Supabase directly for popular articles
        const { data, error: supabaseError } = await supabase
          .from('articles')
          .select(`
            id,
            title,
            slug,
            excerpt,
            published_at,
            view_count,
            is_featured,
            image_url,
            categories!inner (
              id,
              name,
              slug
            )
          `)
          .gte('published_at', dateFilter.toISOString())
          .order('view_count', { ascending: false })
          .limit(6);

        if (supabaseError) {
          console.error('[PopularNews] Supabase error:', supabaseError);
          throw supabaseError;
        }

        if (!data || data.length === 0) {
          console.log('[PopularNews] No articles found, trying without date filter...');
          
          // Fallback: Get popular articles without date filter
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('articles')
            .select(`
              id,
              title,
              slug,
              excerpt,
              published_at,
              view_count,
              is_featured,
              image_url,
              categories!inner (
                id,
                name,
                slug
              )
            `)
            .order('view_count', { ascending: false })
            .limit(6);

          if (fallbackError) {
            throw fallbackError;
          }

          const transformedFallbackData = fallbackData?.map(article => ({
            ...article,
            publishedAt: article.published_at,
            viewCount: article.view_count,
            category: Array.isArray(article.categories) ? article.categories[0] : article.categories
          })) || [];
          
          setPopularArticles(transformedFallbackData);
          console.log(`[PopularNews] Fallback: Found ${transformedFallbackData.length} popular articles`);
        } else {
          const transformedData = data.map(article => ({
            ...article,
            publishedAt: article.published_at,
            viewCount: article.view_count,
            category: Array.isArray(article.categories) ? article.categories[0] : article.categories
          }));
          
          setPopularArticles(transformedData);
          console.log(`[PopularNews] Found ${transformedData.length} popular articles for ${timeRange}`);
        }

      } catch (err: any) {
        console.error('[PopularNews] Error fetching articles:', err);
        setError('জনপ্রিয় সংবাদ লোড করতে সমস্যা হয়েছে');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularArticles();
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
          <Link key={article.id} href={`/article/${article.slug}`}>
            <div className="flex items-start gap-4 p-3 hover:bg-muted/50 transition-colors rounded-lg relative">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground leading-tight line-clamp-2 flex-1">
                    {article.title}
                  </h4>
                  {article.trending && (
                    <div className="flex-shrink-0 ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        🔥 ট্রেন্ডিং
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{article.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-muted rounded text-xs">
                      {article.category?.name || 'সাধারণ'}
                    </span>
                    {article.is_featured && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded text-xs font-medium">
                        ⭐ ফিচার্ড
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2 text-right">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      {article.viewCount || article.view_count || 0} বার
                    </span>
                    <span>•</span>
                    <span>{getRelativeTimeInBengali(article.publishedAt || article.published_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularNewsSection;
