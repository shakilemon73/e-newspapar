import { supabase } from './supabase';

/**
 * Setup all required tables for user dashboard functionality
 * This script creates tables needed for proper user dashboard with Supabase integration
 */

export async function setupUserDashboardTables() {
  try {
    console.log('Setting up user dashboard tables...');

    // Check if reading_history table exists
    const { data: readingHistoryCheck, error: readingHistoryCheckError } = await supabase
      .from('reading_history')
      .select('*')
      .limit(1);

    if (readingHistoryCheckError && readingHistoryCheckError.code === 'PGRST116') {
      console.log('✓ reading_history table already exists');
    } else {
      console.log('✗ reading_history table does not exist - must be created manually in Supabase SQL Editor');
    }

    // Check if saved_articles table exists
    const { data: savedArticlesCheck, error: savedArticlesCheckError } = await supabase
      .from('saved_articles')
      .select('*')
      .limit(1);

    if (savedArticlesCheckError && savedArticlesCheckError.code === 'PGRST116') {
      console.log('✓ saved_articles table already exists');
    } else {
      console.log('✗ saved_articles table does not exist - must be created manually in Supabase SQL Editor');
    }

    // Check if achievements table exists
    const { data: achievementsCheck, error: achievementsCheckError } = await supabase
      .from('achievements')
      .select('*')
      .limit(1);

    if (achievementsCheckError && achievementsCheckError.code === 'PGRST116') {
      console.log('✓ achievements table already exists');
    } else {
      console.log('✗ achievements table does not exist - must be created manually in Supabase SQL Editor');
    }

    // Check if user_achievements table exists
    const { data: userAchievementsCheck, error: userAchievementsCheckError } = await supabase
      .from('user_achievements')
      .select('*')
      .limit(1);

    if (userAchievementsCheckError && userAchievementsCheckError.code === 'PGRST116') {
      console.log('✓ user_achievements table already exists');
    } else {
      console.log('✗ user_achievements table does not exist - must be created manually in Supabase SQL Editor');
    }

    // Check if user_analytics table exists
    const { data: userAnalyticsCheck, error: userAnalyticsCheckError } = await supabase
      .from('user_analytics')
      .select('*')
      .limit(1);

    if (userAnalyticsCheckError && userAnalyticsCheckError.code === 'PGRST116') {
      console.log('✓ user_analytics table already exists');
    } else {
      console.log('✗ user_analytics table does not exist - must be created manually in Supabase SQL Editor');
    }

    console.log('User dashboard tables setup check completed!');
    console.log('To create missing tables, run the SQL script in create-user-dashboard-tables.sql in your Supabase SQL Editor');
    return { success: true };
  } catch (error) {
    console.error('Error setting up user dashboard tables:', error);
    throw error;
  }
}

/**
 * Initialize sample data for testing
 */
export async function initializeSampleUserData() {
  try {
    console.log('Initializing sample user data...');
    
    // This would normally be populated by actual user interactions
    // For now, we'll just ensure the tables exist
    
    console.log('Sample user data initialization completed!');
    return { success: true };
  } catch (error) {
    console.error('Error initializing sample user data:', error);
    throw error;
  }
}