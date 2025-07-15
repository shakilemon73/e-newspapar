import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { ContentEditor } from '@/components/admin/ContentEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Loader2, 
  TrendingUp, 
  Eye, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DateFormatter } from '@/components/DateFormatter';
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

const articleColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { 
    key: 'title', 
    label: 'Title', 
    sortable: true,
    render: (value: string) => (
      <div className="max-w-[300px] truncate font-medium">{value}</div>
    )
  },
  { 
    key: 'category', 
    label: 'Category',
    render: (value: any) => (
      <Badge variant="outline">{value?.name || 'Uncategorized'}</Badge>
    )
  },
  { 
    key: 'isFeatured', 
    label: 'Featured', 
    sortable: true,
    render: (value: boolean) => (
      <Badge variant={value ? 'default' : 'secondary'}>
        {value ? 'Featured' : 'Normal'}
      </Badge>
    )
  },
  { 
    key: 'publishedAt', 
    label: 'Published', 
    sortable: true,
    render: (value: string) => <DateFormatter date={value} type="relative" />
  },
  { 
    key: 'viewCount', 
    label: 'Views', 
    sortable: true,
    render: (value: number) => (
      <div className="flex items-center gap-1">
        <Eye className="h-3 w-3 text-muted-foreground" />
        {value || 0}
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: any, row: any) => {
      const isPublished = new Date(row.publishedAt) <= new Date();
      return (
        <Badge variant={isPublished ? 'default' : 'secondary'}>
          {isPublished ? 'Published' : 'Scheduled'}
        </Badge>
      );
    }
  }
];

export default function ArticlesAdminPage() {
  const { toast } = useToast();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<any>(null);

  // Fetch articles
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
  });

  // Get article statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/articles/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/articles/stats');
      if (!response.ok) {
        // Return calculated stats if API endpoint doesn't exist
        const totalArticles = Array.isArray(articles) ? articles.length : 0;
        const featuredArticles = Array.isArray(articles) ? articles.filter(a => a.isFeatured).length : 0;
        const totalViews = Array.isArray(articles) ? articles.reduce((sum, a) => sum + (a.viewCount || 0), 0) : 0;
        const publishedToday = Array.isArray(articles) ? articles.filter(a => {
          const publishDate = new Date(a.publishedAt);
          const today = new Date();
          return publishDate.toDateString() === today.toDateString();
        }).length : 0;
        
        return {
          totalArticles,
          featuredArticles,
          totalViews,
          publishedToday
        };
      }
      return response.json();
    },
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/articles/${id}`);
      if (!res.ok) throw new Error('Failed to delete article');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Article deleted',
        description: 'The article has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Feature toggle mutation
  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: number; isFeatured: boolean }) => {
      const res = await apiRequest('PATCH', `/api/articles/${id}`, { isFeatured });
      if (!res.ok) throw new Error('Failed to update article');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Article updated',
        description: 'The article feature status has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateArticle = () => {
    setSelectedArticle(null);
    setEditorMode('create');
    setEditorOpen(true);
  };

  const handleEditArticle = (article: any) => {
    setSelectedArticle(article);
    setEditorMode('edit');
    setEditorOpen(true);
  };

  const handleDeleteArticle = (article: any) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleViewArticle = (article: any) => {
    window.open(`/article/${article.slug}`, '_blank');
  };

  const handleToggleFeature = (article: any) => {
    toggleFeatureMutation.mutate({
      id: article.id,
      isFeatured: !article.isFeatured
    });
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading Articles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {error.message || 'An error occurred while loading articles'}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Articles Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, edit, and manage your news articles
            </p>
          </div>
          <Button onClick={handleCreateArticle} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Article
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalArticles || 0}</div>
              <p className="text-xs text-muted-foreground">
                Published articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Articles</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.featuredArticles || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently featured
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Article page views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.publishedToday || 0}</div>
              <p className="text-xs text-muted-foreground">
                Articles published today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Articles Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Articles</CardTitle>
            <CardDescription>
              Manage and monitor your published articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <DataTable
                data={articles || []}
                columns={articleColumns}
                searchPlaceholder="Search articles..."
                onEdit={handleEditArticle}
                onDelete={handleDeleteArticle}
                onView={handleViewArticle}
                loading={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Content Editor Modal */}
        <ContentEditor
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          article={selectedArticle}
          mode={editorMode}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the article
                "{articleToDelete?.title}" and remove it from the website.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => articleToDelete && deleteMutation.mutate(articleToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Article
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}