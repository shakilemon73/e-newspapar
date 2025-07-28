import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Tag as TagIcon, 
  Search, 
  Hash 
} from 'lucide-react';
import { 
  getTags, 
  createTag, 
  updateTag, 
  deleteTag, 
  searchTags 
} from '@/lib/supabase-api-direct';
import { useToast } from '@/hooks/use-toast';

interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  usage_count: number;
  is_trending: boolean;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export default function TagsAdminPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [newTag, setNewTag] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6'
  });

  const { toast } = useToast();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await getTags();
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
      toast({
        title: "ত্রুটি",
        description: "ট্যাগ লোড করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTags();
      return;
    }

    try {
      const results = await searchTags(searchQuery);
      setTags(results);
    } catch (error) {
      console.error('Error searching tags:', error);
      toast({
        title: "ত্রুটি",
        description: "ট্যাগ অনুসন্ধানে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreateTag = async () => {
    if (!newTag.name.trim()) {
      toast({
        title: "ত্রুটি",
        description: "ট্যাগের নাম আবশ্যক",
        variant: "destructive"
      });
      return;
    }

    const slug = newTag.slug || generateSlug(newTag.name);

    try {
      const result = await createTag({
        name: newTag.name,
        slug: slug,
        description: newTag.description,
        color: newTag.color
      });

      if (result.success) {
        toast({
          title: "সফল",
          description: result.message
        });
        setIsCreateDialogOpen(false);
        setNewTag({ name: '', slug: '', description: '', color: '#3B82F6' });
        loadTags();
      } else {
        toast({
          title: "ত্রুটি",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "ত্রুটি",
        description: "ট্যাগ তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTag = async () => {
    if (!selectedTag) return;

    try {
      const result = await updateTag(selectedTag.id, {
        name: selectedTag.name,
        slug: selectedTag.slug,
        description: selectedTag.description,
        color: selectedTag.color,
        is_trending: selectedTag.is_trending
      });

      if (result.success) {
        toast({
          title: "সফল",
          description: result.message
        });
        setIsEditDialogOpen(false);
        setSelectedTag(null);
        loadTags();
      } else {
        toast({
          title: "ত্রুটি",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      toast({
        title: "ত্রুটি",
        description: "ট্যাগ আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ট্যাগটি ডিলিট করতে চান?')) {
      return;
    }

    try {
      const result = await deleteTag(tagId);

      if (result.success) {
        toast({
          title: "সফল",
          description: result.message
        });
        loadTags();
      } else {
        toast({
          title: "ত্রুটি",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "ত্রুটি",
        description: "ট্যাগ ডিলিট করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ট্যাগ ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">
            সংবাদ ট্যাগ তৈরি ও পরিচালনা করুন
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              নতুন ট্যাগ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>নতুন ট্যাগ তৈরি করুন</DialogTitle>
              <DialogDescription>
                নতুন সংবাদ ট্যাগ তৈরি করতে তথ্য পূরণ করুন
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="tag-name">ট্যাগের নাম *</Label>
                <Input
                  id="tag-name"
                  value={newTag.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewTag(prev => ({
                      ...prev,
                      name,
                      slug: generateSlug(name)
                    }));
                  }}
                  placeholder="যেমন: রাজনীতি, খেলাধুলা"
                />
              </div>

              <div>
                <Label htmlFor="tag-slug">স্লাগ</Label>
                <Input
                  id="tag-slug"
                  value={newTag.slug}
                  onChange={(e) => setNewTag(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="politics, sports"
                />
              </div>

              <div>
                <Label htmlFor="tag-description">বিবরণ</Label>
                <Textarea
                  id="tag-description"
                  value={newTag.description}
                  onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="ট্যাগের সংক্ষিপ্ত বিবরণ"
                />
              </div>

              <div>
                <Label htmlFor="tag-color">রঙ</Label>
                <Input
                  id="tag-color"
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateTag}>
                  তৈরি করুন
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  বাতিল
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            ট্যাগ অনুসন্ধান
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="ট্যাগের নাম বা বিবরণ দিয়ে অনুসন্ধান করুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => { setSearchQuery(''); loadTags(); }}>
              রিসেট
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TagIcon className="w-5 h-5 mr-2" />
            সকল ট্যাগ ({filteredTags.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">লোড হচ্ছে...</div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-8">
              <TagIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">কোন ট্যাগ পাওয়া যায়নি</h3>
              <p className="text-muted-foreground">
                নতুন ট্যাগ তৈরি করুন বা অনুসন্ধানের শর্ত পরিবর্তন করুন।
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>স্লাগ</TableHead>
                  <TableHead>বিবরণ</TableHead>
                  <TableHead>ব্যবহার</TableHead>
                  <TableHead>অবস্থা</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color || '#3B82F6' }}
                        />
                        <span className="font-medium">{tag.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {tag.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {tag.description || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Hash className="w-3 h-3 mr-1" />
                        {tag.usage_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tag.is_trending && (
                        <Badge variant="default" className="bg-orange-500">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          ট্রেন্ডিং
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTag(tag);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTag(tag.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ট্যাগ সম্পাদনা</DialogTitle>
            <DialogDescription>
              ট্যাগের তথ্য আপডেট করুন
            </DialogDescription>
          </DialogHeader>
          
          {selectedTag && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-tag-name">ট্যাগের নাম *</Label>
                <Input
                  id="edit-tag-name"
                  value={selectedTag.name}
                  onChange={(e) => setSelectedTag(prev => 
                    prev ? { ...prev, name: e.target.value } : null
                  )}
                />
              </div>

              <div>
                <Label htmlFor="edit-tag-slug">স্লাগ</Label>
                <Input
                  id="edit-tag-slug"
                  value={selectedTag.slug}
                  onChange={(e) => setSelectedTag(prev => 
                    prev ? { ...prev, slug: e.target.value } : null
                  )}
                />
              </div>

              <div>
                <Label htmlFor="edit-tag-description">বিবরণ</Label>
                <Textarea
                  id="edit-tag-description"
                  value={selectedTag.description || ''}
                  onChange={(e) => setSelectedTag(prev => 
                    prev ? { ...prev, description: e.target.value } : null
                  )}
                />
              </div>

              <div>
                <Label htmlFor="edit-tag-color">রঙ</Label>
                <Input
                  id="edit-tag-color"
                  type="color"
                  value={selectedTag.color || '#3B82F6'}
                  onChange={(e) => setSelectedTag(prev => 
                    prev ? { ...prev, color: e.target.value } : null
                  )}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-tag-trending"
                  checked={selectedTag.is_trending}
                  onChange={(e) => setSelectedTag(prev => 
                    prev ? { ...prev, is_trending: e.target.checked } : null
                  )}
                />
                <Label htmlFor="edit-tag-trending">ট্রেন্ডিং ট্যাগ</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateTag}>
                  আপডেট করুন
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedTag(null);
                }}>
                  বাতিল
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}