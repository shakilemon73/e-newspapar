import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookmarkIcon, ClockIcon, TrendingUpIcon, TrophyIcon, SettingsIcon, HeartIcon, ShareIcon, BarChart3Icon } from 'lucide-react';
import { getRelativeTimeInBengali } from '@/lib/utils/dates';
import * as DashboardAPI from '@/lib/supabase-dashboard-api';

// Direct Supabase API calls - no Express server dependencies

export const UserDashboard = () => {
  const [userStats, setUserStats] = useState<DashboardAPI.DashboardStats>({
    saved_articles: 0,
    read_articles: 0,
    reading_streak: 0,
    total_interactions: 0,
    achievements_count: 0
  });
  
  const [bookmarkedArticles, setBookmarkedArticles] = useState<DashboardAPI.BookmarkedArticle[]>([]);
  const [readingHistory, setReadingHistory] = useState<DashboardAPI.ReadingHistoryItem[]>([]);
  const [achievements, setAchievements] = useState<DashboardAPI.UserAchievement[]>([]);
  const [activities, setActivities] = useState<DashboardAPI.UserActivity[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Remove bookmark function
  const handleRemoveBookmark = async (articleId: number) => {
    try {
      const user = await DashboardAPI.getCurrentUser();
      if (!user) return;

      const success = await DashboardAPI.removeBookmark(user.id, articleId);
      if (success) {
        setBookmarkedArticles(prev => prev.filter(article => article.id !== articleId));
        setUserStats(prev => ({ ...prev, saved_articles: prev.saved_articles - 1 }));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        const user = await DashboardAPI.getCurrentUser();
        
        if (user) {
          const [stats, bookmarks, history, userAchievements, userActivities, profile] = await Promise.all([
            DashboardAPI.fetchUserStats(user.id),
            DashboardAPI.fetchBookmarkedArticles(user.id),
            DashboardAPI.fetchReadingHistory(user.id),
            DashboardAPI.fetchUserAchievements(user.id),
            DashboardAPI.fetchUserActivities(user.id),
            DashboardAPI.fetchUserProfile(user.id)
          ]);

          setUserStats(stats);
          setBookmarkedArticles(bookmarks);
          setReadingHistory(history);
          setAchievements(userAchievements);
          setActivities(userActivities);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">আপনার পড়ার অগ্রগতি এবং কার্যক্রম</p>
        </div>
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback>{userProfile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <Link href="/dashboard/profile">
            <Button variant="outline" size="sm">
              <SettingsIcon className="w-4 h-4 mr-2" />
              প্রোফাইল সম্পাদনা
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">সংরক্ষিত নিবন্ধ</p>
                <p className="text-2xl font-bold">{userStats.saved_articles}</p>
              </div>
              <BookmarkIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">পড়া নিবন্ধ</p>
                <p className="text-2xl font-bold">{userStats.read_articles}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">পড়ার ধারা</p>
                <p className="text-2xl font-bold">{userStats.reading_streak} দিন</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">মোট মিথস্ক্রিয়া</p>
                <p className="text-2xl font-bold">{userStats.total_interactions}</p>
              </div>
              <BarChart3Icon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">সংক্ষিপ্ত বিবরণ</TabsTrigger>
          <TabsTrigger value="bookmarks">সংরক্ষিত নিবন্ধ</TabsTrigger>
          <TabsTrigger value="history">পড়ার ইতিহাস</TabsTrigger>
          <TabsTrigger value="achievements">অর্জনসমূহ</TabsTrigger>
          <TabsTrigger value="activities">কার্যকলাপ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookmarks */}
            <Card>
              <CardHeader>
                <CardTitle>সাম্প্রতিক সংরক্ষিত নিবন্ধ</CardTitle>
                <CardDescription>আপনার সর্বশেষ সংরক্ষিত নিবন্ধগুলি</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookmarkedArticles.slice(0, 3).map((article) => (
                    <div key={article.id} className="flex items-start space-x-3">
                      <img
                        src={article.image_url || '/placeholder-60x60.svg'}
                        alt={article.title}
                        className="w-15 h-15 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/article/${article.slug}`}>
                          <h4 className="text-sm font-medium hover:text-blue-600 line-clamp-2">
                            {article.title}
                          </h4>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getRelativeTimeInBengali(article.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="#" onClick={() => setActiveTab('bookmarks')}>
                  <Button variant="link" className="w-full mt-4">
                    সব দেখুন
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>সাম্প্রতিক অর্জনসমূহ</CardTitle>
                <CardDescription>আপনার সর্বশেষ অর্জনগুলি</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <TrophyIcon className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {achievement.points} পয়েন্ট
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="#" onClick={() => setActiveTab('achievements')}>
                  <Button variant="link" className="w-full mt-4">
                    সব দেখুন
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>সংরক্ষিত নিবন্ধসমূহ</CardTitle>
              <CardDescription>আপনার সংরক্ষিত সকল নিবন্ধ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarkedArticles.map((article) => (
                  <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <img
                        src={article.image_url || '/placeholder-80x80.svg'}
                        alt={article.title}
                        className="w-20 h-20 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/article/${article.slug}`}>
                          <h3 className="font-medium hover:text-blue-600 line-clamp-2 mb-2">
                            {article.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {getRelativeTimeInBengali(article.published_at)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveBookmark(article.id)}
                          >
                            সরান
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {bookmarkedArticles.length === 0 && (
                <div className="text-center py-8">
                  <BookmarkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">কোন সংরক্ষিত নিবন্ধ নেই</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>পড়ার ইতিহাস</CardTitle>
              <CardDescription>আপনার পড়া নিবন্ধের ইতিহাস</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {readingHistory.map((history) => (
                  <div key={history.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={history.articles.image_url || '/placeholder-60x60.svg'}
                        alt={history.articles.title}
                        className="w-15 h-15 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/article/${history.articles.slug}`}>
                          <h3 className="font-medium hover:text-blue-600 line-clamp-2 mb-2">
                            {history.articles.title}
                          </h3>
                        </Link>
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>পড়ার অগ্রগতি</span>
                              <span>{history.read_percentage}%</span>
                            </div>
                            <Progress value={history.read_percentage} className="h-2" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {Math.floor(history.time_spent / 60)} মিনিট পড়েছেন
                          </span>
                          <span>
                            {getRelativeTimeInBengali(history.updated_at)}
                          </span>
                        </div>
                        {history.is_completed && (
                          <Badge variant="secondary" className="text-xs mt-2">
                            সম্পূর্ণ পড়েছেন
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {readingHistory.length === 0 && (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">কোন পড়ার ইতিহাস নেই</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>অর্জনসমূহ</CardTitle>
              <CardDescription>আপনার সকল অর্জন এবং ব্যাজ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="border rounded-lg p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
                      <TrophyIcon className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="font-medium mb-2">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    <Badge variant="secondary" className="mb-2">
                      {achievement.points} পয়েন্ট
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      অর্জিত: {getRelativeTimeInBengali(achievement.earned_at)}
                    </p>
                  </div>
                ))}
              </div>
              {achievements.length === 0 && (
                <div className="text-center py-8">
                  <TrophyIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">এখনো কোন অর্জন নেই</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>কার্যকলাপ</CardTitle>
              <CardDescription>আপনার সাম্প্রতিক কার্যকলাপ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {activity.activity_type === 'read' && <ClockIcon className="w-4 h-4 text-blue-600" />}
                      {activity.activity_type === 'bookmark' && <BookmarkIcon className="w-4 h-4 text-blue-600" />}
                      {activity.activity_type === 'like' && <HeartIcon className="w-4 h-4 text-blue-600" />}
                      {activity.activity_type === 'share' && <ShareIcon className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTimeInBengali(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {activities.length === 0 && (
                <div className="text-center py-8">
                  <BarChart3Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">কোন কার্যকলাপ নেই</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;