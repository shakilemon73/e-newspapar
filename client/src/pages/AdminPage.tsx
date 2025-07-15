import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Form validation schema
const articleFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(5, 'Slug must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  excerpt: z.string().optional(),
  imageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  categoryId: z.coerce.number(),
  isFeatured: z.boolean().default(false),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

export default function AdminPage() {
  const { user } = useSupabaseAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openFormDialog, setOpenFormDialog] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch articles
  const {
    data: articles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/articles'],
    enabled: !!user,
  });

  // Fetch categories for the form dropdown
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    enabled: !!user,
  });

  // Form setup
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      imageUrl: '',
      categoryId: 0,
      isFeatured: false,
    },
  });

  // Create article mutation
  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormValues) => {
      const res = await apiRequest('POST', '/api/articles', data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create article');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Article created',
        description: 'The article has been created successfully.',
      });
      setOpenFormDialog(false);
      form.reset();
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

  // Update article mutation
  const updateArticleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ArticleFormValues }) => {
      const res = await apiRequest('PUT', `/api/articles/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update article');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Article updated',
        description: 'The article has been updated successfully.',
      });
      setOpenFormDialog(false);
      form.reset();
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

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/articles/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete article');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Article deleted',
        description: 'The article has been deleted successfully.',
      });
      setIsDeleteDialogOpen(false);
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

  // Handle form submission
  const onSubmit = (data: ArticleFormValues) => {
    if (isEditMode && selectedArticleId) {
      updateArticleMutation.mutate({ id: selectedArticleId, data });
    } else {
      createArticleMutation.mutate(data);
    }
  };

  // Open edit form with article data
  const handleEditArticle = (article: any) => {
    setIsEditMode(true);
    setSelectedArticleId(article.id);
    
    form.reset({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt || '',
      imageUrl: article.imageUrl || '',
      categoryId: article.categoryId.toString(),
      isFeatured: article.isFeatured || false,
    });
    
    setOpenFormDialog(true);
  };

  // Open create form
  const handleCreateArticle = () => {
    setIsEditMode(false);
    setSelectedArticleId(null);
    form.reset({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      imageUrl: '',
      categoryId: 0,
      isFeatured: false,
    });
    setOpenFormDialog(true);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (id: number) => {
    setSelectedArticleId(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm article deletion
  const confirmDelete = () => {
    if (selectedArticleId) {
      deleteArticleMutation.mutate(selectedArticleId);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\sঀ-৻ড়ঢ়য়]/g, '')
      .replace(/\s+/g, '-');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-destructive">Error loading articles</h1>
        <p>Please try again later.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/articles'] })}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Article Management</CardTitle>
          <CardDescription>Manage your newspaper articles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={handleCreateArticle} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Article
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles && Array.isArray(articles) && articles.map((article: any) => (
                <TableRow key={article.id}>
                  <TableCell>{article.id}</TableCell>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.category?.name}</TableCell>
                  <TableCell>{article.isFeatured ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{new Date(article.publishedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{article.view_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditArticle(article)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOpenDeleteDialog(article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Article Form Dialog */}
      <Dialog open={openFormDialog} onOpenChange={setOpenFormDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Article' : 'Create New Article'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Article title"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!isEditMode) {
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
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="article-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories && Array.isArray(categories) && categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Article content..."
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Short excerpt of the article..."
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
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Article</FormLabel>
                      <CardDescription>
                        Featured articles appear in the homepage carousel
                      </CardDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
                >
                  {(createArticleMutation.isPending || updateArticleMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? 'Update Article' : 'Create Article'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this article? This action cannot be undone.</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteArticleMutation.isPending}
            >
              {deleteArticleMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}