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
import { getAdminEPapers, createEPaper, updateEPaper, deleteEPaper } from '@/lib/admin-api-direct';
import { DateFormatter } from '@/components/DateFormatter';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  generateEnhancedEpaper, 
  checkLaTeXStatus, 
  getAvailableCategories,
  type LaTeXGenerationResult 
} from '@/lib/latex-epaper-direct';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EPaper {
  id: number;
  title: string;
  publish_date: string;
  image_url: string;
  pdf_url: string;
  is_latest: boolean;
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
    is_latest: false
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // E-Paper Generator States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customTitle, setCustomTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Fetch e-papers using direct admin API
  const { data: epapersData, isLoading, error } = useQuery({
    queryKey: ['admin-epapers'],
    queryFn: () => getAdminEPapers(),
  });

  // Extract e-papers array from the response
  const epapers = epapersData?.epapers || [];

  // Create/Update mutation using direct admin API
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isEditing && selectedEpaper) {
        return updateEPaper(selectedEpaper.id, data);
      } else {
        return createEPaper(data);
      }
    },
    onSuccess: () => {
      toast({
        title: `E-paper ${isEditing ? 'updated' : 'created'}`,
        description: `The e-paper has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      resetForm();
      // Invalidate and refetch e-paper-related queries
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
    mutationFn: (id: number) => deleteEPaper(id),
    onSuccess: () => {
      toast({
        title: 'E-paper deleted',
        description: 'The e-paper has been deleted successfully.',
      });
      // Invalidate and refetch e-paper-related queries  
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

  const resetForm = () => {
    setFormData({
      title: '',
      publish_date: new Date().toISOString().split('T')[0],
      image_url: '',
      pdf_url: '',
      is_latest: false
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
      is_latest: epaper.is_latest
    });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  // Enhanced LaTeX E-Paper Generation with AI
  const [generationType, setGenerationType] = useState<'standard' | 'ai-enhanced' | 'premium'>('ai-enhanced');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch categories for AI-enhanced generation
  const { data: categoriesData } = useQuery({
    queryKey: ['epaper-categories'],
    queryFn: () => getAvailableCategories(),
  });

  const categories = categoriesData?.categories || [];

  // Enhanced LaTeX E-Paper Generation
  const handleGenerateEPaper = async () => {
    if (!customTitle.trim()) {
      toast({
        title: t('Error', 'ত্রুটি'),
        description: t('Please enter a title for the e-paper', 'ই-পেপারের জন্য একটি শিরোনাম লিখুন'),
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const displayTitle = customTitle || `বাংলা দৈনিক - ${format(selectedDate, 'MMMM d, yyyy')}`;
      
      setGenerationProgress(25);
      
      // Call the enhanced LaTeX e-paper generator
      const result = await generateEnhancedEpaper({
        title: displayTitle,
        date: formattedDate,
        generationType,
        categoryPriority: selectedCategories.length > 0 ? selectedCategories : undefined,
        customization: {
          layout: 'traditional',
          columns: 3,
          colorScheme: 'professional'
        }
      });

      setGenerationProgress(70);

      if (result.success && result.pdfUrl) {
        // Refresh the e-papers list
        queryClient.invalidateQueries({ queryKey: ['admin-epapers'] });
        
        setGenerationProgress(90);
        
        toast({
          title: t('Success! 🎉', 'সফল! 🎉'),
          description: t(`${generationType === 'ai-enhanced' ? 'AI-Enhanced' : 'Professional'} LaTeX e-paper "${displayTitle}" generated successfully.`, `${generationType === 'ai-enhanced' ? 'AI-উন্নত' : 'পেশাদার'} LaTeX ই-পেপার "${displayTitle}" সফলভাবে তৈরি।`),
        });

        // Reset form
        setCustomTitle('');
        setSelectedDate(new Date());
        setSelectedCategories([]);
        
        setGenerationProgress(100);
        
        // Optional: Download the PDF automatically
        if (result.pdfUrl) {
          const link = document.createElement('a');
          link.href = result.pdfUrl;
          link.download = `${displayTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // Show AI metrics if available
        if (result.aiMetrics) {
          toast({
            title: t('AI Generation Details', 'AI তৈরির বিস্তারিত'),
            description: t(`Selected ${result.aiMetrics.articlesSelected}/${result.aiMetrics.articlesConsidered} articles with ${Math.round(result.aiMetrics.diversityScore * 100)}% diversity score`, `${Math.round(result.aiMetrics.diversityScore * 100)}% বৈচিত্র্য স্কোর সহ ${result.aiMetrics.articlesSelected}/${result.aiMetrics.articlesConsidered} নিবন্ধ নির্বাচিত`),
          });
        }
        
      } else {
        throw new Error(result.error || 'Failed to generate LaTeX e-paper');
      }
    } catch (error) {
      console.error('LaTeX e-paper generation failed:', error);
      toast({
        title: t('Generation Failed', 'তৈরি করতে ব্যর্থ'),
        description: error instanceof Error ? error.message : t('Failed to generate LaTeX e-paper', 'LaTeX ই-পেপার তৈরি করতে ব্যর্থ'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('Manage E-Papers', 'ই-পেপার পরিচালনা')}
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {t('Generate E-Paper', 'ই-পেপার তৈরি করুন')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  {t('Generate New E-Paper', 'নতুন ই-পেপার তৈরি করুন')}
                </CardTitle>
                <CardDescription>
                  {t('Create a new digital newspaper edition automatically from latest articles', 'সর্বশেষ নিবন্ধ থেকে স্বয়ংক্রিয়ভাবে একটি নতুন ডিজিটাল সংবাদপত্র সংস্করণ তৈরি করুন')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>{t('Publication Date', 'প্রকাশের তারিখ')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>{t('Pick a date', 'তারিখ নির্বাচন করুন')}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="customTitle">{t('Custom Title (Optional)', 'কাস্টম শিরোনাম (ঐচ্ছিক)')}</Label>
                      <Input
                        id="customTitle"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder={t('Enter custom title for the e-paper', 'ই-পেপারের জন্য কাস্টম শিরোনাম লিখুন')}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">{t('Generation Preview', 'তৈরির পূর্বরূপ')}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>{t('Date:', 'তারিখ:')}</strong> {format(selectedDate, 'dd/MM/yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>{t('Title:', 'শিরোনাম:')}</strong> {customTitle || `Bengali News - ${format(selectedDate, 'yyyy-MM-dd')}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('This will create a PDF with latest articles and automatically save to database', 'এটি সর্বশেষ নিবন্ধ সহ একটি পিডিএফ তৈরি করবে এবং স্বয়ংক্রিয়ভাবে ডাটাবেসে সংরক্ষণ করবে')}
                      </p>
                    </div>

                    {isGenerating && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('Generating...', 'তৈরি হচ্ছে...')}</span>
                          <span>{generationProgress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${generationProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleGenerateEPaper}
                      disabled={isGenerating}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('Generating E-Paper...', 'ই-পেপার তৈরি হচ্ছে...')}
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          {t('Generate E-Paper', 'ই-পেপার তৈরি করুন')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? t('Edit E-Paper', 'ই-পেপার সম্পাদনা') : t('Create E-Paper', 'ই-পেপার তৈরি করুন')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">{t('Title', 'শিরোনাম')}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="publish_date">{t('Publish Date', 'প্রকাশের তারিখ')}</Label>
                  <Input
                    id="publish_date"
                    type="date"
                    value={formData.publish_date}
                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image_url">{t('Image URL', 'ছবির URL')}</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="pdf_url">{t('PDF URL', 'PDF URL')}</Label>
                  <Input
                    id="pdf_url"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    placeholder="https://example.com/epaper.pdf"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_latest"
                    checked={formData.is_latest}
                    onChange={(e) => setFormData({ ...formData, is_latest: e.target.checked })}
                  />
                  <Label htmlFor="is_latest">{t('Latest Issue', 'সর্বশেষ সংস্করণ')}</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? t('Update', 'আপডেট') : t('Create', 'তৈরি করুন')}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      {t('Cancel', 'বাতিল')}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* E-Papers List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('E-Papers List', 'ই-পেপারের তালিকা')}</CardTitle>
              <CardDescription>
                {t('Total E-Papers:', 'মোট ই-পেপার:')} {epapers?.length || 0}
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
                        {epaper.is_latest && (
                          <Badge variant="default" className="mt-1">
                            <Star className="w-3 h-3 mr-1" />
                            {t('Latest', 'সর্বশেষ')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {epaper.pdf_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={epaper.pdf_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEdit(epaper)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteMutation.mutate(epaper.id)}
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
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('No e-papers found', 'কোন ই-পেপার পাওয়া যায়নি')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAdminLayout>
  );
}