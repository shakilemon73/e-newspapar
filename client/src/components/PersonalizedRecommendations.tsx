import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import supabase from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();
  const [readArticles, setReadArticles] = useState<string[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          // If no user, fetch popular articles instead
          const { getPopularArticles } = await import('../lib/supabase-api-direct');
          const data = await getPopularArticles(6);
          setArticles(data);
          return;
        }
        
        // Get the session token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // If no session, fetch popular articles instead
          const { getPopularArticles } = await import('../lib/supabase-api-direct');
          const data = await getPopularArticles(6);
          setArticles(data);
          return;
        }
        
        const token = session.access_token;
        
        // Fetch personalized recommendations
        try {
          const { getPersonalizedRecommendations } = await import('../lib/supabase-api-direct');
          const data = await getPersonalizedRecommendations(user.id, 6);
          setArticles(data);
        } catch (error) {
          // If personalized fails, fallback to popular articles
          console.warn('Personalized recommendations failed, using popular articles');
          const { getPopularArticles } = await import('../lib/supabase-api-direct');
          const data = await getPopularArticles(6);
          setArticles(data);
        }
        
        // Also fetch reading history to check which articles have been read
        try {
          const { getUserReadingHistory } = await import('../lib/supabase-api-direct');
          const historyData = await getUserReadingHistory(user.id);
          setReadArticles(historyData.map((article: any) => article.slug));
        } catch (historyError) {
          console.warn('Failed to fetch reading history:', historyError);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching personalized recommendations:', err);
        setError(err.message || 'সুপারিশকৃত আর্টিকেল লোড করতে সমস্যা হয়েছে');
        
        // Try to fetch popular articles as fallback
        try {
          const { getPopularArticles } = await import('../lib/supabase-api-direct');
          const data = await getPopularArticles(6);
          setArticles(data);
        } catch (fallbackErr) {
          console.error('Error fetching fallback articles:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [user]);

  const formatDate = (dateString: string) => {
    return getRelativeTimeInBengali(dateString);
  };

  const handleArticleClick = (article: Article) => {
    if (!user) return;
    
    // Get the session token from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      
      const token = session.access_token;
      
      // Add to reading history
      fetch(`/api/reading-history/${article.slug}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(err => {
        console.error('Error adding to reading history:', err);
      });
    });
  };

  // Filter recommendations to not show articles already read
  const filteredArticles = user ? 
    articles.filter(
      (article: Article) => !readArticles.includes(article.slug)
    ) : 
    articles;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
        {error}
      </div>
    );
  }

  if (filteredArticles.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-hind">
            {user ? 'আপনার জন্য সুপারিশকৃত' : 'জনপ্রিয় নিবন্ধ'}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
              <Link 
                href={`/article/${article.slug}`}
                onClick={() => handleArticleClick(article)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              </Link>
              
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Link 
                    href={`/category/${article.category.slug}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {article.category.name}
                  </Link>
                  <time className="text-xs text-muted-foreground">
                    {formatDate(article.publishedAt)}
                  </time>
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2">
                  <Link 
                    href={`/article/${article.slug}`}
                    onClick={() => handleArticleClick(article)}
                    className="hover:text-accent transition-colors"
                  >
                    {article.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-grow pb-2">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {article.excerpt}
                </p>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Link 
                  href={`/article/${article.slug}`}
                  onClick={() => handleArticleClick(article)}
                  className="text-sm text-accent hover:underline"
                >
                  আরও পড়ুন
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;