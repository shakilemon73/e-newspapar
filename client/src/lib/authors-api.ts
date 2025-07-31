/**
 * Authors API for ContentEditor
 */

import { supabase } from './supabase';

export interface Author {
  id: number;
  name: string;
  slug: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
  social_links?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getActiveAuthors(): Promise<Author[]> {
  try {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching authors:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Authors API error:', error);
    return [];
  }
}

export async function getAuthorById(id: number): Promise<Author | null> {
  try {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching author:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Author by ID API error:', error);
    return null;
  }
}