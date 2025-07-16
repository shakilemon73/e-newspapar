import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { formatBengaliDate, getRelativeTimeInBengali } from '@/lib/utils/dates';
import { ReadingTimeIndicator } from '@/components/ReadingTimeIndicator';
import { ArticleSummary } from '@/components/ArticleSummary';
import { TextToSpeech } from '@/components/TextToSpeech';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/lib/supabase';
import { 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Eye, 
  Calendar, 
  Tag, 
  ArrowLeft, 
  Heart,
  MessageCircle,
  TrendingUp,
  ChevronRight,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

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
  image_url: string;
  published_at: string;
  category: Category;
  view_count: number;
  category_id: number;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
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
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  
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

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
      setReadingProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track reading history when an article is viewed by a logged-in user
  useEffect(() => {
    const trackReading = async () => {
      if (!user || !article) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const token = session.access_token;
        
        // Send reading history to server
        await fetch('/api/track-reading', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ articleId: article.id })
        });
        
        // Don't need to do anything with the response
      } catch (err) {
        console.error('Error tracking reading history:', err);
        // Don't show error to user as this is a background operation
      }
    };
    
    trackReading();
  }, [user, article]);
  
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/articles/${articleSlug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('এই সংবাদটি খুঁজে পাওয়া যায়নি');
            return;
          }
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* Enhanced loading state with better feedback */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back button skeleton */}
            <div className="mb-6">
              <div className="h-10 w-32 bg-muted animate-pulse rounded-full"></div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main content skeleton */}
              <div className="lg:col-span-2">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-6">
                      {/* Category badge */}
                      <div className="h-6 w-24 bg-primary/20 rounded-full"></div>
                      
                      {/* Title */}
                      <div className="space-y-3">
                        <div className="h-8 bg-muted rounded w-full"></div>
                        <div className="h-8 bg-muted rounded w-4/5"></div>
                      </div>
                      
                      {/* Meta info */}
                      <div className="flex gap-4">
                        <div className="h-4 w-20 bg-muted rounded"></div>
                        <div className="h-4 w-16 bg-muted rounded"></div>
                        <div className="h-4 w-24 bg-muted rounded"></div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <div className="h-10 w-32 bg-muted rounded-full"></div>
                        <div className="h-10 w-28 bg-muted rounded-full"></div>
                        <div className="h-10 w-24 bg-muted rounded-full"></div>
                      </div>
                      
                      {/* Image */}
                      <div className="h-64 bg-muted rounded-lg"></div>
                      
                      {/* Content */}
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-11/12"></div>
                        <div className="h-4 bg-muted rounded w-4/5"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar skeleton */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-4">
                      <div className="h-5 w-20 bg-muted rounded"></div>
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-3/4 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-4">
                      <div className="h-5 w-24 bg-muted rounded"></div>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                          <div className="h-16 w-16 bg-muted rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading indicator with message */}
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">আর্টিকেল লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="text-center shadow-lg border-destructive/20">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-destructive" />
                </div>
                
                <h2 className="text-xl font-bold mb-2 font-hind">
                  {error || 'নিবন্ধ খুঁজে পাওয়া যায়নি'}
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  দুঃখিত, এই মুহূর্তে আর্টিকেলটি উপলব্ধ নেই। অনুগ্রহ করে পরে চেষ্টা করুন।
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild variant="default">
                    <Link href="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      হোমপেজে ফিরে যান
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    পুনরায় চেষ্টা করুন
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "লিংক কপি করা হয়েছে!",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "কপি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const shareUrl = window.location.href;
  const shareText = `${article.title} - ${article.excerpt}`;

  return (
    <>
      <Helmet>
        <title>{article.title} - প্রথম আলো</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.image_url} />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={readingProgress} className="h-1 rounded-none border-none" />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Back Navigation */}
            <div className="mb-6">
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  সকল খবর
                </Link>
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Article Content */}
              <div className="lg:col-span-2">
                <Card className="border-none shadow-lg overflow-hidden">
                  <CardContent className="p-0">
                    
                    {/* Article Header */}
                    <div className="p-6 pb-4">
                      {/* Category Badge */}
                      <div className="mb-4">
                        <Badge 
                          asChild 
                          variant="secondary" 
                          className="text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Link href={`/category/${article.category.slug}`}>
                            <Tag className="w-3 h-3 mr-1" />
                            {article.category.name}
                          </Link>
                        </Badge>
                      </div>
                      
                      {/* Article Title */}
                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 font-hind leading-tight">
                        {article.title}
                      </h1>
                      
                      {/* Article Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatBengaliDate(article.published_at)}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{getRelativeTimeInBengali(article.published_at)}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <ReadingTimeIndicator content={article.content} />
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.view_count?.toLocaleString('bn-BD') || '0'} পাঠক</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="transition-all hover:scale-105"
                          onClick={() => setShowShareMenu(!showShareMenu)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          শেয়ার করুন
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(shareUrl)}
                          className="transition-all hover:scale-105"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          লিংক কপি
                        </Button>

                        {user && (
                          <Button
                            variant={isSaved ? "default" : "outline"}
                            size="sm"
                            className="transition-all hover:scale-105"
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
                                    <BookmarkCheck className="h-4 w-4 mr-2" />
                                    <span>সংরক্ষিত</span>
                                  </>
                                ) : (
                                  <>
                                    <Bookmark className="h-4 w-4 mr-2" />
                                    <span>সংরক্ষণ</span>
                                  </>
                                )}
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Share Menu */}
                      {showShareMenu && (
                        <Card className="mb-6 border-primary/20 bg-primary/5">
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-3 flex items-center">
                              <Share2 className="w-4 h-4 mr-2" />
                              সোশ্যাল মিডিয়ায় শেয়ার করুন
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                              >
                                <a
                                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  ফেসবুক
                                </a>
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="bg-sky-50 border-sky-200 text-sky-600 hover:bg-sky-100"
                              >
                                <a
                                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  টুইটার
                                </a>
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                              >
                                <a
                                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  হোয়াটসঅ্যাপ
                                </a>
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                <a
                                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  লিংকডইন
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Article Image */}
                    <div className="relative overflow-hidden">
                      <img 
                        src={article.image_url} 
                        alt={article.title} 
                        className="w-full h-64 md:h-80 lg:h-96 object-cover transition-transform hover:scale-105 duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      {/* Interactive Elements */}
                      <div className="mb-6 space-y-4">
                        <ArticleSummary content={article.content} />
                        <TextToSpeech text={article.content} title={article.title} />
                      </div>
                      
                      {/* Article Content */}
                      <div 
                        className="article-content prose prose-lg max-w-none leading-relaxed text-foreground"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Article Stats */}
                <Card className="sticky top-6">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      পরিসংখ্যান
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">পাঠক সংখ্যা</span>
                        <span className="font-medium">{article.view_count?.toLocaleString('bn-BD') || '0'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">প্রকাশিত</span>
                        <span className="font-medium">{getRelativeTimeInBengali(article.published_at)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">পড়ার অগ্রগতি</span>
                        <span className="font-medium">{Math.round(readingProgress)}%</span>
                      </div>
                      
                      <Progress value={readingProgress} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Related Articles in Sidebar */}
                {relatedArticles.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4 flex items-center">
                        <ChevronRight className="w-4 h-4 mr-2" />
                        সম্পর্কিত খবর
                      </h3>
                      
                      <div className="space-y-4">
                        {relatedArticles.slice(0, 4).map((related) => (
                          <Link 
                            key={related.id} 
                            href={`/article/${related.slug}`} 
                            className="block group hover:bg-muted/50 rounded-lg p-2 transition-colors"
                          >
                            <div className="flex gap-3">
                              <img 
                                src={related.image_url} 
                                alt={related.title}
                                className="w-16 h-16 object-cover rounded-md flex-shrink-0" 
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                  {related.title}
                                </h4>
                                <div className="text-xs text-muted-foreground">
                                  {getRelativeTimeInBengali(related.published_at)}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      
                      {relatedArticles.length > 4 && (
                        <div className="mt-4 pt-4 border-t">
                          <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={`/category/${article.category.slug}`}>
                              আরও দেখুন
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleDetail;
