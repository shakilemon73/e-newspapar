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
  Radio, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Volume2,
  Loader2,
  Calendar,
  Clock,
  Headphones
} from 'lucide-react';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { adminSupabaseAPI } from '@/lib/admin';
import { useToast } from '@/hooks/use-toast';
// import { FileUploadField } from '@/components/admin/FileUploadField'; // Component not available
import { useLanguage } from '@/contexts/LanguageContext';

interface AudioArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  audioUrl: string;
  duration: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function AudioArticlesAdminPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [editingAudio, setEditingAudio] = useState<AudioArticle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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

  // Fetch audio articles using direct Supabase API
  const { data: audioData, isLoading, error } = useQuery({
    queryKey: ['admin-audio-articles'],
    queryFn: adminSupabaseAPI.audioArticles.getAll,
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Extract audio articles array from the response
  const audioArticles = audioData || [];

  // Create audio article mutation using direct Supabase API
  const createAudioMutation = useMutation({
    mutationFn: (audioData: any) => adminSupabaseAPI.audioArticles.create(audioData),
    onSuccess: () => {
      // Invalidate and refetch audio article-related queries
      queryClient.invalidateQueries({ queryKey: ['admin-audio-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/audio-articles'] });
      
      toast({
        title: "Success",
        description: "Audio article created successfully",
      });
      setIsFormOpen(false);
      setEditingAudio(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create audio article",
        variant: "destructive",
      });
    },
  });

  // Update audio article mutation
  const updateAudioMutation = useMutation({
    mutationFn: async ({ id, ...audioData }: any) => {
      return await adminSupabaseAPI.audioArticles.update(id, audioData);
    },
    onSuccess: () => {
      // Invalidate and refetch audio article-related queries
      queryClient.invalidateQueries({ queryKey: ['admin-audio-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/audio-articles'] });
      
      toast({
        title: "Success",
        description: "Audio article updated successfully",
      });
      setIsFormOpen(false);
      setEditingAudio(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update audio article",
        variant: "destructive",
      });
    },
  });

  // Delete audio article mutation
  const deleteAudioMutation = useMutation({
    mutationFn: (id: number) => adminSupabaseAPI.audioArticles.delete(id),
    onSuccess: () => {
      // Invalidate and refetch audio article-related queries
      queryClient.invalidateQueries({ queryKey: ['admin-audio-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/audio-articles'] });
      
      toast({
        title: "Success",
        description: "Audio article deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete audio article",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const audioData = {
      title: formData.get('title') as string,
      slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-'),
      excerpt: formData.get('excerpt') as string,
      image_url: imageUrl,
      audio_url: audioUrl,
      duration: formData.get('duration') as string,
      published_at: new Date().toISOString(),
    };

    if (editingAudio) {
      updateAudioMutation.mutate({ id: editingAudio.id, ...audioData });
    } else {
      createAudioMutation.mutate(audioData);
    }
  };

  // Form management functions
  const openForm = (audio?: AudioArticle) => {
    if (audio) {
      setEditingAudio(audio);
      setAudioUrl(audio.audioUrl);
      setImageUrl(audio.imageUrl);
    } else {
      setEditingAudio(null);
      setAudioUrl('');
      setImageUrl('');
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAudio(null);
    setAudioUrl('');
    setImageUrl('');
  };

  const toggleAudio = (audioUrl: string) => {
    setPlayingAudio(playingAudio === audioUrl ? null : audioUrl);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Audio Articles Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage audio content for your Bengali news website
            </p>
          </div>
          <Button onClick={() => openForm()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Audio Article
          </Button>
        </div>

        {/* Audio Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Radio className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Audio Articles</p>
                  <p className="text-2xl font-bold">{audioArticles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Volume2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Duration</p>
                  <p className="text-2xl font-bold">
                    {audioArticles.length ? Math.round(audioArticles.reduce((sum: number, audio: AudioArticle) => {
                      const duration = audio.duration?.split(':').reduce((acc, time) => (60 * acc) + +time, 0) || 0;
                      return sum + duration;
                    }, 0) / 60) : 0}m
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
                    {audioArticles.filter((audio: AudioArticle) => 
                      new Date(audio.publishedAt).toDateString() === new Date().toDateString()
                    ).length}
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
                    {audioArticles?.length ? 
                      Math.round(audioArticles.reduce((sum: number, audio: AudioArticle) => {
                        const duration = audio.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
                        return sum + duration;
                      }, 0) / audioArticles.length / 60) : 0}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audio Articles List */}
        <Card>
          <CardHeader>
            <CardTitle>All Audio Articles</CardTitle>
            <CardDescription>
              Manage your audio content library
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading audio articles: {error.message}
              </div>
            ) : audioArticles?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No audio articles found. Create your first audio article!
              </div>
            ) : (
              <div className="space-y-4">
                {audioArticles?.map((audio: AudioArticle) => (
                  <Card key={audio.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {audio.imageUrl ? (
                          <img 
                            src={audio.imageUrl} 
                            alt={audio.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Headphones className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1">{audio.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {audio.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {audio.duration}
                          </span>
                          <span>
                            {new Date(audio.publishedAt).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAudio(audio.audioUrl)}
                        >
                          {playingAudio === audio.audioUrl ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openForm(audio)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAudioMutation.mutate(audio.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audio Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {editingAudio ? 'Edit Audio Article' : 'Add New Audio Article'}
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
                      defaultValue={editingAudio?.title || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea 
                      id="excerpt" 
                      name="excerpt" 
                      required
                      defaultValue={editingAudio?.excerpt || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="audioUrl">Audio URL</Label>
                    <Input 
                      id="audioUrl" 
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://example.com/audio.mp3"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Cover Image URL</Label>
                    <Input 
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (MM:SS)</Label>
                    <Input 
                      id="duration" 
                      name="duration" 
                      placeholder="05:30"
                      required
                      defaultValue={editingAudio?.duration || ''}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      disabled={createAudioMutation.isPending || updateAudioMutation.isPending}
                    >
                      {createAudioMutation.isPending || updateAudioMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        editingAudio ? 'Update' : 'Create'
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
    </EnhancedAdminLayout>
  );
}