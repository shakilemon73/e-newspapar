import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'wouter';
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  FileText, 
  Tag, 
  Newspaper, 
  Video, 
  Headphones, 
  Bell,
  Users,
  MessageSquare,
  BarChart3,
  Activity,
  TrendingUp,
  Bot,
  Settings,
  Globe,
  Database,
  Shield,
  Smartphone,
  DollarSign,
  Share2,
  Mail,
  Cloud,
  Search,
  ChevronRight,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

// Content Hub Workspace
export function ContentHubWorkspace() {
  const { t } = useLanguage();

  const contentSections = [
    { 
      id: 'articles', 
      title: 'Articles Management', 
      icon: FileText, 
      href: '/admin/articles',
      count: 245,
      description: 'Create, edit, and manage news articles',
      recentItems: ['Breaking: Economic Update', 'Sports: Cricket Match', 'Politics: New Policy']
    },
    { 
      id: 'categories', 
      title: 'Categories', 
      icon: Tag, 
      href: '/admin/categories',
      count: 12,
      description: 'Organize content into categories',
      recentItems: ['Sports', 'Politics', 'Entertainment', 'Technology']
    },
    { 
      id: 'epapers', 
      title: 'E-Papers', 
      icon: Newspaper, 
      href: '/admin/epapers',
      count: 8,
      description: 'Digital newspaper editions',
      recentItems: ['Today\'s Edition', 'Weekly Special', 'Monthly Magazine']
    },
    { 
      id: 'videos', 
      title: 'Video Content', 
      icon: Video, 
      href: '/admin/videos',
      count: 32,
      description: 'Manage video content and media',
      recentItems: ['News Bulletin', 'Interview Series', 'Documentary']
    },
    { 
      id: 'audio', 
      title: 'Audio Articles', 
      icon: Headphones, 
      href: '/admin/audio',
      count: 15,
      description: 'Audio versions of articles',
      recentItems: ['Podcast Episode 1', 'News Briefing', 'Interview Audio']
    },
    { 
      id: 'breaking', 
      title: 'Breaking News', 
      icon: Bell, 
      href: '/admin/breaking-news',
      badge: 'Live',
      description: 'Urgent news alerts and updates',
      recentItems: ['Market Crash Alert', 'Weather Warning', 'Political Update']
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Hub</h1>
          <p className="text-muted-foreground">
            Manage all your content, media, and publications in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Article
          </Button>
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            Breaking News
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {contentSections.map((section) => (
          <Card key={section.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{section.title}</p>
                  <div className="flex items-center gap-2">
                    {section.count && (
                      <p className="text-lg font-bold">{section.count}</p>
                    )}
                    {section.badge && (
                      <Badge variant="destructive" className="text-xs">{section.badge}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {contentSections.map((section) => (
          <Card key={section.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Recent Items</span>
                  {section.count && (
                    <Badge variant="secondary">{section.count} total</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {section.recentItems?.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                      <span className="text-sm truncate">{item}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href={section.href}>
                  <Button variant="outline" className="w-full">
                    Manage {section.title}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Audience Center Workspace
export function AudienceCenterWorkspace() {
  const { t } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audience Center</h1>
          <p className="text-muted-foreground">
            Monitor users, engagement, and analyze audience behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Export Users
          </Button>
          <Button className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Moderate Comments
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">1,234</p>
                    <p className="text-xs text-green-600">+12 today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">856</p>
                    <p className="text-xs text-green-600">+5% this week</p>
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
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-xs text-green-600">+2% vs last week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">User management interface will be loaded here</p>
                <Link href="/admin/users">
                  <Button className="mt-4">Go to User Management</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comment Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Comment moderation interface will be loaded here</p>
                <Link href="/admin/comments">
                  <Button className="mt-4">Go to Comment Management</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Analytics dashboard will be loaded here</p>
                <Link href="/admin/analytics">
                  <Button className="mt-4">Go to Analytics</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// System Control Workspace
export function SystemControlWorkspace() {
  const { t } = useLanguage();

  const systemSections = [
    { title: 'General Settings', icon: Settings, href: '/admin/settings', status: 'healthy' },
    { title: 'SEO Management', icon: Globe, href: '/admin/seo', status: 'healthy' },
    { title: 'Database', icon: Database, href: '/admin/database', status: 'healthy' },
    { title: 'Performance', icon: Activity, href: '/admin/performance', status: 'warning' },
    { title: 'Security', icon: Shield, href: '/admin/security', status: 'healthy' },
    { title: 'Mobile App', icon: Smartphone, href: '/admin/mobile-app', status: 'healthy' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Control</h1>
          <p className="text-muted-foreground">
            Manage system settings, security, and technical configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            System Healthy
          </Badge>
          <Button variant="outline" className="gap-2">
            <Database className="h-4 w-4" />
            Backup Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {systemSections.map((section) => (
          <Card key={section.href} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
                <Badge 
                  variant={section.status === 'healthy' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {section.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={section.href}>
                <Button variant="outline" className="w-full">
                  Manage {section.title}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Business Tools Workspace
export function BusinessToolsWorkspace() {
  const { t } = useLanguage();

  const businessSections = [
    { title: 'Advertisement Management', icon: DollarSign, href: '/admin/advertisements' },
    { title: 'Social Media', icon: Share2, href: '/admin/social-media' },
    { title: 'Email & Notifications', icon: Mail, href: '/admin/email-notifications' },
    { title: 'Weather Widget', icon: Cloud, href: '/admin/weather' },
    { title: 'Search Management', icon: Search, href: '/admin/search' },
    { title: 'Footer Pages', icon: FileText, href: '/admin/footer-pages' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Tools</h1>
          <p className="text-muted-foreground">
            Manage revenue, marketing, and business growth tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Revenue Report
          </Button>
          <Button className="gap-2">
            <DollarSign className="h-4 w-4" />
            Create Ad Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {businessSections.map((section) => (
          <Card key={section.href} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={section.href}>
                <Button variant="outline" className="w-full">
                  Manage {section.title}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}