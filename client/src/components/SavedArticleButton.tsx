import React, { useState } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { supabase } from '@/lib/supabase';

interface SavedArticleButtonProps {
  articleId: number;
  isSaved?: boolean;
  variant?: 'icon' | 'button';
  className?: string;
}

export function SavedArticleButton({ 
  articleId, 
  isSaved: initialSaved = false, 
  variant = 'icon',
  className = ''
}: SavedArticleButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const handleSaveToggle = async () => {
    if (!user) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "আর্টিকেল সংরক্ষণ করতে অনুগ্রহ করে লগইন করুন।",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const { toggleBookmark } = await import('../lib/supabase-api-direct');
      const result = await toggleBookmark(articleId, session.user.id, !isSaved);
      
      if (isSaved) {
        setIsSaved(false);
        toast({
          title: "সফল",
          description: "আর্টিকেলটি সংরক্ষিত তালিকা থেকে সরানো হয়েছে।"
        });
      } else {
        if (result.alreadyExists) {
          setIsSaved(true);
          toast({
            title: "ইতিমধ্যে সংরক্ষিত",
            description: "এই আর্টিকেলটি ইতিমধ্যে আপনার সংরক্ষিত তালিকায় রয়েছে।"
          });
          return;
        }
        
        setIsSaved(true);
        toast({
          title: "সফল",
          description: "আর্টিকেলটি সংরক্ষিত তালিকায় যোগ করা হয়েছে।"
        });
      }
    } catch (error: any) {
      console.error('Error toggling saved article:', error);
      toast({
        title: "ত্রুটি",
        description: error.message || "আর্টিকেল সংরক্ষণে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSaveToggle}
        disabled={isLoading}
        className={`p-2 h-auto ${className}`}
      >
        <Bookmark 
          className={`h-4 w-4 ${isSaved ? 'fill-current text-blue-600' : ''}`} 
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size="sm"
      onClick={handleSaveToggle}
      disabled={isLoading}
      className={className}
    >
      <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
      {isSaved ? 'সংরক্ষিত' : 'সংরক্ষণ করুন'}
    </Button>
  );
}