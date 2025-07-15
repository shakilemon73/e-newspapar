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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Share2, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Loader2,
  Calendar,
  Eye,
  MessageSquare
} from 'lucide-react';
import { AdminOnlyLayout } from '@/components/admin/AdminOnlyLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SocialMediaPost {
  id: number;
  platform: string;
  content: string;
  embed_code: string;
  post_url?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
};

const platformColors = {
  facebook: 'bg-blue-600',
  twitter: 'bg-sky-500',
  instagram: 'bg-pink-600',
};

export default function SocialMediaAdminPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [editingPost, setEditingPost] = useState<SocialMediaPost | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
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

  // Fetch social media posts from Supabase
  const { data: socialPosts, isLoading, error } = useQuery({
    queryKey: ['/api/social-media'],
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Create social media post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest('/api/social-media', {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
      toast({
        title: "Success",
        description: "Social media post created successfully",
      });
      setIsFormOpen(false);
      setEditingPost(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create social media post",
        variant: "destructive",
      });
    },
  });

  // Update social media post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, ...postData }: any) => {
      return await apiRequest(`/api/social-media/${id}`, {
        method: 'PUT',
        body: JSON.stringify(postData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
      toast({
        title: "Success",
        description: "Social media post updated successfully",
      });
      setIsFormOpen(false);
      setEditingPost(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update social media post",
        variant: "destructive",
      });
    },
  });

  // Delete social media post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/social-media/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
      toast({
        title: "Success",
        description: "Social media post deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete social media post",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const postData = {
      platform: formData.get('platform') as string,
      content: formData.get('content') as string,
      embed_code: formData.get('embed_code') as string,
      post_url: formData.get('post_url') as string,
      published_at: new Date().toISOString(),
    };

    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, ...postData });
    } else {
      createPostMutation.mutate(postData);
    }
  };

  const filteredPosts = socialPosts?.filter((post: SocialMediaPost) => 
    selectedPlatform === 'all' || post.platform === selectedPlatform
  );

  const platformStats = socialPosts?.reduce((acc: Record<string, number>, post: SocialMediaPost) => {
    acc[post.platform] = (acc[post.platform] || 0) + 1;
    return acc;
  }, {});

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
              Social Media Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage social media posts for your Bengali news website
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Post
          </Button>
        </div>

        {/* Platform Filter */}
        <div className="flex items-center gap-4">
          <Label htmlFor="platform-filter">Filter by Platform:</Label>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger id="platform-filter" className="w-48">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Share2 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                  <p className="text-2xl font-bold">{socialPosts?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Facebook className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Facebook</p>
                  <p className="text-2xl font-bold">{platformStats?.facebook || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Twitter className="h-8 w-8 text-sky-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Twitter</p>
                  <p className="text-2xl font-bold">{platformStats?.twitter || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Instagram className="h-8 w-8 text-pink-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Instagram</p>
                  <p className="text-2xl font-bold">{platformStats?.instagram || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Media Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Posts</CardTitle>
            <CardDescription>
              Manage your social media integration and posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading social media posts: {error.message}
              </div>
            ) : filteredPosts?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No social media posts found for this platform.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts?.map((post: SocialMediaPost) => {
                  const IconComponent = platformIcons[post.platform as keyof typeof platformIcons] || Share2;
                  const platformColor = platformColors[post.platform as keyof typeof platformColors] || 'bg-gray-600';
                  
                  return (
                    <Card key={post.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${platformColor}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="capitalize">
                              {post.platform}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(post.published_at).toLocaleDateString('bn-BD')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {post.content}
                          </p>
                          {post.embed_code && (
                            <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2">
                              <code className="text-xs text-gray-600 dark:text-gray-400">
                                {post.embed_code.substring(0, 100)}...
                              </code>
                            </div>
                          )}
                          {post.post_url && (
                            <a
                              href={post.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Original Post
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingPost(post);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePostMutation.mutate(post.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Media Post Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>
                  {editingPost ? 'Edit Social Media Post' : 'Add New Social Media Post'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select name="platform" defaultValue={editingPost?.platform || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea 
                      id="content" 
                      name="content" 
                      required
                      placeholder="Post content..."
                      defaultValue={editingPost?.content || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="embed_code">Embed Code (Optional)</Label>
                    <Textarea 
                      id="embed_code" 
                      name="embed_code" 
                      placeholder="HTML embed code..."
                      defaultValue={editingPost?.embed_code || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="post_url">Post URL (Optional)</Label>
                    <Input 
                      id="post_url" 
                      name="post_url" 
                      type="url"
                      placeholder="https://..."
                      defaultValue={editingPost?.post_url || ''}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      disabled={createPostMutation.isPending || updatePostMutation.isPending}
                    >
                      {createPostMutation.isPending || updatePostMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        editingPost ? 'Update' : 'Create'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingPost(null);
                      }}
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