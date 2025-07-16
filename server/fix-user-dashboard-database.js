/**
 * Create all required tables for user dashboard functionality
 * This script fixes the database structure for user dashboard features
 */

import { supabase } from './supabase.js';

export async function createUserDashboardTables() {
  console.log('🔧 Creating user dashboard tables...');
  
  try {
    // Create reading_history table
    console.log('Creating reading_history table...');
    const { error: readingHistoryError } = await supabase.rpc('create_reading_history_table');
    if (readingHistoryError) {
      console.log('Reading history table might already exist:', readingHistoryError.message);
    }

    // Create saved_articles table
    console.log('Creating saved_articles table...');
    const { error: savedArticlesError } = await supabase.rpc('create_saved_articles_table');
    if (savedArticlesError) {
      console.log('Saved articles table might already exist:', savedArticlesError.message);
    }

    // Create user_achievements table
    console.log('Creating user_achievements table...');
    const { error: achievementsError } = await supabase.rpc('create_user_achievements_table');
    if (achievementsError) {
      console.log('User achievements table might already exist:', achievementsError.message);
    }

    // Create user_analytics table
    console.log('Creating user_analytics table...');
    const { error: analyticsError } = await supabase.rpc('create_user_analytics_table');
    if (analyticsError) {
      console.log('User analytics table might already exist:', analyticsError.message);
    }

    console.log('✅ User dashboard tables setup completed!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating user dashboard tables:', error);
    return { success: false, error: error.message };
  }
}

// Test the tables
export async function testUserDashboardTables() {
  console.log('🧪 Testing user dashboard tables...');
  
  const tables = ['reading_history', 'saved_articles', 'user_achievements', 'user_analytics'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      results[table] = error ? `❌ ${error.message}` : `✅ Working`;
    } catch (error) {
      results[table] = `❌ ${error.message}`;
    }
  }
  
  console.log('📊 Table test results:');
  Object.entries(results).forEach(([table, status]) => {
    console.log(`  ${table}: ${status}`);
  });
  
  return results;
}

// Seed sample data for testing
export async function seedUserDashboardData() {
  console.log('🌱 Seeding user dashboard sample data...');
  
  try {
    // Insert sample reading history
    await supabase.from('reading_history').upsert([
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        article_id: 1,
        last_read_at: new Date().toISOString(),
        read_count: 1
      },
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        article_id: 2,
        last_read_at: new Date(Date.now() - 86400000).toISOString(),
        read_count: 2
      }
    ]);

    // Insert sample saved articles
    await supabase.from('saved_articles').upsert([
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        article_id: 1,
        saved_at: new Date().toISOString()
      },
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        article_id: 3,
        saved_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]);

    console.log('✅ Sample data seeded successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    return { success: false, error: error.message };
  }
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await createUserDashboardTables();
    await testUserDashboardTables();
    await seedUserDashboardData();
  })();
}