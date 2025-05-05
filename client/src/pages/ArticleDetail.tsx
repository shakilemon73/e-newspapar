import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { formatBengaliDate, getRelativeTimeInBengali } from '@/lib/utils/dates';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  category: Category;
  viewCount: number;
}

const ArticleDetail = () => {
  const [, params] = useRoute('/article/:slug');
  const articleSlug = params?.slug || '';
  
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/articles/${articleSlug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        
        const data = await response.json();
        setArticle(data);
        
        // Fetch related articles from the same category
        if (data.category) {
          const relatedResponse = await fetch(`/api/articles?category=${data.category.slug}&limit=3`);
          
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            // Filter out the current article
            setRelatedArticles(relatedData.filter((related: Article) => related.id !== data.id));
          }
        }
        
        setError(null);
      } catch (err) {
        setError('নিবন্ধ লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching article:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
    // Reset to the top of the page when article changes
    window.scrollTo(0, 0);
  }, [articleSlug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold mb-4 font-hind">
              {error || 'নিবন্ধ খুঁজে পাওয়া যায়নি'}
            </h2>
            <Link href="/">
              <a className="text-accent hover:underline">হোমপেজে ফিরে যান</a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} - প্রথম আলো</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Link href={`/category/${article.category.slug}`}>
              <a className="text-accent hover:underline font-medium">{article.category.name}</a>
            </Link>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3 font-hind">{article.title}</h1>
          
          <div className="flex items-center text-sm text-gray-600 mb-6">
            <span>{formatBengaliDate(article.publishedAt)}</span>
            <span className="mx-2">•</span>
            <span>{getRelativeTimeInBengali(article.publishedAt)}</span>
          </div>
          
          <div className="mb-6">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full rounded"
            />
          </div>
          
          <div 
            className="article-content text-lg mb-8 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          
          <div className="flex justify-between items-center border-t border-b border-mid-gray py-4 mb-8">
            <div className="text-sm">
              <div className="font-medium">শেয়ার করুন:</div>
              <div className="flex space-x-3 mt-1">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-blue-600 hover:opacity-80"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-blue-400 hover:opacity-80"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-green-500 hover:opacity-80"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(window.location.href)}`}
                   className="text-gray-600 hover:opacity-80"
                >
                  <i className="fas fa-envelope"></i>
                </a>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <span>পাঠকসংখ্যা: {article.viewCount.toLocaleString('bn-BD')}</span>
            </div>
          </div>
          
          {relatedArticles.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 font-hind border-b border-mid-gray pb-2">সম্পর্কিত আরও খবর</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedArticles.map((related) => (
                  <Link key={related.id} href={`/article/${related.slug}`}>
                    <a className="block bg-white rounded shadow-sm overflow-hidden hover:shadow-md transition">
                      <div className="relative">
                        <img 
                          src={related.imageUrl} 
                          alt={related.title}
                          className="w-full h-32 object-cover" 
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-sm mb-1 font-hind line-clamp-2">{related.title}</h3>
                        <div className="text-xs text-gray-500">{getRelativeTimeInBengali(related.publishedAt)}</div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ArticleDetail;
