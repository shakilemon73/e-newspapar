import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { formatBengaliDate } from '@/lib/utils/dates';

interface EPaper {
  id: number;
  title: string;
  publishDate?: string;
  published_at?: string;
  imageUrl?: string;
  image_url?: string;
  pdfUrl?: string;
  pdf_url?: string;
  isLatest?: boolean;
  is_latest?: boolean;
}

const EPaper = () => {
  const [latestEPaper, setLatestEPaper] = useState<EPaper | null>(null);
  const [epapers, setEPapers] = useState<EPaper[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 12;

  useEffect(() => {
    const fetchEPapers = async () => {
      try {
        setIsLoading(true);
        
        const { getLatestEPaper, getEPapers } = await import('../lib/supabase-api-direct');
        
        // Fetch latest e-paper
        const latestData = await getLatestEPaper();
        setLatestEPaper(latestData as any);
        
        // Fetch all e-papers
        const allData = await getEPapers();
        setEPapers(allData as any);
        setHasMore(allData.length === limit);
        setError(null);
      } catch (err) {
        setError('ই-পেপার লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching e-papers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEPapers();
  }, []);

  const loadMoreEPapers = async () => {
    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const offset = page * limit;
      
      const { getEPapers } = await import('../lib/supabase-api-direct');
      const newEPapers = await getEPapers(limit, offset);
      
      if (newEPapers.length > 0) {
        setEPapers([...epapers, ...newEPapers as any]);
        setPage(nextPage);
        setHasMore(newEPapers.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more e-papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !latestEPaper) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded shadow-sm p-4">
                <div className="h-64 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || (!latestEPaper && !isLoading)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 font-hind">ই-পেপার আর্কাইভ</h1>
        <div className="bg-white rounded shadow-sm p-8 text-center">
          <h2 className="text-xl font-bold mb-4 font-hind">
            {error || 'কোন ই-পেপার পাওয়া যায়নি'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="ই-পেপার আর্কাইভ - Bengali News"
        description="Bengali News-এর ই-পেপার আর্কাইভ। পুরনো সংস্করণ সহ সকল ই-পেপার এখানে পাবেন। প্রতিদিনের সংবাদপত্র ডাউনলোড করুন।"
        image="/og-image.svg"
        url="/epaper"
        type="website"
        keywords="epaper, ই-পেপার, newspaper, সংবাদপত্র, archive, আর্কাইভ, Bengali News"
        tags={["epaper", "newspaper", "আর্কাইভ", "সংবাদপত্র"]}
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 font-hind">ই-পেপার আর্কাইভ</h1>
        
        {latestEPaper && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 font-hind border-b border-mid-gray pb-2">সর্বশেষ সংস্করণ</h2>
            <div className="flex flex-col md:flex-row items-center bg-white rounded shadow-sm p-6">
              <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
                <a 
                  href={latestEPaper.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block hover:opacity-80 transition"
                >
                  <img 
                    src={latestEPaper.imageUrl} 
                    alt={latestEPaper.title} 
                    className="mx-auto shadow-md border border-mid-gray h-96 object-cover"
                  />
                </a>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-2 font-hind">{latestEPaper.title}</h3>
                <p className="text-lg mb-4">
                  প্রকাশিত: {formatBengaliDate(latestEPaper.publishDate)}
                </p>
                <a 
                  href={latestEPaper.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-accent hover:bg-opacity-90 text-white px-6 py-3 rounded font-medium transition"
                >
                  <i className="far fa-file-pdf mr-2"></i> পিডিএফ দেখুন
                </a>
              </div>
            </div>
          </div>
        )}
        
        <h2 className="text-xl font-bold mb-4 font-hind border-b border-mid-gray pb-2">পুরনো সংস্করণ</h2>
        
        {epapers.length === 0 ? (
          <div className="bg-white rounded shadow-sm p-8 text-center">
            <p className="text-lg">আর্কাইভে কোন পুরনো সংস্করণ পাওয়া যায়নি</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {epapers.map((epaper) => (
                <div key={epaper.id} className="bg-white rounded shadow-sm overflow-hidden hover:shadow-md transition">
                  <a 
                    href={epaper.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block"
                  >
                    <img 
                      src={epaper.imageUrl} 
                      alt={epaper.title} 
                      className="w-full h-64 object-cover border-b border-mid-gray"
                    />
                    <div className="p-4">
                      <h3 className="font-bold mb-1 font-hind">{epaper.title}</h3>
                      <p className="text-sm text-gray-600">{formatBengaliDate(epaper.publishDate)}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-8 text-center">
                <button 
                  onClick={loadMoreEPapers}
                  disabled={isLoading}
                  className="bg-accent hover:bg-opacity-90 text-white px-6 py-2 rounded font-medium transition disabled:opacity-50"
                >
                  {isLoading ? 'লোড হচ্ছে...' : 'আরও দেখুন'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default EPaper;
