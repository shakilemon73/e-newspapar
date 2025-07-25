import React from 'react';
import { BengaliTextSummarizer } from './BengaliTextSummarizer';
import { BengaliSentimentAnalyzer } from './BengaliSentimentAnalyzer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, Brain, Zap } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  summary?: string;
}

interface AIEnhancedArticleDetailProps {
  article: Article;
  onSummaryUpdate?: (articleId: number, summary: string) => void;
}

export function AIEnhancedArticleDetail({ article, onSummaryUpdate }: AIEnhancedArticleDetailProps) {
  const handleSummaryGenerated = (summary: string) => {
    if (onSummaryUpdate) {
      onSummaryUpdate(article.id, summary);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Features Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Brain className="h-5 w-5" />
            AI-চালিত বৈশিষ্ট্যসমূহ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>স্বয়ংক্রিয় সারসংক্ষেপ</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>মনোভাব বিশ্লেষণ</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-green-500" />
              <span>বিষয়বস্তু বিশ্লেষণ</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Original Article Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{article.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {article.content}
          </div>
        </CardContent>
      </Card>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Summarization */}
        <BengaliTextSummarizer 
          text={article.content}
          onSummaryGenerated={handleSummaryGenerated}
        />

        {/* Sentiment Analysis */}
        <BengaliSentimentAnalyzer 
          text={article.content}
        />
      </div>

      {/* Additional AI Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Reading Time Prediction */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.ceil(article.content.length / 200)} মিনিট
              </div>
              <div className="text-sm text-gray-500">পড়ার সময়</div>
            </div>
          </CardContent>
        </Card>

        {/* Content Complexity */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {article.content.length > 1000 ? 'উন্নত' : 'সহজ'}
              </div>
              <div className="text-sm text-gray-500">পড়ার স্তর</div>
            </div>
          </CardContent>
        </Card>

        {/* Word Count */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {article.content.split(' ').length}
              </div>
              <div className="text-sm text-gray-500">শব্দ সংখ্যা</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Technology Info */}
      <Card className="bg-gray-50 dark:bg-gray-900/50">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="h-4 w-4" />
              <span className="font-medium">সম্পূর্ণ বিনামূল্যে AI প্রযুক্তি</span>
            </div>
            <p>
              TensorFlow.js এবং Hugging Face Transformers দ্বারা চালিত। 
              সব ডেটা আপনার ব্রাউজারেই প্রক্রিয়া করা হয়।
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}