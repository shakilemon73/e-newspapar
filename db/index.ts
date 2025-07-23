import { createClient } from '@supabase/supabase-js';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Use appropriate environment variable access for Node.js vs browser
const getEnvVar = (key: string, fallback: string = '') => {
  if (isBrowser) {
    // @ts-ignore - Vite replaces import.meta.env at build time
    return (import.meta?.env?.[key] || fallback);
  } else {
    // Node.js environment
    return process.env[key] || fallback;
  }
};

// SECURITY: Environment variables only - no hardcoded credentials
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. Please check your environment variables.",
  );
}

// Use service role key for backend operations if available, otherwise use anon key
const supabaseKey = isBrowser ? supabaseAnonKey : (supabaseServiceKey || supabaseAnonKey);

// Create Supabase client for database operations
export const supabase = createClient(supabaseUrl, supabaseKey);

// Export for compatibility with existing code
export const db = supabase;