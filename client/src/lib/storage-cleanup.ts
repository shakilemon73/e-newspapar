/**
 * ENHANCED Storage cleanup utility to fix JSON parsing errors
 * This addresses the "SyntaxError: [object Object] is not valid JSON" errors
 * that can occur with corrupted localStorage/sessionStorage entries
 */

export function cleanupCorruptedStorage() {
  console.log('🧹 Starting enhanced storage cleanup...');
  
  const keysToCheck = [
    // Supabase auth tokens
    'supabase.auth.token',
    'sb-auth-token',
    // Common localStorage keys that might get corrupted
    'userSettings',
    'theme',
    'language',
    'article-theme',
    'user-preferences',
    'site-settings',
    // Check all keys starting with 'sb-' (Supabase related)
    ...Object.keys(localStorage).filter(key => key.startsWith('sb-')),
    // Check all existing keys
    ...Object.keys(localStorage)
  ];

  let cleanedCount = 0;

  // Remove duplicates from keysToCheck - Fix TypeScript Set iteration issue
  const uniqueKeys = Array.from(new Set(keysToCheck));

  uniqueKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value && value !== 'null' && value !== 'undefined') {
        // Check if it's an object that was stored incorrectly
        if (value === '[object Object]' || value.startsWith('[object ')) {
          console.warn(`🗑️ Removing invalid object localStorage key: ${key}`);
          localStorage.removeItem(key);
          cleanedCount++;
          return;
        }
        
        // Only try to parse if it looks like JSON
        if (value.startsWith('{') || value.startsWith('[') || value.startsWith('"')) {
          JSON.parse(value);
        }
      }
    } catch (error) {
      console.warn(`🗑️ Removing corrupted localStorage key: ${key}`, error);
      try {
        localStorage.removeItem(key);
        cleanedCount++;
      } catch (removeError) {
        console.error(`Failed to remove corrupted key ${key}:`, removeError);
      }
    }
  });

  // Also check sessionStorage
  const sessionKeysToCheck = [
    ...Object.keys(sessionStorage).filter(key => 
      key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')
    )
  ];

  sessionKeysToCheck.forEach(key => {
    try {
      const value = sessionStorage.getItem(key);
      if (value && value !== 'null' && value !== 'undefined') {
        JSON.parse(value);
      }
    } catch (error) {
      console.warn(`🗑️ Removing corrupted sessionStorage key: ${key}`, error);
      try {
        sessionStorage.removeItem(key);
        cleanedCount++;
      } catch (removeError) {
        console.error(`Failed to remove corrupted session key ${key}:`, removeError);
      }
    }
  });

  if (cleanedCount > 0) {
    console.log(`✅ Cleaned up ${cleanedCount} corrupted storage entries`);
  } else {
    console.log('✅ No corrupted storage entries found');
  }

  return cleanedCount;
}

/**
 * Safe JSON parse that doesn't throw errors
 */
export function safeJSONParse<T = any>(str: string | null): T | null {
  if (!str || str === 'null' || str === 'undefined') {
    return null;
  }
  
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('Failed to parse JSON:', str, error);
    return null;
  }
}

/**
 * Safe localStorage getter with JSON parsing
 */
export function safeLocalStorageGet<T = any>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return safeJSONParse<T>(value);
  } catch (error) {
    console.warn(`Failed to get localStorage key ${key}:`, error);
    return null;
  }
}

/**
 * Safe localStorage setter with JSON stringification
 */
export function safeLocalStorageSet(key: string, value: any): boolean {
  try {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.warn(`Failed to set localStorage key ${key}:`, error);
    return false;
  }
}