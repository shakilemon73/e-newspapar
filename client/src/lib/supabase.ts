import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cleanupCorruptedStorage } from './storage-cleanup';

// SINGLE GLOBAL INSTANCE - Prevents multiple GoTrueClient warnings in Vercel
let globalSupabaseInstance: SupabaseClient | null = null;

// Secure configuration with environment variable validation
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTExNTksImV4cCI6MjA2ODA4NzE1OX0.GEhC-77JHGe1Oshtjg3FOSFSlJe5sLeyp_wqNWk6f1s';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('🚨 Missing Supabase configuration');
}

// Clean up storage if in browser
if (typeof window !== 'undefined') {
  try {
    cleanupCorruptedStorage();
  } catch (e) {
    console.warn('Storage cleanup failed:', e);
  }
}

function createSupabaseClient(): SupabaseClient {
  if (!globalSupabaseInstance) {
    console.log('🔗 Creating single Supabase client instance');
    
    globalSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
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
  
  return globalSupabaseInstance;
}

export const supabase = createSupabaseClient();
export { createSupabaseClient as getSupabaseClient };
export default supabase;