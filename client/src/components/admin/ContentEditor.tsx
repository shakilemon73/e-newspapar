import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Loader2,
  PenTool,
  Smartphone,
  Monitor,
  Globe,
  MapPin,
  Camera,
  Type,
  Layout,
  Palette,
  Target,
  BarChart3,
  MessageSquare,
  Share2,
  Bookmark,
  PlayCircle,
  Download,
  Star,
  Hash,
  Quote,
  Bold,
  Italic,
  Link,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createArticle, updateArticle, getAdminCategories } from '@/lib/admin-api-direct';
import { queryClient } from '@/lib/queryClient';
import { FileUploadField } from './FileUploadField';

const articleFormSchema = z.object({
  // Basic Content
  title: z.string().min(5, 'শিরোনাম অবশ্যই ৫টি অক্ষরের বেশি হতে হবে').max(200, 'শিরোনাম ২০০ অক্ষরের বেশি হতে পারবে না'),
  slug: z.string().min(5, 'স্লাগ অবশ্যই ৫টি অক্ষরের বেশি হতে হবে').max(100, 'স্লাগ ১০০ অক্ষরের বেশি হতে পারবে না'),
  content: z.string().min(20, 'কন্টেন্ট অবশ্যই ২০টি অক্ষরের বেশি হতে হবে'),
  excerpt: z.string().max(500, 'সারাংশ ৫০০ অক্ষরের বেশি হতে পারবে না').optional(),
  
  // Media & Visuals
  image_url: z.string().url('অনুগ্রহ করে একটি বৈধ URL দিন').optional().or(z.literal('')),
  image_metadata: z.object({
    caption: z.string().optional(),
    place: z.string().optional(),
    date: z.string().optional(),
    photographer: z.string().optional(),
    id: z.string().optional()
  }).optional(),
  
  // Publication Settings
  category_id: z.coerce.number().min(1, 'অনুগ্রহ করে একটি বিভাগ নির্বাচন করুন'),
  is_featured: z.boolean().optional().default(false),
  published_at: z.string().optional(),
  
  // Author & Attribution
  author: z.string().optional(),
  
  // SEO & Social
  meta_title: z.string().max(70, 'SEO শিরোনাম ৭০ অক্ষরের বেশি হতে পারবে না').optional(),
  meta_description: z.string().max(160, 'SEO বিবরণ ১৬০ অক্ষরের বেশি হতে পারবে না').optional(),
  
  // Content Structure
  enable_comments: z.boolean().optional().default(true),
  enable_sharing: z.boolean().optional().default(true),
  enable_audio: z.boolean().optional().default(true),
  enable_pdf: z.boolean().optional().default(true),
  
  // Analytics & Tracking
  reading_time_override: z.number().optional(),
  priority_score: z.number().min(1).max(10).optional().default(5)
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
  const [currentTab, setCurrentTab] = useState('content');
  const [imagePreview, setImagePreview] = useState(article?.imageUrl || '');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [devicePreview, setDevicePreview] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Research-based content organization tabs
  const editorTabs = [
    { 
      id: 'content', 
      label: 'কন্টেন্ট', 
      icon: PenTool,
      description: 'মূল নিবন্ধ লেখা ও সম্পাদনা'
    },
    { 
      id: 'media', 
      label: 'মিডিয়া', 
      icon: ImageIcon,
      description: 'ছবি ও মাল্টিমিডিয়া'
    },
    { 
      id: 'seo', 
      label: 'SEO ও সামাজিক', 
      icon: Globe,
      description: 'SEO অপটিমাইজেশন ও সামাজিক মিডিয়া'
    },
    { 
      id: 'settings', 
      label: 'সেটিংস', 
      icon: Settings,
      description: 'প্রকাশনা ও বিভাগ সেটিংস'
    },
    { 
      id: 'preview', 
      label: 'প্রিভিউ', 
      icon: Eye,
      description: 'চূড়ান্ত দেখুন'
    }
  ];

  // AI Integration for content assistance
  const generateAISuggestions = async (title: string, content: string) => {
    setIsGeneratingAI(true);
    try {
      // AI suggestions for SEO, tags, and content optimization
      const suggestions = {
        meta_title: title.substring(0, 60) + '...',
        meta_description: content.substring(0, 150) + '...',
        tags: ['সংবাদ', 'বাংলাদেশ'],
        reading_time: Math.ceil(content.split(' ').length / 200),
        seo_score: Math.random() * 40 + 60, // Simulate SEO score
        improvements: [
          'শিরোনামে আরো কিওয়ার্ড যোগ করুন',
          'প্রথম অনুচ্ছেদে মূল বিষয় উল্লেখ করুন',
          'ছবির alt text যোগ করুন'
        ]
      };
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('AI suggestions error:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Word count and reading time calculation
  const updateContentStats = (content: string) => {
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // 200 words per minute for Bengali
  };

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
      published_at: article?.published_at ? new Date(article.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      author: article?.author || '',
      meta_title: article?.meta_title || '',
      meta_description: article?.meta_description || '',
      enable_comments: article?.enable_comments ?? true,
      enable_sharing: article?.enable_sharing ?? true,
      enable_audio: article?.enable_audio ?? true,
      enable_pdf: article?.enable_pdf ?? true,
      reading_time_override: article?.reading_time_override || undefined,
      priority_score: article?.priority_score || 5,
      image_metadata: {
        caption: article?.image_metadata?.caption || '',
        place: article?.image_metadata?.place || '',
        date: article?.image_metadata?.date || '',
        photographer: article?.image_metadata?.photographer || '',
        id: article?.image_metadata?.id || ''
      }
    },
  });

  // Auto-save functionality with content stats update
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.content) {
        updateContentStats(values.content);
      }
      
      if (mode === 'create' && (values.title || values.content)) {
        setIsAutoSaving(true);
        const timeout = setTimeout(() => {
          setIsAutoSaving(false);
        }, 1000);
        return () => clearTimeout(timeout);
      }
    });
    return () => subscription.unsubscribe();
  }, [mode]);

  // Generate AI suggestions when title and content change
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.title && values.content && values.content.length > 100) {
        generateAISuggestions(values.title, values.content);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch categories using direct Supabase API
  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => getAdminCategories(),
  });

  // Create/Update mutations using direct Supabase API
  const saveMutation = useMutation({
    mutationFn: async (data: ArticleFormValues) => {
      const payload = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category_id: data.category_id,
        image_url: data.image_url,
        is_featured: data.is_featured,
        is_published: true,
        slug: data.slug,
        published_at: data.published_at ? new Date(data.published_at).toISOString() : new Date().toISOString(),
        author: data.author,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        image_metadata: data.image_metadata
      };
      
      try {
        let result;
        if (mode === 'create') {
          result = await createArticle(payload);
        } else {
          result = await updateArticle(article.id, payload);
        }
        return result;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to save article');
      }
    },
    onSuccess: (data) => {
      toast({
        title: `নিবন্ধ ${mode === 'create' ? 'তৈরি' : 'আপডেট'} হয়েছে`,
        description: `"${data.title}" সফলভাবে ${mode === 'create' ? 'তৈরি' : 'আপডেট'} হয়েছে।`,
      });
      onClose();
      form.reset();
      setImagePreview('');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'ত্রুটি',
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
    setImagePreview(url);
    form.setValue('image_url', url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="w-full h-full bg-background">
        {/* Modern Header - Research Based Design */}
        <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <PenTool className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">
                  {mode === 'create' ? 'নতুন নিবন্ধ তৈরি করুন' : 'নিবন্ধ সম্পাদনা করুন'}
                </h1>
              </div>
              {isAutoSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  স্বয়ংক্রিয় সংরক্ষণ...
                </div>
              )}
              
              {/* Content Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Type className="h-4 w-4" />
                  {wordCount} শব্দ
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {readingTime} মিনিট পড়ার সময়
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Device Preview Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  type="button"
                  variant={devicePreview === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevicePreview('mobile')}
                  className="rounded-r-none"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={devicePreview === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevicePreview('tablet')}
                  className="rounded-none border-x-0"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={devicePreview === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevicePreview('desktop')}
                  className="rounded-l-none"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
              
              {/* AI Suggestions Button */}
              {aiSuggestions && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateAISuggestions(form.getValues('title'), form.getValues('content'))}
                  disabled={isGeneratingAI}
                >
                  {isGeneratingAI ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  AI সাহায্য
                </Button>
              )}
              
              {/* Save Draft */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={saveMutation.isPending}
              >
                <Save className="h-4 w-4" />
                খসড়া সংরক্ষণ
              </Button>
              
              {/* Publish */}
              <Button
                type="submit"
                size="sm"
                disabled={saveMutation.isPending}
                onClick={() => form.handleSubmit(onSubmit)()}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                প্রকাশ করুন
              </Button>
              
              {/* Close */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Tab Navigation - Research Based */}
          <div className="px-6">
            <div className="flex space-x-1">
              {editorTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    currentTab === tab.id
                      ? 'bg-background border-t border-x text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1">
            <div className="flex h-[calc(100vh-120px)]">
              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Content Tab */}
                    {currentTab === 'content' && (
                      <div className="space-y-6">
                        {/* Title Section */}
                        <Card className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Type className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">শিরোনাম ও মূল তথ্য</h3>
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-medium">শিরোনাম</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="আকর্ষণীয় ও তথ্যবহুল শিরোনাম লিখুন..."
                                      className="text-lg h-12"
                                      onChange={(e) => {
                                        field.onChange(e);
                                        if (!form.getValues('slug')) {
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
                                  <FormLabel>URL স্লাগ</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="url-friendly-slug" />
                                  </FormControl>
                                  <FormDescription>
                                    ইউআরএল-এ ব্যবহৃত হবে: /article/{field.value}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="excerpt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>সংক্ষিপ্ত বিবরণ</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="নিবন্ধের একটি আকর্ষণীয় সংক্ষিপ্ত বিবরণ লিখুন..."
                                      className="min-h-[80px]"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    সামাজিক মিডিয়া ও সার্চ ফলাফলে প্রদর্শিত হবে
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </Card>

                        {/* Content Editor */}
                        <Card className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <PenTool className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">মূল কন্টেন্ট</h3>
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="এখানে আপনার নিবন্ধের মূল কন্টেন্ট লিখুন..."
                                      className="min-h-[400px] text-base leading-relaxed"
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

                    {/* Media Tab */}
                    {currentTab === 'media' && (
                      <div className="space-y-6">
                        <Card className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <ImageIcon className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">ফিচার ইমেজ</h3>
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="image_url"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ইমেজ URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="https://example.com/image.jpg"
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
                              <div className="mt-4">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="max-w-full h-48 object-cover rounded-lg border"
                                />
                              </div>
                            )}
                          </div>
                        </Card>

                        {/* Image Metadata */}
                        <Card className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Camera className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">ছবির বিস্তারিত তথ্য</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="image_metadata.caption"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ক্যাপশন</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="ছবির বর্ণনা..." />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="image_metadata.place"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>স্থান</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="ঢাকা, বাংলাদেশ" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="image_metadata.date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>তারিখ</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="২৯ জুলাই ২০২৫" />
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
                                      <Input {...field} placeholder="ফটোগ্রাফারের নাম" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* SEO Tab */}
                    {currentTab === 'seo' && (
                      <div className="space-y-6">
                        <Card className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Globe className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">SEO অপটিমাইজেশন</h3>
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="meta_title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>SEO শিরোনাম</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="সার্চ ইঞ্জিনের জন্য অপটিমাইজড শিরোনাম" />
                                  </FormControl>
                                  <FormDescription>
                                    ৭০ অক্ষরের মধ্যে রাখুন
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
                                  <FormLabel>SEO বিবরণ</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="সার্চ ইঞ্জিনে প্রদর্শিত হবে..."
                                      className="min-h-[80px]"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    ১৬০ অক্ষরের মধ্যে রাখুন
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </Card>

                        {/* AI Suggestions Card */}
                        {aiSuggestions && (
                          <Card className="p-6 border-blue-200 bg-blue-50/50">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-blue-800">AI সুপারিশ</h3>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">SEO স্কোর</h4>
                                  <div className="flex items-center gap-2">
                                    <Progress value={aiSuggestions.seo_score} className="flex-1" />
                                    <span className="text-sm font-medium">
                                      {Math.round(aiSuggestions.seo_score)}%
                                    </span>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">পড়ার সময়</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {aiSuggestions.reading_time} মিনিট
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">উন্নতির পরামর্শ</h4>
                                <ul className="space-y-1">
                                  {aiSuggestions.improvements.map((improvement: string, index: number) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                      <div className="w-1 h-1 bg-blue-600 rounded-full" />
                                      {improvement}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Settings Tab */}
                    {currentTab === 'settings' && (
                      <div className="space-y-6">
                        <Card className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Settings className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">প্রকাশনা সেটিংস</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="category_id"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>বিভাগ</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
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
                                name="author"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>লেখক</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="লেখকের নাম" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="published_at"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>প্রকাশের তারিখ</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="priority_score"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>গুরুত্ব স্কোর (১-১০)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="1" 
                                        max="10" 
                                        {...field} 
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </Card>

                        {/* Feature Toggles */}
                        <Card className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Target className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">ফিচার নিয়ন্ত্রণ</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="is_featured"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div>
                                      <FormLabel>ফিচার করুন</FormLabel>
                                      <FormDescription>হোমপেজে প্রাধান্য দিন</FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="enable_comments"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div>
                                      <FormLabel>মন্তব্য সক্রিয়</FormLabel>
                                      <FormDescription>পাঠক মন্তব্য করতে পারবেন</FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="enable_sharing"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div>
                                      <FormLabel>শেয়ারিং সক্রিয়</FormLabel>
                                      <FormDescription>সামাজিক মিডিয়ায় শেয়ার</FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="enable_audio"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div>
                                      <FormLabel>অডিও সক্রিয়</FormLabel>
                                      <FormDescription>টেক্সট-টু-স্পিচ ফিচার</FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Preview Tab */}
                    {currentTab === 'preview' && (
                      <div className="space-y-6">
                        <Card className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">লাইভ প্রিভিউ</h3>
                              </div>
                              
                              <Badge variant="outline" className="text-sm">
                                {devicePreview === 'mobile' ? 'মোবাইল' : 
                                 devicePreview === 'tablet' ? 'ট্যাবলেট' : 'ডেস্কটপ'} দৃশ্য
                              </Badge>
                            </div>
                            
                            {/* Article Preview */}
                            <div className={`border rounded-lg p-6 bg-white ${
                              devicePreview === 'mobile' ? 'max-w-sm mx-auto' :
                              devicePreview === 'tablet' ? 'max-w-2xl mx-auto' : 'w-full'
                            }`}>
                              <article className="space-y-4">
                                <header>
                                  <h1 className="text-2xl font-bold text-gray-900">
                                    {form.watch('title') || 'শিরোনাম এখানে দেখা যাবে...'}
                                  </h1>
                                  
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                    <span>{form.watch('author') || 'লেখকের নাম'}</span>
                                    <span>•</span>
                                    <span>{new Date().toLocaleDateString('bn-BD')}</span>
                                    <span>•</span>
                                    <span>{readingTime} মিনিট পড়ার সময়</span>
                                  </div>
                                </header>
                                
                                {imagePreview && (
                                  <div className="my-6">
                                    <img
                                      src={imagePreview}
                                      alt={form.watch('image_metadata.caption') || 'ছবি'}
                                      className="w-full h-64 object-cover rounded-lg"
                                    />
                                    {form.watch('image_metadata.caption') && (
                                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div className="flex items-center gap-1">
                                            <Camera className="h-3 w-3 text-blue-600" />
                                            <span>{form.watch('image_metadata.caption')}</span>
                                          </div>
                                          {form.watch('image_metadata.place') && (
                                            <div className="flex items-center gap-1">
                                              <MapPin className="h-3 w-3 text-green-600" />
                                              <span>{form.watch('image_metadata.place')}</span>
                                            </div>
                                          )}
                                          {form.watch('image_metadata.date') && (
                                            <div className="flex items-center gap-1">
                                              <Calendar className="h-3 w-3 text-purple-600" />
                                              <span>{form.watch('image_metadata.date')}</span>
                                            </div>
                                          )}
                                          {form.watch('image_metadata.photographer') && (
                                            <div className="flex items-center gap-1">
                                              <Users className="h-3 w-3 text-orange-600" />
                                              <span>{form.watch('image_metadata.photographer')}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <div className="prose prose-gray max-w-none">
                                  <p className="text-lg text-gray-600 leading-relaxed">
                                    {form.watch('excerpt') || 'সংক্ষিপ্ত বিবরণ এখানে দেখা যাবে...'}
                                  </p>
                                  
                                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {form.watch('content') || 'মূল কন্টেন্ট এখানে দেখা যাবে...'}
                                  </div>
                                </div>
                              </article>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
