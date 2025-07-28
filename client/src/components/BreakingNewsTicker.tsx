import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

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

  // Loading state with enhanced UX
  if (isLoading) {
    return (
      <div className="breaking-news-container mb-6">
        <div className="breaking-news-wrapper bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 dark:from-red-500/20 dark:via-orange-500/20 dark:to-red-500/20 border-l-4 border-red-500 rounded-lg shadow-md overflow-hidden">
          <div className="flex items-center min-h-[64px]">
            <div className="bg-red-500 text-white px-4 py-2 rounded-r-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 animate-pulse" />
                <span className="font-bold text-sm whitespace-nowrap">ব্রেকিং নিউজ</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 px-4 overflow-hidden">
              <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="breaking-news-container mb-6">
        <div className="breaking-news-wrapper bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 dark:from-red-500/20 dark:via-orange-500/20 dark:to-red-500/20 border-l-4 border-red-500 rounded-lg shadow-md overflow-hidden">
          <div className="flex items-center min-h-[64px]">
            <div className="bg-red-500 text-white px-4 py-2 rounded-r-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-bold text-sm whitespace-nowrap">ত্রুটি</span>
              </div>
            </div>
            <div className="px-4 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No breaking news available
  if (!breakingNews || breakingNews.length === 0) {
    return null;
  }

  return (
    <div className="breaking-news-container mb-6">
      <div className="breaking-news-wrapper bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 dark:from-red-500/20 dark:via-orange-500/20 dark:to-red-500/20 border-l-4 border-red-500 rounded-lg shadow-md overflow-hidden">
        <div className="flex items-center min-h-[64px]">
          {/* Breaking News Label */}
          <div className="bg-red-500 text-white px-4 py-2 rounded-r-lg flex-shrink-0">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 animate-pulse" />
              <span className="font-bold text-sm whitespace-nowrap">ব্রেকিং নিউজ</span>
            </div>
          </div>

          {/* Scrolling News Content */}
          <div className="flex-1 overflow-hidden">
            <div className="breaking-news-scroll flex items-center space-x-8 px-4">
              {breakingNews.map((news, index) => (
                <div key={news.id} className="flex items-center space-x-2 whitespace-nowrap">
                  <span className="text-red-700 dark:text-red-300 font-medium text-sm">
                    {news.content}
                  </span>
                  {index < breakingNews.length - 1 && (
                    <span className="text-red-500 mx-4">•</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;