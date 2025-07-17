import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { AdminOnlyLayout } from '@/components/admin/AdminOnlyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  BarChart3, 
  Settings,
  Filter,
  TrendingUp,
  Users,
  Clock,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  Eye,
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

export default function SearchManagementPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [searchSettings, setSearchSettings] = useState({
    enableFuzzySearch: true,
    enableSearchSuggestions: true,
    enableAutoComplete: true,
    enableSearchHistory: true,
    maxSearchResults: 50,
    searchTimeout: 5000,
    enableBengaliSearch: true,
    enableAdvancedSearch: true,
    enableSearchAnalytics: true,
    indexingEnabled: true,
    reindexFrequency: 'daily'
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

  // Search data queries
  const { data: searchStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/search-stats'],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: searchAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/search-analytics'],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: searchHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/admin/search-history'],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: searchIndex, isLoading: indexLoading } = useQuery({
    queryKey: ['/api/admin/search-index'],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Search settings mutation
  const updateSearchSettingsMutation = useMutation({
    mutationFn: async (settings: typeof searchSettings) => {
      return await apiRequest('/api/admin/search-settings', {
        method: 'PUT',
        body: settings
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/search-settings'] });
      toast({
        title: "সার্চ সেটিংস সংরক্ষিত",
        description: "আপনার সার্চ সেটিংস সফলভাবে সংরক্ষিত হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "সংরক্ষণ ব্যর্থ",
        description: "সার্চ সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  });

  // Reindex search mutation
  const reindexSearchMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/reindex-search', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/search-index'] });
      toast({
        title: "পুনঃসূচীকরণ সফল",
        description: "সার্চ ইনডেক্স সফলভাবে পুনর্নির্মাণ করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "পুনঃসূচীকরণ ব্যর্থ",
        description: "সার্চ ইনডেক্স পুনর্নির্মাণ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  });

  // Clear search history mutation
  const clearSearchHistoryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/clear-search-history', {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/search-history'] });
      toast({
        title: "ইতিহাস মুছে ফেলা হয়েছে",
        description: "সার্চ ইতিহাস সফলভাবে মুছে ফেলা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "মুছে ফেলা ব্যর্থ",
        description: "সার্চ ইতিহাস মুছে ফেলতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  });

  // Handle settings change
  const handleSettingsChange = (key: string, value: any) => {
    setSearchSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handle settings save
  const handleSaveSettings = () => {
    updateSearchSettingsMutation.mutate(searchSettings);
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
    <AdminOnlyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              সার্চ পরিচালনা
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              সার্চ ইঞ্জিন, ইনডেক্সিং এবং অনুসন্ধান বৈশিষ্ট্য পরিচালনা
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => reindexSearchMutation.mutate()}
              disabled={reindexSearchMutation.isPending}
            >
              {reindexSearchMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              পুনঃসূচীকরণ
            </Button>
            <Button onClick={handleSaveSettings} disabled={updateSearchSettingsMutation.isPending}>
              {updateSearchSettingsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              সংরক্ষণ
            </Button>
          </div>
        </div>

        {/* Search Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট সার্চ</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : searchStats?.totalSearches || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{searchStats?.searchGrowth || 0}% এই মাসে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সূচীবদ্ধ নিবন্ধ</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {indexLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : searchIndex?.indexedArticles || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {searchIndex?.totalArticles || 0} এর মধ্যে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">গড় প্রতিক্রিয়া সময়</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : searchStats?.avgResponseTime || 0}ms
              </div>
              <p className="text-xs text-muted-foreground">
                {searchStats?.performanceImprovement || 0}% উন্নতি
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সফল অনুসন্ধান</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : searchStats?.successRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {searchStats?.totalResults || 0} ফলাফল
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Management Tabs */}
        <Tabs defaultValue="settings" className="w-full">
          <TabsList>
            <TabsTrigger value="settings">সেটিংস</TabsTrigger>
            <TabsTrigger value="analytics">বিশ্লেষণ</TabsTrigger>
            <TabsTrigger value="history">ইতিহাস</TabsTrigger>
            <TabsTrigger value="index">সূচী</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>সার্চ সেটিংস</CardTitle>
                <CardDescription>
                  অনুসন্ধান কার্যকারিতা এবং পারফরম্যান্স কনফিগারেশন
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">অনুসন্ধান বৈশিষ্ট্য</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>ফাজি সার্চ</Label>
                        <p className="text-sm text-muted-foreground">
                          বানান ভুল সহনশীলতা
                        </p>
                      </div>
                      <Switch
                        checked={searchSettings.enableFuzzySearch}
                        onCheckedChange={(checked) => handleSettingsChange('enableFuzzySearch', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>সার্চ সাজেশন</Label>
                        <p className="text-sm text-muted-foreground">
                          স্বয়ংক্রিয় সার্চ পরামর্শ
                        </p>
                      </div>
                      <Switch
                        checked={searchSettings.enableSearchSuggestions}
                        onCheckedChange={(checked) => handleSettingsChange('enableSearchSuggestions', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>অটো কমপ্লিট</Label>
                        <p className="text-sm text-muted-foreground">
                          টাইপিং সময় সাজেশন
                        </p>
                      </div>
                      <Switch
                        checked={searchSettings.enableAutoComplete}
                        onCheckedChange={(checked) => handleSettingsChange('enableAutoComplete', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>বাংলা সার্চ</Label>
                        <p className="text-sm text-muted-foreground">
                          উন্নত বাংলা অনুসন্ধান
                        </p>
                      </div>
                      <Switch
                        checked={searchSettings.enableBengaliSearch}
                        onCheckedChange={(checked) => handleSettingsChange('enableBengaliSearch', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>অ্যাডভান্সড সার্চ</Label>
                        <p className="text-sm text-muted-foreground">
                          বিস্তারিত অনুসন্ধান বিকল্প
                        </p>
                      </div>
                      <Switch
                        checked={searchSettings.enableAdvancedSearch}
                        onCheckedChange={(checked) => handleSettingsChange('enableAdvancedSearch', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">পারফরম্যান্স সেটিংস</h4>
                    
                    <div>
                      <Label htmlFor="maxResults">সর্বোচ্চ ফলাফল</Label>
                      <Input
                        id="maxResults"
                        type="number"
                        value={searchSettings.maxSearchResults}
                        onChange={(e) => handleSettingsChange('maxSearchResults', parseInt(e.target.value))}
                        min="10"
                        max="100"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="searchTimeout">সার্চ টাইমআউট (ms)</Label>
                      <Input
                        id="searchTimeout"
                        type="number"
                        value={searchSettings.searchTimeout}
                        onChange={(e) => handleSettingsChange('searchTimeout', parseInt(e.target.value))}
                        min="1000"
                        max="10000"
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>সার্চ ইতিহাস</Label>
                        <p className="text-sm text-muted-foreground">
                          ব্যবহারকারীর সার্চ ইতিহাস সংরক্ষণ
                        </p>
                      </div>
                      <Switch
                        checked={searchSettings.enableSearchHistory}
                        onCheckedChange={(checked) => handleSettingsChange('enableSearchHistory', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>সার্চ অ্যানালিটিক্স</Label>
                        <p className="text-sm text-muted-foreground">
                          অনুসন্ধান পরিসংখ্যান সংগ্রহ
                        </p>
                      </div>
                      <Switch
                        checked={searchSettings.enableSearchAnalytics}
                        onCheckedChange={(checked) => handleSettingsChange('enableSearchAnalytics', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>সার্চ বিশ্লেষণ</CardTitle>
                <CardDescription>
                  জনপ্রিয় অনুসন্ধান এবং ট্রেন্ড বিশ্লেষণ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">জনপ্রিয় অনুসন্ধান</h4>
                    {analyticsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      searchAnalytics?.popularSearches?.map((search: any, index: number) => (
                        <div key={search.query} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded text-xs flex items-center justify-center">
                              {index + 1}
                            </div>
                            <span className="font-medium">{search.query}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{search.count}</div>
                            <div className="text-xs text-muted-foreground">অনুসন্ধান</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">ফলাফল পারফরম্যান্স</h4>
                    {analyticsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-sm font-medium">সফল অনুসন্ধান</span>
                          <span className="text-green-600 font-bold">{searchAnalytics?.successfulSearches || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <span className="text-sm font-medium">আংশিক ফলাফল</span>
                          <span className="text-yellow-600 font-bold">{searchAnalytics?.partialResults || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <span className="text-sm font-medium">ফলাফল নেই</span>
                          <span className="text-red-600 font-bold">{searchAnalytics?.noResults || 0}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>সার্চ ইতিহাস</CardTitle>
                    <CardDescription>
                      সাম্প্রতিক অনুসন্ধান কার্যকলাপ
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearSearchHistoryMutation.mutate()}
                    disabled={clearSearchHistoryMutation.isPending}
                  >
                    {clearSearchHistoryMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    ইতিহাস মুছুন
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>অনুসন্ধান</TableHead>
                        <TableHead>ব্যবহারকারী</TableHead>
                        <TableHead>ফলাফল</TableHead>
                        <TableHead>প্রতিক্রিয়া সময়</TableHead>
                        <TableHead>তারিখ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : searchHistory?.length ? (
                        searchHistory.map((search: any) => (
                          <TableRow key={search.id}>
                            <TableCell className="font-medium">{search.query}</TableCell>
                            <TableCell>{search.userEmail || 'অজানা'}</TableCell>
                            <TableCell>
                              <Badge variant={search.resultCount > 0 ? 'default' : 'destructive'}>
                                {search.resultCount} ফলাফল
                              </Badge>
                            </TableCell>
                            <TableCell>{search.responseTime}ms</TableCell>
                            <TableCell>
                              <DateFormatter date={search.searchedAt} type="relative" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            কোনো সার্চ ইতিহাস পাওয়া যায়নি
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="index" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>সার্চ ইনডেক্স</CardTitle>
                <CardDescription>
                  সূচীকৃত কন্টেন্ট এবং ইনডেক্স অবস্থা
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {indexLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : searchIndex?.indexedArticles || 0}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">সূচীকৃত নিবন্ধ</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {indexLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : searchIndex?.indexedCategories || 0}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">সূচীকৃত বিভাগ</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {indexLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : searchIndex?.indexHealth || 0}%
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">সূচী স্বাস্থ্য</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">সূচীকরণ পরিসংখ্যান</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span>সম্পূর্ণ সূচীকৃত</span>
                        </div>
                        <span className="font-medium">{searchIndex?.fullyIndexed || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-yellow-500" />
                          <span>সূচীকরণ অপেক্ষারত</span>
                        </div>
                        <span className="font-medium">{searchIndex?.pendingIndexing || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <span>সূচীকরণ ব্যর্থ</span>
                        </div>
                        <span className="font-medium">{searchIndex?.failedIndexing || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnlyLayout>
  );
}