// CONSOLIDATED: Use centralized Supabase client to prevent multiple GoTrueClient instances
import { supabase } from './supabase';

// Use the same centralized client for admin operations to prevent multiple instances
export const adminSupabase = supabase;
export default adminSupabase;

// Re-export the centralized client to maintain compatibility
export { supabase };