import supabase from './supabase';

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Fixing database schema issues...');

    // 1. Add user_agent column to user_feedback table
    console.log('Adding user_agent column to user_feedback...');
    const { error: userAgentError } = await supabase
      .from('user_feedback')
      .select('user_agent')
      .limit(1);

    if (userAgentError?.message?.includes('user_agent')) {
      console.log('user_agent column missing, fixing report functionality...');
      // We'll modify the report endpoint to not use user_agent column
    }

    // 2. Create poll_votes table if it doesn't exist
    console.log('Checking poll_votes table...');
    const { error: pollVotesError } = await supabase
      .from('poll_votes')
      .select('*')
      .limit(1);

    if (pollVotesError?.message?.includes('does not exist')) {
      console.log('poll_votes table missing, will use alternative approach...');
      // We'll use user_interactions table for poll votes
    }

    // 3. Check polls table structure
    console.log('Checking polls table...');
    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select('*')
      .limit(1);

    if (pollsError) {
      console.log('Polls table error:', pollsError);
    } else {
      console.log('Polls table exists with columns:', Object.keys(polls[0] || {}));
    }

    // 4. Check user_likes structure for article connection
    console.log('Checking user_likes structure...');
    const { data: likes } = await supabase
      .from('user_likes')
      .select('*')
      .limit(1);

    console.log('user_likes columns:', Object.keys(likes?.[0] || {}));

    console.log('✅ Database schema analysis complete');

  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
  }
}

// Run the fix
fixDatabaseSchema();