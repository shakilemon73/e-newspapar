import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface NewsletterSignupProps {
  className?: string;
}

export function NewsletterSignup({ className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "ইমেইল প্রয়োজন",
        description: "অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা লিখুন।",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { subscribeToNewsletter } = await import('../lib/supabase-api-direct');
      const result = await subscribeToNewsletter(email, {
        breaking_news: true,
        daily_digest: true,
        weekly_summary: true
      });

      if (result.alreadyExists) {
        toast({
          title: "ইতিমধ্যে সাবস্ক্রাইব করা",
          description: "এই ইমেইল ঠিকানা ইতিমধ্যে নিউজলেটারে সাবস্ক্রাইব করা আছে।",
          variant: "destructive"
        });
        return;
      }

      setIsSubscribed(true);
      setEmail('');
      toast({
        title: "সফল!",
        description: "আপনি সফলভাবে নিউজলেটারে সাবস্ক্রাইব করেছেন।"
      });
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: "ত্রুটি",
        description: "নিউজলেটার সাবস্ক্রিপশনে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className={`bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              সাবস্ক্রিপশন সফল!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              আপনি আমাদের নিউজলেটারে সাবস্ক্রাইব করেছেন।
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Mail className="h-5 w-5" />
          নিউজলেটার সাবস্ক্রাইব করুন
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-blue-600 dark:text-blue-300">
            সর্বশেষ সংবাদ এবং আপডেট পেতে আমাদের নিউজলেটারে সাবস্ক্রাইব করুন।
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="আপনার ইমেইল ঠিকানা"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'সাবস্ক্রাইব হচ্ছে...' : 'সাবস্ক্রাইব'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            আমরা আপনার ইমেইল ঠিকানা শেয়ার করি না এবং যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।
          </p>
        </form>
      </CardContent>
    </Card>
  );
}