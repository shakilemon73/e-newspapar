import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Compass, 
  TrendingUp, 
  Settings, 
  Users, 
  Star, 
  BarChart3, 
  Heart, 
  BookOpen, 
  User, 
  LogIn,
  ChevronRight,
  Target,
  Clock,
  Eye,
  Bookmark,
  Filter,
  Search
} from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';

// আবিষ্কার করুন (Discovery) Widget
export const DiscoveryWidget = () => {
  const { user } = useSupabaseAuth();
  const [aiInsights, setAiInsights] = useState<any>(null);
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { getCategories } = await import('../lib/supabase-api-direct');
      return getCategories();
    },
  });

  const { data: trendingTopics } = useQuery({
    queryKey: ['ai-discovery-trending'],
    queryFn: async () => {
      // Use AI-powered trending topics for discovery
      const response = await fetch('/api/ai/trending-topics?limit=6');
      const result = await response.json();
      
      if (result.success && result.data?.topics) {
        return result.data.topics;
      }
      
      // Fallback to direct API if AI fails
      const { getTrendingTopics } = await import('../lib/supabase-api-direct');
      return getTrendingTopics(6);
    },
  });

  // Enhanced AI-powered personalized content discovery
  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        if (user?.id) {
          // Get comprehensive AI recommendations for logged-in users
          const response = await fetch(`/api/ai/recommendations/${user.id}?limit=5`);
          const result = await response.json();
          
          if (result.success) {
            setAiInsights({
              ...result.data,
              type: 'personalized',
              userPreferences: result.data.userPreferences,
              aiRecommendations: true
            });
            console.log('[AI Discovery] Generated personalized insights:', result.data);
          }
        } else {
          // Get AI-powered trending articles for non-logged users
          const response = await fetch('/api/ai/popular/weekly?limit=5');
          const result = await response.json();
          
          if (result.success) {
            setAiInsights({ 
              articles: result.data.articles,
              type: 'trending',
              aiPowered: true
            });
            console.log('[AI Discovery] Generated trending insights for guest user');
          }
        }
      } catch (error) {
        console.warn('[AI Discovery] Failed to fetch insights:', error);
        // Fallback to regular categories for discovery
        const { getCategories } = await import('../lib/supabase-api-direct');
        const fallbackCategories = await getCategories(3);
        setAiInsights({ 
          categories: fallbackCategories,
          type: 'fallback'
        });
      }
    };

    fetchAIInsights();
  }, [user?.id]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="w-24 h-5 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Compass className="w-5 h-5 mr-2 text-primary" />
          আবিষ্কার করুন
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Categories */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">বিভাগসমূহ</h4>
            <div className="grid grid-cols-2 gap-2">
              {categories?.slice(0, 6).map((category: any) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs h-8">
                    {category.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* AI-Powered Trending Topics */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
              ট্রেন্ডিং
              <Badge variant="outline" className="text-xs">AI</Badge>
            </h4>
            <div className="space-y-2">
              {trendingTopics?.slice(0, 4).map((topic: any, index: number) => (
                <div key={topic.id || index} className="flex items-center justify-between p-1 rounded hover:bg-muted/50">
                  <Badge 
                    variant={topic.sentiment === 'ইতিবাচক' ? 'default' : topic.sentiment === 'নেতিবাচক' ? 'destructive' : 'secondary'} 
                    className="text-xs"
                  >
                    #{topic.topic_name || topic.topic}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {topic.mention_count || topic.score} স্কোর
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Personal Insights */}
          {aiInsights && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                {user ? 'আপনার জন্য' : 'জনপ্রিয়'}
                <Badge variant="outline" className="text-xs">AI</Badge>
              </h4>
              <div className="space-y-2">
                {aiInsights.articles?.slice(0, 2).map((article: any, index: number) => (
                  <Link key={article.id || index} href={`/article/${article.slug}`}>
                    <div className="p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <p className="text-xs font-medium line-clamp-2">{article.title}</p>
                      {article.aiScore && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">{article.aiScore} AI স্কোর</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link href="/search">
            <Button className="w-full" size="sm">
              <Search className="w-4 h-4 mr-2" />
              উন্নত অনুসন্ধান
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// ট্রেন্ডিং বিষয় (Trending Topics) Widget
export const TrendingTopicsWidget = () => {
  const { data: trendingTopics, isLoading } = useQuery({
    queryKey: ['ai-trending-topics-widget'],
    queryFn: async () => {
      // Use AI-powered trending topics
      const response = await fetch('/api/ai/trending-topics?limit=8');
      const result = await response.json();
      
      if (result.success && result.data?.topics) {
        return result.data.topics.map((topic: any) => ({
          id: topic.topic,
          topic_name: topic.topic,
          mention_count: topic.score,
          trending_score: topic.score / 100,
          sentiment: topic.sentiment
        }));
      }
      
      // Fallback to direct API if AI fails
      const { getTrendingTopics } = await import('../lib/supabase-api-direct');
      return getTrendingTopics(8);
    },
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="w-32 h-5 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                <div className="w-12 h-4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          ট্রেন্ডিং বিষয়
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {trendingTopics?.map((topic: any, index: number) => (
              <div key={topic.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">#{topic.topic_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{topic.mention_count} স্কোর</span>
                      {topic.sentiment && (
                        <Badge 
                          variant={topic.sentiment === 'ইতিবাচক' ? 'default' : topic.sentiment === 'নেতিবাচক' ? 'destructive' : 'secondary'} 
                          className="text-xs"
                        >
                          {topic.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  AI র‍্যাঙ্ক: #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// আপনার পড়ার পরিসংখ্যান (Reading Statistics) Widget
export const ReadingStatsWidget = () => {
  const { user } = useSupabaseAuth();
  const [aiAnalytics, setAiAnalytics] = useState<any>(null);
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { getUserStats } = await import('../lib/supabase-api-direct');
      return await getUserStats(user.id);
    },
    enabled: !!user,
  });

  // AI-powered reading behavior analysis
  useEffect(() => {
    const fetchAIAnalytics = async () => {
      if (!user?.id) return;
      
      try {
        // Get comprehensive AI-enhanced reading analytics
        const response = await fetch(`/api/ai/user-analytics/${user.id}`);
        const result = await response.json();
        
        if (result.success) {
          setAiAnalytics(result.data);
          console.log('[AI Reading Stats] Generated comprehensive analytics:', result.data);
        }
      } catch (error) {
        console.warn('[AI Reading Stats] Failed to fetch analytics:', error);
      }
    };

    fetchAIAnalytics();
  }, [user?.id]);

  if (!user) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            আপনার পড়ার পরিসংখ্যান
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <User className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center mb-4">
            পরিসংখ্যান দেখতে লগইন করুন
          </p>
          <Link href="/login">
            <Button size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              লগইন করুন
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="w-40 h-5 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                <div className="w-full h-2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const userStats = {
    articles_read: stats?.articles_read || 0,
    articles_saved: stats?.articles_saved || 0,
    reading_streak: stats?.reading_streak || 0,
    total_reading_time: stats?.total_reading_time || 0,
    categories_explored: stats?.categories_explored || 0,
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          আপনার পড়ার পরিসংখ্যান
          <Badge variant="outline" className="text-xs ml-2">AI বিশ্লেষণ</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {userStats.articles_read}
              </p>
              <p className="text-xs text-muted-foreground">পড়া নিবন্ধ</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {userStats.reading_streak}
              </p>
              <p className="text-xs text-muted-foreground">দিনের স্ট্রিক</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-blue-500" />
                <span className="text-sm">সংরক্ষিত</span>
              </div>
              <span className="text-sm font-medium">{userStats.articles_saved}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm">পড়ার সময়</span>
              </div>
              <span className="text-sm font-medium">{userStats.total_reading_time} মিনিট</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="text-sm">বিভাগ অন্বেষণ</span>
              </div>
              <span className="text-sm font-medium">{userStats.categories_explored}</span>
            </div>
          </div>

          {/* AI Analytics Insights */}
          {aiAnalytics && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                  AI অন্তর্দৃষ্টি
                  <Badge variant="outline" className="text-xs">নতুন</Badge>
                </h4>
                
                {aiAnalytics.readingPattern && (
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-3 h-3 text-blue-500" />
                      <span className="text-xs font-medium">পড়ার প্যাটার্ন</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{aiAnalytics.readingPattern}</p>
                  </div>
                )}
                
                {aiAnalytics.preferredTopics && (
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span className="text-xs font-medium">পছন্দের বিষয়</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {aiAnalytics.preferredTopics.slice(0, 3).map((topic: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {aiAnalytics.engagementScore && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">সম্পৃক্ততা স্কোর</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={aiAnalytics.engagementScore} className="w-16 h-2" />
                      <span className="text-xs font-medium">{aiAnalytics.engagementScore}%</span>
                    </div>
                  </div>
                )}
                
                {/* Enhanced AI Insights */}
                {aiAnalytics.aiInsights && (
                  <>
                    {aiAnalytics.aiInsights.weeklyGrowth && (
                      <div className="p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-xs font-medium">সাপ্তাহিক বৃদ্ধি</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{aiAnalytics.aiInsights.weeklyGrowth}</p>
                      </div>
                    )}
                    
                    {aiAnalytics.aiInsights.readingConsistency && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">নিয়মিততা</span>
                        </div>
                        <span className="text-xs font-medium">{aiAnalytics.aiInsights.readingConsistency}%</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          <Link href="/dashboard">
            <Button className="w-full" size="sm">
              বিস্তারিত দেখুন
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// সামাজিক কার্যক্রম (Social Activities) Widget  
export const SocialActivitiesWidget = () => {
  const { data: socialPosts, isLoading } = useQuery({
    queryKey: ['/api/social-media'],
    queryFn: async () => {
      const { getSocialMediaPosts } = await import('../lib/supabase-api-direct');
      return getSocialMediaPosts();
    },
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="w-32 h-5 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-full h-4 bg-muted rounded animate-pulse" />
                  <div className="w-3/4 h-3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Users className="w-5 h-5 mr-2 text-pink-600" />
          সামাজিক কার্যক্রম
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {socialPosts?.map((post: any) => (
              <div key={post.id} className="flex space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {post.platform?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {post.platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      {post.likes || 0}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {post.views || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// পড়ার পছন্দ (Reading Preferences) Widget
export const ReadingPreferencesWidget = () => {
  const { user } = useSupabaseAuth();
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/user/preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { getUserPreferences } = await import('../lib/supabase-api-direct');
      return getUserPreferences(user.id);
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            পড়ার পছন্দ
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Settings className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center mb-4">
            পছন্দ সেট করতে লগইন করুন
          </p>
          <Link href="/login">
            <Button size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              লগইন করুন
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="w-24 h-5 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                <div className="w-12 h-4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const defaultPreferences = {
    favorite_categories: ['রাজনীতি', 'খেলা', 'আন্তর্জাতিক'],
    notification_enabled: true,
    auto_save_enabled: false,
    reading_mode: 'normal',
  };

  const userPrefs = preferences || defaultPreferences;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Settings className="w-5 h-5 mr-2 text-gray-600" />
          পড়ার পছন্দ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">প্রিয় বিভাগ</h4>
            <div className="flex flex-wrap gap-2">
              {userPrefs.favorite_categories?.map((category: string, index: number) => (
                <Badge key={`category-${category}-${index}`} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">নোটিফিকেশন</span>
              <Badge variant={userPrefs.notification_enabled ? "default" : "outline"}>
                {userPrefs.notification_enabled ? 'চালু' : 'বন্ধ'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">অটো সেভ</span>
              <Badge variant={userPrefs.auto_save_enabled ? "default" : "outline"}>
                {userPrefs.auto_save_enabled ? 'চালু' : 'বন্ধ'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">পড়ার মোড</span>
              <Badge variant="secondary">
                {userPrefs.reading_mode === 'normal' ? 'সাধারণ' : 'ডার্ক'}
              </Badge>
            </div>
          </div>

          <Link href="/profile">
            <Button className="w-full" size="sm" variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              পছন্দ পরিবর্তন করুন
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Complete Feature Suite Component - Organized Layout
export const HomepageFeatureSuite = () => {
  return (
    <div className="space-y-8">
      {/* Top Row - Primary Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DiscoveryWidget />
        <TrendingTopicsWidget />
        <ReadingStatsWidget />
      </div>
      
      {/* Bottom Row - Secondary Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SocialActivitiesWidget />
        <ReadingPreferencesWidget />
      </div>
    </div>
  );
};