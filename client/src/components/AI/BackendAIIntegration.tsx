import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  BarChart3,
  Settings,
  Play,
  RefreshCw,
  Lock,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiApiClient } from '@/lib/ai-api';
import { useSupabaseAdminAuth } from '@/hooks/use-supabase-admin-auth';

interface BackendAIIntegrationProps {
  articleId?: number;
  showStats?: boolean;
  className?: string;
}

export function BackendAIIntegration({ 
  articleId, 
  showStats = true, 
  className 
}: BackendAIIntegrationProps) {
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useSupabaseAdminAuth();

  // Security: Only show AI processing controls to admin users
  if (!isAdmin) {
    return null; // Completely hide AI processing from regular users
  }

  // Get AI statistics
  const { data: aiStats, isLoading: statsLoading } = useQuery({
    queryKey: ['ai-stats'],
    queryFn: () => aiApiClient.getAIStats(),
    enabled: showStats,
    staleTime: 30000 // 30 seconds
  });

  // Get article AI analysis if articleId provided
  const { data: articleAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['ai-analysis', articleId],
    queryFn: () => aiApiClient.getArticleAnalysis(articleId!),
    enabled: !!articleId,
    staleTime: 60000 // 1 minute
  });

  // Process single article mutation
  const processArticleMutation = useMutation({
    mutationFn: (id: number) => aiApiClient.processArticle(id),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "AI প্রক্রিয়াকরণ সম্পন্ন",
          description: "আর্টিকেল সফলভাবে AI দ্বারা বিশ্লেষিত হয়েছে।"
        });
        setProcessingStatus('completed');
        queryClient.invalidateQueries({ queryKey: ['ai-analysis', articleId] });
        queryClient.invalidateQueries({ queryKey: ['ai-stats'] });
      } else {
        toast({
          title: "প্রক্রিয়াকরণে ত্রুটি",
          description: result.error || "AI প্রক্রিয়াকরণে সমস্যা হয়েছে।",
          variant: "destructive"
        });
      }
    }
  });

  // Batch process articles mutation
  const batchProcessMutation = useMutation({
    mutationFn: (limit: number) => aiApiClient.batchProcessArticles(limit),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "ব্যাচ প্রক্রিয়াকরণ সম্পন্ন",
          description: `${result.data?.processed || 0} টি আর্টিকেল AI দ্বারা প্রক্রিয়া করা হয়েছে।`
        });
        queryClient.invalidateQueries({ queryKey: ['ai-stats'] });
      } else {
        toast({
          title: "ব্যাচ প্রক্রিয়াকরণে ত্রুটি",
          description: result.error || "ব্যাচ প্রক্রিয়াকরণে সমস্যা হয়েছে।",
          variant: "destructive"
        });
      }
    }
  });

  const handleProcessArticle = () => {
    if (!articleId) return;
    setProcessingStatus('processing');
    processArticleMutation.mutate(articleId);
  };

  const handleBatchProcess = () => {
    batchProcessMutation.mutate(10);
  };

  const stats = aiStats?.data;
  const analysis = articleAnalysis?.data;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Backend Integration Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <Database className="h-5 w-5" />
            Supabase AI Backend Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>TensorFlow.js Backend</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span>Supabase AI Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Real-time Processing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Statistics */}
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI প্রক্রিয়াকরণ পরিসংখ্যান
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="h-4 w-4 animate-spin" />
                পরিসংখ্যান লোড হচ্ছে...
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalArticles}
                  </div>
                  <div className="text-sm text-gray-500">মোট আর্টিকেল</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.processedArticles}
                  </div>
                  <div className="text-sm text-gray-500">প্রক্রিয়াকৃত</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.processingRate}%
                  </div>
                  <div className="text-sm text-gray-500">সম্পন্ন হার</div>
                </div>
                <div className="text-center">
                  <Progress 
                    value={stats.processingRate} 
                    className="w-full mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">অগ্রগতি</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">পরিসংখ্যান লোড করা যায়নি।</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Article Analysis */}
      {articleId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              আর্টিকেল AI বিশ্লেষণ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisLoading ? (
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="h-4 w-4 animate-spin" />
                বিশ্লেষণ লোড হচ্ছে...
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                {/* AI Summary */}
                {analysis.summary && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                      AI সারসংক্ষেপ:
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {analysis.summary}
                    </p>
                  </div>
                )}

                {/* Sentiment Analysis */}
                {analysis.sentiment_label && (
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <span>{analysis.sentiment_label}</span>
                      {analysis.sentiment_confidence && (
                        <span className="text-xs">({analysis.sentiment_confidence}%)</span>
                      )}
                    </Badge>
                  </div>
                )}

                {/* Auto Tags */}
                {analysis.auto_tags && analysis.auto_tags.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">AI ট্যাগ:</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.auto_tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reading Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  {analysis.reading_time_minutes && (
                    <div>
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {analysis.reading_time_minutes} মিনিট
                      </div>
                      <div className="text-xs text-gray-500">পড়ার সময়</div>
                    </div>
                  )}
                  {analysis.content_complexity && (
                    <div>
                      <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {analysis.content_complexity}
                      </div>
                      <div className="text-xs text-gray-500">জটিলতা</div>
                    </div>
                  )}
                  {analysis.processed_at && (
                    <div>
                      <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        <CheckCircle className="h-4 w-4 inline" />
                      </div>
                      <div className="text-xs text-gray-500">প্রক্রিয়াকৃত</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">এই আর্টিকেল এখনও AI দ্বারা প্রক্রিয়া করা হয়নি।</p>
                <Button 
                  onClick={handleProcessArticle}
                  disabled={processArticleMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {processArticleMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      প্রক্রিয়াকরণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      AI বিশ্লেষণ শুরু করুন
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Batch Processing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI ব্যাচ প্রক্রিয়াকরণ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                একসাথে একাধিক আর্টিকেল AI দ্বারা প্রক্রিয়া করুন
              </p>
            </div>
            <Button
              onClick={handleBatchProcess}
              disabled={batchProcessMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              {batchProcessMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  প্রক্রিয়াকরণ...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  ১০টি আর্টিকেল প্রক্রিয়া করুন
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technology Info */}
      <Card className="bg-gray-50 dark:bg-gray-900/50">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Backend AI Processing</span>
            </div>
            <p>
              সমস্ত AI প্রক্রিয়াকরণ Supabase backend এ সংরক্ষিত হয় এবং 
              TensorFlow.js দ্বারা চালিত হয়। ডেটা স্থায়ীভাবে সংরক্ষিত থাকে।
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}