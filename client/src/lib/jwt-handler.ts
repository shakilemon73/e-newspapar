// JWT Token Management for Supabase Operations
import { supabase } from './supabase';

// Helper to check if JWT token is expired with buffer
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Add 60 second buffer to refresh before actual expiry
    return payload.exp * 1000 < Date.now() + 60000;
  } catch {
    return true;
  }
}

// Enhanced session handler with automatic refresh
export async function getValidSession() {
  try {
    // Get current session
    let { data: { session }, error } = await supabase.auth.getSession();
    
    // If no session or error, return null (user not authenticated)
    if (error || !session) {
      return null;
    }
    
    // Check if token is expired or about to expire
    if (isTokenExpired(session.access_token)) {
      console.log('🔄 JWT token expired, refreshing...');
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Failed to refresh session:', refreshError);
        // Clear corrupted session
        await supabase.auth.signOut();
        return null;
      }
      
      session = refreshData?.session;
      if (session) {
        console.log('✅ JWT token refreshed successfully');
      }
    }
    
    return session;
  } catch (error) {
    console.error('Session handling error:', error);
    return null;
  }
}

// Wrapper for Supabase operations that need authentication
export async function withAuthRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Check if it's a JWT expiration error
    if (error?.message?.includes('JWT') || error?.message?.includes('expired') || error?.code === 'PGRST301') {
      console.log('🔄 Retrying operation after JWT refresh...');
      
      // Try to refresh session
      const session = await getValidSession();
      if (!session) {
        throw new Error('Authentication required - please log in again');
      }
      
      // Retry operation once
      return await operation();
    }
    
    throw error;
  }
}

// For operations that should always use anonymous key (no JWT)
export function getPublicSupabase() {
  return supabase; // This client always uses anon key
}

// For operations that need authentication but should handle JWT expiration
export async function getAuthenticatedSupabase() {
  const session = await getValidSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return supabase; // Return client with valid session
}