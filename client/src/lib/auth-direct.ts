// ========================================
// AUTHENTICATION SERVICE (Direct Supabase - No Express)
// Replacing auth-fixes.ts with direct Supabase auth
// ========================================

import { supabase } from './supabase';
import { User, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

class DirectAuthService {
  // ========================================
  // 1. USER AUTHENTICATION
  // ========================================

  async signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, email, name);
      }

      return { 
        success: true, 
        user: data.user || undefined 
      };
    } catch (error: any) {
      console.error('Error signing up:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign up' 
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        user: data.user || undefined 
      };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in' 
      };
    }
  }

  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error signing out:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign out' 
      };
    }
  }

  // ========================================
  // 2. USER PROFILE MANAGEMENT
  // ========================================

  private async createUserProfile(userId: string, email: string, name?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email,
          name: name || email.split('@')[0],
          role: 'user',
        });

      if (error) {
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Also update auth metadata if name is being updated
      if (updates.name) {
        await supabase.auth.updateUser({
          data: { name: updates.name }
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update profile' 
      };
    }
  }

  // ========================================
  // 3. PASSWORD MANAGEMENT
  // ========================================

  async updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating password:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update password' 
      };
    }
  }

  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to reset password' 
      };
    }
  }

  // ========================================
  // 4. SESSION MANAGEMENT
  // ========================================

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting current session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  async refreshSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        user: data.user || undefined 
      };
    } catch (error: any) {
      console.error('Error refreshing session:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to refresh session' 
      };
    }
  }

  // ========================================
  // 5. ROLE-BASED ACCESS CONTROL
  // ========================================

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  async requireAuth(): Promise<User | null> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }
    return user;
  }

  async requireAdmin(): Promise<User | null> {
    const user = await this.requireAuth();
    if (!user) return null;

    const isUserAdmin = await this.isAdmin(user.id);
    if (!isUserAdmin) {
      throw new Error('Admin access required');
    }

    return user;
  }

  // ========================================
  // 6. AUTH STATE MANAGEMENT
  // ========================================

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // ========================================
  // 7. ADMIN USER MANAGEMENT
  // ========================================

  async getAllUsers(limit = 50, offset = 0): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<AuthResponse> {
    try {
      // Only allow this if current user is admin
      const currentUser = await this.requireAdmin();
      if (!currentUser) {
        return { success: false, error: 'Admin access required' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating user role:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update user role' 
      };
    }
  }

  async deleteUser(userId: string): Promise<AuthResponse> {
    try {
      // Only allow this if current user is admin
      const currentUser = await this.requireAdmin();
      if (!currentUser) {
        return { success: false, error: 'Admin access required' };
      }

      // Delete user profile (auth user will be handled by RLS policies)
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete user' 
      };
    }
  }

  // ========================================
  // 8. SESSION TRACKING
  // ========================================

  async trackUserSession(userId: string, metadata?: any): Promise<void> {
    try {
      await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_start: new Date().toISOString(),
          ip_address: await this.getUserIP(),
          user_agent: navigator.userAgent,
          metadata: metadata || {},
        });
    } catch (error) {
      console.error('Error tracking user session:', error);
    }
  }

  private async getUserIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  // ========================================
  // 9. ADMIN AUTHENTICATION
  // ========================================

  async adminSignIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // First sign in normally
      const authResult = await this.signIn(email, password);
      
      if (!authResult.success || !authResult.user) {
        return authResult;
      }

      // Check if user is admin
      const isUserAdmin = await this.isAdmin(authResult.user.id);
      if (!isUserAdmin) {
        // Sign out if not admin
        await this.signOut();
        return { 
          success: false, 
          error: 'Access denied. Admin privileges required.' 
        };
      }

      return authResult;
    } catch (error: any) {
      console.error('Error in admin sign in:', error);
      return { 
        success: false, 
        error: error.message || 'Admin sign in failed' 
      };
    }
  }
}

// Export singleton instance
export const directAuthService = new DirectAuthService();

// Custom hooks for React components
export const useAuth = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Get initial session
    directAuthService.getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = directAuthService.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    signIn: directAuthService.signIn.bind(directAuthService),
    signUp: directAuthService.signUp.bind(directAuthService),
    signOut: directAuthService.signOut.bind(directAuthService),
    isAdmin: (userId: string) => directAuthService.isAdmin(userId),
  };
};

// Import React for hooks
import React from 'react';

export default directAuthService;