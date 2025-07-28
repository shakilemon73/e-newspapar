import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trophy, 
  Clock, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award,
  Star,
  Calendar
} from 'lucide-react';
import { getUserAnalytics, getUserAchievements, type UserAnalytics, type UserAchievement } from '@/lib/supabase-api-direct';

interface UserAnalyticsDashboardProps {
  userId: string;
  className?: string;
}

export default function UserAnalyticsDashboard({ userId, className = '' }: UserAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [analyticsData, achievementsData] = await Promise.all([
          getUserAnalytics(userId),
          getUserAchievements(userId)
        ]);
        
        setAnalytics(analyticsData);
        setAchievements(achievementsData);
      } catch (err) {
        console.error('Error fetching user analytics:', err);
        setError('ব্যবহারকারীর তথ্য লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours} ঘন্টা ${remainingMinutes} মিনিট`;
    }
    return `${remainingMinutes} মিনিট`;
  };

  const getEngagementLevel = (score: number): { label: string; color: string } => {
    if (score >= 80) return { label: 'অত্যন্ত সক্রিয়', color: 'bg-green-500' };
    if (score >= 60) return { label: 'সক্রিয়', color: 'bg-blue-500' };
    if (score >= 40) return { label: 'মধ্যম', color: 'bg-yellow-500' };
    if (score >= 20) return { label: 'কম সক্রিয়', color: 'bg-orange-500' };
    return { label: 'নিষ্ক্রিয়', color: 'bg-red-500' };
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const engagementLevel = analytics ? getEngagementLevel(analytics.engagement_score) : { label: 'নিষ্ক্রিয়', color: 'bg-gray-500' };

  return (
    <div className={className}>
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">পঠিত নিবন্ধ</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_articles_read || 0}</div>
            <p className="text-xs text-muted-foreground">মোট পড়া নিবন্ধ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">পড়ার সময়</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics ? formatDuration(analytics.total_time_spent) : '০ মিনিট'}
            </div>
            <p className="text-xs text-muted-foreground">মোট সময়</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">পড়ার ধারাবাহিকতা</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.reading_streak || 0}</div>
            <p className="text-xs text-muted-foreground">দিন ধরে নিয়মিত</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয়তার স্কোর</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.engagement_score || 0}%</div>
            <Badge variant="outline" className={`text-xs ${engagementLevel.color} text-white`}>
              {engagementLevel.label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>অর্জনসমূহ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.slice(0, 5).map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                      <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{achievement.achievement_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {achievement.achievement_description}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(achievement.earned_at)}
                      </p>
                    </div>
                    {achievement.is_visible && (
                      <Star className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                ))}
                
                {achievements.length > 5 && (
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                    আরও {achievements.length - 5} টি অর্জন...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">এখনো কোনো অর্জন নেই</p>
                <p className="text-sm text-gray-400">আরও পড়ুন এবং অর্জন আনলক করুন!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reading Progress & Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>পড়ার পরিসংখ্যান</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.engagement_score !== undefined && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>সক্রিয়তার স্কোর</span>
                    <span>{analytics.engagement_score}%</span>
                  </div>
                  <Progress value={analytics.engagement_score} className="h-2" />
                </div>
              )}

              {analytics?.favorite_categories && analytics.favorite_categories.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">প্রিয় বিভাগসমূহ</p>
                  <div className="flex flex-wrap gap-1">
                    {analytics.favorite_categories.slice(0, 3).map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    সর্বশেষ সক্রিয়: {analytics?.last_active ? formatDate(analytics.last_active) : 'অজানা'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Compact version for sidebar
export function UserAnalyticsWidget({ userId }: { userId: string }) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>আপনার পরিসংখ্যান</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UserAnalyticsDashboard 
          userId={userId}
          className="space-y-4"
        />
      </CardContent>
    </Card>
  );
}

// Named export for compatibility
// export { default as UserAnalyticsDashboard };