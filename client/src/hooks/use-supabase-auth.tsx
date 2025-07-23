import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: object) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error getting session:', error);
          // Clear corrupted session data and any old tokens
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-mrjukcqspvhketnfzmud-auth-token');
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Session retrieval failed:', error);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        console.log('Auth state changed:', event);
        
        // Handle token refresh and expiry
        if (event === 'TOKEN_REFRESHED') {
          console.log('JWT token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          // Clear all stored tokens on logout
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-mrjukcqspvhketnfzmud-auth-token');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Auth state change error:', error);
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from auth changes:', error);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "লগইন সফল",
        description: "আপনি সফলভাবে লগইন করেছেন",
      });
    } catch (error: any) {
      toast({
        title: "লগইন ব্যর্থ",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "অ্যাকাউন্ট তৈরি সফল",
        description: "আপনার ইমেইল ঠিকানায় একটি যাচাইকরণ লিঙ্ক পাঠানো হয়েছে",
      });
    } catch (error: any) {
      toast({
        title: "অ্যাকাউন্ট তৈরি ব্যর্থ",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "লগআউট সফল",
        description: "আপনি সফলভাবে লগআউট করেছেন",
      });
    } catch (error: any) {
      toast({
        title: "লগআউট ব্যর্থ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "পাসওয়ার্ড রিসেট করুন",
        description: "আপনার ইমেইল ঠিকানায় একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে",
      });
    } catch (error: any) {
      toast({
        title: "পাসওয়ার্ড রিসেট ব্যর্থ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within an AuthProvider');
  }
  return context;
}