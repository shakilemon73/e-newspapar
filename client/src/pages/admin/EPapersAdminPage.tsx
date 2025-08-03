import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Loader2, 
  FileText,
  Download,
  Star,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateFormatter } from '@/components/DateFormatter';
import { useLanguage } from '@/contexts/LanguageContext';
import { adminSupabaseAPI } from '@/lib/admin';

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

  // Fetch e-papers using direct admin API
  const { data: epapersData, isLoading, error } = useQuery({
    queryKey: ['admin-epapers'],
    queryFn: adminSupabaseAPI.epapers.getAll,
  });

  // Extract e-papers array from the response
  const epapers = epapersData || [];

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
            <TabsTrigger value="create">Create New E-Paper</TabsTrigger>
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