import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from './ErrorBoundary';
import { apiCache } from '@/lib/utils/api-cache';
import { measureApiCall } from '@/lib/utils/performance-monitor';

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
        
        // Check cache first
        const cacheKey = `category-${categorySlug}-${limit}`;
        const cachedData = apiCache.get(cacheKey);
        
        if (cachedData) {
          console.log(`[Cache] Using cached data for ${categorySlug}`);
          setCategory(cachedData.category);
          setArticles(cachedData.articles);
          setError(null);
          setIsLoading(false);
          return;
        }
        
        // Fetch category details with performance monitoring
        const categoryData = await measureApiCall(
          `fetch-category-${categorySlug}`,
          async () => {
            const { getCategoryBySlug } = await import('../lib/supabase-api-direct');
            const categoryData = await getCategoryBySlug(categorySlug);
            
            if (!categoryData) {
              throw new Error(`Category not found: ${categorySlug}`);
            }
            
            return categoryData;
          },
          { categorySlug }
        );
        
        setCategory(categoryData);
        
        // Fetch AI insights for the category
        try {
          const insightsResponse = await fetch(`/api/ai/category-insights/${categorySlug}`);
          const insightsResult = await insightsResponse.json();
          
          if (insightsResult.success) {
            console.log(`[AI Category] Insights for ${categorySlug}:`, insightsResult.data);
          }
        } catch (aiError) {
          console.warn(`[AI Category] Failed to get insights for ${categorySlug}:`, aiError);
        }
        
        // Fetch articles for this category with retry logic
        let articlesData: Article[] = [];
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            articlesData = await measureApiCall(
              `fetch-articles-${categorySlug}`,
              async () => {
                const { getArticles } = await import('../lib/supabase-api-direct');
                const fetchedArticles = await getArticles({ 
                  category: categorySlug, 
                  limit: limit 
                });
                
                // Transform data to match expected format
                return fetchedArticles.map((article: any) => ({
                  id: article.id,
                  title: article.title,
                  slug: article.slug,
                  excerpt: article.excerpt,
                  imageUrl: article.image_url || article.imageUrl,
                  publishedAt: article.published_at || article.publishedAt,
                  category: article.categories || article.category || { id: 0, name: 'সাধারণ', slug: 'general' }
                }));
              },
              { categorySlug, limit, attempt: retryCount + 1 }
            );
            break;
          } catch (fetchError) {
            console.warn(`Fetch attempt ${retryCount + 1} failed:`, fetchError);
            if (retryCount === maxRetries) {
              throw fetchError;
            }
          }
          
          retryCount++;
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        }
        
        setArticles(articlesData);
        setError(null);
        
        // Cache the successful result
        apiCache.set(cacheKey, {
          category: categoryData,
          articles: articlesData
        }, 2 * 60 * 1000); // Cache for 2 minutes
        
      } catch (err: any) {
        const errorMessage = err?.message || 'বিভাগের খবর লোড করতে সমস্যা হয়েছে';
        setError(errorMessage);
        console.error('Error fetching category news:', {
          error: err,
          categorySlug,
          limit,
          message: err?.message,
          status: err?.status
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryAndArticles();
  }, [categorySlug, limit]);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded shadow-sm p-4 h-full">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="flex-shrink-0 w-16 h-16" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if category doesn't exist
  // This prevents empty sections from taking up space in the layout
  if (error && error.includes('Category not found')) {
    return null;
  }
  
  if (error || !category || articles.length === 0) {
    return (
      <div className="bg-card border border-border rounded shadow-sm p-4 min-h-[200px]">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h3 className="text-lg font-bold text-foreground">{category?.name || 'বিভাগ'}</h3>
          {category && (
            <Link href={`/category/${categorySlug}`} className="text-accent text-sm hover:text-accent/80 transition-colors">
              সবগুলো <i className="fas fa-angle-right ml-1"></i>
            </Link>
          )}
        </div>
        <p className="text-center py-8 text-muted-foreground">
          {error && !error.includes('Category not found') ? error : 'এই বিভাগে কোন খবর পাওয়া যায়নি'}
        </p>
      </div>
    );
  }

  // Split articles - first one as main, rest as related
  const mainArticle = articles[0];
  const relatedArticles = articles.slice(1);

  return (
    <ErrorBoundary>
      <div className="bg-card border border-border rounded shadow-sm p-4 h-full">
      <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
        <h3 className="text-lg font-bold text-foreground">{category.name}</h3>
        <Link href={`/category/${category.slug}`} className="text-accent text-sm hover:text-accent/80 transition-colors">
          সবগুলো <i className="fas fa-angle-right ml-1"></i>
        </Link>
      </div>
      
      {/* Main News */}
      <div className="mb-4 article-card">
        <div className="mb-2 article-image">
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
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
          <span className="article-category mr-2">{category.name}</span>
          <span>{getRelativeTimeInBengali(mainArticle.publishedAt)}</span>
        </div>
      </div>
      
      {/* Related News */}
      <div className="space-y-3">
        {relatedArticles.map((article, index) => (
          <div className={`flex gap-2 article-card touch-feedback fade-in-delay-${index + 1}`} key={article.id}>
            <div className="flex-shrink-0 article-image">
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
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <span className="article-category mr-2">{category.name}</span>
                <span>{getRelativeTimeInBengali(article.publishedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default CategoryNewsSection;
