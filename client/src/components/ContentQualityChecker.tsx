import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Eye, 
  Clock, 
  Users,
  Award,
  Lightbulb,
  Shield
} from 'lucide-react';

interface ContentQualityMetrics {
  wordCount: number;
  readabilityScore: number;
  originalityScore: number;
  imageQuality: number;
  userEngagement: number;
  seoScore: number;
  adSafeScore: number;
}

interface ContentQualityCheckerProps {
  content?: string;
  title?: string;
  imageUrl?: string;
  className?: string;
}

export default function ContentQualityChecker({
  content = '',
  title = '',
  imageUrl = '',
  className = ''
}: ContentQualityCheckerProps) {
  const [metrics, setMetrics] = useState<ContentQualityMetrics>({
    wordCount: 0,
    readabilityScore: 0,
    originalityScore: 0,
    imageQuality: 0,
    userEngagement: 0,
    seoScore: 0,
    adSafeScore: 0
  });

  useEffect(() => {
    analyzeContent();
  }, [content, title, imageUrl]);

  const analyzeContent = () => {
    // Word count analysis
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

    // Readability score (simplified Bengali readability check)
    const readabilityScore = calculateReadabilityScore(content);

    // Originality score (check for unique content patterns)
    const originalityScore = calculateOriginalityScore(content);

    // Image quality score
    const imageQuality = imageUrl ? 85 : 0;

    // User engagement potential
    const userEngagement = calculateEngagementPotential(content, title);

    // SEO score
    const seoScore = calculateSEOScore(content, title);

    // Ad-safe content score
    const adSafeScore = calculateAdSafeScore(content, title);

    setMetrics({
      wordCount,
      readabilityScore,
      originalityScore,
      imageQuality,
      userEngagement,
      seoScore,
      adSafeScore
    });
  };

  const calculateReadabilityScore = (text: string): number => {
    if (!text) return 0;
    
    const sentences = text.split(/[।!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    
    // Bengali readability factors
    const complexWords = words.filter(word => word.length > 8).length;
    const complexityRatio = complexWords / words.length;
    
    // Score based on sentence length and complexity
    let score = 100;
    if (avgWordsPerSentence > 20) score -= 20;
    if (complexityRatio > 0.3) score -= 30;
    if (words.length < 200) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  };

  const calculateOriginalityScore = (text: string): number => {
    if (!text) return 0;
    
    // Check for unique Bengali phrases and expressions
    const uniquePhrases = text.match(/[অ-৯][^।!?]*[।!?]/g) || [];
    const avgPhraseLength = uniquePhrases.reduce((sum, phrase) => sum + phrase.length, 0) / uniquePhrases.length;
    
    // Higher score for longer, more detailed content
    return Math.min(100, Math.max(0, (avgPhraseLength * 2) + (uniquePhrases.length * 3)));
  };

  const calculateEngagementPotential = (text: string, titleText: string): number => {
    let score = 50; // Base score
    
    // Check for engaging elements
    if (titleText.includes('?')) score += 10; // Questions engage users
    if (text.includes('আপনি') || text.includes('আমরা')) score += 15; // Personal pronouns
    if (text.match(/[০-৯]/g)) score += 10; // Numbers and statistics
    if (text.includes('নতুন') || text.includes('আজ') || text.includes('সর্বশেষ')) score += 15; // Timely content
    
    return Math.min(100, score);
  };

  const calculateSEOScore = (text: string, titleText: string): number => {
    let score = 0;
    
    // Title optimization
    if (titleText.length >= 30 && titleText.length <= 60) score += 20;
    if (titleText.includes('বাংলাদেশ') || titleText.includes('ঢাকা')) score += 10;
    
    // Content optimization
    if (text.length >= 300) score += 20;
    if (text.includes(titleText.split(' ')[0])) score += 15; // Title keyword in content
    
    // Bengali SEO factors
    if (text.includes('সংবাদ') || text.includes('খবর')) score += 10;
    if (text.match(/[০-৯]{4}/g)) score += 10; // Years/dates
    
    // Meta description length equivalent
    const excerpt = text.substring(0, 160);
    if (excerpt.length >= 120) score += 15;
    
    return Math.min(100, score);
  };

  const calculateAdSafeScore = (text: string, titleText: string): number => {
    let score = 100; // Start with perfect score
    
    // Check for content that might not be ad-safe
    const violentKeywords = ['হত্যা', 'খুন', 'মৃত্যু', 'রক্ত', 'যুদ্ধ', 'বোমা'];
    const controversialKeywords = ['রাজনীতি', 'দুর্নীতি', 'বিতর্ক', 'সংঘাত'];
    const adultKeywords = ['যৌন', 'অশ্লীল'];
    
    const fullText = (titleText + ' ' + text).toLowerCase();
    
    // Deduct points for potentially problematic content
    violentKeywords.forEach(keyword => {
      if (fullText.includes(keyword)) score -= 15;
    });
    
    controversialKeywords.forEach(keyword => {
      if (fullText.includes(keyword)) score -= 5;
    });
    
    adultKeywords.forEach(keyword => {
      if (fullText.includes(keyword)) score -= 30;
    });
    
    // Positive factors for ad-safe content
    if (fullText.includes('শিক্ষা') || fullText.includes('স্বাস্থ্য')) score += 5;
    if (fullText.includes('প্রযুক্তি') || fullText.includes('বিজ্ঞান')) score += 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const getOverallScore = (): number => {
    const weights = {
      readabilityScore: 0.2,
      originalityScore: 0.2,
      imageQuality: 0.1,
      userEngagement: 0.15,
      seoScore: 0.15,
      adSafeScore: 0.2
    };
    
    return Math.round(
      metrics.readabilityScore * weights.readabilityScore +
      metrics.originalityScore * weights.originalityScore +
      metrics.imageQuality * weights.imageQuality +
      metrics.userEngagement * weights.userEngagement +
      metrics.seoScore * weights.seoScore +
      metrics.adSafeScore * weights.adSafeScore
    );
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <Eye className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const overallScore = getOverallScore();
  const isAdSafe = metrics.adSafeScore >= 80;

  const qualityChecks = [
    {
      title: 'পাঠযোগ্যতা',
      score: metrics.readabilityScore,
      icon: <FileText className="h-4 w-4" />,
      description: 'কন্টেন্ট পড়তে কতটা সহজ'
    },
    {
      title: 'মৌলিকত্ব',
      score: metrics.originalityScore,
      icon: <Lightbulb className="h-4 w-4" />,
      description: 'কন্টেন্টের অনন্যতা'
    },
    {
      title: 'ছবির মান',
      score: metrics.imageQuality,
      icon: <Eye className="h-4 w-4" />,
      description: 'ভিজ্যুয়াল কন্টেন্টের মান'
    },
    {
      title: 'ব্যবহারকারী আগ্রহ',
      score: metrics.userEngagement,
      icon: <Users className="h-4 w-4" />,
      description: 'পাঠকদের আকৃষ্ট করার ক্ষমতা'
    },
    {
      title: 'SEO অনুকূলতা',
      score: metrics.seoScore,
      icon: <Award className="h-4 w-4" />,
      description: 'সার্চ ইঞ্জিনের জন্য অনুকূল'
    },
    {
      title: 'বিজ্ঞাপন নিরাপত্তা',
      score: metrics.adSafeScore,
      icon: <Shield className="h-4 w-4" />,
      description: 'AdSense নীতির সাথে সামঞ্জস্যপূর্ণ'
    }
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              কন্টেন্ট মান যাচাই
            </div>
            <Badge 
              className={`${getScoreColor(overallScore)} border-current`}
              variant="outline"
            >
              {overallScore}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">সামগ্রিক মান</span>
              <div className="flex items-center gap-2">
                {getScoreIcon(overallScore)}
                <span className="text-sm font-bold">{overallScore}%</span>
              </div>
            </div>
            <Progress value={overallScore} className="h-2" />
          </div>

          {/* Ad Safety Alert */}
          {!isAdSafe && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                এই কন্টেন্ট Google AdSense নীতির সাথে সম্পূর্ণ সামঞ্জস্যপূর্ণ নাও হতে পারে। 
                বিজ্ঞাপন নিরাপত্তা স্কোর বাড়ানোর জন্য কন্টেন্ট পর্যালোচনা করুন।
              </AlertDescription>
            </Alert>
          )}

          {/* Content Statistics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span>শব্দ সংখ্যা: {metrics.wordCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>পড়ার সময়: {Math.ceil(metrics.wordCount / 200)} মিনিট</span>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">বিস্তারিত মূল্যায়ন</h4>
            {qualityChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  {check.icon}
                  <div>
                    <div className="text-sm font-medium">{check.title}</div>
                    <div className="text-xs text-gray-500">{check.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getScoreIcon(check.score)}
                  <span className="text-sm font-medium">{check.score}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* AdSense Compliance Summary */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">AdSense সামঞ্জস্য</span>
            </div>
            <div className={`p-3 rounded-lg ${isAdSafe ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-2">
                {isAdSafe ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">
                  {isAdSafe ? 'বিজ্ঞাপনের জন্য নিরাপদ' : 'পর্যালোচনা প্রয়োজন'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {isAdSafe 
                  ? 'এই কন্টেন্ট Google AdSense নীতি মেনে চলে এবং বিজ্ঞাপনের জন্য উপযুক্ত।'
                  : 'কন্টেন্ট পর্যালোচনা করে AdSense নীতির সাথে সামঞ্জস্য নিশ্চিত করুন।'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}