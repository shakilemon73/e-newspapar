import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Eye, 
  Image as ImageIcon, 
  Calendar,
  X,
  Loader2,
  FileText,
  Settings,
  Check,
  AlertCircle,
  Globe,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createArticle, updateArticle, getAdminCategories } from '@/lib/admin-api-direct';
import { queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

const articleFormSchema = z.object({
  title: z.string().min(5, 'শিরোনাম অবশ্যই ৫টি অক্ষরের বেশি হতে হবে').max(200, 'শিরোনাম ২০০ অক্ষরের বেশি হতে পারবে না'),
  slug: z.string().min(5, 'স্লাগ অবশ্যই ৫টি অক্ষরের বেশি হতে হবে').max(100, 'স্লাগ ১০০ অক্ষরের বেশি হতে পারবে না'),
  content: z.string().min(20, 'কন্টেন্ট অবশ্যই ২০টি অক্ষরের বেশি হতে হবে'),
  excerpt: z.string().max(500, 'সারাংশ ৫০০ অক্ষরের বেশি হতে পারবে না').optional(),
  image_url: z.string().url('অনুগ্রহ করে একটি বৈধ URL দিন').optional().or(z.literal('')),
  category_id: z.coerce.number().min(1, 'অনুগ্রহ করে একটি বিভাগ নির্বাচন করুন'),
  is_featured: z.boolean().optional().default(false),
  is_published: z.boolean().optional().default(true),
  published_at: z.string().optional()
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ImprovedContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  article?: any;
  mode: 'create' | 'edit';
}

export function ImprovedContentEditor({ isOpen, onClose, article, mode }: ImprovedContentEditorProps) {
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<'bn' | 'en'>('bn');
  const [activeTab, setActiveTab] = useState('content');
  const [wordCount, setWordCount] = useState(0);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article?.title || '',
      slug: article?.slug || '',
      content: article?.content || '',
      excerpt: article?.excerpt || '',
      image_url: article?.image_url || '',
      category_id: article?.category_id || 1,
      is_featured: article?.is_featured ?? false,
      is_published: article?.is_published ?? true,
      published_at: article?.published_at ? new Date(article.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    },
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: getAdminCategories,
  });

  // Create/Update mutations
  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      toast({
        title: currentLanguage === 'bn' ? "নিবন্ধ তৈরি হয়েছে" : "Article Created",
        description: currentLanguage === 'bn' ? "নিবন্ধটি সফলভাবে তৈরি হয়েছে" : "The article has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: currentLanguage === 'bn' ? "ত্রুটি" : "Error",
        description: error.message || (currentLanguage === 'bn' ? "নিবন্ধ তৈরি করতে ব্যর্থ" : "Failed to create article"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) => updateArticle(id, updates),
    onSuccess: () => {
      toast({
        title: currentLanguage === 'bn' ? "নিবন্ধ আপডেট হয়েছে" : "Article Updated",
        description: currentLanguage === 'bn' ? "নিবন্ধটি সফলভাবে আপডেট হয়েছে" : "The article has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: currentLanguage === 'bn' ? "ত্রুটি" : "Error",
        description: error.message || (currentLanguage === 'bn' ? "নিবন্ধ আপডেট করতে ব্যর্থ" : "Failed to update article"),
        variant: "destructive",
      });
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && value.title) {
        const slug = value.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 100);
        form.setValue('slug', slug);
      }
      
      if (name === 'content' && value.content) {
        const words = value.content.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (values: ArticleFormValues) => {
    if (mode === 'create') {
      createMutation.mutate({
        title: values.title,
        content: values.content,
        excerpt: values.excerpt,
        category_id: values.category_id,
        image_url: values.image_url,
        is_featured: values.is_featured,
        is_published: values.is_published,
        published_at: values.published_at,
        slug: values.slug
      });
    } else if (article?.id) {
      updateMutation.mutate({
        id: article.id,
        updates: {
          title: values.title,
          slug: values.slug,
          content: values.content,
          excerpt: values.excerpt,
          image_url: values.image_url,
          category_id: values.category_id,
          is_featured: values.is_featured,
          is_published: values.is_published,
          published_at: values.published_at
        }
      });
    }
  };

  const texts = {
    bn: {
      title: mode === 'create' ? 'নতুন নিবন্ধ তৈরি করুন' : 'নিবন্ধ সম্পাদনা করুন',
      content: 'কন্টেন্ট',
      settings: 'সেটিংস',
      preview: 'প্রিভিউ',
      articleTitle: 'নিবন্ধের শিরোনাম',
      titlePlaceholder: 'আপনার নিবন্ধের শিরোনাম লিখুন...',
      slug: 'স্লাগ (URL)',
      slugDesc: 'এটি আপনার নিবন্ধের URL এ ব্যবহৃত হবে',
      contentLabel: 'নিবন্ধের বিষয়বস্তু',
      contentPlaceholder: 'আপনার নিবন্ধের বিষয়বস্তু লিখুন...',
      excerpt: 'সারাংশ',
      excerptPlaceholder: 'নিবন্ধের সংক্ষিপ্ত সারাংশ...',
      featuredImage: 'ফিচার ছবি',
      imagePlaceholder: 'ছবির URL লিখুন...',
      category: 'বিভাগ',
      selectCategory: 'বিভাগ নির্বাচন করুন',
      featured: 'বৈশিষ্ট্যযুক্ত নিবন্ধ',
      featuredDesc: 'এই নিবন্ধটি হোমপেজে প্রদর্শিত হবে',
      publishDate: 'প্রকাশের তারিখ',
      save: 'সংরক্ষণ করুন',
      cancel: 'বাতিল',
      wordCount: 'শব্দ সংখ্যা',
      estimatedReadTime: 'আনুমানিক পড়ার সময়'
    },
    en: {
      title: mode === 'create' ? 'Create New Article' : 'Edit Article',
      content: 'Content',
      settings: 'Settings',
      preview: 'Preview',
      articleTitle: 'Article Title',
      titlePlaceholder: 'Enter your article title...',
      slug: 'Slug (URL)',
      slugDesc: 'This will be used in your article URL',
      contentLabel: 'Article Content',
      contentPlaceholder: 'Write your article content...',
      excerpt: 'Excerpt',
      excerptPlaceholder: 'Brief summary of the article...',
      featuredImage: 'Featured Image',
      imagePlaceholder: 'Enter image URL...',
      category: 'Category',
      selectCategory: 'Select category',
      featured: 'Featured Article',
      featuredDesc: 'This article will appear on homepage',
      publishDate: 'Publish Date',
      save: 'Save Article',
      cancel: 'Cancel',
      wordCount: 'Word Count',
      estimatedReadTime: 'Estimated Read Time'
    }
  };

  const t = texts[currentLanguage];
  const readTime = Math.ceil(wordCount / 200);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{t.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentLanguage(currentLanguage === 'bn' ? 'en' : 'bn')}
              >
                {currentLanguage === 'bn' ? 'English' : 'বাংলা'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t.content}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t.settings}
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t.preview}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6 mt-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">{t.articleTitle}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.titlePlaceholder}
                            {...field}
                            className="text-lg p-4 h-12 border-2 focus:border-blue-500"
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
                        <FormLabel>{t.slug}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="article-slug"
                            {...field}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>{t.slugDesc}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">{t.contentLabel}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.contentPlaceholder}
                            {...field}
                            className="min-h-[400px] text-base leading-relaxed border-2 focus:border-blue-500 resize-none"
                          />
                        </FormControl>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{t.wordCount}: {wordCount}</span>
                          <span>{t.estimatedReadTime}: {readTime} {currentLanguage === 'bn' ? 'মিনিট' : 'minutes'}</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.excerpt}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.excerptPlaceholder}
                            {...field}
                            rows={3}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          {t.featuredImage}
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Input
                              placeholder={t.imagePlaceholder}
                              {...field}
                            />
                            {field.value && (
                              <div className="border rounded-lg p-2">
                                <img
                                  src={field.value}
                                  alt="Preview"
                                  className="max-w-full h-32 object-cover rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.category}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t.selectCategory} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
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
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">
                            {t.featured}
                          </FormLabel>
                          <FormDescription>
                            {t.featuredDesc}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">
                            {currentLanguage === 'bn' ? 'প্রকাশিত নিবন্ধ' : 'Published Article'}
                          </FormLabel>
                          <FormDescription>
                            {currentLanguage === 'bn' 
                              ? 'এই নিবন্ধটি সাইটে প্রকাশিত হবে'
                              : 'This article will be published on the site'
                            }
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="published_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t.publishDate}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      {currentLanguage === 'bn' ? 'নিবন্ধের প্রিভিউ' : 'Article Preview'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">
                        {form.watch('title') || t.titlePlaceholder}
                      </h1>
                      {form.watch('excerpt') && (
                        <p className="text-muted-foreground text-lg mb-4">
                          {form.watch('excerpt')}
                        </p>
                      )}
                      {form.watch('image_url') && (
                        <img
                          src={form.watch('image_url')}
                          alt="Featured"
                          className="w-full max-w-2xl h-64 object-cover rounded-lg mb-4"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap">
                          {form.watch('content') || t.contentPlaceholder}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {wordCount} {currentLanguage === 'bn' ? 'শব্দ' : 'words'}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {readTime} {currentLanguage === 'bn' ? 'মিনিট পড়া' : 'min read'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {currentLanguage === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t.save}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}