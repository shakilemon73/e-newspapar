import { useState, useEffect, useCallback } from 'react';
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

export const FeaturedSlideshow = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [sideArticles, setSideArticles] = useState<Article[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured articles
  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/articles?featured=true&limit=3');
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured articles');
        }
        
        const data = await response.json();
        setFeaturedArticles(data);
        
        // Fetch side articles (latest non-featured)
        const sideResponse = await fetch('/api/articles/latest?limit=2');
        
        if (!sideResponse.ok) {
          throw new Error('Failed to fetch side articles');
        }
        
        const sideData = await sideResponse.json();
        setSideArticles(sideData.filter((article: Article) => 
          !data.some((featured: Article) => featured.id === article.id)
        ).slice(0, 2));
        
        setError(null);
      } catch (err) {
        setError('নিবন্ধ লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching articles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedArticles();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (featuredArticles.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featuredArticles.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featuredArticles]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 h-96 bg-card dark:bg-card rounded shadow-sm animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-48 bg-card dark:bg-card rounded shadow-sm animate-pulse"></div>
          <div className="h-48 bg-card dark:bg-card rounded shadow-sm animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || (featuredArticles.length === 0 && sideArticles.length === 0)) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-4 bg-card dark:bg-card rounded shadow-sm">
          <p className="text-center py-12">{error || 'কোন নিবন্ধ পাওয়া যায়নি'}</p>
        </div>
        <div className="p-4 bg-card dark:bg-card rounded shadow-sm">
          <p className="text-center py-12">কোন পাশের নিবন্ধ পাওয়া যায়নি</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Main Featured Slideshow */}
      <div className="lg:col-span-2">
        <div className="slideshow-container bg-card dark:bg-card rounded shadow-sm overflow-hidden">
          {featuredArticles.map((article, index) => (
            <div 
              key={article.id} 
              className={`slide fade relative ${index === currentSlide ? '' : 'hidden'}`}
            >
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
                <Link href={`/category/${article.category.slug}`} className="bg-accent text-white text-xs px-2 py-1 rounded inline-block">
                  {article.category.name}
                </Link>
                <h2 className="headline text-white mt-2 mb-2">
                  <Link href={`/article/${article.slug}`} className="text-white hover:text-gray-200 transition">
                    {article.title}
                  </Link>
                </h2>
                <p className="article-excerpt text-sm md:text-base opacity-90 line-clamp-2 text-white">{article.excerpt}</p>
                <div className="flex items-center mt-2 text-sm">
                  <span>{getRelativeTimeInBengali(article.publishedAt)}</span>
                  <span className="mx-2">•</span>
                  <Link href={`/article/${article.slug}`} className="text-accent hover:underline">
                    বিস্তারিত পড়ুন
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {/* Slideshow Navigation Dots */}
          <div className="text-center mt-2">
            {featuredArticles.map((_, index) => (
              <span 
                key={index}
                className={`dot inline-block w-2 h-2 rounded-full mx-1 cursor-pointer ${index === currentSlide ? 'bg-accent' : 'bg-mid-gray'}`}
                onClick={() => handleDotClick(index)}
              ></span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Side Featured Articles */}
      <div className="space-y-4">
        {sideArticles.map((article) => (
          <div key={article.id} className="bg-card dark:bg-card rounded shadow-sm overflow-hidden hover:shadow-md transition">
            <div className="relative">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-44 object-cover"
              />
              <Link href={`/category/${article.category.slug}`} className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">
                {article.category.name}
              </Link>
            </div>
            <div className="p-3">
              <h3 className="news-title mb-1 line-clamp-2">
                <Link href={`/article/${article.slug}`} className="hover:text-accent transition">
                  {article.title}
                </Link>
              </h3>
              <p className="article-excerpt text-sm line-clamp-2">{article.excerpt}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{getRelativeTimeInBengali(article.publishedAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedSlideshow;
