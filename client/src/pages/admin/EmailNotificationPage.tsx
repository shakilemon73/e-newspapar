import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Mail, 
  Send, 
  Settings, 
  Users, 
  Bell,
  MessageSquare,
  FileText,
  Eye,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import { getAdminEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from '@/lib/admin-api-direct';
import { useToast } from '@/hooks/use-toast';

export default function EmailNotificationPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'newsletter'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Email templates query using direct Supabase API
  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['admin-email-templates'],
    queryFn: () => getAdminEmailTemplates(),
  });

  // Extract templates array from the response
  const templates = templatesData?.templates || [];

  // Newsletter subscribers query
  const { data: subscribers, isLoading: subscribersLoading } = useQuery({
    queryKey: ['/api/admin/newsletter-subscribers'],
  });

  // Email settings query
  const { data: emailSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/email-settings'],
  });

  // Email stats query
  const { data: emailStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/email-stats'],
  });

  // Create/Update template mutation
  const templateMutation = useMutation({
    mutationFn: (data: any) => {
      if (selectedTemplate) {
        return apiRequest(`/api/admin/email-templates/${selectedTemplate.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      }
      return apiRequest('/api/admin/email-templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "টেমপ্লেট সংরক্ষিত",
        description: "ইমেইল টেমপ্লেট সফলভাবে সংরক্ষিত হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      setSelectedTemplate(null);
      setTemplateForm({ name: '', subject: '', content: '', type: 'newsletter' });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/email-templates/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({
        title: "টেমপ্লেট মুছে ফেলা হয়েছে",
        description: "ইমেইল টেমপ্লেট সফলভাবে মুছে ফেলা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
    },
  });

  // Send newsletter mutation
  const sendNewsletterMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/send-newsletter', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "নিউজলেটার পাঠানো হয়েছে",
        description: "নিউজলেটার সকল সাবস্ক্রাইবারদের পাঠানো হয়েছে",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/email-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "সেটিংস আপডেট হয়েছে",
        description: "ইমেইল সেটিংস সফলভাবে আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-settings'] });
    },
  });

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    templateMutation.mutate(templateForm);
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type
    });
  };

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ইমেইল ও নোটিফিকেশন</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              ইমেইল টেমপ্লেট, নিউজলেটার এবং পুশ নোটিফিকেশন ব্যবস্থাপনা
            </p>
          </div>
        </div>

        {/* Email Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট সাবস্ক্রাইবার</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailStats?.total_subscribers || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{emailStats?.new_subscribers_today || 0} আজ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">পাঠানো ইমেইল</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailStats?.emails_sent || 0}</div>
              <p className="text-xs text-muted-foreground">
                এই মাসে
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ওপেন রেট</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailStats?.open_rate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                গত মাসের তুলনায়
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ইমেইল টেমপ্লেট</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                সক্রিয় টেমপ্লেট
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Email Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">টেমপ্লেট</TabsTrigger>
            <TabsTrigger value="subscribers">সাবস্ক্রাইবার</TabsTrigger>
            <TabsTrigger value="newsletter">নিউজলেটার</TabsTrigger>
            <TabsTrigger value="settings">সেটিংস</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Template Form */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedTemplate ? 'টেমপ্লেট সম্পাদনা' : 'নতুন টেমপ্লেট'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTemplateSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">টেমপ্লেট নাম</Label>
                      <Input
                        id="name"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">ইমেইল সাবজেক্ট</Label>
                      <Input
                        id="subject"
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">ইমেইল কন্টেন্ট</Label>
                      <Textarea
                        id="content"
                        value={templateForm.content}
                        onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                        rows={8}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={templateMutation.isPending}
                        className="flex-1"
                      >
                        {templateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {selectedTemplate ? 'আপডেট করুন' : 'তৈরি করুন'}
                      </Button>
                      {selectedTemplate && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(null);
                            setTemplateForm({ name: '', subject: '', content: '', type: 'newsletter' });
                          }}
                        >
                          বাতিল
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Template List */}
              <Card>
                <CardHeader>
                  <CardTitle>সংরক্ষিত টেমপ্লেট</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templates?.map((template: any) => (
                      <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                          <Badge variant="outline" className="mt-1">
                            {template.type}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTemplateMutation.mutate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>নিউজলেটার সাবস্ক্রাইবার</CardTitle>
                <CardDescription>
                  {subscribers?.length || 0} জন সাবস্ক্রাইবার নিবন্ধিত
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subscribers?.map((subscriber: any) => (
                    <div key={subscriber.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{subscriber.email}</h4>
                        <p className="text-sm text-gray-600">
                          সাবস্ক্রাইব: {new Date(subscriber.subscribed_at).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={subscriber.active ? 'default' : 'secondary'}>
                          {subscriber.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newsletter" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>নিউজলেটার পাঠান</CardTitle>
                <CardDescription>
                  সকল সাবস্ক্রাইবারদের নিউজলেটার পাঠান
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newsletter-template">টেমপ্লেট নির্বাচন করুন</Label>
                    <select 
                      id="newsletter-template"
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">টেমপ্লেট নির্বাচন করুন</option>
                      {templates?.filter((t: any) => t.type === 'newsletter').map((template: any) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button 
                    onClick={() => sendNewsletterMutation.mutate({})}
                    disabled={sendNewsletterMutation.isPending}
                    className="w-full"
                  >
                    {sendNewsletterMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    নিউজলেটার পাঠান
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ইমেইল সেটিংস</CardTitle>
                <CardDescription>
                  ইমেইল এবং নোটিফিকেশন সেটিংস কনফিগার করুন
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">ইমেইল নোটিফিকেশন</Label>
                      <p className="text-sm text-gray-600">নতুন কমেন্ট এবং আপডেটের জন্য ইমেইল</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailSettings?.email_notifications}
                      onCheckedChange={(checked) => 
                        updateSettingsMutation.mutate({
                          ...emailSettings,
                          email_notifications: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-newsletter">স্বয়ংক্রিয় নিউজলেটার</Label>
                      <p className="text-sm text-gray-600">সাপ্তাহিক নিউজলেটার স্বয়ংক্রিয়ভাবে পাঠান</p>
                    </div>
                    <Switch
                      id="auto-newsletter"
                      checked={emailSettings?.auto_newsletter}
                      onCheckedChange={(checked) => 
                        updateSettingsMutation.mutate({
                          ...emailSettings,
                          auto_newsletter: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">পুশ নোটিফিকেশন</Label>
                      <p className="text-sm text-gray-600">ব্রেকিং নিউজের জন্য পুশ নোটিফিকেশন</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={emailSettings?.push_notifications}
                      onCheckedChange={(checked) => 
                        updateSettingsMutation.mutate({
                          ...emailSettings,
                          push_notifications: checked
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAdminLayout>
  );
}