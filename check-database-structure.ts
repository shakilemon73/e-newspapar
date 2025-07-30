// Check actual database structure and fix the missing columns
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking actual database structure...');
    
    // Get first article to see what columns exist
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error fetching articles:', error);
      return;
    }
    
    if (articles && articles.length > 0) {
      console.log('✅ Found articles table with columns:');
      const columns = Object.keys(articles[0]);
      columns.forEach(col => console.log(`  - ${col}: ${typeof articles[0][col]}`));
      
      // Check if we need to add status column
      if (!columns.includes('status')) {
        console.log('\n❌ Missing "status" column');
        console.log('🔧 Adding status column using raw SQL...');
        
        // Try to add the column using direct query
        const addColumnSql = `
          ALTER TABLE articles 
          ADD COLUMN status VARCHAR(20) DEFAULT 'published' 
          CHECK (status IN ('draft', 'published', 'review', 'scheduled'));
        `;
        
        console.log('SQL to execute:', addColumnSql);
        
        // Instead of executing directly, let's create the column using Supabase's approach
        console.log('✅ Next step: Execute this SQL in Supabase dashboard or create migration');
        
        return { 
          needsColumn: true, 
          currentColumns: columns,
          sql: addColumnSql,
          sampleData: articles[0]
        };
      } else {
        console.log('✅ Status column already exists');
        return { 
          needsColumn: false, 
          currentColumns: columns,
          sampleData: articles[0] 
        };
      }
    } else {
      console.log('❌ No articles found in database');
      return { empty: true };
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    return { error };
  }
}

checkDatabaseStructure().then(result => {
  console.log('\n🏁 Database check result:', JSON.stringify(result, null, 2));
});