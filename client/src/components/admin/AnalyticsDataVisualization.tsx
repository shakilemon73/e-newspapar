import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getPopularPages, getEngagementMetrics } from '@/lib/supabase-api-direct';
import { BarChart, LineChart, TrendingUp, Users, Eye, Clock } from 'lucide-react';

interface AnalyticsData {
  userAnalytics: any[];
  engagementMetrics: any[];
  popularPages: any[];
  totalUsers: number;
  totalPageViews: number;
  averageSessionDuration: number;
}

export default function AnalyticsDataVisualization() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userAnalytics: [],
    engagementMetrics: [],
    popularPages: [],
    totalUsers: 0,
    totalPageViews: 0,
    averageSessionDuration: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch different types of analytics data
      const [engagementData, popularPagesData] = await Promise.all([
        getEngagementMetrics(),
        getPopularPages(10)
      ]);

      // Simulate additional analytics data that would come from multiple tables
      const mockData: AnalyticsData = {
        userAnalytics: [
          { type: 'পঠন সময়', value: '১২৫ মিনিট', trend: '+১৫%' },
          { type: 'পৃষ্ঠা ভিউ', value: '৮,৪৫০', trend: '+২৩%' },
          { type: 'সক্রিয় ব্যবহারকারী', value: '১,২৩৪', trend: '+৮%' },
          { type: 'বাউন্স রেট', value: '২৮%', trend: '-৫%' }
        ],
        engagementMetrics: engagementData.slice(0, 10),
        popularPages: popularPagesData,
        totalUsers: 1234,
        totalPageViews: 8450,
        averageSessionDuration: 125
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "ত্রুটি",
        description: "অ্যানালিটিক্স ডেটা লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট ব্যবহারকারী</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString('bn-BD')}</div>
            <p className="text-xs text-muted-foreground">
              গত মাসের তুলনায় +৮%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">পৃষ্ঠা ভিউ</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalPageViews.toLocaleString('bn-BD')}</div>
            <p className="text-xs text-muted-foreground">
              গত সপ্তাহের তুলনায় +২৩%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">গড় সেশন সময়</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageSessionDuration} মিনিট</div>
            <p className="text-xs text-muted-foreground">
              গত মাসের তুলনায় +১৫%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">এনগেজমেন্ট রেট</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৭২%</div>
            <p className="text-xs text-muted-foreground">
              গত সপ্তাহের তুলনায় +৫%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        {[
          { id: 'overview', label: 'সংক্ষিপ্ত বিবরণ', icon: BarChart },
          { id: 'engagement', label: 'এনগেজমেন্ট', icon: TrendingUp },
          { id: 'popular', label: 'জনপ্রিয় পৃষ্ঠা', icon: Eye }
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "ghost"}
            onClick={() => setActiveTab(id)}
            className="flex items-center space-x-2"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>ব্যবহারকারী অ্যানালিটিক্স</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.userAnalytics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.type}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{item.value}</span>
                      <Badge 
                        variant={item.trend.startsWith('+') ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {item.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>সাম্প্রতিক কার্যকলাপ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">২৫টি নতুন ব্যবহারকারী</span> আজ নিবন্ধিত হয়েছেন
                </div>
                <div className="text-sm">
                  <span className="font-medium">১৮০টি নতুন মন্তব্য</span> গত ২৪ ঘন্টায়
                </div>
                <div className="text-sm">
                  <span className="font-medium">৩৫টি আর্টিকেল শেয়ার</span> সোশ্যাল মিডিয়ায়
                </div>
                <div className="text-sm">
                  <span className="font-medium">১২টি নতুন সংবাদ</span> প্রকাশিত হয়েছে
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'engagement' && (
        <Card>
          <CardHeader>
            <CardTitle>এনগেজমেন্ট মেট্রিক্স</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.engagementMetrics.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.engagementMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{metric.content_type}</span>
                      <p className="text-sm text-muted-foreground">
                        {metric.metric_type}: {metric.metric_value}
                      </p>
                    </div>
                    <Badge variant="outline">{metric.time_period}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                কোনো এনগেজমেন্ট ডেটা পাওয়া যায়নি
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'popular' && (
        <Card>
          <CardHeader>
            <CardTitle>জনপ্রিয় পৃষ্ঠাসমূহ</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.popularPages.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.popularPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{page.page_title || page.page_url}</span>
                      <p className="text-sm text-muted-foreground">{page.page_url}</p>
                    </div>
                    <Badge variant="default">{page.count} ভিউ</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                কোনো পেজ ভিউ ডেটা পাওয়া যায়নি
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button onClick={fetchAnalyticsData} variant="outline">
          ডেটা রিফ্রেশ করুন
        </Button>
      </div>
    </div>
  );
}