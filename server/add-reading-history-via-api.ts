import { supabase } from './supabase';

async function addReadingHistoryData() {
  try {
    console.log('Adding reading history data directly...');

    // Get the first user
    const { data: { users } } = await supabase.auth.admin.listUsers();
    if (users.length === 0) {
      console.log('No users found');
      return;
    }

    const testUser = users[0];
    console.log(`Adding reading history for: ${testUser.email}`);

    // Get articles
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title')
      .limit(5);

    if (!articles || articles.length === 0) {
      console.log('No articles found');
      return;
    }

    // Since the reading_history table doesn't exist, let's use user_reading_history instead
    // First check if user_reading_history table exists
    const { data: existingHistory } = await supabase
      .from('user_reading_history')
      .select('*')
      .limit(1);

    if (existingHistory !== null) {
      console.log('✅ user_reading_history table exists, using it instead');
      
      // Create sample reading history in user_reading_history
      for (let i = 0; i < Math.min(4, articles.length); i++) {
        const { error } = await supabase
          .from('user_reading_history')
          .upsert({
            user_id: testUser.id,
            article_id: articles[i].id,
            read_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
            reading_time: Math.floor(Math.random() * 300) + 60,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,article_id'
          });

        if (error && error.code !== '23505') {
          console.error(`Error creating reading history for article ${articles[i].id}:`, error);
        } else {
          console.log(`✅ Created reading history for: ${articles[i].title}`);
        }
      }

      // Verify
      const { count } = await supabase
        .from('user_reading_history')
        .select('*', { count: 'exact' })
        .eq('user_id', testUser.id);

      console.log(`\n📊 Created ${count || 0} reading history entries in user_reading_history table`);
    } else {
      console.log('❌ user_reading_history table does not exist either');
    }

  } catch (error) {
    console.error('Error in addReadingHistoryData:', error);
  }
}

addReadingHistoryData();