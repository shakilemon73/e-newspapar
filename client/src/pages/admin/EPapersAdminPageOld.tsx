import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Loader2, 
  ImageIcon, 
  FileText,
  Calendar,
  AlertCircle,
  Download,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAdminEPapers, createEPaper, updateEPaper, deleteEPaper } from '@/lib/admin-api-direct';
import { useQueryClient } from '@tanstack/react-query';
import { DateFormatter } from '@/components/DateFormatter';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const epaperFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  publish_date: z.string().min(1, 'Publish date is required'),
  image_url: z.string().url('Please enter a valid image URL'),
  pdf_url: z.string().url('Please enter a valid PDF URL'),
  is_latest: z.boolean().default(false),
});

type EpaperFormValues = z.infer<typeof epaperFormSchema>;

const epaperColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { 
    key: 'title', 
    label: 'Title', 
    sortable: true,
    render: (value: string) => (
      <div className="font-medium">{value}</div>
    )
  },
  { 
    key: 'publishDate', 
    label: 'Publish Date', 
    sortable: true,
    render: (value: string) => <DateFormatter date={value} type="relative" />
  },
  { 
    key: 'isLatest', 
    label: 'Status', 
    sortable: true,
    render: (value: boolean) => (
      <Badge variant={value ? 'default' : 'secondary'}>
        {value ? (
          <><Star className="h-3 w-3 mr-1" /> Latest</>
        ) : (
          'Archived'
        )}
      </Badge>
    )
  },
  { 
    key: 'imageUrl', 
    label: 'Preview', 
    render: (value: string) => (
      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
        <img 
          src={value} 
          alt="E-paper preview" 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
    )
  },
];

export default function EPapersAdminPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEpaper, setSelectedEpaper] = useState<any>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [epaperToDelete, setEpaperToDelete] = useState<any>(null);

  const form = useForm<EpaperFormValues>({
    resolver: zodResolver(epaperFormSchema),
    defaultValues: {
      title: '',
      publish_date: new Date().toISOString().split('T')[0],
      image_url: '',
      pdf_url: '',
      is_latest: false,
    },
  });

  // Fetch e-papers using direct admin API
  const queryClient = useQueryClient();
  const { data: epapers, isLoading, error } = useQuery({
    queryKey: ['admin-epapers'],
    queryFn: () => getAdminEPapers(),
  });

  // Create/Update mutation using direct admin API
  const saveMutation = useMutation({
    mutationFn: async (data: EpaperFormValues) => {
      if (mode === 'create') {
        return createEPaper(data);
      } else {
        return updateEPaper(selectedEpaper.id, data);
      }
    },
    onSuccess: () => {
      toast({
        title: `E-paper ${mode === 'create' ? 'created' : 'updated'}`,
        description: `The e-paper has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      setDialogOpen(false);
      form.reset();
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/epapers/${id}`);
      if (!res.ok) throw new Error('Failed to delete e-paper');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'E-paper deleted',
        description: 'The e-paper has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/epapers'] });
      setDeleteDialogOpen(false);
      setEpaperToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Set as latest mutation
  const setLatestMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PATCH', `/api/epapers/${id}/set-latest`);
      if (!res.ok) throw new Error('Failed to set e-paper as latest');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'E-paper updated',
        description: 'The e-paper has been set as the latest edition.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/epapers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateEpaper = () => {
    setSelectedEpaper(null);
    setMode('create');
    form.reset();
    setDialogOpen(true);
  };

  const handleEditEpaper = (epaper: any) => {
    setSelectedEpaper(epaper);
    setMode('edit');
    form.setValue('title', epaper.title);
    form.setValue('publish_date', epaper.publishDate.split('T')[0]);
    form.setValue('image_url', epaper.imageUrl);
    form.setValue('pdf_url', epaper.pdfUrl);
    form.setValue('is_latest', epaper.isLatest);
    setDialogOpen(true);
  };

  const handleDeleteEpaper = (epaper: any) => {
    setEpaperToDelete(epaper);
    setDeleteDialogOpen(true);
  };

  const handleViewEpaper = (epaper: any) => {
    window.open(epaper.pdfUrl, '_blank');
  };

  const handleSetLatest = (epaper: any) => {
    setLatestMutation.mutate(epaper.id);
  };

  const onSubmit = (data: EpaperFormValues) => {
    saveMutation.mutate(data);
  };

  if (error) {
    return (
      <EnhancedAdminLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading E-Papers
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {error.message || 'An error occurred while loading e-papers'}
            </p>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              E-Papers Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage digital newspaper editions
            </p>
          </div>
          <Button onClick={handleCreateEpaper} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Upload E-Paper
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total E-Papers</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{epapers?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Digital editions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Edition</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {epapers?.find((e: any) => e.isLatest)?.title?.slice(0, 10) || 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                Current edition
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {epapers?.filter((e: any) => {
                  const publishDate = new Date(e.publishDate);
                  const now = new Date();
                  return publishDate.getMonth() === now.getMonth() && 
                         publishDate.getFullYear() === now.getFullYear();
                }).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Published this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {epapers?.reduce((total: number, epaper: any) => total + (epaper.download_count || 0), 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total downloads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* E-Papers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All E-Papers</CardTitle>
            <CardDescription>
              Manage your digital newspaper editions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <DataTable
                data={epapers || []}
                columns={epaperColumns}
                searchPlaceholder="Search e-papers..."
                onEdit={handleEditEpaper}
                onDelete={handleDeleteEpaper}
                onView={handleViewEpaper}
                loading={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Create/Edit E-Paper Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {mode === 'create' ? 'Upload New E-Paper' : 'Edit E-Paper'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter e-paper title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publish_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preview Image URL *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pdf_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PDF URL *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/epaper.pdf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_latest"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as Latest Edition</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          This will be displayed as the current edition
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      mode === 'create' ? 'Upload E-Paper' : 'Update E-Paper'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the e-paper
                "{epaperToDelete?.title}" and remove it from the website.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => epaperToDelete && deleteMutation.mutate(epaperToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete E-Paper
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </EnhancedAdminLayout>
  );
}