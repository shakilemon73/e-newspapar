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
        const response = await fetch('/api/articles/popular?limit=5');
        
        if (!response.ok) {
          throw new Error('Failed to fetch popular articles');
        }
        
        const data = await response.json();
        setPopularArticles(data);
        setError(null);
      } catch (err) {
        setError('জনপ্রিয় সংবাদ লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching popular articles:', err);
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
      <div className="bg-white rounded shadow-sm p-4 mb-8">
        <div className="flex justify-between items-center mb-4 border-b border-mid-gray pb-2">
          <h3 className="text-lg font-bold font-hind">সর্বাধিক পঠিত</h3>
          <div className="flex gap-2">
            <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="flex-shrink-0 w-6 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || popularArticles.length === 0) {
    return (
      <div className="bg-white rounded shadow-sm p-4 mb-8">
        <div className="flex justify-between items-center mb-4 border-b border-mid-gray pb-2">
          <h3 className="text-lg font-bold font-hind">সর্বাধিক পঠিত</h3>
          <div className="flex gap-2">
            <button 
              className={`${timeRange === 'daily' ? 'bg-accent text-white' : 'hover:bg-light-gray'} px-3 py-1 rounded text-sm font-medium transition`}
              onClick={() => handleTimeRangeChange('daily')}
            >
              আজ
            </button>
            <button 
              className={`${timeRange === 'weekly' ? 'bg-accent text-white' : 'hover:bg-light-gray'} px-3 py-1 rounded text-sm font-medium transition`}
              onClick={() => handleTimeRangeChange('weekly')}
            >
              সাপ্তাহিক
            </button>
            <button 
              className={`${timeRange === 'monthly' ? 'bg-accent text-white' : 'hover:bg-light-gray'} px-3 py-1 rounded text-sm font-medium transition`}
              onClick={() => handleTimeRangeChange('monthly')}
            >
              মাসিক
            </button>
          </div>
        </div>
        <p className="text-center py-8">{error || 'কোন জনপ্রিয় সংবাদ পাওয়া যায়নি'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-sm p-4 mb-8">
      <div className="flex justify-between items-center mb-4 border-b border-mid-gray pb-2">
        <h3 className="text-lg font-bold font-hind">সর্বাধিক পঠিত</h3>
        <div className="flex gap-2">
          <button 
            className={`${timeRange === 'daily' ? 'bg-accent text-white' : 'hover:bg-light-gray'} px-3 py-1 rounded text-sm font-medium transition`}
            onClick={() => handleTimeRangeChange('daily')}
          >
            আজ
          </button>
          <button 
            className={`${timeRange === 'weekly' ? 'bg-accent text-white' : 'hover:bg-light-gray'} px-3 py-1 rounded text-sm font-medium transition`}
            onClick={() => handleTimeRangeChange('weekly')}
          >
            সাপ্তাহিক
          </button>
          <button 
            className={`${timeRange === 'monthly' ? 'bg-accent text-white' : 'hover:bg-light-gray'} px-3 py-1 rounded text-sm font-medium transition`}
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
              <h4 className="font-bold mb-1 font-hind">
                <Link href={`/article/${article.slug}`}>
                  <a className="hover:text-accent transition">{article.title}</a>
                </Link>
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
              <div className="text-xs text-gray-500 mt-1">{getRelativeTimeInBengali(article.publishedAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularNewsSection;
