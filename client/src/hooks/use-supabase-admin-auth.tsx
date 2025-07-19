import { useState, useEffect, createContext, useContext } from 'react';
import { useSupabaseAuth } from './use-supabase-auth';
import { useToast } from './use-toast';

interface SupabaseAdminAuthContextType {
  isAdmin: boolean;
  loading: boolean;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

const SupabaseAdminAuthContext = createContext<SupabaseAdminAuthContextType | undefined>(undefined);

export const SupabaseAdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, signIn, signOut, loading: authLoading } = useSupabaseAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if current user has admin role
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    try {
      // Check user metadata for admin role
      const userRole = user.user_metadata?.role;
      const adminStatus = userRole === 'admin';
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  };

  // Login with email/password and verify admin role
  const loginAsAdmin = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Sign in with Supabase
      await signIn(email, password);
      
      // Note: The user state will be updated automatically by useSupabaseAuth
      // and then useEffect will check admin status
      
    } catch (error: any) {
      console.error('Admin login error:', error);
      throw new Error(error.message || 'অ্যাডমিন লগইন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await signOut();
      setIsAdmin(false);
      toast({
        title: "লগআউট সফল",
        description: "আপনি সফলভাবে অ্যাডমিন প্যানেল থেকে বের হয়েছেন",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "লগআউট সমস্যা",
        description: "লগআউট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  // Check admin status when user changes
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        checkAdminStatus().finally(() => setLoading(false));
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const value = {
    isAdmin,
    loading: loading || authLoading,
    loginAsAdmin,
    logout,
    checkAdminStatus,
  };

  return (
    <SupabaseAdminAuthContext.Provider value={value}>
      {children}
    </SupabaseAdminAuthContext.Provider>
  );
};

export const useSupabaseAdminAuth = (): SupabaseAdminAuthContextType => {
  const context = useContext(SupabaseAdminAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAdminAuth must be used within a SupabaseAdminAuthProvider');
  }
  return context;
};