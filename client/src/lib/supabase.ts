import { createClient } from '@supabase/supabase-js';
import { cleanupCorruptedStorage } from './storage-cleanup';

// Supabase configuration using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Use anon key for frontend client - RLS policies should allow public read access
const clientKey = supabaseAnonKey;

// Clean up any corrupted storage data that might cause JSON parsing errors
if (typeof window !== 'undefined') {
  try {
    cleanupCorruptedStorage();
  } catch (e) {
    console.warn('Storage cleanup failed:', e);
  }
}

export const supabase = createClient(supabaseUrl, clientKey, {
  auth: {
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;