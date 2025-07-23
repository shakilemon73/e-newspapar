import { QueryClient, QueryFunction } from "@tanstack/react-query";
import supabase from '@/lib/supabase';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper function to get auth headers with JWT refresh handling
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    // First try to get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // If session is expired, try to refresh it
    if (error || !session || isTokenExpired(session.access_token)) {
      console.log('Token expired or invalid, refreshing...');
      const { data: refreshedSession } = await supabase.auth.refreshSession();
      
      if (refreshedSession?.session?.access_token) {
        return {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${refreshedSession.session.access_token}`
        };
      }
    }
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Only add auth header if we have a valid session
    if (session?.access_token && !isTokenExpired(session.access_token)) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    
    return headers;
  } catch (error) {
    console.warn('Auth header generation failed, using anon key:', error);
    return { "Content-Type": "application/json" };
  }
}

// Helper to check if token is expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers = await getAuthHeaders();
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers = await getAuthHeaders();
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
