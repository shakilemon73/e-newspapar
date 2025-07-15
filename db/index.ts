import { createClient } from '@supabase/supabase-js';

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error(
    "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. Please check your environment variables.",
  );
}

// Use service role key for backend operations if available, otherwise use anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client for database operations
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  supabaseKey
);

// Export for compatibility with existing code
export const db = supabase;