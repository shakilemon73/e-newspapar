import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';
import { createBengaliSlug } from '@/lib/utils/url-utils';

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
        const { getLatestArticles } = await import('../lib/supabase-api');
        const data = await getLatestArticles(4);
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
      <div className="lg:col-span-2 bg-card border border-border rounded shadow-sm p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">সর্বশেষ খবর</h3>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="flex-shrink-0 w-20 h-20 bg-muted rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || latestNews.length === 0) {
    return (
      <div className="lg:col-span-2 bg-card border border-border rounded shadow-sm p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">সর্বশেষ খবর</h3>
        <p className="text-center py-8 text-muted-foreground">{error || 'কোন সর্বশেষ খবর পাওয়া যায়নি'}</p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-card border border-border rounded shadow-sm p-4 h-full">
      <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">সর্বশেষ খবর</h3>
      
      <div className="space-y-4">
        {latestNews.map((news) => (
          <div className="flex gap-3" key={news.id}>
            <div className="flex-shrink-0">
              <Link href={`/article/${createBengaliSlug(news.title)}`} className="block">
                <img 
                  src={news.imageUrl} 
                  alt={news.title} 
                  className="w-20 h-20 object-cover rounded"
                />
              </Link>
            </div>
            <div className="flex-1">
              <Link href={`/category/${news.category.slug}`} className="text-xs font-medium text-accent hover:text-accent/80 transition-colors">
                {news.category.name}
              </Link>
              <h4 className="text-base font-semibold text-foreground mb-1 leading-tight">
                <Link href={`/article/${createBengaliSlug(news.title)}`} className="hover:text-primary transition-colors">
                  {news.title}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{news.excerpt}</p>
              <div className="text-xs text-muted-foreground">{news.publishedAt ? getRelativeTimeInBengali(news.publishedAt) : 'কিছুক্ষণ আগে'}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Link href="/latest" className="text-accent hover:text-accent/80 font-medium transition-colors">
          আরও সংবাদ <i className="fas fa-angle-right ml-1"></i>
        </Link>
      </div>
    </div>
  );
};

export default LatestNews;
