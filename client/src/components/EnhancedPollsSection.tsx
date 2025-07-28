import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Vote, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getActivePolls, votePoll, type Poll } from '@/lib/supabase-api-direct';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedPollsSectionProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export default function EnhancedPollsSection({ 
  limit = 3, 
  showTitle = true,
  className = ''
}: EnhancedPollsSectionProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingPoll, setVotingPoll] = useState<number | null>(null);
  const [votedPolls, setVotedPolls] = useState<Set<number>>(new Set());
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        const fetchedPolls = await getActivePolls();
        const limitedPolls = limit ? fetchedPolls.slice(0, limit) : fetchedPolls;
        setPolls(limitedPolls);
        
        // Load voted polls from localStorage for unauthenticated users
        if (!user) {
          const savedVotes = localStorage.getItem('voted_polls');
          if (savedVotes) {
            try {
              const votes = JSON.parse(savedVotes);
              setVotedPolls(new Set(votes));
            } catch (error) {
              console.error('Error parsing voted polls:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [limit, user]);

  const handleVote = async (pollId: number, optionId: number) => {
    if (!user) {
      toast({
        title: 'লগইন প্রয়োজন',
        description: 'ভোট দিতে হলে আগে লগইন করুন',
        variant: 'destructive'
      });
      return;
    }

    if (votedPolls.has(pollId)) {
      toast({
        title: 'ভোট দেওয়া হয়েছে',
        description: 'আপনি ইতিমধ্যে এই পোলে ভোট দিয়েছেন',
        variant: 'destructive'
      });
      return;
    }

    try {
      setVotingPoll(pollId);
      const result = await votePoll(pollId, optionId, user.id);

      if (result.success) {
        toast({
          title: 'ভোট সফল',
          description: result.message
        });
        
        // Update voted polls
        setVotedPolls(prev => new Set([...prev, pollId]));
        
        // Refresh polls to get updated counts
        const updatedPolls = await getActivePolls();
        const limitedPolls = limit ? updatedPolls.slice(0, limit) : updatedPolls;
        setPolls(limitedPolls);
        
        // Save to localStorage for persistence
        const newVotedPolls = Array.from(new Set([...votedPolls, pollId]));
        localStorage.setItem('voted_polls', JSON.stringify(newVotedPolls));
      } else {
        toast({
          title: 'ভোট দিতে সমস্যা',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'ভোট দিতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।',
        variant: 'destructive'
      });
    } finally {
      setVotingPoll(null);
    }
  };

  const calculatePercentage = (optionVotes: number, totalVotes: number): number => {
    if (totalVotes === 0) return 0;
    return Math.round((optionVotes / totalVotes) * 100);
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const timeDiff = expiry.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'সময় শেষ';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} দিন বাকি`;
    if (hours > 0) return `${hours} ঘন্টা বাকি`;
    return 'শীঘ্রই শেষ';
  };

  if (loading) {
    return (
      <div className={className}>
        {showTitle && (
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            জনমত জরিপ
          </h2>
        )}
        <div className="space-y-4">
          {Array.from({ length: limit || 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, optionIndex) => (
                    <Skeleton key={optionIndex} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className={className}>
        {showTitle && (
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            জনমত জরিপ
          </h2>
        )}
        <Card>
          <CardContent className="text-center py-8">
            <Vote className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              বর্তমানে কোনো সক্রিয় জরিপ নেই
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          জনমত জরিপ
        </h2>
      )}
      
      <div className="space-y-4">
        {polls.map((poll) => {
          const hasVoted = votedPolls.has(poll.id);
          const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
          const canVote = user && !hasVoted && !isExpired;

          return (
            <Card key={poll.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">
                    {poll.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {poll.expires_at && (
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">
                          {formatTimeRemaining(poll.expires_at)}
                        </span>
                      </Badge>
                    )}
                    {hasVoted && (
                      <Badge variant="secondary" className="text-xs">
                        ভোট দেওয়া হয়েছে
                      </Badge>
                    )}
                  </div>
                </div>
                
                {poll.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {poll.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{poll.total_votes} ভোট</span>
                  </div>
                  {poll.multiple_choice && (
                    <Badge variant="outline" className="text-xs">
                      একাধিক নির্বাচন
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {poll.options?.map((option) => {
                    const percentage = calculatePercentage(option.vote_count, poll.total_votes);
                    
                    return (
                      <div key={option.id} className="space-y-2">
                        {canVote ? (
                          <Button
                            variant="outline"
                            className="w-full justify-start h-auto p-4 text-left"
                            onClick={() => handleVote(poll.id, option.id)}
                            disabled={votingPoll === poll.id}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{option.option_text}</span>
                              {votingPoll === poll.id && (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              )}
                            </div>
                          </Button>
                        ) : (
                          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{option.option_text}</span>
                              <span className="text-sm font-semibold">
                                {percentage}%
                              </span>
                            </div>
                            <Progress 
                              value={percentage} 
                              className="h-2" 
                            />
                            <div className="flex justify-between mt-1 text-xs text-gray-500">
                              <span>{option.vote_count} ভোট</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {!user && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      ভোট দিতে হলে <strong>লগইন করুন</strong>
                    </p>
                  </div>
                )}
                
                {isExpired && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      এই জরিপের সময় শেষ হয়ে গেছে
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Simple polls widget for sidebar
export function PollsWidget() {
  return (
    <EnhancedPollsSection 
      limit={2}
      showTitle={true}
      className="w-full"
    />
  );
}