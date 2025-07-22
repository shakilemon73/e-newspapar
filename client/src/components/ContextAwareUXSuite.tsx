import React, { useState, useEffect, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Heart, 
  Share2, 
  MessageCircle, 
  Clock, 
  Eye,
  Star,
  Award,
  Trophy,
  Zap,
  ChevronRight,
  User,
  Grid,
  Tag,
  Calendar,
  Bookmark,
  Play,
  Volume2,
  Settings,
  Filter,
  Search,
  BarChart,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateFormatter } from './DateFormatter';
import { ReadingTimeEstimator } from './AccessibilityEnhancements';
import { useToast } from '@/hooks/use-toast';

// Context-aware User Preferences Hook
const useUserPreferences = (userId: string | null) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { getUserPreferences } = await import('@/lib/supabase-api-direct');
      return await getUserPreferences(userId);
    },
    enabled: !!userId,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: any) => {
      if (!userId) throw new Error('No user ID');
      const { updateUserPreferences } = await import('@/lib/supabase-api-direct');
      return await updateUserPreferences(userId, newPreferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', userId] });
      toast({ title: 'পছন্দ আপডেট হয়েছে', description: 'আপনার পছন্দসমূহ সফলভাবে সংরক্ষিত হয়েছে' });
    },
    onError: () => {
      toast({ title: 'ত্রুটি', description: 'পছন্দ আপডেট করতে সমস্যা হয়েছে', variant: 'destructive' });
    }
  });

  return { preferences, isLoading, updatePreferences: updatePreferencesMutation.mutate };
};

