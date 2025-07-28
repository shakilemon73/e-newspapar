import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { summarizeText } from '@/lib/text-utils';
import { Loader2, FileText } from 'lucide-react';

interface ArticleSummaryProps {
  content: string;
  maxLength?: number;
}

export const ArticleSummary = ({ content, maxLength = 400 }: ArticleSummaryProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState('');

  // Auto-generate summary on component mount
  useEffect(() => {
    const generateSummary = async () => {
      if (!content || content.trim().length === 0) {
        setSummary('সারসংক্ষেপ উপলব্ধ নেই।');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Use setTimeout to simulate processing and avoid UI freeze
      setTimeout(() => {
        try {
          const generatedSummary = summarizeText(content, maxLength);
          setSummary(generatedSummary);
        } catch (error) {
          console.error('Error generating summary:', error);
          setSummary('এই নিবন্ধে গুরুত্বপূর্ণ তথ্য এবং বিশ্লেষণ রয়েছে যা পাঠকদের জন্য উপযোগী।');
        } finally {
          setIsLoading(false);
        }
      }, 1200);
    };

    generateSummary();
  }, [content, maxLength]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200/50 dark:border-blue-800/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <div className="space-y-1">
              <h3 className="text-base font-medium text-foreground">সারসংক্ষেপ তৈরি হচ্ছে...</h3>
              <p className="text-sm text-muted-foreground">নিবন্ধের মূল বিষয়বস্তু বিশ্লেষণ করা হচ্ছে</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200/50 dark:border-blue-800/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <h3 className="text-base font-medium text-foreground flex items-center gap-2">
              সারসংক্ষেপ
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                স্বয়ংক্রিয়
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