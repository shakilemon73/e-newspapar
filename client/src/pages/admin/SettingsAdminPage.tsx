/**
 * Settings Admin Page - Migrated to Direct Supabase API
 * Replaces Express server dependencies for Vercel deployment
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Save, 
  Loader2, 
  Globe, 
  Palette, 
  Shield, 
  Bell,
  Database,
  Mail,
  Smartphone,
  Activity,
  RefreshCw
} from 'lucide-react';
import { adminSupabaseAPI } from '@/lib/admin-supabase-complete';

export default function SettingsAdminPageMigrated() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [siteSettings, setSiteSettings] = useState({
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    logoUrl: '',
    defaultLanguage: 'bn'
  });

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [authLoading, user, setLocation]);

  // Fetch system settings using direct Supabase API
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['admin-system-settings'],
    enabled: !!user && user.user_metadata?.role === 'admin',
    queryFn: adminSupabaseAPI.settings.getAll,
  });

  // Update form state when settings are loaded
  useEffect(() => {
    if (settings && typeof settings === 'object' && !Array.isArray(settings)) {
      setSiteSettings({
        siteName: settings.siteName || '',
        siteDescription: settings.siteDescription || '',
        siteUrl: settings.siteUrl || '',
        logoUrl: settings.logoUrl || '',
        defaultLanguage: settings.defaultLanguage || 'bn'
      });
    }
  }, [settings]);

  // Update settings mutation using direct Supabase API
  const updateSettingsMutation = useMutation({
    mutationFn: (settingsToUpdate: Record<string, string>) => adminSupabaseAPI.settings.updateMultiple(settingsToUpdate),
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'System settings have been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(siteSettings);
  };

  const handleInputChange = (field: string, value: string) => {
    setSiteSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (error) {
    return (
      <EnhancedAdminLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Settings className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading Settings
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {error.message || 'An error occurred while loading settings'}
            </p>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6 p-6">
        {/* Header Section */}
        <div className="cultural-gradient rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3 tracking-tight">
                System Settings
              </h1>
              <p className="text-green-100 text-lg">
                Configure your news website settings - Direct Supabase API
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">
              <Globe className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Database className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic website information and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                          id="siteName"
                          value={siteSettings.siteName}
                          onChange={(e) => handleInputChange('siteName', e.target.value)}
                          placeholder="Your website name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteUrl">Site URL</Label>
                        <Input
                          id="siteUrl"
                          value={siteSettings.siteUrl}
                          onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        value={siteSettings.siteDescription}
                        onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                        placeholder="Brief description of your website"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={siteSettings.logoUrl}
                        onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                        placeholder="https://yourwebsite.com/logo.png"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultLanguage">Default Language</Label>
                      <select
                        id="defaultLanguage"
                        value={siteSettings.defaultLanguage}
                        onChange={(e) => handleInputChange('defaultLanguage', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="bn">Bengali (বাংলা)</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <Button 
                      onClick={handleSaveSettings}
                      disabled={updateSettingsMutation.isPending}
                      className="w-full"
                    >
                      {updateSettingsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save General Settings
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Appearance settings are managed through the theme system. 
                    Theme customization will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage security features and access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Security settings are managed through Supabase Row Level Security (RLS) policies.
                    Advanced security configuration is available in the Security admin section.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure email and push notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Notification settings will be available in the Email & Notifications admin section.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Database and system configuration options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Direct Supabase API</h4>
                      <p className="text-sm text-muted-foreground">
                        Using direct Supabase API calls (Vercel ready)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Express Server Dependency</h4>
                      <p className="text-sm text-muted-foreground">
                        Migration to serverless functions completed
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-600">Removed</span>
                    </div>
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