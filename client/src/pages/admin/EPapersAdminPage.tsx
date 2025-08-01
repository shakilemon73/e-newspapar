import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Loader2, 
  FileText,
  CalendarIcon,
  Download,
  Star,
  Edit,
  Trash2,
  Zap,
  Newspaper
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateFormatter } from '@/components/DateFormatter';
import { useLanguage } from '@/contexts/LanguageContext';
import { adminSupabaseAPI } from '@/lib/admin-supabase-complete';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EPaper {
  id: number;
  title: string;
  publish_date: string;
  image_url?: string;
  pdf_url?: string;
  is_latest: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function EPapersAdminPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedEpaper, setSelectedEpaper] = useState<EPaper | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    publish_date: new Date().toISOString().split('T')[0],
    image_url: '',
    pdf_url: '',
    is_latest: false,
    is_published: true
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // E-Paper Generator States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customTitle, setCustomTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Auto Generation States
  const [generationOptions, setGenerationOptions] = useState<EPaperGenerationOptions>({
    title: 'বাংলা সংবাদপত্র',
    date: new Date().toISOString().split('T')[0],
    layout: 'traditional',
    includeCategories: [],
    excludeCategories: [],
    maxArticles: 12,
    includeBreakingNews: true,
    includeWeather: true
  });
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [previewArticles, setPreviewArticles] = useState<any[]>([]);
  
  // PDF Preview States
  const [generatedPdf, setGeneratedPdf] = useState<{
    pdfUrl: string;
    title: string;
    date: string;
  } | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Fetch e-papers using direct admin API
  const { data: epapersData, isLoading, error } = useQuery({
    queryKey: ['admin-epapers'],
    queryFn: () => getAdminEPapers(),
  });

  // Extract e-papers array from the response
  const epapers = epapersData?.epapers || [];

  // Fetch available categories for generation
  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { default: adminSupabase } = await import('@/lib/admin-supabase-direct');
      const { data } = await adminSupabase.from('categories').select('name').order('name');
      return data?.map(cat => cat.name) || [];
    },
  });

  // Create/Update mutation using direct admin API
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isEditing && selectedEpaper) {
        const result = await updateEPaper(selectedEpaper.id!, data);
        if (!result.success) throw new Error(result.error);
        return result;
      } else {
        const result = await createEPaper(data);
        if (!result.success) throw new Error(result.error);
        return result;
      }
    },
    onSuccess: () => {
      toast({
        title: `E-paper ${isEditing ? 'updated' : 'created'}`,
        description: `The e-paper has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-epapers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation using direct admin API
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteEPaper(id);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'E-paper deleted',
        description: 'The e-paper has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-epapers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Auto Generation mutation
  const generateMutation = useMutation({
    mutationFn: generateEPaperFromArticles,
    onSuccess: (result) => {
      // Show PDF preview instead of immediately saving
      setGeneratedPdf({
        pdfUrl: result.pdfUrl || '',
        title: generationOptions.title,
        date: generationOptions.date
      });
      setShowPdfPreview(true);
      setIsGenerating(false);
      setGenerationProgress(0);
      
      toast({
        title: 'E-paper Generated Successfully!',
        description: `Generated with ${result.articleCount} articles. Choose to publish or save as draft.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsGenerating(false);
      setGenerationProgress(0);
    },
  });

  // Set Latest mutation
  const setLatestMutation = useMutation({
    mutationFn: setLatestEPaper,
    onSuccess: () => {
      toast({
        title: 'Latest E-paper Updated',
        description: 'This e-paper is now shown as latest on the website.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-epapers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle Publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) => 
      toggleEPaperPublishStatus(id, isPublished),
    onSuccess: () => {
      toast({
        title: 'Publish Status Updated',
        description: 'E-paper publish status has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-epapers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      publish_date: new Date().toISOString().split('T')[0],
      image_url: '',
      pdf_url: '',
      is_latest: false,
      is_published: true
    });
    setIsEditing(false);
    setSelectedEpaper(null);
  };

  const handleEdit = (epaper: EPaper) => {
    setSelectedEpaper(epaper);
    setFormData({
      title: epaper.title,
      publish_date: epaper.publish_date,
      image_url: epaper.image_url,
      pdf_url: epaper.pdf_url,
      is_latest: epaper.is_latest,
      is_published: epaper.is_published !== false
    });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  // Auto Generation Functions
  const handleGenerateEPaper = async () => {
    if (!generationOptions.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title for the e-paper',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      generateMutation.mutate(generationOptions);
    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Handle Publish/Draft Actions
  const handlePublishEPaper = async () => {
    if (!generatedPdf) return;
    
    setPublishing(true);
    try {
      console.log('Publishing E-Paper with data:', {
        title: generatedPdf.title,
        publish_date: generatedPdf.date,
        pdf_url: generatedPdf.pdfUrl,
        image_url: '',
        is_latest: true,
        is_published: true
      });
      
      const result = await createEPaper({
        title: generatedPdf.title,
        publish_date: generatedPdf.date,
        pdf_url: generatedPdf.pdfUrl,
        image_url: '',
        is_latest: true,
        is_published: true
      });
      
      console.log('Publish result:', result);
      
      if (result.success) {
        toast({
          title: 'E-Paper Published!',
          description: 'E-Paper has been published and is now visible to users.',
        });
        setShowPdfPreview(false);
        setGeneratedPdf(null);
        queryClient.invalidateQueries({ queryKey: ['admin-epapers'] });
      } else {
        throw new Error(result.error || 'Failed to publish E-Paper');
      }
    } catch (error) {
      console.error('Publishing error:', error);
      toast({
        title: 'Publishing Failed',
        description: error instanceof Error ? error.message : 'Failed to publish E-Paper',
        variant: 'destructive',
      });
    }
    setPublishing(false);
  };

  const handleSaveDraft = async () => {
    if (!generatedPdf) return;
    
    setSavingDraft(true);
    try {
      console.log('Saving draft with data:', {
        title: generatedPdf.title,
        publish_date: generatedPdf.date,
        pdf_url: generatedPdf.pdfUrl,
        image_url: '',
        is_latest: false,
        is_published: false
      });
      
      const result = await createEPaper({
        title: generatedPdf.title,
        publish_date: generatedPdf.date,
        pdf_url: generatedPdf.pdfUrl,
        image_url: '',
        is_latest: false,
        is_published: false
      });
      
      console.log('Draft save result:', result);
      
      if (result.success) {
        toast({
          title: 'Draft Saved!',
          description: 'E-Paper has been saved as draft in Manage E-Papers tab.',
        });
        setShowPdfPreview(false);
        setGeneratedPdf(null);
        queryClient.invalidateQueries({ queryKey: ['admin-epapers'] });
      } else {
        throw new Error(result.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Draft save error:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save draft',
        variant: 'destructive',
      });
    }
    setSavingDraft(false);
  };

  // Preview Articles Function
  const handlePreviewArticles = async () => {
    try {
      const result = await getArticlesForEPaper({
        limit: generationOptions.maxArticles,
        categories: generationOptions.includeCategories,
        excludeCategories: generationOptions.excludeCategories
      });
      
      if (result.success) {
        setPreviewArticles(result.articles);
        toast({
          title: 'Article Preview Ready',
          description: `Found ${result.articles.length} articles for e-paper`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to preview articles',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <EnhancedAdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </EnhancedAdminLayout>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('epaper-management', 'E-Papers Management', 'ই-পেপার ব্যবস্থাপনা')}</h1>
            <p className="text-muted-foreground">{t('epaper-description', 'Create, generate and manage digital newspaper editions', 'ডিজিটাল সংবাদপত্র তৈরি, উৎপাদন এবং পরিচালনা করুন')}</p>
          </div>
        </div>

        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manage">{t('manage-epapers', 'Manage E-Papers', 'ই-পেপার পরিচালনা')}</TabsTrigger>
            <TabsTrigger value="auto-generate">{t('auto-generate', 'Auto Generate', 'স্বয়ংক্রিয় তৈরি')}</TabsTrigger>
            <TabsTrigger value="manual-create">{t('manual-create', 'Manual Create', 'ম্যানুয়াল তৈরি')}</TabsTrigger>
          </TabsList>

          {/* Manage E-Papers Tab */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>{t('published-epapers', 'Published E-Papers', 'প্রকাশিত ই-পেপার')}</CardTitle>
                <CardDescription>
                  {t('manage-epapers-desc', 'Manage existing e-papers and control what users see', 'বিদ্যমান ই-পেপার পরিচালনা করুন এবং ব্যবহারকারীরা কী দেখে তা নিয়ন্ত্রণ করুন')} {epapers?.length || 0}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {epapers?.map((epaper: EPaper) => (
                    <div key={epaper.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{epaper.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            <DateFormatter date={epaper.publish_date} />
                          </p>
                          <div className="flex gap-2 mt-1">
                            {epaper.is_latest && (
                              <Badge variant="default" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                {t('latest', 'Latest', 'সর্বশেষ')}
                              </Badge>
                            )}
                            {epaper.is_published && (
                              <Badge variant="secondary" className="text-xs">
                                {t('published', 'Published', 'প্রকাশিত')}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {epaper.pdf_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={epaper.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-1" />
                                PDF
                              </a>
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant={epaper.is_latest ? "default" : "outline"}
                            onClick={() => setLatestMutation.mutate(epaper.id!)}
                            disabled={setLatestMutation.isPending}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            {epaper.is_latest ? t('current-latest', 'Current Latest', 'বর্তমান সর্বশেষ') : t('set-as-latest', 'Set as Latest', 'সর্বশেষ হিসেবে সেট করুন')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant={epaper.is_published ? "destructive" : "default"}
                            onClick={() => togglePublishMutation.mutate({ 
                              id: epaper.id!, 
                              isPublished: !epaper.is_published 
                            })}
                            disabled={togglePublishMutation.isPending}
                          >
                            {epaper.is_published ? t('unpublish', 'Unpublish', 'অপ্রকাশিত') : t('publish', 'Publish', 'প্রকাশ')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(epaper)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteMutation.mutate(epaper.id!)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!epapers || epapers.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('no-epapers-found', 'No e-papers found', 'কোন ই-পেপার পাওয়া যায়নি')}</p>
                      <p className="text-sm">{t('create-first-epaper', 'Create your first e-paper using the tabs above', 'উপরের ট্যাব ব্যবহার করে আপনার প্রথম ই-পেপার তৈরি করুন')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auto Generate Tab */}
          <TabsContent value="auto-generate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {t('auto-generate-title', 'Auto Generate E-Paper from Articles', 'নিবন্ধ থেকে স্বয়ংক্রিয় ই-পেপার তৈরি')}
                </CardTitle>
                <CardDescription>
                  {t('auto-generate-desc', 'Generate e-paper automatically using articles from your Supabase database', 'আপনার সুপাবেস ডাটাবেস থেকে নিবন্ধ ব্যবহার করে স্বয়ংক্রিয়ভাবে ই-পেপার তৈরি করুন')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="auto-title">{t('epaper-title', 'E-Paper Title', 'ই-পেপার শিরোনাম')}</Label>
                    <Input
                      id="auto-title"
                      value={generationOptions.title}
                      onChange={(e) => setGenerationOptions(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('enter-epaper-title', 'Enter e-paper title', 'ই-পেপার শিরোনাম লিখুন')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="auto-date">{t('publication-date', 'Publication Date', 'প্রকাশের তারিখ')}</Label>
                    <Input
                      id="auto-date"
                      type="date"
                      value={generationOptions.date}
                      onChange={(e) => setGenerationOptions(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('layout-style', 'Layout Style', 'লেআউট স্টাইল')}</Label>
                    <div className="flex gap-2 mt-2">
                      {(['traditional', 'modern', 'magazine'] as const).map((layout) => (
                        <Button
                          key={layout}
                          size="sm"
                          variant={generationOptions.layout === layout ? "default" : "outline"}
                          onClick={() => setGenerationOptions(prev => ({ ...prev, layout }))}
                        >
                          {layout === 'traditional' ? t('traditional', 'Traditional', 'ঐতিহ্যবাহী') :
                           layout === 'modern' ? t('modern', 'Modern', 'আধুনিক') :
                           t('magazine', 'Magazine', 'ম্যাগাজিন')}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="max-articles">{t('max-articles', 'Max Articles', 'সর্বোচ্চ নিবন্ধ')}</Label>
                    <Input
                      id="max-articles"
                      type="number"
                      min="5"
                      max="20"
                      value={generationOptions.maxArticles}
                      onChange={(e) => setGenerationOptions(prev => ({ ...prev, maxArticles: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>{t('include-categories', 'Include Categories', 'বিভাগ অন্তর্ভুক্ত করুন')}</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories?.map((category: string) => (
                      <Button
                        key={category}
                        size="sm"
                        variant={generationOptions.includeCategories.includes(category) ? "default" : "outline"}
                        onClick={() => {
                          setGenerationOptions(prev => ({
                            ...prev,
                            includeCategories: prev.includeCategories.includes(category)
                              ? prev.includeCategories.filter(c => c !== category)
                              : [...prev.includeCategories, category]
                          }));
                        }}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handlePreviewArticles} variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    {t('preview-articles', 'Preview Articles', 'নিবন্ধ পূর্বরূপ')}
                  </Button>
                  <Button 
                    onClick={handleGenerateEPaper}
                    disabled={isGenerating || generateMutation.isPending}
                    className="flex-1"
                  >
                    {isGenerating || generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('generating', 'Generating...', 'তৈরি হচ্ছে...')}
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {t('generate-epaper', 'Generate E-Paper', 'ই-পেপার তৈরি করুন')}
                      </>
                    )}
                  </Button>
                </div>

                {previewArticles.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Article Preview ({previewArticles.length})</h4>
                    <div className="grid gap-2">
                      {previewArticles.slice(0, 5).map((article, index) => (
                        <div key={article.id} className="text-sm p-2 bg-muted rounded">
                          <span className="font-medium">{index + 1}. {article.title}</span>
                          <span className="text-muted-foreground ml-2">({article.category})</span>
                        </div>
                      ))}
                      {previewArticles.length > 5 && (
                        <p className="text-sm text-muted-foreground">
                          + {previewArticles.length - 5} more articles
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* PDF Preview Section */}
                {showPdfPreview && generatedPdf && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <FileText className="w-5 h-5" />
                        PDF Generated Successfully
                      </CardTitle>
                      <CardDescription>
                        Preview your generated E-Paper and choose to publish or save as draft
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">E-Paper Details</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Title:</strong> {generatedPdf.title}</p>
                            <p><strong>Date:</strong> {generatedPdf.date}</p>
                            <p><strong>Status:</strong> Ready for publishing</p>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4 bg-white">
                          <h4 className="font-medium mb-2">PDF Preview</h4>
                          {generatedPdf.pdfUrl ? (
                            <div className="space-y-2">
                              <iframe
                                src={generatedPdf.pdfUrl}
                                className="w-full h-32 border rounded"
                                title="PDF Preview"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(generatedPdf.pdfUrl, '_blank')}
                                className="w-full"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                View Full PDF
                              </Button>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">PDF ready for download</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-4 pt-4 border-t">
                        <Button
                          onClick={handlePublishEPaper}
                          disabled={publishing}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {publishing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Publishing...
                            </>
                          ) : (
                            <>
                              <Newspaper className="w-4 h-4 mr-2" />
                              Publish Now
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleSaveDraft}
                          disabled={savingDraft}
                          variant="outline"
                          className="flex-1"
                        >
                          {savingDraft ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4 mr-2" />
                              Save as Draft
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowPdfPreview(false);
                            setGeneratedPdf(null);
                          }}
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Create Tab */}
          <TabsContent value="manual-create">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? 'Edit E-Paper' : 'Create New E-Paper'}</CardTitle>
                <CardDescription>
                  Manually create or edit e-paper with custom PDF and image URLs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter e-paper title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="publish_date">Publish Date</Label>
                    <Input
                      id="publish_date"
                      type="date"
                      value={formData.publish_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, publish_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="pdf_url">PDF URL</Label>
                    <Input
                      id="pdf_url"
                      value={formData.pdf_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, pdf_url: e.target.value }))}
                      placeholder="Enter PDF URL"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">Cover Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="Enter cover image URL"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_latest"
                      checked={formData.is_latest}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_latest: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="is_latest">Set as latest e-paper</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="is_published">Publish immediately</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={saveMutation.isPending}
                      className="flex-1"
                    >
                      {saveMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          {isEditing ? 'Update E-Paper' : 'Create E-Paper'}
                        </>
                      )}
                    </Button>
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAdminLayout>
  );
}