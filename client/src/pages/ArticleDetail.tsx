import { useState, useEffect, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { updateDisplayUrl, decodeSlug, getCleanShareUrl, createBengaliSlug } from '@/lib/utils/url-utils';
import { formatBengaliDate, getRelativeTimeInBengali } from '@/lib/utils/dates';
import { ReadingTimeIndicator } from '@/components/ReadingTimeIndicator';
import { ArticleSummary } from '@/components/ArticleSummary';
import { TextToSpeech } from '@/components/TextToSpeech';
import { SavedArticleButton } from '@/components/SavedArticleButton';
import { LikeButton } from '@/components/LikeButton';
import { ShareButton } from '@/components/ShareButton';
import { CommentsSection } from '@/components/CommentsSection';
import { TagsDisplay } from '@/components/TagsDisplay';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { PollsSection } from '@/components/PollsSection';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { generateArticleMetaTags, getMetaTagsForHelmet } from '@/lib/social-media-meta';
import { 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Eye, 
  Calendar, 
  Tag, 
  ArrowLeft, 
  Heart,
  MessageCircle,
  TrendingUp,
  ChevronRight,
  Copy,
  ExternalLink,
  Clock,
  User,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronUp,
  Settings,
  Type,
  Sun,
  Moon,
  RotateCcw,
  Download,
  Facebook,
  Twitter,
  Send,
  Lightbulb,
  BookOpen,
  Target,
  Coffee,
  Award,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  published_at: string;
  category: Category;
  view_count: number;
  category_id: number;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

const ArticleDetail = () => {
  const [, params] = useRoute('/article/:slug');
  const rawSlug = params?.slug || '';
  const articleSlug = decodeSlug(rawSlug);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  
  // Core Article State
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [viewTracked, setViewTracked] = useState<boolean>(false);
  
  // Note: View tracking is now handled directly in the fetchArticle function
  
  // Fetch related articles using the new API endpoint
  const { data: fetchedRelatedArticles = [] } = useQuery({
    queryKey: ['/api/articles', article?.id, 'related'],
    queryFn: async () => {
      if (!article) return [];
      
      const response = await fetch(`/api/articles/${article.id}/related?limit=3`);
      if (!response.ok) return [];
      
      return response.json();
    },
    enabled: !!article
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // User Interaction State
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  
  // Reading Experience State
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [fontSize, setFontSize] = useState<number>(16);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(false);
  const [readingSpeed, setReadingSpeed] = useState<number>(250); // words per minute
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Audio State
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(0.8);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [speechPitch, setSpeechPitch] = useState<number>(1);
  
  // Reading Analytics
  const [readingTime, setReadingTime] = useState<number>(0);
  const [scrollDepth, setScrollDepth] = useState<number>(0);
  const [timeSpentReading, setTimeSpentReading] = useState<number>(0);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  
  // Save/unsave article functionality
  const handleSaveArticle = async () => {
    if (!user || !article) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "নিবন্ধ সংরক্ষণ করার জন্য অনুগ্রহ করে লগইন করুন",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (isSaved) {
        // Remove from saved articles
        const { error } = await supabase
          .from('saved_articles')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', article.id);

        if (error) throw error;
        setIsSaved(false);
        toast({
          title: "সংরক্ষণ সরানো হয়েছে",
          description: "নিবন্ধটি আপনার সংরক্ষিত তালিকা থেকে সরানো হয়েছে",
        });
      } else {
        // Add to saved articles
        const { error } = await supabase
          .from('saved_articles')
          .insert({
            user_id: user.id,
            article_id: article.id,
          });

        if (error) throw error;
        setIsSaved(true);
        toast({
          title: "সংরক্ষণ করা হয়েছে",
          description: "নিবন্ধটি আপনার সংরক্ষিত তালিকায় যোগ করা হয়েছে",
        });
      }
    } catch (err) {
      console.error('Error saving article:', err);
      toast({
        title: "ত্রুটি",
        description: "নিবন্ধ সংরক্ষণ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update related articles when fetched
  useEffect(() => {
    if (fetchedRelatedArticles) {
      setRelatedArticles(fetchedRelatedArticles);
    }
  }, [fetchedRelatedArticles]);

  // Check if article is saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !article) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('saved_articles')
          .select()
          .eq('user_id', user.id)
          .eq('article_id', article.id)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking if article is saved:', error);
          return;
        }
        
        setIsSaved(!!data);
      } catch (err) {
        console.error('Error checking if article is saved:', err);
      }
    };
    
    checkIfSaved();
  }, [user, article]);

  // Enhanced reading progress and analytics
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
      
      setReadingProgress(scrollPercent);
      setScrollDepth(Math.max(scrollDepth, scrollPercent));
      
      // Update reading time
      const currentTime = Date.now();
      const timeSpent = Math.floor((currentTime - startTimeRef.current) / 1000);
      setTimeSpentReading(timeSpent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDepth]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScroll) return;

    const scrollInterval = setInterval(() => {
      const scrollAmount = (readingSpeed / 60) * 10; // Adjust scroll speed based on reading speed
      window.scrollBy(0, scrollAmount);
      
      // Stop at bottom
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        setIsAutoScroll(false);
      }
    }, 100);

    return () => clearInterval(scrollInterval);
  }, [isAutoScroll, readingSpeed]);

  // Font size and theme persistence
  useEffect(() => {
    const savedFontSize = localStorage.getItem('article-font-size');
    const savedTheme = localStorage.getItem('article-theme');
    
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('article-font-size', fontSize.toString());
    if (contentRef.current) {
      contentRef.current.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('article-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Track reading history when an article is viewed by a logged-in user
  useEffect(() => {
    const trackReading = async () => {
      if (!user || !article) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const token = session.access_token;
        
        // Send reading history to server
        await fetch('/api/track-reading', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ articleId: article.id })
        });
        
        // Don't need to do anything with the response
      } catch (err) {
        console.error('Error tracking reading history:', err);
        // Don't show error to user as this is a background operation
      }
    };
    
    trackReading();
  }, [user, article]);
  
  // Share functionality
  const handleShare = async (platform: string = 'copy') => {
    if (!article) return;

    // Always use clean Bengali URL for sharing
    const cleanSlug = createBengaliSlug(article.title);
    const cleanUrl = `${window.location.origin}/article/${cleanSlug}`;

    const shareData = {
      title: article.title,
      text: article.excerpt || article.title,
      url: cleanUrl
    };

    switch (platform) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share(shareData);
            toast({
              title: "শেয়ার করা হয়েছে",
              description: "নিবন্ধটি সফলভাবে শেয়ার করা হয়েছে",
            });
          } catch (err) {
            console.error('Error sharing:', err);
          }
        }
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`, '_blank');
        break;
      case 'copy':
      default:
        try {
          await navigator.clipboard.writeText(shareData.url);
          toast({
            title: "লিংক কপি করা হয়েছে",
            description: "নিবন্ধের লিংক ক্লিপবোর্ডে কপি করা হয়েছে",
          });
        } catch (err) {
          console.error('Error copying to clipboard:', err);
        }
        break;
    }
    
    setShowShareMenu(false);
  };

  // Like functionality
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast({
      title: isLiked ? "লাইক সরানো হয়েছে" : "লাইক করা হয়েছে",
      description: isLiked ? "নিবন্ধটি আপনার পছন্দের তালিকা থেকে সরানো হয়েছে" : "নিবন্ধটি আপনার পছন্দের তালিকায় যোগ করা হয়েছে"
    });
  };

  // Report functionality
  const handleReport = async () => {
    if (!article) return;
    
    const reason = prompt("রিপোর্ট করার কারণ লিখুন:");
    if (!reason) return;
    
    try {
      const response = await fetch(`/api/articles/${article.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason.trim(),
          description: 'User reported from article page'
        })
      });

      if (response.ok) {
        toast({
          title: "রিপোর্ট জমা দেওয়া হয়েছে",
          description: "আপনার রিপোর্ট আমাদের কাছে পৌঁছেছে। পর্যালোচনার জন্য ধন্যবাদ।",
        });
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error reporting article:', error);
      toast({
        title: "রিপোর্ট করতে সমস্যা হয়েছে",
        description: "দুঃখিত, আপনার রিপোর্ট জমা দিতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  };

  // Feedback functionality
  const handleFeedback = async (type: 'helpful' | 'content') => {
    if (!article) return;
    
    try {
      const response = await fetch(`/api/articles/${article.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: type === 'helpful' ? 'helpful' : 'content_feedback',
          description: type === 'helpful' ? 'User found article helpful' : 'User provided content feedback'
        })
      });

      if (response.ok) {
        toast({
          title: "ফিডব্যাক জমা দেওয়া হয়েছে",
          description: "আপনার মতামত আমাদের কাছে পৌঁছেছে। ধন্যবাদ।",
        });
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "ফিডব্যাক জমা দিতে সমস্যা হয়েছে",
        description: "দুঃখিত, আপনার ফিডব্যাক জমা দিতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  };

  // Save for offline reading
  const handleSaveForOffline = async () => {
    if (!article) return;
    
    if (!user) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "অফলাইন পড়ার জন্য অনুগ্রহ করে লগইন করুন।",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const response = await fetch(`/api/articles/${article.id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          folderName: 'offline_reading',
          notes: 'Saved for offline reading'
        })
      });

      if (response.ok) {
        toast({
          title: "অফলাইন পড়ার জন্য সংরক্ষিত",
          description: "নিবন্ধটি আপনার অফলাইন পড়ার তালিকায় যোগ করা হয়েছে।",
        });
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          toast({
            title: "ইতিমধ্যে সংরক্ষিত",
            description: "এই নিবন্ধটি ইতিমধ্যে আপনার অফলাইন পড়ার তালিকায় রয়েছে।",
            variant: "destructive"
          });
        } else {
          throw new Error(errorData.error || 'Failed to save article');
        }
      }
    } catch (error) {
      console.error('Error saving article for offline:', error);
      toast({
        title: "অফলাইন সংরক্ষণে সমস্যা",
        description: "দুঃখিত, নিবন্ধটি অফলাইন পড়ার জন্য সংরক্ষণে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    }
  };

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
      
      // Load voices if not already loaded
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
        });
      }
    }
  }, []);

  // Cleanup speech synthesis on unmount or article change
  useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
        setIsAudioPlaying(false);
        setCurrentUtterance(null);
        setAudioProgress(0);
      }
    };
  }, [speechSynthesis, articleSlug]);

  // Helper function to strip HTML tags from content
  const stripHtmlTags = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || doc.body.innerText || '';
  };

  // PDF Generation Function
  const generatePDF = () => {
    if (!article) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const cleanContent = stripHtmlTags(article.content);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${article.title} - </title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          
          body {
            font-family: 'Kalpurush', 'SolaimanLipi', 'Vrinda', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          
          .website-info {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 10px;
          }
          
          .article-meta {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          
          .article-title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            line-height: 1.3;
          }
          
          .article-excerpt {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 15px;
            font-style: italic;
          }
          
          .article-info {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          
          .article-content {
            font-size: 16px;
            line-height: 1.8;
            color: #374151;
            text-align: justify;
            hyphens: auto;
          }
          
          .article-content p {
            margin-bottom: 15px;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          
          .category-badge {
            background: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            display: inline-block;
            margin-bottom: 10px;
          }
          
          .print-info {
            font-size: 10px;
            color: #9ca3af;
            margin-top: 20px;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            .header {
              page-break-inside: avoid;
            }
            
            .article-title {
              page-break-after: avoid;
            }
            
            .article-content {
              orphans: 3;
              widows: 3;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo"></div>
          <div class="website-info">বাংলাদেশের অগ্রণী অনলাইন সংবাদপত্র</div>
          <div class="website-info">www.prothomalo.com</div>
        </div>
        
        <div class="article-meta">
          <div class="category-badge">${article.category?.name || 'সাধারণ'}</div>
          <h1 class="article-title">${article.title}</h1>
          <div class="article-excerpt">${article.excerpt}</div>
          <div class="article-info">
            <span>প্রকাশকাল: ${formatBengaliDate(article.published_at)}</span>
            <span>দেখা হয়েছে: ${article.view_count || 0} বার</span>
          </div>
        </div>
        
        <div class="article-content">
          ${cleanContent.split('\n').map(paragraph => 
            paragraph.trim() ? `<p>${paragraph}</p>` : ''
          ).join('')}
        </div>
        
        <div class="footer">
          <p><strong></strong> - সত্যের পথে, শান্তির পথে</p>
          <p>© ${new Date().getFullYear()} । সমস্ত অধিকার সংরক্ষিত।</p>
          <div class="print-info">
            <p>প্রিন্ট করা হয়েছে: ${new Date().toLocaleString('bn-BD')}</p>
            <p>URL: ${window.location.href}</p>
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Share functionality
  const shareArticle = async () => {
    if (!article) return;
    const cleanUrl = getCleanShareUrl(article.slug, article.title);
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: cleanUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(cleanUrl);
        toast({
          title: "লিংক কপি হয়েছে",
          description: "আর্টিকেলের লিংক ক্লিপবোর্ডে কপি করা হয়েছে",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Text-to-Speech controls
  const toggleAudio = () => {
    console.log('Audio button clicked');
    console.log('Speech synthesis available:', !!speechSynthesis);
    console.log('Article available:', !!article);
    
    if (!speechSynthesis || !article) {
      toast({
        title: "অডিও অসুবিধা",
        description: "আপনার ব্রাউজার টেক্সট-টু-স্পিচ সাপোর্ট করে না",
        variant: "destructive",
      });
      return;
    }

    if (isAudioPlaying) {
      // Stop current speech
      console.log('Stopping speech');
      speechSynthesis.cancel();
      setIsAudioPlaying(false);
      setCurrentUtterance(null);
      setAudioProgress(0);
    } else {
      // Clean text content by stripping HTML tags
      const cleanContent = stripHtmlTags(article.content);
      const textToSpeak = `${article.title}. ${cleanContent}`;
      console.log('Text to speak length:', textToSpeak.length);
      console.log('Text preview:', textToSpeak.substring(0, 100) + '...');
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Configure speech parameters - try different language codes
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.volume = isAudioMuted ? 0 : audioVolume;
      
      // Get available voices and select the best one
      const voices = speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Priority order: Bengali > Hindi > English
      let selectedVoice = null;
      
      // First try to find Bengali voice
      selectedVoice = voices.find(voice => 
        voice.lang.includes('bn') || voice.name.toLowerCase().includes('bengali')
      );
      
      if (!selectedVoice) {
        // If no Bengali, try Hindi (closer to Bengali than English)
        selectedVoice = voices.find(voice => 
          voice.lang.includes('hi') || voice.name.includes('हिन्दी')
        );
      }
      
      if (!selectedVoice) {
        // Finally fallback to English
        selectedVoice = voices.find(voice => 
          voice.lang.includes('en-US') || voice.lang.includes('en-GB')
        );
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
        console.log('Using voice:', selectedVoice.name, selectedVoice.lang);
      } else {
        utterance.lang = 'en-US'; // Final fallback
        console.log('No specific voice found, using default English');
      }
      
      // Set up event listeners
      utterance.onstart = () => {
        console.log('Speech started');
        setIsAudioPlaying(true);
        setCurrentUtterance(utterance);
        toast({
          title: "অডিও শুরু হয়েছে",
          description: "নিবন্ধটি পড়া হচ্ছে...",
        });
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
        setIsAudioPlaying(false);
        setCurrentUtterance(null);
        setAudioProgress(100);
        toast({
          title: "অডিও সম্পন্ন",
          description: "নিবন্ধটি সম্পূর্ণ পড়া হয়েছে",
        });
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsAudioPlaying(false);
        setCurrentUtterance(null);
        toast({
          title: "অডিও ত্রুটি",
          description: `সমস্যা: ${event.error}`,
          variant: "destructive",
        });
      };

      // Track progress (approximate)
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const progress = (event.charIndex / textToSpeak.length) * 100;
          setAudioProgress(Math.min(progress, 100));
        }
      };

      console.log('Starting speech synthesis');
      
      // Ensure speech synthesis is ready
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        console.log('Cancelled previous speech');
      }
      
      // Add a small delay to ensure proper initialization
      setTimeout(() => {
        try {
          speechSynthesis.speak(utterance);
          console.log('Speech synthesis started successfully');
          
          // Check if speech actually started after a brief delay
          setTimeout(() => {
            if (!speechSynthesis.speaking && !speechSynthesis.pending) {
              console.log('Speech synthesis did not start - trying again');
              speechSynthesis.speak(utterance);
            }
          }, 200);
          
        } catch (error) {
          console.error('Error starting speech synthesis:', error);
          setIsAudioPlaying(false);
          setCurrentUtterance(null);
          toast({
            title: "অডিও ত্রুটি",
            description: "স্পিচ সিন্থেসিস শুরু করতে সমস্যা হয়েছে",
            variant: "destructive",
          });
        }
      }, 100);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setAudioVolume(newVolume);
    if (currentUtterance && speechSynthesis) {
      // Just update the volume without restarting
      currentUtterance.volume = isAudioMuted ? 0 : newVolume;
    }
  };

  const toggleMute = () => {
    setIsAudioMuted(!isAudioMuted);
    if (currentUtterance && speechSynthesis) {
      // Just update the volume without restarting
      currentUtterance.volume = !isAudioMuted ? 0 : audioVolume;
    }
  };

  const handleSpeechRateChange = (value: number[]) => {
    const newRate = value[0];
    setSpeechRate(newRate);
    // Note: Rate changes require restarting speech synthesis
    if (currentUtterance && isAudioPlaying && speechSynthesis && article) {
      speechSynthesis.cancel();
      const cleanContent = stripHtmlTags(article.content);
      const textToSpeak = `${article.title}. ${cleanContent}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = newRate;
      utterance.pitch = speechPitch;
      utterance.volume = isAudioMuted ? 0 : audioVolume;
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
      setCurrentUtterance(utterance);
    }
  };

  const handleSpeechPitchChange = (value: number[]) => {
    const newPitch = value[0];
    setSpeechPitch(newPitch);
    // Note: Pitch changes require restarting speech synthesis
    if (currentUtterance && isAudioPlaying && speechSynthesis && article) {
      speechSynthesis.cancel();
      const cleanContent = stripHtmlTags(article.content);
      const textToSpeak = `${article.title}. ${cleanContent}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = speechRate;
      utterance.pitch = newPitch;
      utterance.volume = isAudioMuted ? 0 : audioVolume;
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
      setCurrentUtterance(utterance);
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        startTimeRef.current = Date.now();
        
        const response = await fetch(`/api/articles/${articleSlug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('এই সংবাদটি খুঁজে পাওয়া যায়নি');
            return;
          }
          throw new Error('Failed to fetch article');
        }
        
        const data = await response.json();
        setArticle(data);
        
        // Track view count immediately after setting article data
        if (data.id && !viewTracked) {
          try {
            const viewResponse = await fetch(`/api/articles/${data.id}/view`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (viewResponse.ok) {
              const viewData = await viewResponse.json();
              console.log(`[View Tracking] Successfully tracked view for article ${data.id}, new count: ${viewData.viewCount}`);
              
              // Update the article data with new view count
              setArticle(prev => prev ? { ...prev, view_count: viewData.viewCount } : null);
              setViewTracked(true);
            }
          } catch (error) {
            console.error('Error tracking article view:', error);
          }
        }
        
        // Update URL to show clean Bengali title
        if (data.title) {
          const cleanSlug = createBengaliSlug(data.title);
          const cleanUrl = `/article/${cleanSlug}`;
          const currentPath = window.location.pathname;
          
          // Fix URL if it contains encoded characters
          if (currentPath.includes('%') || currentPath !== cleanUrl) {
            updateDisplayUrl(cleanUrl);
          }
        }
        
        // Calculate estimated reading time
        const wordCount = data.content.split(' ').length;
        setReadingTime(Math.ceil(wordCount / 200)); // Average 200 words per minute
        
        // Related articles are now fetched automatically via useQuery above
        
      } catch (err) {
        setError('নিবন্ধ লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching article:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
    // Reset states when article changes
    window.scrollTo(0, 0);
    setReadingProgress(0);
    setScrollDepth(0);
    setTimeSpentReading(0);
    setViewTracked(false); // Reset view tracking for new article
  }, [articleSlug]);

  // World-class loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-8">
              {/* Navigation skeleton */}
              <div className="flex items-center justify-between">
                <div className="h-10 w-32 bg-muted/50 rounded-full"></div>
                <div className="flex gap-2">
                  <div className="h-10 w-10 bg-muted/50 rounded-full"></div>
                  <div className="h-10 w-10 bg-muted/50 rounded-full"></div>
                </div>
              </div>
              
              {/* Progress bar skeleton */}
              <div className="h-1 w-full bg-muted/50 rounded-full"></div>
              
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Main content */}
                <div className="lg:col-span-3 space-y-6">
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/95">
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-6 w-20 bg-primary/20 rounded-full"></div>
                          <div className="h-4 w-16 bg-muted/50 rounded"></div>
                          <div className="h-4 w-24 bg-muted/50 rounded"></div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="h-10 bg-muted/50 rounded w-full"></div>
                          <div className="h-10 bg-muted/50 rounded w-4/5"></div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-muted/50 rounded-full"></div>
                            <div className="h-4 w-20 bg-muted/50 rounded"></div>
                          </div>
                          <div className="h-4 w-32 bg-muted/50 rounded"></div>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="h-12 w-36 bg-primary/20 rounded-full"></div>
                          <div className="h-12 w-28 bg-muted/50 rounded-full"></div>
                          <div className="h-12 w-24 bg-muted/50 rounded-full"></div>
                        </div>
                        
                        <div className="h-80 bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl"></div>
                        
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-4 bg-muted/40 rounded" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Enhanced sidebar skeleton */}
                <div className="space-y-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="h-6 w-32 bg-muted/50 rounded"></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-32 bg-gradient-to-br from-muted/30 to-muted/50 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted/40 rounded w-full"></div>
                        <div className="h-4 bg-muted/40 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="h-6 w-24 bg-muted/50 rounded"></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                          <div className="h-16 w-16 bg-muted/50 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted/40 rounded"></div>
                            <div className="h-3 bg-muted/30 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced loading indicator */}
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-3 rounded-full shadow-2xl border border-primary/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-5 h-5 border border-primary-foreground/20 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm font-medium">সেরা পাঠ অভিজ্ঞতার জন্য প্রস্তুতি নিচ্ছি...</span>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-destructive/5 flex items-center justify-center p-4">
        <div className="container mx-auto">
          <div className="max-w-lg mx-auto">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
              <CardContent className="p-10 text-center">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-destructive/10 to-destructive/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-destructive" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-destructive/20 rounded-full animate-pulse"></div>
                </div>
                
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-destructive to-destructive/80 bg-clip-text text-transparent">
                  {error || 'নিবন্ধ খুঁজে পাওয়া যায়নি'}
                </h2>
                
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  দুঃখিত, এই মুহূর্তে আর্টিকেলটি উপলব্ধ নেই। সম্ভবত এটি স্থানান্তরিত হয়েছে বা অস্থায়ীভাবে অনুপস্থিত।
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Link href="/">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      হোমপেজে ফিরে যান
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.location.reload()}
                    className="border-primary/20 hover:bg-primary/10 transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    পুনরায় চেষ্টা করুন
                  </Button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    সাহায্যের জন্য যোগাযোগ করুন বা অন্য নিবন্ধ পড়ুন
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Generate comprehensive social media meta tags
  const socialMetaTags = generateArticleMetaTags({
    title: article.title,
    excerpt: article.excerpt,
    image_url: article.image_url,
    slug: article.slug,
    published_at: article.published_at,
    category: article.category,
    author: ' সংবাদদাতা'
  });

  const { metaElements, linkElements } = getMetaTagsForHelmet(socialMetaTags);

  // World-class main article content
  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark' : ''} ${isFullscreen ? 'p-0' : ''}`}>
      <Helmet>
        <title>{socialMetaTags.title}</title>
        {metaElements.map((meta, index) => 
          meta.property ? (
            <meta key={index} property={meta.property} content={meta.content} />
          ) : (
            <meta key={index} name={meta.name} content={meta.content} />
          )
        )}
        {linkElements.map((link, index) => (
          <link key={index} rel={link.rel} href={link.href} />
        ))}
      </Helmet>

      {/* Enhanced Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-background/80 backdrop-blur-sm">
        <div 
          className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300 shadow-lg"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Action Toolbar */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        <Card className="p-2 shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <div className="flex flex-col gap-2">
            {/* Reading Settings */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>পাঠ সেটিংস</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">ফন্ট সাইজ</label>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[3rem] text-center">{fontSize}px</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">ডার্ক মোড</label>
                    <Switch 
                      checked={isDarkMode} 
                      onCheckedChange={setIsDarkMode}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">অটো স্ক্রল</label>
                    <Switch 
                      checked={isAutoScroll} 
                      onCheckedChange={setIsAutoScroll}
                    />
                  </div>
                  
                  {isAutoScroll && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">স্ক্রল গতি</label>
                      <Slider
                        value={[readingSpeed]}
                        onValueChange={(value) => setReadingSpeed(value[0])}
                        max={400}
                        min={100}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>ধীর</span>
                        <span>দ্রুত</span>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Audio Player */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleAudio}
              className="w-10 h-10 p-0"
            >
              {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            {/* Full Screen */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-10 h-10 p-0"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            {/* Back to Top */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-10 h-10 p-0"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      <div className={`${isFullscreen ? '' : 'container mx-auto px-4 py-8'}`}>
        <div className={`${isFullscreen ? 'max-w-4xl mx-auto px-8 py-4' : 'max-w-6xl mx-auto'}`}>
          
          {/* Enhanced Navigation */}
          {!isFullscreen && (
            <div className="flex items-center justify-between mb-8">
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground transition-all duration-300 group">
                <Link href="/">
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                  সকল খবর
                </Link>
              </Button>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {readingTime} মিনিট পড়া
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Eye className="w-3 h-3" />
                  {article.view_count} বার দেখা হয়েছে
                </Badge>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Article Content */}
            <div className={`${isFullscreen ? 'col-span-4' : 'lg:col-span-3'} space-y-8`}>
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  
                  {/* Article Header */}
                  <div className="p-8 pb-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Link href={`/category/${article.category.slug}`}>
                        <Badge className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl">
                          <Tag className="w-4 h-4 mr-2" />
                          {article.category.name}
                        </Badge>
                      </Link>
                      
                      {article.is_featured && (
                        <Badge variant="secondary" className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          ফিচার্ড
                        </Badge>
                      )}
                      
                      <ReadingTimeIndicator content={article.content} />
                    </div>
                    
                    <h1 
                      className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                      style={{ fontFamily: 'SolaimanLipi, Kalpurush, ApponaLohit, system-ui' }}
                    >
                      {article.title}
                    </h1>
                    
                    {article.excerpt && (
                      <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-primary/20">
                            <AvatarImage src="/default-author.jpg" />
                            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold">
                              <User className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">সম্পাদকীয় টিম</p>
                            <p className="text-xs text-muted-foreground">
                              {article.published_at ? getRelativeTimeInBengali(article.published_at) : 'কিছুক্ষণ আগে'}
                            </p>
                          </div>
                        </div>
                        
                        <Separator orientation="vertical" className="h-10" />
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{article.published_at ? getRelativeTimeInBengali(article.published_at) : 'কিছুক্ষণ আগে'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Action Buttons */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <SavedArticleButton 
                        articleId={article.id}
                        variant="button"
                        className="transition-all duration-300 hover:scale-105"
                      />
                      
                      <LikeButton 
                        articleId={article.id}
                        className="transition-all duration-300 hover:scale-105"
                      />
                      
                      <ShareButton 
                        articleId={article.id}
                        title={article.title}
                        className="transition-all duration-300 hover:scale-105"
                      />

                      {/* Text-to-Speech Audio Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={toggleAudio}
                          className="gap-2 transition-all duration-300 hover:scale-105"
                          disabled={!speechSynthesis}
                        >
                          {isAudioPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          {isAudioPlaying ? 'থামান' : 'শুনুন'}
                        </Button>
                        
                        {/* Audio Settings */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel>অডিও সেটিংস</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <div className="p-3 space-y-4">
                              {/* Volume Control */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">ভলিউম</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleMute}
                                    className="h-6 w-6 p-0"
                                  >
                                    {isAudioMuted ? (
                                      <VolumeX className="w-3 h-3" />
                                    ) : (
                                      <Volume2 className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                                <Slider
                                  value={[audioVolume]}
                                  onValueChange={handleVolumeChange}
                                  max={1}
                                  min={0}
                                  step={0.1}
                                  className="w-full"
                                />
                              </div>
                              
                              {/* Speech Rate */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">গতি</span>
                                  <span className="text-xs text-muted-foreground">{speechRate}x</span>
                                </div>
                                <Slider
                                  value={[speechRate]}
                                  onValueChange={handleSpeechRateChange}
                                  max={2}
                                  min={0.5}
                                  step={0.1}
                                  className="w-full"
                                />
                              </div>
                              
                              {/* Speech Pitch */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">টোন</span>
                                  <span className="text-xs text-muted-foreground">{speechPitch}x</span>
                                </div>
                                <Slider
                                  value={[speechPitch]}
                                  onValueChange={handleSpeechPitchChange}
                                  max={2}
                                  min={0.5}
                                  step={0.1}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* PDF Download Button */}
                      <Button
                        onClick={generatePDF}
                        variant="outline"
                        className="gap-2 transition-all duration-300 hover:scale-105"
                      >
                        <Download className="w-4 h-4" />
                        PDF ডাউনলোড
                      </Button>
                    </div>
                  </div>
                  
                  {/* Enhanced Article Image */}
                  <div className="relative group">
                    <div className="overflow-hidden">
                      <img 
                        src={article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop&auto=format&q=80'} 
                        alt={article.title}
                        className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop&auto=format&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Image Caption */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm opacity-90">
                        {article.title}
                      </p>
                    </div>
                  </div>
                  
                  {/* Article Content */}
                  <div 
                    ref={contentRef}
                    className="p-8 pt-6"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <div 
                      className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                      style={{ 
                        fontFamily: 'SolaimanLipi, Kalpurush, ApponaLohit, system-ui',
                        lineHeight: '1.8'
                      }}
                    />

                    {/* Article Summary */}
                    <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl">
                      <ArticleSummary content={article.content} />
                    </div>

                    {/* Tags Display */}
                    <div className="mt-6">
                      <TagsDisplay articleId={article.id} />
                    </div>
                  </div>
                  
                  {/* Article Footer */}
                  <div className="p-8 pt-6 border-t border-border/50 bg-muted/20">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="w-3 h-3" />
                          প্রকাশিত: {article.published_at ? formatBengaliDate(article.published_at) : 'অজানা তারিখ'}
                        </Badge>
                        
                        {article.updated_at && article.updated_at !== article.published_at && (
                          <Badge variant="outline" className="gap-1">
                            <RotateCcw className="w-3 h-3" />
                            আপডেট: {article.updated_at ? formatBengaliDate(article.updated_at) : 'অজানা তারিখ'}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleFeedback('helpful')}>
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          সহায়ক
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleReport()}>
                          <Flag className="w-4 h-4 mr-1" />
                          রিপোর্ট
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                </CardContent>
              </Card>

              {/* Comments Section */}
              <CommentsSection articleId={article.id} />
            </div>

            {/* Enhanced Sidebar */}
            {!isFullscreen && (
              <div className="space-y-6">
                {/* Reading Analytics */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      পাঠ পরিসংখ্যান
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>পড়া সম্পন্ন</span>
                        <span className="font-medium">{Math.round(readingProgress)}%</span>
                      </div>
                      <Progress value={readingProgress} className="h-2" />
                    </div>
                    
                    {/* Audio Progress */}
                    {isAudioPlaying && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            অডিও প্রগ্রেস
                          </span>
                          <span className="font-medium">{Math.round(audioProgress)}%</span>
                        </div>
                        <Progress value={audioProgress} className="h-2 bg-blue-100" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{Math.floor(timeSpentReading / 60)}</div>
                        <div className="text-xs text-muted-foreground">মিনিট পড়েছেন</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{Math.round(scrollDepth)}%</div>
                        <div className="text-xs text-muted-foreground">সর্বোচ্চ পড়া</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        সম্পর্কিত নিবন্ধ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {relatedArticles.map((relatedArticle) => (
                        <Link key={relatedArticle.id} href={`/article/${relatedArticle.slug}`}>
                          <div className="group cursor-pointer transition-all duration-300 hover:bg-muted/50 rounded-lg p-3 -m-3">
                            <div className="flex gap-3">
                              <img 
                                src={relatedArticle.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop&auto=format&q=80'} 
                                alt={relatedArticle.title}
                                className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop&auto=format&q=80';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300">
                                  {relatedArticle.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {relatedArticle.published_at ? getRelativeTimeInBengali(relatedArticle.published_at) : 'কিছুক্ষণ আগে'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Coffee className="w-5 h-5 text-primary" />
                      দ্রুত অ্যাকশন
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={generatePDF}>
                      <Download className="w-4 h-4 mr-2" />
                      PDF ডাউনলোড
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleFeedback('content')}>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      মূল বিষয়বস্তু
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleSaveForOffline()}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      অফলাইন পড়ুন
                    </Button>
                  </CardContent>
                </Card>

                {/* Newsletter Signup */}
                <NewsletterSignup />

                {/* Polls Section */}
                <PollsSection />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setAudioProgress(progress);
          }
        }}
        onEnded={() => setIsAudioPlaying(false)}
      >
        <source src="/audio/article-tts.mp3" type="audio/mpeg" />
        আপনার ব্রাউজার অডিও সাপোর্ট করে না।
      </audio>
    </div>
  );
};

export default ArticleDetail;
