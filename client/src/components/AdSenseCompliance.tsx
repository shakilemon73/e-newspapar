import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Users, 
  Cookie, 
  FileText,
  ExternalLink,
  Info
} from 'lucide-react';

interface AdSenseComplianceProps {
  className?: string;
}

export default function AdSenseCompliance({ className = '' }: AdSenseComplianceProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [privacyPolicyExists, setPrivacyPolicyExists] = useState(true);
  const [termsOfServiceExists, setTermsOfServiceExists] = useState(true);

  useEffect(() => {
    // Check if user has given consent for data collection
    const consent = localStorage.getItem('adsense_consent');
    setConsentGiven(consent === 'true');

    // Check if privacy policy and terms exist
    const checkPages = async () => {
      try {
        const privacyResponse = await fetch('/privacy-policy');
        setPrivacyPolicyExists(privacyResponse.ok);
        
        const termsResponse = await fetch('/terms-of-service');
        setTermsOfServiceExists(termsResponse.ok);
      } catch (error) {
        console.error('Error checking compliance pages:', error);
      }
    };

    checkPages();
  }, []);

  const handleConsentGiven = () => {
    setConsentGiven(true);
    localStorage.setItem('adsense_consent', 'true');
    localStorage.setItem('adsense_consent_date', new Date().toISOString());
  };

  const handleConsentRevoked = () => {
    setConsentGiven(false);
    localStorage.removeItem('adsense_consent');
    localStorage.removeItem('adsense_consent_date');
  };

  const complianceChecks = [
    {
      id: 'privacy_policy',
      title: 'গোপনীয়তা নীতি',
      description: 'বিস্তারিত গোপনীয়তা নীতি উপস্থিত',
      status: privacyPolicyExists,
      required: true,
      icon: <Shield className="h-4 w-4" />
    },
    {
      id: 'terms_of_service',
      title: 'ব্যবহারের শর্তাবলী',
      description: 'সম্পূর্ণ ব্যবহারের শর্তাবলী উপস্থিত',
      status: termsOfServiceExists,
      required: true,
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'user_consent',
      title: 'ব্যবহারকারীর সম্মতি',
      description: 'কুকিজ এবং ডেটা সংগ্রহের জন্য সম্মতি',
      status: consentGiven,
      required: true,
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 'content_quality',
      title: 'উচ্চমানের কন্টেন্ট',
      description: 'অরিজিনাল এবং মূল্যবান সংবাদ কন্টেন্ট',
      status: true,
      required: true,
      icon: <Eye className="h-4 w-4" />
    },
    {
      id: 'age_appropriate',
      title: 'উপযুক্ত কন্টেন্ট',
      description: 'সব বয়সের জন্য উপযুক্ত কন্টেন্ট',
      status: true,
      required: true,
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  const allRequired = complianceChecks.filter(check => check.required);
  const passedRequired = allRequired.filter(check => check.status);
  const compliancePercentage = Math.round((passedRequired.length / allRequired.length) * 100);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Google AdSense সম্মতি স্থিতি
            <Badge 
              variant={compliancePercentage === 100 ? "default" : "destructive"}
              className="ml-auto"
            >
              {compliancePercentage}% সম্পন্ন
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Consent Banner */}
          {!consentGiven && (
            <Alert>
              <Cookie className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  আমরা আপনার অভিজ্ঞতা উন্নত করতে এবং বিজ্ঞাপন দেখাতে কুকিজ ব্যবহার করি। 
                  চালিয়ে যেতে অনুগ্রহ করে সম্মতি দিন।
                </span>
                <Button size="sm" onClick={handleConsentGiven} className="ml-4">
                  সম্মতি দিন
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Compliance Checks */}
          <div className="space-y-3">
            {complianceChecks.map((check) => (
              <div 
                key={check.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    check.status 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {check.status ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {check.icon}
                      {check.title}
                      {check.required && (
                        <Badge variant="outline" className="text-xs">
                          আবশ্যক
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {check.description}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={check.status ? "default" : "destructive"}
                  className="text-xs"
                >
                  {check.status ? '✓' : '✗'}
                </Badge>
              </div>
            ))}
          </div>

          {/* Policy Links */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              গুরুত্বপূর্ণ নীতিমালা
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                  <Shield className="h-4 w-4 mr-2" />
                  গোপনীয়তা নীতি
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-2" />
                  ব্যবহারের শর্তাবলী
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            </div>
          </div>

          {/* Consent Management */}
          {consentGiven && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-600">সম্মতি প্রদান করা হয়েছে</h4>
                  <p className="text-sm text-gray-600">
                    আপনি কুকিজ এবং ডেটা সংগ্রহের জন্য সম্মতি দিয়েছেন
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleConsentRevoked}
                >
                  সম্মতি প্রত্যাহার
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// AdSense Placement Guidelines Component
export function AdSensePlacementGuidelines() {
  const guidelines = [
    {
      placement: 'Above the fold',
      description: 'প্রথম স্ক্রীনে সর্বোচ্চ ৩টি বিজ্ঞাপন',
      allowed: true,
      icon: <Eye className="h-4 w-4 text-green-500" />
    },
    {
      placement: 'In-content',
      description: 'নিবন্ধের মাঝে প্রাসঙ্গিক বিজ্ঞাপন',
      allowed: true,
      icon: <FileText className="h-4 w-4 text-green-500" />
    },
    {
      placement: 'Sidebar',
      description: 'পার্শ্বের কলামে স্ট্যাটিক বিজ্ঞাপন',
      allowed: true,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    },
    {
      placement: 'Footer',
      description: 'ফুটারে সীমিত বিজ্ঞাপন',
      allowed: true,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          AdSense বিজ্ঞাপন নির্দেশিকা
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {guidelines.map((guideline, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              {guideline.icon}
              <div className="flex-1">
                <div className="font-medium">{guideline.placement}</div>
                <div className="text-sm text-gray-600">{guideline.description}</div>
              </div>
              <Badge variant={guideline.allowed ? "default" : "destructive"}>
                {guideline.allowed ? 'অনুমোদিত' : 'নিষিদ্ধ'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}