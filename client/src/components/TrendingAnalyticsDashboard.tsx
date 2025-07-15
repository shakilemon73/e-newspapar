import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle, 
  Clock, 
  Users, 
  BarChart3, 
  Activity 
} from 'lucide-react';

interface TrendingArticle {
  id: number;
  title: string;
  trending_score: number;
  view_count: number;
  engagement_score: number;
  category_name: string;
  published_at: string;
}

interface TrendingTopic {
  id: number;
  topic_name: string;
  mention_count: number;
  trending_score: number;
  created_at: string;
  categories?: {
    name: string;
    slug: string;
  };
}

interface ArticleAnalytics {
  article_id: number;
  title: string;
  view_count: number;
  engagement_score: number;
  trending_score: number;
  share_count: number;
  like_count: number;
  comment_count: number;
}

export const TrendingAnalyticsDashboard = () => {
  const [trendingArticles, setTrendingArticles] = useState<TrendingArticle[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [popularArticles, setPopularArticles] = useState<TrendingArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    fetchTrendingData();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchTrendingData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchTrendingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trendingRes, topicsRes, popularRes] = await Promise.all([
        fetch('/api/articles/trending-advanced?limit=10'),
        fetch('/api/trending-topics?limit=10'),
        fetch('/api/articles/popular-advanced?limit=10')
      ]);

      if (trendingRes.ok) {
        const trendingData = await trendingRes.json();
        setTrendingArticles(trendingData);
      }

      if (topicsRes.ok) {
        const topicsData = await topicsRes.json();
        setTrendingTopics(topicsData);
      }

      if (popularRes.ok) {
        const popularData = await popularRes.json();
        setPopularArticles(popularData);
      }
    } catch (err) {
      setError('ট্রেন্ডিং ডেটা লোড করতে সমস্যা হয়েছে');
      console.error('Error fetching trending data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} মিনিট আগে`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ঘন্টা আগে`;
    return date.toLocaleDateString('bn-BD');
  };

  const getTrendingIcon = (score: number) => {
    if (score > 0.7) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (score > 0.4) return <Activity className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTrendingColor = (score: number) => {
    if (score > 0.7) return 'text-green-600';
    if (score > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementLevel = (score: number) => {
    if (score > 50) return { level: 'উচ্চ', color: 'bg-green-100 text-green-800' };
    if (score > 20) return { level: 'মধ্যম', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'নিম্ন', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <Activity className="w-12 h-12 mx-auto mb-2" />
          <p>{error}</p>
        </div>
        <Button onClick={fetchTrendingData} variant="outline">
          আবার চেষ্টা করুন
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span>ট্রেন্ডিং এনালিটিক্স</span>
          </h2>
          <p className="text-gray-600 mt-1">
            রিয়েল-টাইম জনপ্রিয় খবর এবং বিষয়
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            <Activity className="w-3 h-3 mr-1" />
            সক্রিয়
          </Badge>
          <Button onClick={fetchTrendingData} variant="outline" size="sm">
            রিফ্রেশ করুন
          </Button>
        </div>
      </div>

      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trending">ট্রেন্ডিং খবর</TabsTrigger>
          <TabsTrigger value="popular">জনপ্রিয় খবর</TabsTrigger>
          <TabsTrigger value="topics">ট্রেন্ডিং বিষয়</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>এখনই ট্রেন্ডিং</span>
                <Badge variant="secondary">{trendingArticles.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingArticles.map((article, index) => (
                  <div 
                    key={article.id}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => window.open(`/article/${article.id}`, '_blank')}
                  >
                    <div className="flex-shrink-0">
                      <Badge className="bg-blue-100 text-blue-800">
                        #{index + 1}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate mb-1">
                        {article.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.view_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge variant="outline" className="text-xs">
                            {article.category_name}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {getTrendingIcon(article.trending_score)}
                          <span className={`text-sm font-medium ${getTrendingColor(article.trending_score)}`}>
                            {Math.round(article.trending_score * 100)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          ট্রেন্ডিং স্কোর
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>জনপ্রিয় খবর</span>
                <Badge variant="secondary">{popularArticles.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <div 
                    key={article.id}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => window.open(`/article/${article.id}`, '_blank')}
                  >
                    <div className="flex-shrink-0">
                      <Badge className="bg-green-100 text-green-800">
                        #{index + 1}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate mb-1">
                        {article.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.view_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge variant="outline" className="text-xs">
                            {article.category_name}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {Math.round(article.engagement_score)}
                        </div>
                        <div className="text-xs text-gray-500">
                          এনগেজমেন্ট
                        </div>
                        <Progress 
                          value={Math.min(article.engagement_score, 100)} 
                          className="w-16 h-2 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>ট্রেন্ডিং বিষয়</span>
                <Badge variant="secondary">{trendingTopics.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingTopics.map((topic, index) => (
                  <div 
                    key={topic.id}
                    className="p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        #{index + 1}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getTrendingIcon(topic.trending_score)}
                        <span className={`text-sm font-medium ${getTrendingColor(topic.trending_score)}`}>
                          {Math.round(topic.trending_score * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">
                      {topic.topic_name}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{topic.mention_count} উল্লেখ</span>
                      </div>
                      {topic.categories && (
                        <Badge variant="outline" className="text-xs">
                          {topic.categories.name}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        ট্রেন্ডিং স্কোর
                      </div>
                      <Progress 
                        value={Math.min(topic.trending_score * 100, 100)} 
                        className="w-full h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Stats Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>রিয়েল-টাইম পরিসংখ্যান</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {trendingArticles.length}
              </div>
              <div className="text-sm text-gray-500">ট্রেন্ডিং খবর</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {popularArticles.length}
              </div>
              <div className="text-sm text-gray-500">জনপ্রিয় খবর</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {trendingTopics.length}
              </div>
              <div className="text-sm text-gray-500">ট্রেন্ডিং বিষয়</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(trendingArticles.reduce((acc, art) => acc + art.view_count, 0) / 1000)}K
              </div>
              <div className="text-sm text-gray-500">মোট ভিউ</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingAnalyticsDashboard;