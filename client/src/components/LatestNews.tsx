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
  imageUrl: string;
  publishedAt: string;
  category: Category;
}

export const LatestNews = () => {
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/articles/latest?limit=4');
        
        if (!response.ok) {
          throw new Error('Failed to fetch latest news');
        }
        
        const data = await response.json();
        setLatestNews(data);
        setError(null);
      } catch (err) {
        setError('সর্বশেষ খবর লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching latest news:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-white rounded shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-mid-gray pb-2">সর্বশেষ খবর</h3>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || latestNews.length === 0) {
    return (
      <div className="lg:col-span-2 bg-white rounded shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-mid-gray pb-2">সর্বশেষ খবর</h3>
        <p className="text-center py-8">{error || 'কোন সর্বশেষ খবর পাওয়া যায়নি'}</p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded shadow-sm p-4 h-full">
      <h3 className="text-lg font-bold mb-4 font-hind border-b border-mid-gray pb-2">সর্বশেষ খবর</h3>
      
      <div className="space-y-4">
        {latestNews.map((news) => (
          <div className="flex gap-3" key={news.id}>
            <div className="flex-shrink-0">
              <Link href={`/article/${news.slug}`} className="block">
                <img 
                  src={news.imageUrl} 
                  alt={news.title} 
                  className="w-20 h-20 object-cover rounded"
                />
              </Link>
            </div>
            <div>
              <Link href={`/category/${news.category.slug}`} className="text-xs font-medium text-accent">
                {news.category.name}
              </Link>
              <h4 className="font-bold mb-1 font-hind">
                <Link href={`/article/${news.slug}`} className="hover:text-accent transition">
                  {news.title}
                </Link>
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">{news.excerpt}</p>
              <div className="text-xs text-gray-500 mt-1">{getRelativeTimeInBengali(news.publishedAt)}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Link href="/latest">
          <a className="text-accent hover:underline font-medium">
            আরও সংবাদ <i className="fas fa-angle-right ml-1"></i>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default LatestNews;
