import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { EnhancedAdminLayout } from './EnhancedAdminLayout';
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
import { staticApiRequest, staticQueryClient } from '@/lib/static-queryClient-updated';
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

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ArticleStats {
  totalArticles: number;
  featuredArticles: number;
  totalViews: number;
  publishedToday: number;
  avgViewsPerArticle: number;
  growthRate: number;
}

export function EnhancedArticlesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch articles with enhanced filtering
  const { data: articles, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/articles', searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Calculate enhanced statistics
  const stats: ArticleStats = {
    totalArticles: articles?.length || 0,
    featuredArticles: articles?.filter((a: Article) => a.isFeatured).length || 0,
    totalViews: articles?.reduce((sum: number, a: Article) => sum + (a.viewCount || 0), 0) || 0,
    publishedToday: articles?.filter((a: Article) => {
      const publishDate = new Date(a.publishedAt);
      const today = new Date();
      return publishDate.toDateString() === today.toDateString();
    }).length || 0,
    avgViewsPerArticle: articles?.length ? Math.round((articles.reduce((sum: number, a: Article) => sum + (a.viewCount || 0), 0) / articles.length)) : 0,
    growthRate: 15.2 // This would come from API in real implementation
  };

  // Pagination logic
  const totalPages = Math.ceil((articles?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = articles?.slice(startIndex, endIndex) || [];

  // Toggle featured status
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: number; isFeatured: boolean }) => {
      return apiRequest(`/api/articles/${id}`, {
        method: 'PUT',
        body: { isFeatured: !isFeatured }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: 'Success',
        description: 'Article status updated successfully',
      });
    },
  });

  // Delete article
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/articles/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: 'Success',
        description: 'Article deleted successfully',
      });
    },
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusBadge = (article: Article) => {
    const isPublished = new Date(article.publishedAt) <= new Date();
    const isRecent = new Date(article.publishedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    if (!isPublished) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Scheduled</Badge>;
    }
    if (isRecent) {
      return <Badge variant="default" className="bg-green-100 text-green-700">New</Badge>;
    }
    return <Badge variant="outline">Published</Badge>;
  };

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3">Article Management</h1>
              <p className="text-blue-100 text-lg">
                Create, manage, and optimize your Bengali news articles with advanced UX design
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <Badge variant="default" className="bg-blue-600 text-white">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{stats.growthRate}%
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                Total Articles
              </h3>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {stats.totalArticles}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <Badge variant="default" className="bg-green-600 text-white">
                  Featured
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                Featured Articles
              </h3>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {stats.featuredArticles}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <Badge variant="default" className="bg-purple-600 text-white">
                  {stats.avgViewsPerArticle} avg
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                Total Views
              </h3>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {stats.totalViews.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <Badge variant="default" className="bg-orange-600 text-white">
                  Today
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                Published Today
              </h3>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {stats.publishedToday}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters and Controls */}
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
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
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
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Articles Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Articles ({articles?.length || 0})</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  Page {currentPage} of {totalPages}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading articles: {error.message}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('title')}
                          className="font-medium"
                        >
                          Title
                          {sortBy === 'title' && (
                            sortOrder === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('viewCount')}
                          className="font-medium"
                        >
                          Views
                          {sortBy === 'viewCount' && (
                            sortOrder === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('publishedAt')}
                          className="font-medium"
                        >
                          Published
                          {sortBy === 'publishedAt' && (
                            sortOrder === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentArticles.map((article: Article) => (
                      <TableRow key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell className="font-medium">{article.id}</TableCell>
                        <TableCell>
                          <div className="max-w-[300px]">
                            <div className="font-medium truncate">{article.title}</div>
                            <div className="text-sm text-gray-500 truncate">{article.excerpt}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{article.category?.name || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(article)}
                            {article.isFeatured && (
                              <Badge variant="default" className="bg-yellow-100 text-yellow-700">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span>{article.viewCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DateFormatter date={article.publishedAt} type="relative" />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleFeaturedMutation.mutate({ id: article.id, isFeatured: article.isFeatured })}
                              >
                                <Star className="mr-2 h-4 w-4" />
                                {article.isFeatured ? 'Remove Featured' : 'Make Featured'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Globe className="mr-2 h-4 w-4" />
                                View on Site
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => deleteArticleMutation.mutate(article.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, articles?.length || 0)} of {articles?.length || 0} articles
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </EnhancedAdminLayout>
  );
}