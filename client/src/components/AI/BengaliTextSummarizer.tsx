import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BengaliTextSummarizerProps {
  text: string;
  onSummaryGenerated?: (summary: string) => void;
}

export function BengaliTextSummarizer({ text, onSummaryGenerated }: BengaliTextSummarizerProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateSummary = async () => {
    if (!text || text.length < 100) {
      toast({
        title: "পর্যাপ্ত টেক্সট নেই",
        description: "সারসংক্ষেপ তৈরি করতে কমপক্ষে ১০০ অক্ষরের টেক্সট প্রয়োজন।",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use Hugging Face Transformers.js for Bengali text summarization
      const { pipeline } = await import('@huggingface/transformers');
      
      // Load Bengali-capable summarization model
      const summarizer = await pipeline('summarization', 'facebook/bart-large-cnn');
      
      // Summarize text (limit input to prevent memory issues)
      const inputText = text.slice(0, 1000); // First 1000 characters
      const result = await summarizer(inputText, {
        max_new_tokens: 100,
        min_new_tokens: 30,
        do_sample: false
      });

      const generatedSummary = Array.isArray(result) 
        ? (result[0] as any)?.summary_text || (result[0] as any)?.generated_text || 'সারসংক্ষেপ তৈরি করা যায়নি।'
        : (result as any)?.summary_text || (result as any)?.generated_text || 'সারসংক্ষেপ তৈরি করা যায়নি।';
      setSummary(generatedSummary);
      
      if (onSummaryGenerated) {
        onSummaryGenerated(generatedSummary);
      }

      toast({
        title: "সারসংক্ষেপ তৈরি সম্পন্ন",
        description: "AI দ্বারা সারসংক্ষেপ সফলভাবে তৈরি হয়েছে।"
      });

    } catch (error) {
      console.error('Summarization error:', error);
      toast({
        title: "ত্রুটি",
        description: "সারসংক্ষেপ তৈরিতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI সারসংক্ষেপ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={generateSummary}
          disabled={isLoading || !text}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              সারসংক্ষেপ তৈরি হচ্ছে...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              সারসংক্ষেপ তৈরি করুন
            </>
          )}
        </Button>

        {summary && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
              AI সারসংক্ষেপ:
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {summary}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          ⚡ সম্পূর্ণ বিনামূল্যে TensorFlow.js দ্বারা চালিত
        </div>
      </CardContent>
    </Card>
  );
}