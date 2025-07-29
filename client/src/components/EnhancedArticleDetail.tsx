import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  Eye, 
  Clock, 
  Share2, 
  Heart, 
  MessageCircle, 
  BookOpen,
  ArrowLeft,
  ArrowRight,
  User,
  Tag,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { Link, useParams } from 'wouter';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { DateFormatter } from './DateFormatter';
import { ArticleSummary } from './ArticleSummary';
import { 
  ReadingProgressBar, 
  ArticleAccessibilityToolbar,
  ReadingTimeEstimator 
} from './AccessibilityEnhancements';
import { EnhancedArticleCard } from './UXEnhancementSuite';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string;
  image_metadata?: {
    caption?: string;
    place?: string;
    date?: string;
    photographer?: string;
    id?: string;
  };
  author?: string;
  category_id: number;
  is_featured: boolean;
  view_count: number;
  published_at: string;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  categories?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

interface EnhancedArticleDetailProps {
  slug: string;
}

// Enhanced Article Header Component
const EnhancedArticleHeader: React.FC<{ article: Article }> = ({ article }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast({
      title: isLiked ? "লাইক সরানো হয়েছে" : "লাইক করা হয়েছে",
      description: isLiked ? "নিবন্ধটি আপনার পছন্দের তালিকা থেকে সরানো হয়েছে" : "নিবন্ধটি আপনার পছন্দের তালিকায় যোগ করা হয়েছে"
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "সংরক্ষণ সরানো হয়েছে" : "সংরক্ষণ করা হয়েছে",
      description: isBookmarked ? "নিবন্ধটি আপনার সংরক্ষিত তালিকা থেকে সরানো হয়েছে" : "নিবন্ধটি আপনার সংরক্ষিত তালিকায় যোগ করা হয়েছে"
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "লিংক কপি করা হয়েছে",
        description: "নিবন্ধের লিংক ক্লিপবোর্ডে কপি করা হয়েছে"
      });
    }
  };

  return (
    <div className="relative">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg mb-6">
        <img 
          src={article.image_url || '/placeholder-800x450.svg'} 
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-800x450.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Image Metadata Display */}
        {article.image_metadata && (
          <div className="absolute bottom-20 right-6 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
            <Camera className="w-4 h-4 inline mr-2" />
            ছবির তথ্য
          </div>
        )}
        
        {/* Article Meta Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Link href={`/category/${article.category?.slug}`}>
              <Badge className="bg-primary hover:bg-primary/90">
                {article.category?.name}
              </Badge>
            </Link>
            <ReadingTimeEstimator content={article.content} />
            {article.is_featured && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100">
                <TrendingUp className="w-3 h-3 mr-1" />
                ফিচার্ড
              </Badge>
            )}
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <DateFormatter date={article.published_at} />
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {article.view_count.toLocaleString()} দর্শক
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBookmark}
                className={`flex items-center space-x-1 ${isBookmarked ? 'text-blue-500' : ''}`}
              >
                <BookOpen className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-1"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Article Content Component
const EnhancedArticleContent: React.FC<{ article: Article }> = ({ article }) => {
  const [showSummary, setShowSummary] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Article Summary */}
      <Card className="mb-6 bg-muted/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">নিবন্ধের সারাংশ</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSummary(!showSummary)}
            >
              {showSummary ? 'সংক্ষিপ্ত' : 'বিস্তারিত'}
            </Button>
          </div>
          
          {showSummary ? (
            <ArticleSummary content={article.content} maxLength={300} />
          ) : (
            <p className="text-muted-foreground">
              {article.excerpt}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Image Metadata Section */}
      {article.image_metadata && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800 dark:text-blue-200">
              <Camera className="w-5 h-5 mr-2" />
              ছবির বিস্তারিত তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {article.image_metadata.caption && (
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">ক্যাপশন</p>
                    <p className="text-sm text-muted-foreground">{article.image_metadata.caption}</p>
                  </div>
                </div>
              )}
              {article.image_metadata.place && (
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">স্থান</p>
                    <p className="text-sm text-muted-foreground">{article.image_metadata.place}</p>
                  </div>
                </div>
              )}
              {article.image_metadata.date && (
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">তারিখ</p>
                    <p className="text-sm text-muted-foreground">{article.image_metadata.date}</p>
                  </div>
                </div>
              )}
              {article.image_metadata.photographer && (
                <div className="flex items-start space-x-2">
                  <User className="w-4 h-4 text-orange-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">ফটোগ্রাফার</p>
                    <p className="text-sm text-muted-foreground">{article.image_metadata.photographer}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Author Information */}
      {article.author && (
        <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(article.author)}&background=059669&color=ffffff&size=48`} />
                <AvatarFallback className="bg-emerald-600 text-white">
                  {article.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">লেখক</h3>
                <p className="text-lg font-medium">{article.author}</p>
                <p className="text-sm text-muted-foreground">প্রতিবেদক</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Article Content */}
      <div className="prose prose-lg max-w-none">
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
          style={{
            fontSize: 'var(--reading-font-size, 16px)',
            fontFamily: 'var(--reading-font-family, system-ui)',
            lineHeight: 'var(--reading-line-height, 1.6)'
          }}
        />
      </div>

      {/* Article Stats and Engagement */}
      <Card className="mt-8 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-2">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold">{article.view_count}</p>
              <p className="text-sm text-muted-foreground">পঠিত</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-2">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">{Math.ceil(article.content.split(' ').length / 200)}</p>
              <p className="text-sm text-muted-foreground">মিনিট</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-2">
                <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">লাইক</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-2">
                <Share2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">শেয়ার</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Article Tags */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center space-x-2 mb-4">
          <Tag className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">ট্যাগসমূহ:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{article.category?.name}</Badge>
          <Badge variant="outline">সংবাদ</Badge>
          <Badge variant="outline">বাংলাদেশ</Badge>
          <Badge variant="outline">সর্বশেষ</Badge>
        </div>
      </div>
    </div>
  );
};

// Related Articles Component
const RelatedArticles: React.FC<{ categorySlug: string; currentId: number }> = ({ 
  categorySlug, 
  currentId 
}) => {
  const { data: relatedArticles } = useQuery({
    queryKey: ['related-articles', currentId],
    queryFn: async () => {
      if (!currentId) return [];
      const { getRelatedArticles } = await import('../lib/supabase-api-direct');
      return await getRelatedArticles(currentId, 3);
    },
    enabled: !!currentId
  });

  const filteredArticles = relatedArticles?.slice(0, 3);

  if (!filteredArticles || filteredArticles.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2" />
        সম্পর্কিত নিবন্ধ
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredArticles.map((article: any) => (
          <Link key={article.id} href={`/article/${article.slug}`}>
            <div className="group cursor-pointer transition-all duration-300 hover:bg-muted/50 rounded-lg p-4">
              <div className="flex gap-4">
                <img 
                  src={article.image_url || '/placeholder-300x176.svg'} 
                  alt={article.title}
                  className="w-20 h-20 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-300x176.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-base line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-2">
                    {article.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {article.excerpt}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {article.published_at ? getRelativeTimeInBengali(article.published_at) : 'কিছুক্ষণ আগে'}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Article Navigation Component
const ArticleNavigation: React.FC<{ currentSlug: string }> = ({ currentSlug }) => {
  const { data: articles } = useQuery({
    queryKey: ['all-articles-for-navigation'],
    queryFn: async () => {
      const { getLatestArticles } = await import('../lib/supabase-api-direct');
      return await getLatestArticles(100); // Get more articles for navigation
    },
  });

  const articlesArray = Array.isArray(articles) ? articles : [];
  const currentIndex = articlesArray.findIndex((article: any) => article.slug === currentSlug);
  const previousArticle = currentIndex > 0 ? articlesArray[currentIndex - 1] : null;
  const nextArticle = currentIndex < articlesArray.length - 1 ? articlesArray[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
      <div className="flex-1">
        {previousArticle && (
          <Link href={`/article/${previousArticle.slug}`}>
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">পূর্ববর্তী</div>
                <div className="font-medium line-clamp-1">{previousArticle.title}</div>
              </div>
            </Button>
          </Link>
        )}
      </div>
      
      <div className="flex-1 text-right">
        {nextArticle && (
          <Link href={`/article/${nextArticle.slug}`}>
            <Button variant="outline" className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">পরবর্তী</div>
                <div className="font-medium line-clamp-1">{nextArticle.title}</div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

// Main Enhanced Article Detail Component
export const EnhancedArticleDetail: React.FC<EnhancedArticleDetailProps> = ({ slug }) => {
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article-by-slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { getArticleBySlug } = await import('../lib/supabase-api-direct');
      return await getArticleBySlug(slug);
    },

  });

  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  if (isLoading) {
    return (
      <div className="container-modern py-8">
        <div className="animate-pulse">
          <div className="h-[400px] bg-muted rounded-lg mb-6"></div>
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container-modern py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">নিবন্ধ পাওয়া যায়নি</h1>
        <p className="text-muted-foreground mb-4">দুঃখিত, এই নিবন্ধটি খুঁজে পাওয়া যায়নি।</p>
        <Link href="/">
          <Button>হোম পেজে ফিরে যান</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgressBar />
      
      <div className="container-modern py-8">
        <EnhancedArticleHeader article={article} />
        
        <ArticleAccessibilityToolbar 
          content={article.content || ''}
          onBookmark={() => {}}
          onShare={() => {}}
        />
        
        <EnhancedArticleContent article={article} />
        
        <ArticleNavigation currentSlug={slug} />
        
        {article.category && (
          <RelatedArticles 
            categorySlug={article.category.slug} 
            currentId={article.id} 
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedArticleDetail;