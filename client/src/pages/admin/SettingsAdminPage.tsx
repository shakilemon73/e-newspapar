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
import { adminSupabaseAPI } from '@/lib/admin';
import { brandingThemes, fontOptions, type BrandingTheme, type FontOption } from '@/lib/branding-themes';
import { loadBengaliFont, applyBrandingTheme } from '@/lib/font-loader';

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

  // Branding states
  const [brandingSettings, setBrandingSettings] = useState({
    theme: 'traditional-red',
    headlineFont: 'noto-sans-bengali',
    bodyFont: 'siyam-rupali',
    displayFont: 'kalpurush',
    customColors: {
      primary: '#ec1f27',
      secondary: '#509478',
      accent: '#fbcc44'
    }
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

      // Load branding settings if available
      setBrandingSettings({
        theme: settings.theme || 'traditional-red',
        headlineFont: settings.headlineFont || 'noto-sans-bengali',
        bodyFont: settings.bodyFont || 'siyam-rupali',
        displayFont: settings.displayFont || 'kalpurush',
        customColors: {
          primary: settings.primaryColor || '#ec1f27',
          secondary: settings.secondaryColor || '#509478',
          accent: settings.accentColor || '#fbcc44'
        }
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
      
      // Apply branding theme to current page
      applyBrandingTheme(brandingSettings);
      
      // Trigger global site settings refresh
      window.dispatchEvent(new CustomEvent('siteSettingsUpdated', {
        detail: { 
          siteName: siteSettings.siteName,
          branding: brandingSettings
        }
      }));
      
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
    const allSettings: Record<string, string> = {
      ...siteSettings,
      theme: brandingSettings.theme,
      headlineFont: brandingSettings.headlineFont,
      bodyFont: brandingSettings.bodyFont,
      displayFont: brandingSettings.displayFont,
      primaryColor: brandingSettings.customColors.primary,
      secondaryColor: brandingSettings.customColors.secondary,
      accentColor: brandingSettings.customColors.accent
    };
    updateSettingsMutation.mutate(allSettings);
  };

  const handleInputChange = (field: string, value: string) => {
    setSiteSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBrandingChange = (field: string, value: string) => {
    setBrandingSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Load font immediately when selected
    if (['headlineFont', 'bodyFont', 'displayFont'].includes(field)) {
      loadBengaliFont(value).then(result => {
        if (!result.success) {
          toast({
            title: 'Font Loading Warning',
            description: `Font may not display correctly: ${result.error}`,
            variant: 'destructive',
          });
        }
      });
    }
  };

  const handleColorChange = (colorType: string, value: string) => {
    setBrandingSettings(prev => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [colorType]: value
      }
    }));
  };

  const selectedTheme = brandingThemes.find(theme => theme.id === brandingSettings.theme) || brandingThemes[0];
  const headlineFonts = fontOptions.filter(font => font.category === 'headlines');
  const bodyFonts = fontOptions.filter(font => font.category === 'body');
  const displayFonts = fontOptions.filter(font => font.category === 'display');

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
            {/* Color Themes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Themes
                  <span className="text-sm font-normal text-muted-foreground">(রঙের থিম)</span>
                </CardTitle>
                <CardDescription>
                  Choose from professional color schemes designed for Bengali news portals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {brandingThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                        brandingSettings.theme === theme.id 
                          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleBrandingChange('theme', theme.id)}
                    >
                      {/* Theme Preview */}
                      <div className="mb-3 h-16 rounded overflow-hidden border">
                        <div className="flex h-full">
                          <div 
                            className="w-1/2" 
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <div 
                            className="w-1/4" 
                            style={{ backgroundColor: theme.colors.secondary }}
                          />
                          <div 
                            className="w-1/4" 
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-medium">{theme.name}</h4>
                        <p className="text-sm text-muted-foreground">{theme.nameBengali}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {theme.description}
                        </p>
                      </div>
                      
                      {brandingSettings.theme === theme.id && (
                        <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Custom Colors Override */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Custom Color Override (কাস্টম রঙ)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color (প্রধান রঙ)</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="primaryColor"
                          value={brandingSettings.customColors.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="w-12 h-9 rounded border cursor-pointer"
                        />
                        <Input
                          value={brandingSettings.customColors.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          placeholder="#ec1f27"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color (গৌণ রঙ)</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="secondaryColor"
                          value={brandingSettings.customColors.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="w-12 h-9 rounded border cursor-pointer"
                        />
                        <Input
                          value={brandingSettings.customColors.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          placeholder="#509478"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Accent Color (অ্যাকসেন্ট রঙ)</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="accentColor"
                          value={brandingSettings.customColors.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="w-12 h-9 rounded border cursor-pointer"
                        />
                        <Input
                          value={brandingSettings.customColors.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          placeholder="#fbcc44"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Typography
                  <span className="text-sm font-normal text-muted-foreground">(টাইপোগ্রাফি)</span>
                </CardTitle>
                <CardDescription>
                  Choose professional Bengali fonts optimized for news readability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Headlines Font */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Headlines Font (শিরোনাম ফন্ট)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {headlineFonts.map((font) => (
                      <div
                        key={font.id}
                        className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-sm ${
                          brandingSettings.headlineFont === font.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleBrandingChange('headlineFont', font.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{font.name}</h4>
                          {brandingSettings.headlineFont === font.id && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{font.bengaliName}</p>
                        <div className="text-lg font-bold mb-1" style={{ fontFamily: font.cssName }}>
                          {font.preview}
                        </div>
                        <p className="text-xs text-muted-foreground">{font.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body Font */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Body Text Font (মূল টেক্সট ফন্ট)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {bodyFonts.map((font) => (
                      <div
                        key={font.id}
                        className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-sm ${
                          brandingSettings.bodyFont === font.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleBrandingChange('bodyFont', font.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{font.name}</h4>
                          {brandingSettings.bodyFont === font.id && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{font.bengaliName}</p>
                        <div className="text-sm mb-1" style={{ fontFamily: font.cssName }}>
                          {font.preview}
                        </div>
                        <p className="text-xs text-muted-foreground">{font.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display Font */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Display Font (ডিসপ্লে ফন্ট)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayFonts.map((font) => (
                      <div
                        key={font.id}
                        className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-sm ${
                          brandingSettings.displayFont === font.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleBrandingChange('displayFont', font.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{font.name}</h4>
                          {brandingSettings.displayFont === font.id && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{font.bengaliName}</p>
                        <div className="text-lg font-semibold mb-1" style={{ fontFamily: font.cssName }}>
                          {font.preview}
                        </div>
                        <p className="text-xs text-muted-foreground">{font.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Branding Settings */}
                <div className="border-t pt-6">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={updateSettingsMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {updateSettingsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Branding Settings (ব্র্যান্ডিং সেটিংস সংরক্ষণ করুন)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle>Live Preview (লাইভ প্রিভিউ)</CardTitle>
                <CardDescription>
                  Preview how your selected theme and fonts will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-6 space-y-4"
                  style={{
                    backgroundColor: selectedTheme.colors.background,
                    color: selectedTheme.colors.foreground,
                    borderColor: selectedTheme.colors.border
                  }}
                >
                  <div 
                    className="text-2xl font-bold"
                    style={{ 
                      fontFamily: headlineFonts.find(f => f.id === brandingSettings.headlineFont)?.cssName,
                      color: brandingSettings.customColors.primary
                    }}
                  >
                    {siteSettings.siteName || 'Your News Site'} - Breaking News
                  </div>
                  <div 
                    className="text-lg font-medium"
                    style={{ 
                      fontFamily: displayFonts.find(f => f.id === brandingSettings.displayFont)?.cssName,
                      color: brandingSettings.customColors.secondary
                    }}
                  >
                    আজকের প্রধান সংবাদ
                  </div>
                  <div 
                    className="text-base leading-relaxed"
                    style={{ 
                      fontFamily: bodyFonts.find(f => f.id === brandingSettings.bodyFont)?.cssName
                    }}
                  >
                    {siteSettings.siteDescription || 'বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম। আমাদের সাথে থাকুন সর্বশেষ খবরের জন্য।'}
                  </div>
                  <div className="flex gap-2">
                    <span 
                      className="px-3 py-1 rounded text-sm font-medium"
                      style={{ 
                        backgroundColor: brandingSettings.customColors.accent,
                        color: selectedTheme.colors.background
                      }}
                    >
                      Category Tag
                    </span>
                    <span 
                      className="px-3 py-1 rounded text-sm"
                      style={{ 
                        backgroundColor: selectedTheme.colors.muted,
                        color: selectedTheme.colors.foreground
                      }}
                    >
                      Secondary Tag
                    </span>
                  </div>
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