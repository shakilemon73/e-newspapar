import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  category: Category;
}

const Category = () => {
  const [, params] = useRoute('/category/:slug');
  const categorySlug = params?.slug || '';

  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 10;

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        // Fetch category details
        const categoryResponse = await fetch(`/api/categories/${categorySlug}`);
        
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch category');
        }
        
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);
        
        // Fetch articles for this category
        const articlesResponse = await fetch(`/api/articles?category=${categorySlug}&limit=${limit}&offset=0`);
        
        if (!articlesResponse.ok) {
          throw new Error('Failed to fetch category articles');
        }
        
        const articlesData = await articlesResponse.json();
        setArticles(articlesData);
        setHasMore(articlesData.length === limit);
        setPage(1);
        setError(null);
      } catch (err) {
        setError('বিভাগের খবর লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching category:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
    // Reset to the top of the page when category changes
    window.scrollTo(0, 0);
  }, [categorySlug]);

  const loadMoreArticles = async () => {
    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const offset = page * limit;
      
      const response = await fetch(`/api/articles?category=${categorySlug}&limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch more articles');
      }
      
      const newArticles = await response.json();
      
      if (newArticles.length > 0) {
        setArticles([...articles, ...newArticles]);
        setPage(nextPage);
        setHasMore(newArticles.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!category && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded shadow-sm p-8 text-center">
          <h2 className="text-xl font-bold mb-4 font-hind">
            {error || 'বিভাগ খুঁজে পাওয়া যায়নি'}
          </h2>
          <Link href="/">
            <a className="text-accent hover:underline">হোমপেজে ফিরে যান</a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} - প্রথম আলো</title>
        <meta name="description" content={category.description || `${category.name} সম্পর্কিত সর্বশেষ খবর - প্রথম আলো`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 font-hind">{category.name}</h1>
        
        {category.description && (
          <p className="text-gray-600 mb-6">{category.description}</p>
        )}
        
        {articles.length === 0 && !isLoading ? (
          <div className="bg-white rounded shadow-sm p-8 text-center">
            <p className="text-lg font-medium">এই বিভাগে এখনো কোন সংবাদ প্রকাশিত হয়নি</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link key={article.id} href={`/article/${article.slug}`}>
                  <a className="block bg-white rounded shadow-sm overflow-hidden hover:shadow-md transition">
                    <div className="relative">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 font-hind">{article.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-2">{article.excerpt}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{getRelativeTimeInBengali(article.publishedAt)}</span>
                        <span className="text-accent">বিস্তারিত পড়ুন</span>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-8 text-center">
                <button 
                  onClick={loadMoreArticles}
                  disabled={isLoading}
                  className="bg-accent hover:bg-opacity-90 text-white px-6 py-2 rounded font-medium transition disabled:opacity-50"
                >
                  {isLoading ? 'লোড হচ্ছে...' : 'আরও সংবাদ দেখুন'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Category;
