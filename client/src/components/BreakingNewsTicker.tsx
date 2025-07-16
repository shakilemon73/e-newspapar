import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Clock, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreakingNews {
  id: number;
  content: string;
  createdAt?: string;
  priority?: 'high' | 'medium' | 'low';
}

export const BreakingNewsTicker = () => {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/breaking-news');
        
        if (!response.ok) {
          throw new Error('Failed to fetch breaking news');
        }
        
        const data = await response.json();
        setBreakingNews(data);
        setError(null);
      } catch (err) {
        setError('ব্রেকিং নিউজ লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching breaking news:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBreakingNews();
  }, []);

  // Auto-advance breaking news (Don Norman: Feedback principle)
  useEffect(() => {
    if (breakingNews.length <= 1 || isPaused || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [breakingNews.length, isPaused, isHovered]);

  const nextNews = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
  }, [breakingNews.length]);

  const prevNews = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);
  }, [breakingNews.length]);

  const togglePause = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  // Steve Krug: Don't Make Me Think - Clear loading state
  if (isLoading) {
    return (
      <div className="breaking-news mb-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-red-700 dark:text-red-300 text-sm tracking-wide">ব্রেকিং নিউজ</span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="mt-1 text-foreground/70 font-medium">লোড হচ্ছে...</div>
          </div>
        </div>
      </div>
    );
  }

  // Luke Wroblewski: Clear error states
  if (error || breakingNews.length === 0) {
    return (
      <div className="breaking-news mb-6 bg-muted/30 border border-border/50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-muted-foreground text-sm tracking-wide">ব্রেকিং নিউজ</div>
            <div className="mt-1 text-muted-foreground">{error || 'এই মুহূর্তে কোন ব্রেকিং নিউজ নেই'}</div>
          </div>
        </div>
      </div>
    );
  }

  const currentNews = breakingNews[currentIndex];

  return (
    <div 
      className="breaking-news mb-6 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-red-950/20 border-l-4 border-red-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="banner"
      aria-label="ব্রেকিং নিউজ"
    >
      <div className="p-4">
        {/* Header with controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-red-700 dark:text-red-300 text-sm tracking-wider uppercase">ব্রেকিং</span>
                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground font-medium">LIVE</span>
              </div>
            </div>
          </div>

          {/* Controls - Aarron Walter: Delight through micro-interactions */}
          {breakingNews.length > 1 && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevNews}
                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                aria-label="পূর্ববর্তী নিউজ"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePause}
                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                aria-label={isPaused ? "চালু করুন" : "বিরতি দিন"}
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextNews}
                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                aria-label="পরবর্তী নিউজ"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Content - Don Norman: Clear mapping and signifiers */}
        <div className="relative">
          <div className="font-semibold text-foreground leading-relaxed mb-2">
            {currentNews.content}
          </div>
          
          {/* Meta information - Susan Weinschenk: Don't overload working memory */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>এখনই</span>
            </div>
            
            {breakingNews.length > 1 && (
              <div className="flex items-center space-x-1">
                <span>{currentIndex + 1}</span>
                <span>/</span>
                <span>{breakingNews.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress indicator - Julie Zhuo: Systems thinking */}
        {breakingNews.length > 1 && !isPaused && !isHovered && (
          <div className="mt-3 w-full bg-red-200 dark:bg-red-800/30 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-75 animate-pulse"
              style={{ 
                animation: 'progress-bar 4s linear infinite',
                transformOrigin: 'left'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
