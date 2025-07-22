import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { EnhancedAdminLayout } from "@/components/admin/EnhancedAdminLayout";
import { getAdminArticles, createArticle, updateArticle, deleteArticle, getAdminCategories } from '@/lib/admin-api-direct';
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Download,
  Upload,
  Save,
  X,
  FileText,
  Calendar,
  User,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  Image,
  Link,
  ArrowUpRight,
  RefreshCw,
  MoreVertical,
  Heart,
  MessageSquare,
  Share2
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  categoryId: number;
  publishDate: string;
  lastModified: string;
  status: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  isBreaking: boolean;
  viewCount: number;
  imageUrl?: string;
  tags: string[];
  readTime: number;
  priority: 'high' | 'medium' | 'low';
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function EnhancedArticlesAdminPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, loading } = useSupabaseAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [bulkSelected, setBulkSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categoryId: '',
    author: '',
    isFeatured: false,
    isBreaking: false,
    status: 'draft' as const,
    priority: 'medium' as const,
    imageUrl: '',
    tags: [] as string[],
    readTime: 5
  });

  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => getAdminArticles(),
    refetchInterval: 30000
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => getAdminCategories()
  });

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => Promise.resolve({
      totalArticles: articles?.length || 0,
      totalViews: 12500,
      avgReadTime: 4.5
    })
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createArticle(data),
    onSuccess: () => {
      toast({
        title: t('success', 'Success', 'সফল'),
        description: t('article-created', 'Article created successfully', 'নিবন্ধ সফলভাবে তৈরি হয়েছে')
      });
      setShowCreateForm(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Article creation error:', error);
      toast({
        title: t('error', 'Error', 'ত্রুটি'),
        description: error.message || t('create-failed', 'Failed to create article', 'নিবন্ধ তৈরি করতে ব্যর্থ'),
        variant: 'destructive'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateArticle(editingArticle?.id!, data),
    onSuccess: () => {
      toast({
        title: t('success', 'Success', 'সফল'),
        description: t('article-updated', 'Article updated successfully', 'নিবন্ধ সফলভাবে আপডেট হয়েছে')
      });
      setEditingArticle(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteArticle(id),
    onSuccess: () => {
      toast({
        title: t('success', 'Success', 'সফল'),
        description: t('article-deleted', 'Article deleted successfully', 'নিবন্ধ সফলভাবে মুছে ফেলা হয়েছে')
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      categoryId: '',
      author: '',
      isFeatured: false,
      isBreaking: false,
      status: 'draft',
      priority: 'medium',
      imageUrl: '',
      tags: [],
      readTime: 5
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.content || !formData.categoryId || !formData.author) {
      toast({
        title: t('error', 'Error', 'ত্রুটি'),
        description: 'Please fill in all required fields (Title, Author, Content, Category)',
        variant: 'destructive'
      });
      return;
    }
    
    // Transform form data for API
    const apiData = {
      title: formData.title.trim(),
      slug: formData.title.toLowerCase().trim().replace(/[^a-z0-9\u0985-\u09FF]+/g, '-'), // Generate slug from title
      content: formData.content.trim(),
      excerpt: formData.excerpt?.trim() || '',
      imageUrl: formData.imageUrl?.trim() || '',
      categoryId: parseInt(formData.categoryId),
      author: formData.author.trim() || 'Admin',
      isFeatured: formData.isFeatured,
      readTime: formData.readTime || 5,
      publishedAt: new Date().toISOString()
    };
    
    console.log('Submitting article data:', apiData);
    
    if (editingArticle) {
      updateMutation.mutate(apiData);
    } else {
      createMutation.mutate(apiData);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      categoryId: article.categoryId.toString(),
      author: article.author || 'Admin',
      isFeatured: article.isFeatured,
      isBreaking: article.isBreaking,
      status: article.status,
      priority: article.priority,
      imageUrl: article.imageUrl || '',
      tags: article.tags || [],
      readTime: article.readTime || 5
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm(t('confirm-delete', 'Are you sure you want to delete this article?', 'আপনি কি নিশ্চিত যে এই নিবন্ধটি মুছতে চান?'))) {
      deleteMutation.mutate(id);
    }
  };

  const filteredArticles = articles?.filter((article: Article) => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.categoryId?.toString() === selectedCategory;
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const ArticleCard = ({ article }: { article: Article }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                {article.status}
              </Badge>
              {article.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
              {article.isBreaking && <Badge variant="destructive">Breaking</Badge>}
            </div>
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {typeof article.category === 'object' ? article.category?.name : article.category} • {article.author || 'Admin'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(article)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(article.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime || 5}min
            </span>
          </div>
          <span>{article.publishDate ? new Date(article.publishDate).toLocaleDateString() : 'Draft'}</span>
        </div>
      </CardContent>
    </Card>
  );

  const ArticleStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('total-articles', 'Total Articles', 'মোট নিবন্ধ')}</p>
              <p className="text-2xl font-bold">{articles?.length || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('published', 'Published', 'প্রকাশিত')}</p>
              <p className="text-2xl font-bold">
                {articles?.filter((a: Article) => a.status === 'published').length || 0}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('drafts', 'Drafts', 'খসড়া')}</p>
              <p className="text-2xl font-bold">
                {articles?.filter((a: Article) => a.status === 'draft').length || 0}
              </p>
            </div>
            <Edit3 className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('total-views', 'Total Views', 'মোট দর্শন')}</p>
              <p className="text-2xl font-bold">
                {articles?.reduce((sum: number, a: Article) => sum + (a.viewCount || 0), 0) || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (articlesLoading) {
    return (
      <EnhancedAdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('articles-management', 'Articles Management', 'নিবন্ধ ব্যবস্থাপনা')}
            </h1>
            <p className="text-muted-foreground">
              {t('manage-articles-desc', 'Create, edit, and manage your news articles', 'আপনার সংবাদ নিবন্ধ তৈরি, সম্পাদনা এবং পরিচালনা করুন')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/articles'] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('refresh', 'Refresh', 'রিফ্রেশ')}
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('create-article', 'Create Article', 'নিবন্ধ তৈরি করুন')}
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <ArticleStats />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t('filters', 'Filters', 'ফিল্টার')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('search-articles', 'Search articles...', 'নিবন্ধ খুঁজুন...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('select-category', 'Select Category', 'বিভাগ নির্বাচন করুন')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all-categories', 'All Categories', 'সব বিভাগ')}</SelectItem>
                  {categories?.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('select-status', 'Select Status', 'অবস্থা নির্বাচন করুন')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all-status', 'All Status', 'সব অবস্থা')}</SelectItem>
                  <SelectItem value="published">{t('published', 'Published', 'প্রকাশিত')}</SelectItem>
                  <SelectItem value="draft">{t('draft', 'Draft', 'খসড়া')}</SelectItem>
                  <SelectItem value="archived">{t('archived', 'Archived', 'আর্কাইভ')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredArticles.map((article: Article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('no-articles', 'No Articles Found', 'কোনো নিবন্ধ পাওয়া যায়নি')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('no-articles-desc', 'Start by creating your first article', 'আপনার প্রথম নিবন্ধ তৈরি করে শুরু করুন')}
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('create-first-article', 'Create First Article', 'প্রথম নিবন্ধ তৈরি করুন')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {editingArticle 
                      ? t('edit-article', 'Edit Article', 'নিবন্ধ সম্পাদনা করুন')
                      : t('create-article', 'Create Article', 'নিবন্ধ তৈরি করুন')
                    }
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingArticle(null);
                      resetForm();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        {t('title', 'Title', 'শিরোনাম')} *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={t('enter-title', 'Enter article title', 'নিবন্ধের শিরোনাম প্রবেশ করুন')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author">
                        {t('author', 'Author', 'লেখক')} *
                      </Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                        placeholder={t('enter-author', 'Enter author name', 'লেখকের নাম প্রবেশ করুন')}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">
                        {t('category', 'Category', 'বিভাগ')} *
                      </Label>
                      <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select-category', 'Select Category', 'বিভাগ নির্বাচন করুন')} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="readTime">
                        {t('read-time', 'Read Time (minutes)', 'পড়ার সময় (মিনিট)')}
                      </Label>
                      <Input
                        id="readTime"
                        type="number"
                        value={formData.readTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 5 }))}
                        placeholder="5"
                        min="1"
                        max="60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">
                      {t('excerpt', 'Excerpt', 'নির্বাচিত অংশ')}
                    </Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder={t('enter-excerpt', 'Enter article excerpt', 'নিবন্ধের নির্বাচিত অংশ প্রবেশ করুন')}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">
                      {t('content', 'Content', 'কন্টেন্ট')} *
                    </Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder={t('enter-content', 'Enter article content', 'নিবন্ধের কন্টেন্ট প্রবেশ করুন')}
                      rows={8}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">
                        {t('status', 'Status', 'অবস্থা')}
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">{t('draft', 'Draft', 'খসড়া')}</SelectItem>
                          <SelectItem value="published">{t('published', 'Published', 'প্রকাশিত')}</SelectItem>
                          <SelectItem value="archived">{t('archived', 'Archived', 'আর্কাইভ')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">
                        {t('priority', 'Priority', 'অগ্রাধিকার')}
                      </Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{t('low', 'Low', 'কম')}</SelectItem>
                          <SelectItem value="medium">{t('medium', 'Medium', 'মধ্যম')}</SelectItem>
                          <SelectItem value="high">{t('high', 'High', 'উচ্চ')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">
                      {t('image-url', 'Image URL', 'ছবির URL')}
                    </Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder={t('enter-image-url', 'Enter image URL', 'ছবির URL প্রবেশ করুন')}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                      />
                      <Label htmlFor="featured">
                        {t('featured', 'Featured', 'বৈশিষ্ট্যযুক্ত')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="breaking"
                        checked={formData.isBreaking}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBreaking: checked }))}
                      />
                      <Label htmlFor="breaking">
                        {t('breaking-news', 'Breaking News', 'জরুরি সংবাদ')}
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1"
                    >
                      {(createMutation.isPending || updateMutation.isPending) ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          {t('saving', 'Saving...', 'সংরক্ষণ করা হচ্ছে...')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          {editingArticle 
                            ? t('update-article', 'Update Article', 'নিবন্ধ আপডেট করুন')
                            : t('create-article', 'Create Article', 'নিবন্ধ তৈরি করুন')
                          }
                        </div>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingArticle(null);
                        resetForm();
                      }}
                    >
                      {t('cancel', 'Cancel', 'বাতিল')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </EnhancedAdminLayout>
  );
}