// Use centralized Supabase client to prevent multiple GoTrueClient instances
import { supabase } from './supabase';

// Use the main client for admin operations
export const adminSupabase = supabase;

export default adminSupabase;