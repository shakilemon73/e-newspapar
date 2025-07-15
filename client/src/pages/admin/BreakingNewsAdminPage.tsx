import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WebsiteAdminLayout } from '@/components/admin/WebsiteAdminLayout';
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
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DateFormatter } from '@/components/DateFormatter';
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
});

type BreakingNewsFormValues = z.infer<typeof breakingNewsFormSchema>;

const breakingNewsColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { 
    key: 'content', 
    label: 'Content', 
    sortable: true,
    render: (value: string) => (
      <div className="max-w-[400px] truncate font-medium">{value}</div>
    )
  },
  { 
    key: 'is_active', 
    label: 'Status', 
    sortable: true,
    render: (value: boolean) => (
      <Badge variant={value ? 'default' : 'secondary'}>
        {value ? (
          <><Radio className="h-3 w-3 mr-1" /> Live</>
        ) : (
          <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
        )}
      </Badge>
    )
  },
  { 
    key: 'created_at', 
    label: 'Created', 
    sortable: true,
    render: (value: string) => <DateFormatter date={value} type="relative" />
  },
  { 
    key: 'updated_at', 
    label: 'Updated', 
    sortable: true,
    render: (value: string) => <DateFormatter date={value} type="relative" />
  },
];

export default function BreakingNewsAdminPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<any>(null);

  const form = useForm<BreakingNewsFormValues>({
    resolver: zodResolver(breakingNewsFormSchema),
    defaultValues: {
      content: '',
      is_active: true,
    },
  });

  // Fetch breaking news
  const { data: breakingNews, isLoading, error } = useQuery({
    queryKey: ['/api/breaking-news'],
    queryFn: async () => {
      const response = await fetch('/api/breaking-news');
      if (!response.ok) throw new Error('Failed to fetch breaking news');
      return response.json();
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: BreakingNewsFormValues) => {
      const endpoint = mode === 'create' 
        ? '/api/breaking-news' 
        : `/api/breaking-news/${selectedNews.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const res = await apiRequest(method, endpoint, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${mode} breaking news`);
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `Breaking news ${mode === 'create' ? 'created' : 'updated'}`,
        description: `The breaking news has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      setDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/breaking-news'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/breaking-news/${id}`);
      if (!res.ok) throw new Error('Failed to delete breaking news');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Breaking news deleted',
        description: 'The breaking news has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/breaking-news'] });
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

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const res = await apiRequest('PATCH', `/api/breaking-news/${id}`, { is_active });
      if (!res.ok) throw new Error('Failed to update breaking news status');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Status updated',
        description: 'The breaking news status has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/breaking-news'] });
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
      <WebsiteAdminLayout>
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
      </WebsiteAdminLayout>
    );
  }

  return (
    <WebsiteAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Breaking News Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage urgent news alerts and breaking news
            </p>
          </div>
          <Button onClick={handleCreateNews} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Breaking News
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total News</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalNews}</div>
              <p className="text-xs text-muted-foreground">
                Breaking news items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active/Live</CardTitle>
              <Radio className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeNews}</div>
              <p className="text-xs text-muted-foreground">
                Currently visible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{inactiveNews}</div>
              <p className="text-xs text-muted-foreground">
                Hidden from public
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentNews}</div>
              <p className="text-xs text-muted-foreground">
                Recent updates
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
            <CardTitle>All Breaking News</CardTitle>
            <CardDescription>
              Manage all breaking news alerts and their status
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
                columns={breakingNewsColumns}
                searchPlaceholder="Search breaking news..."
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
                {mode === 'create' ? 'Create Breaking News' : 'Edit Breaking News'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breaking News Content *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter breaking news content..."
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
                          Publish Immediately
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          This breaking news will be visible to all users
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
                      Important Notice
                    </p>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Breaking news will appear at the top of the website and in the ticker. 
                    Only activate when necessary to avoid overwhelming users.
                  </p>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      mode === 'create' ? 'Create & Publish' : 'Update Breaking News'
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
    </WebsiteAdminLayout>
  );
}