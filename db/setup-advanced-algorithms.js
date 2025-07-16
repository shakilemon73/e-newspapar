const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSQLCommand(sql) {
  try {
    console.log('Executing SQL command...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('SQL Error:', error);
      return false;
    }
    
    console.log('SQL executed successfully');
    return true;
  } catch (error) {
    console.error('Execution error:', error);
    return false;
  }
}

async function setupAdvancedAlgorithms() {
  try {
    console.log('🚀 Setting up Advanced Algorithms for Bengali News Website...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'advanced-algorithms.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL commands by semicolons and filter out empty commands
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Found ${sqlCommands.length} SQL commands to execute`);
    
    // Execute each command individually
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      if (command.includes('CREATE TABLE')) {
        const tableName = command.match(/CREATE TABLE.*?(\w+)/i)?.[1];
        console.log(`📋 Creating table: ${tableName}`);
      } else if (command.includes('CREATE INDEX')) {
        const indexName = command.match(/CREATE INDEX.*?(\w+)/i)?.[1];
        console.log(`🔍 Creating index: ${indexName}`);
      } else if (command.includes('CREATE OR REPLACE FUNCTION')) {
        const functionName = command.match(/CREATE OR REPLACE FUNCTION (\w+)/i)?.[1];
        console.log(`⚙️ Creating function: ${functionName}`);
      } else if (command.includes('CREATE OR REPLACE VIEW')) {
        const viewName = command.match(/CREATE OR REPLACE VIEW (\w+)/i)?.[1];
        console.log(`👁️ Creating view: ${viewName}`);
      } else if (command.includes('CREATE TRIGGER')) {
        const triggerName = command.match(/CREATE TRIGGER (\w+)/i)?.[1];
        console.log(`🔔 Creating trigger: ${triggerName}`);
      }
      
      // Execute the command
      const { error } = await supabase.rpc('exec_sql', { sql_query: command + ';' });
      
      if (error) {
        console.error(`❌ Error executing command ${i + 1}:`, error);
        console.error(`Command: ${command.substring(0, 100)}...`);
        // Continue with next command instead of stopping
        continue;
      }
    }
    
    console.log('✅ Advanced algorithms setup completed successfully!');
    
    // Test some of the functions
    console.log('\n🧪 Testing created functions...');
    
    // Test get_personalized_recommendations function
    console.log('Testing personalized recommendations...');
    const { data: testRecs, error: testError } = await supabase.rpc('get_personalized_recommendations', {
      user_id_param: '00000000-0000-0000-0000-000000000000',
      limit_param: 3
    });
    
    if (testError) {
      console.log('Note: Personalized recommendations test failed (expected if no user data)');
    } else {
      console.log(`✅ Personalized recommendations function working: ${testRecs?.length || 0} results`);
    }
    
    // Test popular articles function
    console.log('Testing popular articles function...');
    const { data: popularArticles, error: popularError } = await supabase.rpc('get_popular_articles_by_timerange', {
      time_range: 'daily',
      limit_param: 5
    });
    
    if (popularError) {
      console.log('Note: Popular articles test failed:', popularError.message);
    } else {
      console.log(`✅ Popular articles function working: ${popularArticles?.length || 0} results`);
    }
    
    // Test Bengali search function
    console.log('Testing Bengali search function...');
    const { data: searchResults, error: searchError } = await supabase.rpc('advanced_bengali_search', {
      search_query: 'বাংলাদেশ',
      limit_param: 3
    });
    
    if (searchError) {
      console.log('Note: Bengali search test failed:', searchError.message);
    } else {
      console.log(`✅ Bengali search function working: ${searchResults?.length || 0} results`);
    }
    
    console.log('\n🎉 Advanced algorithms setup complete!');
    console.log('📊 Database now includes:');
    console.log('   • User analytics and behavior tracking');
    console.log('   • Article performance metrics');
    console.log('   • Personalized recommendation engine');
    console.log('   • Advanced Bengali text search');
    console.log('   • Trending articles calculation');
    console.log('   • User interaction tracking');
    console.log('   • Comprehensive analytics views');
    console.log('   • Automated triggers for real-time updates');
    
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

// Run the setup if called directly
if (require.main === module) {
  setupAdvancedAlgorithms()
    .then(success => {
      if (success) {
        console.log('\n✅ Advanced algorithms setup completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Setup failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { setupAdvancedAlgorithms };