import { createClient } from '@supabase/supabase-js';

// SECURITY: Frontend should NEVER use service role key
// Admin operations should go through backend API endpoints that use service role key server-side
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// SECURITY: Strict validation - no hardcoded fallbacks
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('🚨 SECURITY: Missing required environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Admin client uses ANON key with proper JWT authentication
// Backend API handles service role operations securely
export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    storageKey: 'supabase.auth.admin.token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: false
  }
});

export default adminSupabase;