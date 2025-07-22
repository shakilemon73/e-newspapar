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
  DialogFooter,
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  X,
  Check,
  AlertCircle,
  FileText,
  Settings,
  Zap,
  ChevronRight,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { staticApiRequest, staticQueryClient } from '@/lib/static-queryClient-updated';
import { FileUploadField } from './FileUploadField';

const articleFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title cannot exceed 200 characters'),
  slug: z.string().min(5, 'Slug must be at least 5 characters').max(100, 'Slug cannot exceed 100 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  excerpt: z.string().max(500, 'Excerpt cannot exceed 500 characters').optional(),
  imageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  categoryId: z.coerce.number().min(1, 'Please select a category'),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().optional()
  // tags: z.array(z.string()).optional(), // Removed - column doesn't exist in database
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
  const [currentStep, setCurrentStep] = useState(0);
  const [imagePreview, setImagePreview] = useState(article?.imageUrl || '');
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [showPreview, setShowPreview] = useState(false);

  const steps = [
    { 
      id: 'basics', 
      title: 'Article Basics', 
      description: 'Title and basic information',
      icon: FileText,
      required: true
    },
    { 
      id: 'content', 
      title: 'Content', 
      description: 'Article content and excerpt',
      icon: Eye,
      required: true
    },
    { 
      id: 'media', 
      title: 'Media', 
      description: 'Featured image and media',
      icon: ImageIcon,
      required: false
    },
    { 
      id: 'settings', 
      title: 'Settings', 
      description: 'Category and publication settings',
      icon: Settings,
      required: true
    },
    { 
      id: 'review', 
      title: 'Review & Publish', 
      description: 'Final review and SEO check',
      icon: Check,
      required: true
    }
  ];

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article?.title || '',
      slug: article?.slug || '',
      content: article?.content || '',
      excerpt: article?.excerpt || '',
      imageUrl: article?.imageUrl || '',
      categoryId: article?.categoryId || 1,
      isFeatured: article?.isFeatured || false,
      publishedAt: article?.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      tags: article?.tags || [],
    },
  });

  // Auto-save functionality
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (mode === 'create' && (values.title || values.content)) {
        setIsAutoSaving(true);
        // Simulate auto-save delay
        const timeout = setTimeout(() => {
          setIsAutoSaving(false);
        }, 1000);
        return () => clearTimeout(timeout);
      }
    });
    return () => subscription.unsubscribe();
  }, [mode]);

  // Step validation
  const validateStep = (stepIndex: number) => {
    const values = form.getValues();
    const errors = form.formState.errors;
    
    switch (stepIndex) {
      case 0: // Basics
        return !errors.title && !errors.slug && values.title && values.slug;
      case 1: // Content
        return !errors.content && values.content && values.content.length >= 20;
      case 2: // Media
        return true; // Optional step
      case 3: // Settings
        return !errors.categoryId && values.categoryId;
      case 4: // Review
        return Object.keys(errors).length === 0;
      default:
        return true;
    }
  };

  // Update completed steps when form is submitted or validated
  const updateCompletedSteps = () => {
    const newCompleted = new Set<number>();
    for (let i = 0; i < steps.length; i++) {
      if (validateStep(i)) {
        newCompleted.add(i);
      }
    }
    setCompletedSteps(newCompleted);
  };

  const canProceedToNext = () => {
    return validateStep(currentStep);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1 && canProceedToNext()) {
      setCurrentStep(currentStep + 1);
      updateCompletedSteps();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      updateCompletedSteps();
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    updateCompletedSteps();
  };

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
      
      // Prepare the data (tags removed for now as column doesn't exist in database)
      const payload = {
        ...data,
        // tags: tags, // Removed temporarily - column doesn't exist in database
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : new Date().toISOString()
      };
      
      console.log('Submitting article data:', payload);
      console.log('API endpoint:', method, endpoint);
      
      try {
        const res = await apiRequest(method, endpoint, payload);
        console.log('API response status:', res.status);
        const result = await res.json();
        console.log('API response data:', result);
        return result;
      } catch (error) {
        console.error('Article submission error:', error);
        console.error('Error details:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to save article');
      }
    },
    onSuccess: (data) => {
      toast({
        title: `Article ${mode === 'create' ? 'created' : 'updated'}`,
        description: `The article "${data.title}" has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      onClose();
      form.reset();
      // setTags([]); // Removed tags functionality temporarily
      setImagePreview('');
      staticQueryClient.invalidateQueries({ queryKey: ['/api/articles'] });
    },
    onError: (error: Error) => {
      console.error('Save mutation error:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${mode} article`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ArticleFormValues) => {
    saveMutation.mutate(data); // Removed tags parameter
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
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col">
        <DialogHeader className="border-b pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {mode === 'create' ? 'Create New Article' : 'Edit Article'}
                {isAutoSaving && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Auto-saving...
                  </div>
                )}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {steps[currentStep].description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              <Badge variant={mode === 'create' ? 'default' : 'secondary'} className="text-xs">
                {mode === 'create' ? 'Draft' : 'Editing'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = completedSteps.has(index);
              const isAccessible = index <= currentStep || isCompleted;
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => isAccessible && goToStep(index)}
                    disabled={!isAccessible}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : isCompleted 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                          : isAccessible
                            ? 'hover:bg-muted'
                            : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                          ? 'bg-primary-foreground text-primary' 
                          : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <StepIcon className="h-3 w-3" />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden md:block">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 0: Basics */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Article Basics</h3>
                    <p className="text-sm text-muted-foreground">
                      Let's start with the title and basic information for your article
                    </p>
                  </div>
                  
                  <Card className="p-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Article Title *</FormLabel>
                            <FormDescription>
                              Write a compelling title in Bengali that captures the essence of your article
                            </FormDescription>
                            <FormControl>
                              <Input
                                placeholder="আপনার আর্টিকেলের শিরোনাম লিখুন..."
                                className="h-12 text-lg"
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
                            <FormLabel className="text-base font-semibold">URL Slug *</FormLabel>
                            <FormDescription>
                              This will be part of your article's URL. Keep it short and descriptive
                            </FormDescription>
                            <FormControl>
                              <Input 
                                placeholder="article-slug" 
                                className="font-mono"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 1: Content */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Article Content</h3>
                    <p className="text-sm text-muted-foreground">
                      Write your article content and a brief excerpt
                    </p>
                  </div>

                  <Card className="p-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="excerpt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Article Excerpt</FormLabel>
                            <FormDescription>
                              Write a brief summary that will appear in article previews (optional)
                            </FormDescription>
                            <FormControl>
                              <Textarea
                                placeholder="সংক্ষেপে আর্টিকেলের বিষয়বস্তু লিখুন..."
                                className="min-h-[100px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <div className="text-sm text-muted-foreground">
                              {field.value?.length || 0}/500 characters
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Article Content *</FormLabel>
                            <FormDescription>
                              Write your full article content here. Use proper Bengali formatting
                            </FormDescription>
                            <FormControl>
                              <Textarea
                                placeholder="আপনার আর্টিকেলের সম্পূর্ণ বিষয়বস্তু এখানে লিখুন..."
                                className="min-h-[400px] font-bengali text-base leading-relaxed"
                                {...field}
                              />
                            </FormControl>
                            <div className="text-sm text-muted-foreground">
                              {field.value?.split(' ').length || 0} words
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 2: Media */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Media & Images</h3>
                    <p className="text-sm text-muted-foreground">
                      Add a featured image and other media to enhance your article
                    </p>
                  </div>

                  <Card className="p-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <FileUploadField
                                label="Featured Image"
                                description="Add a compelling image that represents your article content"
                                mediaType="images"
                                value={field.value || ''}
                                onChange={(url) => {
                                  field.onChange(url);
                                  handleImageUrlChange(url);
                                }}
                                placeholder="https://example.com/image.jpg"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {imagePreview && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Image Preview</h4>
                          <div className="relative rounded-lg overflow-hidden border">
                            <img
                              src={imagePreview}
                              alt="Article preview"
                              className="w-full h-64 object-cover"
                              onError={() => setImagePreview('')}
                            />
                          </div>
                        </div>
                      )}

                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Image Guidelines
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
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 3: Settings */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Article Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure publication settings and categorization
                    </p>
                  </div>

                  <Card className="p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">Category *</FormLabel>
                              <FormDescription>
                                Select the most appropriate category for your article
                              </FormDescription>
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
                              <FormLabel className="text-base font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Publish Date
                              </FormLabel>
                              <FormDescription>
                                When should this article be published?
                              </FormDescription>
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

                      <Separator />

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
                              <FormLabel className="text-base font-semibold">Featured Article</FormLabel>
                              <FormDescription>
                                This article will appear in the featured section on the homepage
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-base font-semibold mb-2">Article Tags</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Add relevant tags to help readers find your article
                          </p>
                        </div>
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
                    </div>
                  </Card>
                </div>
              )}

              {/* Step 4: Review & Publish */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Review & Publish</h3>
                    <p className="text-sm text-muted-foreground">
                      Final review and SEO check before publishing your article
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Article Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Article Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg line-clamp-2">
                            {form.watch('title') || 'Article Title'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {form.watch('excerpt') || 'Article excerpt will appear here...'}
                          </p>
                        </div>
                        {form.watch('imageUrl') && (
                          <div className="relative rounded-lg overflow-hidden">
                            <img
                              src={form.watch('imageUrl')}
                              alt="Article preview"
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="prose prose-sm max-w-none">
                          <p className="line-clamp-3">
                            {form.watch('content') || 'Article content will appear here...'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* SEO Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          SEO Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="font-medium">Title Length</p>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                (form.watch('title')?.length || 0) >= 30 && (form.watch('title')?.length || 0) <= 60 
                                  ? 'bg-green-500' : 'bg-yellow-500'
                              }`} />
                              <span className="text-muted-foreground">
                                {form.watch('title')?.length || 0}/60 characters
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Excerpt Length</p>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                form.watch('excerpt') ? 'bg-green-500' : 'bg-yellow-500'
                              }`} />
                              <span className="text-muted-foreground">
                                {form.watch('excerpt')?.length || 0}/160 characters
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Content Words</p>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                (form.watch('content')?.split(' ').length || 0) >= 300 ? 'bg-green-500' : 'bg-yellow-500'
                              }`} />
                              <span className="text-muted-foreground">
                                {form.watch('content')?.split(' ').length || 0} words
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <p className="font-medium text-sm">SEO Checklist:</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                (form.watch('title')?.length || 0) >= 30 ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <span>Title is descriptive (30+ characters)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                form.watch('excerpt') ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <span>Has excerpt/meta description</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                form.watch('imageUrl') ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <span>Has featured image</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                (form.watch('content')?.split(' ').length || 0) >= 300 ? 'bg-green-500' : 'bg-yellow-500'
                              }`} />
                              <span>Content length (300+ words recommended)</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Form>

        {/* Navigation Footer */}
        <DialogFooter className="p-6 border-t flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isAutoSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Auto-saving...</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  <span>Auto-saved</span>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {currentStep > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={saveMutation.isPending || !canProceedToNext()}
                  className="flex items-center gap-2"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saveMutation.isPending ? 'Publishing...' : (mode === 'create' ? 'Create Article' : 'Update Article')}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}