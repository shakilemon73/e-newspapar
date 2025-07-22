import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

type AdminSessionContextType = {
  admin: { email: string; role: string } | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminSessionContext = createContext<AdminSessionContextType | undefined>(undefined);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check admin session on load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Use Supabase auth to check session instead of Express
      const { useSupabaseAuth } = await import('@/hooks/use-supabase-auth');
      const { user } = useSupabaseAuth();
      
      if (user && user.user_metadata?.role === 'admin') {
        setAdmin({ 
          email: user.email || '',
          role: 'admin'
        });
      } else {
        setAdmin(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    try {
      setLoading(true);
      
      // Try both email and username format
      const loginData = emailOrUsername.includes('@') 
        ? { email: emailOrUsername, password }
        : { username: emailOrUsername, password };
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setAdmin(data.admin);
        toast({
          title: "অ্যাডমিন লগইন সফল",
          description: "আপনি সফলভাবে অ্যাডমিন প্যানেলে প্রবেশ করেছেন",
        });
      } else {
        throw new Error(data.message || data.error || 'Login failed');
      }
    } catch (error: any) {
      toast({
        title: "অ্যাডমিন লগইন ব্যর্থ",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setAdmin(null);
        toast({
          title: "লগআউট সফল",
          description: "আপনি সফলভাবে অ্যাডমিন প্যানেল থেকে বের হয়েছেন",
        });
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "লগআউট সমস্যা",
        description: "লগআউট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const value = {
    admin,
    isAuthenticated: !!admin,
    loading,
    login,
    logout,
  };

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (context === undefined) {
    throw new Error('useAdminSession must be used within an AdminSessionProvider');
  }
  return context;
}