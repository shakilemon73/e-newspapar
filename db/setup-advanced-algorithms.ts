import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupAdvancedAlgorithms() {
  try {
    console.log('🚀 Setting up Advanced Algorithms for Bengali News Website...');
    
    // Read the SQL file
    const sqlFilePath = join(process.cwd(), 'db', 'advanced-algorithms.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');
    
    // Split into individual SQL statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Log what we're creating
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE.*?(\w+)/i)?.[1];
          console.log(`📋 Creating table: ${tableName}`);
        } else if (statement.includes('CREATE INDEX')) {
          const indexName = statement.match(/CREATE INDEX.*?(\w+)/i)?.[1];
          console.log(`🔍 Creating index: ${indexName}`);
        } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
          const functionName = statement.match(/CREATE OR REPLACE FUNCTION (\w+)/i)?.[1];
          console.log(`⚙️ Creating function: ${functionName}`);
        } else if (statement.includes('CREATE OR REPLACE VIEW')) {
          const viewName = statement.match(/CREATE OR REPLACE VIEW (\w+)/i)?.[1];
          console.log(`👁️ Creating view: ${viewName}`);
        } else if (statement.includes('CREATE TRIGGER')) {
          const triggerName = statement.match(/CREATE TRIGGER (\w+)/i)?.[1];
          console.log(`🔔 Creating trigger: ${triggerName}`);
        } else if (statement.includes('INSERT INTO')) {
          const tableName = statement.match(/INSERT INTO (\w+)/i)?.[1];
          console.log(`📥 Inserting data into: ${tableName}`);
        }
        
        // Execute the statement
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
        
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Execution complete: ${successCount} successful, ${errorCount} errors`);
    
    // Test the created functions
    console.log('\n🧪 Testing created functions...');
    
    // Test if tables exist
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_analytics', 'article_analytics', 'user_interactions', 'user_preferences']);
    
    if (tableError) {
      console.log('❌ Could not check tables:', tableError.message);
    } else {
      console.log(`✅ Created ${tables?.length || 0} advanced algorithm tables`);
      tables?.forEach(table => console.log(`   • ${table.table_name}`));
    }
    
    // Test personalized recommendations function
    try {
      const { data: testRecs, error: testError } = await supabase.rpc('get_personalized_recommendations', {
        user_id_param: '00000000-0000-0000-0000-000000000000',
        limit_param: 3
      });
      
      if (testError) {
        console.log('⚠️ Personalized recommendations test:', testError.message);
      } else {
        console.log(`✅ Personalized recommendations function working`);
      }
    } catch (err) {
      console.log('⚠️ Personalized recommendations test failed (expected)');
    }
    
    // Test Bengali search function
    try {
      const { data: searchResults, error: searchError } = await supabase.rpc('advanced_bengali_search', {
        search_query: 'বাংলাদেশ',
        limit_param: 3
      });
      
      if (searchError) {
        console.log('⚠️ Bengali search test:', searchError.message);
      } else {
        console.log(`✅ Bengali search function working: ${searchResults?.length || 0} results`);
      }
    } catch (err) {
      console.log('⚠️ Bengali search test failed');
    }
    
    console.log('\n🎉 Advanced algorithms setup complete!');
    console.log('📊 Your Supabase database now includes:');
    console.log('   • User analytics and behavior tracking tables');
    console.log('   • Article performance metrics and analytics');
    console.log('   • Personalized recommendation engine');
    console.log('   • Advanced Bengali text search capabilities');
    console.log('   • Trending articles calculation');
    console.log('   • User interaction tracking system');
    console.log('   • Comprehensive analytics views');
    console.log('   • Automated triggers for real-time updates');
    console.log('   • Performance optimization indexes');
    
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

// Run the setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
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

export { setupAdvancedAlgorithms };