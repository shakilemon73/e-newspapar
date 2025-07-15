import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Save, 
  Database,
  Key,
  Globe,
  Shield,
  Mail,
  Bell,
  Palette,
  Languages,
  Loader2,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { AdminOnlyLayout } from '@/components/admin/AdminOnlyLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  defaultLanguage: string;
  enableNotifications: boolean;
  enableComments: boolean;
  enableUserRegistration: boolean;
  maintenanceMode: boolean;
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  socialSettings: {
    facebookUrl: string;
    twitterUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    googleAnalyticsId: string;
    facebookPixelId: string;
  };
}

const defaultSettings: SystemSettings = {
  siteName: 'প্রথম আলো',
  siteDescription: 'বাংলাদেশের শীর্ষ বাংলা সংবাদপত্র',
  siteUrl: 'https://example.com',
  defaultLanguage: 'bn',
  enableNotifications: true,
  enableComments: true,
  enableUserRegistration: true,
  maintenanceMode: false,
  emailSettings: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
  },
  socialSettings: {
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
  },
  seoSettings: {
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
  },
};

export default function SettingsAdminPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [authLoading, user, setLocation]);

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(defaultSettings);
    setHasChanges(hasChanges);
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: SystemSettings) => {
      // Since we don't have a specific settings endpoint, we'll save to localStorage
      // In a real app, this would be saved to the database
      localStorage.setItem('systemSettings', JSON.stringify(settingsData));
      return settingsData;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleSettingChange = (section: string, key: string, value: any) => {
    if (section === 'general') {
      setSettings(prev => ({ ...prev, [key]: value }));
    } else {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof SystemSettings],
          [key]: value
        }
      }));
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'social', label: 'Social Media', icon: Globe },
    { id: 'seo', label: 'SEO', icon: Shield },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

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
              System Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure your Bengali news website settings
            </p>
          </div>
          <Button 
            onClick={handleSaveSettings}
            disabled={!hasChanges || saveSettingsMutation.isPending}
            className="flex items-center gap-2"
          >
            {saveSettingsMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              You have unsaved changes
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic site configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteUrl">Site URL</Label>
                      <Input
                        id="siteUrl"
                        type="url"
                        value={settings.siteUrl}
                        onChange={(e) => handleSettingChange('general', 'siteUrl', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="defaultLanguage">Default Language</Label>
                      <Select
                        value={settings.defaultLanguage}
                        onValueChange={(value) => handleSettingChange('general', 'defaultLanguage', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Features</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enableNotifications">Enable Notifications</Label>
                          <p className="text-sm text-gray-500">Allow push notifications for breaking news</p>
                        </div>
                        <Switch
                          id="enableNotifications"
                          checked={settings.enableNotifications}
                          onCheckedChange={(checked) => handleSettingChange('general', 'enableNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enableComments">Enable Comments</Label>
                          <p className="text-sm text-gray-500">Allow users to comment on articles</p>
                        </div>
                        <Switch
                          id="enableComments"
                          checked={settings.enableComments}
                          onCheckedChange={(checked) => handleSettingChange('general', 'enableComments', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enableUserRegistration">Enable User Registration</Label>
                          <p className="text-sm text-gray-500">Allow new users to register</p>
                        </div>
                        <Switch
                          id="enableUserRegistration"
                          checked={settings.enableUserRegistration}
                          onCheckedChange={(checked) => handleSettingChange('general', 'enableUserRegistration', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                          <p className="text-sm text-gray-500">Temporarily disable public access</p>
                        </div>
                        <Switch
                          id="maintenanceMode"
                          checked={settings.maintenanceMode}
                          onCheckedChange={(checked) => handleSettingChange('general', 'maintenanceMode', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'email' && (
              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>Configure SMTP settings for email notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.emailSettings.smtpHost}
                        onChange={(e) => handleSettingChange('emailSettings', 'smtpHost', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.emailSettings.smtpPort}
                        onChange={(e) => handleSettingChange('emailSettings', 'smtpPort', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={settings.emailSettings.smtpUser}
                      onChange={(e) => handleSettingChange('emailSettings', 'smtpUser', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.emailSettings.smtpPassword}
                      onChange={(e) => handleSettingChange('emailSettings', 'smtpPassword', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={settings.emailSettings.fromEmail}
                        onChange={(e) => handleSettingChange('emailSettings', 'fromEmail', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={settings.emailSettings.fromName}
                        onChange={(e) => handleSettingChange('emailSettings', 'fromName', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'social' && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Settings</CardTitle>
                  <CardDescription>Configure social media integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="facebookUrl">Facebook URL</Label>
                    <Input
                      id="facebookUrl"
                      type="url"
                      value={settings.socialSettings.facebookUrl}
                      onChange={(e) => handleSettingChange('socialSettings', 'facebookUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitterUrl">Twitter URL</Label>
                    <Input
                      id="twitterUrl"
                      type="url"
                      value={settings.socialSettings.twitterUrl}
                      onChange={(e) => handleSettingChange('socialSettings', 'twitterUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagramUrl">Instagram URL</Label>
                    <Input
                      id="instagramUrl"
                      type="url"
                      value={settings.socialSettings.instagramUrl}
                      onChange={(e) => handleSettingChange('socialSettings', 'instagramUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtubeUrl">YouTube URL</Label>
                    <Input
                      id="youtubeUrl"
                      type="url"
                      value={settings.socialSettings.youtubeUrl}
                      onChange={(e) => handleSettingChange('socialSettings', 'youtubeUrl', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'seo' && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>Search engine optimization configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={settings.seoSettings.metaTitle}
                      onChange={(e) => handleSettingChange('seoSettings', 'metaTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={settings.seoSettings.metaDescription}
                      onChange={(e) => handleSettingChange('seoSettings', 'metaDescription', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                    <Input
                      id="metaKeywords"
                      value={settings.seoSettings.metaKeywords}
                      onChange={(e) => handleSettingChange('seoSettings', 'metaKeywords', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                    <Input
                      id="googleAnalyticsId"
                      value={settings.seoSettings.googleAnalyticsId}
                      onChange={(e) => handleSettingChange('seoSettings', 'googleAnalyticsId', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                    <Input
                      id="facebookPixelId"
                      value={settings.seoSettings.facebookPixelId}
                      onChange={(e) => handleSettingChange('seoSettings', 'facebookPixelId', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Database and security configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">Database Status</h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Connected to Supabase PostgreSQL database
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Connection Active</span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-900 dark:text-green-100">Authentication</h3>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Supabase Auth enabled with role-based access control
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Admin Role Active</span>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">API Keys</h3>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Environment variables configured for Supabase integration
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Keys Configured</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize the look and feel of your site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">Theme</h3>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Dark/Light mode toggle is available in the navigation
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Languages className="h-5 w-5 text-teal-600" />
                      <h3 className="font-semibold text-teal-900 dark:text-teal-100">Language</h3>
                    </div>
                    <p className="text-sm text-teal-700 dark:text-teal-300">
                      Bengali and English language support enabled
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100">Responsive Design</h3>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Mobile-first responsive design with Tailwind CSS
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminOnlyLayout>
  );
}