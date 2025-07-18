import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Server,
  Globe,
  Users,
  Database,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function PerformanceMonitoringPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Performance metrics query
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['/api/admin/performance-metrics'],
    refetchInterval: refreshInterval,
  });

  // Error logs query
  const { data: errorLogs, isLoading: errorsLoading } = useQuery({
    queryKey: ['/api/admin/error-logs'],
    refetchInterval: 30000,
  });

  // API response times query
  const { data: apiMetrics, isLoading: apiLoading } = useQuery({
    queryKey: ['/api/admin/api-metrics'],
    refetchInterval: 10000,
  });

  // User experience analytics query
  const { data: uxAnalytics, isLoading: uxLoading } = useQuery({
    queryKey: ['/api/admin/ux-analytics'],
    refetchInterval: 60000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">পারফরম্যান্স মনিটরিং</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              সাইট পারফরম্যান্স, এরর লগ এবং API রেসপন্স টাইম মনিটরিং
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              {refreshInterval/1000}s
            </Badge>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সাইট স্ট্যাটাস</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {getStatusIcon(performanceData?.site_status || 'unknown')}
                {performanceData?.site_status === 'excellent' ? 'চমৎকার' : 
                 performanceData?.site_status === 'good' ? 'ভাল' :
                 performanceData?.site_status === 'warning' ? 'সতর্কতা' : 'সমস্যা'}
              </div>
              <p className="text-xs text-muted-foreground">
                আপটাইম: {performanceData?.uptime || '99.9'}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">পেজ লোড টাইম</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceData?.avg_page_load_time || '0'}ms</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {performanceData?.page_load_trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                {performanceData?.page_load_change || '0'}% গত সপ্তাহ থেকে
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API রেসপন্স</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiMetrics?.avg_response_time || '0'}ms</div>
              <p className="text-xs text-muted-foreground">
                {apiMetrics?.total_requests || 0} রিকোয়েস্ট আজ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">এরর রেট</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceData?.error_rate || '0'}%</div>
              <p className="text-xs text-muted-foreground">
                {errorLogs?.length || 0} এরর আজ
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Monitoring Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">সারসংক্ষেপ</TabsTrigger>
            <TabsTrigger value="errors">এরর লগ</TabsTrigger>
            <TabsTrigger value="api">API মেট্রিক্স</TabsTrigger>
            <TabsTrigger value="ux">UX অ্যানালিটিক্স</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>সিস্টেম রিসোর্স</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">CPU ব্যবহার</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full" 
                            style={{ width: `${performanceData?.cpu_usage || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{performanceData?.cpu_usage || 0}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">মেমোরি ব্যবহার</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full" 
                            style={{ width: `${performanceData?.memory_usage || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{performanceData?.memory_usage || 0}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ডিস্ক ব্যবহার</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-yellow-500 rounded-full" 
                            style={{ width: `${performanceData?.disk_usage || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{performanceData?.disk_usage || 0}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>নেটওয়ার্ক মেট্রিক্স</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ব্যান্ডউইথ ব্যবহার</span>
                      <span className="text-sm font-bold">{performanceData?.bandwidth_usage || '0'} MB/s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">অনুরোধ/সেকেন্ড</span>
                      <span className="text-sm font-bold">{performanceData?.requests_per_second || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">সক্রিয় সংযোগ</span>
                      <span className="text-sm font-bold">{performanceData?.active_connections || '0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>সাম্প্রতিক এরর লগ</CardTitle>
                <CardDescription>
                  সর্বশেষ {errorLogs?.length || 0} টি এরর
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errorLogs?.map((error: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <AlertTriangle className={`h-4 w-4 ${
                          error.level === 'critical' ? 'text-red-500' :
                          error.level === 'warning' ? 'text-yellow-500' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{error.type}</span>
                          <Badge variant={error.level === 'critical' ? 'destructive' : 'outline'}>
                            {error.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{error.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(error.timestamp).toLocaleString('bn-BD')} • {error.url}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API এন্ডপয়েন্ট পারফরম্যান্স</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apiMetrics?.endpoints?.map((endpoint: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{endpoint.path}</h4>
                          <p className="text-sm text-gray-600">{endpoint.method}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{endpoint.avg_response_time}ms</div>
                          <div className="text-xs text-gray-500">{endpoint.requests_count} রিকোয়েস্ট</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ধীর কোয়েরি</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apiMetrics?.slow_queries?.map((query: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">Query #{index + 1}</span>
                          <Badge variant="outline">{query.duration}ms</Badge>
                        </div>
                        <p className="text-xs text-gray-600 font-mono">{query.query}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(query.timestamp).toLocaleString('bn-BD')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ux" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ইউজার এক্সপেরিয়েন্স মেট্রিক্স</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">বাউন্স রেট</span>
                      <span className="text-sm font-bold">{uxAnalytics?.bounce_rate || '0'}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">গড় সেশন দৈর্ঘ্য</span>
                      <span className="text-sm font-bold">{uxAnalytics?.avg_session_duration || '0'}s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">পেজ ভিউ/সেশন</span>
                      <span className="text-sm font-bold">{uxAnalytics?.pages_per_session || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">কনভার্শন রেট</span>
                      <span className="text-sm font-bold">{uxAnalytics?.conversion_rate || '0'}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>সবচেয়ে ধীর পেজ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {uxAnalytics?.slowest_pages?.map((page: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium truncate">{page.path}</h4>
                          <p className="text-sm text-gray-600">{page.visits} ভিজিট</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{page.avg_load_time}ms</div>
                          <div className="text-xs text-gray-500">গড় লোড টাইম</div>
                        </div>
                      </div>
                    ))}
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