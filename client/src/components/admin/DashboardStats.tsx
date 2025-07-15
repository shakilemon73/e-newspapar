import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Users, 
  Eye,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';

interface DashboardStatsProps {
  stats?: {
    totalArticles?: number;
    totalUsers?: number;
    totalViews?: number;
    todayViews?: number;
    publishedToday?: number;
    activeUsers?: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const defaultStats = {
    totalArticles: 0,
    totalUsers: 0,
    totalViews: 0,
    todayViews: 0,
    publishedToday: 0,
    activeUsers: 0,
    ...stats
  };

  const statCards = [
    {
      title: 'Total Articles',
      value: defaultStats.totalArticles,
      description: 'Published articles',
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Total Users',
      value: defaultStats.totalUsers,
      description: 'Registered users',
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Total Views',
      value: defaultStats.totalViews.toLocaleString(),
      description: 'All time views',
      icon: Eye,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      title: 'Today\'s Views',
      value: defaultStats.todayViews.toLocaleString(),
      description: 'Views today',
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
    {
      title: 'Published Today',
      value: defaultStats.publishedToday,
      description: 'Articles today',
      icon: Calendar,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900',
    },
    {
      title: 'Active Users',
      value: defaultStats.activeUsers,
      description: 'Online now',
      icon: Activity,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </CardTitle>
            <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
              {stat.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}