import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Loader2, 
  FileText,
  Download,
  Star,
  Edit,
  Trash2,
  Eye,
  Newspaper,
  Settings,
  Play,
  Save,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateFormatter } from '@/components/DateFormatter';
import { useLanguage } from '@/contexts/LanguageContext';
import { adminSupabaseAPI } from '@/lib/admin';
import { epaperService, type EPaperGenerationOptions as ServiceOptions } from '@/services/epaperService';

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

interface EPaperGenerationOptions {
  title: string;
  date: string;
  layout: string;
  includeCategories: string[];
  excludeCategories: string[];
  maxArticles: number;
  includeBreakingNews: boolean;
  includeWeather: boolean;
  includedSections: string[];
}

interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
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

  // E-Paper Generation States
  const [generationOptions, setGenerationOptions] = useState<EPaperGenerationOptions>({
    title: 'বাংলা সংবাদপত্র',
    date: new Date().toISOString().split('T')[0],
    layout: 'traditional',
    includeCategories: [],
    excludeCategories: [],
    maxArticles: 12,
    includeBreakingNews: true,
    includeWeather: true,
    includedSections: ['জাতীয়', 'আন্তর্জাতিক', 'রাজনীতি']
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedPdf, setGeneratedPdf] = useState<{
    pdfUrl: string;
    title: string;
    date: string;
    articleCount: number;
  } | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<LayoutTemplate[]>([]);
  const [previewArticles, setPreviewArticles] = useState<any[]>([]);

  // Fetch e-papers using direct admin API
  const { data: epapersData, isLoading, error } = useQuery({
    queryKey: ['admin-epapers'],
    queryFn: adminSupabaseAPI.epapers.getAll,
  });

  // Extract e-papers array from the response
  const epapers = epapersData || [];

  // Fetch templates and categories for generation
  useEffect(() => {
    const fetchGenerationData = async () => {
      try {
        console.log('🔄 Fetching generation data using direct Supabase service');
        
        // Fetch templates directly from service
        const templates = epaperService.getAvailableTemplates();
        setAvailableTemplates(templates);

        // Fetch categories directly from Supabase
        const categories = await epaperService.fetchCategories();
        setAvailableCategories(categories);
        
        console.log('✅ Generation data loaded successfully');
      } catch (error) {
        console.error('❌ Error fetching generation data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load generation data. Please refresh the page.',
          variant: 'destructive',
        });
      }
    };

    fetchGenerationData();
  }, []);

  // Create/Update mutation using direct admin API
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isEditing && selectedEpaper) {
        return await adminSupabaseAPI.epapers.update(selectedEpaper.id!, data);
      } else {
        return await adminSupabaseAPI.epapers.create(data);
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
    mutationFn: (id: number) => adminSupabaseAPI.epapers.delete(id),
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

  // Set Latest mutation
  const setLatestMutation = useMutation({
    mutationFn: (id: number) => adminSupabaseAPI.epapers.setAsLatest(id),
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
      adminSupabaseAPI.epapers.update(id, { is_published: isPublished }),
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
      image_url: epaper.image_url || '',
      pdf_url: epaper.pdf_url || '',
      is_latest: epaper.is_latest,
      is_published: epaper.is_published !== false
    });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  // E-Paper Generation Functions
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
      console.log('🚀 Generating e-paper using direct Supabase service');
      setGenerationProgress(30);

      const result = await epaperService.generateEPaper(generationOptions);
      setGenerationProgress(80);

      if (result.success) {
        setGeneratedPdf({
          pdfUrl: result.pdfUrl!,
          title: result.title,
          date: result.date,
          articleCount: result.articleCount
        });
        setGenerationProgress(100);
        
        toast({
          title: 'E-paper Generated Successfully!',
          description: `Generated with ${result.articleCount} articles using direct database access.`,
        });
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      console.error('❌ Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  };

  const handlePreviewArticles = async () => {
    try {
      console.log('🔄 Fetching preview articles using direct Supabase service');
      
      const result = await epaperService.previewArticles(generationOptions);
      
      setPreviewArticles(result.articles || []);
      toast({
        title: 'Preview Updated',
        description: `Found ${result.totalCount} articles matching your criteria using direct database access.`,
      });
      
    } catch (error) {
      console.error('❌ Preview error:', error);
      toast({
        title: 'Preview Failed',
        description: error instanceof Error ? error.message : 'Could not fetch article preview',
        variant: 'destructive',
      });
    }
  };

  const handlePublishGenerated = async () => {
    if (!generatedPdf) return;

    try {
      console.log('🚀 Publishing generated e-paper using direct Supabase API');
      
      const publishData = {
        title: generatedPdf.title,
        publish_date: generatedPdf.date,
        pdf_url: `data:text/html;charset=utf-8,${encodeURIComponent(`
          <html>
            <head><title>${generatedPdf.title}</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h1>${generatedPdf.title}</h1>
              <p>Date: ${generatedPdf.date}</p>
              <p>Articles: ${generatedPdf.articleCount}</p>
              <p><em>Generated e-paper content</em></p>
            </body>
          </html>
        `)}`,
        image_url: '',
        is_latest: true,
        is_published: true
      };

      // Use adminSupabaseAPI directly instead of mutation
      const result = await adminSupabaseAPI.createEPaper(publishData);
      
      if (result.success) {
        setGeneratedPdf(null);
        toast({
          title: 'E-Paper Published!',
          description: 'Generated e-paper has been published successfully.',
        });
        
        // Refresh the list
        queryClient.invalidateQueries({ queryKey: ['/api/admin/epapers'] });
      } else {
        throw new Error(result.error || 'Failed to publish');
      }
    } catch (error) {
      console.error('❌ Publish error:', error);
      toast({
        title: 'Publish Failed',
        description: error instanceof Error ? error.message : 'Could not publish the generated e-paper',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedPdf) return;

    try {
      console.log('💾 Saving generated e-paper as draft using direct Supabase API');
      
      const draftData = {
        title: `[DRAFT] ${generatedPdf.title}`,
        publish_date: generatedPdf.date,
        pdf_url: `data:text/html;charset=utf-8,${encodeURIComponent(`
          <html>
            <head><title>[DRAFT] ${generatedPdf.title}</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h1>[DRAFT] ${generatedPdf.title}</h1>
              <p>Date: ${generatedPdf.date}</p>
              <p>Articles: ${generatedPdf.articleCount}</p>
              <p><em>Generated e-paper content (Draft)</em></p>
            </body>
          </html>
        `)}`,
        image_url: '',
        is_latest: false,
        is_published: false
      };

      // Use adminSupabaseAPI directly instead of mutation
      const result = await adminSupabaseAPI.createEPaper(draftData);
      
      if (result.success) {
        setGeneratedPdf(null);
        toast({
          title: 'Draft Saved!',
          description: 'Generated e-paper has been saved as draft.',
        });
        
        // Refresh the list
        queryClient.invalidateQueries({ queryKey: ['/api/admin/epapers'] });
      } else {
        throw new Error(result.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('❌ Save draft error:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Could not save the generated e-paper as draft',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <EnhancedAdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </EnhancedAdminLayout>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">E-Paper Management</h1>
            <p className="text-muted-foreground">
              Create and manage digital newspaper editions
            </p>
          </div>
        </div>

        <Tabs defaultValue="manage" className="space-y-6">
          <TabsList>
            <TabsTrigger value="manage">Manage E-Papers ({epapers.length})</TabsTrigger>
            <TabsTrigger value="generate">Generate From Articles</TabsTrigger>
            <TabsTrigger value="create">Create Manual E-Paper</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            {epapers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No e-papers found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first e-paper to get started
                  </p>
                  <Button onClick={() => {
                    const createTab = document.querySelector('[value="create"]') as HTMLElement;
                    createTab?.click();
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First E-Paper
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {epapers.map((epaper: EPaper) => (
                  <Card key={epaper.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{epaper.title}</h3>
                            {epaper.is_latest && (
                              <Badge variant="default">
                                <Star className="w-3 h-3 mr-1" />
                                Latest
                              </Badge>
                            )}
                            <Badge variant={epaper.is_published ? "default" : "secondary"}>
                              {epaper.is_published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <DateFormatter date={epaper.publish_date} />
                          </p>
                          {epaper.pdf_url && (
                            <p className="text-sm text-muted-foreground">
                              PDF: {epaper.pdf_url}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {epaper.pdf_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(epaper.pdf_url, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          )}
                          {!epaper.is_latest && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLatestMutation.mutate(epaper.id)}
                              disabled={setLatestMutation.isPending}
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Set Latest
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePublishMutation.mutate({
                              id: epaper.id,
                              isPublished: !epaper.is_published
                            })}
                            disabled={togglePublishMutation.isPending}
                          >
                            {epaper.is_published ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(epaper)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this e-paper?')) {
                                deleteMutation.mutate(epaper.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  Auto-Generate E-Paper from Articles
                </CardTitle>
                <CardDescription>
                  Create professional newspaper-style e-papers automatically from your published articles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Generation Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gen-title">E-Paper Title</Label>
                      <Input
                        id="gen-title"
                        value={generationOptions.title}
                        onChange={(e) => setGenerationOptions(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter newspaper title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gen-date">Publication Date</Label>
                      <Input
                        id="gen-date"
                        type="date"
                        value={generationOptions.date}
                        onChange={(e) => setGenerationOptions(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gen-layout">Layout Template</Label>
                      <Select 
                        value={generationOptions.layout} 
                        onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, layout: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select layout" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} - {template.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gen-max-articles">Maximum Articles</Label>
                      <Input
                        id="gen-max-articles"
                        type="number"
                        min="5"
                        max="50"
                        value={generationOptions.maxArticles}
                        onChange={(e) => setGenerationOptions(prev => ({ ...prev, maxArticles: parseInt(e.target.value) || 12 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>Include Categories</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {availableCategories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`include-${category}`}
                              checked={generationOptions.includeCategories.includes(category)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setGenerationOptions(prev => ({
                                    ...prev,
                                    includeCategories: [...prev.includeCategories, category]
                                  }));
                                } else {
                                  setGenerationOptions(prev => ({
                                    ...prev,
                                    includeCategories: prev.includeCategories.filter(c => c !== category)
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`include-${category}`} className="text-sm">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Additional Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-breaking"
                            checked={generationOptions.includeBreakingNews}
                            onCheckedChange={(checked) => 
                              setGenerationOptions(prev => ({ ...prev, includeBreakingNews: !!checked }))
                            }
                          />
                          <Label htmlFor="include-breaking">Include Breaking News</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-weather"
                            checked={generationOptions.includeWeather}
                            onCheckedChange={(checked) => 
                              setGenerationOptions(prev => ({ ...prev, includeWeather: !!checked }))
                            }
                          />
                          <Label htmlFor="include-weather">Include Weather Information</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generation Progress */}
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Generation Progress</Label>
                      <span className="text-sm text-muted-foreground">{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} className="w-full" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handlePreviewArticles}
                    variant="outline"
                    disabled={isGenerating}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Articles ({previewArticles.length})
                  </Button>
                  
                  <Button
                    onClick={handleGenerateEPaper}
                    disabled={isGenerating || !generationOptions.title.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Generate E-Paper
                      </>
                    )}
                  </Button>
                </div>

                {/* Generated PDF Preview */}
                {generatedPdf && (
                  <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="text-green-800 dark:text-green-200">
                        E-Paper Generated Successfully!
                      </CardTitle>
                      <CardDescription>
                        {generatedPdf.title} - {generatedPdf.articleCount} articles included
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => {
                            // Create a proper preview window with the HTML content
                            const previewWindow = window.open('', '_blank');
                            if (previewWindow) {
                              // Get the HTML content from the blob URL
                              fetch(generatedPdf.pdfUrl)
                                .then(response => response.text())
                                .then(html => {
                                  previewWindow.document.write(html);
                                  previewWindow.document.close();
                                })
                                .catch(() => {
                                  previewWindow.document.write(`
                                    <html>
                                      <head><title>E-Paper Preview</title></head>
                                      <body style="font-family: Arial, sans-serif; padding: 20px;">
                                        <h1>${generatedPdf.title}</h1>
                                        <p>Date: ${generatedPdf.date}</p>
                                        <p>Articles: ${generatedPdf.articleCount}</p>
                                        <p><em>Preview content will be available after generation is complete.</em></p>
                                      </body>
                                    </html>
                                  `);
                                  previewWindow.document.close();
                                });
                            }
                          }}
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview E-Paper
                        </Button>
                        
                        <Button
                          onClick={handlePublishGenerated}
                          disabled={saveMutation.isPending}
                        >
                          {saveMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Publish Now
                        </Button>
                        
                        <Button
                          onClick={handleSaveDraft}
                          variant="outline"
                          disabled={saveMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save as Draft
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Preview Articles */}
                {previewArticles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Article Preview ({previewArticles.length} articles)</CardTitle>
                      <CardDescription>
                        These articles will be included in the generated e-paper
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {previewArticles.map((article, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <h4 className="font-medium">{article.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {article.categories?.name || article.category || 'সাধারণ'} • {article.author}
                              </p>
                            </div>  
                            <Badge variant="outline">{article.categories?.name || article.category || 'সাধারণ'}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {isEditing ? 'Edit E-Paper' : 'Create New E-Paper'}
                </CardTitle>
                <CardDescription>
                  {isEditing ? 'Update e-paper details' : 'Add a new digital newspaper edition'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter e-paper title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="publish_date">Publish Date</Label>
                      <Input
                        id="publish_date"
                        type="date"
                        value={formData.publish_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, publish_date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pdf_url">PDF URL</Label>
                    <Input
                      id="pdf_url"
                      value={formData.pdf_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, pdf_url: e.target.value }))}
                      placeholder="Enter PDF URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL (Optional)</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="Enter image URL for thumbnail"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_latest"
                        checked={formData.is_latest}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_latest: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="is_latest">Mark as latest edition</Label>
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
                  </div>

                  <div className="flex gap-2 pt-4">
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={saveMutation.isPending}
                    >
                      {saveMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          {isEditing ? 'Update E-Paper' : 'Create E-Paper'}
                        </>
                      )}
                    </Button>
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