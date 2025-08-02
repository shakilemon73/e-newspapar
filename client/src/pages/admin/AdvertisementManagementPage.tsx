import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  DollarSign, 
  Eye, 
  MousePointer, 
  TrendingUp,
  BarChart3,
  Users,
  Calendar,
  Settings,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Upload,
  Play,
  Pause
} from 'lucide-react';
import { getAdminAdvertisements, createAdvertisement, updateAdvertisement, deleteAdvertisement } from '@/lib/admin';
import { useToast } from '@/hooks/use-toast';

export default function AdvertisementManagementPage() {
  const [activeTab, setActiveTab] = useState('ads');
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    image_url: '',
    target_url: '',
    position: 'banner',
    status: 'active'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Advertisements query using direct Supabase API
  const { data: advertisementsData, isLoading: adsLoading } = useQuery({
    queryKey: ['admin-advertisements'],
    queryFn: () => getAdminAdvertisements(),
  });

  // Extract advertisements array from the response
  const advertisements = advertisementsData?.advertisements || [];

  // Advertisement analytics - simplified for direct API
  const adAnalytics = { 
    impressions: 0, 
    clicks: 0, 
    revenue: 0,
    total_impressions: 0,
    impressions_today: 0,
    click_rate: 0,
    total_clicks: 0,
    clicks_today: 0,
    ctr_today: 0,
    revenue_today: 0
  };
  const advertisers: any[] = [];

  // Revenue data query
  const { data: revenueData = {
    total_revenue: 0,
    revenue_this_month: 0,
    revenue_last_month: 0,
    growth_rate: 0,
    revenue_sources: []
  }, isLoading: revenueLoading } = useQuery({
    queryKey: ['admin-ad-revenue'],
  });

  // Create/Update advertisement mutation
  const adMutation = useMutation({
    mutationFn: (data: any) => {
      if (selectedAd) {
        return updateAdvertisement(selectedAd.id, data);
      }
      return createAdvertisement(data);
    },
    onSuccess: () => {
      toast({
        title: "বিজ্ঞাপন সংরক্ষিত",
        description: "বিজ্ঞাপন সফলভাবে সংরক্ষিত হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
      setSelectedAd(null);
      setAdForm({
        title: '',
        description: '',
        image_url: '',
        target_url: '',
        position: 'banner',
        status: 'active'
      });
    },
  });

  // Delete advertisement mutation
  const deleteAdMutation = useMutation({
    mutationFn: (id: number) => deleteAdvertisement(id),
    onSuccess: () => {
      toast({
        title: "বিজ্ঞাপন মুছে ফেলা হয়েছে",
        description: "বিজ্ঞাপন সফলভাবে মুছে ফেলা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
    },
  });

  // Toggle advertisement status mutation
  const toggleAdStatusMutation = useMutation({
    mutationFn: (ad: any) => updateAdvertisement(ad.id, {
      ...ad,
      status: ad.status === 'active' ? 'inactive' : 'active'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
    },
  });

  const handleAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adMutation.mutate(adForm);
  };

  const handleEditAd = (ad: any) => {
    setSelectedAd(ad);
    setAdForm({
      title: ad.title,
      description: ad.description,
      image_url: ad.image_url,
      target_url: ad.target_url,
      position: ad.position,
      status: ad.status
    });
  };

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">বিজ্ঞাপন ব্যবস্থাপনা</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              বিজ্ঞাপন প্লেসমেন্ট, পারফরম্যান্স ট্র্যাকিং এবং রেভিনিউ অ্যানালিটিক্স
            </p>
          </div>
        </div>

        {/* Advertisement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট রেভিনিউ</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{(revenueData as any)?.total_revenue || 0}</div>
              <p className="text-xs text-muted-foreground">
                +৳{(revenueData as any)?.revenue_this_month || 0} এই মাসে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">বিজ্ঞাপন দেখা</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adAnalytics?.total_impressions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {adAnalytics?.impressions_today || 0} আজ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ক্লিক রেট</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adAnalytics?.click_rate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {adAnalytics?.total_clicks || 0} মোট ক্লিক
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সক্রিয় বিজ্ঞাপন</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{advertisements?.filter((ad: any) => ad.status === 'active').length || 0}</div>
              <p className="text-xs text-muted-foreground">
                মোট {advertisements?.length || 0} টি বিজ্ঞাপন
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Advertisement Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ads">বিজ্ঞাপন</TabsTrigger>
            <TabsTrigger value="analytics">অ্যানালিটিক্স</TabsTrigger>
            <TabsTrigger value="advertisers">বিজ্ঞাপনদাতা</TabsTrigger>
            <TabsTrigger value="revenue">রেভিনিউ</TabsTrigger>
          </TabsList>

          <TabsContent value="ads" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Advertisement Form */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedAd ? 'বিজ্ঞাপন সম্পাদনা' : 'নতুন বিজ্ঞাপন'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">বিজ্ঞাপনের শিরোনাম</Label>
                      <Input
                        id="title"
                        value={adForm.title}
                        onChange={(e) => setAdForm({...adForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">বিবরণ</Label>
                      <Textarea
                        id="description"
                        value={adForm.description}
                        onChange={(e) => setAdForm({...adForm, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_url">ইমেজ URL</Label>
                      <Input
                        id="image_url"
                        value={adForm.image_url}
                        onChange={(e) => setAdForm({...adForm, image_url: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target_url">টার্গেট URL</Label>
                      <Input
                        id="target_url"
                        value={adForm.target_url}
                        onChange={(e) => setAdForm({...adForm, target_url: e.target.value})}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">অবস্থান</Label>
                      <select 
                        id="position"
                        value={adForm.position}
                        onChange={(e) => setAdForm({...adForm, position: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="banner">ব্যানার</option>
                        <option value="sidebar">সাইডবার</option>
                        <option value="inline">ইনলাইন</option>
                        <option value="popup">পপআপ</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={adMutation.isPending}
                        className="flex-1"
                      >
                        {adMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {selectedAd ? 'আপডেট করুন' : 'তৈরি করুন'}
                      </Button>
                      {selectedAd && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setSelectedAd(null);
                            setAdForm({
                              title: '',
                              description: '',
                              image_url: '',
                              target_url: '',
                              position: 'banner',
                              status: 'active'
                            });
                          }}
                        >
                          বাতিল
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Advertisement List */}
              <Card>
                <CardHeader>
                  <CardTitle>বিজ্ঞাপনের তালিকা</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {advertisements?.map((ad: any) => (
                      <div key={ad.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{ad.title}</h4>
                            <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                              {ad.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{ad.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{ad.position}</span>
                            <span>•</span>
                            <span>{ad.impressions || 0} ইম্প্রেশন</span>
                            <span>•</span>
                            <span>{ad.clicks || 0} ক্লিক</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAdStatusMutation.mutate(ad)}
                          >
                            {ad.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAd(ad)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteAdMutation.mutate(ad.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                  <CardTitle>বিজ্ঞাপন পারফরম্যান্স</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {advertisements?.map((ad: any) => (
                      <div key={ad.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{ad.title}</h4>
                          <p className="text-sm text-gray-600">{ad.position}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{ad.click_rate || 0}% CTR</div>
                          <div className="text-xs text-gray-500">
                            {ad.impressions || 0} দেখা • {ad.clicks || 0} ক্লিক
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>দৈনিক পারফরম্যান্স</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">আজকের ইম্প্রেশন</span>
                      <span className="text-sm font-bold">{adAnalytics?.impressions_today || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">আজকের ক্লিক</span>
                      <span className="text-sm font-bold">{adAnalytics?.clicks_today || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">আজকের CTR</span>
                      <span className="text-sm font-bold">{adAnalytics?.ctr_today || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">আজকের রেভিনিউ</span>
                      <span className="text-sm font-bold">৳{adAnalytics?.revenue_today || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advertisers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>বিজ্ঞাপনদাতা</CardTitle>
                <CardDescription>
                  নিবন্ধিত বিজ্ঞাপনদাতা এবং তাদের অ্যাকাউন্ট তথ্য
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {advertisers?.map((advertiser: any) => (
                    <div key={advertiser.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{advertiser.company_name}</h4>
                        <p className="text-sm text-gray-600">{advertiser.email}</p>
                        <p className="text-sm text-gray-600">{advertiser.phone}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">৳{advertiser.total_spent || 0}</div>
                        <div className="text-xs text-gray-500">
                          {advertiser.active_campaigns || 0} সক্রিয় ক্যাম্পেইন
                        </div>
                        <Badge variant={advertiser.status === 'active' ? 'default' : 'secondary'}>
                          {advertiser.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>মাসিক রেভিনিউ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">এই মাসের রেভিনিউ</span>
                      <span className="text-sm font-bold">৳{(revenueData as any)?.revenue_this_month || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">গত মাসের রেভিনিউ</span>
                      <span className="text-sm font-bold">৳{(revenueData as any)?.revenue_last_month || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">বৃদ্ধির হার</span>
                      <span className="text-sm font-bold flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        {(revenueData as any)?.growth_rate || 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>রেভিনিউ সোর্স</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(revenueData as any)?.revenue_sources?.map((source: any) => (
                      <div key={source.type} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{source.type}</span>
                        <div className="text-right">
                          <div className="text-sm font-bold">৳{source.amount}</div>
                          <div className="text-xs text-gray-500">{source.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAdminLayout>
  );
}