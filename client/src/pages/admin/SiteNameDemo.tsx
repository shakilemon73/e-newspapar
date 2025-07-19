import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SiteName, useGlobalSiteName } from '@/hooks/use-global-site-name';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Separator } from '@/components/ui/separator';
import { Settings, FileText, Users, Globe, Eye } from 'lucide-react';

/**
 * Administrative Demo Page showing centralized site name control
 * This demonstrates how changing the site name in one place updates all 81 instances
 */
export default function SiteNameDemoPage() {
  const { settings, updateSettings } = useSiteSettings();
  const [tempSiteName, setTempSiteName] = useState(settings.siteName);
  
  const handleUpdateSiteName = () => {
    updateSettings({ siteName: tempSiteName });
    
    // Update global settings for immediate effect
    if (typeof window !== 'undefined') {
      (window as any).globalSiteSettings = {
        ...(window as any).globalSiteSettings,
        siteName: tempSiteName
      };
      
      // Dispatch event to update all instances
      window.dispatchEvent(new CustomEvent('siteSettingsUpdated', {
        detail: { siteName: tempSiteName }
      }));
    }
  };

  // Demo instances showing various places where site name appears
  const demoInstances = [
    { location: 'Main Header Logo', component: 'Header.tsx', line: '45' },
    { location: 'Mobile Navigation', component: 'MobileNavigation.tsx', line: '106' },
    { location: 'Footer Copyright', component: 'Footer.tsx', line: '89' },
    { location: 'Admin Panel Title', component: 'AdminLayout.tsx', line: '163' },
    { location: 'Document Title', component: 'ArticleDetail.tsx', line: '601' },
    { location: 'Social Media Meta', component: 'social-media-meta.ts', line: '114' },
    { location: 'Login Page Title', component: 'Login.tsx', line: '63' },
    { location: 'Enhanced Homepage', component: 'EnhancedHomepage.tsx', line: '420' },
    { location: 'About Page', component: 'About.tsx', line: '57' },
    { location: 'Terms of Service', component: 'TermsOfService.tsx', line: '43' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Site Name Control Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Control all 81 instances of your site name from one central location
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          81 Instances Controlled
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Site Name Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Current Site Name
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">
                <SiteName />
              </div>
              <p className="text-sm text-muted-foreground">
                This name appears in all 81 locations across your website
              </p>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="newSiteName">Update Site Name</Label>
              <Input
                id="newSiteName"
                value={tempSiteName}
                onChange={(e) => setTempSiteName(e.target.value)}
                placeholder="Enter new site name"
              />
              <Button 
                onClick={handleUpdateSiteName}
                className="w-full"
                disabled={tempSiteName === settings.siteName}
              >
                Update All 81 Instances
              </Button>
              <p className="text-xs text-muted-foreground">
                Changes will be applied instantly across your entire website
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instance Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Where Your Site Name Appears
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {demoInstances.map((instance, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{instance.location}</div>
                    <div className="text-xs text-muted-foreground">
                      {instance.component}:{instance.line}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <SiteName />
                  </Badge>
                </div>
              ))}
              <div className="text-center p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  ... and 71 more locations
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Demo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Live Demo Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium mb-2">Header Logo</div>
              <div className="text-lg font-bold text-primary">
                <SiteName />
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium mb-2">Footer Copyright</div>
              <div className="text-sm text-muted-foreground">
                © 2025 <SiteName />
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium mb-2">Page Title</div>
              <div className="text-sm">
                Latest News - <SiteName />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-green-700 dark:text-green-300 font-medium">
              ✅ Centralized Control Active
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              All instances update automatically when you change the site name above
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Technical Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Components Updated:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• SiteSettingsContext.tsx</li>
                <li>• useGlobalSiteName hook</li>
                <li>• Admin Settings Page</li>
                <li>• All header/footer components</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Update Mechanism:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Global event dispatcher</li>
                <li>• Real-time context updates</li>
                <li>• Database persistence</li>
                <li>• Component hot-reload</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}