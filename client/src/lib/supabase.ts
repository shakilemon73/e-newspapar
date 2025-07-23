import { createClient } from '@supabase/supabase-js';
import { cleanupCorruptedStorage } from './storage-cleanup';

// Supabase configuration using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// SECURITY: No hardcoded fallbacks - force environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('🚨 SECURITY: Missing required environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

const defaultUrl = supabaseUrl;
const defaultKey = supabaseAnonKey;

// Removed duplicate validation - already handled above

// SECURITY: Frontend client ALWAYS uses anonymous key
// Service role key should NEVER be exposed to frontend
console.log('Direct API client using: ANON KEY');
const clientKey = supabaseAnonKey;

// Clean up any corrupted storage data that might cause JSON parsing errors
if (typeof window !== 'undefined') {
  try {
    cleanupCorruptedStorage();
  } catch (e) {
    console.warn('Storage cleanup failed:', e);
  }
}

export const supabase = createClient(defaultUrl, defaultKey, {
  auth: {
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: false
    // Note: JWT tokens are automatically refreshed by Supabase client
    // Token cleanup is handled in auth state change events
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'apikey': defaultKey
    }
  }
});

export default supabase;