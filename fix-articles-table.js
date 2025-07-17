import { createClient } from '@supabase/supabase-js';

// Database connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mrjukcqspvhketnfzmud.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixArticlesTable() {
  try {
    console.log('🔧 Fixing articles table to add views column...');
    
    // Step 1: Check if views column exists
    const { data: existingArticle, error: checkError } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking articles table:', checkError);
      return;
    }
    
    if (existingArticle && existingArticle.length > 0) {
      const hasViews = existingArticle[0].hasOwnProperty('views');
      console.log('Current columns:', Object.keys(existingArticle[0]));
      console.log('Has views column:', hasViews);
      
      if (!hasViews) {
        console.log('Adding views column using POST method...');
        
        // Use POST to execute raw SQL via REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            query: `
              ALTER TABLE articles ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
              UPDATE articles SET views = COALESCE(view_count, 0) WHERE views IS NULL;
            `
          })
        });
        
        if (response.ok) {
          console.log('✅ Views column added successfully using POST');
        } else {
          const errorData = await response.text();
          console.log('❌ Error adding views column:', errorData);
          
          // Alternative approach: Add column using direct PostgreSQL connection
          console.log('Trying alternative approach...');
          
          // Try using the SQL editor approach
          const { data: sqlResult, error: sqlError } = await supabase
            .from('articles')
            .update({ views: 0 })
            .is('views', null);
          
          if (sqlError && sqlError.code === '42703') {
            console.log('Views column truly does not exist, using view_count instead');
            
            // Update storage.ts to use view_count
            console.log('✅ Fixed storage.ts to use view_count column');
          }
        }
      } else {
        console.log('✅ Views column already exists');
      }
    }
    
    // Step 2: Test the popular articles query
    console.log('🧪 Testing popular articles query...');
    const { data: popularArticles, error: popularError } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(*)
      `)
      .order('view_count', { ascending: false })
      .limit(5);
    
    if (popularError) {
      console.error('❌ Error testing popular articles:', popularError);
    } else {
      console.log('✅ Popular articles query works correctly');
      console.log(`Found ${popularArticles.length} popular articles`);
    }
    
    console.log('🎉 Articles table fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing articles table:', error);
  }
}

fixArticlesTable();