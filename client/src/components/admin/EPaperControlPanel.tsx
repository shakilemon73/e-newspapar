import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Loader2, 
  FileText,
  Calendar,
  Download,
  Star,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAdminEPapers, createEPaper, updateEPaper, deleteEPaper } from '@/lib/admin-api-direct';
import { DateFormatter } from '@/components/DateFormatter';
import { useLanguage } from '@/contexts/LanguageContext';

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

const EPaperControlPanel = () => {
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

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this e-paper?')) {
      deleteMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error loading e-papers. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('E-Papers Management', 'ই-পেপার ব্যবস্থাপনা')}</h1>
          <p className="text-muted-foreground">
            {t('Create and manage digital newspaper editions', 'ডিজিটাল সংবাদপত্রের সংস্করণ তৈরি এবং পরিচালনা করুন')}
          </p>
        </div>
        <Button onClick={() => window.location.href = '/admin/epaper-generator'}>
          <Plus className="h-4 w-4 mr-2" />
          {t('Generate E-Paper', 'ই-পেপার তৈরি করুন')}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Create/Edit E-Paper Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? t('Edit E-Paper', 'ই-পেপার সম্পাদনা') : t('Create New E-Paper', 'নতুন ই-পেপার তৈরি করুন')}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? t('Update the e-paper information', 'ই-পেপারের তথ্য আপডেট করুন')
                : t('Add a new digital newspaper edition', 'নতুন ডিজিটাল সংবাদপত্রের সংস্করণ যোগ করুন')
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('Title', 'শিরোনাম')}</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('Enter e-paper title', 'ই-পেপারের শিরোনাম লিখুন')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publish_date">{t('Publish Date', 'প্রকাশের তারিখ')}</Label>
                  <Input
                    id="publish_date"
                    type="date"
                    value={formData.publish_date}
                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">{t('Image URL', 'ছবির লিংক')}</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder={t('Enter image URL', 'ছবির লিংক লিখুন')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pdf_url">{t('PDF URL', 'পিডিএফ লিংক')}</Label>
                  <Input
                    id="pdf_url"
                    type="url"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    placeholder={t('Enter PDF URL', 'পিডিএফ লিংক লিখুন')}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="is_latest"
                  type="checkbox"
                  checked={formData.is_latest}
                  onChange={(e) => setFormData({ ...formData, is_latest: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_latest">{t('Mark as Latest', 'সর্বশেষ হিসেবে চিহ্নিত করুন')}</Label>
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? t('Update E-Paper', 'ই-পেপার আপডেট') : t('Create E-Paper', 'ই-পেপার তৈরি')}
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
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">{t('Loading e-papers...', 'ই-পেপার লোড হচ্ছে...')}</span>
              </div>
            ) : (
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
                      <div className="flex space-x-2">
                        {epaper.pdf_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(epaper.pdf_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
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
                          onClick={() => handleDelete(epaper.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!epapers || epapers.length === 0) && (
                  <div className="text-center p-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('No e-papers found', 'কোন ই-পেপার পাওয়া যায়নি')}</p>
                    <p className="text-sm">{t('Create your first e-paper to get started', 'শুরু করতে আপনার প্রথম ই-পেপার তৈরি করুন')}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EPaperControlPanel;