import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { formatBengaliDate } from '@/lib/utils/dates';

interface EPaper {
  id: number;
  title: string;
  publishDate: string;
  imageUrl: string;
  pdfUrl: string;
  isLatest: boolean;
}

export const EPaperSection = () => {
  const [latestEPaper, setLatestEPaper] = useState<EPaper | null>(null);
  const [epapers, setEPapers] = useState<EPaper[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEPapers = async () => {
      try {
        setIsLoading(true);
        
        // Fetch latest e-paper
        const { getLatestEPaper, getEPapers } = await import('../lib/supabase-api');
        
        const latestData = await getLatestEPaper();
        setLatestEPaper(latestData);
        
        // Fetch all e-papers for archive
        const allData = await getEPapers();
        setEPapers(allData.slice(0, 5));
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

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4 mb-8">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h3 className="text-lg font-bold font-hind">ই-পেপার</h3>
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-wrap gap-6 animate-pulse">
          <div className="w-full md:w-auto">
            <div className="h-80 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            <div className="mt-2 h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
            <div className="mt-1 h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
            <div className="flex flex-wrap justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mt-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !latestEPaper) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4 mb-8">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h3 className="text-lg font-bold font-hind">ই-পেপার</h3>
          <Link href="/epaper" className="text-accent text-sm hover:underline">
            সকল সংস্করণ <i className="fas fa-angle-right ml-1"></i>
          </Link>
        </div>
        <p className="text-center py-12">{error || 'কোন ই-পেপার পাওয়া যায়নি'}</p>
      </div>
    );
  }

  return (
    <div className="bg-card dark:bg-card rounded shadow-sm p-4 mb-8">
      <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
        <h3 className="text-lg font-bold font-hind">ই-পেপার</h3>
        <Link href="/epaper" className="text-accent text-sm hover:underline">
          সকল সংস্করণ <i className="fas fa-angle-right ml-1"></i>
        </Link>
      </div>
      
      <div className="flex flex-wrap gap-6">
        <div className="w-full md:w-auto">
          <div className="text-center">
            <a 
              href={latestEPaper.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block hover:opacity-80 transition"
            >
              <img 
                src={latestEPaper.imageUrl} 
                alt="আজকের ই-পেপার" 
                className="mx-auto shadow-md border border-border h-80 object-cover"
              />
              <div className="mt-2 font-medium">{latestEPaper.title}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatBengaliDate(latestEPaper.publishDate)}
              </div>
            </a>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="text-center mb-4">
            <h4 className="font-bold mb-2 font-hind">আর্কাইভ</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {epapers.filter(paper => paper.id !== latestEPaper.id).map((paper) => (
                <a 
                  key={paper.id}
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-border rounded hover:bg-muted dark:hover:bg-muted transition text-sm"
                >
                  {formatBengaliDate(paper.publishDate).split(' ')[0]} {formatBengaliDate(paper.publishDate).split(' ')[1]}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-3 font-hind">সাপ্তাহিক সংযোজন</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <a href="#" className="block">
                  <div className="border border-border rounded p-2 hover:bg-muted dark:hover:bg-muted transition">
                    <img 
                      src="https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80" 
                      alt="নক্ষত্র" 
                      className="w-full h-24 object-cover mb-2 rounded"
                    />
                    <div className="text-sm font-medium">নক্ষত্র</div>
                  </div>
                </a>
              </div>
              <div className="text-center">
                <a href="#" className="block">
                  <div className="border border-border rounded p-2 hover:bg-muted dark:hover:bg-muted transition">
                    <img 
                      src="https://images.unsplash.com/photo-1521747116042-5a810fda9664?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80" 
                      alt="শিল্পকলা" 
                      className="w-full h-24 object-cover mb-2 rounded"
                    />
                    <div className="text-sm font-medium">শিল্পকলা</div>
                  </div>
                </a>
              </div>
              <div className="text-center">
                <a href="#" className="block">
                  <div className="border border-border rounded p-2 hover:bg-muted dark:hover:bg-muted transition">
                    <img 
                      src="https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80" 
                      alt="সাহিত্য" 
                      className="w-full h-24 object-cover mb-2 rounded"
                    />
                    <div className="text-sm font-medium">সাহিত্য</div>
                  </div>
                </a>
              </div>
              <div className="text-center">
                <a href="#" className="block">
                  <div className="border border-border rounded p-2 hover:bg-muted dark:hover:bg-muted transition">
                    <img 
                      src="https://images.unsplash.com/photo-1605019114092-d707f9bc2f35?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80" 
                      alt="ক্যাম্পাস" 
                      className="w-full h-24 object-cover mb-2 rounded"
                    />
                    <div className="text-sm font-medium">ক্যাম্পাস</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EPaperSection;
