// ========================================
// COMMENTS API (Direct Supabase - Fixed Relationships)
// ========================================

import { supabase } from './supabase';

export interface Comment {
  id: number;
  article_id: number;
  user_id: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export const commentsAPI = {
  // Get comments for an article
  async getByArticleId(articleId: number): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('article_comments')
        .select(`
          id,
          article_id,
          user_id,
          content,
          author_name,
          created_at,
          updated_at
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  // Add a new comment
  async addComment(articleId: number, userId: string, content: string, authorName: string): Promise<Comment | null> {
    try {
      const { data, error } = await supabase
        .from('article_comments')
        .insert({
          article_id: articleId,
          user_id: userId,
          content,
          author_name: authorName,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding comment:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  },

  // Delete a comment
  async deleteComment(commentId: number, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('article_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId); // Only allow users to delete their own comments
      
      if (error) {
        console.error('Error deleting comment:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  },
};