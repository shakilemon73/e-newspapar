import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useLanguage, LanguageProvider } from '@/hooks/use-language';
import { AdminOnlyLayout } from '@/components/admin/AdminOnlyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Newspaper, 
  AlertCircle, 
  Loader2,
  Plus,
  Eye,
  TrendingUp,
  BarChart3,
  Calendar,
  Settings,
  Video,
  Radio,
  Cloud,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Languages
} from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// Modern Dashboard Component with Language Support
function ModernAdminDashboard() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const queryClient = useQueryClient();

  // Real-time dashboard data with Supabase integration
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/admin/stats', selectedTimeRange],
    enabled: !!user && user.user_metadata?.role === 'admin',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/recent-activity'],
    enabled: !!user && user.user_metadata?.role === 'admin',
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics', selectedTimeRange],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      console.log('User metadata:', user.user_metadata);
    }
  }, [authLoading, user, setLocation]);

  // Language toggle mutation
  const toggleLanguage = () => {
    const newLang = language === 'bn' ? 'en' : 'bn';
    setLanguage(newLang);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('action.loading')}</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Not admin
  if (user.user_metadata?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'bn' ? 'অ্যাডমিন অ্যাক্সেস প্রয়োজন' : 'Admin Access Required'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'bn' 
              ? 'আপনার অ্যাকাউন্টে অ্যাডমিন পারমিশন নেই। অ্যাডমিন অ্যাক্সেসের জন্য যোগাযোগ করুন।'
              : 'Your account does not have admin permissions. Please contact the administrator for access.'
            }
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Current Role:</strong> {user.user_metadata?.role || 'user'}</p>
            </div>
          </div>
          <Button onClick={() => setLocation('/')} className="w-full">
            {language === 'bn' ? 'হোম পেজে ফিরুন' : 'Return to Homepage'}
          </Button>
        </div>
      </div>
    );
  }

  // Modern Statistics Cards
  const statsCards = [
    {
      title: t('stats.totalArticles'),
      value: dashboardStats?.totalArticles || 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'blue'
    },
    {
      title: t('stats.totalUsers'),
      value: dashboardStats?.totalUsers || 0,
      change: '+8%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'green'
    },
    {
      title: t('stats.totalViews'),
      value: dashboardStats?.totalViews?.toLocaleString() || '0',
      change: '+25%',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'purple'
    },
    {
      title: t('stats.todayViews'),
      value: dashboardStats?.todayViews?.toLocaleString() || '0',
      change: '-5%',
      changeType: 'negative' as const,
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  // Modern Quick Actions with better UX
  const quickActions = [
    {
      title: language === 'bn' ? 'নতুন নিবন্ধ' : 'New Article',
      description: language === 'bn' ? 'নতুন নিবন্ধ তৈরি করুন' : 'Create a new article',
      icon: FileText,
      href: '/admin/articles',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      title: language === 'bn' ? 'ব্রেকিং নিউজ' : 'Breaking News',
      description: language === 'bn' ? 'জরুরি সংবাদ পরিচালনা' : 'Manage urgent news',
      icon: AlertCircle,
      href: '/admin/breaking-news',
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700'
    },
    {
      title: language === 'bn' ? 'ই-পেপার আপলোড' : 'Upload E-Paper',
      description: language === 'bn' ? 'নতুন ই-পেপার যোগ করুন' : 'Add new e-paper edition',
      icon: Newspaper,
      href: '/admin/epapers',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      title: language === 'bn' ? 'ব্যবহারকারী ব্যবস্থাপনা' : 'User Management',
      description: language === 'bn' ? 'ব্যবহারকারী অ্যাকাউন্ট পরিচালনা' : 'Manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    },
    {
      title: language === 'bn' ? 'ভিডিও কন্টেন্ট' : 'Video Content',
      description: language === 'bn' ? 'ভিডিও আপলোড ও পরিচালনা' : 'Upload and manage videos',
      icon: Video,
      href: '/admin/videos',
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700'
    },
    {
      title: language === 'bn' ? 'অডিও নিবন্ধ' : 'Audio Articles',
      description: language === 'bn' ? 'অডিও কন্টেন্ট পরিচালনা' : 'Manage audio content',
      icon: Radio,
      href: '/admin/audio',
      color: 'bg-gradient-to-r from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700'
    }
  ];

  return (
    <AdminOnlyLayout>
      <div className="space-y-8 p-6">
        {/* Modern Header with Language Toggle */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3">
                {t('dashboard.welcome')}, {user?.email?.split('@')[0]}!
              </h1>
              <p className="text-blue-100 text-lg">
                {language === 'bn' 
                  ? 'প্রথম আলো ওয়েবসাইটের সম্পূর্ণ নিয়ন্ত্রণ ও ব্যবস্থাপনা'
                  : 'Complete control and management of Prothom Alo website'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleLanguage}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Languages className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'English' : 'বাংলা'}
              </Button>
              <div className="text-right">
                <p className="text-sm text-blue-100">{t('time.today')}</p>
                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            statsCards.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900 flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                    <Badge 
                      variant={stat.changeType === 'positive' ? 'default' : 'secondary'}
                      className={`text-xs ${
                        stat.changeType === 'positive' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {stat.change}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modern Quick Actions Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('dashboard.quickActions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={action.title} href={action.href}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 overflow-hidden cursor-pointer">
                  <CardContent className="p-0">
                    <div className={`${action.color} ${action.hoverColor} transition-all duration-300 p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <action.icon className="h-8 w-8" />
                        <ArrowUpRight className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Modern Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl font-bold">
                  <Activity className="h-6 w-6 mr-3 text-blue-600" />
                  {t('dashboard.recentActivity')}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {language === 'bn' ? 'লাইভ' : 'Live'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity?.slice(0, 6).map((activity: any, index: number) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index % 4 === 0 ? 'bg-blue-100 text-blue-600' :
                        index % 4 === 1 ? 'bg-green-100 text-green-600' :
                        index % 4 === 2 ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {activity.action?.includes('Article') ? <FileText className="h-5 w-5" /> :
                         activity.action?.includes('User') ? <Users className="h-5 w-5" /> :
                         activity.action?.includes('E-paper') ? <Newspaper className="h-5 w-5" /> :
                         <Activity className="h-5 w-5" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {activity.title}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {language === 'bn' ? 'কোন সাম্প্রতিক কার্যকলাপ নেই' : 'No recent activity'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Analytics Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-bold">
                <BarChart3 className="h-6 w-6 mr-3 text-purple-600" />
                {language === 'bn' ? 'বিশ্লেষণ' : 'Analytics'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {dashboardStats?.publishedToday || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('stats.publishedToday')}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {dashboardStats?.activeUsers || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('stats.activeUsers')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'মোট নিবন্ধ' : 'Total Articles'}
                      </span>
                      <span className="font-semibold">{dashboardStats?.totalArticles || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'bn' ? 'ই-পেপার' : 'E-Papers'}
                      </span>
                      <span className="font-semibold">{dashboardStats?.totalEPapers || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminOnlyLayout>
  );
}

// Main export wrapped with LanguageProvider
export default function AdminDashboard() {
  return (
    <LanguageProvider>
      <ModernAdminDashboard />
    </LanguageProvider>
  );
}