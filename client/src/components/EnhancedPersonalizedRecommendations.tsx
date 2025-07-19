import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Share2, Clock, TrendingUp, Star, Eye, ThumbsUp } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';

interface EnhancedArticle {
  id: number;
  title: string;
  excerpt: string;
  image_url: string;
  published_at: string;
  category_name: string;
  recommendation_score: number;
  reason: string;
  article_analytics?: {
    engagement_score: number;
    trending_score: number;
    view_count: number;
  };
}

interface UserPreference {
  category_id: number;
  interest_score: number;
  categories: {
    name: string;
    slug: string;
  };
}

export const EnhancedPersonalizedRecommendations = () => {
  const [recommendations, setRecommendations] = useState<EnhancedArticle[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingInteractions, setTrackingInteractions] = useState<Record<number, boolean>>({});
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user?.access_token) {
      fetchRecommendations();
      fetchUserPreferences();
    } else {
      // If user is not authenticated, show popular articles instead
      fetchPopularArticles();
    }
  }, [user]);

  const fetchPopularArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/articles/popular?limit=12');
      
      if (!response.ok) {
        throw new Error('Failed to fetch popular articles');
      }

      const data = await response.json();
      const transformedData = data.map((article: any) => ({
        ...article,
        recommendation_score: 0.8,
        reason: 'জনপ্রিয় খবর',
        category_name: article.category?.name || 'সাধারণ',
        image_url: article.imageUrl || article.image_url
      }));
      
      setRecommendations(transformedData);
    } catch (err: any) {
      setError('জনপ্রিয় খবর লোড করতে সমস্যা হয়েছে');
      console.error('Error fetching popular articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated first
      if (!user?.access_token) {
        // Fallback to popular articles for non-authenticated users
        await fetchPopularArticles();
        return;
      }
      
      const response = await fetch('/api/personalized-recommendations?limit=12', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        setError('লগইন সেশন মেয়াদ শেষ। পুনরায় লগইন করুন।');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch recommendations`);
      }

      const data = await response.json();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const errorMessage = err.message || 'ব্যক্তিগতকৃত সুপারিশ লোড করতে সমস্যা হয়েছে';
      setError(errorMessage);
      console.error('Error fetching personalized recommendations:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        user: user ? 'authenticated' : 'not authenticated'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      
      if (response.ok) {
        const data = await response.json();
        setUserPreferences(data);
      }
    } catch (err) {
      console.error('Error fetching user preferences:', err);
    }
  };

  const trackInteraction = async (articleId: number, interactionType: string, duration?: number) => {
    if (!user || trackingInteractions[articleId]) return;

    setTrackingInteractions(prev => ({ ...prev, [articleId]: true }));

    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          interactionType,
          duration: duration || 0,
          metadata: {
            source: 'personalized_recommendations',
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (err) {
      console.error('Error tracking interaction:', err);
    } finally {
      setTrackingInteractions(prev => ({ ...prev, [articleId]: false }));
    }
  };

  const handleArticleClick = (article: EnhancedArticle) => {
    trackInteraction(article.id, 'view', 0);
    window.open(`/article/${article.id}`, '_blank');
  };

  const handleShare = (article: EnhancedArticle) => {
    trackInteraction(article.id, 'share');
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: `${window.location.origin}/article/${article.id}`
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = `${window.location.origin}/article/${article.id}`;
      navigator.clipboard.writeText(url);
    }
  };

  const handleLike = (article: EnhancedArticle) => {
    trackInteraction(article.id, 'like');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'কয়েক মিনিট আগে';
    if (diffInHours < 24) return `${diffInHours} ঘন্টা আগে`;
    if (diffInHours < 48) return 'গতকাল';
    return date.toLocaleDateString('bn-BD');
  };

  const getRecommendationBadgeColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-blue-100 text-blue-800';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          ব্যক্তিগতকৃত সুপারিশ দেখতে অনুগ্রহ করে লগইন করুন।
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <span>{user?.access_token ? 'আপনার জন্য বিশেষ সুপারিশ' : 'জনপ্রিয় খবর'}</span>
          </h2>
          <p className="text-gray-600 mt-1">
            {user?.access_token ? 'আপনার পছন্দ অনুযায়ী বাছাই করা খবর' : 'সবচেয়ে পঠিত খবরগুলো'}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {recommendations.length} টি সুপারিশ
        </div>
      </div>

      {/* User Preferences Summary */}
      {userPreferences.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>আপনার আগ্রহের বিষয়</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userPreferences.slice(0, 5).map((pref, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  {pref.categories.name}
                  <span className="ml-1 text-xs">
                    ({Math.round(pref.interest_score * 100)}%)
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((article) => (
          <Card 
            key={article.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleArticleClick(article)}
          >
            <div className="relative">
              <img 
                src={article.image_url || '/placeholder-news.jpg'} 
                alt={article.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2">
                <Badge 
                  className={`${getRecommendationBadgeColor(article.recommendation_score)} text-xs`}
                >
                  {Math.round(article.recommendation_score * 100)}% ম্যাচ
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  {article.category_name}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {article.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(article.published_at)}</span>
                </div>
                {article.article_analytics && (
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.article_analytics.view_count}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-blue-600 font-medium">
                  {article.reason}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(article);
                    }}
                    className="p-1 h-8 w-8"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(article);
                    }}
                    className="p-1 h-8 w-8"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <Star className="w-12 h-12 mx-auto mb-2" />
            <p>এখনও কোন ব্যক্তিগত সুপারিশ নেই</p>
            <p className="text-sm mt-1">
              আরও খবর পড়ুন যাতে আমরা আপনার জন্য বিশেষ সুপারিশ তৈরি করতে পারি
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            খবর পড়া শুরু করুন
          </Button>
        </Card>
      )}
    </div>
  );
};

export default EnhancedPersonalizedRecommendations;