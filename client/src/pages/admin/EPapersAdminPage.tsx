import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
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

  // Delete mutation using direct admin API
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEPaper(id),
    onSuccess: () => {
      toast({
        title: 'E-paper deleted',
        description: 'The e-paper has been deleted successfully.',
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
            <p className="text-muted-foreground">{t('Manage digital newspaper editions', 'ডিজিটাল সংবাদপত্র সংস্করণ পরিচালনা করুন')}</p>
          </div>
        </div>

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
      </div>
    </EnhancedAdminLayout>
  );
}