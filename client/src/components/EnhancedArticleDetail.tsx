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
  image_url: string;
  category_id: number;
  is_featured: boolean;
  view_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
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
          src={article.image_url} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
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
    queryKey: [`/api/categories/${categorySlug}/articles`],
    queryFn: () => fetch(`/api/categories/${categorySlug}/articles`).then(res => res.json()),
  });

  const filteredArticles = relatedArticles?.filter((article: Article) => 
    article.id !== currentId
  ).slice(0, 3);

  if (!filteredArticles || filteredArticles.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2" />
        সম্পর্কিত নিবন্ধ
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredArticles.map((article: Article) => (
          <Link key={article.id} href={`/article/${article.slug}`}>
            <EnhancedArticleCard 
              article={article}
              showEngagement={true}
              showReadingTime={true}
              compact={true}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

// Article Navigation Component
const ArticleNavigation: React.FC<{ currentSlug: string }> = ({ currentSlug }) => {
  const { data: articles } = useQuery({
    queryKey: ['/api/articles'],
  });

  const currentIndex = articles?.findIndex((article: Article) => article.slug === currentSlug);
  const previousArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles?.length - 1 ? articles[currentIndex + 1] : null;

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
    queryKey: [`/api/articles/${slug}`],
    queryFn: () => fetch(`/api/articles/${slug}`).then(res => {
      if (!res.ok) throw new Error('Article not found');
      return res.json();
    }),
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
          content={article.content}
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