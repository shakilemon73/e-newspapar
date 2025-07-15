import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { AdminOnlyLayout } from '@/components/admin/AdminOnlyLayout';
import { DataTable } from '@/components/admin/DataTable';
import { ContentEditor } from '@/components/admin/ContentEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Loader2, 
  Search,
  Filter,
  TrendingUp, 
  Eye, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Star,
  Calendar,
  BarChart3,
  Users,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Upload,
  MoreHorizontal,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DateFormatter } from '@/components/DateFormatter';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [authLoading, user, setLocation]);

  // Fetch articles with authentication
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['/api/articles'],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Get article statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/articles/stats'],
    enabled: !!user && user.user_metadata?.role === 'admin' && !!articles,
    queryFn: async () => {
      // Calculate stats from existing articles since we don't have a specific endpoint
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
      <AdminOnlyLayout>
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
      </AdminOnlyLayout>
    );
  }

  return (
    <AdminOnlyLayout>
      <div className="space-y-6 p-6">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3 tracking-tight">Article Management</h1>
              <p className="text-blue-100 text-lg leading-relaxed">
                Create, manage, and optimize your Bengali news articles with enhanced UX design
              </p>
              <div className="flex items-center mt-4 space-x-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats?.totalArticles || 0} Articles
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Eye className="h-3 w-3 mr-1" />
                  {stats?.totalViews?.toLocaleString() || 0} Views
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 min-h-[44px]"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleCreateArticle}
                className="bg-white text-blue-600 hover:bg-gray-100 min-h-[44px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter & Search Articles
            </CardTitle>
            <CardDescription>
              Use advanced filters to find and manage your articles efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 min-h-[44px]"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="politics">রাজনীতি</SelectItem>
                  <SelectItem value="sports">খেলা</SelectItem>
                  <SelectItem value="economy">অর্থনীতি</SelectItem>
                  <SelectItem value="international">আন্তর্জাতিক</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="min-h-[44px]">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="min-h-[44px]">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
    </AdminOnlyLayout>
  );
}