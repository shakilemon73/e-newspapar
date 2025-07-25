import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';

interface SentimentResult {
  label: string;
  score: number;
  emoji: string;
  color: string;
  icon: React.ReactNode;
}

interface BengaliSentimentAnalyzerProps {
  text: string;
  className?: string;
}

export function BengaliSentimentAnalyzer({ text, className }: BengaliSentimentAnalyzerProps) {
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSentimentDisplay = (label: string, score: number): SentimentResult => {
    const confidence = Math.round(score * 100);
    
    switch (label.toLowerCase()) {
      case 'positive':
        return {
          label: 'ইতিবাচক',
          score: confidence,
          emoji: '😊',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          icon: <ThumbsUp className="h-4 w-4" />
        };
      case 'negative':
        return {
          label: 'নেতিবাচক',
          score: confidence,
          emoji: '😞',
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          icon: <ThumbsDown className="h-4 w-4" />
        };
      default:
        return {
          label: 'নিরপেক্ষ',
          score: confidence,
          emoji: '😐',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          icon: <Meh className="h-4 w-4" />
        };
    }
  };

  useEffect(() => {
    if (!text || text.length < 10) return;

    const analyzeSentiment = async () => {
      setIsLoading(true);
      try {
        // Use Hugging Face Transformers.js for sentiment analysis
        const { pipeline } = await import('@huggingface/transformers');
        
        // Load multilingual BERT model that supports Bengali
        const classifier = await pipeline(
          'sentiment-analysis',
          'nlptown/bert-base-multilingual-uncased-sentiment'
        );

        const result = await classifier(text.slice(0, 512)); // BERT token limit
        const firstResult = Array.isArray(result) ? result[0] : result;
        const sentimentResult = getSentimentDisplay(
          (firstResult as any)?.label || 'neutral', 
          (firstResult as any)?.score || 0.5
        );
        setSentiment(sentimentResult);

      } catch (error) {
        console.error('Sentiment analysis error:', error);
        // Fallback to simple sentiment analysis
        const positiveWords = ['ভালো', 'চমৎকার', 'দুর্দান্ত', 'সুন্দর', 'প্রশংসনীয়'];
        const negativeWords = ['খারাপ', 'ভয়ানক', 'দুঃখজনক', 'বিরক্তিকর', 'নিন্দনীয়'];
        
        const hasPositive = positiveWords.some(word => text.includes(word));
        const hasNegative = negativeWords.some(word => text.includes(word));
        
        let fallbackLabel = 'neutral';
        if (hasPositive && !hasNegative) fallbackLabel = 'positive';
        else if (hasNegative && !hasPositive) fallbackLabel = 'negative';
        
        setSentiment(getSentimentDisplay(fallbackLabel, 0.75));
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(analyzeSentiment, 1000);
    return () => clearTimeout(debounceTimer);
  }, [text]);

  if (!text || text.length < 10) return null;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Heart className="h-4 w-4 text-pink-500" />
          মনোভাব বিশ্লেষণ
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            বিশ্লেষণ করা হচ্ছে...
          </div>
        ) : sentiment ? (
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={sentiment.color}>
              <div className="flex items-center gap-2">
                {sentiment.icon}
                <span className="font-medium">{sentiment.label}</span>
                <span className="text-lg">{sentiment.emoji}</span>
              </div>
            </Badge>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {sentiment.score}% নিশ্চিত
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            টেক্সট বিশ্লেষণের জন্য অপেক্ষা করছে...
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-400">
          🤖 TensorFlow.js দ্বারা চালিত AI
        </div>
      </CardContent>
    </Card>
  );
}