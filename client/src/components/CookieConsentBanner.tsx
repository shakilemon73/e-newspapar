import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cookie, 
  Settings, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Shield
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    advertising: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has made a choice
    const consentGiven = localStorage.getItem('cookie_consent');
    if (!consentGiven) {
      setShowBanner(true);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem('cookie_preferences');
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (error) {
          console.error('Error parsing cookie preferences:', error);
        }
      }
    }
  }, []);

  const acceptAllCookies = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      advertising: true,
      functional: true
    };
    
    setPreferences(allAccepted);
    saveConsent(allAccepted);
    setShowBanner(false);
  };

  const acceptNecessaryOnly = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      advertising: false,
      functional: false
    };
    
    setPreferences(necessaryOnly);
    saveConsent(necessaryOnly);
    setShowBanner(false);
  };

  const saveCustomPreferences = () => {
    saveConsent(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('cookie_preferences', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    
    // Set specific consent flags for different services
    if (prefs.advertising) {
      localStorage.setItem('adsense_consent', 'true');
    } else {
      localStorage.removeItem('adsense_consent');
    }
    
    if (prefs.analytics) {
      localStorage.setItem('analytics_consent', 'true');
    } else {
      localStorage.removeItem('analytics_consent');
    }
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!showBanner) {
    return null;
  }

  const cookieTypes = [
    {
      key: 'necessary' as keyof CookiePreferences,
      title: 'প্রয়োজনীয় কুকিজ',
      description: 'ওয়েবসাইটের মূল কার্যকারিতার জন্য আবশ্যক',
      required: true,
      icon: <Shield className="h-4 w-4 text-green-500" />
    },
    {
      key: 'functional' as keyof CookiePreferences,
      title: 'কার্যকরী কুকিজ',
      description: 'আপনার পছন্দ এবং সেটিংস মনে রাখে',
      required: false,
      icon: <Settings className="h-4 w-4 text-blue-500" />
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      title: 'বিশ্লেষণ কুকিজ',
      description: 'সাইটের ব্যবহার বুঝতে এবং উন্নত করতে সাহায্য করে',
      required: false,
      icon: <CheckCircle className="h-4 w-4 text-purple-500" />
    },
    {
      key: 'advertising' as keyof CookiePreferences,
      title: 'বিজ্ঞাপন কুকিজ',
      description: 'আপনার আগ্রহ অনুযায়ী প্রাসঙ্গিক বিজ্ঞাপন দেখায়',
      required: false,
      icon: <Cookie className="h-4 w-4 text-orange-500" />
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-blue-200 bg-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">কুকিজ এবং গোপনীয়তা</h3>
              <p className="text-gray-600 mb-4">
                আমরা আপনার ওয়েবসাইট অভিজ্ঞতা উন্নত করতে, বিশ্লেষণের জন্য এবং 
                প্রাসঙ্গিক বিজ্ঞাপন দেখানোর জন্য কুকিজ ব্যবহার করি। 
                Google AdSense আমাদের বিজ্ঞাপন অংশীদার।
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Google AdSense সামঞ্জস্যপূর্ণ
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  GDPR অনুবর্তী
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={acceptAllCookies} className="bg-blue-600 hover:bg-blue-700">
                  সব কুকিজ গ্রহণ করুন
                </Button>
                
                <Button variant="outline" onClick={acceptNecessaryOnly}>
                  শুধু প্রয়োজনীয়
                </Button>
                
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      কাস্টমাইজ করুন
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Cookie className="h-5 w-5 text-blue-500" />
                        কুকিজ সেটিংস
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        আপনি কোন ধরনের কুকিজ গ্রহণ করতে চান তা নির্বাচন করুন:
                      </p>
                      
                      {cookieTypes.map((type) => (
                        <div key={type.key} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-start gap-3 flex-1">
                            {type.icon}
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {type.title}
                                {type.required && (
                                  <Badge variant="outline" className="text-xs">
                                    আবশ্যক
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {type.description}
                              </div>
                            </div>
                          </div>
                          <Switch
                            checked={preferences[type.key]}
                            onCheckedChange={(checked) => updatePreference(type.key, checked)}
                            disabled={type.required}
                          />
                        </div>
                      ))}
                      
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-sm">আরও তথ্য</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <a 
                            href="/privacy-policy" 
                            target="_blank" 
                            className="text-blue-600 hover:underline"
                          >
                            আমাদের গোপনীয়তা নীতি
                          </a>
                          <a 
                            href="https://policies.google.com/privacy" 
                            target="_blank" 
                            className="text-blue-600 hover:underline"
                          >
                            Google এর গোপনীয়তা নীতি
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button onClick={saveCustomPreferences} className="flex-1">
                          সেটিংস সংরক্ষণ করুন
                        </Button>
                        <Button variant="outline" onClick={() => setShowSettings(false)}>
                          বাতিল
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={acceptNecessaryOnly}
              className="flex-shrink-0"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}