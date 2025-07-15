import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Trophy
} from 'lucide-react';
import { Link } from 'wouter';

export default function UserDashboard() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  // Always call hooks first
  const { data: savedArticles, isLoading: savedLoading } = useQuery({
    queryKey: ['/api/saved-articles'],
    queryFn: async () => {
      const response = await fetch('/api/saved-articles');
      if (!response.ok) throw new Error('Failed to fetch saved articles');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: readingHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/reading-history'],
    queryFn: async () => {
      const response = await fetch('/api/reading-history');
      if (!response.ok) throw new Error('Failed to fetch reading history');
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Not authenticated - handled by useEffect redirect
  if (!user) {
    return null;
  }

  const userStats = {
    savedArticles: savedArticles?.length || 0,
    readArticles: readingHistory?.length || 0,
    memberSince: new Date(user.created_at).toLocaleDateString('bn-BD'),
    readingStreak: 7, // Mock data for now
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.user_metadata?.name || user.email}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
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
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        সংরক্ষিত নিবন্ধ
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userStats.savedArticles}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        পড়া নিবন্ধ
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userStats.readArticles}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        পড়ার ধারা
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userStats.readingStreak} দিন
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        পয়েন্ট
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ২৫০
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
                          <div key={article.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex-1">
                              <Link href={`/article/${article.slug}`}>
                                <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer">
                                  {article.title}
                                </h3>
                              </Link>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
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
                          <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex-1">
                              <Link href={`/article/${item.article?.slug}`}>
                                <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer">
                                  {item.article?.title}
                                </h3>
                              </Link>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                পড়েছেন: {new Date(item.readAt).toLocaleDateString('bn-BD')}
                              </p>
                            </div>
                            <Clock className="h-4 w-4 text-gray-400" />
                          </div>
                        ))}
                        <Link href="/reading-history">
                          <Button variant="outline" className="w-full">
                            সম্পূর্ণ ইতিহাস দেখুন
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
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
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">নতুন নিবন্ধ পড়েছেন</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">২ ঘন্টা আগে</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <Heart className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">নিবন্ধ সংরক্ষণ করেছেন</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">৫ ঘন্টা আগে</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">৭ দিনের পড়ার ধারা অর্জন</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">১ দিন আগে</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>দ্রুত কাজ</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle>পড়ার লক্ষ্য</CardTitle>
                <CardDescription>এই মাসের অগ্রগতি</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>দৈনিক পড়া</span>
                      <span>৭/১০</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>সাপ্তাহিক লক্ষ্য</span>
                      <span>৪৫/৫০</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
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