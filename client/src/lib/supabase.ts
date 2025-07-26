import { createClient } from '@supabase/supabase-js';
import { cleanupCorruptedStorage } from './storage-cleanup';

// Supabase configuration using environment variables with development fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTExNTksImV4cCI6MjA2ODA4NzE1OX0.GEhC-77JHGe1Oshtjg3FOSFSlJe5sLeyp_wqNWk6f1s';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Validate required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('🚨 SECURITY: Missing required Supabase configuration');
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