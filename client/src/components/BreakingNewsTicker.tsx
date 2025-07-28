import { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';

interface BreakingNews {
  id: number;
  content: string;
  priority?: number;
  urgencyScore?: number;
}

export const BreakingNewsTicker = () => {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        setIsLoading(true);
        
        // Get breaking news with AI processing
        const { getBreakingNews } = await import('../lib/supabase-api-direct');
        const rawData = await getBreakingNews();
        
        // Process each breaking news item with AI-safe method
        const { processArticleWithAI } = await import('../lib/vercel-safe-ai-service');
        
        const aiEnhancedData = await Promise.allSettled(
          rawData.map(async (item: any) => {
            try {
              // Process breaking news with Vercel-safe AI
              const result = await processArticleWithAI(item.id);
              
              if (result.success && result.data) {
                return {
                  ...item,
                  priority: result.data.priority || 1,
                  urgencyScore: 0.8 // High urgency for breaking news
                };
              }
              
              return item;
            } catch (error) {
              console.warn('[AI Breaking News] Processing failed for item:', item.id);
              return item;
            }
          })
        );
        
        // Extract successful results and sort by AI priority
        const processedData = aiEnhancedData
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<any>).value)
          .sort((a, b) => (b.priority || 1) - (a.priority || 1));
        
        setBreakingNews(processedData);
        setError(null);
        console.log(`[AI Breaking News] Processed ${processedData.length} items with AI enhancement`);
        
      } catch (err) {
        setError('ব্রেকিং নিউজ লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching breaking news:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBreakingNews();
  }, []);

  // Auto-advance breaking news
  useEffect(() => {
    if (breakingNews.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [breakingNews.length]);

  // Loading state
  if (isLoading) {
    return (
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-2 sm:py-3">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="flex items-center space-x-2 bg-red-500/10 dark:bg-red-500/20 px-3 py-1.5 rounded-lg flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 animate-pulse" />
                <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                  ব্রেকিং নিউজ
                </span>
              </div>
              <div className="flex items-center space-x-2 overflow-hidden">
                <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="sticky top-0 z-40 bg-red-50/95 dark:bg-red-900/20 backdrop-blur-sm border-b border-red-200/50 dark:border-red-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-2 sm:py-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-red-500/20 dark:bg-red-500/30 px-3 py-1.5 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                  ত্রুটি
                </span>
              </div>
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No breaking news
  if (!breakingNews.length) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-2 sm:py-3">
          {/* Breaking News Label */}
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg flex-shrink-0 mr-4">
            <AlertCircle className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-bold whitespace-nowrap">
              ব্রেকিং নিউজ
            </span>
          </div>

          {/* News Content - Mobile Optimized */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center space-x-4">
              {/* Current News Item */}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-white/95 truncate sm:whitespace-normal sm:line-clamp-2 leading-tight">
                  {breakingNews[currentIndex]?.content}
                </p>
              </div>

              {/* Navigation Indicators - Desktop Only */}
              {breakingNews.length > 1 && (
                <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
                  <div className="flex items-center space-x-1">
                    {breakingNews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentIndex 
                            ? 'bg-white scale-125' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`ব্রেকিং নিউজ ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-white/75 ml-2">
                    {currentIndex + 1}/{breakingNews.length}
                  </div>
                </div>
              )}

              {/* Next Button - Mobile */}
              {breakingNews.length > 1 && (
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % breakingNews.length)}
                  className="sm:hidden flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors touch-target"
                  aria-label="পরবর্তী খবর"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar for Auto-advance */}
      {breakingNews.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-5000 ease-linear"
            style={{
              width: `${((currentIndex + 1) / breakingNews.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BreakingNewsTicker;