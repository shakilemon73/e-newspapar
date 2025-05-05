import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { formatBengaliDate, getRelativeTimeInBengali } from '@/lib/utils/dates';
import { ReadingTimeIndicator } from '@/components/ReadingTimeIndicator';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/lib/supabase';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Check if article is saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !article) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('saved_articles')
          .select()
          .eq('user_id', user.id)
          .eq('article_id', article.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking if article is saved:', error);
          return;
        }
        
        setIsSaved(!!data);
      } catch (err) {
        console.error('Error checking if article is saved:', err);
      }
    };
    
    checkIfSaved();
  }, [user, article]);

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
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
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
          <div className="bg-card dark:bg-card rounded shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold mb-4 font-hind">
              {error || 'নিবন্ধ খুঁজে পাওয়া যায়নি'}
            </h2>
            <Link href="/" className="text-accent hover:underline">
              হোমপেজে ফিরে যান
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
            <Link href={`/category/${article.category.slug}`} className="text-accent hover:underline font-medium">
              {article.category.name}
            </Link>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3 font-hind">{article.title}</h1>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>{formatBengaliDate(article.publishedAt)}</span>
            <span className="mx-2">•</span>
            <span>{getRelativeTimeInBengali(article.publishedAt)}</span>
            <span className="mx-2">•</span>
            <ReadingTimeIndicator content={article.content} />
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
          
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center border-t border-b border-border py-4 mb-8 gap-4">
            <div className="text-sm">
              <div className="font-medium mb-2">শেয়ার করুন:</div>
              <div className="flex flex-wrap gap-3">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 px-3 py-2 rounded-full hover:opacity-80 transition"
                >
                  <i className="fab fa-facebook-f"></i>
                  <span className="text-xs">ফেসবুক</span>
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 text-blue-400 dark:text-blue-300 px-3 py-2 rounded-full hover:opacity-80 transition"
                >
                  <i className="fab fa-twitter"></i>
                  <span className="text-xs">টুইটার</span>
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-3 py-2 rounded-full hover:opacity-80 transition"
                >
                  <i className="fab fa-whatsapp"></i>
                  <span className="text-xs">হোয়াটসঅ্যাপ</span>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-blue-200 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-full hover:opacity-80 transition"
                >
                  <i className="fab fa-linkedin-in"></i>
                  <span className="text-xs">লিংকডইন</span>
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(article.excerpt + '\n\n' + window.location.href)}`}
                   className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-full hover:opacity-80 transition"
                >
                  <i className="fas fa-envelope"></i>
                  <span className="text-xs">ইমেইল</span>
                </a>
              </div>
            </div>
            
            <div className="flex flex-col md:items-end gap-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <i className="fas fa-eye"></i>
                <span>পাঠকসংখ্যা: {article.viewCount.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "লিংক কপি করা হয়েছে!",
                      duration: 2000,
                    });
                  }}
                  className="text-sm bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 rounded-full flex items-center gap-1 transition"
                >
                  <i className="fas fa-link text-xs"></i>
                  <span>লিংক কপি করুন</span>
                </button>
                
                {user && (
                  <Button
                    variant={isSaved ? "secondary" : "outline"}
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={async () => {
                      if (!user) {
                        toast({
                          title: "অনুগ্রহ করে লগইন করুন",
                          description: "আর্টিকেল সংরক্ষণ করতে লগইন করুন",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      try {
                        setIsSaving(true);
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session) {
                          toast({
                            title: "সেশন শেষ হয়ে গেছে",
                            description: "অনুগ্রহ করে আবার লগইন করুন",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        const token = session.access_token;
                        
                        if (isSaved) {
                          // Unsave article
                          const response = await fetch(`/api/unsave-article/${article.id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });
                          
                          if (!response.ok) {
                            throw new Error("আর্টিকেল থেকে বাদ দিতে সমস্যা হয়েছে");
                          }
                          
                          setIsSaved(false);
                          toast({
                            title: "আর্টিকেল সংরক্ষিত তালিকা থেকে সরানো হয়েছে",
                          });
                        } else {
                          // Save article
                          const response = await fetch('/api/save-article', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ articleId: article.id })
                          });
                          
                          if (!response.ok) {
                            throw new Error("আর্টিকেল সংরক্ষণ করতে সমস্যা হয়েছে");
                          }
                          
                          setIsSaved(true);
                          toast({
                            title: "আর্টিকেল সংরক্ষিত হয়েছে",
                            description: "আপনি আপনার প্রোফাইলে এটি দেখতে পাবেন",
                          });
                        }
                      } catch (err: any) {
                        toast({
                          title: "সমস্যা হয়েছে",
                          description: err.message || "একটি ত্রুটি ঘটেছে",
                          variant: "destructive",
                        });
                        console.error('Error saving/unsaving article:', err);
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                        <span>অপেক্ষা করুন...</span>
                      </div>
                    ) : (
                      <>
                        {isSaved ? (
                          <>
                            <BookmarkCheck className="h-4 w-4 mr-1" />
                            <span>সংরক্ষিত</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4 mr-1" />
                            <span>সংরক্ষণ করুন</span>
                          </>
                        )}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {relatedArticles.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 font-hind border-b border-mid-gray pb-2">সম্পর্কিত আরও খবর</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedArticles.map((related) => (
                  <Link key={related.id} href={`/article/${related.slug}`} className="block bg-white dark:bg-card rounded shadow-sm overflow-hidden hover:shadow-md transition">
                    <div className="relative">
                      <img 
                        src={related.imageUrl} 
                        alt={related.title}
                        className="w-full h-32 object-cover" 
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm mb-1 font-hind line-clamp-2">{related.title}</h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{getRelativeTimeInBengali(related.publishedAt)}</div>
                    </div>
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
