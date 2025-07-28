import React from 'react';
import { useSupabaseAuth } from '../hooks/use-supabase-auth';
import { PollsSection } from '../components/PollsSection';
import UserAnalyticsDashboard from '../components/UserAnalyticsDashboard';
import UserNotificationCenter from '../components/UserNotificationCenter';
import EnhancedTagsDisplay from '../components/EnhancedTagsDisplay';
import ReviewsSection from '../components/ReviewsSection';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  BarChart3, 
  Bell, 
  Hash, 
  Star,
  TrendingUp,
  Target
} from 'lucide-react';

const UserEngagement: React.FC = () => {
  const { user } = useSupabaseAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="text-center py-16">
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ব্যবহারকারী এনগেজমেন্ট
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                পোল, পরিসংখ্যান, এবং ব্যক্তিগত ড্যাশবোর্ড দেখতে লগইন করুন
              </p>
              <div className="flex justify-center gap-4">
                <a 
                  href="/login" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  লগইন
                </a>
                <a 
                  href="/register" 
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  নিবন্ধন
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            ব্যবহারকারী এনগেজমেন্ট ড্যাশবোর্ড
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            আপনার পড়ার পরিসংখ্যান, পোল, নোটিফিকেশন এবং আরও অনেক কিছু
          </p>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              পরিসংখ্যান
            </TabsTrigger>
            <TabsTrigger value="polls" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              পোল
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              নোটিফিকেশন
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              ট্যাগ
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              রিভিউ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            <UserAnalyticsDashboard userId={user.id} />
          </TabsContent>

          <TabsContent value="polls" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PollsSection />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      পোল পরিসংখ্যান
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <div className="text-sm text-gray-500">আপনার ভোট</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-sm text-gray-500">সক্রিয় পোল</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <EnhancedTagsDisplay mode="popular" limit={15} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserNotificationCenter showUnreadOnly={false} />
              <Card>
                <CardHeader>
                  <CardTitle>নোটিফিকেশন সেটিংস</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>নতুন নিবন্ধ</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>পোল আপডেট</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ব্রেকিং নিউজ</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>পড়ার অগ্রগতি</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tags" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedTagsDisplay mode="popular" showTitle={true} />
              <EnhancedTagsDisplay mode="all" showTitle={true} />
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>আপনার রিভিউ কার্যক্রম</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">
                    আপনি এখনো কোনো রিভিউ দেননি
                  </p>
                  <p className="text-sm text-gray-400">
                    নিবন্ধ, ভিডিও বা অডিও কন্টেন্ট রিভিউ করুন এবং অন্যদের সাহায্য করুন
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserEngagement;