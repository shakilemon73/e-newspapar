import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { SimplifiedAdminLayout } from "@/components/admin/SimplifiedAdminLayout";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Eye, 
  MessageSquare, 
  Calendar, 
  Activity, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
  BarChart3,
  Database,
  Shield,
  Bell,
  ArrowUp,
  ArrowDown,
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalArticles: number;
  totalUsers: number;
  totalEpapers: number;
  totalViews: number;
  totalComments: number;
  avgReadTime: number;
  topCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    target: string;
    timestamp: string;
    type: 'article' | 'user' | 'comment' | 'system';
  }>;
}

interface QuickAction {
  id: string;
  enLabel: string;
  bnLabel: string;
  enDescription: string;
  bnDescription: string;
  icon: React.ElementType;
  href: string;
  priority: 'high' | 'medium' | 'low';
  status?: 'pending' | 'active' | 'completed';
}

const quickActions: QuickAction[] = [
  {
    id: 'create-article',
    enLabel: 'Create Article',
    bnLabel: 'নিবন্ধ তৈরি করুন',
    enDescription: 'Write and publish new content',
    bnDescription: 'নতুন কন্টেন্ট লিখুন এবং প্রকাশ করুন',
    icon: FileText,
    href: '/admin/articles',
    priority: 'high'
  },
  {
    id: 'manage-users',
    enLabel: 'User Management',
    bnLabel: 'ব্যবহারকারী ব্যবস্থাপনা',
    enDescription: 'Monitor and manage user accounts',
    bnDescription: 'ব্যবহারকারী অ্যাকাউন্ট পর্যবেক্ষণ এবং পরিচালনা',
    icon: Users,
    href: '/admin/users',
    priority: 'medium'
  },
  {
    id: 'breaking-news',
    enLabel: 'Breaking News',
    bnLabel: 'জরুরি সংবাদ',
    enDescription: 'Manage urgent news updates',
    bnDescription: 'জরুরি সংবাদ আপডেট পরিচালনা',
    icon: Bell,
    href: '/admin/breaking-news',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'analytics',
    enLabel: 'Analytics',
    bnLabel: 'বিশ্লেষণ',
    enDescription: 'View detailed website analytics',
    bnDescription: 'বিস্তারিত ওয়েবসাইট বিশ্লেষণ দেখুন',
    icon: BarChart3,
    href: '/admin/analytics',
    priority: 'medium'
  },
  {
    id: 'database',
    enLabel: 'Database Status',
    bnLabel: 'ডাটাবেস অবস্থা',
    enDescription: 'Monitor database health',
    bnDescription: 'ডাটাবেস স্বাস্থ্য পর্যবেক্ষণ',
    icon: Database,
    href: '/admin/database',
    priority: 'low',
    status: 'active'
  },
  {
    id: 'security',
    enLabel: 'Security',
    bnLabel: 'নিরাপত্তা',
    enDescription: 'Review security settings',
    bnDescription: 'নিরাপত্তা সেটিংস পর্যালোচনা',
    icon: Shield,
    href: '/admin/security',
    priority: 'high'
  }
];

