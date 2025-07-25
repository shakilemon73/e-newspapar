import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Clock, 
  BarChart3, 
  Tags,
  MessageSquare,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { aiApiClient } from '@/lib/ai-api';

interface ArticleData {
  id: number;
  title: string;
  content: string;
  summary?: string;
}

interface AIEnhancedArticleDetailProps {
  article: ArticleData;
  className?: string;
}

export function AIEnhancedArticleDetail({ article, className }: AIEnhancedArticleDetailProps) {
  // Get AI analysis for this article
  const { data: aiAnalysis, isLoading } = useQuery({
    queryKey: ['ai-analysis', article.id],
    queryFn: () => aiApiClient.getArticleAnalysis(article.id),
    staleTime: 300000 // 5 minutes
  });

  const analysis = aiAnalysis?.data;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI Analysis Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Brain className="h-5 w-5" />
            AI বিশ্লেষণ
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {/* AI Summary */}
              {analysis.summary && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-purple-700 dark:text-purple-300">AI সারসংক্ষেপ:</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
              )}

              {/* Analysis Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Sentiment */}
                {analysis.sentiment_label && (
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <div className="text-sm font-medium">{analysis.sentiment_label}</div>
                    <div className="text-xs text-gray-500">
                      {analysis.sentiment_confidence}% নিশ্চিত
                    </div>
                  </div>
                )}

                {/* Reading Time */}
                {analysis.reading_time_minutes && (
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-sm font-medium">{analysis.reading_time_minutes} মিনিট</div>
                    <div className="text-xs text-gray-500">পড়ার সময়</div>
                  </div>
                )}

                {/* Complexity */}
                {analysis.content_complexity && (
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <div className="text-sm font-medium">{analysis.content_complexity}</div>
                    <div className="text-xs text-gray-500">জটিলতা</div>
                  </div>
                )}

                {/* Processing Status */}
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <Brain className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <div className="text-sm font-medium">প্রক্রিয়াকৃত</div>
                  <div className="text-xs text-gray-500">AI দ্বারা</div>
                </div>
              </div>

              {/* AI Tags */}
              {analysis.auto_tags && analysis.auto_tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tags className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">AI ট্যাগ:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.auto_tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {analysis.extracted_topics && analysis.extracted_topics.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-700 dark:text-green-300">মূল বিষয়:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.extracted_topics.map((topic: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Processing Details */}
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                {analysis.processed_at && (
                  <span>
                    প্রক্রিয়াকরণ: {new Date(analysis.processed_at).toLocaleString('bn-BD')}
                  </span>
                )}
                {analysis.model_version && (
                  <span className="ml-2">• মডেল: {analysis.model_version}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                এই আর্টিকেল এখনও AI দ্বারা বিশ্লেষিত হয়নি।
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                প্রক্রিয়াকরণ শুরু করতে নিচের AI প্যানেল ব্যবহার করুন।
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights for Readers */}
      {analysis && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200 text-lg">
              <Sparkles className="h-5 w-5" />
              পাঠকদের জন্য AI সুবিধা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reading Recommendation */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">
                  পাঠ সুপারিশ
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analysis.content_complexity === 'সহজ' && 'এই আর্টিকেলটি সহজে পড়া যায় এবং সবার জন্য উপযুক্ত।'}
                  {analysis.content_complexity === 'মাধ্যম' && 'এই আর্টিকেলটি মাঝারি জটিলতার এবং মনোযোগ সহকারে পড়ুন।'}
                  {analysis.content_complexity === 'কঠিন' && 'এই আর্টিকেলটি জটিল বিষয়বস্তু নিয়ে এবং ধৈর্য সহকারে পড়ুন।'}
                </p>
              </div>

              {/* Content Insights */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">
                  বিষয়বস্তু অন্তর্দৃষ্টি
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analysis.sentiment_label === 'ইতিবাচক' && 'এই সংবাদটি ইতিবাচক দৃষ্টিভঙ্গি প্রকাশ করে।'}
                  {analysis.sentiment_label === 'নেতিবাচক' && 'এই সংবাদটি গুরুত্বপূর্ণ সমস্যা তুলে ধরে।'}
                  {analysis.sentiment_label === 'নিরপেক্ষ' && 'এই সংবাদটি তথ্যভিত্তিক এবং নিরপেক্ষ।'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}