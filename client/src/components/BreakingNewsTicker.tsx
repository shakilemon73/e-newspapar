import { useState, useEffect } from 'react';

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

  if (isLoading) {
    return (
      <div className="breaking-news mb-6 bg-white p-3 rounded shadow-sm flex items-center">
        <div className="flex-shrink-0 bg-accent text-white px-3 py-1 rounded flex items-center font-medium">
          <span>ব্রেকিং</span>
        </div>
        <div className="ml-4">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (error || breakingNews.length === 0) {
    return (
      <div className="breaking-news mb-6 bg-white p-3 rounded shadow-sm flex items-center">
        <div className="flex-shrink-0 bg-accent text-white px-3 py-1 rounded flex items-center font-medium">
          <span>ব্রেকিং</span>
        </div>
        <div className="ml-4">{error || 'কোন ব্রেকিং নিউজ নেই'}</div>
      </div>
    );
  }

  return (
    <div className="breaking-news mb-6 bg-white p-3 rounded shadow-sm flex">
      <div className="flex-shrink-0 bg-accent text-white px-3 py-1 rounded flex items-center font-medium">
        <span>ব্রেকিং</span>
      </div>
      <div className="ticker-wrap ml-4 overflow-hidden flex-1">
        <div className="ticker animate-marquee font-medium">
          {breakingNews.map((news) => (
            <span key={news.id} className="mx-4">{news.content}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
