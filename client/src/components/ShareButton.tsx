import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { supabase } from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareButtonProps {
  articleId: number;
  title: string;
  url?: string;
  className?: string;
}

export function ShareButton({ 
  articleId, 
  title, 
  url = window.location.href,
  className = ''
}: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const trackShare = async (platform: string) => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { trackArticleShare } = await import('../lib/supabase-api-direct');
      await trackArticleShare(articleId, session.user.id, platform);
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const handleShare = async (platform: string) => {
    setIsLoading(true);
    
    try {
      const encodedTitle = encodeURIComponent(title);
      const encodedUrl = encodeURIComponent(url);
      
      let shareUrl = '';
      
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
          break;
        case 'whatsapp':
          shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`;
          break;
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
          break;
        case 'copy':
          await navigator.clipboard.writeText(url);
          toast({
            title: "সফল",
            description: "লিংক কপি করা হয়েছে।"
          });
          await trackShare('copy');
          return;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        await trackShare(platform);
        toast({
          title: "সফল",
          description: "শেয়ার করা হয়েছে।"
        });
      }
    } catch (error: any) {
      console.error('Error sharing:', error);
      toast({
        title: "ত্রুটি",
        description: "শেয়ার করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className={`flex items-center gap-2 ${className}`}
        >
          <Share2 className="h-4 w-4" />
          শেয়ার
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('telegram')}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('copy')}>
          <Copy className="h-4 w-4 mr-2" />
          লিংক কপি করুন
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}