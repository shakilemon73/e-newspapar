import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, MessageSquare, BarChart3, Tag, Eye } from 'lucide-react';

interface AnalysisDetailsProps {
  articleId: number;
}

interface ArticleAnalysis {
  reading_time_minutes?: number;
  sentiment_label?: string;
  sentiment_confidence?: number;
  content_complexity?: string;
  auto_tags?: string[];
  summary?: string;
}

export function AnalysisDetails({ articleId }: AnalysisDetailsProps) {
  const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // Simulate backend AI analysis data
        // In real implementation, this would fetch from your AI analysis API
        setTimeout(() => {
          setAnalysis({
            reading_time_minutes: 3,
            sentiment_label: 'নিরপেক্ষ',
            sentiment_confidence: 85,
            content_complexity: 'সহজ',
            auto_tags: ['প্রযুক্তি', 'সংবাদ', 'বাংলাদেশ'],
            summary: 'এই নিবন্ধে প্রযুক্তিগত উন্নয়ন এবং এর প্রভাব নিয়ে আলোচনা করা হয়েছে।'
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching analysis:', error);
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [articleId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <Skeleton className="h-5 w-5 mx-auto mb-2" />
            <Skeleton className="h-4 w-16 mx-auto mb-1" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Analysis Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Reading Time */}
        {analysis.reading_time_minutes && (
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <div className="text-sm font-medium">{analysis.reading_time_minutes} মিনিট</div>
            <div className="text-xs text-muted-foreground">পড়ার সময়</div>
          </div>
        )}

        {/* Sentiment */}
        {analysis.sentiment_label && (
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <MessageSquare className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <div className="text-sm font-medium">{analysis.sentiment_label}</div>
            <div className="text-xs text-muted-foreground">
              {analysis.sentiment_confidence}% নিশ্চিত
            </div>
          </div>
        )}

        {/* Complexity */}
        {analysis.content_complexity && (
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <BarChart3 className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <div className="text-sm font-medium">{analysis.content_complexity}</div>
            <div className="text-xs text-muted-foreground">জটিলতা</div>
          </div>
        )}

        {/* Processing Status */}
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Eye className="h-5 w-5 text-green-500 mx-auto mb-1" />
          <div className="text-sm font-medium">বিশ্লেষিত</div>
          <div className="text-xs text-muted-foreground">সম্পূর্ণ</div>
        </div>
      </div>

      {/* Auto-generated Tags */}
      {analysis.auto_tags && analysis.auto_tags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-sm">মূল বিষয়:</span>
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

      {/* Content Insights */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-sm mb-2">পাঠ সুপারিশ</h4>
        <p className="text-sm text-muted-foreground">
          এই নিবন্ধটি সহজে পড়া যায় এবং সবার জন্য উপযুক্ত। তথ্যভিত্তিক এবং নিরপেক্ষ দৃষ্টিভঙ্গি রয়েছে।
        </p>
      </div>
    </div>
  );
}