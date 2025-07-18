import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Globe, 
  Eye, 
  Share2,
  FileText,
  Link,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { DateFormatter } from '@/components/DateFormatter';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function SEOManagementPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [seoSettings, setSeoSettings] = useState({
    siteName: 'প্রথম আলো',
    siteDescription: 'বাংলাদেশের শীর্ষ সংবাদ পত্রিকা',
    siteKeywords: 'বাংলাদেশ, সংবাদ, খবর, প্রথম আলো',
    ogImageUrl: '/og-default-image.svg',
    twitterHandle: '@prothomaloBD',
    facebookAppId: '',
    googleSiteVerification: '',
    bingWebmasterTools: '',
    enableSitemap: true,
    enableRobots: true,
    enableAnalytics: true,
    canonicalUrl: 'https://prothomalo.com'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [authLoading, user, setLocation]);

  // SEO data queries
  const { data: seoData, isLoading: seoLoading } = useQuery({
    queryKey: ['/api/admin/seo-settings'],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: metaTagsData, isLoading: metaLoading } = useQuery({
    queryKey: ['/api/admin/meta-tags'],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: seoAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/seo-analytics'],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // SEO settings mutation
  const updateSeoSettingsMutation = useMutation({
    mutationFn: async (settings: typeof seoSettings) => {
      return await apiRequest('/api/admin/seo-settings', {
        method: 'PUT',
        body: settings
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
      toast({
        title: "SEO সেটিংস সংরক্ষিত",
        description: "আপনার SEO সেটিংস সফলভাবে সংরক্ষিত হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "সংরক্ষণ ব্যর্থ",
        description: "SEO সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  });

  // Generate sitemap mutation
  const generateSitemapMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/generate-sitemap', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "সাইটম্যাপ তৈরি হয়েছে",
        description: "সাইটম্যাপ সফলভাবে তৈরি এবং আপডেট করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "সাইটম্যাপ তৈরি ব্যর্থ",
        description: "সাইটম্যাপ তৈরি করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  });

  // Update individual meta tags
  const updateMetaTagMutation = useMutation({
    mutationFn: async (data: { page: string; metaData: any }) => {
      return await apiRequest(`/api/admin/meta-tags/${data.page}`, {
        method: 'PUT',
        body: data.metaData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/meta-tags'] });
      toast({
        title: "মেটা ট্যাগ আপডেট",
        description: "পৃষ্ঠার মেটা ট্যাগ সফলভাবে আপডেট হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "আপডেট ব্যর্থ",
        description: "মেটা ট্যাগ আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  });

  // Handle settings change
  const handleSettingsChange = (key: string, value: any) => {
    setSeoSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handle settings save
  const handleSaveSettings = () => {
    updateSeoSettingsMutation.mutate(seoSettings);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              SEO পরিচালনা
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              সার্চ ইঞ্জিন অপটিমাইজেশন এবং মেটা ট্যাগ পরিচালনা
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => generateSitemapMutation.mutate()}
              disabled={generateSitemapMutation.isPending}
            >
              {generateSitemapMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              সাইটম্যাপ তৈরি
            </Button>
            <Button onClick={handleSaveSettings} disabled={updateSeoSettingsMutation.isPending}>
              {updateSeoSettingsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              সংরক্ষণ
            </Button>
          </div>
        </div>

        {/* SEO Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সার্চ ইম্প্রেশন</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : seoAnalytics?.impressions || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{seoAnalytics?.impressionChange || 0}% গত সপ্তাহে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সার্চ ক্লিক</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : seoAnalytics?.clicks || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {seoAnalytics?.clickThroughRate || 0}% CTR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সূচীবদ্ধ পৃষ্ঠা</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : seoAnalytics?.indexedPages || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {seoAnalytics?.totalPages || 0} পৃষ্ঠার মধ্যে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">গড় র‌্যাঙ্কিং</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : seoAnalytics?.avgRanking || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {seoAnalytics?.keywordCount || 0} কিওয়ার্ড
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SEO Management Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">সাধারণ সেটিংস</TabsTrigger>
            <TabsTrigger value="meta-tags">মেটা ট্যাগ</TabsTrigger>
            <TabsTrigger value="social-media">সোশ্যাল মিডিয়া</TabsTrigger>
            <TabsTrigger value="analytics">বিশ্লেষণ</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>সাধারণ SEO সেটিংস</CardTitle>
                <CardDescription>
                  ওয়েবসাইটের মূল SEO কনফিগারেশন
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">সাইটের নাম</Label>
                    <Input
                      id="siteName"
                      value={seoSettings.siteName}
                      onChange={(e) => handleSettingsChange('siteName', e.target.value)}
                      placeholder="প্রথম আলো"
                    />
                  </div>
                  <div>
                    <Label htmlFor="canonicalUrl">ক্যানোনিকাল URL</Label>
                    <Input
                      id="canonicalUrl"
                      value={seoSettings.canonicalUrl}
                      onChange={(e) => handleSettingsChange('canonicalUrl', e.target.value)}
                      placeholder="https://prothomalo.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="siteDescription">সাইটের বিবরণ</Label>
                  <Textarea
                    id="siteDescription"
                    value={seoSettings.siteDescription}
                    onChange={(e) => handleSettingsChange('siteDescription', e.target.value)}
                    placeholder="বাংলাদেশের শীর্ষ সংবাদ পত্রিকা"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="siteKeywords">কিওয়ার্ড</Label>
                  <Input
                    id="siteKeywords"
                    value={seoSettings.siteKeywords}
                    onChange={(e) => handleSettingsChange('siteKeywords', e.target.value)}
                    placeholder="বাংলাদেশ, সংবাদ, খবর, প্রথম আলো"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="googleSiteVerification">Google Site Verification</Label>
                    <Input
                      id="googleSiteVerification"
                      value={seoSettings.googleSiteVerification}
                      onChange={(e) => handleSettingsChange('googleSiteVerification', e.target.value)}
                      placeholder="google-site-verification কোড"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bingWebmasterTools">Bing Webmaster Tools</Label>
                    <Input
                      id="bingWebmasterTools"
                      value={seoSettings.bingWebmasterTools}
                      onChange={(e) => handleSettingsChange('bingWebmasterTools', e.target.value)}
                      placeholder="msvalidate.01 কোড"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>সাইটম্যাপ সক্রিয়</Label>
                    <p className="text-sm text-muted-foreground">
                      স্বয়ংক্রিয় সাইটম্যাপ তৈরি এবং আপডেট
                    </p>
                  </div>
                  <Switch
                    checked={seoSettings.enableSitemap}
                    onCheckedChange={(checked) => handleSettingsChange('enableSitemap', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Robots.txt সক্রিয়</Label>
                    <p className="text-sm text-muted-foreground">
                      সার্চ ইঞ্জিন ক্রলিং নিয়ন্ত্রণ
                    </p>
                  </div>
                  <Switch
                    checked={seoSettings.enableRobots}
                    onCheckedChange={(checked) => handleSettingsChange('enableRobots', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meta-tags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>পৃষ্ঠার মেটা ট্যাগ</CardTitle>
                <CardDescription>
                  প্রতিটি পৃষ্ঠার জন্য বিশেষ মেটা ট্যাগ কনফিগার করুন
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>পৃষ্ঠা</TableHead>
                        <TableHead>শিরোনাম</TableHead>
                        <TableHead>বিবরণ</TableHead>
                        <TableHead>কিওয়ার্ড</TableHead>
                        <TableHead>অবস্থা</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metaLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : metaTagsData?.length ? (
                        metaTagsData.map((page: any) => (
                          <TableRow key={page.id}>
                            <TableCell className="font-medium">{page.pageName}</TableCell>
                            <TableCell className="max-w-xs truncate">{page.title}</TableCell>
                            <TableCell className="max-w-xs truncate">{page.description}</TableCell>
                            <TableCell className="max-w-xs truncate">{page.keywords}</TableCell>
                            <TableCell>
                              {page.isOptimized ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            কোনো মেটা ট্যাগ পাওয়া যায়নি
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social-media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>সোশ্যাল মিডিয়া SEO</CardTitle>
                <CardDescription>
                  Open Graph এবং Twitter Card সেটিংস
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ogImageUrl">Open Graph ইমেজ URL</Label>
                    <Input
                      id="ogImageUrl"
                      value={seoSettings.ogImageUrl}
                      onChange={(e) => handleSettingsChange('ogImageUrl', e.target.value)}
                      placeholder="/og-default-image.svg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitterHandle">Twitter Handle</Label>
                    <Input
                      id="twitterHandle"
                      value={seoSettings.twitterHandle}
                      onChange={(e) => handleSettingsChange('twitterHandle', e.target.value)}
                      placeholder="@prothomaloBD"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="facebookAppId">Facebook App ID</Label>
                  <Input
                    id="facebookAppId"
                    value={seoSettings.facebookAppId}
                    onChange={(e) => handleSettingsChange('facebookAppId', e.target.value)}
                    placeholder="Facebook App ID"
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">পরীক্ষা লিংক</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <a
                      href="https://developers.facebook.com/tools/debug/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline block"
                    >
                      Facebook Open Graph Debugger
                    </a>
                    <a
                      href="https://cards-dev.twitter.com/validator"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline block"
                    >
                      Twitter Card Validator
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO বিশ্লেষণ</CardTitle>
                <CardDescription>
                  সার্চ ইঞ্জিন পারফরম্যান্স এবং র‌্যাঙ্কিং
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">শীর্ষ কিওয়ার্ড</h4>
                    {seoAnalytics?.topKeywords?.map((keyword: any, index: number) => (
                      <div key={keyword.keyword} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span className="text-sm">{keyword.keyword}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">#{keyword.position}</div>
                          <div className="text-xs text-muted-foreground">{keyword.clicks} ক্লিক</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">শীর্ষ পৃষ্ঠা</h4>
                    {seoAnalytics?.topPages?.map((page: any, index: number) => (
                      <div key={page.url} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span className="text-sm truncate max-w-[200px]">{page.title}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{page.clicks}</div>
                          <div className="text-xs text-muted-foreground">{page.impressions} ইম্প্রেশন</div>
                        </div>
                      </div>
                    ))}
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