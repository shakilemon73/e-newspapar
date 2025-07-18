import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  FileText, 
  Eye,
  Video,
  Radio,
  Share2,
  Calendar,
  Clock,
  Loader2
} from 'lucide-react';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';

interface AnalyticsData {
  totalArticles: number;
  totalUsers: number;
  totalViews: number;
  totalVideos: number;
  totalAudioArticles: number;
  totalSocialPosts: number;
  totalEpapers: number;
  totalBreakingNews: number;
  totalWeatherCities: number;
  recentArticles: number;
  recentUsers: number;
  recentVideos: number;
  recentAudio: number;
  recentSocialPosts: number;
  recentEpapers: number;
  articlesGrowth: string;
  usersGrowth: string;
  videosGrowth: string;
  popularArticles: Array<{ title: string; views: number }>;
  popularVideos: Array<{ title: string; views: number }>;
  categoriesDistribution: Record<string, number>;
  platformDistribution: Record<string, number>;
  timeRange: string;
}

type TimeRange = 'today' | 'week' | 'month';

export default function AnalyticsAdminPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('today');

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [authLoading, user, setLocation]);

  // Fetch analytics data from Supabase
  const { data: analyticsData, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics', selectedTimeRange],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setSelectedTimeRange(newRange);
  };

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
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive analytics and insights for your Bengali news website
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedTimeRange === 'today' ? 'default' : 'outline'}
              onClick={() => handleTimeRangeChange('today')}
            >
              Today
            </Button>
            <Button
              variant={selectedTimeRange === 'week' ? 'default' : 'outline'}
              onClick={() => handleTimeRangeChange('week')}
            >
              This Week
            </Button>
            <Button
              variant={selectedTimeRange === 'month' ? 'default' : 'outline'}
              onClick={() => handleTimeRangeChange('month')}
            >
              This Month
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading analytics: {error.message}
          </div>
        ) : (
          <>
            {/* Overview Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {analyticsData?.articlesGrowth || '0'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{analyticsData?.totalArticles || 0}</p>
                    <p className="text-xs text-gray-500">
                      {analyticsData?.recentArticles || 0} new in {selectedTimeRange}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {analyticsData?.usersGrowth || '0'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{analyticsData?.totalUsers || 0}</p>
                    <p className="text-xs text-gray-500">
                      {analyticsData?.recentUsers || 0} new in {selectedTimeRange}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-purple-600" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{analyticsData?.totalViews?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500">Across all content</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <Video className="h-5 w-5 text-orange-600" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Videos</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {analyticsData?.videosGrowth || '0'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{analyticsData?.totalVideos || 0}</p>
                    <p className="text-xs text-gray-500">
                      {analyticsData?.recentVideos || 0} new in {selectedTimeRange}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Radio className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Audio Articles</p>
                      <p className="text-2xl font-bold">{analyticsData?.totalAudioArticles || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Share2 className="h-5 w-5 text-pink-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Social Posts</p>
                      <p className="text-2xl font-bold">{analyticsData?.totalSocialPosts || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">E-Papers</p>
                      <p className="text-2xl font-bold">{analyticsData?.totalEpapers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Breaking News</p>
                      <p className="text-2xl font-bold">{analyticsData?.totalBreakingNews || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Popular Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Articles</CardTitle>
                  <CardDescription>Most viewed articles by audience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.popularArticles?.slice(0, 5).map((article, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{article.title}</p>
                          <p className="text-xs text-gray-500">{article.views} views</p>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">
                        No popular articles data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Videos</CardTitle>
                  <CardDescription>Most viewed video content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.popularVideos?.slice(0, 5).map((video, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{video.title}</p>
                          <p className="text-xs text-gray-500">{video.views} views</p>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">
                        No popular videos data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category and Platform Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Articles by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.categoriesDistribution ? 
                      Object.entries(analyticsData.categoriesDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 8)
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{category}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{
                                    width: `${(count / Math.max(...Object.values(analyticsData.categoriesDistribution))) * 100}%`
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 min-w-[2rem]">{count}</span>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-4 text-gray-500">
                            No category data available
                          </div>
                        )
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Media Distribution</CardTitle>
                  <CardDescription>Posts by platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.platformDistribution ? 
                      Object.entries(analyticsData.platformDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .map(([platform, count]) => (
                          <div key={platform} className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{platform}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-600 rounded-full"
                                  style={{
                                    width: `${(count / Math.max(...Object.values(analyticsData.platformDistribution))) * 100}%`
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 min-w-[2rem]">{count}</span>
                            </div>
                          </div>
                        )) : (
                        <div className="text-center py-4 text-gray-500">
                          No platform data available
                        </div>
                      )
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </EnhancedAdminLayout>
  );
}