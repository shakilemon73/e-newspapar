import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Smartphone, 
  Bell, 
  Settings, 
  Download, 
  BarChart3,
  Users,
  Activity,
  RefreshCw,
  Upload,
  Play,
  Pause,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMobileAppConfig, updateMobileAppConfig, sendPushNotification, getMobileAppAnalytics, getPushNotificationHistory } from '@/lib/admin-api-direct';

export default function MobileAppManagementPage() {
  const [activeTab, setActiveTab] = useState('config');
  const [pushNotificationForm, setPushNotificationForm] = useState({
    title: '',
    message: '',
    target: 'all'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mobile app configuration query
  const { data: appConfig, isLoading: configLoading } = useQuery({
    queryKey: ['admin-mobile-app-config'],
    queryFn: () => getMobileAppConfig(),
  });

  // Mobile app analytics query
  const { data: appAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-mobile-app-analytics'],
    queryFn: () => getMobileAppAnalytics(),
  });

  // Push notification history query
  const { data: notificationHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['admin-push-notifications'],
    queryFn: () => getPushNotificationHistory(),
  });

  // App update mutation
  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => updateMobileAppConfig(data),
    onSuccess: () => {
      toast({
        title: "কনফিগারেশন আপডেট হয়েছে",
        description: "মোবাইল অ্যাপ কনফিগারেশন সফলভাবে আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-mobile-app-config'] });
    },
  });

  // Send push notification mutation
  const sendPushMutation = useMutation({
    mutationFn: (data: any) => sendPushNotification(data),
    onSuccess: () => {
      toast({
        title: "পুশ নোটিফিকেশন পাঠানো হয়েছে",
        description: "সফলভাবে পুশ নোটিফিকেশন পাঠানো হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-push-notifications'] });
      setPushNotificationForm({ title: '', message: '', target: 'all' });
    },
  });

  // Force app update mutation
  const forceUpdateMutation = useMutation({
    mutationFn: () => updateMobileAppConfig({ force_update_enabled: true }),
    onSuccess: () => {
      toast({
        title: "আপডেট বাধ্যতামূলক করা হয়েছে",
        description: "ব্যবহারকারীরা অ্যাপ আপডেট করতে বাধ্য হবেন",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-mobile-app-config'] });
    },
  });

  const handlePushNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPushMutation.mutate(pushNotificationForm);
  };

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">মোবাইল অ্যাপ ব্যবস্থাপনা</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              মোবাইল অ্যাপ কনফিগারেশন, পুশ নোটিফিকেশন এবং অ্যানালিটিক্স
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => forceUpdateMutation.mutate()}
              disabled={forceUpdateMutation.isPending}
              variant="outline"
            >
              {forceUpdateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              আপডেট জোরপূর্বক
            </Button>
          </div>
        </div>

        {/* Mobile App Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সক্রিয় ব্যবহারকারী</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appAnalytics?.active_users || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{appAnalytics?.new_users_today || 0} আজ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অ্যাপ ভার্সন</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appConfig?.current_version || 'v1.0.0'}</div>
              <p className="text-xs text-muted-foreground">
                {appConfig?.users_on_latest || 0}% সর্বশেষ ভার্সনে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ডাউনলোড</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appAnalytics?.total_downloads || 0}</div>
              <p className="text-xs text-muted-foreground">
                {appAnalytics?.downloads_this_month || 0} এই মাসে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">পুশ নোটিফিকেশন</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationHistory?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                এই মাসে পাঠানো
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile App Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">কনফিগারেশন</TabsTrigger>
            <TabsTrigger value="notifications">নোটিফিকেশন</TabsTrigger>
            <TabsTrigger value="analytics">অ্যানালিটিক্স</TabsTrigger>
            <TabsTrigger value="updates">আপডেট</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>অ্যাপ কনফিগারেশন</CardTitle>
                <CardDescription>
                  মোবাইল অ্যাপের মূল সেটিংস এবং কনফিগারেশন
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="app-name">অ্যাপ নাম</Label>
                      <Input
                        id="app-name"
                        value={appConfig?.app_name || ''}
                        onChange={(e) => updateConfigMutation.mutate({
                          ...appConfig,
                          app_name: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="app-version">বর্তমান ভার্সন</Label>
                      <Input
                        id="app-version"
                        value={appConfig?.current_version || 'v1.0.0'}
                        onChange={(e) => updateConfigMutation.mutate({
                          ...appConfig,
                          current_version: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-enabled">পুশ নোটিফিকেশন সক্রিয়</Label>
                        <p className="text-sm text-gray-600">ব্রেকিং নিউজের জন্য পুশ নোটিফিকেশন</p>
                      </div>
                      <Switch
                        id="push-enabled"
                        checked={appConfig?.push_notifications_enabled}
                        onCheckedChange={(checked) => 
                          updateConfigMutation.mutate({
                            ...appConfig,
                            push_notifications_enabled: checked
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="offline-mode">অফলাইন মোড</Label>
                        <p className="text-sm text-gray-600">ক্যাশ করা কন্টেন্ট অফলাইনে দেখা</p>
                      </div>
                      <Switch
                        id="offline-mode"
                        checked={appConfig?.offline_mode_enabled}
                        onCheckedChange={(checked) => 
                          updateConfigMutation.mutate({
                            ...appConfig,
                            offline_mode_enabled: checked
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dark-mode">ডার্ক মোড</Label>
                        <p className="text-sm text-gray-600">ডার্ক মোড থিম সাপোর্ট</p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={appConfig?.dark_mode_enabled}
                        onCheckedChange={(checked) => 
                          updateConfigMutation.mutate({
                            ...appConfig,
                            dark_mode_enabled: checked
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Send Push Notification */}
              <Card>
                <CardHeader>
                  <CardTitle>পুশ নোটিফিকেশন পাঠান</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePushNotificationSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="notification-title">নোটিফিকেশন শিরোনাম</Label>
                      <Input
                        id="notification-title"
                        value={pushNotificationForm.title}
                        onChange={(e) => setPushNotificationForm({
                          ...pushNotificationForm,
                          title: e.target.value
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="notification-message">বার্তা</Label>
                      <Input
                        id="notification-message"
                        value={pushNotificationForm.message}
                        onChange={(e) => setPushNotificationForm({
                          ...pushNotificationForm,
                          message: e.target.value
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="notification-target">টার্গেট</Label>
                      <select 
                        id="notification-target"
                        value={pushNotificationForm.target}
                        onChange={(e) => setPushNotificationForm({
                          ...pushNotificationForm,
                          target: e.target.value
                        })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="all">সকল ব্যবহারকারী</option>
                        <option value="active">সক্রিয় ব্যবহারকারী</option>
                        <option value="subscribers">সাবস্ক্রাইবার</option>
                      </select>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={sendPushMutation.isPending}
                      className="w-full"
                    >
                      {sendPushMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Bell className="h-4 w-4 mr-2" />
                      )}
                      নোটিফিকেশন পাঠান
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Notification History */}
              <Card>
                <CardHeader>
                  <CardTitle>নোটিফিকেশন ইতিহাস</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notificationHistory?.slice(0, 5).map((notification: any) => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Bell className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{notification.target}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.sent_at).toLocaleString('bn-BD')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ব্যবহারকারী অ্যানালিটিক্স</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">দৈনিক সক্রিয় ব্যবহারকারী</span>
                      <span className="text-sm font-bold">{appAnalytics?.daily_active_users || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">সাপ্তাহিক সক্রিয় ব্যবহারকারী</span>
                      <span className="text-sm font-bold">{appAnalytics?.weekly_active_users || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">মাসিক সক্রিয় ব্যবহারকারী</span>
                      <span className="text-sm font-bold">{appAnalytics?.monthly_active_users || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">রিটেনশন রেট</span>
                      <span className="text-sm font-bold">{appAnalytics?.retention_rate || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>অ্যাপ পারফরম্যান্স</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">অ্যাপ লঞ্চ টাইম</span>
                      <span className="text-sm font-bold">{appAnalytics?.avg_launch_time || 0}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ক্র্যাশ রেট</span>
                      <span className="text-sm font-bold">{appAnalytics?.crash_rate || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">গড় সেশন দৈর্ঘ্য</span>
                      <span className="text-sm font-bold">{appAnalytics?.avg_session_duration || 0}m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="updates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>অ্যাপ আপডেট ব্যবস্থাপনা</CardTitle>
                <CardDescription>
                  অ্যাপ আপডেট এবং ভার্সন নিয়ন্ত্রণ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-version">সর্বনিম্ন ভার্সন</Label>
                      <Input
                        id="min-version"
                        value={appConfig?.minimum_version || 'v1.0.0'}
                        onChange={(e) => updateConfigMutation.mutate({
                          ...appConfig,
                          minimum_version: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="latest-version">সর্বশেষ ভার্সন</Label>
                      <Input
                        id="latest-version"
                        value={appConfig?.latest_version || 'v1.0.0'}
                        onChange={(e) => updateConfigMutation.mutate({
                          ...appConfig,
                          latest_version: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="force-update">আপডেট বাধ্যতামূলক</Label>
                      <p className="text-sm text-gray-600">ব্যবহারকারীদের আপডেট করতে বাধ্য করুন</p>
                    </div>
                    <Switch
                      id="force-update"
                      checked={appConfig?.force_update_enabled}
                      onCheckedChange={(checked) => 
                        updateConfigMutation.mutate({
                          ...appConfig,
                          force_update_enabled: checked
                        })
                      }
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">ভার্সন পরিসংখ্যান</h4>
                    <div className="space-y-2">
                      {appAnalytics?.version_stats?.map((version: any) => (
                        <div key={version.version} className="flex justify-between items-center">
                          <span className="text-sm">{version.version}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{version.percentage}%</span>
                            <Badge variant="outline">{version.count} ব্যবহারকারী</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAdminLayout>
  );
}