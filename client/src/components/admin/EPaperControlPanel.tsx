import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Newspaper, 
  Download, 
  Eye, 
  FileText, 
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { getEPaperHistory, downloadEPaperPDF } from '@/lib/epaper-generator-direct';

interface EPaper {
  id: number;
  title: string;
  date: string;
  status: 'published' | 'draft' | 'archived';
  view_count: number;
  download_count: number;
  file_size: string;
  created_at: string;
}

const EPaperControlPanel = () => {
  const { toast } = useToast();
  const [epapers, setEpapers] = useState<EPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  // Load e-papers on component mount
  useEffect(() => {
    fetchEPapers();
  }, []);

  const fetchEPapers = async () => {
    try {
      setIsLoading(true);
      const result = await getEPaperHistory(1, 50);
      
      // Transform data to match EPaper interface
      const transformedEPapers: EPaper[] = result.epapers.map((epaper: any) => ({
        id: epaper.id,
        title: epaper.title || `E-Paper ${format(new Date(epaper.created_at), 'MMM dd, yyyy')}`,
        date: epaper.created_at,
        status: epaper.status || 'published',
        view_count: epaper.view_count || 0,
        download_count: epaper.download_count || 0,
        file_size: epaper.file_size || '2.5 MB',
        created_at: epaper.created_at
      }));

      setEpapers(transformedEPapers);
    } catch (error) {
      console.error('Error fetching e-papers:', error);
      toast({
        title: "Error",
        description: "Failed to load e-papers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (epaperId: number) => {
    try {
      // Note: downloadEPaperPDF expects Uint8Array, this is for display purposes
      // In production, implement proper download API endpoint
      console.log(`Downloading e-paper: ${epaperId}`);
      toast({
        title: "Success",
        description: "E-paper download initiated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download e-paper",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (epaperId: number) => {
    if (!confirm('Are you sure you want to delete this e-paper?')) return;
    
    try {
      // Add delete logic here when API is available
      setEpapers(epapers.filter(ep => ep.id !== epaperId));
      toast({
        title: "Success",
        description: "E-paper deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete e-paper",
        variant: "destructive",
      });
    }
  };

  const filteredEPapers = epapers.filter(epaper => {
    const matchesSearch = epaper.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || epaper.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      archived: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Newspaper className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">E-Paper Control Panel</h1>
            <p className="text-muted-foreground">Manage and monitor all e-paper publications</p>
          </div>
        </div>
        <Button onClick={() => window.location.href = '/admin/epaper-generator'}>
          <Plus className="h-4 w-4 mr-2" />
          Create New E-Paper
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total E-Papers</p>
                <p className="text-2xl font-bold">{epapers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Views</p>
                <p className="text-2xl font-bold">{epapers.reduce((sum, ep) => sum + ep.view_count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total Downloads</p>
                <p className="text-2xl font-bold">{epapers.reduce((sum, ep) => sum + ep.download_count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold">{epapers.filter(ep => 
                  new Date(ep.created_at).getMonth() === new Date().getMonth()
                ).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search e-papers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* E-Papers Table */}
      <Card>
        <CardHeader>
          <CardTitle>E-Paper Publications</CardTitle>
          <CardDescription>
            Manage your e-paper publications and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading e-papers...</p>
              </div>
            </div>
          ) : filteredEPapers.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No e-papers found</p>
              <p className="text-muted-foreground">Create your first e-paper to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Views</th>
                    <th className="text-left py-3 px-4 font-medium">Downloads</th>
                    <th className="text-left py-3 px-4 font-medium">Size</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEPapers.map((epaper) => (
                    <tr key={epaper.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{epaper.title}</div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {format(new Date(epaper.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(epaper.status)}
                      </td>
                      <td className="py-3 px-4">{epaper.view_count}</td>
                      <td className="py-3 px-4">{epaper.download_count}</td>
                      <td className="py-3 px-4">{epaper.file_size}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownload(epaper.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/epaper/${epaper.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(epaper.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EPaperControlPanel;