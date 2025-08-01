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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
      {/* Main Featured Slideshow - World-Class Mobile-First Design */}
      <div className="lg:col-span-3">
        <div 
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg lg:shadow-2xl group touch-pan-x"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Hero Slideshow Container - Optimized for Mobile */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] overflow-hidden">
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

                  {/* Enhanced Content Overlay - Mobile-First Typography */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 text-white z-20">
                    {/* Article Title - Mobile-Optimized Typography */}
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mb-2 sm:mb-3 lg:mb-4 text-shadow-lg text-white">
                      <Link 
                        href={`/article/${article.slug}`} 
                        className="text-white hover:text-orange-200 transition-colors duration-300 line-clamp-2 sm:line-clamp-3 block"
                      >
                        {article.title}
                      </Link>
                    </h2>
                    
                    {/* Article Excerpt - Hidden on small mobile */}
                    <p className="hidden sm:block text-sm sm:text-base lg:text-lg xl:text-xl opacity-90 line-clamp-1 lg:line-clamp-2 mb-3 lg:mb-4 text-shadow leading-relaxed text-white">
                      {article.excerpt}
                    </p>
                    
                    {/* Enhanced Metadata Row - Mobile-First Design */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm lg:text-base text-white">
                      {/* Publication Time - Always Visible */}
                      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 sm:px-3">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        <span className="text-xs sm:text-sm text-white">{article.publishedAt ? getRelativeTimeInBengali(article.publishedAt) : 'কিছুক্ষণ আগে'}</span>
                      </div>
                      
                      {/* Reading Time - Hidden on very small screens */}
                      {article.reading_time && (
                        <div className="hidden xs:flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 sm:px-3">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          <span className="text-xs sm:text-sm text-white">{article.reading_time} মিনিট</span>
                        </div>
                      )}
                      
                      {/* View Count - Desktop Only */}
                      {article.view_count && (
                        <div className="hidden lg:flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                          <Eye className="w-4 h-4 text-white" />
                          <span className="text-white">{article.view_count.toLocaleString('bn-BD')} বার পড়া</span>
                        </div>
                      )}
                      
                      {/* Read More CTA - Mobile-Optimized */}
                      <Link href={`/article/${article.slug}`} className="ml-auto">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 touch-target"
                        >
                          <span className="hidden xs:inline">বিস্তারিত পড়ুন</span>
                          <span className="xs:hidden">পড়ুন</span>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls - Mobile-First Enhanced UX */}
          {featuredArticles.length > 1 && (
            <>
              {/* Arrow Navigation - Mobile-Optimized Touch Targets */}
              <button
                onClick={handlePrevious}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full p-2.5 sm:p-3 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 touch-target"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full p-2.5 sm:p-3 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 touch-target"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Play/Pause Control - Hidden on Mobile */}
              <button
                onClick={toggleAutoPlay}
                className="hidden sm:block absolute top-4 sm:top-6 right-4 sm:right-6 z-30 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full p-2 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 touch-target"
                aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isAutoPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Minimal Line Navigation - 24px Design */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1">
                {featuredArticles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`h-0.5 transition-all duration-300 focus:outline-none ${
                      index === currentSlide 
                        ? 'w-6 bg-white shadow-sm' 
                        : 'w-3 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Progress Bar - Thinner and less intrusive */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10 dark:bg-white/10 z-30">
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
