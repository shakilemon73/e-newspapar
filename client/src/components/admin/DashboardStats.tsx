import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Newspaper, Eye, TrendingUp, AlertCircle } from 'lucide-react';

interface StatsData {
  totalArticles: number;
  totalUsers: number;
  totalEpapers: number;
  activeBreakingNews: number;
  totalViews: number;
}

interface DashboardStatsProps {
  stats?: StatsData;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const defaultStats = {
    totalArticles: 0,
    totalUsers: 0,
    totalEpapers: 0,
    activeBreakingNews: 0,
    totalViews: 0,
  };

  const data = stats || defaultStats;

  const statCards = [
    {
      title: 'Total Articles',
      value: data.totalArticles,
      icon: FileText,
      change: '+12%',
      changeType: 'increase' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Total Users',
      value: data.totalUsers,
      icon: Users,
      change: '+8%',
      changeType: 'increase' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'E-Papers',
      value: data.totalEpapers,
      icon: Newspaper,
      change: '+2%',
      changeType: 'increase' as const,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Breaking News',
      value: data.activeBreakingNews,
      icon: AlertCircle,
      change: '0%',
      changeType: 'neutral' as const,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: 'Total Views',
      value: data.totalViews,
      icon: Eye,
      change: '+15%',
      changeType: 'increase' as const,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(stat.value)}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp 
                className={`h-3 w-3 mr-1 ${
                  stat.changeType === 'increase' 
                    ? 'text-green-500' 
                    : stat.changeType === 'decrease' 
                    ? 'text-red-500' 
                    : 'text-gray-500'
                }`} 
              />
              <span 
                className={`text-xs ${
                  stat.changeType === 'increase' 
                    ? 'text-green-500' 
                    : stat.changeType === 'decrease' 
                    ? 'text-red-500' 
                    : 'text-gray-500'
                }`}
              >
                {stat.change} from last month
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}