// Real Supabase Personalized Recommendations
const PersonalizedRecommendationsWidget: React.FC<{ userId: string | null }> = ({ userId }) => {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['user-recommendations', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { getPersonalizedRecommendations } = await import('@/lib/supabase-api-direct');
      return await getPersonalizedRecommendations(userId);
    },
    enabled: !!userId,
  });

  const { data: fallbackRecommendations, isLoading: fallbackLoading } = useQuery({
    queryKey: ['featured-articles'],
    queryFn: async () => {
      const { getFeaturedArticles } = await import('@/lib/supabase-api-direct');
      return await getFeaturedArticles();
    },
    enabled: !userId,
  });

  const displayData = userId ? recommendations : fallbackRecommendations;
  const loading = userId ? isLoading : fallbackLoading;

  if (loading) {
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

  const title = userId ? 'আপনার জন্য সুপারিশ' : 'প্রধান সংবাদ';
  const icon = userId ? Target : Star;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {React.createElement(icon, { className: "w-5 h-5 text-primary" })}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.isArray(displayData) && displayData.slice(0, 3).map((article: any) => (
            <Link key={article.id} href={`/article/${article.slug}`}>
              <div className="flex space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <img 
                  src={article.image_url || article.imageUrl} 
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                    {article.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <DateFormatter date={article.published_at || article.publishedAt} type="relative" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link href={userId ? "/personalized" : "/articles"}>
            <Button variant="outline" size="sm" className="w-full">
              আরও দেখুন <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Real Supabase Trending Topics
const TrendingTopicsWidget: React.FC = () => {
  const { data: trendingTopics, isLoading } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      const { getTrendingTopics } = await import('@/lib/supabase-api-direct');
      return await getTrendingTopics();
    },
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="w-32 h-6 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                </div>
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
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>ট্রেন্ডিং বিষয়</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.isArray(trendingTopics) && trendingTopics.length > 0 ? (
            trendingTopics.slice(0, 5).map((topic: any, index: number) => (
              <Link key={topic.id} href={`/search?q=${topic.topic_name}`}>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-semibold">{topic.topic_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {topic.mention_count} টি উল্লেখ
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      +{topic.growth_percentage}%
                    </Badge>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">ট্রেন্ডিং বিষয় লোড হচ্ছে...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Real Supabase Reading Progress
const ReadingProgressWidget: React.FC<{ userId: string | null }> = ({ userId }) => {
  const { data: readingHistory, isLoading } = useQuery({
    queryKey: ['/api/user/reading-history', userId],
    queryFn: () => fetch(`/api/user/${userId}/reading-history`).then(res => res.json()),
    enabled: !!userId,
  });

  const { data: achievements } = useQuery({
    queryKey: ['/api/user/achievements', userId],
    queryFn: () => fetch(`/api/user/${userId}/achievements`).then(res => res.json()),
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>লগইন করুন</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              পড়ার অগ্রগতি দেখতে লগইন করুন
            </p>
            <Link href="/login">
              <Button>লগইন করুন</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="w-32 h-6 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full h-4 bg-muted rounded animate-pulse" />
            <div className="w-full h-4 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const todayArticles = readingHistory?.filter((item: any) => 
    new Date(item.read_at).toDateString() === new Date().toDateString()
  ).length || 0;

  const weeklyArticles = readingHistory?.filter((item: any) => {
    const readDate = new Date(item.read_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return readDate >= weekAgo;
  }).length || 0;

  const weeklyGoal = 10;
  const todayGoal = 3;

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
              <span className="text-sm text-muted-foreground">{todayArticles}/{todayGoal}</span>
            </div>
            <Progress value={(todayArticles / todayGoal) * 100} className="h-2" />
          </div>

          {/* Weekly Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">সাপ্তাহিক লক্ষ্য</span>
              <span className="text-sm text-muted-foreground">{weeklyArticles}/{weeklyGoal}</span>
            </div>
            <Progress value={(weeklyArticles / weeklyGoal) * 100} className="h-2" />
          </div>

          {/* Achievements */}
          <div>
            <h4 className="font-semibold mb-2">অর্জন</h4>
            <div className="grid grid-cols-2 gap-2">
              {achievements?.slice(0, 4).map((achievement: any) => (
                <div
                  key={achievement.id}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${
                    achievement.is_completed
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-medium">{achievement.achievement_name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{readingHistory?.length || 0}</div>
              <div className="text-xs text-muted-foreground">মোট পড়া</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{weeklyArticles}</div>
              <div className="text-xs text-muted-foreground">এই সপ্তাহে</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Real Supabase User Interactions
const UserInteractionsWidget: React.FC<{ userId: string | null }> = ({ userId }) => {
  const { data: interactions, isLoading } = useQuery({
    queryKey: ['/api/user/interactions', userId],
    queryFn: () => fetch(`/api/user/${userId}/interactions`).then(res => res.json()),
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>সামাজিক কার্যক্রম</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              সামাজিক কার্যক্রম দেখতে লগইন করুন
            </p>
            <Link href="/login">
              <Button variant="outline" size="sm">লগইন করুন</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="w-32 h-6 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-1/2 h-3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'share': return <Share2 className="w-4 h-4 text-green-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'bookmark': return <Bookmark className="w-4 h-4 text-yellow-500" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <span>আমার কার্যক্রম</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {interactions?.slice(0, 10).map((interaction: any) => (
              <div key={interaction.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getInteractionIcon(interaction.interaction_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/article/${interaction.article?.slug}`}>
                    <p className="text-sm font-medium hover:text-primary cursor-pointer line-clamp-2">
                      {interaction.article?.title}
                    </p>
                  </Link>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <span>{interaction.interaction_type === 'like' ? 'পছন্দ' : 
                            interaction.interaction_type === 'share' ? 'শেয়ার' :
                            interaction.interaction_type === 'bookmark' ? 'বুকমার্ক' : 'দেখেছেন'}</span>
                    <span>•</span>
                    <DateFormatter date={interaction.created_at} type="relative" />
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

// User Preferences Panel
const UserPreferencesPanel: React.FC<{ userId: string | null }> = ({ userId }) => {
  const { preferences, isLoading, updatePreferences } = useUserPreferences(userId);

  if (!userId) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>সেটিংস</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              সেটিংস দেখতে লগইন করুন
            </p>
            <Link href="/login">
              <Button variant="outline" size="sm">লগইন করুন</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="w-32 h-6 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                <div className="w-12 h-6 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handlePreferenceChange = (key: string, value: any) => {
    updatePreferences({
      ...preferences,
      [key]: value
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>পছন্দ সেটিংস</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">ডার্ক মোড</Label>
            <Switch
              id="dark-mode"
              checked={preferences?.dark_mode || false}
              onCheckedChange={(checked) => handlePreferenceChange('dark_mode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast">উচ্চ বৈসাদৃশ্য</Label>
            <Switch
              id="high-contrast"
              checked={preferences?.high_contrast || false}
              onCheckedChange={(checked) => handlePreferenceChange('high_contrast', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="text-to-speech">টেক্সট টু স্পিচ</Label>
            <Switch
              id="text-to-speech"
              checked={preferences?.text_to_speech || false}
              onCheckedChange={(checked) => handlePreferenceChange('text_to_speech', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="font-size">ফন্ট সাইজ</Label>
            <Select
              value={preferences?.font_size?.toString() || '16'}
              onValueChange={(value) => handlePreferenceChange('font_size', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="ফন্ট সাইজ নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14">ছোট</SelectItem>
                <SelectItem value="16">মাঝারি</SelectItem>
                <SelectItem value="18">বড়</SelectItem>
                <SelectItem value="20">অতিরিক্ত বড়</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weekly-goal">সাপ্তাহিক লক্ষ্য</Label>
            <Input
              id="weekly-goal"
              type="number"
              min="1"
              max="50"
              value={preferences?.reading_goal_weekly || 10}
              onChange={(e) => handlePreferenceChange('reading_goal_weekly', parseInt(e.target.value))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Context-Aware UX Suite
export const ContextAwareUXSuite: React.FC<{ userId?: string | null }> = ({ userId = null }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PersonalizedRecommendationsWidget userId={userId} />
        <TrendingTopicsWidget />
        <ReadingProgressWidget userId={userId} />
        <UserInteractionsWidget userId={userId} />
        <UserPreferencesPanel userId={userId} />
      </div>
    </div>
  );
};

export default ContextAwareUXSuite;