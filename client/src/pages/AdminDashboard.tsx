import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { WebsiteAdminLayout } from '@/components/admin/WebsiteAdminLayout';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Newspaper, 
  AlertCircle, 
  Loader2,
  Plus,
  Eye,
  TrendingUp
} from 'lucide-react';
import { Link } from 'wouter';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  // Always call hooks first - no conditional hook calls
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/recent-activity'],
    queryFn: async () => {
      const response = await fetch('/api/admin/recent-activity');
      if (!response.ok) throw new Error('Failed to fetch recent activity');
      return response.json();
    },
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: articleStats, isLoading: articleStatsLoading } = useQuery({
    queryKey: ['/api/admin/articles/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/articles/stats');
      if (!response.ok) throw new Error('Failed to fetch article stats');
      return response.json();
    },
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/');
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

  // Not authenticated
  if (!user) {
    return null;
  }

  // Not admin
  if (user.user_metadata?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Add New Article',
      description: 'Create a new article for publication',
      icon: FileText,
      href: '/admin/articles',
      color: 'bg-blue-500',
    },
    {
      title: 'Breaking News',
      description: 'Manage breaking news alerts',
      icon: AlertCircle,
      href: '/admin/breaking-news',
      color: 'bg-red-500',
    },
    {
      title: 'Upload E-Paper',
      description: 'Add new e-paper edition',
      icon: Newspaper,
      href: '/admin/epapers',
      color: 'bg-green-500',
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'bg-purple-500',
    },
  ];

  return (
    <WebsiteAdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Website Administration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete control over প্রথম আলো website content, posts, and user management.
          </p>
        </div>

        {/* Dashboard Stats */}
        {statsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <DashboardStats stats={dashboardStats} />
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Article Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Article Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {articleStatsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Articles</span>
                    <span className="font-semibold">{articleStats?.totalArticles || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Featured Articles</span>
                    <span className="font-semibold">{articleStats?.featuredArticles || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Views</span>
                    <span className="font-semibold">{articleStats?.totalViews || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Published Today</span>
                    <span className="font-semibold">{articleStats?.publishedToday || 0}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity?.slice(0, 5).map((activity: any) => (
                    <div key={activity.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {activity.title}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 ml-2">{activity.time}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage articles, categories, and media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/articles">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Articles
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Categories
                </Button>
              </Link>
              <Link href="/admin/epapers">
                <Button variant="outline" className="w-full justify-start">
                  <Newspaper className="h-4 w-4 mr-2" />
                  E-Papers
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>News Management</CardTitle>
              <CardDescription>Handle breaking news and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/breaking-news">
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Breaking News
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Quick News
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  All Users
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </WebsiteAdminLayout>
  );
}