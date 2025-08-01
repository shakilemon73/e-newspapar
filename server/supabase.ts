import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
console.log('Environment loaded:', result.parsed ? 'Success' : 'Failed');
if (result.error) console.log('Dotenv error:', result.error);

// SECURITY: Environment variables only - no hardcoded fallbacks
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// SECURITY: Strict validation of environment variables
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Environment variables status:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  throw new Error('🚨 SECURITY ERROR: Missing critical environment variables. Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_SUPABASE_SERVICE_KEY');
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