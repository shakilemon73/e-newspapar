import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getPolls, voteOnPoll } from '@/lib/supabase-api-direct';

interface Poll {
  id: number;
  question: string;
  description?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  poll_options: PollOption[];
  total_votes?: number;
}

interface PollOption {
  id: number;
  poll_id: number;
  option_text: string;
  vote_count: number;
  display_order: number;
}

export default function PollsWidget() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<{ [pollId: number]: number }>({});
  const [votedPolls, setVotedPolls] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const pollsData = await getPolls();
      setPolls(pollsData);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "ত্রুটি",
        description: "পোল লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: number) => {
    const selectedOptionId = selectedOptions[pollId];
    if (!selectedOptionId) {
      toast({
        title: "নির্বাচন করুন",
        description: "অনুগ্রহ করে একটি অপশন নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await voteOnPoll(pollId, selectedOptionId);
      if (result.success) {
        setVotedPolls(prev => new Set(Array.from(prev).concat([pollId])));
        toast({
          title: "সফল",
          description: result.message,
        });
        // Refresh polls to show updated vote counts
        fetchPolls();
      } else {
        toast({
          title: "ত্রুটি",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "ত্রুটি",
        description: "ভোট দিতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const calculatePercentage = (voteCount: number, totalVotes: number): number => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>জনমত জরিপ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (polls.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>জনমত জরিপ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            বর্তমানে কোনো জরিপ নেই
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>জনমত জরিপ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {polls.map((poll) => {
          const hasVoted = votedPolls.has(poll.id);
          const totalVotes = poll.total_votes || poll.poll_options.reduce((sum, option) => sum + option.vote_count, 0);

          return (
            <div key={poll.id} className="border rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">{poll.question}</h4>
                {poll.description && (
                  <p className="text-sm text-muted-foreground mb-3">{poll.description}</p>
                )}
              </div>

              {hasVoted ? (
                // Show results after voting
                <div className="space-y-3">
                  {poll.poll_options
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((option) => {
                      const percentage = calculatePercentage(option.vote_count, totalVotes);
                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{option.option_text}</span>
                            <span className="text-sm text-muted-foreground">
                              {percentage}% ({option.vote_count})
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  <p className="text-xs text-muted-foreground mt-2">
                    মোট ভোট: {totalVotes}
                  </p>
                </div>
              ) : (
                // Show voting interface
                <div className="space-y-4">
                  <RadioGroup
                    value={selectedOptions[poll.id]?.toString() || ""}
                    onValueChange={(value: string) => 
                      setSelectedOptions(prev => ({ ...prev, [poll.id]: parseInt(value) }))
                    }
                  >
                    {poll.poll_options
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                          <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                            {option.option_text}
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>
                  <Button 
                    onClick={() => handleVote(poll.id)}
                    disabled={!selectedOptions[poll.id]}
                    className="w-full"
                  >
                    ভোট দিন
                  </Button>
                </div>
              )}

              {poll.expires_at && (
                <p className="text-xs text-muted-foreground">
                  শেষ তারিখ: {new Date(poll.expires_at).toLocaleDateString('bn-BD')}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}