import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { supabase } from '@/lib/supabase';

interface LikeButtonProps {
  articleId: number;
  initialLiked?: boolean;
  likeCount?: number;
  className?: string;
}

export function LikeButton({ 
  articleId, 
  initialLiked = false, 
  likeCount: initialLikeCount = 0,
  className = ''
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  // Check if user has liked this article
  useEffect(() => {
    if (!user) return;

    const checkLikeStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { getUserLikeStatus } = await import('../lib/supabase-api-direct');
        const data = await getUserLikeStatus(articleId, session.user.id);
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount || 0);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [articleId, user]);

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "পছন্দ করতে অনুগ্রহ করে লগইন করুন।",
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

      const { toggleArticleLike } = await import('../lib/supabase-api-direct');
      const result = await toggleArticleLike(articleId, session.user.id, !isLiked);
      
      if (result.alreadyExists && !isLiked) {
        setIsLiked(true);
        return;
      }

      if (isLiked) {
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        toast({
          title: "সফল",
          description: "পছন্দ সরানো হয়েছে।"
        });
      } else {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        toast({
          title: "সফল",
          description: "পছন্দ করা হয়েছে।"
        });
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: "ত্রুটি",
        description: error.message || "লাইক করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLikeToggle}
      disabled={isLoading}
      className={`flex items-center gap-1 ${className}`}
    >
      <Heart 
        className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} 
      />
      {likeCount > 0 && (
        <span className="text-sm text-muted-foreground">
          {likeCount}
        </span>
      )}
    </Button>
  );
}