import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase-singleton';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Vercel-safe authentication hook
 * Prevents multiple GoTrueClient instances and localStorage errors
 */

const supabase = getSupabaseClient();

export function useVercelSafeAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('[VercelSafeAuth] Session fetch error:', error);
        }
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[VercelSafeAuth] Error getting initial session:', err);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[VercelSafeAuth] Auth state changed:', event);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user || null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('[VercelSafeAuth] Sign in error:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('[VercelSafeAuth] Sign up error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('[VercelSafeAuth] Sign out error:', error);
      return { error };
    }
  };

  return {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };
}

export default useVercelSafeAuth;