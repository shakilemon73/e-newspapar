import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  BookOpen, 
  Heart, 
  TrendingUp, 
  Award, 
  Clock,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Star,
  Calendar,
  BarChart3,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateFormatter } from '@/components/DateFormatter';
import { getUserDashboardStats, getUserEngagementData } from '@/lib/admin-api-direct';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function UserDashboardAdminPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [authLoading, user, setLocation]);

  // User dashboard analytics queries using real Supabase data
  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ['admin-user-stats', selectedTimeRange],
    queryFn: async () => {
      const { getUserStats } = await import('@/lib/admin-supabase-direct');
      return await getUserStats();
    },
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: userAnalytics, isLoading: activeUsersLoading } = useQuery({
    queryKey: ['admin-user-analytics', selectedTimeRange],
    queryFn: async () => {
      const { getUserAnalytics } = await import('@/lib/admin-supabase-direct');
      return await getUserAnalytics(selectedTimeRange);
    },
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: readingActivity, isLoading: readingActivityLoading } = useQuery({
    queryKey: ['admin-reading-activity', selectedTimeRange],
    queryFn: async () => {
      const { getUserAnalytics } = await import('@/lib/admin-supabase-direct');
      const data = await getUserAnalytics(selectedTimeRange);
      return data.readingActivity;
    },
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: userAchievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['admin-user-achievements'],
    queryFn: async () => {
      // For now, return empty achievements as this feature is not implemented yet
      return [];
    },
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: savedArticlesStats, isLoading: savedArticlesLoading } = useQuery({
    queryKey: ['admin-saved-articles-stats', selectedTimeRange],
    queryFn: async () => {
      const { adminSupabase } = await import('@/lib/admin-supabase-direct');
      // Get saved articles count from Supabase
      const { data, error } = await adminSupabase
        .from('saved_articles')
        .select('id, user_id, created_at')
        .gte('created_at', new Date(Date.now() - (selectedTimeRange === 'today' ? 86400000 : selectedTimeRange === 'week' ? 604800000 : 2592000000)).toISOString());
      
      if (error) {
        console.error('Saved articles stats error:', error);
        return { totalSaved: 0, uniqueUsers: 0 };
      }
      
      const totalSaved = data?.length || 0;
      const uniqueUsers = new Set(data?.map(item => item.user_id)).size;
      
      return { totalSaved, uniqueUsers };
    },
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Export data mutation (mock implementation for now)
  const exportDataMutation = useMutation({
    mutationFn: async (type: 'users' | 'activity' | 'achievements') => {
      // Mock export functionality
      return { success: true, type, timeRange: selectedTimeRange };
    },
    onSuccess: () => {
      toast({
        title: "রপ্তানি সফল",
        description: "ডেটা সফলভাবে রপ্তানি করা হয়েছে।",
      });
    },
    onError: (error) => {
      toast({
        title: "রপ্তানি ব্যর্থ",
        description: "ডেটা রপ্তানি করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  });

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ব্যবহারকারী ড্যাশবোর্ড পরিচালনা
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              সমস্ত ব্যবহারকারীর কার্যকলাপ, অর্জন এবং পরিসংখ্যান পরিচালনা করুন
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/'] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              রিফ্রেশ
            </Button>
            <Button
              onClick={() => exportDataMutation.mutate('users')}
              disabled={exportDataMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              রপ্তানি
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">সময়কাল:</span>
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as const).map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
              >
                {range === 'today' ? 'আজ' : range === 'week' ? 'সপ্তাহ' : 'মাস'}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট ব্যবহারকারী</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStatsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : userStats?.totalUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{userStats?.newUsers || 0} নতুন এই সপ্তাহে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সক্রিয় ব্যবহারকারী</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeUsersLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeUsers?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeUsers?.percentage || 0}% সক্রিয়তার হার
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট পাঠনা</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {readingActivityLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : readingActivity?.totalReads || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {readingActivity?.avgReadsPerUser || 0} প্রতি ব্যবহারকারী
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সংরক্ষিত নিবন্ধ</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {savedArticlesLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : savedArticlesStats?.totalSaved || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {savedArticlesStats?.avgSavedPerUser || 0} প্রতি ব্যবহারকারী
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed analytics */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">ব্যবহারকারী</TabsTrigger>
            <TabsTrigger value="activity">কার্যকলাপ</TabsTrigger>
            <TabsTrigger value="achievements">অর্জন</TabsTrigger>
            <TabsTrigger value="reading">পাঠনা বিশ্লেষণ</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>সক্রিয় ব্যবহারকারী</CardTitle>
                <CardDescription>
                  নিবন্ধিত ব্যবহারকারীদের তালিকা এবং তাদের কার্যকলাপ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ব্যবহারকারী খুঁজুন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ব্যবহারকারী</TableHead>
                          <TableHead>নিবন্ধন তারিখ</TableHead>
                          <TableHead>শেষ সক্রিয়</TableHead>
                          <TableHead>পঠিত নিবন্ধ</TableHead>
                          <TableHead>অর্জন</TableHead>
                          <TableHead>অবস্থা</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeUsersLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : activeUsers?.users?.length ? (
                          activeUsers.users.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div>
                                    <div className="font-medium">{user.fullName || 'নাম নেই'}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <DateFormatter date={user.createdAt} type="date" />
                              </TableCell>
                              <TableCell>
                                <DateFormatter date={user.lastActive} type="relative" />
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{user.readArticles || 0}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Award className="h-4 w-4 text-yellow-500" />
                                  <span>{user.achievements || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                  {user.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              কোনো ব্যবহারকারী পাওয়া যায়নি
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>পাঠনা কার্যকলাপ</CardTitle>
                <CardDescription>
                  ব্যবহারকারীদের পাঠনা কার্যকলাপের বিস্তারিত বিশ্লেষণ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {readingActivity?.totalReads || 0}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">মোট পাঠনা</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {readingActivity?.avgReadTime || 0}ম
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">গড় পাঠনা সময়</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {readingActivity?.completionRate || 0}%
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">সম্পূর্ণ পাঠনা হার</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ব্যবহারকারী অর্জন</CardTitle>
                <CardDescription>
                  অর্জন সিস্টেমের পরিসংখ্যান এবং পরিচালনা
                </CardDescription>
              </CardHeader>
              <CardContent>
                {achievementsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userAchievements?.map((achievement: any) => (
                      <div key={achievement.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                            <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div>
                            <div className="font-medium">{achievement.title}</div>
                            <div className="text-sm text-muted-foreground">{achievement.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{achievement.earnedCount || 0}</div>
                          <div className="text-sm text-muted-foreground">অর্জনকারী</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reading" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>পাঠনা বিশ্লেষণ</CardTitle>
                <CardDescription>
                  বিস্তারিত পাঠনা প্যাটার্ন এবং ট্রেন্ড
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">জনপ্রিয় বিভাগ</h4>
                    {readingActivity?.popularCategories?.map((category: any, index: number) => (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span>{category.name}</span>
                        </div>
                        <Badge variant="outline">{category.readCount} পাঠনা</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">শীর্ষ পাঠক</h4>
                    {readingActivity?.topReaders?.map((reader: any, index: number) => (
                      <div key={reader.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span>{reader.fullName || reader.email}</span>
                        </div>
                        <Badge variant="outline">{reader.readCount} নিবন্ধ</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAdminLayout>
  );
}