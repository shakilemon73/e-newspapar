import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Eye, 
  Clock, 
  Image as ImageIcon, 
  Tag, 
  Calendar,
  TrendingUp,
  Users,
  Upload,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

const articleFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(5, 'Slug must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  excerpt: z.string().optional(),
  imageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  categoryId: z.coerce.number(),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  article?: any;
  mode: 'create' | 'edit';
}

export function ContentEditor({ isOpen, onClose, article, mode }: ContentEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('content');
  const [imagePreview, setImagePreview] = useState(article?.imageUrl || '');
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [newTag, setNewTag] = useState('');

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article?.title || '',
      slug: article?.slug || '',
      content: article?.content || '',
      excerpt: article?.excerpt || '',
      imageUrl: article?.imageUrl || '',
      categoryId: article?.categoryId || 0,
      isFeatured: article?.isFeatured || false,
      publishedAt: article?.publishedAt || new Date().toISOString().split('T')[0],
      tags: article?.tags || [],
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Create/Update mutations
  const saveMutation = useMutation({
    mutationFn: async (data: ArticleFormValues) => {
      const endpoint = mode === 'create' 
        ? '/api/articles' 
        : `/api/articles/${article.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const res = await apiRequest(method, endpoint, { ...data, tags });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${mode} article`);
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `Article ${mode === 'create' ? 'created' : 'updated'}`,
        description: `The article has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      onClose();
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

  const onSubmit = (data: ArticleFormValues) => {
    saveMutation.mutate({ ...data, tags });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\sঀ-৻ড়ঢ়য়]/g, '')
      .replace(/\s+/g, '-');
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUrlChange = (url: string) => {
    setImagePreview(url);
    form.setValue('imageUrl', url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? 'Create New Article' : 'Edit Article'}
            <Badge variant="outline" className="ml-auto">
              {mode === 'create' ? 'Draft' : 'Editing'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full overflow-y-auto">
              <TabsContent value="content" className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Article title in Bengali"
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
                          <Input placeholder="article-slug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief summary of the article..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your article content here..."
                          className="min-h-[300px] font-bengali"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="media" className="space-y-4 p-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleImageUrlChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {imagePreview && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Image Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={imagePreview}
                        alt="Article preview"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={() => setImagePreview('')}
                      />
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Recommended size: 1200x630 pixels</li>
                      <li>Supported formats: JPG, PNG, WebP</li>
                      <li>Maximum file size: 2MB</li>
                      <li>Use high-quality images for better engagement</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value?.toString()}
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
                    name="publishedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Publish Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Article</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          This article will appear in the featured section
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 p-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      SEO Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="font-medium">Title Length</p>
                        <p className="text-muted-foreground">
                          {form.watch('title')?.length || 0}/60 characters
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Excerpt Length</p>
                        <p className="text-muted-foreground">
                          {form.watch('excerpt')?.length || 0}/160 characters
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Content Words</p>
                        <p className="text-muted-foreground">
                          {form.watch('content')?.split(' ').length || 0} words
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-medium text-sm">SEO Checklist:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${(form.watch('title')?.length || 0) >= 30 ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span>Title is descriptive (30+ characters)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${form.watch('excerpt') ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span>Has excerpt/meta description</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${form.watch('imageUrl') ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span>Has featured image</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${(form.watch('content')?.split(' ').length || 0) >= 300 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <span>Content length (300+ words recommended)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <DialogFooter className="p-4 border-t">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Auto-saved 2 minutes ago</span>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saveMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {saveMutation.isPending ? 'Saving...' : (mode === 'create' ? 'Create Article' : 'Update Article')}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}