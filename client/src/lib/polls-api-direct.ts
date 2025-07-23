// ========================================
// POLLS API (Direct Supabase - Fixed Relationships)
// ========================================

import { supabase } from './supabase';

export interface PollOption {
  id: number;
  poll_id: number;
  option_text: string;
  vote_count: number;
}

export interface Poll {
  id: number;
  article_id: number;
  question: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  options?: PollOption[];
}

export const pollsAPI = {
  // Get polls for an article
  async getByArticleId(articleId: number): Promise<Poll[]> {
    try {
      // First get polls
      const { data: polls, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .eq('article_id', articleId)
        .eq('is_active', true);
      
      if (pollsError) {
        console.error('Error fetching polls:', pollsError);
        return [];
      }
      
      if (!polls || polls.length === 0) {
        return [];
      }
      
      // Then get options for each poll separately
      const pollsWithOptions = await Promise.all(
        polls.map(async (poll) => {
          const { data: options, error: optionsError } = await supabase
            .from('poll_options')
            .select('*')
            .eq('poll_id', poll.id)
            .order('id');
          
          if (optionsError) {
            console.error('Error fetching poll options:', optionsError);
            return { ...poll, options: [] };
          }
          
          return { ...poll, options: options || [] };
        })
      );
      
      return pollsWithOptions;
    } catch (error) {
      console.error('Error fetching polls:', error);
      return [];
    }
  },

  // Vote on a poll option
  async vote(pollId: number, optionId: number, userId: string): Promise<boolean> {
    try {
      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single();
      
      if (existingVote) {
        console.log('User has already voted on this poll');
        return false;
      }
      
      // Record the vote
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: userId,
        });
      
      if (voteError) {
        console.error('Error recording vote:', voteError);
        return false;
      }
      
      // Increment vote count for the option
      const { error: incrementError } = await supabase
        .rpc('increment_poll_vote', { option_id: optionId });
      
      if (incrementError) {
        console.error('Error incrementing vote count:', incrementError);
        // Fallback: direct update
        await supabase
          .from('poll_options')
          .update({ vote_count: supabase.sql`vote_count + 1` })
          .eq('id', optionId);
      }
      
      return true;
    } catch (error) {
      console.error('Error voting on poll:', error);
      return false;
    }
  },

  // Get user's vote for a poll
  async getUserVote(pollId: number, userId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        return null;
      }
      
      return data?.option_id || null;
    } catch (error) {
      console.error('Error getting user vote:', error);
      return null;
    }
  },
};