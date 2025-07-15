import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminOnlyLayout } from '@/components/admin/AdminOnlyLayout';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileImage, 
  FileVideo, 
  FileAudio, 
  Trash2, 
  Download, 
  Copy,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { SupabaseStorage, MediaType } from '@/lib/supabase-storage';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface MediaFile {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
  };
}

export default function MediaAdminPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<MediaType>('images');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check URL params for initial tab
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab') as MediaType;
    if (tabParam && ['images', 'videos', 'audio'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [authLoading, user, setLocation]);

  // Fetch media files
  const { data: mediaFiles, isLoading, error } = useQuery<MediaFile[]>({
    queryKey: ['/api/admin/media', activeTab],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ path, id }: { path: string; id: string }) => {
      const success = await SupabaseStorage.deleteFile(path);
      if (!success) throw new Error('Failed to delete file');
      
      // Also delete from database if we're tracking files there
      return apiRequest(`/api/admin/media/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/media'] });
      toast({
        title: 'File deleted',
        description: 'File deleted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleUploadComplete = (url: string, path: string) => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/media'] });
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  const handleDelete = (file: MediaFile) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const path = `${activeTab}/${file.name}`;
      deleteMutation.mutate({ path, id: file.id });
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL copied',
      description: 'File URL copied to clipboard'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = mediaFiles?.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AdminOnlyLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Media Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload and manage images, videos, and audio files for your website
            </p>
          </div>
        </div>

        {/* Media Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MediaType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <FileVideo className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <FileAudio className="h-4 w-4" />
              Audio
            </TabsTrigger>
          </TabsList>

          {/* Upload Section */}
          <div className="mt-6">
            <MediaUploader
              type={activeTab}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              maxFiles={10}
            />
          </div>

          {/* Search and Filter */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Existing Files</CardTitle>
              <CardDescription>
                Manage your uploaded {activeTab}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search files</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by filename..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {filteredFiles.length} files
                  </Badge>
                </div>
              </div>

              {/* Files Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Error loading files: {error.message}
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {activeTab} found. Upload some files to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFiles.map((file) => {
                    const url = SupabaseStorage.getPublicUrl(`${activeTab}/${file.name}`);
                    return (
                      <Card key={file.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          {/* File Preview */}
                          <div className="mb-3">
                            {activeTab === 'images' ? (
                              <img
                                src={url}
                                alt={file.name}
                                className="w-full h-32 object-cover rounded"
                                loading="lazy"
                              />
                            ) : activeTab === 'videos' ? (
                              <video
                                src={url}
                                className="w-full h-32 object-cover rounded"
                                controls
                                preload="metadata"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                                <FileAudio className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* File Info */}
                          <div className="space-y-2">
                            <h3 className="font-medium truncate" title={file.name}>
                              {file.name}
                            </h3>
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>Size: {formatFileSize(file.metadata?.size || 0)}</p>
                              <p>Type: {file.metadata?.mimetype || 'Unknown'}</p>
                              <p>Uploaded: {new Date(file.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(url)}
                              className="flex-1"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy URL
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <a href={url} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3" />
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(file)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </AdminOnlyLayout>
  );
}