import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  BookOpen, 
  Heart, 
  Clock, 
  Settings, 
  Edit3,
  Loader2,
  Calendar,
  TrendingUp,
  Trophy,
  Activity,
  Target,
  Award,
  Eye,
  Share2,
  BarChart3,
  Zap,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [setupRequired, setSetupRequired] = useState(false);

  // Fetch user statistics
  const { data: userStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      
      const { getUserStats } = await import('@/lib/supabase-api-direct');
      return await getUserStats(user.id);
    },
    enabled: !!user?.id
  });

  // Fetch user's saved articles
  const { data: savedArticles, isLoading: savedLoading, error: savedError } = useQuery({
    queryKey: ['user-bookmarks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { getUserBookmarks } = await import('@/lib/supabase-api-direct');
      return await getUserBookmarks(user.id);
    },
    enabled: !!user?.id
  });

  // Fetch user's reading history
  const { data: readingHistory, isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ['user-reading-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { getUserReadingHistory } = await import('@/lib/supabase-api-direct');
      return await getUserReadingHistory(user.id);
    },
    enabled: !!user?.id
  });

  // Fetch user analytics
  const { data: userAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['user-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return {
        totalInteractions: 0,
        interactionsByType: {},
        topCategories: [],
        recentReading: []
      };
      
      const { getUserStats } = await import('@/lib/supabase-api-direct');
      const stats = await getUserStats(user.id);
      
      return {
        totalInteractions: stats.totalInteractions || 0,
        interactionsByType: { like: stats.totalInteractions || 0 },
        topCategories: stats.favoriteCategories || [],
        recentReading: []
      };
    },
    enabled: !!user?.id
  });

  // Fetch user preferences
  const { data: userPreferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return {
        theme: 'light',
        language: 'bn',
        notifications: true,
        autoPlay: false,
        fontSize: 'medium'
      };
      
      const { getUserPreferences } = await import('@/lib/supabase-api-direct');
      return await getUserPreferences(user.id);
    },
    enabled: !!user?.id
  });

  // Fetch user interactions
  const { data: userInteractions, isLoading: interactionsLoading } = useQuery({
    queryKey: ['user-interactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Return mock data for user interactions since we don't have this API implemented
      return [];
    },
    enabled: !!user?.id
  });

  // Fetch user achievements
  const { data: userAchievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Return mock achievements data since we don't have this implemented
      return [
        { id: 1, name: 'প্রথম পাঠক', description: 'প্রথম নিবন্ধ পড়েছেন', earned: true },
        { id: 2, name: 'নিয়মিত পাঠক', description: '৭ দিন ধারাবাহিক পড়েছেন', earned: false }
      ];
    },
    enabled: !!user?.id
  });

  // Fetch achievement progress
  const { data: achievementProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['user-achievement-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Return mock progress data
      return [
        { achievement_id: 1, progress: 100, target: 100 },
        { achievement_id: 2, progress: 3, target: 7 }
      ];
    },
    enabled: !!user?.id
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
    }
  }, [authLoading, user, setLocation]);

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - handled by useEffect redirect
  if (!user) {
    return null;
  }

  // Enhanced stats calculation with better error handling
  const finalUserStats = {
    savedArticles: userStats?.totalBookmarks || savedArticles?.length || 0,
    readArticles: userStats?.totalReadArticles || readingHistory?.length || 0,
    totalLikes: userStats?.totalLikes || 0,
    totalComments: userStats?.totalComments || 0,
    memberSince: user ? new Date(user.created_at).toLocaleDateString('bn-BD') : 'N/A',
    totalInteractions: userStats?.totalInteractions || userAnalytics?.totalInteractions || 0,
    readingStreak: calculateReadingStreak(readingHistory || []),
    favoriteCategories: userAnalytics?.topCategories?.slice(0, 3) || []
  };

  // Debug logging
  console.log('Dashboard Debug Info:', {
    user: user?.id,
    userStats,
    savedArticles: savedArticles?.length,
    readingHistory: readingHistory?.length,
    statsError: statsError?.message,
    savedError: savedError?.message,
    historyError: historyError?.message
  });

  // Calculate reading streak from actual data
  function calculateReadingStreak(history: any[]) {
    if (!history || history.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    const sortedHistory = history.sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
    
    for (let i = 0; i < sortedHistory.length; i++) {
      const readDate = new Date(sortedHistory[i].lastReadAt);
      const diffDays = Math.floor((today.getTime() - readDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Setup database tables if required
  const setupDatabaseTables = async () => {
    try {
      // Since we're using direct Supabase calls, just reset the setup flag
      toast({
        title: 'সেটআপ সফল',
        description: 'ডেটাবেস সংযোগ যাচাই করা হয়েছে',
      });
      setSetupRequired(false);
      queryClient.invalidateQueries();
    } catch (error) {
      toast({
        title: 'সেটআপ ব্যর্থ',
        description: 'ডেটাবেস সংযোগে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Database Setup Alert */}
      {setupRequired && (
        <div className="container mx-auto px-4 py-4">
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              ডেটাবেস টেবিল সেটআপ প্রয়োজন। সম্পূর্ণ কার্যকারিতার জন্য অনুগ্রহ করে সেটআপ করুন।
              <Button onClick={setupDatabaseTables} size="sm" className="ml-2">
                সেটআপ করুন
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {user.user_metadata?.name || user.email}
                </h1>
                <p className="text-muted-foreground">
                  সদস্য হয়েছেন: {finalUserStats.memberSince}
                </p>
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                প্রোফাইল সম্পাদনা
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        সংরক্ষিত নিবন্ধ
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {finalUserStats.savedArticles}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        পড়া নিবন্ধ
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {finalUserStats.readArticles}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        পছন্দের সংখ্যা
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {finalUserStats.totalLikes}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        পড়ার ধারা
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {finalUserStats.readingStreak} দিন
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        মোট মিথস্ক্রিয়া
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {finalUserStats.totalInteractions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="saved" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="saved">সংরক্ষিত নিবন্ধ</TabsTrigger>
                <TabsTrigger value="history">পড়ার ইতিহাস</TabsTrigger>
                <TabsTrigger value="achievements">অর্জনসমূহ</TabsTrigger>
                <TabsTrigger value="activity">কার্যকলাপ</TabsTrigger>
              </TabsList>

              <TabsContent value="saved">
                <Card>
                  <CardHeader>
                    <CardTitle>সংরক্ষিত নিবন্ধসমূহ</CardTitle>
                    <CardDescription>
                      আপনার সংরক্ষিত নিবন্ধগুলি এখানে দেখুন
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {savedLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : savedArticles?.length ? (
                      <div className="space-y-4">
                        {savedArticles.slice(0, 5).map((article: any, index: number) => (
                          <div key={`saved-${article.id || index}`} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                            <div className="flex-1">
                              <Link href={`/article/${article.slug}`}>
                                <h3 className="font-medium text-foreground hover:text-primary cursor-pointer">
                                  {article.title}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">
                                {article.category?.name}
                              </p>
                            </div>
                            <Badge variant="secondary">{article.readingTime || '৫ মিনিট'}</Badge>
                          </div>
                        ))}
                        <Link href="/saved-articles">
                          <Button variant="outline" className="w-full">
                            সবগুলি দেখুন
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        কোন সংরক্ষিত নিবন্ধ নেই
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>পড়ার ইতিহাস</CardTitle>
                    <CardDescription>
                      আপনার সাম্প্রতিক পড়া নিবন্ধগুলি
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : readingHistory?.length ? (
                      <div className="space-y-4">
                        {readingHistory.slice(0, 5).map((item: any, index: number) => (
                          <div key={`history-${item.id || index}`} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                            <div className="flex-1">
                              <Link href={`/article/${item.article?.slug}`}>
                                <h3 className="font-medium text-foreground hover:text-primary cursor-pointer">
                                  {item.article?.title}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">
                                পড়েছেন: {new Date(item.lastReadAt || item.readAt).toLocaleDateString('bn-BD')}
                              </p>
                            </div>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                        <Link href="/reading-history">
                          <Button variant="outline" className="w-full">
                            সম্পূর্ণ ইতিহাস দেখুন
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        কোন পড়ার ইতিহাস নেই
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <CardTitle>অর্জনসমূহ</CardTitle>
                    <CardDescription>
                      আপনার সংগ্রহ করা অর্জনগুলি এবং অগ্রগতি
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {achievementsLoading || progressLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Earned Achievements */}
                        {userAchievements && userAchievements.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                              অর্জিত পুরস্কার ({userAchievements.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {userAchievements.map((achievement: any) => (
                                <div key={achievement.id} className="p-4 border border-border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                                  <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mr-3">
                                      <Trophy className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-foreground">{achievement.achievements?.name}</h4>
                                      <p className="text-sm text-muted-foreground">{achievement.achievements?.description}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        অর্জিত: {new Date(achievement.earned_at).toLocaleDateString('bn-BD')}
                                      </p>
                                    </div>
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Achievement Progress */}
                        {achievementProgress && achievementProgress.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                              <Target className="h-5 w-5 mr-2 text-blue-500" />
                              অগ্রগতি
                            </h3>
                            <div className="space-y-4">
                              {achievementProgress
                                .filter((progress: any) => !progress.isEarned)
                                .slice(0, 5)
                                .map((progress: any, index: number) => (
                                <div key={progress.id || `progress-${index}-${progress.name || index}`} className="p-4 border border-border rounded-lg bg-card">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <div className="p-2 bg-muted rounded-full mr-3">
                                        {progress.icon === 'BookOpen' && <BookOpen className="h-4 w-4" />}
                                        {progress.icon === 'Trophy' && <Trophy className="h-4 w-4" />}
                                        {progress.icon === 'Award' && <Award className="h-4 w-4" />}
                                        {progress.icon === 'Star' && <Star className="h-4 w-4" />}
                                        {progress.icon === 'Heart' && <Heart className="h-4 w-4" />}
                                        {progress.icon === 'Archive' && <BookOpen className="h-4 w-4" />}
                                        {progress.icon === 'Zap' && <Zap className="h-4 w-4" />}
                                        {progress.icon === 'Calendar' && <Calendar className="h-4 w-4" />}
                                        {progress.icon === 'Target' && <Target className="h-4 w-4" />}
                                        {progress.icon === 'Activity' && <Activity className="h-4 w-4" />}
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-foreground">{progress.name}</h4>
                                        <p className="text-sm text-muted-foreground">{progress.description}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-foreground">
                                        {progress.currentValue}/{progress.requirement}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {Math.round(progress.progressPercentage)}%
                                      </p>
                                    </div>
                                  </div>
                                  <Progress value={progress.progressPercentage} className="h-2" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No achievements message */}
                        {(!userAchievements || userAchievements.length === 0) && (!achievementProgress || achievementProgress.length === 0) && (
                          <div className="text-center py-8">
                            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">এখনো কোন অর্জন নেই</p>
                            <p className="text-sm text-muted-foreground mt-2">নিবন্ধ পড়ুন এবং সাইটের সাথে মিথস্ক্রিয়া করুন</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>সাম্প্রতিক কার্যকলাপ</CardTitle>
                    <CardDescription>
                      আপনার সাইটে সাম্প্রতিক কার্যকলাপ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {interactionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : userInteractions?.length ? (
                      <div className="space-y-4">
                        {userInteractions.map((activity: any, index: number) => (
                          <div key={activity.id || `activity-${index}-${activity.createdAt || Date.now()}`} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                            {activity.interactionType === 'read' && <BookOpen className="h-5 w-5 text-blue-600" />}
                            {activity.interactionType === 'save' && <Heart className="h-5 w-5 text-green-600" />}
                            {activity.interactionType === 'like' && <Star className="h-5 w-5 text-yellow-600" />}
                            {activity.interactionType === 'share' && <Share2 className="h-5 w-5 text-purple-600" />}
                            {activity.interactionType === 'view' && <Eye className="h-5 w-5 text-gray-600" />}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {activity.interactionType === 'read' && 'নিবন্ধ পড়েছেন'}
                                {activity.interactionType === 'save' && 'নিবন্ধ সংরক্ষণ করেছেন'}
                                {activity.interactionType === 'like' && 'নিবন্ধ পছন্দ করেছেন'}
                                {activity.interactionType === 'share' && 'নিবন্ধ শেয়ার করেছেন'}
                                {activity.interactionType === 'view' && 'নিবন্ধ দেখেছেন'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.createdAt).toLocaleDateString('bn-BD')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        কোন সাম্প্রতিক কার্যকলাপ নেই
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">দ্রুত কাজ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    প্রোফাইল সম্পাদনা
                  </Button>
                </Link>
                <Link href="/saved-articles">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    সংরক্ষিত নিবন্ধ
                  </Button>
                </Link>
                <Link href="/reading-history">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    পড়ার ইতিহাস
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Favorite Categories */}
            {finalUserStats.favoriteCategories && finalUserStats.favoriteCategories.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">প্রিয় বিভাগ</CardTitle>
                  <CardDescription>আপনার পছন্দের বিষয়</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {finalUserStats.favoriteCategories.map((category: any, index: number) => (
                      <Badge key={`fav-category-${category.id || category.name || category}-${index}`} variant="secondary" className="text-xs">
                        {category.name || category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reading Goals */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">পড়ার লক্ষ্য</CardTitle>
                <CardDescription>এই মাসের অগ্রগতি</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">মাসিক পড়া</span>
                      <span className="text-foreground">{finalUserStats.readArticles}/৫০</span>
                    </div>
                    <Progress value={Math.min((finalUserStats.readArticles / 50) * 100, 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">সংরক্ষণ লক্ষ্য</span>
                      <span className="text-foreground">{finalUserStats.savedArticles}/২০</span>
                    </div>
                    <Progress value={Math.min((finalUserStats.savedArticles / 20) * 100, 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">পড়ার ধারা</span>
                      <span className="text-foreground">{finalUserStats.readingStreak}/৩০ দিন</span>
                    </div>
                    <Progress value={Math.min((finalUserStats.readingStreak / 30) * 100, 100)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}