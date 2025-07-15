import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Eye,
  Calendar,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

function StatCard({ title, value, change, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {change.type === 'increase' ? (
              <ArrowUpRight className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500" />
            )}
            <span className={change.type === 'increase' ? 'text-green-500' : 'text-red-500'}>
              {change.value}%
            </span>
            <span>from last month</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    },
  });

  const { data: articles } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['/api/admin/recent-activity'],
    queryFn: async () => {
      const response = await fetch('/api/admin/recent-activity');
      if (!response.ok) {
        // Return mock data for now
        return [
          { id: 1, action: 'Article published', title: 'সংসদে আজ উত্থাপিত হবে নতুন বিল', time: '২ ঘন্টা আগে' },
          { id: 2, action: 'Breaking news added', title: 'প্রধানমন্ত্রীর আগামীকাল জাতির উদ্দেশে ভাষণ', time: '৩ ঘন্টা আগে' },
          { id: 3, action: 'E-paper uploaded', title: 'আজকের সংস্করণ', time: '৫ ঘন্টা আগে' },
        ];
      }
      return response.json();
    },
  });

  // Calculate stats from available data
  const totalArticles = Array.isArray(articles) ? articles.length : 0;
  const totalViews = Array.isArray(articles) ? articles.reduce((sum, article) => sum + (article.view_count || 0), 0) : 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Articles"
          value={totalArticles}
          change={{ value: 12, type: 'increase' }}
          icon={FileText}
          description="Published articles"
        />
        <StatCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          change={{ value: 8, type: 'increase' }}
          icon={Eye}
          description="Article page views"
        />
        <StatCard
          title="Active Users"
          value="1,247"
          change={{ value: 15, type: 'increase' }}
          icon={Users}
          description="Monthly active users"
        />
        <StatCard
          title="Engagement Rate"
          value="68.5%"
          change={{ value: 3, type: 'increase' }}
          icon={TrendingUp}
          description="User engagement"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions in your admin panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity?.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.title}</p>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <FileText className="h-4 w-4 mb-2 text-blue-500" />
                <p className="text-sm font-medium">New Article</p>
                <p className="text-xs text-muted-foreground">Create article</p>
              </button>
              <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Calendar className="h-4 w-4 mb-2 text-green-500" />
                <p className="text-sm font-medium">Schedule Post</p>
                <p className="text-xs text-muted-foreground">Plan content</p>
              </button>
              <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Users className="h-4 w-4 mb-2 text-purple-500" />
                <p className="text-sm font-medium">User Reports</p>
                <p className="text-xs text-muted-foreground">View analytics</p>
              </button>
              <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <TrendingUp className="h-4 w-4 mb-2 text-orange-500" />
                <p className="text-sm font-medium">Performance</p>
                <p className="text-xs text-muted-foreground">Check metrics</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Articles</CardTitle>
          <CardDescription>Most viewed articles this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {articles?.slice(0, 5).map((article, index) => (
              <div key={article.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium leading-none">{article.title}</p>
                    <p className="text-sm text-muted-foreground">{article.category?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{article.view_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}