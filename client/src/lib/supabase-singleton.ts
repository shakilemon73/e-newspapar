import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cleanupCorruptedStorage } from './storage-cleanup';

// Singleton pattern to prevent multiple GoTrueClient instances
let supabaseInstance: SupabaseClient | null = null;

// Supabase configuration using environment variables with development fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTExNTksImV4cCI6MjA2ODA4NzE1OX0.GEhC-77JHGe1Oshtjg3FOSFSlJe5sLeyp_wqNWk6f1s';

// Validate required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('🚨 SECURITY: Missing required Supabase configuration');
}

// Clean up any corrupted storage data that might cause JSON parsing errors
if (typeof window !== 'undefined') {
  try {
    cleanupCorruptedStorage();
  } catch (e) {
    console.warn('Storage cleanup failed:', e);
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    console.log('🔗 Creating single Supabase client instance');
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: window.localStorage,
        storageKey: 'supabase.auth.token',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'apikey': supabaseAnonKey
        }
      }
    });
  }
  
  return supabaseInstance;
}

// Export singleton instance
export const supabase = getSupabaseClient();
export default supabase;