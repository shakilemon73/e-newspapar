import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { 
  getUserAnalytics, 
  getUserAchievements,
  checkAndAwardAchievements,
  type UserAnalytics 
} from '../lib/missing-tables-api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Flame, 
  Award,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';

interface UserAnalyticsDashboardProps {
  userId?: string;
  compact?: boolean;
}

const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({ 
  userId, 
  compact = false 
}) => {
  // Get current user if userId not provided
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return user;
    },
    enabled: !userId
  });

  const targetUserId = userId || currentUser?.id;

  // Fetch user analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['user-analytics', targetUserId],
    queryFn: () => {
      if (!targetUserId) return null;
      return getUserAnalytics(targetUserId);
    },
    enabled: !!targetUserId,
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch user achievements  
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['user-achievements', targetUserId],
    queryFn: () => {
      if (!targetUserId) return [];
      return getUserAchievements(targetUserId);
    },
    enabled: !!targetUserId,
  });

  // Check for new achievements periodically
  useQuery({
    queryKey: ['check-achievements', targetUserId],
    queryFn: () => {
      if (!targetUserId) return [];
      return checkAndAwardAchievements(targetUserId);
    },
    enabled: !!targetUserId,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    refetchOnWindowFocus: false,
  });

  if (!targetUserId) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">পরিসংখ্যান দেখতে লগইন করুন</p>
        </CardContent>
      </Card>
    );
  }

  if (analyticsLoading || achievementsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">কোনো পরিসংখ্যান পাওয়া যায়নি</p>
          <p className="text-sm text-gray-400 mt-2">
            কিছু নিবন্ধ পড়ুন এবং আবার দেখুন
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} মিনিট`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} ঘন্টা ${remainingMinutes} মিনিট`
      : `${hours} ঘন্টা`;
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'আজ পড়া শুরু করুন!';
    if (streak === 1) return 'চমৎকার শুরু!';
    if (streak < 7) return 'ভালো যাচ্ছে!';
    if (streak < 30) return 'দুর্দান্ত অভ্যাস!';
    return 'অসাধারণ নিয়মিততা!';
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="mx-auto h-6 w-6 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{analytics.total_articles_read}</div>
            <div className="text-sm text-gray-500">মোট পঠিত</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="mx-auto h-6 w-6 text-orange-500 mb-2" />
            <div className="text-2xl font-bold">{analytics.reading_streak}</div>
            <div className="text-sm text-gray-500">দিন ধারাবাহিক</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">আজ পঠিত</p>
                <p className="text-2xl font-bold">{analytics.articles_read_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">আজ পড়ার সময়</p>
                <p className="text-2xl font-bold">
                  {formatReadingTime(analytics.reading_time_today)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Flame className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ধারাবাহিক দিন</p>
                <p className="text-2xl font-bold">{analytics.reading_streak}</p>
                <p className="text-xs text-gray-400">{getStreakMessage(analytics.reading_streak)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">অর্জন</p>
                <p className="text-2xl font-bold">{achievements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              সামগ্রিক পরিসংখ্যান
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>মোট নিবন্ধ পঠিত</span>
                <span className="font-medium">{analytics.total_articles_read}</span>
              </div>
              <Progress value={Math.min((analytics.total_articles_read / 100) * 100, 100)} />
              <p className="text-xs text-gray-500 mt-1">
                {analytics.total_articles_read < 100 
                  ? `১০০টি নিবন্ধের লক্ষ্যে ${100 - analytics.total_articles_read}টি বাকি`
                  : 'লক্ষ্য অর্জিত! 🎉'
                }
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>মোট পড়ার সময়</span>
                <span className="font-medium">{formatReadingTime(analytics.total_reading_time)}</span>
              </div>
              <Progress value={Math.min((analytics.total_reading_time / 1000) * 100, 100)} />
              <p className="text-xs text-gray-500 mt-1">
                {analytics.total_reading_time < 1000
                  ? `১০০০ মিনিটের লক্ষ্যে ${1000 - analytics.total_reading_time} মিনিট বাকি`
                  : 'দুর্দান্ত পাঠক! 📚'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              সাম্প্রতিক অর্জন
              {achievements.length > 0 && (
                <Badge className="text-xs">{achievements.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <div className="text-center py-8">
                <Award className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">এখনো কোনো অর্জন নেই</p>
                <p className="text-sm text-gray-400 mt-1">
                  নিয়মিত পড়াশোনা করুন এবং অর্জন আনলক করুন!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                    <div className="text-2xl">{achievement.achievement?.icon || '🏆'}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{achievement.achievement?.name}</h4>
                      <p className="text-xs text-gray-500">{achievement.achievement?.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        অর্জিত: {new Date(achievement.earned_at).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>
                ))}
                
                {achievements.length > 3 && (
                  <p className="text-sm text-center text-gray-500">
                    +{achievements.length - 3} আরো অর্জন
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reading Activity Calendar - Placeholder for future implementation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            পড়ার ক্যালেন্ডার
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>পড়ার ক্যালেন্ডার শীঘ্রই আসছে...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalyticsDashboard;