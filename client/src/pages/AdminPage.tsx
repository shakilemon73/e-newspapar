import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useLocation } from 'wouter';
import { WebsiteAdminLayout } from '@/components/admin/WebsiteAdminLayout';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { DataTable } from '@/components/admin/DataTable';
import { ContentEditor } from '@/components/admin/ContentEditor';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';

// Admin page columns configuration
const articleColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { 
    key: 'title', 
    label: 'Title', 
    sortable: true,
    render: (value: string) => (
      <div className="max-w-[300px] truncate font-medium">{value}</div>
    )
  },
  { 
    key: 'category', 
    label: 'Category',
    render: (value: any) => value?.name || 'Uncategorized'
  },
  { key: 'isFeatured', label: 'Featured', sortable: true },
  { key: 'publishedAt', label: 'Published', sortable: true },
  { key: 'viewCount', label: 'Views', sortable: true },
];

export default function AdminPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [location, setLocation] = useLocation();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      console.log('User metadata:', user.user_metadata);
      // For now, let's allow access and show instructions to set admin role
      // setLocation('/'); // Redirect non-admin users to home
    }
  }, [authLoading, user, setLocation]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Not authenticated - handled by useEffect redirect
  if (!user) {
    return null;
  }

  // Check if user is admin
  if (user.user_metadata?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            অ্যাডমিন অ্যাক্সেস প্রয়োজন
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            আপনার অ্যাকাউন্টে অ্যাডমিন পারমিশন নেই। অ্যাডমিন অ্যাক্সেসের জন্য যোগাযোগ করুন।
          </p>
          <div className="text-sm text-gray-500 mb-4">
            <p>User ID: {user.id}</p>
            <p>Email: {user.email}</p>
            <p>Current Role: {user.user_metadata?.role || 'user'}</p>
          </div>
          <Button onClick={() => setLocation('/')}>
            হোম পেজে ফিরুন
          </Button>
        </div>
      </div>
    );
  }

  // Fetch articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
  });

  const handleCreateArticle = () => {
    setSelectedArticle(null);
    setEditorMode('create');
    setEditorOpen(true);
  };

  const handleEditArticle = (article: any) => {
    setSelectedArticle(article);
    setEditorMode('edit');
    setEditorOpen(true);
  };

  const handleDeleteArticle = (article: any) => {
    // TODO: Implement delete confirmation dialog
    console.log('Delete article:', article.id);
  };

  const handleViewArticle = (article: any) => {
    setLocation(`/article/${article.slug}`);
  };

  return (
    <WebsiteAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your Bengali news website content and analytics
            </p>
          </div>
          <Button onClick={handleCreateArticle} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Article
          </Button>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Articles Management */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
            <CardDescription>
              Manage and monitor your published articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <DataTable
                data={articles || []}
                columns={articleColumns}
                searchPlaceholder="Search articles..."
                onEdit={handleEditArticle}
                onDelete={handleDeleteArticle}
                onView={handleViewArticle}
                loading={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Content Editor Modal */}
        <ContentEditor
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          article={selectedArticle}
          mode={editorMode}
        />
      </div>
    </WebsiteAdminLayout>
  );
}