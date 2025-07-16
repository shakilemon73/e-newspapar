import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
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

export default function UserDashboard() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [setupRequired, setSetupRequired] = useState(false);

  // Fetch user's saved articles
  const { data: savedArticles, isLoading: savedLoading, error: savedError } = useQuery({
    queryKey: ['/api/saved-articles'],
    queryFn: async () => {
      const response = await fetch('/api/saved-articles');
      if (!response.ok) {
        if (response.status === 500) {
          const errorData = await response.json();
          if (errorData.error.includes('relation "saved_articles" does not exist')) {
            setSetupRequired(true);
            return [];
          }
        }
        throw new Error('Failed to fetch saved articles');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch user's reading history
  const { data: readingHistory, isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ['/api/reading-history'],
    queryFn: async () => {
      const response = await fetch('/api/reading-history');
      if (!response.ok) {
        if (response.status === 500) {
          const errorData = await response.json();
          if (errorData.error.includes('relation "reading_history" does not exist')) {
            setSetupRequired(true);
            return [];
          }
        }
        throw new Error('Failed to fetch reading history');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch user analytics
  const { data: userAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/user/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/user/analytics');
      if (!response.ok) {
        if (response.status === 500) {
          return {
            totalInteractions: 0,
            interactionsByType: {},
            topCategories: [],
            recentReading: []
          };
        }
        throw new Error('Failed to fetch user analytics');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch user preferences
  const { data: userPreferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['/api/user/preferences'],
    queryFn: async () => {
      const response = await fetch('/api/user/preferences');
      if (!response.ok) {
        if (response.status === 500) {
          return [];
        }
        throw new Error('Failed to fetch user preferences');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch user interactions
  const { data: userInteractions, isLoading: interactionsLoading } = useQuery({
    queryKey: ['/api/user/interactions'],
    queryFn: async () => {
      const response = await fetch('/api/user/interactions');
      if (!response.ok) {
        if (response.status === 500) {
          return [];
        }
        throw new Error('Failed to fetch user interactions');
      }
      return response.json();
    },
    enabled: !!user,
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

  // Calculate real user stats from actual data
  const userStats = {
    savedArticles: savedArticles?.length || 0,
    readArticles: readingHistory?.length || 0,
    memberSince: new Date(user.created_at).toLocaleDateString('bn-BD'),
    totalInteractions: userAnalytics?.totalInteractions || 0,
    readingStreak: calculateReadingStreak(readingHistory || []),
    favoriteCategories: userPreferences?.slice(0, 3) || [],
    recentActivity: userInteractions?.slice(0, 5) || []
  };

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
      const response = await fetch('/api/admin/setup-user-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast({
          title: 'সেটআপ সফল',
          description: 'ডেটাবেস টেবিল সফলভাবে সেটআপ করা হয়েছে',
        });
        setSetupRequired(false);
        queryClient.invalidateQueries();
      } else {
        throw new Error('Setup failed');
      }
    } catch (error) {
      toast({
        title: 'সেটআপ ব্যর্থ',
        description: 'ডেটাবেস টেবিল সেটআপ করতে সমস্যা হয়েছে',
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
                  সদস্য হয়েছেন: {userStats.memberSince}
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
                        {userStats.savedArticles}
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
                        {userStats.readArticles}
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
                        {userStats.readingStreak} দিন
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
                        {userStats.totalInteractions}
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="saved">সংরক্ষিত নিবন্ধ</TabsTrigger>
                <TabsTrigger value="history">পড়ার ইতিহাস</TabsTrigger>
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
                        {savedArticles.slice(0, 5).map((article: any) => (
                          <div key={article.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
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
                        {readingHistory.slice(0, 5).map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
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
                    ) : userStats.recentActivity?.length ? (
                      <div className="space-y-4">
                        {userStats.recentActivity.map((activity: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
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
                      <span className="text-foreground">{userStats.readArticles}/৫০</span>
                    </div>
                    <Progress value={Math.min((userStats.readArticles / 50) * 100, 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">সংরক্ষণ লক্ষ্য</span>
                      <span className="text-foreground">{userStats.savedArticles}/২০</span>
                    </div>
                    <Progress value={Math.min((userStats.savedArticles / 20) * 100, 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">পড়ার ধারা</span>
                      <span className="text-foreground">{userStats.readingStreak}/৩০ দিন</span>
                    </div>
                    <Progress value={Math.min((userStats.readingStreak / 30) * 100, 100)} className="h-2" />
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