import React from 'react';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { TrendingAnalyticsDashboard } from '@/components/TrendingAnalyticsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export default function TrendingAnalyticsPage() {
  const handleExportData = () => {
    // Implementation for exporting analytics data
    console.log('Exporting analytics data...');
  };

  const handleRefreshData = () => {
    // Implementation for refreshing analytics data
    console.log('Refreshing analytics data...');
  };

  const analyticsMetrics = [
    {
      title: 'মোট ট্রেন্ডিং আইটেম',
      value: '২৪',
      change: '+৮%',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      title: 'সক্রিয় ব্যবহারকারী',
      value: '১,৫৪৭',
      change: '+১২%',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'মোট এনগেজমেন্ট',
      value: '৮,৩২১',
      change: '+৫%',
      icon: <Heart className="w-5 h-5" />,
      color: 'text-red-600'
    },
    {
      title: 'গড় ভিউ টাইম',
      value: '৩.২ মিনিট',
      change: '+৭%',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-purple-600'
    }
  ];

  const topCategories = [
    { name: 'রাজনীতি', articles: 45, engagement: 89 },
    { name: 'খেলাধুলা', articles: 32, engagement: 76 },
    { name: 'বিনোদন', articles: 28, engagement: 82 },
    { name: 'প্রযুক্তি', articles: 21, engagement: 68 },
    { name: 'অর্থনীতি', articles: 19, engagement: 71 }
  ];

  const recentTrends = [
    {
      topic: 'নতুন বাজেট ঘোষণা',
      mentions: 1247,
      growth: '+342%',
      category: 'অর্থনীতি'
    },
    {
      topic: 'ক্রিকেট বিশ্বকাপ',
      mentions: 892,
      growth: '+156%',
      category: 'খেলাধুলা'
    },
    {
      topic: 'নতুন প্রযুক্তি নীতি',
      mentions: 654,
      growth: '+98%',
      category: 'প্রযুক্তি'
    },
    {
      topic: 'সিনেমা উৎসব',
      mentions: 543,
      growth: '+76%',
      category: 'বিনোদন'
    }
  ];

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
              <Button 
                onClick={handleRefreshData}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                রিফ্রেশ
              </Button>
              <Button 
                onClick={handleExportData}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                এক্সপোর্ট
              </Button>
              <Badge className="bg-white/20 text-white border-white/30">
                <Activity className="w-3 h-3 mr-1" />
                লাইভ ডেটা
              </Badge>
            </div>
          </div>
        </div>

        {/* Analytics Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsMetrics.map((metric, index) => (
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
          ))}
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
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>শীর্ষ পারফরমিং বিভাগ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-gray-600">
                              {category.articles} টি আর্টিকেল
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {category.engagement}% এনগেজমেন্ট
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>বিভাগভিত্তিক পারফরম্যান্স</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topCategories.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-gray-600">{category.engagement}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${category.engagement}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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