import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Save, 
  Eye, 
  Clock, 
  Image as ImageIcon, 
  Tag, 
  Calendar,
  Settings,
  X,
  Check,
  AlertCircle,
  FileText,
  Loader2,
  PenTool,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  Type,
  Wand2,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Menu,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createArticle, updateArticle, getAdminCategories, getAdminAuthors } from '@/lib/admin-api-direct';
import { queryClient } from '@/lib/queryClient';
import { FileUploadField } from './FileUploadField';

// FIXED: Comprehensive form schema with proper types
const articleFormSchema = z.object({
  // Core content fields - required
  title: z.string().min(5, 'শিরোনাম অবশ্যই ৫টি অক্ষরের বেশি হতে হবে').max(200, 'শিরোনাম ২০০ অক্ষরের বেশি হতে পারবে না'),
  slug: z.string().min(5, 'স্লাগ অবশ্যই ৫টি অক্ষরের বেশি হতে হবে').max(100, 'স্লাগ ১০০ অক্ষরের বেশি হতে পারবে না'),
  content: z.string().min(20, 'কন্টেন্ট অবশ্যই ২০টি অক্ষরের বেশি হতে হবে'),
  
  // Optional content fields with defaults
  excerpt: z.string().max(500, 'সারাংশ ৫০০ অক্ষরের বেশি হতে পারবে না').default(''),
  summary: z.string().max(1000, 'সংক্ষিপ্ত বিবরণ ১০০০ অক্ষরের বেশি হতে পারবে না').default(''),
  
  // Media fields
  image_url: z.string().default(''),
  image_metadata: z.object({
    caption: z.string().default(''),
    place: z.string().default(''),
    date: z.string().default(''),
    photographer: z.string().default(''),
    id: z.string().default('')
  }).default({
    caption: '',
    place: '',
    date: '',
    photographer: '',
    id: ''
  }),
  
  // Publication settings
  category_id: z.coerce.number().min(1, 'অনুগ্রহ করে একটি বিভাগ নির্বাচন করুন'),
  is_featured: z.boolean().default(false),
  is_breaking: z.boolean().default(false),
  is_urgent: z.boolean().default(false),
  published_at: z.string().default(new Date().toISOString().split('T')[0]),
  
  // Author info
  author_id: z.coerce.number().min(1, 'অনুগ্রহ করে একজন লেখক নির্বাচন করুন'),
  
  // SEO fields
  meta_title: z.string().max(70, 'SEO শিরোনাম ৭০ অক্ষরের বেশি হতে পারবে না').default(''),
  meta_description: z.string().max(160, 'SEO বিবরণ ১৬০ অক্ষরের বেশি হতে পারবে না').default(''),
  social_image: z.string().default(''),
  
  // Feature toggles
  enable_comments: z.boolean().default(true),
  enable_sharing: z.boolean().default(true),
  enable_audio: z.boolean().default(true),
  enable_pdf: z.boolean().default(true),
  enable_notifications: z.boolean().default(false),
  enable_newsletter: z.boolean().default(false),
  
  // Status - required enum
  status: z.enum(['draft', 'review', 'scheduled', 'published']).default('draft'),
  
  // Additional fields
  tags: z.array(z.string()).default([]),
  custom_tags: z.string().default(''),
  content_warning: z.string().default(''),
  priority_score: z.number().min(1).max(10).default(5),
  track_reading_progress: z.boolean().default(true),
  review_notes: z.string().default(''),
  editor_notes: z.string().default(''),
  scheduled_publish_at: z.string().default(''),
  reading_time_override: z.number().optional(),
  age_restriction: z.enum(['none', '13+', '16+', '18+']).default('none'),
  regional_restriction: z.array(z.string()).default([]),
  media_urls: z.array(z.string()).default([]),
  video_urls: z.array(z.string()).default([]),
  mixed_media: z.array(z.object({
    type: z.enum(['image', 'video']),
    url: z.string(),
    thumbnail: z.string().default(''),
    title: z.string().default(''),
    description: z.string().default(''),
    duration: z.string().default('')
  })).default([])
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ContentEditorProps {
  article?: any;
  mode: 'create' | 'edit';
  onSave?: () => void;
  onCancel?: () => void;
}

// MOBILE-FIRST REDESIGNED CONTENT EDITOR
export function ContentEditorRedesigned({ article, mode, onSave, onCancel }: ContentEditorProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompactMode, setIsCompactMode] = useState(true); // Mobile-first compact mode
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [devicePreview, setDevicePreview] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  // MOBILE-OPTIMIZED STEP-BY-STEP APPROACH
  const editorSteps = [
    {
      id: 'basic',
      title: 'মূল তথ্য',
      description: 'শিরোনাম ও বিষয়বস্তু',
      icon: FileText,
      fields: ['title', 'slug', 'content'],
      color: 'emerald'
    },
    {
      id: 'media',
      title: 'ছবি ও মিডিয়া',
      description: 'ফিচার ইমেজ যোগ করুন',
      icon: ImageIcon,
      fields: ['image_url', 'image_metadata'],
      color: 'blue'
    },
    {
      id: 'settings',
      title: 'সেটিংস',
      description: 'বিভাগ ও প্রকাশনা',
      icon: Settings,
      fields: ['category_id', 'author_id', 'published_at', 'status'],
      color: 'orange'
    },
    {
      id: 'seo',
      title: 'SEO',
      description: 'অনুসন্ধান অপটিমাইজেশন',
      icon: Globe,
      fields: ['meta_title', 'meta_description'],
      color: 'purple'
    },
    {
      id: 'preview',
      title: 'প্রিভিউ',
      description: 'চূড়ান্ত পূর্বরূপ',
      icon: Eye,
      fields: [],
      color: 'indigo'
    }
  ];

  // Categories and Authors queries
  const { data: categories } = useQuery({
    queryKey: ['/api/admin/categories'],
    queryFn: getAdminCategories,
  });

  const { data: authors } = useQuery({
    queryKey: ['/api/admin/authors'],
    queryFn: getAdminAuthors,
  });

  // OPTIMIZED: Form with proper TypeScript types
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article?.title || '',
      slug: article?.slug || '',
      content: article?.content || '',
      excerpt: article?.excerpt || '',
      summary: article?.summary || '',
      image_url: article?.image_url || '',
      category_id: article?.category_id || 1,
      is_featured: article?.is_featured ?? false,
      is_breaking: article?.is_breaking ?? false,
      is_urgent: article?.is_urgent ?? false,
      enable_comments: article?.enable_comments ?? true,
      enable_sharing: article?.enable_sharing ?? true,
      enable_audio: article?.enable_audio ?? true,
      enable_pdf: article?.enable_pdf ?? true,
      enable_notifications: article?.enable_notifications ?? false,
      enable_newsletter: article?.enable_newsletter ?? false,
      priority_score: article?.priority_score ?? 5,
      published_at: article?.published_at ? new Date(article.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      scheduled_publish_at: article?.scheduled_publish_at || '',
      author_id: article?.author_id || article?.authors?.id || 1,
      tags: article?.tags || [],
      custom_tags: article?.custom_tags || '',
      meta_title: article?.meta_title || '',
      meta_description: article?.meta_description || '',
      social_image: article?.social_image || '',
      reading_time_override: article?.reading_time_override || undefined,
      track_reading_progress: article?.track_reading_progress ?? true,
      content_warning: article?.content_warning || '',
      age_restriction: article?.age_restriction || 'none',
      regional_restriction: article?.regional_restriction || [],
      status: article?.status || 'draft',
      review_notes: article?.review_notes || '',
      editor_notes: article?.editor_notes || '',
      media_urls: article?.media_urls || [],
      video_urls: article?.video_urls || [],
      mixed_media: article?.mixed_media || [],
      image_metadata: {
        caption: article?.image_metadata?.caption || '',
        place: article?.image_metadata?.place || '',
        date: article?.image_metadata?.date || '',
        photographer: article?.image_metadata?.photographer || '',
        id: article?.image_metadata?.id || ''
      }
    },
  });

  // PERFORMANCE: Debounced auto-save
  const debouncedAutoSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (data: ArticleFormValues) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (mode === 'edit' && article?.id) {
            setIsAutoSaving(true);
            // Auto-save logic here
            setTimeout(() => setIsAutoSaving(false), 1000);
          }
        }, 2000);
      };
    })(),
    [mode, article?.id]
  );

  // PERFORMANCE: Memoized word count calculation
  const updateContentStats = useCallback((content: string) => {
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // 200 words per minute for Bengali
  }, []);

  // Watch form changes for auto-save and analytics
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.content) {
        updateContentStats(data.content);
      }
      if (mode === 'edit') {
        debouncedAutoSave(data as ArticleFormValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateContentStats, debouncedAutoSave, mode]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ArticleFormValues) => {
      if (mode === 'create') {
        return createArticle(data);
      } else {
        return updateArticle(article.id, data);
      }
    },
    onSuccess: () => {
      toast({
        title: '✅ সফল',
        description: `নিবন্ধ ${mode === 'create' ? 'তৈরি' : 'আপডেট'} হয়েছে`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles'] });
      onSave?.();
    },
    onError: (error: Error) => {
      toast({
        title: '❌ ত্রুটি',
        description: error.message || `নিবন্ধ ${mode === 'create' ? 'তৈরি' : 'আপডেট'} করতে ব্যর্থ`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ArticleFormValues) => {
    saveMutation.mutate(data);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\sঀ-৻ড়ঢ়য়]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleImageUrlChange = (url: string) => {
    form.setValue('image_url', url);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const currentStepData = editorSteps[currentStep];
  const progressPercentage = ((currentStep + 1) / editorSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* MOBILE-FIRST HEADER - Optimized for small screens */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Title & Progress */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="p-2 h-8 w-8 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {mode === 'create' ? 'নতুন নিবন্ধ' : 'নিবন্ধ সম্পাদনা'}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Progress value={progressPercentage} className="h-1.5 flex-1 max-w-24" />
                  <span className="text-xs text-gray-500 flex-shrink-0">{currentStep + 1}/{editorSteps.length}</span>
                </div>
              </div>
            </div>
            
            {/* Right: Stats & Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Auto-save indicator */}
              {isAutoSaving && (
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span className="text-xs hidden sm:inline">সংরক্ষণ</span>
                </div>
              )}
              
              {/* Word count */}
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{wordCount}</div>
                <div className="text-xs text-gray-500">শব্দ</div>
              </div>
              
              {/* Compact mode toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCompactMode(!isCompactMode)}
                className="p-2 h-8 w-8"
              >
                {isCompactMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE-OPTIMIZED CONTENT AREA */}
      <div className="max-w-4xl mx-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* MOBILE: Step Navigation */}
            <div className="flex overflow-x-auto pb-2 space-x-2 lg:hidden">
              {editorSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === index;
                const isCompleted = index < currentStep;
                
                return (
                  <Button
                    key={step.id}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentStep(index)}
                    className={`flex-shrink-0 min-w-fit h-12 px-4 ${
                      isActive 
                        ? `bg-${step.color}-500 hover:bg-${step.color}-600 text-white` 
                        : isCompleted 
                          ? `border-${step.color}-300 text-${step.color}-700 dark:text-${step.color}-300`
                          : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="text-sm font-medium">{step.title}</div>
                        <div className="text-xs opacity-75">{step.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* DESKTOP: Sidebar Navigation */}
            <div className="hidden lg:flex lg:space-x-8">
              <div className="w-64 space-y-2">
                {editorSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === index;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <Button
                      key={step.id}
                      type="button"
                      variant={isActive ? 'default' : 'ghost'}
                      size="lg"
                      onClick={() => setCurrentStep(index)}
                      className={`w-full justify-start h-16 px-4 ${
                        isActive 
                          ? `bg-${step.color}-500 hover:bg-${step.color}-600 text-white` 
                          : isCompleted 
                            ? `text-${step.color}-700 dark:text-${step.color}-300`
                            : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">{step.title}</div>
                          <div className="text-sm opacity-75">{step.description}</div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
              
              {/* Desktop Content */}
              <div className="flex-1">
                {renderStepContent()}
              </div>
            </div>

            {/* MOBILE: Current Step Content */}
            <div className="lg:hidden">
              {renderStepContent()}
            </div>

            {/* MOBILE-OPTIMIZED ACTION BUTTONS */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 -mx-4">
              <div className="flex items-center justify-between space-x-3">
                {/* Previous Step */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">পূর্ববর্তী</span>
                </Button>
                
                {/* Step indicator */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currentStepData.title}
                </div>
                
                {/* Next Step / Save */}
                {currentStep < editorSteps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600"
                  >
                    <span className="hidden sm:inline">পরবর্তী</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>প্রকাশ করুন</span>
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );

  // STEP CONTENT RENDERER
  function renderStepContent() {
    const step = editorSteps[currentStep];
    
    switch (step.id) {
      case 'basic':
        return (
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-100">
                <FileText className="h-5 w-5" />
                <span>মূল তথ্য</span>
              </CardTitle>
              <CardDescription>নিবন্ধের শিরোনাম ও বিষয়বস্তু যোগ করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <span>শিরোনাম</span>
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="আকর্ষণীয় ও তথ্যবহুল শিরোনাম লিখুন..."
                        className="text-xl h-16 bg-white dark:bg-gray-800 border-emerald-300 dark:border-emerald-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm font-medium"
                        style={{ fontFamily: 'SolaimanLipi, Kalpurush, "Noto Sans Bengali", sans-serif' }}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!form.getValues('slug')) {
                            form.setValue('slug', generateSlug(e.target.value));
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-emerald-600 dark:text-emerald-400">
                      SEO অপ্টিমাইজেশনের জন্য ৫০-৬০ অক্ষরের মধ্যে রাখুন
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* URL Slug Field */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium text-gray-900 dark:text-white">URL স্লাগ</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">/article/</span>
                        </div>
                        <Input 
                          {...field} 
                          placeholder="url-friendly-slug"
                          className="pl-20 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      ইংরেজি অক্ষর, সংখ্যা এবং হাইফেন ব্যবহার করুন
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content Field */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <span>মূল বিষয়বস্তু</span>
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="এখানে আপনার নিবন্ধের মূল বিষয়বস্তু লিখুন। 

আপনি যেকোনো তথ্য, মতামত, গল্প বা বিশ্লেষণ যোগ করতে পারেন। পাঠকদের জন্য সহজবোধ্য ও আকর্ষণীয় ভাষা ব্যবহার করুন।

অনুচ্ছেদ আলাদা করতে দুইবার এন্টার চাপুন।"
                        className="min-h-[400px] text-lg leading-relaxed bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl resize-none"
                        style={{ 
                          fontFamily: 'SolaimanLipi, Kalpurush, "Noto Sans Bengali", sans-serif',
                          lineHeight: '1.8'
                        }}
                      />
                    </FormControl>
                    <FormDescription className="flex items-center justify-between text-gray-600 dark:text-gray-400 mt-3">
                      <span>বাংলা বা ইংরেজি উভয় ভাষায় লিখতে পারেন</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center space-x-1">
                          <Type className="h-4 w-4" />
                          <span>{wordCount} শব্দ</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{readingTime} মিনিট</span>
                        </span>
                      </div>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );
      
      case 'media':
        return (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
                <ImageIcon className="h-5 w-5" />
                <span>ছবি ও মিডিয়া</span>
              </CardTitle>
              <CardDescription>নিবন্ধের জন্য আকর্ষণীয় ছবি যোগ করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white">ফিচার ইমেজ</FormLabel>
                    <FormControl>
                      <FileUploadField
                        label=""
                        value={field.value}
                        onChange={handleImageUrlChange}
                        description="JPG, PNG বা WebP ফরম্যাট, সর্বোচ্চ 5MB। ১২০০x৬৭৫ পিক্সেল সুপারিশ।"
                        accept="image/*"
                        maxSize="5MB"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Image Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="image_metadata.caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ছবির ক্যাপশন</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ছবির বিবরণ..." />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="image_metadata.photographer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ফটোগ্রাফার</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ফটোগ্রাফারের নাম..." />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );
      
      case 'settings':
        return (
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-900 dark:text-orange-100">
                <Settings className="h-5 w-5" />
                <span>প্রকাশনা সেটিংস</span>
              </CardTitle>
              <CardDescription>বিভাগ ও প্রকাশনার নিয়ন্ত্রণ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium text-gray-900 dark:text-white">বিভাগ *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-700 rounded-xl">
                            <SelectValue placeholder="একটি বিভাগ নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
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
                  name="author_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium text-gray-900 dark:text-white">লেখক *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-700 rounded-xl">
                            <SelectValue placeholder="একজন লেখক নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {authors?.map((author) => (
                            <SelectItem key={author.id} value={author.id.toString()}>
                              {author.name}
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
                  name="published_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium text-gray-900 dark:text-white">প্রকাশের তারিখ</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          className="h-12 bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-700 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium text-gray-900 dark:text-white">অবস্থা</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-700 rounded-xl">
                            <SelectValue placeholder="অবস্থা নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">খসড়া</SelectItem>
                          <SelectItem value="review">পর্যালোচনা</SelectItem>
                          <SelectItem value="scheduled">নির্ধারিত</SelectItem>
                          <SelectItem value="published">প্রকাশিত</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Feature toggles */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">বিশেষ বৈশিষ্ট্য</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <div>
                          <FormLabel className="text-base font-medium text-gray-900 dark:text-white">ফিচার নিবন্ধ</FormLabel>
                          <FormDescription className="text-gray-600 dark:text-gray-400">হোমপেজে তুলে ধরুন</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_breaking"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <div>
                          <FormLabel className="text-base font-medium text-gray-900 dark:text-white">ব্রেকিং নিউজ</FormLabel>
                          <FormDescription className="text-gray-600 dark:text-gray-400">জরুরি সংবাদ হিসেবে চিহ্নিত করুন</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'seo':
        return (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-900 dark:text-purple-100">
                <Globe className="h-5 w-5" />
                <span>SEO ও সামাজিক অপটিমাইজেশন</span>
              </CardTitle>
              <CardDescription>অনুসন্ধান ও সামাজিক মিডিয়ার জন্য অপ্টিমাইজ করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="meta_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium text-gray-900 dark:text-white">Meta Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="SEO অপ্টিমাইজড শিরোনাম (৫০-৬০ অক্ষর)"
                        className="h-12 bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 rounded-xl"
                      />
                    </FormControl>
                    <FormDescription className="text-purple-600 dark:text-purple-400">
                      Google এর অনুসন্ধান ফলাফলে দেখানো হবে
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="meta_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium text-gray-900 dark:text-white">Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="নিবন্ধের সংক্ষিপ্ত বিবরণ যা অনুসন্ধান ফলাফলে দেখানো হবে (১৫০-১৬০ অক্ষর)"
                        className="min-h-[100px] bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 rounded-xl resize-none"
                      />
                    </FormControl>
                    <FormDescription className="text-purple-600 dark:text-purple-400">
                      সামাজিক মিডিয়া শেয়ারিংয়েও ব্যবহৃত হবে
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );
      
      case 'preview':
        return (
          <Card className="border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-100">
                <Eye className="h-5 w-5" />
                <span>লাইভ প্রিভিউ</span>
              </CardTitle>
              <CardDescription>পাঠকরা কীভাবে দেখবেন তা দেখুন</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {form.watch('title') || 'নিবন্ধের শিরোনাম'}
                  </h1>
                  
                  {form.watch('image_url') && (
                    <img 
                      src={form.watch('image_url')} 
                      alt={form.watch('title')} 
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  
                  <div className="text-gray-600 dark:text-gray-400 mb-6">
                    {form.watch('excerpt') || 'নিবন্ধের সংক্ষিপ্ত বিবরণ এখানে দেখানো হবে।'}
                  </div>
                  
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {form.watch('content') || 'নিবন্ধের মূল বিষয়বস্তু এখানে দেখানো হবে।'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  }
}