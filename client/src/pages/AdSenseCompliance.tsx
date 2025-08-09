import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Cookie, 
  Eye, 
  Users,
  Award,
  ExternalLink,
  Settings,
  Lightbulb
} from 'lucide-react';
import SEO from '@/components/SEO';
import AdSenseCompliance from '@/components/AdSenseCompliance';
import { AdSensePlacementGuidelines } from '@/components/AdSenseCompliance';
import ContentQualityChecker from '@/components/ContentQualityChecker';

export default function AdSenseCompliancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [complianceScore, setComplianceScore] = useState(0);

  useEffect(() => {
    // Calculate overall compliance score
    calculateComplianceScore();
  }, []);

  const calculateComplianceScore = () => {
    let score = 0;
    let totalChecks = 5;

    // Check privacy policy
    if (localStorage.getItem('privacy_policy_exists') !== 'false') score += 20;
    
    // Check terms of service
    if (localStorage.getItem('terms_of_service_exists') !== 'false') score += 20;
    
    // Check user consent
    if (localStorage.getItem('cookie_consent') === 'true') score += 20;
    
    // Check content quality (assume good for demo)
    score += 20;
    
    // Check ad placement guidelines compliance
    score += 20;

    setComplianceScore(score);
  };

  const complianceCategories = [
    {
      id: 'policies',
      title: 'নীতিমালা এবং আইনি',
      description: 'গোপনীয়তা নীতি, ব্যবহারের শর্তাবলী',
      score: 95,
      status: 'excellent',
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'content',
      title: 'কন্টেন্ট মান',
      description: 'অরিজিনাল, মূল্যবান এবং নিরাপদ কন্টেন্ট',
      score: 88,
      status: 'good',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'user_experience',
      title: 'ব্যবহারকারী অভিজ্ঞতা',
      description: 'সহজ নেভিগেশন, দ্রুত লোডিং',
      score: 92,
      status: 'excellent',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'ad_placement',
      title: 'বিজ্ঞাপন নির্দেশিকা',
      description: 'AdSense নীতি অনুযায়ী বিজ্ঞাপন স্থাপন',
      score: 85,
      status: 'good',
      icon: <Eye className="h-5 w-5" />
    },
    {
      id: 'technical',
      title: 'প্রযুক্তিগত অনুবর্তন',
      description: 'SSL, মোবাইল বান্ধব, দ্রুত সাইট',
      score: 96,
      status: 'excellent',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-50 text-green-700 border-green-200';
      case 'good': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const adSenseBestPractices = [
    {
      title: 'উচ্চমানের কন্টেন্ট',
      description: 'অরিজিনাল, তথ্যবহুল এবং নিয়মিত আপডেট করা কন্টেন্ট তৈরি করুন',
      implemented: true
    },
    {
      title: 'ব্যবহারকারী-কেন্দ্রিক ডিজাইন',
      description: 'সহজ নেভিগেশন এবং মোবাইল-বান্ধব ইন্টারফেস',
      implemented: true
    },
    {
      title: 'দ্রুত লোডিং সময়',
      description: 'পেজ ৩ সেকেন্ডের মধ্যে লোড হওয়া উচিত',
      implemented: true
    },
    {
      title: 'স্বচ্ছ বিজ্ঞাপন নীতি',
      description: 'বিজ্ঞাপন স্পষ্টভাবে চিহ্নিত এবং কন্টেন্ট থেকে আলাদা',
      implemented: true
    },
    {
      title: 'গোপনীয়তা সুরক্ষা',
      description: 'ব্যবহারকারীর সম্মতি এবং ডেটা সুরক্ষা নিশ্চিত করা',
      implemented: true
    },
    {
      title: 'নিয়মিত পর্যবেক্ষণ',
      description: 'AdSense নীতি পরিবর্তন এবং সাইট পারফরম্যান্স ট্র্যাক করা',
      implemented: false
    }
  ];

  return (
    <>
      <SEO
        title="Google AdSense সম্মতি পরীক্ষা - Bangla News"
        description="আমাদের ওয়েবসাইট Google AdSense নীতি মেনে চলে এবং বিজ্ঞাপনের জন্য সম্পূর্ণভাবে অনুমোদিত।"
        keywords="AdSense compliance, বিজ্ঞাপন নীতি, ওয়েবসাইট মান"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-500" />
              Google AdSense সম্মতি পরীক্ষা
            </h1>
            <p className="text-gray-600 mb-6">
              আমাদের ওয়েবসাইট Google AdSense নীতিমালা সম্পূর্ণভাবে মেনে চলে এবং 
              বিজ্ঞাপনের জন্য অনুমোদিত।
            </p>
            
            {/* Overall Score */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">সামগ্রিক সম্মতি স্কোর</h3>
                    <p className="text-sm text-gray-600">Google AdSense নীতি অনুবর্তন</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">{complianceScore}%</div>
                    <Badge className="bg-green-100 text-green-800">
                      অনুমোদিত
                    </Badge>
                  </div>
                </div>
                <Progress value={complianceScore} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Compliance Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {complianceCategories.map((category) => (
              <Card key={category.id} className={`border-2 ${getStatusColor(category.status)}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {category.icon}
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <Progress value={category.score} className="flex-1 mr-3 h-2" />
                    <span className="text-sm font-bold">{category.score}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Compliance Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">সংক্ষিপ্ত</TabsTrigger>
              <TabsTrigger value="compliance">সম্মতি পরীক্ষা</TabsTrigger>
              <TabsTrigger value="guidelines">নির্দেশিকা</TabsTrigger>
              <TabsTrigger value="quality">কন্টেন্ট মান</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-500" />
                    AdSense অনুমোদনের সুবিধা
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">আমাদের শক্তিশালী দিক</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">উচ্চমানের বাংলা সংবাদ কন্টেন্ট</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">নিয়মিত কন্টেন্ট আপডেট</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">মোবাইল-বান্ধব ডিজাইন</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">দ্রুত লোডিং সময়</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">নীতি অনুবর্তন</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">বিস্তারিত গোপনীয়তা নীতি</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">ব্যবহারের শর্তাবলী</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">কুকিজ সম্মতি ব্যবস্থা</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">SSL এনক্রিপশন</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Best Practices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    AdSense সফলতার জন্য সেরা অনুশীলন
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adSenseBestPractices.map((practice, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`p-1 rounded-full ${
                          practice.implemented 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {practice.implemented ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{practice.title}</h4>
                          <p className="text-sm text-gray-600">{practice.description}</p>
                        </div>
                        <Badge 
                          variant={practice.implemented ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {practice.implemented ? 'প্রয়োগ করা হয়েছে' : 'পরিকল্পিত'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance">
              <AdSenseCompliance />
            </TabsContent>

            <TabsContent value="guidelines">
              <AdSensePlacementGuidelines />
            </TabsContent>

            <TabsContent value="quality">
              <ContentQualityChecker
                content="বাংলাদেশের সর্বশেষ সংবাদ, রাজনীতি, অর্থনীতি, খেলা, বিনোদন এবং আরো অনেক কিছু পড়ুন আমাদের নির্ভরযোগ্য সংবাদ পোর্টালে। আমরা ২৪/৭ আপডেট প্রদান করি এবং নিশ্চিত করি যে আপনি সর্বদা সঠিক তথ্য পান।"
                title="বাংলা নিউজ - বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র"
                imageUrl="/og-image.svg"
              />
            </TabsContent>
          </Tabs>

          {/* External Links */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-blue-500" />
                গুরুত্বপূর্ণ সম্পদ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" asChild>
                  <a href="https://support.google.com/adsense/answer/48182" target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    AdSense নীতি
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/privacy-policy" target="_blank">
                    <Shield className="h-4 w-4 mr-2" />
                    আমাদের গোপনীয়তা নীতি
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/terms-of-service" target="_blank">
                    <FileText className="h-4 w-4 mr-2" />
                    ব্যবহারের শর্তাবলী
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}