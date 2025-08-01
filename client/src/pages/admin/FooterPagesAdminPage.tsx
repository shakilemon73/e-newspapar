import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Building, 
  Phone, 
  Mail, 
  DollarSign, 
  FileText, 
  Shield, 
  Edit, 
  Trash2, 
  Plus,
  Save,
  X
} from 'lucide-react';
import { adminSupabaseAPI } from '@/lib/admin-supabase-complete';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  department: string;
  bio?: string;
  image_url?: string;
  email?: string;
  phone?: string;
  join_date?: string;
  is_featured: boolean;
}

interface ContactInfo {
  id: number;
  department: string;
  phone?: string;
  email?: string;
  address?: string;
  working_hours?: string;
  is_primary: boolean;
}

interface AdPackage {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration?: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
}

interface EditorialPolicy {
  id: number;
  title: string;
  content: string;
  category?: string;
  priority: number;
  is_active: boolean;
}

export default function FooterPagesAdminPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [adPackages, setAdPackages] = useState<AdPackage[]>([]);
  const [editorialPolicies, setEditorialPolicies] = useState<EditorialPolicy[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('team');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch team members
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .order('is_featured', { ascending: false });
      
      if (teamError) throw teamError;
      setTeamMembers(teamData || []);

      // Fetch contact info
      const { data: contactData, error: contactError } = await supabase
        .from('contact_info')
        .select('*')
        .order('is_primary', { ascending: false });
      
      if (contactError) throw contactError;
      setContactInfo(contactData || []);

      // Fetch ad packages
      const { data: adData, error: adError } = await supabase
        .from('ad_packages')
        .select('*')
        .order('price', { ascending: true });
      
      if (adError) throw adError;
      setAdPackages(adData || []);

      // Fetch editorial policies
      const { data: policyData, error: policyError } = await supabase
        .from('editorial_policies')
        .select('*')
        .order('priority', { ascending: true });
      
      if (policyError) throw policyError;
      setEditorialPolicies(policyData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (tableName: string, item: any) => {
    try {
      if (item.id) {
        // Update existing item
        const { error } = await supabase
          .from(tableName)
          .update(item)
          .eq('id', item.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Item updated successfully"
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from(tableName)
          .insert([item]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Item created successfully"
        });
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      fetchAllData();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: "Failed to save item",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (tableName: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Item deleted successfully"
      });
      
      fetchAllData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Footer Pages Management</h1>
        <Badge variant="outline">
          {teamMembers.length + contactInfo.length + adPackages.length + editorialPolicies.length} Total Items
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="ads">Ad Packages</TabsTrigger>
          <TabsTrigger value="policies">Editorial Policies</TabsTrigger>
        </TabsList>

        {/* Team Members Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({teamMembers.length})
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem({ is_featured: false })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem?.id ? 'Edit' : 'Add'} Team Member
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editingItem?.name || ''}
                          onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          value={editingItem?.position || ''}
                          onChange={(e) => setEditingItem({...editingItem, position: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={editingItem?.department || ''}
                          onChange={(e) => setEditingItem({...editingItem, department: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editingItem?.email || ''}
                          onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editingItem?.bio || ''}
                        onChange={(e) => setEditingItem({...editingItem, bio: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_featured"
                        checked={editingItem?.is_featured || false}
                        onCheckedChange={(checked) => setEditingItem({...editingItem, is_featured: checked})}
                      />
                      <Label htmlFor="is_featured">Featured Member</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSave('team_members', editingItem)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.position}</p>
                        <p className="text-xs text-gray-500">{member.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.is_featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(member);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete('team_members', member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information ({contactInfo.length})
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem({ is_primary: false })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem?.id ? 'Edit' : 'Add'} Contact Information
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={editingItem?.department || ''}
                        onChange={(e) => setEditingItem({...editingItem, department: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editingItem?.phone || ''}
                          onChange={(e) => setEditingItem({...editingItem, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editingItem?.email || ''}
                          onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={editingItem?.address || ''}
                        onChange={(e) => setEditingItem({...editingItem, address: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="working_hours">Working Hours</Label>
                      <Input
                        id="working_hours"
                        value={editingItem?.working_hours || ''}
                        onChange={(e) => setEditingItem({...editingItem, working_hours: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_primary"
                        checked={editingItem?.is_primary || false}
                        onCheckedChange={(checked) => setEditingItem({...editingItem, is_primary: checked})}
                      />
                      <Label htmlFor="is_primary">Primary Contact</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSave('contact_info', editingItem)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contactInfo.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{contact.department}</h3>
                        <p className="text-sm text-gray-600">{contact.phone} • {contact.email}</p>
                        <p className="text-xs text-gray-500">{contact.working_hours}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {contact.is_primary && (
                        <Badge variant="secondary">Primary</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(contact);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete('contact_info', contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ad Packages Tab */}
        <TabsContent value="ads">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Advertisement Packages ({adPackages.length})
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem({ features: [], is_popular: false, is_active: true })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Package
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem?.id ? 'Edit' : 'Add'} Ad Package
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Package Name</Label>
                      <Input
                        id="name"
                        value={editingItem?.name || ''}
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editingItem?.description || ''}
                        onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          value={editingItem?.price || ''}
                          onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          value={editingItem?.duration || ''}
                          onChange={(e) => setEditingItem({...editingItem, duration: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="features">Features (comma-separated)</Label>
                      <Textarea
                        id="features"
                        value={editingItem?.features?.join(', ') || ''}
                        onChange={(e) => setEditingItem({...editingItem, features: e.target.value.split(', ').filter(f => f.trim())})}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_popular"
                          checked={editingItem?.is_popular || false}
                          onCheckedChange={(checked) => setEditingItem({...editingItem, is_popular: checked})}
                        />
                        <Label htmlFor="is_popular">Popular</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={editingItem?.is_active || false}
                          onCheckedChange={(checked) => setEditingItem({...editingItem, is_active: checked})}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSave('ad_packages', editingItem)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adPackages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <p className="text-sm text-gray-600">৳{pkg.price} • {pkg.duration}</p>
                        <p className="text-xs text-gray-500">{pkg.features.length} features</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {pkg.is_popular && (
                        <Badge variant="secondary">Popular</Badge>
                      )}
                      {!pkg.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(pkg);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete('ad_packages', pkg.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Editorial Policies Tab */}
        <TabsContent value="policies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Editorial Policies ({editorialPolicies.length})
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem({ priority: 0, is_active: true })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Policy
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem?.id ? 'Edit' : 'Add'} Editorial Policy
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editingItem?.title || ''}
                        onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={editingItem?.content || ''}
                        onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                        rows={6}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={editingItem?.category || ''}
                          onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Input
                          id="priority"
                          type="number"
                          value={editingItem?.priority || ''}
                          onChange={(e) => setEditingItem({...editingItem, priority: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={editingItem?.is_active || false}
                        onCheckedChange={(checked) => setEditingItem({...editingItem, is_active: checked})}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSave('editorial_policies', editingItem)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {editorialPolicies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{policy.title}</h3>
                        <p className="text-sm text-gray-600">{policy.category}</p>
                        <p className="text-xs text-gray-500">Priority: {policy.priority}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!policy.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(policy);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete('editorial_policies', policy.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}