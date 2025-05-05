import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  category: Category;
}

interface CategoryNewsSectionProps {
  categorySlug: string;
  limit?: number;
}

export const CategoryNewsSection = ({ categorySlug, limit = 4 }: CategoryNewsSectionProps) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryAndArticles = async () => {
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
        const articlesResponse = await fetch(`/api/articles?category=${categorySlug}&limit=${limit}`);
        
        if (!articlesResponse.ok) {
          throw new Error('Failed to fetch category articles');
        }
        
        const articlesData = await articlesResponse.json();
        setArticles(articlesData);
        setError(null);
      } catch (err) {
        setError('বিভাগের খবর লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching category news:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryAndArticles();
  }, [categorySlug, limit]);

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4 h-full">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category || articles.length === 0) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h3 className="text-lg font-bold font-hind">{category?.name || 'বিভাগ'}</h3>
          <Link href={`/category/${categorySlug}`} className="text-accent text-sm hover:underline">
            সবগুলো <i className="fas fa-angle-right ml-1"></i>
          </Link>
        </div>
        <p className="text-center py-8">{error || 'এই বিভাগে কোন খবর পাওয়া যায়নি'}</p>
      </div>
    );
  }

  // Split articles - first one as main, rest as related
  const mainArticle = articles[0];
  const relatedArticles = articles.slice(1);

  return (
    <div className="bg-card dark:bg-card rounded shadow-sm p-4 h-full">
      <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
        <h3 className="text-lg font-bold font-hind">{category.name}</h3>
        <Link href={`/category/${category.slug}`} className="text-accent text-sm hover:underline">
          সবগুলো <i className="fas fa-angle-right ml-1"></i>
        </Link>
      </div>
      
      {/* Main News */}
      <div className="mb-4">
        <div className="mb-2">
          <Link href={`/article/${mainArticle.slug}`} className="block">
            <img 
              src={mainArticle.imageUrl} 
              alt={mainArticle.title} 
              className="w-full h-48 object-cover rounded"
            />
          </Link>
        </div>
        <h4 className="font-bold text-base mb-1 font-hind">
          <Link href={`/article/${mainArticle.slug}`} className="hover:text-accent transition">
            {mainArticle.title}
          </Link>
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{mainArticle.excerpt}</p>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getRelativeTimeInBengali(mainArticle.publishedAt)}</div>
      </div>
      
      {/* Related News */}
      <div className="space-y-3">
        {relatedArticles.map((article) => (
          <div className="flex gap-2" key={article.id}>
            <div className="flex-shrink-0">
              <Link href={`/article/${article.slug}`} className="block">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-16 h-16 object-cover rounded"
                />
              </Link>
            </div>
            <div>
              <h5 className="font-medium mb-1 text-sm font-hind">
                <Link href={`/article/${article.slug}`} className="hover:text-accent transition">
                  {article.title}
                </Link>
              </h5>
              <div className="text-xs text-gray-500 dark:text-gray-400">{getRelativeTimeInBengali(article.publishedAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryNewsSection;
