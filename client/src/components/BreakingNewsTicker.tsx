import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface BreakingNews {
  id: number;
  content: string;
}

export const BreakingNewsTicker = () => {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        setIsLoading(true);
        const { getBreakingNews } = await import('../lib/supabase-api-corrected');
        const data = await getBreakingNews();
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

  // Loading state with enhanced UX
  if (isLoading) {
    return (
      <div className="breaking-news-container mb-6">
        <div className="breaking-news-wrapper bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 dark:from-red-500/20 dark:via-orange-500/20 dark:to-red-500/20 border-l-4 border-red-500 rounded-lg shadow-md overflow-hidden">
          <div className="flex items-center min-h-[64px]">
            <div className="breaking-label flex-shrink-0 bg-red-500 text-white px-4 py-3 flex items-center space-x-2 font-bold text-sm tracking-wide uppercase">
              <AlertCircle className="w-4 h-4 animate-pulse" />
              <span>ব্রেকিং</span>
            </div>
            <div className="content-area flex-1 px-4">
              <div className="text-foreground font-semibold animate-pulse">লোড হচ্ছে...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with enhanced UX
  if (error || breakingNews.length === 0) {
    return (
      <div className="breaking-news-container mb-6">
        <div className="breaking-news-wrapper bg-muted/30 border-l-4 border-muted rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center min-h-[64px]">
            <div className="breaking-label flex-shrink-0 bg-muted text-muted-foreground px-4 py-3 flex items-center space-x-2 font-bold text-sm tracking-wide uppercase">
              <AlertCircle className="w-4 h-4" />
              <span>ব্রেকিং</span>
            </div>
            <div className="content-area flex-1 px-4">
              <div className="text-muted-foreground font-medium">{error || 'এই মুহূর্তে কোন ব্রেকিং নিউজ নেই'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="breaking-news-container mb-6">
      <div className="breaking-news-wrapper bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 dark:from-red-500/20 dark:via-orange-500/20 dark:to-red-500/20 border-l-4 border-red-500 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="flex items-center min-h-[64px]">
          {/* Breaking News Label with enhanced visual appeal */}
          <div className="breaking-label flex-shrink-0 bg-red-500 text-white px-4 py-3 flex items-center space-x-2 font-bold text-sm tracking-wide uppercase shadow-lg">
            <AlertCircle className="w-4 h-4 animate-pulse" />
            <span>ব্রেকিং</span>
            <div className="w-1 h-1 bg-white rounded-full animate-pulse ml-1"></div>
          </div>
          
          {/* Ticker Content with improved typography and animation */}
          <div className="ticker-wrapper flex-1 overflow-hidden bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-white/10">
            <div className="ticker-content">
              <div className="ticker-marquee animate-marquee-smooth font-semibold text-foreground text-base lg:text-lg leading-relaxed py-3 px-4">
                {breakingNews.map((news, index) => (
                  <span key={news.id} className="ticker-item">
                    {news.content}
                    {index < breakingNews.length - 1 && (
                      <span className="separator mx-8 text-red-500 font-bold">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="live-indicator flex-shrink-0 px-3">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