export default function EnhancedAdminDashboard() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    refetchInterval: 60000 // Auto-refresh every minute
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/recent-activity'],
    refetchInterval: 15000 // Auto-refresh every 15 seconds
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      setRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/recent-activity'] })
      ]);
      setRefreshing(false);
    }
  });

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend, 
    loading = false 
  }: { 
    title: string; 
    value: string | number; 
    change?: string; 
    icon: React.ElementType; 
    trend?: 'up' | 'down' | 'stable'; 
    loading?: boolean; 
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <div className="flex items-center text-xs text-muted-foreground">
                {trend === 'up' && <ArrowUp className="h-3 w-3 mr-1 text-green-500" />}
                {trend === 'down' && <ArrowDown className="h-3 w-3 mr-1 text-red-500" />}
                {change}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ action }: { action: QuickAction }) => (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
      action.priority === 'high' ? 'ring-2 ring-primary/20' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              action.priority === 'high' ? 'bg-primary/10 text-primary' : 
              action.priority === 'medium' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 
              'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              <action.icon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                {t(`action-${action.id}`, action.enLabel, action.bnLabel)}
              </CardTitle>
              {action.status && (
                <Badge variant={action.status === 'active' ? 'default' : 'secondary'} className="text-xs mt-1">
                  {action.status}
                </Badge>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          {t(`action-desc-${action.id}`, action.enDescription, action.bnDescription)}
        </p>
      </CardContent>
    </Card>
  );

  if (statsError) {
    return (
      <SimplifiedAdminLayout>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('dashboard-error', 'Unable to load dashboard data. Please try again.', 'ড্যাশবোর্ড ডেটা লোড করতে অক্ষম। আবার চেষ্টা করুন।')}
          </AlertDescription>
        </Alert>
      </SimplifiedAdminLayout>
    );
  }

  return (
    <SimplifiedAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('dashboard-title', 'Admin Dashboard', 'অ্যাডমিন ড্যাশবোর্ড')}
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard-subtitle', 'Monitor and manage your Bengali news platform', 'আপনার বাংলা সংবাদ প্ল্যাটফর্ম পর্যবেক্ষণ এবং পরিচালনা করুন')}
            </p>
          </div>
          <Button 
            onClick={() => refreshMutation.mutate()} 
            disabled={refreshing}
            className="min-w-fit"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('refresh', 'Refresh', 'রিফ্রেশ')}
          </Button>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('total-articles', 'Total Articles', 'মোট নিবন্ধ')}
            value={stats?.totalArticles || 0}
            change={t('last-week', '+12% from last week', 'গত সপ্তাহ থেকে +১২%')}
            icon={FileText}
            trend="up"
            loading={statsLoading}
          />
          <StatCard
            title={t('total-users', 'Total Users', 'মোট ব্যবহারকারী')}
            value={stats?.totalUsers || 0}
            change={t('new-users', '+5% new users', '+৫% নতুন ব্যবহারকারী')}
            icon={Users}
            trend="up"
            loading={statsLoading}
          />
          <StatCard
            title={t('total-views', 'Total Views', 'মোট দর্শন')}
            value={analytics?.totalViews || 0}
            change={t('today', 'Today', 'আজ')}
            icon={Eye}
            trend="stable"
            loading={analyticsLoading}
          />
          <StatCard
            title={t('avg-read-time', 'Avg. Read Time', 'গড় পড়ার সময়')}
            value={analytics?.avgReadTime ? `${analytics.avgReadTime}min` : '0min'}
            change={t('engagement', 'Good engagement', 'ভাল সংযুক্তি')}
            icon={Clock}
            trend="up"
            loading={analyticsLoading}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t('quick-actions', 'Quick Actions', 'দ্রুত ক্রিয়া')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <a key={action.id} href={action.href} className="block">
                  <QuickActionCard action={action} />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="overview">
              {t('overview', 'Overview', 'সংক্ষিপ্ত বিবরণ')}
            </TabsTrigger>
            <TabsTrigger value="activity">
              {t('activity', 'Activity', 'কার্যকলাপ')}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              {t('analytics', 'Analytics', 'বিশ্লেষণ')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t('device-usage', 'Device Usage', 'ডিভাইস ব্যবহার')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analyticsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('mobile', 'Mobile', 'মোবাইল')}</span>
                          <span>{analytics?.deviceStats?.mobile || 0}%</span>
                        </div>
                        <Progress value={analytics?.deviceStats?.mobile || 0} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('desktop', 'Desktop', 'ডেস্কটপ')}</span>
                          <span>{analytics?.deviceStats?.desktop || 0}%</span>
                        </div>
                        <Progress value={analytics?.deviceStats?.desktop || 0} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('tablet', 'Tablet', 'ট্যাবলেট')}</span>
                          <span>{analytics?.deviceStats?.tablet || 0}%</span>
                        </div>
                        <Progress value={analytics?.deviceStats?.tablet || 0} className="h-2" />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t('top-categories', 'Top Categories', 'শীর্ষ বিভাগ')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analytics?.topCategories?.map((category, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="truncate">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{category.count}</span>
                            <Badge variant="secondary">{category.percentage}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('recent-activity', 'Recent Activity', 'সাম্প্রতিক কার্যকলাপ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity?.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'article' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                          activity.type === 'user' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                          activity.type === 'comment' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {activity.type === 'article' && <FileText className="h-4 w-4" />}
                          {activity.type === 'user' && <Users className="h-4 w-4" />}
                          {activity.type === 'comment' && <MessageSquare className="h-4 w-4" />}
                          {activity.type === 'system' && <Activity className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.action}</p>
                          <p className="text-xs text-muted-foreground truncate">{activity.target}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t('content-performance', 'Content Performance', 'কন্টেন্ট কর্মক্ষমতা')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('avg-engagement', 'Average Engagement', 'গড় সংযুক্তি')}</span>
                      <Badge variant="secondary">85%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('bounce-rate', 'Bounce Rate', 'বাউন্স রেট')}</span>
                      <Badge variant="secondary">25%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('return-visitors', 'Return Visitors', 'পুনরায় দর্শক')}</span>
                      <Badge variant="secondary">60%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t('system-health', 'System Health', 'সিস্টেম স্বাস্থ্য')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('uptime', 'Uptime', 'আপটাইম')}</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">99.9%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('response-time', 'Response Time', 'প্রতিক্রিয়া সময়')}</span>
                      <Badge variant="secondary">120ms</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('error-rate', 'Error Rate', 'ত্রুটি হার')}</span>
                      <Badge variant="secondary">0.1%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SimplifiedAdminLayout>
  );
}