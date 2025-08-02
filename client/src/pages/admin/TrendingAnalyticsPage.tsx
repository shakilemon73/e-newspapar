import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { TrendingAnalyticsDashboard } from '@/components/TrendingAnalyticsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Activity, 
  BarChart3, 
  Users, 
  Eye, 
  Share2, 
  Heart, 
  Clock,
  RefreshCw,
  Download
} from 'lucide-react';
import { getTrendingAnalytics } from '@/lib/admin';

export default function TrendingAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const queryClient = useQueryClient();

  // Fetch real trending analytics data from Supabase
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['trending-analytics', timeRange],
    queryFn: () => getTrendingAnalytics(timeRange),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const handleExportData = () => {
    if (analyticsData) {
      const dataToExport = {
        timeRange,
        exportDate: new Date().toISOString(),
        ...analyticsData
      };
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trending-analytics-${timeRange}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['trending-analytics'] });
  };

  // Convert numbers to Bengali numerals
  const toBengaliNumber = (num: number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
  };

  // Create analytics metrics from real data
  const analyticsMetrics = analyticsData ? [
    {
      title: 'মোট ট্রেন্ডিং আইটেম',
      value: toBengaliNumber(analyticsData.totalItems || 0),
      change: '+৮%',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      title: 'সক্রিয় ব্যবহারকারী',
      value: toBengaliNumber(analyticsData.activeUsers || 0),
      change: '+১২%',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'মোট এনগেজমেন্ট',
      value: toBengaliNumber(analyticsData.totalEngagement),
      change: '+৫%',
      icon: <Heart className="w-5 h-5" />,
      color: 'text-red-600'
    },
    {
      title: 'গড় ভিউ টাইম',
      value: analyticsData.avgViewTime,
      change: '+৭%',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-purple-600'
    }
  ] : [];

  const topCategories = analyticsData?.topCategories || [];
  const recentTrends = analyticsData?.recentTrends || [];

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <TrendingUp className="w-8 h-8" />
                <span>ট্রেন্ডিং এনালিটিক্স</span>
              </h1>
              <p className="text-green-100 mt-2">
                রিয়েল-টাইম ট্রেন্ডিং কন্টেন্ট এবং ব্যবহারকারী এনগেজমেন্ট বিশ্লেষণ
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | '7d')}
                className="bg-white/10 border border-white/20 text-white rounded px-3 py-1"
              >
                <option value="1h" className="text-black">১ ঘন্টা</option>
                <option value="24h" className="text-black">২৪ ঘন্টা</option>
                <option value="7d" className="text-black">৭ দিন</option>
              </select>
              <Button 
                onClick={handleRefreshData}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                রিফ্রেশ
              </Button>
              <Button 
                onClick={handleExportData}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                disabled={!analyticsData}
              >
                <Download className="w-4 h-4 mr-2" />
                এক্সপোর্ট
              </Button>
              <Badge className="bg-white/20 text-white border-white/30">
                <Activity className="w-3 h-3 mr-1" />
                {error ? 'ডেটা ত্রুটি' : 'লাইভ ডেটা'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Analytics Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(4)].map((_, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-8 text-red-600">
              ডেটা লোড করতে সমস্যা হয়েছে
            </div>
          ) : (
            analyticsMetrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold mb-1">{metric.value}</p>
                      <p className={`text-sm font-medium ${metric.color}`}>
                        {metric.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-100 ${metric.color}`}>
                      {metric.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">ড্যাশবোর্ড</TabsTrigger>
            <TabsTrigger value="categories">বিভাগ বিশ্লেষণ</TabsTrigger>
            <TabsTrigger value="trends">ট্রেন্ডিং বিষয়</TabsTrigger>
            <TabsTrigger value="reports">রিপোর্ট</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <TrendingAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>শীর্ষ বিভাগসমূহ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      ))
                    ) : (
                      topCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="secondary">{index + 1}</Badge>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{category.articles} টি নিবন্ধ</div>
                            <div className="text-xs text-gray-500">এনগেজমেন্ট: {category.engagement}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>সাম্প্রতিক ট্রেন্ড</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      [...Array(4)].map((_, i) => (
                        <div key={i} className="border-l-4 border-gray-200 pl-4">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      ))
                    ) : (
                      recentTrends.map((trend, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4">
                          <div className="font-medium">{trend.topic}</div>
                          <div className="text-sm text-gray-600">
                            {trend.mentions} উল্লেখ • {trend.growth} • {trend.category}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <TrendingAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>বিশ্লেষণ রিপোর্ট</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  রিপোর্ট বৈশিষ্ট্য শীঘ্রই আসছে...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>হট ট্রেন্ডিং বিষয়</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{trend.topic}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{trend.mentions} উল্লেখ</span>
                          <Badge variant="outline">{trend.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{trend.growth}</p>
                        <p className="text-sm text-gray-500">বৃদ্ধি</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>সাপ্তাহিক রিপোর্ট</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>মোট ভিউ</span>
                      <span className="font-semibold">২৪,৫৬৭</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>নতুন ট্রেন্ডিং টপিক</span>
                      <span className="font-semibold">১৮</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>সর্বোচ্চ এনগেজমেন্ট</span>
                      <span className="font-semibold">৮৯%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>গড় সেশন সময়</span>
                      <span className="font-semibold">৪.৩ মিনিট</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>মাসিক সামারি</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>মোট আর্টিকেল</span>
                      <span className="font-semibold">৩৫৬</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ট্রেন্ডিং হিট</span>
                      <span className="font-semibold">৭২</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>এনগেজমেন্ট রেট</span>
                      <span className="font-semibold">৮৪%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>শেয়ার রেট</span>
                      <span className="font-semibold">২৮%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAdminLayout>
  );
}