/**
 * App initialization scripts for fixing localStorage JSON parse errors
 * and migrating data to Supabase storage
 */

import { cleanupCorruptedStorage } from './storage-cleanup';
import { migrateLocalStorageToSupabase } from './supabase-storage';

/**
 * Initialize app with enhanced storage cleanup and migration
 */
export async function initializeApp(): Promise<void> {
  try {
    console.log('🚀 Initializing enhanced app storage system...');

    // Step 1: Clean up corrupted localStorage immediately
    cleanupCorruptedStorage();

    // Step 2: Wait for auth to be potentially ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Try to migrate localStorage to Supabase
    try {
      await migrateLocalStorageToSupabase();
    } catch (error) {
      console.warn('Storage migration failed (this is normal if user not logged in):', error);
    }

    console.log('✅ App initialization completed');
  } catch (error) {
    console.error('App initialization failed:', error);
  }
}

/**
 * Fix localStorage JSON parse errors that cause "[object Object]" errors
 */
export function fixLocalStorageErrors(): void {
  // Monitor for storage events and clean them up
  window.addEventListener('storage', (event) => {
    if (event.newValue === '[object Object]' || event.newValue?.startsWith('[object ')) {
      console.warn(`🗑️ Cleaning up invalid storage value for key: ${event.key}`);
      try {
        localStorage.removeItem(event.key || '');
      } catch (error) {
        console.error('Failed to clean up storage key:', error);
      }
    }
  });

  // Set up periodic cleanup every 30 seconds
  setInterval(() => {
    cleanupCorruptedStorage();
  }, 30000);
}

// Auto-initialize when module is imported
initializeApp();
fixLocalStorageErrors();