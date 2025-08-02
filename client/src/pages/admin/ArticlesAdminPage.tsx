import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
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
  Eye, 
  Edit,
  Trash2,
  Star,
  Calendar,
  MoreHorizontal,
  RefreshCw,
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminSupabaseAPI } from '@/lib/admin';
import { DateFormatter, formatDate } from '@/components/DateFormatter';
import { getRelativeTimeInBengali, formatBengaliDate } from '@/lib/utils/dates';
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

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  category_id: number;
  is_featured: boolean;
  status?: string; // 'draft', 'published', 'review', 'scheduled'
  is_published?: boolean; // Boolean flag for compatibility
  view_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  ai_processed?: boolean;
  ai_processed_at?: string;
  image_metadata?: any;
  author_id?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function ArticlesAdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // State management
  const [currentView, setCurrentView] = useState<'list' | 'editor'>('list');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'bn' | 'en'>('bn');
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState('published_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminSupabaseAPI.categories.getAll,
  });

  // Fetch articles with filters
  const { 
    data: articlesData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['admin-articles', {
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      category: selectedCategory,
      status: selectedStatus,
      sortBy,
      sortOrder
    }],
    queryFn: async () => {
      console.log('🔄 ArticlesAdminPage: Calling API with params:', {
        currentPage,
        pageSize,
        searchTerm,
        selectedCategory
      });
      const result = await adminSupabaseAPI.articles.getAll(
        currentPage,
        pageSize,
        searchTerm,
        selectedCategory === 'all' ? '' : selectedCategory
      );
      console.log('🔍 ArticlesAdminPage: API result:', result);
      return result;
    },
    retry: 1
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminSupabaseAPI.articles.delete(id),
    onSuccess: () => {
      toast({
        title: currentLanguage === 'bn' ? "নিবন্ধ মুছে ফেলা হয়েছে" : "Article Deleted",
        description: currentLanguage === 'bn' ? "নিবন্ধটি সফলভাবে মুছে ফেলা হয়েছে" : "The article has been successfully deleted",
      });
      // Invalidate and refetch article-related queries
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-activity'] });
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: currentLanguage === 'bn' ? "ত্রুটি" : "Error",
        description: currentLanguage === 'bn' ? "নিবন্ধ মুছে ফেলতে ব্যর্থ" : "Failed to delete article",
        variant: "destructive",
      });
    },
  });

  // Status toggle mutation
  const statusToggleMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: number, currentStatus: boolean }) => {
      const newStatus = currentStatus ? 'draft' : 'published';
      const newIsPublished = !currentStatus;
      
      return await adminSupabaseAPI.articles.update(id, {
        status: newStatus,
        is_published: newIsPublished,
        published_at: newIsPublished ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      toast({
        title: currentLanguage === 'bn' ? "স্ট্যাটাস পরিবর্তিত" : "Status Changed",
        description: currentLanguage === 'bn' ? "নিবন্ধের স্ট্যাটাস সফলভাবে পরিবর্তিত হয়েছে" : "Article status has been successfully changed",
      });
      // Force immediate cache invalidation and refetch for real-time updates
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'admin-articles'
      });
      queryClient.refetchQueries({ 
        predicate: (query) => query.queryKey[0] === 'admin-articles'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.refetchQueries({ queryKey: ['admin-dashboard-stats'] });
      
      // Also invalidate public article queries to prevent draft articles from showing
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['latest-articles'] });
      queryClient.invalidateQueries({ queryKey: ['popular-articles'] });
    },
    onError: (error: any) => {
      toast({
        title: currentLanguage === 'bn' ? "ত্রুটি" : "Error",
        description: currentLanguage === 'bn' ? "স্ট্যাটাস পরিবর্তন করতে ব্যর্থ" : "Failed to change status",
        variant: "destructive",
      });
    },
  });

  // Language texts
  const texts = {
    bn: {
      title: "নিবন্ধ ব্যবস্থাপনা",
      subtitle: "আপনার সাইটের সকল নিবন্ধ পরিচালনা করুন",
      createNew: "নতুন নিবন্ধ",
      searchPlaceholder: "নিবন্ধ অনুসন্ধান...",
      allCategories: "সকল বিভাগ",
      allStatus: "সকল অবস্থা",
      published: "প্রকাশিত",
      draft: "খসড়া",
      featured: "বৈশিষ্ট্যযুক্ত",
      normal: "সাধারণ",
      edit: "সম্পাদনা",
      delete: "মুছুন",
      confirmDelete: "নিশ্চিত করুন",
      confirmDeleteDesc: "আপনি কি নিশ্চিত যে এই নিবন্ধটি মুছে ফেলতে চান?",
      cancel: "বাতিল",
      loading: "লোড হচ্ছে...",
      noArticles: "কোন নিবন্ধ পাওয়া যায়নি",
      totalArticles: "মোট নিবন্ধ",
      publishedArticles: "প্রকাশিত নিবন্ধ",
      draftArticles: "খসড়া নিবন্ধ",
      featuredArticles: "বৈশিষ্ট্যযুক্ত নিবন্ধ",
      title_col: "শিরোনাম",
      category_col: "বিভাগ",
      status_col: "অবস্থা",
      published_col: "প্রকাশের তারিখ",
      views_col: "দর্শন",
      actions_col: "কর্ম"
    },
    en: {
      title: "Articles Management",
      subtitle: "Manage all articles on your site",
      createNew: "Create New Article",
      searchPlaceholder: "Search articles...",
      allCategories: "All Categories",
      allStatus: "All Status",
      published: "Published",
      draft: "Draft",
      featured: "Featured",
      normal: "Normal",
      edit: "Edit",
      delete: "Delete",
      confirmDelete: "Confirm Delete",
      confirmDeleteDesc: "Are you sure you want to delete this article?",
      cancel: "Cancel",
      loading: "Loading...",
      noArticles: "No articles found",
      totalArticles: "Total Articles",
      publishedArticles: "Published Articles",
      draftArticles: "Draft Articles",
      featuredArticles: "Featured Articles",
      title_col: "Title",
      category_col: "Category",
      status_col: "Status",
      published_col: "Published Date",
      views_col: "Views",
      actions_col: "Actions"
    }
  };

  const t = texts[currentLanguage];

  // Date formatting function
  const formatArticleDate = (dateString: string, language: 'bn' | 'en'): string => {
    if (!dateString) return language === 'bn' ? 'অজানা তারিখ' : 'Unknown date';
    
    try {
      if (language === 'bn') {
        return formatBengaliDate(dateString);
      } else {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return language === 'bn' ? 'অজানা তারিখ' : 'Unknown date';
    }
  };

  // Event handlers
  const handleCreateNew = () => {
    setEditingArticle(null);
    setEditorMode('create');
    setCurrentView('editor');
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setEditorMode('edit');
    setCurrentView('editor');
  };

  const handleEditorSave = () => {
    setCurrentView('list');
    setEditingArticle(null);
  };

  const handleEditorCancel = () => {
    setCurrentView('list');
    setEditingArticle(null);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setEditingArticle(null);
  };

  const handleDelete = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      deleteMutation.mutate(articleToDelete.id);
    }
  };

  const handleStatusToggle = (article: Article) => {
    const currentStatus = article.status === 'published' || article.is_published === true;
    statusToggleMutation.mutate({ 
      id: article.id, 
      currentStatus: currentStatus || false
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (type: 'category' | 'status', value: string) => {
    if (type === 'category') {
      setSelectedCategory(value);
    } else {
      setSelectedStatus(value);
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Statistics calculation with corrected data structure
  const stats = (articlesData as any)?.data ? {
    total: (articlesData as any).count || (articlesData as any).data.length,
    published: (articlesData as any).data.filter((a: any) => a.status === 'published' || a.is_published === true).length,
    drafts: (articlesData as any).data.filter((a: any) => a.status !== 'published' && a.is_published !== true).length,
    featured: (articlesData as any).data.filter((a: any) => a.is_featured === true).length
  } : { total: 0, published: 0, drafts: 0, featured: 0 };

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentView === 'editor' && (
              <Button 
                variant="ghost" 
                onClick={handleBackToList}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentLanguage === 'bn' ? 'তালিকায় ফিরুন' : 'Back to List'}
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {currentView === 'editor' 
                  ? (editorMode === 'create' ? (currentLanguage === 'bn' ? 'নতুন নিবন্ধ তৈরি করুন' : 'Create New Article') : (currentLanguage === 'bn' ? 'নিবন্ধ সম্পাদনা করুন' : 'Edit Article'))
                  : t.title
                }
              </h1>
              <p className="text-muted-foreground">
                {currentView === 'editor' 
                  ? (currentLanguage === 'bn' ? 'নিবন্ধের বিস্তারিত তথ্য পূরণ করুন' : 'Fill in the article details')
                  : t.subtitle
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={currentLanguage} onValueChange={(value: 'bn' | 'en') => setCurrentLanguage(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bn">বাংলা</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            {currentView === 'list' && (
              <Button onClick={handleCreateNew} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                {t.createNew}
              </Button>
            )}
          </div>
        </div>

        {/* Conditional Content Based on Current View */}
        {currentView === 'editor' ? (
          <ContentEditor
            article={editingArticle}
            mode={editorMode}
            onSave={handleEditorSave}
            onCancel={handleEditorCancel}
          />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">{t.totalArticles}</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">{t.publishedArticles}</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.published}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">{t.draftArticles}</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.drafts}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">{t.featuredArticles}</CardTitle>
                  <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.featured}</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {currentLanguage === 'bn' ? 'অনুসন্ধান ও ফিল্টার' : 'Search & Filters'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={t.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <Select value={selectedCategory} onValueChange={(value) => handleFilterChange('category', value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={t.allCategories} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allCategories}</SelectItem>
                        {categories?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={t.allStatus} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allStatus}</SelectItem>
                        <SelectItem value="published">{t.published}</SelectItem>
                        <SelectItem value="draft">{t.draft}</SelectItem>
                        <SelectItem value="featured">{t.featured}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={() => refetch()}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                      {currentLanguage === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Articles Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {currentLanguage === 'bn' ? 'নিবন্ধ তালিকা' : 'Articles List'}
                  </span>
                  {(articlesData as any)?.count && (
                    <Badge variant="secondary">
                      {currentLanguage === 'bn' ? 'মোট' : 'Total'}: {(articlesData as any).count}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">{t.loading}</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">
                    {currentLanguage === 'bn' ? 'ডেটা লোড করতে ব্যর্থ' : 'Failed to load data'}
                  </div>
                ) : (articlesData as any)?.data?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t.noArticles}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.title_col}</TableHead>
                          <TableHead>{t.category_col}</TableHead>
                          <TableHead>{t.status_col}</TableHead>
                          <TableHead>{t.published_col}</TableHead>
                          <TableHead>{t.views_col}</TableHead>
                          <TableHead className="text-right">{t.actions_col}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(articlesData as any)?.data?.map((article: Article) => (
                          <TableRow key={article.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {article.is_featured && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                )}
                                <span className="truncate max-w-md">{article.title}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {article.category?.name || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary"
                                className={
                                  (article.status === 'published' || article.is_published === true) 
                                    ? "bg-green-100 text-green-800 border-green-200" 
                                    : "bg-orange-100 text-orange-800 border-orange-200"
                                }
                              >
                                {(article.status === 'published' || article.is_published === true) ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {(article.status === 'published' || article.is_published === true) ? t.published : t.draft}
                                {/* Debug info to help you verify status values */}
                                <span className="ml-1 text-xs opacity-60" title={`status: ${article.status}, is_published: ${article.is_published}`}>
                                  📋
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {formatArticleDate(article.published_at || article.created_at, currentLanguage)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span>{article.view_count || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>
                                    {currentLanguage === 'bn' ? 'কার্যক্রম' : 'Actions'}
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(article)}
                                    className="flex items-center gap-2"
                                  >
                                    <Edit className="h-4 w-4" />
                                    {t.edit}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusToggle(article)}
                                    className="flex items-center gap-2 text-blue-600"
                                  >
                                    {(article.status === 'published' || article.is_published) ? (
                                      <Clock className="h-4 w-4" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                    {(article.status === 'published' || article.is_published) ? 
                                      (currentLanguage === 'bn' ? 'খসড়ায় পরিবর্তন' : 'Change to Draft') : 
                                      (currentLanguage === 'bn' ? 'প্রকাশ করুন' : 'Publish')
                                    }
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(article)}
                                    className="flex items-center gap-2 text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {t.delete}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {(articlesData as any)?.totalPages && (articlesData as any).totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  {currentLanguage === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                </Button>
                <span className="flex items-center px-4">
                  {currentPage} / {(articlesData as any).totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === (articlesData as any).totalPages}
                  onClick={() => setCurrentPage(prev => Math.min((articlesData as any).totalPages || 1, prev + 1))}
                >
                  {currentLanguage === 'bn' ? 'পরবর্তী' : 'Next'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirmDeleteDesc}
              {articleToDelete && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>{articleToDelete.title}</strong>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EnhancedAdminLayout>
  );
}