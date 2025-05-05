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

export const PersonalizedRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        
        // Check browser history or localStorage for previously read articles
        const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]');
        const readCategories = readArticles.reduce((acc: { [key: string]: number }, articleSlug: string) => {
          const categoryName = localStorage.getItem(`article_${articleSlug}_category`);
          if (categoryName) {
            acc[categoryName] = (acc[categoryName] || 0) + 1;
          }
          return acc;
        }, {});
        
        // Find the most frequently read category
        let topCategory = '';
        let maxCount = 0;
        
        for (const [category, count] of Object.entries(readCategories)) {
          if (typeof count === 'number' && count > maxCount) {
            maxCount = count;
            topCategory = category;
          }
        }
        
        // If user has no history, fetch trending articles instead
        const endpoint = topCategory 
          ? `/api/articles?category=${topCategory}&limit=4` 
          : '/api/articles/popular?limit=4';
          
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommended articles');
        }
        
        const data = await response.json();
        
        // Filter out articles that are already in the read history
        const filteredRecommendations = data.filter(
          (article: Article) => !readArticles.includes(article.slug)
        );
        
        setRecommendations(filteredRecommendations);
        setError(null);
      } catch (err) {
        setError('সুপারিশকৃত নিবন্ধ লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching recommended articles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Save the article to read history when a user clicks on it
  const handleArticleClick = (article: Article) => {
    try {
      // Get existing read articles array
      const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]');
      
      // Only add if it's not already in the list
      if (!readArticles.includes(article.slug)) {
        // Limit the history to 20 most recent articles
        if (readArticles.length >= 20) {
          readArticles.pop();
        }
        
        // Add the new article at the beginning (most recent)
        readArticles.unshift(article.slug);
        
        // Save updated list
        localStorage.setItem('readArticles', JSON.stringify(readArticles));
        
        // Save the category for this article
        localStorage.setItem(`article_${article.slug}_category`, article.category.slug);
      }
    } catch (error) {
      console.error('Error saving read history:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4 h-full">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-border pb-2">আপনার জন্য সুপারিশ</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <div className="bg-card dark:bg-card rounded shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 font-hind border-b border-border pb-2">আপনার জন্য সুপারিশ</h3>
        <p className="text-center py-8">{error || 'কোন সুপারিশকৃত নিবন্ধ পাওয়া যায়নি'}</p>
      </div>
    );
  }

  return (
    <div className="bg-card dark:bg-card rounded shadow-sm p-4 h-full">
      <h3 className="text-lg font-bold mb-4 font-hind border-b border-border pb-2">আপনার জন্য সুপারিশ</h3>
      
      <div className="space-y-4">
        {recommendations.map((article) => (
          <div className="flex gap-3" key={article.id}>
            <div className="flex-shrink-0">
              <Link 
                href={`/article/${article.slug}`} 
                onClick={() => handleArticleClick(article)}
                className="block"
              >
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-16 h-16 object-cover rounded"
                />
              </Link>
            </div>
            <div>
              <h5 className="font-medium mb-1 text-sm font-hind">
                <Link 
                  href={`/article/${article.slug}`}
                  onClick={() => handleArticleClick(article)}
                  className="hover:text-accent transition"
                >
                  {article.title}
                </Link>
              </h5>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="bg-muted rounded px-2 py-0.5 text-xs mr-2">
                  {article.category.name}
                </span>
                <span>{getRelativeTimeInBengali(article.publishedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;