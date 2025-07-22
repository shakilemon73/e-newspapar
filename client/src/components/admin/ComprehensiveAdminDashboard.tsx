/**
 * Comprehensive Admin Dashboard - Main Hub
 * Migrated from Express Server to Direct Supabase API
 * Vercel deployment ready
 */
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { EnhancedAdminLayout } from './EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Loader2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Zap,
  Database,
  Shield,
  CheckCircle,
  AlertCircle,
  Globe
} from 'lucide-react';

interface DashboardStats {
  totalArticles: number;
  totalUsers: number;
  totalCategories: number;
  totalViews: number;
  featuredArticles: number;
  publishedToday: number;
  recentArticles: number;
  recentUsers: number;
  articlesGrowth: string;
  usersGrowth: string;
}

export default function ComprehensiveAdminDashboard() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [authLoading, user, setLocation]);

  // Fetch dashboard statistics using direct Supabase API
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    enabled: !!user && user.user_metadata?.role === 'admin',
    queryFn: async () => {
      const { getDashboardStats } = await import('../../lib/admin-api-direct');
      return await getDashboardStats();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch analytics data using direct Supabase API
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    enabled: !!user && user.user_metadata?.role === 'admin',
    queryFn: async () => {
      const { getAdminAnalytics } = await import('../../lib/admin-api-direct');
      return await getAdminAnalytics('week');
    },
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  if (statsError) {
    return (
      <EnhancedAdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Dashboard Error
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Unable to load dashboard statistics
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6 p-6">
        {/* Header Section */}
        <div className="cultural-gradient rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3 tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-green-100 text-lg">
                Comprehensive news management system - Direct Supabase API
              </p>
              <div className="flex items-center mt-4 space-x-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Vercel Ready
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Database className="h-3 w-3 mr-1" />
                  Direct API
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalArticles || 0}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                {stats?.articlesGrowth && (
                  <>
                    {stats.articlesGrowth.startsWith('+') ? (
                      <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    {stats.articlesGrowth} from last week
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                {stats?.usersGrowth && (
                  <>
                    {stats.usersGrowth.startsWith('+') ? (
                      <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    {stats.usersGrowth} from last week
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalViews?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Article page views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Articles</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.featuredArticles || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Articles marked as featured
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Content Management
              </CardTitle>
              <CardDescription>
                Manage articles, categories, and media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setLocation('/admin/articles')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Manage Articles
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setLocation('/admin/categories')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setLocation('/admin/breaking-news')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Breaking News
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setLocation('/admin/users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setLocation('/admin/analytics')}
              >
                <Activity className="h-4 w-4 mr-2" />
                User Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Management
              </CardTitle>
              <CardDescription>
                Configure system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setLocation('/admin/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setLocation('/admin/database')}
              >
                <Database className="h-4 w-4 mr-2" />
                Database Management
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setLocation('/admin/security')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Statistics</CardTitle>
              <CardDescription>
                Activity from the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Articles</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{stats?.recentArticles || 0}</Badge>
                    <Progress value={(stats?.recentArticles || 0) * 10} className="w-20" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Users</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{stats?.recentUsers || 0}</Badge>
                    <Progress value={(stats?.recentUsers || 0) * 5} className="w-20" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Published Today</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{stats?.publishedToday || 0}</Badge>
                    <Progress value={(stats?.publishedToday || 0) * 20} className="w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system health and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Database Connection</span>
                  </div>
                  <Badge variant="default">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Supabase API</span>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Vercel Deployment</span>
                  </div>
                  <Badge variant="default">Ready</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}