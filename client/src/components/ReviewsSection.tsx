import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getContentReviews, addReview, type Review } from '@/lib/supabase-api-direct';
// Note: Using temporary auth check - replace with actual auth context
// import { useAuth } from '@/contexts/AuthContext';

// Temporary auth hook
const useAuth = () => {
  return { user: null }; // Replace with actual auth implementation
};

interface ReviewsSectionProps {
  contentId: number;
  contentType: string; // 'article', 'video', 'audio'
  contentTitle?: string;
}

export default function ReviewsSection({ contentId, contentType, contentTitle }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const fetchedReviews = await getContentReviews(contentId, contentType);
        setReviews(fetchedReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [contentId, contentType]);

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: 'লগইন প্রয়োজন',
        description: 'রিভিউ দিতে হলে আগে লগইন করুন',
        variant: 'destructive'
      });
      return;
    }

    if (!newReview.content.trim()) {
      toast({
        title: 'রিভিউ লিখুন',
        description: 'অন্তত কিছু মন্তব্য লিখুন',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await addReview({
        content_id: contentId,
        content_type: contentType,
        user_id: user.id,
        rating: newReview.rating,
        title: newReview.title || undefined,
        content: newReview.content
      });

      if (result.success) {
        toast({
          title: 'রিভিউ যোগ করা হয়েছে',
          description: result.message
        });
        
        // Reset form
        setNewReview({ rating: 5, title: '', content: '' });
        setShowAddReview(false);
        
        // Refresh reviews
        const updatedReviews = await getContentReviews(contentId, contentType);
        setReviews(updatedReviews);
      } else {
        toast({
          title: 'সমস্যা হয়েছে',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'রিভিউ জমা দিতে সমস্যা হয়েছে',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 dark:text-gray-600'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>রিভিউ ও রেটিং</span>
          {reviews.length > 0 && (
            <div className="flex items-center space-x-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({reviews.length} টি রিভিউ)
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add Review Section */}
        {!showAddReview ? (
          <Button 
            onClick={() => setShowAddReview(true)}
            className="w-full"
            variant="outline"
          >
            রিভিউ যোগ করুন
          </Button>
        ) : (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="space-y-2">
              <Label>রেটিং দিন</Label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="review-title">শিরোনাম (ঐচ্ছিক)</Label>
              <Input
                id="review-title"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                placeholder="রিভিউর শিরোনাম লিখুন"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="review-content">আপনার মন্তব্য *</Label>
              <Textarea
                id="review-content"
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                placeholder="এই কন্টেন্ট সম্পর্কে আপনার মতামত লিখুন..."
                rows={4}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'জমা দেওয়া হচ্ছে...' : 'রিভিউ জমা দিন'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddReview(false);
                  setNewReview({ rating: 5, title: '', content: '' });
                }}
                disabled={submitting}
              >
                বাতিল
              </Button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-sm">
                      {review.user_profiles?.full_name || 'পাঠক'}
                    </span>
                    {review.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        যাচাইকৃত
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </div>
                
                {review.title && (
                  <h4 className="font-semibold text-sm mb-1">{review.title}</h4>
                )}
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {review.content}
                </p>
                
                {review.helpful_count > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{review.helpful_count} জন এটি সহায়ক মনে করেছেন</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>এখনো কোনো রিভিউ নেই</p>
            <p className="text-sm">প্রথম রিভিউ দিন!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}