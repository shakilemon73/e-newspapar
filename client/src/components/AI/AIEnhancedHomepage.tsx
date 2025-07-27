import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, BarChart3, Sparkles, Clock, Tag } from 'lucide-react';
import { BackendAIIntegration } from './BackendAIIntegration';
import { aiApiClient } from '@/lib/ai-api';

interface AIEnhancedHomepageProps {
  className?: string;
}

export function AIEnhancedHomepage({ className }: AIEnhancedHomepageProps) {
  // Get AI-processed articles with analysis
  const { data: aiArticles, isLoading } = useQuery({
    queryKey: ['ai-enhanced-articles'],
    queryFn: async () => {
      // This would typically fetch articles with AI analysis
      // For now, we'll simulate the structure
      return {
        success: true,
        data: {
          recentlyProcessed: [],
          trending: [],
          recommendations: []
        }
      };
    },
    staleTime: 300000 // 5 minutes
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI-Powered Homepage Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-blue-800 dark:text-blue-200">
            <Brain className="h-6 w-6" />
            AI-চালিত বাংলা সংবাদ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span className="font-medium">স্বয়ংক্রিয় সারসংক্ষেপ</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI দ্বারা তৈরি দ্রুত সারসংক্ষেপ
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="font-medium">ট্রেন্ডিং বিশ্লেষণ</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                জনপ্রিয়তা ও মনোভাব বিশ্লেষণ
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span className="font-medium">ব্যক্তিগত সুপারিশ</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                আপনার পছন্দ অনুযায়ী সংবাদ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Statistics and Control Panel */}
      <BackendAIIntegration showStats={true} />

      {/* AI-Enhanced Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently AI-Processed Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              সদ্য AI বিশ্লেষিত সংবাদ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>AI বিশ্লেষণ শুরু করতে আর্টিকেল প্রক্রিয়া করুন</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Trending Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              AI ট্রেন্ডিং বিষয়
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Sample trending topics based on AI analysis */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">রাজনীতি</span>
                </div>
                <Badge variant="secondary">৮৫% ইতিবাচক</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-500" />
                  <span className="font-medium">খেলাধুলা</span>
                </div>
                <Badge variant="secondary">৯২% ইতিবাচক</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">প্রযুক্তি</span>
                </div>
                <Badge variant="secondary">৭৮% ইতিবাচক</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Reading Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            AI পাঠক অন্তর্দৃষ্টি
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">৩.৫ মিনিট</div>
              <div className="text-sm text-gray-500">গড় পড়ার সময়</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">৭৮%</div>
              <div className="text-sm text-gray-500">সহজ পাঠ্য</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">৬৫%</div>
              <div className="text-sm text-gray-500">ইতিবাচক সংবাদ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">১২</div>
              <div className="text-sm text-gray-500">জনপ্রিয় ট্যাগ</div>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}