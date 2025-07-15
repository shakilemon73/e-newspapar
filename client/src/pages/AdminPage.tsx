import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useLocation } from 'wouter';
import { AdminLayout } from '@/components/admin/AdminLayout';
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
      setLocation('/auth');
    }
  }, [authLoading, user, setLocation]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
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
    <AdminLayout>
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
    </AdminLayout>
  );
}