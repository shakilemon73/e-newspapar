import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  BookOpen, 
  Eye, 
  Star,
  Filter,
  Grid,
  List,
  Search,
  ArrowRight,
  ChevronRight,
  Heart,
  Share2,
  Bookmark,
  Play,
  Headphones,
  Calendar,
  Tag,
  Target,
  Zap,
  Trophy,
  Award,
  Flame,
  ThumbsUp,
  MessageCircle,
  Volume2,
  Settings,
  User,
  Globe,
  DollarSign
} from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DateFormatter } from './DateFormatter';
import { ReadingTimeEstimator } from './AccessibilityEnhancements';
import { EnhancedArticleCard } from './UXEnhancementSuite';
import { SiteName } from '@/hooks/use-global-site-name';

// Personalized Recommendations Widget
const PersonalizedRecommendationsWidget: React.FC = () => {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/articles/featured'],
    queryFn: async () => {
      const { getFeaturedArticles } = await import('../lib/supabase-api-direct');
      return getFeaturedArticles(5);
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-16 h-16 bg-muted rounded animate-pulse" />
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
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-primary" />
          <span>আপনার জন্য সুপারিশ</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations?.slice(0, 3).map((article: any) => (
            <Link key={article.id} href={`/article/${article.slug}`}>
              <div className="flex space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <img 
                  src={article.image_url || article.imageUrl || '/api/placeholder/64/64'} 
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/api/placeholder/64/64';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                    {article.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <DateFormatter date={article.published_at} type="relative" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/personalized">
            <Button variant="outline" size="sm" className="w-full">
              আরও দেখুন <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Trending Topics Widget
const TrendingTopicsWidget: React.FC = () => {
  const trendingTopics = [
    { name: "নির্বাচন", count: 247, growth: 15 },
    { name: "অর্থনীতি", count: 189, growth: 8 },
    { name: "খেলাধুলা", count: 156, growth: 22 },
    { name: "প্রযুক্তি", count: 134, growth: 12 },
    { name: "বিনোদন", count: 98, growth: 5 }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>ট্রেন্ডিং বিষয়</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <Link key={topic.name} href={`/search?q=${topic.name}`}>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-muted-foreground w-4">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-semibold">{topic.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {topic.count} টি নিবন্ধ
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    +{topic.growth}%
                  </Badge>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Reading Progress Widget
const ReadingProgressWidget: React.FC = () => {
  const [todayProgress, setTodayProgress] = useState(65);
  const [weeklyGoal, setWeeklyGoal] = useState(10);
  const [articlesRead, setArticlesRead] = useState(7);

  const achievements = [
    { id: 1, name: "নিয়মিত পাঠক", icon: BookOpen, earned: true },
    { id: 2, name: "দ্রুত পাঠক", icon: Zap, earned: true },
    { id: 3, name: "বিশেষজ্ঞ পাঠক", icon: Trophy, earned: false },
    { id: 4, name: "সাপ্তাহিক চ্যাম্পিয়ন", icon: Award, earned: false }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span>পড়ার অগ্রগতি</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Today's Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">আজকের পড়া</span>
              <span className="text-sm text-muted-foreground">{todayProgress}%</span>
            </div>
            <Progress value={todayProgress} className="h-2" />
          </div>

          {/* Weekly Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">সাপ্তাহিক লক্ষ্য</span>
              <span className="text-sm text-muted-foreground">{articlesRead}/{weeklyGoal}</span>
            </div>
            <Progress value={(articlesRead / weeklyGoal) * 100} className="h-2" />
          </div>

          {/* Achievements */}
          <div>
            <h4 className="font-semibold mb-2">অর্জন</h4>
            <div className="grid grid-cols-2 gap-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${
                    achievement.earned 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <achievement.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{achievement.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">127</div>
              <div className="text-xs text-muted-foreground">মোট পড়া</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">45</div>
              <div className="text-xs text-muted-foreground">এই সপ্তাহে</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Social Activity Widget
const SocialActivityWidget: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'like',
      user: 'রহিম উদ্দিন',
      article: 'বাংলাদেশের অর্থনৈতিক পরিস্থিতি',
      time: '৫ মিনিট আগে',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 2,
      type: 'comment',
      user: 'ফাতেমা খাতুন',
      article: 'শিক্ষা ব্যবস্থার উন্নতি',
      time: '১০ মিনিট আগে',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 3,
      type: 'share',
      user: 'করিম আহমেদ',
      article: 'প্রযুক্তির অগ্রগতি',
      time: '১৫ মিনিট আগে',
      avatar: '/api/placeholder/32/32'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'share': return <Share2 className="w-4 h-4 text-green-500" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary" />
          <span>সামাজিক কার্যক্রম</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={activity.avatar} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getActivityIcon(activity.type)}
                    <span className="text-sm font-medium">{activity.user}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.article}
                  </p>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Content Categories Widget
const ContentCategoriesWidget: React.FC = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { getCategories } = await import('../lib/supabase-api-direct');
      return getCategories();
    },
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="w-32 h-6 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryIcons = {
    'politics': Tag,
    'international': Globe,
    'economy': DollarSign,
    'sports': Trophy,
    'tech': Zap,
    'entertainment': Star,
    'lifestyle': Heart,
    'health': Heart
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Grid className="w-5 h-5 text-primary" />
          <span>বিষয় অনুযায়ী</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {categories?.slice(0, 6).map((category: any) => {
            const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Tag;
            return (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-3 flex flex-col items-center space-y-1 hover:bg-primary/10"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs">{category.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Enhanced Homepage Component
export const EnhancedHomepage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: featuredArticles, isLoading: featuredLoading } = useQuery({
    queryKey: ['/api/articles/featured'],
    queryFn: async () => {
      const { getFeaturedArticles } = await import('../lib/supabase-api-direct');
      return getFeaturedArticles();
    },
  });

  const { data: latestArticles, isLoading: latestLoading } = useQuery({
    queryKey: ['/api/articles/latest'],
    queryFn: async () => {
      const { getLatestArticles } = await import('../lib/supabase-api-direct');
      return getLatestArticles();
    },
  });

  const { data: popularArticles, isLoading: popularLoading } = useQuery({
    queryKey: ['popular-articles'],
    queryFn: async () => {
      const { getPopularArticles } = await import('../lib/supabase-api-direct');
      return getPopularArticles(6);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container-modern py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              <SiteName />
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র
            </p>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>৫০ লক্ষ+ পাঠক</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>২৪/৭ আপডেট</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>বিশ্বস্ত সংবাদ</span>
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Content Grid */}
      <section className="container-modern py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Featured Articles Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center space-x-2">
                    <Star className="w-6 h-6 text-primary" />
                    <span>প্রধান সংবাদ</span>
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {featuredLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-muted rounded-t-lg" />
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {featuredArticles?.map((article: any) => (
                      <EnhancedArticleCard
                        key={article.id}
                        article={article}
                        showEngagement={true}
                        showReadingTime={true}
                        compact={viewMode === 'list'}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Latest Articles Section */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-primary" />
                  <span>সর্বশেষ সংবাদ</span>
                </h2>

                {latestLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="flex space-x-4">
                            <div className="w-24 h-24 bg-muted rounded" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4" />
                              <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {latestArticles?.map((article: any) => (
                      <EnhancedArticleCard
                        key={article.id}
                        article={article}
                        showEngagement={true}
                        showReadingTime={true}
                        compact={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            <PersonalizedRecommendationsWidget />
            <TrendingTopicsWidget />
            <ReadingProgressWidget />
            <SocialActivityWidget />
            <ContentCategoriesWidget />
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedHomepage;