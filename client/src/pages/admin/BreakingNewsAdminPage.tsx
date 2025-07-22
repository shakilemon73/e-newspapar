import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Loader2, 
  Bell, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Radio
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBreakingNews, createBreakingNews, updateBreakingNews, deleteBreakingNews } from '@/lib/admin-api-direct';
import { DateFormatter } from '@/components/DateFormatter';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const breakingNewsFormSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters'),
  is_active: z.boolean().default(true),
  article_id: z.number().optional(),
  creation_type: z.enum(['new', 'existing']).default('new'),
});

type BreakingNewsFormValues = z.infer<typeof breakingNewsFormSchema>;

const getBreakingNewsColumns = (t: any) => [
  { key: 'id', label: t('id', 'ID', 'আইডি'), sortable: true },
  { 
    key: 'content', 
    label: t('content', 'Content', 'বিষয়বস্তু'), 
    sortable: true,
    render: (value: string) => (
      <div className="max-w-[400px] truncate font-medium">{value}</div>
    )
  },
  { 
    key: 'is_active', 
    label: t('status', 'Status', 'অবস্থা'), 
    sortable: true,
    render: (value: boolean) => (
      <Badge variant={value ? 'default' : 'secondary'}>
        {value ? (
          <><Radio className="h-3 w-3 mr-1" /> {t('live', 'Live', 'লাইভ')}</>
        ) : (
          <><XCircle className="h-3 w-3 mr-1" /> {t('inactive', 'Inactive', 'নিষ্ক্রিয়')}</>
        )}
      </Badge>
    )
  },
  { 
    key: 'created_at', 
    label: t('created', 'Created', 'তৈরি'), 
    sortable: true,
    render: (value: string) => <DateFormatter date={value} type="relative" />
  },
  { 
    key: 'updated_at', 
    label: t('updated', 'Updated', 'আপডেট'), 
    sortable: true,
    render: (value: string) => <DateFormatter date={value} type="relative" />
  },
];

export default function BreakingNewsAdminPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<any>(null);
  const [creationType, setCreationType] = useState<'new' | 'existing'>('new');

  const form = useForm<BreakingNewsFormValues>({
    resolver: zodResolver(breakingNewsFormSchema),
    defaultValues: {
      content: '',
      is_active: true,
      creation_type: 'new',
      article_id: undefined,
    },
  });

  // Fetch breaking news using direct Supabase API
  const { data: breakingNews, isLoading, error } = useQuery({
    queryKey: ['admin-breaking-news'],
    queryFn: () => getBreakingNews(),
  });

  // Fetch articles for selection
  const { data: articles } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const { getArticles } = await import('../../lib/supabase-api-direct');
      return await getArticles(50);
    },
    enabled: creationType === 'existing'
  });

  // Create/Update mutation using direct Supabase API
  const saveMutation = useMutation({
    mutationFn: async (data: BreakingNewsFormValues) => {
      const payload = {
        title: data.content, // Use content as title for breaking news
        content: data.content,
        priority: 'high' as const,
        is_active: data.is_active
      };
      
      if (mode === 'create') {
        return await createBreakingNews(payload);
      } else {
        return await updateBreakingNews(selectedNews.id, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: `Breaking news ${mode === 'create' ? 'created' : 'updated'}`,
        description: `The breaking news has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      setDialogOpen(false);
      form.reset();
      // Note: Using standard queryClient since we're in React context
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation using direct Supabase API
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBreakingNews(id),
    onSuccess: () => {
      toast({
        title: 'Breaking news deleted',
        description: 'The breaking news has been successfully deleted.',
      });
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle active status mutation using direct Supabase API
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => 
      updateBreakingNews(id, { is_active }),
    onSuccess: () => {
      toast({
        title: 'Status updated',
        description: 'The breaking news status has been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateNews = () => {
    setSelectedNews(null);
    setMode('create');
    form.reset();
    setDialogOpen(true);
  };

  const handleEditNews = (news: any) => {
    setSelectedNews(news);
    setMode('edit');
    form.setValue('content', news.content);
    form.setValue('is_active', news.is_active);
    setDialogOpen(true);
  };

  const handleDeleteNews = (news: any) => {
    setNewsToDelete(news);
    setDeleteDialogOpen(true);
  };

  const handleToggleActive = (news: any) => {
    toggleActiveMutation.mutate({
      id: news.id,
      is_active: !news.is_active
    });
  };

  const onSubmit = (data: BreakingNewsFormValues) => {
    saveMutation.mutate(data);
  };

  // Calculate stats
  const totalNews = breakingNews?.length || 0;
  const activeNews = breakingNews?.filter((news: any) => news.is_active).length || 0;
  const inactiveNews = totalNews - activeNews;
  const recentNews = breakingNews?.filter((news: any) => {
    const createdAt = new Date(news.created_at);
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    return createdAt > twentyFourHoursAgo;
  }).length || 0;

  if (error) {
    return (
      <EnhancedAdminLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading Breaking News
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {error.message || 'An error occurred while loading breaking news'}
            </p>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-8 w-8" />
              {t('breaking-news-management', 'Breaking News Management', 'ব্রেকিং নিউজ ব্যবস্থাপনা')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('manage-breaking-news-desc', 'Manage urgent news alerts and breaking news', 'জরুরি সংবাদ সতর্কতা এবং ব্রেকিং নিউজ পরিচালনা করুন')}
            </p>
          </div>
          <Button onClick={handleCreateNews} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('create-breaking-news', 'Create Breaking News', 'ব্রেকিং নিউজ তৈরি করুন')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total-news', 'Total News', 'মোট সংবাদ')}</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalNews}</div>
              <p className="text-xs text-muted-foreground">
                {t('breaking-news-items', 'Breaking news items', 'ব্রেকিং নিউজ আইটেম')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('active-live', 'Active/Live', 'সক্রিয়/লাইভ')}</CardTitle>
              <Radio className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeNews}</div>
              <p className="text-xs text-muted-foreground">
                {t('currently-visible', 'Currently visible', 'বর্তমানে দৃশ্যমান')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('inactive', 'Inactive', 'নিষ্ক্রিয়')}</CardTitle>
              <XCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{inactiveNews}</div>
              <p className="text-xs text-muted-foreground">
                {t('hidden-from-public', 'Hidden from public', 'জনসাধারণের কাছ থেকে লুকানো')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('last-24h', 'Last 24h', 'শেষ ২৪ ঘন্টা')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentNews}</div>
              <p className="text-xs text-muted-foreground">
                {t('recent-updates', 'Recent updates', 'সাম্প্রতিক আপডেট')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Breaking News Alert */}
        {activeNews > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Live Breaking News
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {breakingNews?.filter((news: any) => news.is_active).map((news: any) => (
                <div key={news.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {news.content}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Created: <DateFormatter date={news.created_at} type="relative" />
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={news.is_active}
                      onCheckedChange={() => handleToggleActive(news)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditNews(news)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Breaking News Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('all-breaking-news', 'All Breaking News', 'সকল ব্রেকিং নিউজ')}</CardTitle>
            <CardDescription>
              {t('manage-breaking-news-alerts', 'Manage all breaking news alerts and their status', 'সকল ব্রেকিং নিউজ সতর্কতা এবং তাদের অবস্থা পরিচালনা করুন')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <DataTable
                data={breakingNews || []}
                columns={getBreakingNewsColumns(t)}
                searchPlaceholder={t('search-breaking-news', 'Search breaking news...', 'ব্রেকিং নিউজ খুঁজুন...')}
                onEdit={handleEditNews}
                onDelete={handleDeleteNews}
                loading={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Breaking News Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {mode === 'create' ? t('create-breaking-news', 'Create Breaking News', 'ব্রেকিং নিউজ তৈরি করুন') : t('edit-breaking-news', 'Edit Breaking News', 'ব্রেকিং নিউজ সম্পাদনা করুন')}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Creation Type Selection */}
                <FormField
                  control={form.control}
                  name="creation_type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{t('creation-type', 'Creation Type', 'তৈরির ধরন')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="new"
                              value="new"
                              checked={field.value === 'new'}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setCreationType('new');
                              }}
                            />
                            <label htmlFor="new" className="text-sm font-medium">
                              {t('create-new', 'Create New', 'নতুন তৈরি করুন')}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="existing"
                              value="existing"
                              checked={field.value === 'existing'}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setCreationType('existing');
                              }}
                            />
                            <label htmlFor="existing" className="text-sm font-medium">
                              {t('use-existing', 'Use Existing Article', 'বিদ্যমান নিবন্ধ ব্যবহার করুন')}
                            </label>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Article Selection (for existing articles) */}
                {creationType === 'existing' && (
                  <FormField
                    control={form.control}
                    name="article_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('select-article', 'Select Article', 'নিবন্ধ নির্বাচন করুন')}</FormLabel>
                        <FormControl>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('choose-article', 'Choose an article...', 'একটি নিবন্ধ নির্বাচন করুন...')} />
                            </SelectTrigger>
                            <SelectContent>
                              {articles?.map((article: any) => (
                                <SelectItem key={article.id} value={article.id.toString()}>
                                  {article.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('breaking-news-content', 'Breaking News Content', 'ব্রেকিং নিউজ কন্টেন্ট')} *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('enter-breaking-news', 'Enter breaking news content...', 'ব্রেকিং নিউজ কন্টেন্ট লিখুন...')}
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('publish-immediately', 'Publish Immediately', 'তাত্ক্ষণিক প্রকাশ করুন')}
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {t('breaking-news-visible', 'This breaking news will be visible to all users', 'এই ব্রেকিং নিউজটি সকল ব্যবহারকারীর কাছে দৃশ্যমান হবে')}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {t('important-notice', 'Important Notice', 'গুরুত্বপূর্ণ বিজ্ঞপ্তি')}
                    </p>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {t('breaking-news-warning', 'Breaking news will appear at the top of the website and in the ticker. Only activate when necessary to avoid overwhelming users.', 'ব্রেকিং নিউজ ওয়েবসাইটের শীর্ষে এবং টিকারে প্রদর্শিত হবে। ব্যবহারকারীদের অভিভূত করা এড়াতে কেবল প্রয়োজনীয় সময় সক্রিয় করুন।')}
                  </p>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    {t('cancel', 'Cancel', 'বাতিল')}
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('saving', 'Saving...', 'সংরক্ষণ করা হচ্ছে...')}
                      </>
                    ) : (
                      mode === 'create' ? t('create-publish', 'Create & Publish', 'তৈরি এবং প্রকাশ করুন') : t('update-breaking-news', 'Update Breaking News', 'ব্রেকিং নিউজ আপডেট করুন')
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the breaking news
                and remove it from all displays.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => newsToDelete && deleteMutation.mutate(newsToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Breaking News
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </EnhancedAdminLayout>
  );
}