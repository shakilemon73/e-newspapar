import { createClient } from '@supabase/supabase-js';

// SECURITY: Environment variables only - no hardcoded fallbacks
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// SECURITY: Strict validation of environment variables
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('🚨 SECURITY ERROR: Missing critical environment variables. Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY');
}

// Public client using anonymous key (for public operations with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client using service role key (BACKEND ONLY - bypasses RLS)
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Default export is public client
export default supabase;

// Helper function to get appropriate client based on operation type
export function getSupabaseClient(requireAdmin = false) {
  if (requireAdmin && supabaseServiceKey) {
    console.log('🔐 Using SERVICE ROLE key for admin operations');
    return adminSupabase;
  }
  console.log('🔓 Using ANON key for public operations');
  return supabase;
}