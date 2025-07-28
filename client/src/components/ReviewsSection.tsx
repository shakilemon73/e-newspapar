import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { 
  getContentReviews, 
  submitReview,
  type Review 
} from '../lib/missing-tables-api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  Star, 
  MessageSquare, 
  User,
  ThumbsUp,
  Send
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';
import { toast } from '../hooks/use-toast';

interface ReviewsSectionProps {
  contentType: 'article' | 'video' | 'audio';
  contentId: number;
  className?: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  contentType,
  contentId,
  className = ''
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const queryClient = useQueryClient();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return user;
    }
  });

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['content-reviews', contentType, contentId],
    queryFn: () => getContentReviews(contentType, contentId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!rating) throw new Error('রেটিং দিন');
      return submitReview(contentType, contentId, rating, reviewText);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'সফল',
          description: result.message,
        });
        setShowReviewForm(false);
        setRating(0);
        setReviewText('');
        queryClient.invalidateQueries({ 
          queryKey: ['content-reviews', contentType, contentId] 
        });
      } else {
        throw new Error(result.message);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'ত্রুটি',
        description: error.message || 'রিভিউ জমা দিতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    },
  });

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${
              star <= currentRating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'}`}
            onClick={interactive ? () => setRating(star) : undefined}
            disabled={!interactive}
          >
            <Star className="h-5 w-5" />
          </button>
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const getContentTypeName = () => {
    switch (contentType) {
      case 'article': return 'নিবন্ধ';
      case 'video': return 'ভিডিও';
      case 'audio': return 'অডিও';
      default: return 'কন্টেন্ট';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            রিভিউ ও রেটিং
            {reviews.length > 0 && (
              <Badge variant="secondary">{reviews.length}</Badge>
            )}
          </CardTitle>
          
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-gray-500">
                ({averageRating.toFixed(1)})
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Add Review Button */}
        {user && !showReviewForm && (
          <Button
            onClick={() => setShowReviewForm(true)}
            className="w-full"
            variant="outline"
          >
            <Star className="h-4 w-4 mr-2" />
            এই {getContentTypeName()}টি রিভিউ করুন
          </Button>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  রেটিং দিন *
                </label>
                {renderStars(rating, true)}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  আপনার মতামত (ঐচ্ছিক)
                </label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="এই কন্টেন্ট সম্পর্কে আপনার মতামত লিখুন..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={!rating || submitReviewMutation.isPending}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitReviewMutation.isPending ? 'জমা দেওয়া হচ্ছে...' : 'রিভিউ জমা দিন'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false);
                    setRating(0);
                    setReviewText('');
                  }}
                >
                  বাতিল
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6" />
                    <div className="h-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">এখনো কোনো রিভিউ নেই</p>
            <p className="text-sm text-gray-400 mt-1">
              প্রথম রিভিউ দিয়ে অন্যদের সাহায্য করুন!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">
                        {(review as any).user_profiles?.name || 'Anonymous User'}
                      </span>
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                          locale: bn
                        })}
                      </span>
                    </div>
                    
                    {review.review_text && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {review.review_text}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto p-1"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        সহায়ক
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Login prompt for non-users */}
        {!user && (
          <div className="text-center py-6 border-t">
            <p className="text-gray-500 mb-2">রিভিউ দিতে লগইন করুন</p>
            <Button variant="outline" size="sm">
              লগইন
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewsSection;