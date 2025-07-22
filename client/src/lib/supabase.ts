import { createClient } from '@supabase/supabase-js';

// Supabase configuration using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// For static site deployment, use service key if available (for build time)
// Otherwise use anon key (for runtime)
const useServiceKey = import.meta.env.VITE_USE_SERVICE_KEY === 'true' || 
                     (typeof window === 'undefined' && supabaseServiceKey); // Build time

const clientKey = useServiceKey && supabaseServiceKey ? supabaseServiceKey : supabaseAnonKey;

export const supabase = createClient(supabaseUrl, clientKey);

export default supabase;