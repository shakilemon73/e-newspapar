// Use singleton pattern to prevent multiple GoTrueClient instances
import { getSupabaseClient } from './supabase-singleton';

export const supabase = getSupabaseClient();
export { getSupabaseClient };
export default supabase;