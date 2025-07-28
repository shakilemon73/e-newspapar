import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';
import { ChevronLeft, ChevronRight, Play, Pause, Eye, Clock, Calendar, TrendingUp, Bookmark, Share2, Heart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  imageUrl?: string;
  image_url?: string;
  publishedAt?: string;
  published_at?: string;
  category?: {
    slug: string;
    name: string;
  };
  view_count?: number;
  reading_time?: number;
  author_name?: string;
}

export const FeaturedSlideshow = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [sideArticles, setSideArticles] = useState<Article[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Fetch featured articles
  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        setIsLoading(true);
        const { getArticles, getLatestArticles } = await import('../lib/supabase-api-direct');
        
        const data = await getArticles({ featured: true, limit: 3 });
        setFeaturedArticles(data);
        
        // Fetch side articles (latest non-featured)
        const sideData = await getLatestArticles(5);
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

  // Touch gesture handling for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && featuredArticles.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    }
    if (isRightSwipe && featuredArticles.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
    }
  };

  // Auto-advance slideshow with play/pause control
  useEffect(() => {
    if (featuredArticles.length === 0 || !isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featuredArticles.length);
    }, 6000); // Increased to 6 seconds for better readability
    
    return () => clearInterval(interval);
  }, [featuredArticles, isAutoPlaying]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume after 10 seconds
  }, []);

  const handlePrevious = useCallback(() => {
    if (featuredArticles.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [featuredArticles.length]);

  const handleNext = useCallback(() => {
    if (featuredArticles.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [featuredArticles.length]);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 h-96 bg-card border border-border rounded shadow-sm animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-48 bg-card border border-border rounded shadow-sm animate-pulse"></div>
          <div className="h-48 bg-card border border-border rounded shadow-sm animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || (featuredArticles.length === 0 && sideArticles.length === 0)) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-4 bg-card border border-border rounded shadow-sm">
          <p className="text-center py-12 text-muted-foreground">{error || 'কোন নিবন্ধ পাওয়া যায়নি'}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded shadow-sm">
          <p className="text-center py-12 text-muted-foreground">কোন পাশের নিবন্ধ পাওয়া যায়নি</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Featured Slideshow - World-Class Mobile-First Design */}
      <div className="lg:col-span-3">
        <div 
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Hero Slideshow Container */}
          <div className="relative aspect-[16/9] overflow-hidden">
            {featuredArticles.map((article, index) => (
              <div 
                key={article.id} 
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                  index === currentSlide 
                    ? 'opacity-100 translate-x-0 z-10' 
                    : 'opacity-0 translate-x-full z-0'
                }`}
                style={{ 
                  transitionDelay: index === currentSlide ? '0ms' : '100ms' 
                }}
              >
                {/* Hero Image with Optimized Loading */}
                <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  <img 
                    src={article.imageUrl || article.image_url || '/placeholder-800x450.svg'} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-800x450.svg';
                    }}
                  />
                  
                  {/* Modern Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Category Badge - Enhanced Design */}
                  {article.category && (
                    <div className="absolute top-6 left-6 z-20">
                      <Link href={`/category/${article.category.slug}`}>
                        <Badge 
                          variant="secondary" 
                          className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-3 py-1.5 text-sm font-medium backdrop-blur-sm"
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {article.category.name}
                        </Badge>
                      </Link>
                    </div>
                  )}

                  {/* Enhanced Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-20">
                    {/* Article Title - Typography Excellence */}
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4 text-shadow-lg">
                      <Link 
                        href={`/article/${article.slug}`} 
                        className="text-white hover:text-orange-200 transition-colors duration-300 line-clamp-3"
                      >
                        {article.title}
                      </Link>
                    </h2>
                    
                    {/* Article Excerpt */}
                    <p className="text-lg md:text-xl opacity-90 line-clamp-2 mb-4 text-shadow leading-relaxed">
                      {article.excerpt}
                    </p>
                    
                    {/* Enhanced Metadata Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                      {/* Publication Time */}
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                        <Calendar className="w-4 h-4" />
                        <span>{article.publishedAt ? getRelativeTimeInBengali(article.publishedAt) : 'কিছুক্ষণ আগে'}</span>
                      </div>
                      
                      {/* Reading Time */}
                      {article.reading_time && (
                        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                          <Clock className="w-4 h-4" />
                          <span>{article.reading_time} মিনিট</span>
                        </div>
                      )}
                      
                      {/* View Count */}
                      {article.view_count && (
                        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.view_count.toLocaleString('bn-BD')} বার পড়া</span>
                        </div>
                      )}
                      
                      {/* Read More CTA */}
                      <Link href={`/article/${article.slug}`}>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ml-auto"
                        >
                          বিস্তারিত পড়ুন
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls - Enhanced UX */}
          {featuredArticles.length > 1 && (
            <>
              {/* Arrow Navigation - Touch-Friendly */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Play/Pause Control */}
              <button
                onClick={toggleAutoPlay}
                className="absolute top-6 right-6 z-30 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full p-2 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              {/* Modern Dot Navigation */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
                {featuredArticles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                      index === currentSlide 
                        ? 'bg-white scale-125 shadow-lg' 
                        : 'bg-white/50 hover:bg-white/75 hover:scale-110'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                  style={{ 
                    width: `${((currentSlide + 1) / featuredArticles.length) * 100}%` 
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Side Articles - Enhanced Card Design */}
      <div className="space-y-6">
        {sideArticles.map((article, index) => (
          <div 
            key={article.id} 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 border border-gray-200/60 dark:border-gray-700/40 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Article Image */}
            <div className="relative overflow-hidden">
              <img 
                src={article.imageUrl || article.image_url || '/placeholder-300x176.svg'} 
                alt={article.title}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-300x176.svg';
                }}
              />
              
              {/* Category Badge */}
              {article.category && (
                <div className="absolute top-3 left-3">
                  <Link href={`/category/${article.category.slug}`}>
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-blue-600 to-purple-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs px-2 py-1 backdrop-blur-sm"
                    >
                      {article.category.name}
                    </Badge>
                  </Link>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Article Content */}
            <div className="p-5">
              <h3 className="text-lg font-semibold leading-tight mb-3 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                <Link href={`/article/${article.slug}`} className="hover:underline">
                  {article.title}
                </Link>
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
                {article.excerpt}
              </p>
              
              {/* Article Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{article.publishedAt ? getRelativeTimeInBengali(article.publishedAt) : 'কিছুক্ষণ আগে'}</span>
                </div>
                
                {article.view_count && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.view_count.toLocaleString('bn-BD')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedSlideshow;
