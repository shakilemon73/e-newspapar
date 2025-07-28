import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { aiServices } from '@/lib/ai-services';
import { aiAPI } from '@/lib/ai-api';
import { Loader2, FileText, Sparkles, Cpu } from 'lucide-react';

interface ArticleSummaryProps {
  content: string;
  articleId?: number;
  title?: string;
  maxLength?: number;
}

export const ArticleSummary = ({ content, articleId, title, maxLength = 400 }: ArticleSummaryProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [aiMethod, setAiMethod] = useState<'huggingface' | 'backend' | 'fallback'>('huggingface');

  // Auto-generate AI-based summary on component mount
  useEffect(() => {
    const generateAISummary = async () => {
      if (!content || content.trim().length === 0) {
        setSummary('সারসংক্ষেপ উপলব্ধ নেই।');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      console.log('[AI Summary] Starting AI-powered summary generation...');
      
      try {
        // Method 1: Try Hugging Face AI Services (Primary)
        try {
          const aiSummary = await aiServices.summarizeArticle(content, 'bengali');
          if (aiSummary && aiSummary !== 'Summary not available' && aiSummary.length > 20) {
            setSummary(aiSummary);
            setAiMethod('huggingface');
            console.log('[AI Summary] Successfully generated using Hugging Face AI');
            return;
          }
        } catch (error) {
          console.log('[AI Summary] Hugging Face method failed, trying backend AI...');
        }

        // Method 2: Try Backend AI API (Secondary)
        try {
          const backendResult = await aiAPI.generateSummary(content, articleId);
          if (backendResult.success && backendResult.data?.summary) {
            setSummary(backendResult.data.summary);
            setAiMethod('backend');
            console.log('[AI Summary] Successfully generated using backend AI');
            return;
          }
        } catch (error) {
          console.log('[AI Summary] Backend AI method failed, using fallback...');
        }

        // Method 3: Intelligent Fallback (Bengali-optimized)
        const sentences = content.split(/[।!?]/).filter(s => s.trim().length > 15);
        const importantSentences = sentences
          .slice(0, 4)
          .join('। ')
          .trim();
        
        const fallbackSummary = importantSentences.length > 10 
          ? importantSentences + (sentences.length > 4 ? '।' : '')
          : 'এই নিবন্ধে ' + (title || 'গুরুত্বপূর্ণ বিষয়') + ' সম্পর্কে বিস্তারিত তথ্য এবং বিশ্লেষণ রয়েছে।';
        
        setSummary(fallbackSummary);
        setAiMethod('fallback');
        console.log('[AI Summary] Generated using intelligent fallback method');

      } catch (error) {
        console.error('[AI Summary] All methods failed:', error);
        setSummary('এই নিবন্ধে গুরুত্বপূর্ণ তথ্য এবং বিশ্লেষণ রয়েছে।');
        setAiMethod('fallback');
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure content is properly loaded
    const timeout = setTimeout(generateAISummary, 500);
    return () => clearTimeout(timeout);
  }, [content, articleId, title, maxLength]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200/50 dark:border-blue-800/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <Loader2 className="h-3 w-3 animate-spin text-blue-600 absolute -top-1 -right-1" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                AI সারসংক্ষেপ তৈরি হচ্ছে...
                <Cpu className="h-4 w-4 text-blue-500" />
              </h3>
              <p className="text-sm text-muted-foreground">নিবন্ধের মূল বিষয়বস্তু AI দিয়ে বিশ্লেষণ করা হচ্ছে</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine AI method badge
  const getAIMethodBadge = () => {
    switch (aiMethod) {
      case 'huggingface':
        return { text: 'Hugging Face AI', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' };
      case 'backend':
        return { text: 'Backend AI', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
      default:
        return { text: 'Smart Analysis', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' };
    }
  };

  const aiMethodBadge = getAIMethodBadge();

  return (
    <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200/50 dark:border-blue-800/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <h3 className="text-base font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              AI সারসংক্ষেপ
              <span className={`text-xs px-2 py-0.5 rounded-full ${aiMethodBadge.color}`}>
                {aiMethodBadge.text}
              </span>
            </h3>
            <p 
              className="text-sm text-muted-foreground leading-relaxed"
              style={{ 
                fontFamily: 'SolaimanLipi, Kalpurush, ApponaLohit, system-ui',
                lineHeight: '1.6'
              }}
            >
              {summary}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};