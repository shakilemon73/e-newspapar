import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Loader2, 
  FileText,
  Download,
  Star,
  Edit,
  Trash2,
  Plus,
  Eye,
  Calendar,
  File
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateFormatter } from '@/components/DateFormatter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';

interface EPaper {
  id: number;
  title: string;
  publish_date: string;
  description?: string;
  pdf_url?: string;
  image_url?: string;
  is_latest: boolean;
  file_size?: number;
  created_at: string;
  updated_at: string;
}

interface UploadFormData {
  title: string;
  publish_date: string;
  description: string;
  is_latest: boolean;
  file?: File;
}

export default function ModernEPapersAdminPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedEpaper, setSelectedEpaper] = useState<EPaper | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadFormData>({
    title: '',
    publish_date: new Date().toISOString().split('T')[0],
    description: '',
    is_latest: false,
    file: undefined
  });
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch e-papers
  const { data: epapers = [], isLoading, error } = useQuery({
    queryKey: ['modern-epapers'],
    queryFn: async () => {
      const response = await fetch('/api/modern-epaper/list?limit=50');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch e-papers');
      }
      return data.epapers;
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/modern-epaper/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'E-paper uploaded successfully',
        description: 'Your e-paper has been uploaded and saved.',
      });
      resetUploadForm();
      queryClient.invalidateQueries({ queryKey: ['modern-epapers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EPaper> }) => {
      const response = await fetch(`/api/modern-epaper/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Update failed');
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'E-paper updated',
        description: 'The e-paper has been updated successfully.',
      });
      setIsEditing(false);
      setSelectedEpaper(null);
      queryClient.invalidateQueries({ queryKey: ['modern-epapers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/modern-epaper/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Delete failed');
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'E-paper deleted',
        description: 'The e-paper has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['modern-epapers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      publish_date: new Date().toISOString().split('T')[0],
      description: '',
      is_latest: false,
      file: undefined
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please select a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 50MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    setUploadForm(prev => ({
      ...prev,
      file,
      title: prev.title || file.name.replace('.pdf', '')
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a PDF file to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!uploadForm.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the e-paper.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('title', uploadForm.title);
    formData.append('publish_date', uploadForm.publish_date);
    formData.append('description', uploadForm.description);
    formData.append('is_latest', uploadForm.is_latest.toString());

    uploadMutation.mutate(formData);
  };

  const handleEdit = (epaper: EPaper) => {
    setSelectedEpaper(epaper);
    setIsEditing(true);
  };

  const handleUpdate = () => {
    if (!selectedEpaper) return;

    const updateData = {
      title: selectedEpaper.title,
      description: selectedEpaper.description,
      is_latest: selectedEpaper.is_latest,
    };

    updateMutation.mutate({ id: selectedEpaper.id, data: updateData });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this e-paper? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
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
              Upload and manage digital newspaper editions with simple PDF uploads
            </p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">Upload New E-Paper</TabsTrigger>
            <TabsTrigger value="manage">Manage E-Papers ({epapers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload New E-Paper
                </CardTitle>
                <CardDescription>
                  Upload a PDF file to create a new digital newspaper edition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <File className="w-16 h-16 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)} • PDF Document
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setUploadForm(prev => ({ ...prev, file: undefined }));
                        }}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <Upload className="w-16 h-16 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">Drop your PDF file here</p>
                        <p className="text-muted-foreground">
                          or click to browse (Max 50MB)
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Select PDF File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter e-paper title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="publish_date">Publish Date</Label>
                      <Input
                        id="publish_date"
                        type="date"
                        value={uploadForm.publish_date}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, publish_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this edition"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_latest"
                      checked={uploadForm.is_latest}
                      onCheckedChange={(checked) => setUploadForm(prev => ({ ...prev, is_latest: checked }))}
                    />
                    <Label htmlFor="is_latest">Mark as latest edition</Label>
                  </div>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !uploadForm.title.trim() || uploadMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload E-Paper
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <div className="grid gap-4">
              {epapers.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No e-papers found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Upload your first PDF to get started with digital newspaper management
                    </p>
                    <Button onClick={() => {
                      const uploadTab = document.querySelector('[value="upload"]') as HTMLElement;
                      uploadTab?.click();
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload First E-Paper
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                epapers.map((epaper: EPaper) => (
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
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <DateFormatter date={epaper.publish_date} />
                            </span>
                            {epaper.file_size && (
                              <span>{formatFileSize(epaper.file_size)}</span>
                            )}
                          </div>
                          {epaper.description && (
                            <p className="text-muted-foreground text-sm">{epaper.description}</p>
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
                              View PDF
                            </Button>
                          )}
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
                            onClick={() => handleDelete(epaper.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        {isEditing && selectedEpaper && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg mx-4">
              <CardHeader>
                <CardTitle>Edit E-Paper</CardTitle>
                <CardDescription>Update e-paper details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={selectedEpaper.title}
                    onChange={(e) => setSelectedEpaper(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedEpaper.description || ''}
                    onChange={(e) => setSelectedEpaper(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-latest"
                    checked={selectedEpaper.is_latest}
                    onCheckedChange={(checked) => setSelectedEpaper(prev => prev ? { ...prev, is_latest: checked } : null)}
                  />
                  <Label htmlFor="edit-latest">Mark as latest edition</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedEpaper(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      'Update'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </EnhancedAdminLayout>
  );
}