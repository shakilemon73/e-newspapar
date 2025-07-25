// Consolidated Supabase Client Fix for Vercel Deployment
// This prevents multiple GoTrueClient instances and API 404 errors

import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NzM5NDEsImV4cCI6MjA1MjM0OTk0MX0.GTyWP7yRvTgOBUKY8VYjcv5Hj-RO5jYUnm9PXUR7I7g';

// Single, consolidated Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'bengali-news@1.0.0'
    }
  }
});

// Prevent multiple instances
if (typeof window !== 'undefined') {
  if (window.supabaseClient) {
    console.warn('Multiple Supabase clients detected - using existing instance');
  } else {
    window.supabaseClient = supabase;
  }
}

export default supabase;
