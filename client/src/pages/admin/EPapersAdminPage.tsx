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
import { 
  getAdminEPapers,
  createEPaper,
  updateEPaper,
  deleteEPaper,
  setLatestEPaper,
  toggleEPaperPublishStatus,
  generateEPaperFromArticles,
  getArticlesForEPaper,
  type EPaperGenerationOptions,
  type EPaperData
} from '@/lib/epaper-admin-api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Use EPaperData from the API module
type EPaper = EPaperData;

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
      toast({
        title: 'E-paper Generated Successfully!',
        description: `Generated with ${result.articleCount} articles`,
      });
      setIsGenerating(false);
      setGenerationProgress(0);
      queryClient.invalidateQueries({ queryKey: ['admin-epapers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
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
            <h1 className="text-2xl font-bold">{t('E-Papers Management', 'ই-পেপার ব্যবস্থাপনা')}</h1>
            <p className="text-muted-foreground">{t('Create, generate and manage digital newspaper editions', 'ডিজিটাল সংবাদপত্র তৈরি, উৎপাদন এবং পরিচালনা করুন')}</p>
          </div>
        </div>

        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manage">{t('Manage E-Papers', 'ই-পেপার পরিচালনা')}</TabsTrigger>
            <TabsTrigger value="auto-generate">{t('Auto Generate', 'স্বয়ংক্রিয় তৈরি')}</TabsTrigger>
            <TabsTrigger value="manual-create">{t('Manual Create', 'ম্যানুয়াল তৈরি')}</TabsTrigger>
          </TabsList>

          {/* Manage E-Papers Tab */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>{t('Published E-Papers', 'প্রকাশিত ই-পেপার')}</CardTitle>
                <CardDescription>
                  {t('Manage existing e-papers and control what users see', 'বিদ্যমান ই-পেপার পরিচালনা করুন এবং ব্যবহারকারীরা কী দেখে তা নিয়ন্ত্রণ করুন')} {epapers?.length || 0}
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
                                {t('Latest', 'সর্বশেষ')}
                              </Badge>
                            )}
                            {epaper.is_published && (
                              <Badge variant="secondary" className="text-xs">
                                {t('Published', 'প্রকাশিত')}
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
                            {epaper.is_latest ? t('Current Latest', 'বর্তমান সর্বশেষ') : t('Set as Latest', 'সর্বশেষ হিসেবে সেট করুন')}
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
                            {epaper.is_published ? t('Unpublish', 'অপ্রকাশিত') : t('Publish', 'প্রকাশ')}
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
                      <p>{t('No e-papers found', 'কোন ই-পেপার পাওয়া যায়নি')}</p>
                      <p className="text-sm">{t('Create your first e-paper using the tabs above', 'উপরের ট্যাব ব্যবহার করে আপনার প্রথম ই-পেপার তৈরি করুন')}</p>
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
                  {t('Auto Generate E-Paper from Articles', 'নিবন্ধ থেকে স্বয়ংক্রিয় ই-পেপার তৈরি')}
                </CardTitle>
                <CardDescription>
                  {t('Generate e-paper automatically using articles from your Supabase database', 'আপনার সুপাবেস ডাটাবেস থেকে নিবন্ধ ব্যবহার করে স্বয়ংক্রিয়ভাবে ই-পেপার তৈরি করুন')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="auto-title">{t('E-Paper Title', 'ই-পেপার শিরোনাম')}</Label>
                    <Input
                      id="auto-title"
                      value={generationOptions.title}
                      onChange={(e) => setGenerationOptions(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('Enter e-paper title', 'ই-পেপার শিরোনাম লিখুন')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="auto-date">{t('Publication Date', 'প্রকাশের তারিখ')}</Label>
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
                    <Label>{t('Layout Style', 'লেআউট স্টাইল')}</Label>
                    <div className="flex gap-2 mt-2">
                      {(['traditional', 'modern', 'magazine'] as const).map((layout) => (
                        <Button
                          key={layout}
                          size="sm"
                          variant={generationOptions.layout === layout ? "default" : "outline"}
                          onClick={() => setGenerationOptions(prev => ({ ...prev, layout }))}
                        >
                          {layout === 'traditional' ? t('Traditional', 'ঐতিহ্যবাহী') :
                           layout === 'modern' ? t('Modern', 'আধুনিক') :
                           t('Magazine', 'ম্যাগাজিন')}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="max-articles">{t('Max Articles', 'সর্বোচ্চ নিবন্ধ')}</Label>
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
                  <Label>{t('Include Categories', 'বিভাগ অন্তর্ভুক্ত করুন')}</Label>
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
                    {t('Preview Articles', 'নিবন্ধ পূর্বরূপ')}
                  </Button>
                  <Button 
                    onClick={handleGenerateEPaper}
                    disabled={isGenerating || generateMutation.isPending}
                    className="flex-1"
                  >
                    {isGenerating || generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('Generating...', 'তৈরি হচ্ছে...')}
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {t('Generate E-Paper', 'ই-পেপার তৈরি করুন')}
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