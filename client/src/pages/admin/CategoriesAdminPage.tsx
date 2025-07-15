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
import { 
  Plus, 
  Loader2, 
  Tag, 
  FileText,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
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

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const categoryColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { 
    key: 'name', 
    label: 'Name', 
    sortable: true,
    render: (value: string) => (
      <div className="font-medium">{value}</div>
    )
  },
  { 
    key: 'slug', 
    label: 'Slug', 
    sortable: true,
    render: (value: string) => (
      <Badge variant="outline">{value}</Badge>
    )
  },
  { 
    key: 'articleCount', 
    label: 'Articles', 
    sortable: true,
    render: (value: number) => (
      <div className="flex items-center gap-1">
        <FileText className="h-3 w-3 text-muted-foreground" />
        {value || 0}
      </div>
    )
  },
];

export default function CategoriesAdminPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  // Fetch categories
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Fetch articles to count per category
  const { data: articles } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
  });

  // Prepare data with article counts
  const categoriesWithCounts = categories?.map((category: any) => ({
    ...category,
    articleCount: articles?.filter((article: any) => article.categoryId === category.id).length || 0
  })) || [];

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const endpoint = mode === 'create' 
        ? '/api/categories' 
        : `/api/categories/${selectedCategory.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const res = await apiRequest(method, endpoint, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${mode} category`);
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `Category ${mode === 'create' ? 'created' : 'updated'}`,
        description: `The category has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      setDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
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
      const res = await apiRequest('DELETE', `/api/categories/${id}`);
      if (!res.ok) throw new Error('Failed to delete category');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Category deleted',
        description: 'The category has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setMode('create');
    form.reset();
    setDialogOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setMode('edit');
    form.setValue('name', category.name);
    form.setValue('slug', category.slug);
    setDialogOpen(true);
  };

  const handleDeleteCategory = (category: any) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const onSubmit = (data: CategoryFormValues) => {
    saveMutation.mutate(data);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\sঀ-৻ড়ঢ়য়]/g, '')
      .replace(/\s+/g, '-');
  };

  if (error) {
    return (
      <WebsiteAdminLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading Categories
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {error.message || 'An error occurred while loading categories'}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Categories Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage article categories
            </p>
          </div>
          <Button onClick={handleCreateCategory} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Category
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Categorized articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Used</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categoriesWithCounts.length > 0 
                  ? categoriesWithCounts.sort((a, b) => b.articleCount - a.articleCount)[0]?.name?.slice(0, 8) + '...'
                  : 'None'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Most articles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>
              Manage and organize your article categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <DataTable
                data={categoriesWithCounts}
                columns={categoryColumns}
                searchPlaceholder="Search categories..."
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                loading={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Category Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {mode === 'create' ? 'Create New Category' : 'Edit Category'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter category name"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (mode === 'create') {
                              form.setValue('slug', generateSlug(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug *</FormLabel>
                      <FormControl>
                        <Input placeholder="category-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      mode === 'create' ? 'Create Category' : 'Update Category'
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
                This action cannot be undone. This will permanently delete the category
                "{categoryToDelete?.name}" and may affect articles using this category.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => categoryToDelete && deleteMutation.mutate(categoryToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Category
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </WebsiteAdminLayout>
  );
}