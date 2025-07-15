import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Eye, 
  Clock, 
  Heart, 
  Share2, 
  BookOpen, 
  TrendingUp, 
  Activity, 
  Search, 
  Settings 
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';

interface UserAnalytics {
  totalInteractions: number;
  interactionsByType: Record<string, number>;
  topCategories: Array<{
    category_id: number;
    interest_score: number;
    categories: { name: string };
  }>;
  recentReading: Array<{
    article_id: number;
    read_count: number;
    last_read_at: string;
    articles: {
      title: string;
      categories: { name: string };
    };
  }>;
}

interface UserInteraction {
  id: number;
  article_id: number;
  interaction_type: string;
  interaction_duration: number;
  created_at: string;
  articles: {
    title: string;
    slug: string;
    image_url: string;
    categories: { name: string };
  };
}

interface UserPreference {
  category_id: number;
  interest_score: number;
  categories: {
    name: string;
    slug: string;
  };
}

interface NotificationPreferences {
  breaking_news: boolean;
  category_updates: boolean;
  personalized_recommendations: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export const UserAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsRes, interactionsRes, preferencesRes, notificationsRes] = await Promise.all([
        fetch('/api/user/analytics'),
        fetch('/api/user/interactions?limit=20'),
        fetch('/api/user/preferences'),
        fetch('/api/user/notifications')
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      if (interactionsRes.ok) {
        const interactionsData = await interactionsRes.json();
        setInteractions(interactionsData);
      }

      if (preferencesRes.ok) {
        const preferencesData = await preferencesRes.json();
        setPreferences(preferencesData);
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData);
      }
    } catch (err) {
      setError('ব্যবহারকারী ডেটা লোড করতে সমস্যা হয়েছে');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationPreferences = async (updatedPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPreferences)
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error updating notification preferences:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'like': return <Heart className="w-4 h-4" />;
      case 'share': return <Share2 className="w-4 h-4" />;
      case 'comment': return <BookOpen className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'like': return 'bg-red-100 text-red-800';
      case 'share': return 'bg-green-100 text-green-800';
      case 'comment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInteractionName = (type: string) => {
    switch (type) {
      case 'view': return 'দেখেছেন';
      case 'like': return 'পছন্দ করেছেন';
      case 'share': return 'শেয়ার করেছেন';
      case 'comment': return 'মন্তব্য করেছেন';
      default: return 'ইন্টারঅ্যাক্ট করেছেন';
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          ব্যবহারকারী এনালিটিক্স দেখতে অনুগ্রহ করে লগইন করুন।
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <User className="w-6 h-6 text-blue-600" />
            <span>ব্যবহারকারী এনালিটিক্স</span>
          </h2>
          <p className="text-gray-600 mt-1">
            আপনার পড়ার অভ্যাস এবং পছন্দের পরিসংখ্যান
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">মোট ইন্টারঅ্যাকশন</p>
                <p className="text-2xl font-bold">{analytics?.totalInteractions || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">প্রিয় বিষয়</p>
                <p className="text-2xl font-bold">{preferences.length}</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">সাম্প্রতিক পড়া</p>
                <p className="text-2xl font-bold">{analytics?.recentReading?.length || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">সর্বোচ্চ</p>
                <p className="text-2xl font-bold">
                  {Math.max(...Object.values(analytics?.interactionsByType || {}))}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="interactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="interactions">ইন্টারঅ্যাকশন</TabsTrigger>
          <TabsTrigger value="preferences">পছন্দ</TabsTrigger>
          <TabsTrigger value="reading">পড়ার ইতিহাস</TabsTrigger>
          <TabsTrigger value="settings">সেটিংস</TabsTrigger>
        </TabsList>

        <TabsContent value="interactions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interaction Types Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>ইন্টারঅ্যাকশন প্রকার</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics?.interactionsByType || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${getInteractionColor(type)}`}>
                          {getInteractionIcon(type)}
                        </div>
                        <span className="text-sm">{getInteractionName(type)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{count}</span>
                        <div className="w-16">
                          <Progress 
                            value={(count / (analytics?.totalInteractions || 1)) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Interactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>সাম্প্রতিক কার্যকলাপ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {interactions.slice(0, 10).map((interaction) => (
                    <div key={interaction.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                      <div className={`p-1 rounded ${getInteractionColor(interaction.interaction_type)}`}>
                        {getInteractionIcon(interaction.interaction_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {interaction.articles.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(interaction.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>বিষয়ভিত্তিক আগ্রহ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preferences.map((pref) => (
                  <div key={pref.category_id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{pref.categories.name}</Badge>
                      <span className="text-sm text-gray-600">
                        আগ্রহের মাত্রা: {Math.round(pref.interest_score * 100)}%
                      </span>
                    </div>
                    <div className="w-32">
                      <Progress 
                        value={Math.min(pref.interest_score * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>পড়ার ইতিহাস</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.recentReading?.map((reading) => (
                  <div key={reading.article_id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{reading.articles.title}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {reading.articles.categories.name}
                        </Badge>
                        <span>পড়েছেন {reading.read_count} বার</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatDate(reading.last_read_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>নোটিফিকেশন সেটিংস</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications && (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">ব্রেকিং নিউজ</p>
                        <p className="text-sm text-gray-600">জরুরি খবরের জন্য তাৎক্ষণিক বিজ্ঞপ্তি</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.breaking_news}
                        onChange={(e) => updateNotificationPreferences({ breaking_news: e.target.checked })}
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">বিষয়ভিত্তিক আপডেট</p>
                        <p className="text-sm text-gray-600">আপনার পছন্দের বিষয়ে নতুন খবর</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.category_updates}
                        onChange={(e) => updateNotificationPreferences({ category_updates: e.target.checked })}
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">ব্যক্তিগত সুপারিশ</p>
                        <p className="text-sm text-gray-600">আপনার জন্য বিশেষ নিউজ সুপারিশ</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.personalized_recommendations}
                        onChange={(e) => updateNotificationPreferences({ personalized_recommendations: e.target.checked })}
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">ইমেইল বিজ্ঞপ্তি</p>
                        <p className="text-sm text-gray-600">ইমেইলে নিয়মিত আপডেট পান</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.email_notifications}
                        onChange={(e) => updateNotificationPreferences({ email_notifications: e.target.checked })}
                        className="w-4 h-4"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAnalyticsDashboard;