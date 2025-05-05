import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { summarizeText } from '@/lib/text-utils';
import { Loader2 } from 'lucide-react';

interface ArticleSummaryProps {
  content: string;
  maxLength?: number;
}

export const ArticleSummary = ({ content, maxLength = 400 }: ArticleSummaryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');

  const handleGenerateSummary = () => {
    if (summary) {
      setIsOpen(!isOpen);
      return;
    }
    
    setIsLoading(true);
    
    // Use setTimeout to simulate processing and avoid UI freeze
    setTimeout(() => {
      const generatedSummary = summarizeText(content, maxLength);
      setSummary(generatedSummary);
      setIsOpen(true);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="my-4">
      <Button 
        variant="outline" 
        onClick={handleGenerateSummary}
        disabled={isLoading}
        className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>সারসংক্ষেপ তৈরি হচ্ছে...</span>
          </>
        ) : isOpen ? (
          <span>সারসংক্ষেপ লুকান</span>
        ) : (
          <span>প্রবন্ধের সারসংক্ষেপ দেখুন</span>
        )}
      </Button>
      
      {isOpen && summary && (
        <Card className="mt-3 bg-primary/5 dark:bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2">সারসংক্ষেপ:</h3>
            <p className="text-muted-foreground">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};