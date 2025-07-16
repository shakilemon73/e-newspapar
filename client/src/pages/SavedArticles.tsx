import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/lib/supabase';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
  category: Category | null;
}

const SavedArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      setLocation('/auth');
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchSavedArticles = async () => {
      try {
        setLoading(true);
        
        // Get the session token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('আপনি লগইন অবস্থায় নেই');
          return;
        }
        
        const token = session.access_token;
        
        // Fetch saved articles
        const response = await fetch('/api/saved-articles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('সংরক্ষিত আর্টিকেল লোড করতে সমস্যা হয়েছে');
        }
        
        const data = await response.json();
        setArticles(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'সংরক্ষিত আর্টিকেল লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching saved articles:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchSavedArticles();
    }
  }, [user]);

  const handleUnsaveArticle = async (articleId: number) => {
    try {
      // Get the session token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('আপনি লগইন অবস্থায় নেই');
        return;
      }
      
      const token = session.access_token;
      
      // Unsave the article
      const response = await fetch(`/api/unsave-article/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('আর্টিকেল থেকে বাদ দিতে সমস্যা হয়েছে');
      }
      
      // Remove the article from the list
      setArticles(articles.filter(article => article.id !== articleId));
      
      toast({
        title: 'আর্টিকেল সরানো হয়েছে',
        description: 'আর্টিকেলটি আপনার সংরক্ষিত তালিকা থেকে সরানো হয়েছে',
      });
    } catch (err: any) {
      toast({
        title: 'সমস্যা হয়েছে',
        description: err.message || 'আর্টিকেল থেকে বাদ দিতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
      console.error('Error unsaving article:', err);
    }
  };

  // Using the centralized getRelativeTimeInBengali from utils

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>সংরক্ষিত আর্টিকেল | প্রথম আলো</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 font-hind">সংরক্ষিত আর্টিকেল</h1>
          
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
              {error}
            </div>
          ) : null}
          
          {articles.length === 0 && !error ? (
            <div className="bg-muted/30 p-8 rounded-lg text-center">
              <h3 className="text-xl mb-2 font-hind">কোন সংরক্ষিত আর্টিকেল নেই</h3>
              <p className="mb-4 text-muted-foreground">
                আপনি এখনও কোন আর্টিকেল সংরক্ষণ করেননি। আর্টিকেল পড়ার সময় "সংরক্ষণ করুন" বাটনে ক্লিক করে আপনার পছন্দের আর্টিকেল সংরক্ষণ করুন।
              </p>
              <Button asChild>
                <Link href="/">নতুন আর্টিকেল দেখুন</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-4 md:p-6 flex flex-col">
                      <CardHeader className="p-0 pb-2">
                        <div className="flex items-center justify-between">
                          {article.category ? (
                            <Link
                              href={`/category/${article.category.slug}`}
                              className="text-sm font-medium text-accent hover:underline mb-1 inline-block"
                            >
                              {article.category.name}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground mb-1 inline-block">
                              বিভাগ অনুপস্থিত
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUnsaveArticle(article.id)}
                            title="অসংরক্ষিত করুন"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                        <CardTitle className="text-xl">
                          <Link
                            href={`/article/${article.slug}`}
                            className="hover:text-accent transition-colors"
                          >
                            {article.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 py-2 flex-grow">
                        <p className="text-muted-foreground line-clamp-3">
                          {article.excerpt}
                        </p>
                      </CardContent>
                      <CardFooter className="p-0 pt-2 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {getRelativeTimeInBengali(article.publishedAt)}
                        </span>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/article/${article.slug}`}>
                            বিস্তারিত পড়ুন
                          </Link>
                        </Button>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SavedArticles;