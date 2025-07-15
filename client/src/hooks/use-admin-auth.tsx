import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from './use-supabase-auth';

export function useAdminAuth() {
  const { user, loading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/auth');
    } else if (!loading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/');
    }
  }, [loading, user, setLocation]);

  const isAdmin = user?.user_metadata?.role === 'admin';
  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isAdmin,
    isAuthenticated,
  };
}