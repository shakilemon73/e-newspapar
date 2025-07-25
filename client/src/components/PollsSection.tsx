import React, { useState, useEffect } from 'react';
import { BarChart3, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';

interface Poll {
  id: number;
  title: string;
  question?: string;
  options: Array<{
    id: number;
    text: string;
    votes: number;
    vote_count?: number;
  }>;
  total_votes: number;
  expires_at?: string;
  is_active: boolean;
}

interface PollsSectionProps {
  className?: string;
}

export function PollsSection({ className = '' }: PollsSectionProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votedPolls, setVotedPolls] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    setIsLoading(true);
    try {
      const { getPolls } = await import('../lib/supabase-api-direct');
      const data = await getPolls();
      setPolls(data);
    } catch (error) {
      console.error('Error loading polls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (pollId: number, optionId: number) => {
    if (!user) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "ভোট দিতে অনুগ্রহ করে লগইন করুন।",
        variant: "destructive"
      });
      return;
    }

    if (votedPolls.has(pollId)) {
      toast({
        title: "ইতিমধ্যে ভোট দেওয়া",
        description: "আপনি এই পোলে ইতিমধ্যে ভোট দিয়েছেন।",
        variant: "destructive"
      });
      return;
    }

    try {
      const { voteOnPoll } = await import('../lib/supabase-api-direct');
      const result = await voteOnPoll(pollId, optionId, user.id);

      if (!result.success) {
        if (result.message.includes('ইতিমধ্যে')) {
          setVotedPolls(prev => new Set(Array.from(prev).concat(pollId)));
        }
        toast({
          title: result.success ? "সফল" : "ত্রুটি",
          description: result.message,
          variant: result.success ? "default" : "destructive"
        });
        return;
      }

      setVotedPolls(prev => new Set(Array.from(prev).concat(pollId)));
      toast({
        title: "সফল",
        description: result.message
      });
      
      // Reload polls to get updated vote counts
      loadPolls();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({
        title: "ত্রুটি",
        description: "ভোট দিতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            পোল লোড হচ্ছে...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-8 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (polls.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {polls.map((poll) => {
        const hasVoted = votedPolls.has(poll.id);
        const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();

        return (
          <Card key={poll.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-base">{poll.title || poll.question}</span>
                </div>
                {hasVoted && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{poll.total_votes} জন ভোট দিয়েছেন</span>
                {isExpired && (
                  <span className="text-red-500 font-medium">
                    • সময় শেষ
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {poll.options.map((option) => {
                // Use votes or vote_count, whichever is available
                const optionVotes = option.votes || option.vote_count || 0;
                const percentage = poll.total_votes > 0 
                  ? Math.round((optionVotes / poll.total_votes) * 100)
                  : 0;

                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{option.text}</span>
                      {hasVoted && (
                        <span className="text-xs text-muted-foreground">
                          {percentage}% ({optionVotes})
                        </span>
                      )}
                    </div>
                    
                    {hasVoted ? (
                      <Progress value={percentage} className="h-3" />
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(poll.id, option.id)}
                        disabled={isExpired || !poll.is_active}
                        className="w-full justify-start"
                      >
                        {option.text}
                      </Button>
                    )}
                  </div>
                );
              })}
              
              {!user && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  ভোট দিতে লগইন করুন
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}