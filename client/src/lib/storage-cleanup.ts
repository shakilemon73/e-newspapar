/**
 * Storage cleanup utility to fix JSON parsing errors
 * This addresses the "SyntaxError: [object Object] is not valid JSON" errors
 * that can occur with corrupted localStorage/sessionStorage entries
 */

export function cleanupCorruptedStorage() {
  console.log('🧹 Starting storage cleanup...');
  
  const keysToCheck = [
    // Supabase auth tokens
    'supabase.auth.token',
    'sb-auth-token',
    // Common localStorage keys that might get corrupted
    'userSettings',
    'theme',
    'language',
    // Check all keys starting with 'sb-' (Supabase related)
    ...Object.keys(localStorage).filter(key => key.startsWith('sb-'))
  ];

  let cleanedCount = 0;

  keysToCheck.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value && value !== 'null' && value !== 'undefined') {
        // Try to parse the JSON
        JSON.parse(value);
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