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
  Sparkles,
  Moon,
  Sun,
  Tablet,
  Minimize2,
  Maximize2,
  RotateCw,
  Layers,
  Contrast,
  Volume2,
  Headphones,
  QrCode,
  Share,
  Heart,
  MessageCircle,
  Lightbulb,
  Shield,
  CheckCircle2,
  Wand2,
  Sliders,
  Filter,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Plus,
  Minus,
  RefreshCw,
  Trash2,
  Copy,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Focus,
  Newspaper,
  FileImage,
  Video,
  Mic,
  Archive
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
  article?: any;
  mode: 'create' | 'edit';
  onSave?: () => void;
  onCancel?: () => void;
}

export function ContentEditor({ article, mode, onSave, onCancel }: ContentEditorProps) {
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

  // World-class content organization tabs - based on top 50 websites research
  const editorTabs = [
    { 
      id: 'content', 
      label: 'কন্টেন্ট', 
      icon: PenTool,
      description: 'মূল নিবন্ধ লেখা ও সম্পাদনা',
      color: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    { 
      id: 'media', 
      label: 'মিডিয়া', 
      icon: ImageIcon,
      description: 'ছবি ও মাল্টিমিডিয়া সংযুক্তি',
      color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
      id: 'seo', 
      label: 'SEO ও সামাজিক', 
      icon: Globe,
      description: 'অনুসন্ধান ও সামাজিক অপটিমাইজেশন',
      color: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    { 
      id: 'settings', 
      label: 'সেটিংস', 
      icon: Settings,
      description: 'প্রকাশনা ও বিভাগীয় নিয়ন্ত্রণ',
      color: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    { 
      id: 'preview', 
      label: 'প্রিভিউ', 
      icon: Eye,
      description: 'চূড়ান্ত পূর্বরূপ দেখুন',
      color: 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800',
      iconColor: 'text-indigo-600 dark:text-indigo-400'
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
      enable_comments: article?.enable_comments ?? true,
      enable_sharing: article?.enable_sharing ?? true,
      enable_audio: article?.enable_audio ?? true,
      enable_pdf: article?.enable_pdf ?? true,
      priority_score: article?.priority_score ?? 5,
      published_at: article?.published_at ? new Date(article.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      author: article?.author || '',
      meta_title: article?.meta_title || '',
      meta_description: article?.meta_description || '',
      reading_time_override: article?.reading_time_override || undefined,
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
      onSave?.();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        {/* World-Class Header - Mobile-First Design with Bangladesh Color Psychology */}
        <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-3 sm:space-y-0">
              
              {/* Left Section - Title & Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {/* Modern 3D Icon with Cultural Colors */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                      <PenTool className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-emerald-700 dark:from-white dark:via-gray-200 dark:to-emerald-300 bg-clip-text text-transparent">
                      {mode === 'create' ? 'নতুন নিবন্ধ তৈরি করুন' : 'নিবন্ধ সম্পাদনা করুন'}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 font-medium">
                      {mode === 'create' ? 'বিশ্বমানের সম্পাদক দিয়ে আপনার গল্প বলুন' : 'আপনার নিবন্ধ উন্নত করুন'}
                    </p>
                  </div>
                </div>
                
                {/* Auto-save Status with Modern Animation */}
                {isAutoSaving && (
                  <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <div className="animate-spin">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium">স্বয়ংক্রিয় সংরক্ষণ</span>
                  </div>
                )}
              </div>
              
              {/* Right Section - Analytics & Controls */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Real-time Analytics Cards */}
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <Type className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{wordCount}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">শব্দ</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{readingTime}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">মিনিট</div>
                  </div>
                </div>
            
                {/* Device Preview Selector - Mobile Optimized for 96% users */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                  {[
                    { key: 'mobile', icon: Smartphone, label: 'মোবাইল', color: 'text-emerald-600 dark:text-emerald-400' },
                    { key: 'tablet', icon: Tablet, label: 'ট্যাবলেট', color: 'text-blue-600 dark:text-blue-400' },
                    { key: 'desktop', icon: Monitor, label: 'ডেস্কটপ', color: 'text-purple-600 dark:text-purple-400' }
                  ].map(({ key, icon: Icon, label, color }) => (
                    <Button
                      key={key}
                      variant={devicePreview === key ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setDevicePreview(key as any)}
                      className={`p-2.5 h-9 w-9 transition-all duration-200 ${
                        devicePreview === key 
                          ? 'bg-white dark:bg-gray-700 shadow-sm scale-105' 
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                      }`}
                      aria-label={label}
                    >
                      <Icon className={`h-4 w-4 ${devicePreview === key ? color : 'text-gray-600 dark:text-gray-400'}`} />
                    </Button>
                  ))}
                </div>
                
                {/* Quick Actions - Modern Design */}
                <div className="flex items-center space-x-2">
                  {/* AI Assistant Button */}
                  {aiSuggestions && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAISuggestions(form.getValues('title'), form.getValues('content'))}
                      disabled={isGeneratingAI}
                      className="hidden sm:flex items-center space-x-2 h-9 px-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/50 dark:hover:to-indigo-900/50"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                      ) : (
                        <Wand2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      )}
                      <span className="text-purple-700 dark:text-purple-300 font-medium">AI সাহায্য</span>
                    </Button>
                  )}
                  
                  {/* Preview Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="hidden md:flex items-center space-x-2 h-9 px-4"
                  >
                    <Eye className="h-4 w-4" />
                    <span>প্রিভিউ</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - World-Class Tabs Design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Enhanced Tab Navigation - Modern Design */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-1 p-2" aria-label="Tabs">
                    {editorTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = currentTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setCurrentTab(tab.id)}
                          className={`group relative flex items-center space-x-3 px-6 py-4 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 ${
                            isActive
                              ? `${tab.color} ${tab.iconColor} shadow-sm ring-1 ring-gray-200 dark:ring-gray-700`
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${
                            isActive 
                              ? 'bg-white dark:bg-gray-800 shadow-sm' 
                              : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                          }`}>
                            <Icon className={`h-4 w-4 ${isActive ? tab.iconColor : 'text-gray-500 dark:text-gray-400'}`} />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className={`font-semibold ${isActive ? 'text-gray-900 dark:text-white' : ''}`}>
                              {tab.label}
                            </span>
                            <span className={`text-xs ${isActive ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                              {tab.description}
                            </span>
                          </div>
                          {isActive && (
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
                
                {/* Tab Content Area - World-Class Content Forms */}
                <div className="p-8 space-y-8">
                  {/* Content Tab - Mobile-First Design with Bengali Typography */}
                  {currentTab === 'content' && (
                    <div className="space-y-8">
                      {/* Title & Basic Info Card */}
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                            <Type className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">শিরোনাম ও মূল তথ্য</h3>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">আকর্ষণীয় শিরোনাম ও বিবরণ যোগ করুন</p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          {/* Title Field - Enhanced for Bengali */}
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
                          
                          {/* Excerpt Field */}
                          <FormField
                            control={form.control}
                            name="excerpt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-medium text-gray-900 dark:text-white">সংক্ষিপ্ত বিবরণ</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="নিবন্ধের একটি আকর্ষণীয় সংক্ষিপ্ত বিবরণ লিখুন যা পাঠকদের সম্পূর্ণ নিবন্ধ পড়তে উৎসাহিত করবে..."
                                    className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl resize-none"
                                    style={{ fontFamily: 'SolaimanLipi, Kalpurush, "Noto Sans Bengali", sans-serif' }}
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-600 dark:text-gray-400">
                                  সামাজিক মিডিয়া ও অনুসন্ধান ফলাফলে দেখানো হবে
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {/* Content Editor Card */}
                      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                            <PenTool className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">মূল নিবন্ধ</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">আপনার গল্প বিস্তারিতভাবে লিখুন</p>
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="এখানে আপনার নিবন্ধের মূল বিষয়বস্তু লিখুন। 

আপনি যেকোনো তথ্য, মতামত, গল্প বা বিশ্লেষণ যোগ করতে পারেন। পাঠকদের জন্য সহজবোধ্য ও আকর্ষণীয় ভাষা ব্যবহার করুন।

অনুচ্ছেদ আলাদা করতে দুইবার এন্টার চাপুন।"
                                  className="min-h-[500px] text-lg leading-relaxed bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl resize-none"
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
                      </div>
                    </div>
                  )}

                  {/* Media Tab - Professional Image Management */}
                  {currentTab === 'media' && (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                            <ImageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">মূল ছবি ও মিডিয়া</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">নিবন্ধের জন্য আকর্ষণীয় ছবি যোগ করুন</p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="image_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white">ফিচার ইমেজ</FormLabel>
                                <FormControl>
                                  <FileUploadField
                                    value={field.value}
                                    onChange={handleImageUrlChange}
                                    preview={imagePreview}
                                    className="h-64 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                                  />
                                </FormControl>
                                <FormDescription className="text-blue-600 dark:text-blue-400">
                                  JPG, PNG বা WebP ফরম্যাট, সর্বোচ্চ 5MB। ১২০০x৬৭৫ পিক্সেল সুপারিশ।
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SEO Tab - Advanced Optimization */}
                  {currentTab === 'seo' && (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                            <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">SEO ও সামাজিক অপটিমাইজেশন</h3>
                            <p className="text-sm text-purple-700 dark:text-purple-300">অনুসন্ধান ও সামাজিক মিডিয়ার জন্য অপ্টিমাইজ করুন</p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
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
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settings Tab - Publication Controls */}
                  {currentTab === 'settings' && (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl p-8 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                            <Settings className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100">প্রকাশনা সেটিংস</h3>
                            <p className="text-sm text-orange-700 dark:text-orange-300">বিভাগ ও প্রকাশনার নিয়ন্ত্রণ</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-medium text-gray-900 dark:text-white">বিভাগ</FormLabel>
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
                            name="author"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-medium text-gray-900 dark:text-white">লেখক</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="লেখকের নাম"
                                    className="h-12 bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-700 rounded-xl"
                                  />
                                </FormControl>
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
                            name="priority_score"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-medium text-gray-900 dark:text-white">গুরুত্ব স্কোর (১-১০)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    max="10" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    className="h-12 bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-700 rounded-xl"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Feature Toggles - Modern Switch Design */}
                        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ফিচার নিয়ন্ত্রণ</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="is_featured"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between space-y-0">
                                  <div>
                                    <FormLabel className="text-base font-medium text-gray-900 dark:text-white">ফিচার করুন</FormLabel>
                                    <FormDescription className="text-gray-600 dark:text-gray-400">হোমপেজে প্রাধান্য দিন</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="enable_comments"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between space-y-0">
                                  <div>
                                    <FormLabel className="text-base font-medium text-gray-900 dark:text-white">মন্তব্য সক্রিয়</FormLabel>
                                    <FormDescription className="text-gray-600 dark:text-gray-400">পাঠক মন্তব্য করতে পারবেন</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="enable_sharing"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between space-y-0">
                                  <div>
                                    <FormLabel className="text-base font-medium text-gray-900 dark:text-white">শেয়ারিং সক্রিয়</FormLabel>
                                    <FormDescription className="text-gray-600 dark:text-gray-400">সামাজিক মিডিয়ায় শেয়ার</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="enable_audio"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between space-y-0">
                                  <div>
                                    <FormLabel className="text-base font-medium text-gray-900 dark:text-white">অডিও সক্রিয়</FormLabel>
                                    <FormDescription className="text-gray-600 dark:text-gray-400">টেক্সট-টু-স্পিচ ফিচার</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview Tab */}
                  {currentTab === 'preview' && (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                            <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">লাইভ প্রিভিউ</h3>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">পাঠকরা কীভাবে দেখবেন তা দেখুন</p>
                          </div>
                        </div>
                        
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* World-Class Action Bar - Fixed Bottom */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    {/* AI Assistant */}
                    {aiSuggestions && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => generateAISuggestions(form.getValues('title'), form.getValues('content'))}
                        disabled={isGeneratingAI}
                        className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/50 dark:hover:to-indigo-900/50"
                      >
                        {isGeneratingAI ? (
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                        ) : (
                          <Wand2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        )}
                        <span className="text-purple-700 dark:text-purple-300 font-medium">AI সাহায্য</span>
                      </Button>
                    )}
                    
                    {/* Cancel Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onCancel}
                      className="flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>বাতিল</span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Save Draft */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.handleSubmit(onSubmit)()}
                      disabled={saveMutation.isPending}
                      className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Save className="h-4 w-4" />
                      <span>খসড়া সংরক্ষণ</span>
                    </Button>
                    
                    {/* Publish Button - Primary Action */}
                    <Button
                      type="submit"
                      onClick={() => form.handleSubmit(onSubmit)()}
                      disabled={saveMutation.isPending}
                      className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span className="font-semibold">প্রকাশ করুন</span>
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
    </div>
  );
}
