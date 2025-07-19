import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { cn } from "@/lib/utils";
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Users, 
  Settings, 
  BarChart3,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Plus,
  Activity,
  MessageSquare,
  Zap,
  Shield,
  DollarSign,
  Smartphone,
  Globe,
  Database,
  Eye,
  TrendingUp,
  Clock
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Consolidated workspace structure based on Don Norman's principles
const workspaces = [
  {
    id: 'dashboard',
    title: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
    description: { en: 'Overview and quick actions', bn: 'সংক্ষিপ্ত বিবরণ এবং দ্রুত কর্ম' },
    icon: Home,
    href: '/admin-dashboard',
    color: 'blue',
    quickActions: [
      { title: 'Create Article', href: '/admin/articles?new=true', icon: Plus },
      { title: 'Breaking News', href: '/admin/breaking-news', icon: Bell },
      { title: 'View Analytics', href: '/admin/analytics', icon: BarChart3 },
      { title: 'Moderate Comments', href: '/admin/comments', icon: MessageSquare }
    ]
  },
  {
    id: 'content',
    title: { en: 'Content Hub', bn: 'কন্টেন্ট হাব' },
    description: { en: 'Manage all content and media', bn: 'সমস্ত কন্টেন্ট এবং মিডিয়া পরিচালনা' },
    icon: FileText,
    href: '/admin/content-hub',
    color: 'green',
    sections: [
      { title: 'Articles', href: '/admin/articles', icon: FileText, count: '245' },
      { title: 'Categories', href: '/admin/categories', icon: 'Tag', count: '12' },
      { title: 'E-Papers', href: '/admin/epapers', icon: 'Newspaper', count: '8' },
      { title: 'Videos', href: '/admin/videos', icon: 'Video', count: '32' },
      { title: 'Audio', href: '/admin/audio', icon: 'Headphones', count: '15' },
      { title: 'Breaking News', href: '/admin/breaking-news', icon: Bell, badge: 'Live' }
    ]
  },
  {
    id: 'audience',
    title: { en: 'Audience Center', bn: 'অডিয়েন্স সেন্টার' },
    description: { en: 'Users, engagement and analytics', bn: 'ব্যবহারকারী, সম্পৃক্ততা এবং বিশ্লেষণ' },
    icon: Users,
    href: '/admin/audience-center',
    color: 'purple',
    sections: [
      { title: 'Users', href: '/admin/users', icon: Users, count: '1,234' },
      { title: 'Comments', href: '/admin/comments', icon: MessageSquare, count: '89', badge: 'Pending' },
      { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { title: 'User Dashboard', href: '/admin/user-dashboard', icon: Activity },
      { title: 'Trending', href: '/admin/trending-analytics', icon: TrendingUp },
      { title: 'Algorithms', href: '/admin/advanced-algorithms', icon: 'Bot' }
    ]
  },
  {
    id: 'system',
    title: { en: 'System Control', bn: 'সিস্টেম নিয়ন্ত্রণ' },
    description: { en: 'Settings, security and management', bn: 'সেটিংস, নিরাপত্তা এবং ব্যবস্থাপনা' },
    icon: Settings,
    href: '/admin/system-control',
    color: 'orange',
    sections: [
      { title: 'General Settings', href: '/admin/settings', icon: Settings },
      { title: 'SEO Management', href: '/admin/seo', icon: Globe },
      { title: 'Database', href: '/admin/database', icon: Database },
      { title: 'Performance', href: '/admin/performance', icon: Activity },
      { title: 'Security', href: '/admin/security', icon: Shield },
      { title: 'Mobile App', href: '/admin/mobile-app', icon: Smartphone }
    ]
  },
  {
    id: 'business',
    title: { en: 'Business Tools', bn: 'ব্যবসায়িক সরঞ্জাম' },
    description: { en: 'Revenue, marketing and growth', bn: 'রাজস্ব, বিপণন এবং বৃদ্ধি' },
    icon: DollarSign,
    href: '/admin/business-tools',
    color: 'emerald',
    sections: [
      { title: 'Advertisements', href: '/admin/advertisements', icon: DollarSign },
      { title: 'Social Media', href: '/admin/social-media', icon: 'Share2' },
      { title: 'Email & Notifications', href: '/admin/email-notifications', icon: 'Mail' },
      { title: 'Weather', href: '/admin/weather', icon: 'Cloud' },
      { title: 'Search Management', href: '/admin/search', icon: Search },
      { title: 'Footer Pages', href: '/admin/footer-pages', icon: FileText }
    ]
  }
];

// Recent activity mock data - in real implementation, this would come from API
const recentActivity = [
  { type: 'article', title: 'New article published', time: '2 minutes ago', user: 'Admin' },
  { type: 'comment', title: '5 comments need moderation', time: '15 minutes ago', urgent: true },
  { type: 'user', title: '12 new users registered', time: '1 hour ago' },
  { type: 'system', title: 'Database backup completed', time: '2 hours ago' }
];

export function SimplifiedAdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();
  const { user, logout } = useSupabaseAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isWorkspaceActive = (workspaceId: string) => {
    if (workspaceId === 'dashboard') return location === '/admin-dashboard';
    return workspaces.find(w => w.id === workspaceId)?.sections?.some(s => location.startsWith(s.href));
  };

  const isDashboardRoute = location === '/admin-dashboard';

  // Smart Dashboard Content
  const DashboardContent = () => (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('dashboard-welcome', 'Admin Dashboard', 'অ্যাডমিন ড্যাশবোর্ড')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard-subtitle', 'Manage your news platform efficiently', 'আপনার সংবাদ প্ল্যাটফর্ম দক্ষতার সাথে পরিচালনা করুন')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            System Healthy
          </Badge>
          <Button size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            3 Alerts
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold">245</p>
                <p className="text-xs text-green-600">+12 today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-green-600">+8% this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comments</p>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-orange-600">5 pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">45.2K</p>
                <p className="text-xs text-green-600">+15% vs yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {workspaces.slice(1).map((workspace) => (
          <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  workspace.color === 'green' && "bg-green-100 dark:bg-green-900",
                  workspace.color === 'purple' && "bg-purple-100 dark:bg-purple-900",
                  workspace.color === 'orange' && "bg-orange-100 dark:bg-orange-900",
                  workspace.color === 'emerald' && "bg-emerald-100 dark:bg-emerald-900"
                )}>
                  <workspace.icon className={cn(
                    "h-6 w-6",
                    workspace.color === 'green' && "text-green-600 dark:text-green-400",
                    workspace.color === 'purple' && "text-purple-600 dark:text-purple-400",
                    workspace.color === 'orange' && "text-orange-600 dark:text-orange-400",
                    workspace.color === 'emerald' && "text-emerald-600 dark:text-emerald-400"
                  )} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{workspace.title.en}</CardTitle>
                  <p className="text-sm text-muted-foreground">{workspace.description.en}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {workspace.sections?.slice(0, 4).map((section) => (
                  <Link key={section.href} href={section.href}>
                    <div className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="text-muted-foreground">
                          {typeof section.icon === 'string' ? section.icon : <section.icon className="h-4 w-4" />}
                        </div>
                        <span className="text-sm">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {section.count && (
                          <Badge variant="secondary" className="text-xs">{section.count}</Badge>
                        )}
                        {section.badge && (
                          <Badge variant="destructive" className="text-xs">{section.badge}</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                <Link href={workspace.href}>
                  <Button variant="ghost" size="sm" className="w-full justify-center mt-2">
                    View All
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg">
                <div className={cn(
                  "p-1 rounded-full",
                  activity.urgent ? "bg-red-100 dark:bg-red-900" : "bg-muted"
                )}>
                  {activity.type === 'article' && <FileText className="h-3 w-3" />}
                  {activity.type === 'comment' && <MessageSquare className="h-3 w-3" />}
                  {activity.type === 'user' && <Users className="h-3 w-3" />}
                  {activity.type === 'system' && <Settings className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                {activity.urgent && (
                  <Badge variant="destructive" className="text-xs">Urgent</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold">Admin Panel</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">প</span>
                  </div>
                  <div>
                    <h2 className="font-semibold">Admin Panel</h2>
                    <p className="text-xs text-muted-foreground">Emon Financial Times</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {workspaces.map((workspace) => (
                  <Link key={workspace.id} href={workspace.href}>
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                      isWorkspaceActive(workspace.id) 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}>
                      <workspace.icon className="h-5 w-5" />
                      <div className="flex-1">
                        <p className="font-medium">{workspace.title.en}</p>
                        <p className="text-xs opacity-70">{workspace.description.en}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user?.email || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {isDashboardRoute ? <DashboardContent /> : children}
        </div>
      </div>
    </div>
  );
}