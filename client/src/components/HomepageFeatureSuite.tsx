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
  Search,
  Sparkles
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
      console.log('[AI Discovery] Generated trending insights for guest user');
      
      // 🔥 VERCEL FIX: Use direct Supabase API instead of Express endpoint
      const { VercelSafeAPI } = await import('../lib/vercel-safe-api');
      return VercelSafeAPI.getTrendingTopics(6);
    },
  });

  // Enhanced AI-powered personalized content discovery
  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        if (user?.id) {
          // Get comprehensive AI recommendations for logged-in users
          const { getAIRecommendations } = await import('../lib/vercel-safe-ai-service');
          const result = await getAIRecommendations(user.id, 5);
          
          if (result.success) {
            setAiInsights({
              articles: result.data.articles,
              type: 'personalized',
              userPreferences: [],
              aiRecommendations: true
            });
            console.log('[AI Discovery] Generated personalized insights:', result.data);
          }
        } else {
          // Get AI-powered trending articles for non-logged users
          const { getAIPopularArticles } = await import('../lib/vercel-safe-ai-service');
          const result = await getAIPopularArticles('weekly', 5);
          
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
        const fallbackCategories = await getCategories();
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
              জনপ্রিয়
              <Badge variant="outline" className="text-xs">লাইভ</Badge>
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

          {/* AI Personal Insights - World-Class UX/UI Design */}
          {aiInsights && (
            <div className="space-y-3">
              {/* Modern Header with AI Badge */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  {user ? 'আপনার জন্য বিশেষ সুবিধা' : 'জনপ্রিয় সুপারিশ'}
                </h4>
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-300 dark:border-blue-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </div>

              {/* Enhanced Card-Based Layout - 2025 Design Trends */}
              <div className="grid grid-cols-1 gap-3">
                {aiInsights.articles?.slice(0, 3).map((article: any, index: number) => (
                  <Link key={article.id || index} href={`/article/${article.slug}`}>
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 border border-gray-200/60 dark:border-gray-700/60 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer">
                      {/* Content Container with Perfect Spacing */}
                      <div className="p-4">
                        {/* Article Title with Better Typography */}
                        <h5 className="font-medium text-sm leading-relaxed text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
                          {article.title}
                        </h5>
                        
                        {/* Enhanced Metadata Section */}
                        <div className="flex items-center justify-between mt-3">
                          {/* AI Score with Modern Design */}
                          {(article.aiScore || article.relevance_score) && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                              <Star className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-current" />
                              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                {Math.round(article.aiScore || article.relevance_score)} স্কোর
                              </span>
                            </div>
                          )}
                          
                          {/* Category Badge */}
                          {article.category_name && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white/80 dark:bg-gray-800/80 border-gray-300/60 dark:border-gray-600/60">
                              {article.category_name}
                            </Badge>
                          )}
                        </div>

                        {/* Reading Time Indicator */}
                        {article.reading_time && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{article.reading_time} মিনিট পড়া</span>
                          </div>
                        )}
                      </div>

                      {/* Subtle Hover Effect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      
                      {/* Bottom Accent Line */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Enhanced CTA with Modern Styling */}
              {user && aiInsights.articles?.length > 0 && (
                <Link href="/dashboard">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/5 border-gray-200 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    আরো ব্যক্তিগত সুপারিশ দেখুন
                  </Button>
                </Link>
              )}
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
      console.log('[AI Trending] Generating AI-powered trending topics...');
      
      // 🔥 VERCEL FIX: Use direct Supabase API instead of Express endpoint  
      const { VercelSafeAPI } = await import('../lib/vercel-safe-api');
      const topics = await VercelSafeAPI.getTrendingTopics(8);
      
      return topics.map((topic: any) => ({
        id: topic.topic,
        topic_name: topic.topic,
        mention_count: topic.score,
        trending_score: topic.score / 100,
        sentiment: topic.sentiment || 'নিরপেক্ষ'
      }));
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
          বিষয়
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
        // 🔥 VERCEL FIX: Use direct Supabase API instead of Express endpoint
        const { VercelSafeAPI } = await import('../lib/vercel-safe-api');
        const result = await VercelSafeAPI.getUserAnalytics(user.id);
        
        setAiAnalytics(result);
        console.log('[AI Reading Stats] Generated comprehensive analytics:', result);
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
                  পাঠ বিশ্লেষণ
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