import { createClient } from '@supabase/supabase-js';

// Admin client using service key for bypassing RLS policies
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// For admin operations, we need to use service key to bypass RLS
export const adminSupabase = createClient(
  supabaseUrl, 
  supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.lxuDPYZfBrV6HTqQOxZpXIGrYqWA1LTKGCjFx-xzwQo',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default adminSupabase;