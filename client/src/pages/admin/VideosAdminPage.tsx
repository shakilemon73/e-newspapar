import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Play,
  Loader2,
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import { AdminOnlyLayout } from '@/components/admin/AdminOnlyLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FileUploadField } from '@/components/admin/FileUploadField';

interface VideoContent {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  publishedAt: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function VideosAdminPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [editingVideo, setEditingVideo] = useState<VideoContent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [authLoading, user, setLocation]);

  // Fetch videos from Supabase
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/videos'],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: async (videoData: any) => {
      return await apiRequest('POST', '/api/videos', videoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Success",
        description: "Video created successfully",
      });
      setIsFormOpen(false);
      setEditingVideo(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create video",
        variant: "destructive",
      });
    },
  });

  // Update video mutation
  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, ...videoData }: any) => {
      return await apiRequest('PUT', `/api/videos/${id}`, videoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
      setIsFormOpen(false);
      setEditingVideo(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update video",
        variant: "destructive",
      });
    },
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const videoData = {
      title: formData.get('title') as string,
      slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-'),
      description: formData.get('description') as string,
      thumbnail_url: thumbnailUrl,
      video_url: videoUrl,
      duration: formData.get('duration') as string,
      published_at: new Date().toISOString(),
      view_count: 0,
    };

    if (editingVideo) {
      updateVideoMutation.mutate({ id: editingVideo.id, ...videoData });
    } else {
      createVideoMutation.mutate(videoData);
    }
  };

  // Reset form when opening/closing
  const openForm = (video?: VideoContent) => {
    if (video) {
      setEditingVideo(video);
      setVideoUrl(video.videoUrl);
      setThumbnailUrl(video.thumbnailUrl);
    } else {
      setEditingVideo(null);
      setVideoUrl('');
      setThumbnailUrl('');
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingVideo(null);
    setVideoUrl('');
    setThumbnailUrl('');
  };

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
              Video Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage video content for your Bengali news website
            </p>
          </div>
          <Button onClick={() => openForm()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Video
          </Button>
        </div>

        {/* Video Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Video className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Videos</p>
                  <p className="text-2xl font-bold">{videos?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                  <p className="text-2xl font-bold">
                    {videos?.reduce((sum: number, video: VideoContent) => sum + video.viewCount, 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published Today</p>
                  <p className="text-2xl font-bold">
                    {videos?.filter((video: VideoContent) => 
                      new Date(video.publishedAt).toDateString() === new Date().toDateString()
                    ).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Duration</p>
                  <p className="text-2xl font-bold">
                    {videos?.length ? 
                      Math.round(videos.reduce((sum: number, video: VideoContent) => {
                        const duration = video.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
                        return sum + duration;
                      }, 0) / videos.length / 60) : 0}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Videos List */}
        <Card>
          <CardHeader>
            <CardTitle>All Videos</CardTitle>
            <CardDescription>
              Manage your video content library
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading videos: {error.message}
              </div>
            ) : videos?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No videos found. Create your first video!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos?.map((video: VideoContent) => (
                  <Card key={video.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {video.thumbnailUrl ? (
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Play className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {video.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {video.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.viewCount}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openForm(video)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteVideoMutation.mutate(video.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {editingVideo ? 'Edit Video' : 'Add New Video'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      required
                      defaultValue={editingVideo?.title || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      required
                      defaultValue={editingVideo?.description || ''}
                    />
                  </div>
                  <FileUploadField
                    label="Video File"
                    description="Upload video file or provide URL"
                    mediaType="videos"
                    value={videoUrl}
                    onChange={setVideoUrl}
                    placeholder="https://example.com/video.mp4"
                    required
                  />
                  <FileUploadField
                    label="Thumbnail Image"
                    description="Upload thumbnail image or provide URL"
                    mediaType="images"
                    value={thumbnailUrl}
                    onChange={setThumbnailUrl}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                  <div>
                    <Label htmlFor="duration">Duration (MM:SS)</Label>
                    <Input 
                      id="duration" 
                      name="duration" 
                      placeholder="05:30"
                      required
                      defaultValue={editingVideo?.duration || ''}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
                    >
                      {createVideoMutation.isPending || updateVideoMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        editingVideo ? 'Update' : 'Create'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={closeForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminOnlyLayout>
  );
}