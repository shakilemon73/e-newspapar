import { supabase } from './supabase';

async function createSampleUserData() {
  try {
    console.log('Creating sample user data for dashboard testing...');

    // First, let's get the current user (if any)
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users.length} users in the system`);
    
    if (users.length === 0) {
      console.log('No users found. Please create a user account first through the registration page.');
      return;
    }

    // Use the first user for sample data
    const testUser = users[0];
    console.log(`Creating sample data for user: ${testUser.email}`);

    // Check if tables exist before inserting data
    const tables = ['user_bookmarks', 'reading_history', 'user_likes', 'article_comments'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        console.log(`Table ${table} might not exist or is not accessible:`, error.code);
        continue;
      }
      console.log(`✓ Table ${table} is accessible`);
    }

    // Get some article IDs to use for sample data
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title')
      .limit(5);

    if (!articles || articles.length === 0) {
      console.log('No articles found to create sample data with');
      return;
    }

    console.log(`Using articles:`, articles.map(a => `${a.id}: ${a.title}`));

    // Create sample bookmarks
    for (let i = 0; i < Math.min(3, articles.length); i++) {
      const { error } = await supabase
        .from('user_bookmarks')
        .upsert({
          user_id: testUser.id,
          article_id: articles[i].id,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,article_id'
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error(`Error creating bookmark for article ${articles[i].id}:`, error);
      } else {
        console.log(`✓ Created bookmark for article: ${articles[i].title}`);
      }
    }

    // Create sample reading history
    for (let i = 0; i < Math.min(4, articles.length); i++) {
      const { error } = await supabase
        .from('reading_history')
        .upsert({
          user_id: testUser.id,
          article_id: articles[i].id,
          last_read_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(), // Spread over days
          read_count: Math.floor(Math.random() * 5) + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,article_id'
        });

      if (error && error.code !== '23505') {
        console.error(`Error creating reading history for article ${articles[i].id}:`, error);
      } else {
        console.log(`✓ Created reading history for article: ${articles[i].title}`);
      }
    }

    // Create sample likes
    for (let i = 0; i < Math.min(2, articles.length); i++) {
      const { error } = await supabase
        .from('user_likes')
        .upsert({
          user_id: testUser.id,
          content_type: 'article',
          content_id: articles[i].id,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,content_type,content_id'
        });

      if (error && error.code !== '23505') {
        console.error(`Error creating like for article ${articles[i].id}:`, error);
      } else {
        console.log(`✓ Created like for article: ${articles[i].title}`);
      }
    }

    // Create sample comment
    const { error: commentError } = await supabase
      .from('article_comments')
      .insert({
        article_id: articles[0].id,
        user_id: testUser.id,
        content: 'চমৎকার নিবন্ধ! অনেক কিছু জানলাম।',
        is_approved: true,
        created_at: new Date().toISOString()
      });

    if (commentError && commentError.code !== '23505') {
      console.error('Error creating sample comment:', commentError);
    } else {
      console.log(`✓ Created sample comment for article: ${articles[0].title}`);
    }

    console.log('Sample user data creation completed successfully!');
    
    // Verify the data was created
    const { count: bookmarksCount } = await supabase
      .from('user_bookmarks')
      .select('*', { count: 'exact' })
      .eq('user_id', testUser.id);

    const { count: historyCount } = await supabase
      .from('reading_history')
      .select('*', { count: 'exact' })
      .eq('user_id', testUser.id);

    const { count: likesCount } = await supabase
      .from('user_likes')
      .select('*', { count: 'exact' })
      .eq('user_id', testUser.id);

    console.log(`\nVerification Results for ${testUser.email}:`);
    console.log(`- Bookmarks: ${bookmarksCount || 0}`);
    console.log(`- Reading History: ${historyCount || 0}`);
    console.log(`- Likes: ${likesCount || 0}`);

  } catch (error) {
    console.error('Error in createSampleUserData:', error);
  }
}

// Export for use in other files
export { createSampleUserData };

// Run the function
createSampleUserData();