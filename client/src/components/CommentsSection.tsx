import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: number;
  content: string;
  author_name: string;
  created_at: string;
  is_approved: boolean;
}

interface CommentsSectionProps {
  articleId: number;
  className?: string;
}

export function CommentsSection({ articleId, className = '' }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  // Load comments
  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "মন্তব্য করতে অনুগ্রহ করে লগইন করুন।",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "মন্তব্য খালি",
        description: "অনুগ্রহ করে মন্তব্য লিখুন।",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      setNewComment('');
      toast({
        title: "সফল",
        description: "আপনার মন্তব্য জমা দেওয়া হয়েছে। অনুমোদনের পর এটি প্রদর্শিত হবে।"
      });
      
      // Reload comments
      loadComments();
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast({
        title: "ত্রুটি",
        description: "মন্তব্য জমা দিতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            মন্তব্যসমূহ ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comment Form */}
          {user ? (
            <div className="space-y-3">
              <Textarea
                placeholder="আপনার মন্তব্য লিখুন..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  মন্তব্য করুন
                </Button>
              </div>
            </div>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  মন্তব্য করতে <strong>লগইন</strong> করুন।
                </p>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">মন্তব্য লোড হচ্ছে...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">এখনো কোনো মন্তব্য নেই।</p>
              <p className="text-sm text-muted-foreground">প্রথম মন্তব্য করুন!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="bg-muted/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{comment.author_name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}