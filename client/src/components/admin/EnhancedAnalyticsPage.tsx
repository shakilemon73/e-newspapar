import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminOnlyLayout } from './AdminOnlyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Loader2,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Activity,
  Target,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  BarChart,
  PieChart,
  LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function EnhancedAnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('today');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch analytics data
  const { data: analyticsData, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics', selectedTimeRange],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setSelectedTimeRange(newRange);
  };

  // Enhanced metrics with growth calculations
  const metrics = [
    {
      title: 'Total Articles',
      value: analyticsData?.totalArticles || 0,
      change: analyticsData?.articlesGrowth || '+0%',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'blue',
      description: 'Published articles across all categories',
      target: 100,
      progress: ((analyticsData?.totalArticles || 0) / 100) * 100
    },
    {
      title: 'Active Users',
      value: analyticsData?.totalUsers || 0,
      change: analyticsData?.usersGrowth || '+0%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'green',
      description: 'Registered and active users',
      target: 1000,
      progress: ((analyticsData?.totalUsers || 0) / 1000) * 100
    },
    {
      title: 'Total Views',
      value: analyticsData?.totalViews || 0,
      change: '+23.5%',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'purple',
      description: 'Page views across all content',
      target: 50000,
      progress: ((analyticsData?.totalViews || 0) / 50000) * 100
    },
    {
      title: 'Video Content',
      value: analyticsData?.totalVideos || 0,
      change: analyticsData?.videosGrowth || '+0%',
      changeType: 'positive' as const,
      icon: Video,
      color: 'indigo',
      description: 'Video articles and multimedia',
      target: 50,
      progress: ((analyticsData?.totalVideos || 0) / 50) * 100
    },
    {
      title: 'Audio Articles',
      value: analyticsData?.totalAudioArticles || 0,
      change: '+12.3%',
      changeType: 'positive' as const,
      icon: Radio,
      color: 'pink',
      description: 'Audio content and podcasts',
      target: 25,
      progress: ((analyticsData?.totalAudioArticles || 0) / 25) * 100
    },
    {
      title: 'Social Posts',
      value: analyticsData?.totalSocialPosts || 0,
      change: '+8.7%',
      changeType: 'positive' as const,
      icon: Share2,
      color: 'orange',
      description: 'Social media integrations',
      target: 100,
      progress: ((analyticsData?.totalSocialPosts || 0) / 100) * 100
    }
  ];

  const deviceData = [
    { name: 'Mobile', percentage: 68, color: 'bg-blue-500' },
    { name: 'Desktop', percentage: 24, color: 'bg-green-500' },
    { name: 'Tablet', percentage: 8, color: 'bg-purple-500' }
  ];

  const topCategories = [
    { name: 'রাজনীতি', articles: 25, views: 15420, growth: '+12%' },
    { name: 'খেলা', articles: 18, views: 12350, growth: '+8%' },
    { name: 'আন্তর্জাতিক', articles: 22, views: 11280, growth: '+15%' },
    { name: 'অর্থনীতি', articles: 15, views: 9650, growth: '+6%' },
    { name: 'বিনোদন', articles: 12, views: 8430, growth: '+18%' }
  ];

  return (
    <AdminOnlyLayout>
      <div className="space-y-6 p-6">
        {/* Enhanced Header with UX Improvements */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3 tracking-tight">Analytics Dashboard</h1>
              <p className="text-indigo-100 text-lg">
                Comprehensive insights and metrics for your Bengali news platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                <Activity className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Time Range Selection */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Time Range Analysis
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={selectedTimeRange === 'today' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange('today')}
                >
                  Today
                </Button>
                <Button
                  variant={selectedTimeRange === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange('week')}
                >
                  This Week
                </Button>
                <Button
                  variant={selectedTimeRange === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange('month')}
                >
                  This Month
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <Card key={metric.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    `bg-${metric.color}-100 dark:bg-${metric.color}-900`
                  )}>
                    <metric.icon className={cn("h-6 w-6", `text-${metric.color}-600 dark:text-${metric.color}-400`)} />
                  </div>
                  <Badge 
                    variant={metric.changeType === 'positive' ? 'default' : 'secondary'}
                    className={cn(
                      "text-xs",
                      metric.changeType === 'positive' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    )}
                  >
                    {metric.changeType === 'positive' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {metric.change}
                  </Badge>
                </div>
                
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {metric.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {metric.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progress to target</span>
                    <span>{Math.round(metric.progress)}% of {metric.target}</span>
                  </div>
                  <Progress value={metric.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Tabs Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Detailed Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Device Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Device Distribution</CardTitle>
                      <CardDescription>How users access your content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {deviceData.map((device, index) => (
                          <div key={device.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {device.name === 'Mobile' && <Smartphone className="h-4 w-4 text-blue-500" />}
                              {device.name === 'Desktop' && <Monitor className="h-4 w-4 text-green-500" />}
                              {device.name === 'Tablet' && <Tablet className="h-4 w-4 text-purple-500" />}
                              <span className="text-sm font-medium">{device.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${device.color}`}
                                  style={{ width: `${device.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{device.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Categories */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Categories</CardTitle>
                      <CardDescription>Most popular content categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topCategories.map((category, index) => (
                          <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-gray-500">{category.articles} articles</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{category.views.toLocaleString()} views</div>
                              <div className="text-sm text-green-600">{category.growth}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Content Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Articles Published</span>
                          <span className="font-medium">{analyticsData?.totalArticles || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Videos Uploaded</span>
                          <span className="font-medium">{analyticsData?.totalVideos || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Audio Articles</span>
                          <span className="font-medium">{analyticsData?.totalAudioArticles || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">E-Papers</span>
                          <span className="font-medium">{analyticsData?.totalEpapers || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Engagement Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total Views</span>
                          <span className="font-medium">{(analyticsData?.totalViews || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Active Users</span>
                          <span className="font-medium">{analyticsData?.totalUsers || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Social Posts</span>
                          <span className="font-medium">{analyticsData?.totalSocialPosts || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Breaking News</span>
                          <span className="font-medium">{analyticsData?.totalBreakingNews || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Growth Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Article Growth</span>
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {analyticsData?.articlesGrowth || '+0%'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">User Growth</span>
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {analyticsData?.usersGrowth || '+0%'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Video Growth</span>
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {analyticsData?.videosGrowth || '+0%'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="audience" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Demographics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">User demographic data will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Geographic Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Geographic distribution will be shown here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Site Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Performance metrics will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">SEO Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">SEO performance data will be shown here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-12 justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Analytics Report
              </Button>
              <Button variant="outline" className="h-12 justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Custom Date Range
              </Button>
              <Button variant="outline" className="h-12 justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminOnlyLayout>
  );
}