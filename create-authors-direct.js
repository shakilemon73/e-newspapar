import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAuthorsTableDirect() {
  console.log('🔧 Creating authors table directly in Supabase...');

  try {
    // Method 1: Try using SQL through Supabase edge functions
    console.log('📝 Attempting to create authors table via SQL...');
    
    // Use PostgreSQL connection to execute DDL
    const createSQL = `
      CREATE TABLE IF NOT EXISTS public.authors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        bio TEXT,
        avatar_url TEXT,
        social_links JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_authors_slug ON public.authors(slug);
      CREATE INDEX IF NOT EXISTS idx_authors_is_active ON public.authors(is_active);
      
      -- Add author_id to articles table
      ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES public.authors(id);
      CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
      
      -- Enable RLS
      ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
      
      -- Create RLS policies
      DROP POLICY IF EXISTS "Authors are viewable by everyone" ON public.authors;
      CREATE POLICY "Authors are viewable by everyone" ON public.authors
        FOR SELECT USING (is_active = true);
        
      DROP POLICY IF EXISTS "Service role can manage authors" ON public.authors;
      CREATE POLICY "Service role can manage authors" ON public.authors
        FOR ALL TO service_role USING (true);
    `;

    // Try multiple approaches to execute SQL
    let sqlExecuted = false;
    
    // Attempt 1: Try rpc call
    try {
      const { data, error } = await adminSupabase.rpc('exec_sql', {
        sql: createSQL
      });
      if (error) {
        console.log('⚠️ RPC exec_sql not available:', error.message);
      } else {
        console.log('✅ Table created via RPC');
        sqlExecuted = true;
      }
    } catch (e) {
      console.log('⚠️ RPC approach failed:', e.message);
    }
    
    // Attempt 2: Use pg client directly if available
    if (!sqlExecuted) {
      console.log('📝 Trying alternative database connection...');
      
      // Import pg for direct PostgreSQL connection
      try {
        const { Pool } = await import('pg');
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
        
        const client = await pool.connect();
        await client.query(createSQL);
        await client.release();
        await pool.end();
        
        console.log('✅ Table created via direct PostgreSQL connection');
        sqlExecuted = true;
      } catch (pgError) {
        console.log('⚠️ Direct PostgreSQL connection failed:', pgError.message);
      }
    }

    // Attempt 3: Manual table setup through individual operations
    if (!sqlExecuted) {
      console.log('📝 Creating table through individual operations...');
      
      // Just try to insert some test data to see if table exists
      const testData = {
        name: 'Test Author',
        slug: 'test-author-' + Date.now(),
        email: 'test@example.com',
        bio: 'Test bio',
        is_active: true
      };
      
      const { data, error } = await adminSupabase
        .from('authors')
        .insert(testData)
        .select()
        .single();
        
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log('❌ Authors table does not exist and cannot be created through API');
          console.log('🔧 Please create the authors table manually in Supabase dashboard using this SQL:');
          console.log('\n' + createSQL + '\n');
          return false;
        } else {
          console.log('⚠️ Unexpected error creating test author:', error.message);
        }
      } else {
        console.log('✅ Test author created, table exists:', data);
        // Clean up test data
        await adminSupabase.from('authors').delete().eq('id', data.id);
        sqlExecuted = true;
      }
    }

    if (sqlExecuted) {
      // Insert default authors
      console.log('🔧 Inserting default authors...');
      const defaultAuthors = [
        { name: 'Admin', slug: 'admin', email: 'admin@bengalinews.com', bio: 'Site Administrator', is_active: true },
        { name: 'সংবাদ সম্পাদক', slug: 'news-editor', email: 'editor@bengalinews.com', bio: 'প্রধান সংবাদ সম্পাদক', is_active: true },
        { name: 'প্রতিবেদক', slug: 'reporter', email: 'reporter@bengalinews.com', bio: 'সাধারণ প্রতিবেদক', is_active: true }
      ];

      for (const author of defaultAuthors) {
        const { data, error } = await adminSupabase
          .from('authors')
          .upsert(author, { onConflict: 'slug' })
          .select()
          .single();

        if (error) {
          console.log(`⚠️ Could not insert author ${author.name}:`, error.message);
        } else {
          console.log(`✅ Created author: ${data.name} (ID: ${data.id})`);
        }
      }

      // Verify the table
      const { data: authors, error: verifyError } = await adminSupabase
        .from('authors')
        .select('*')
        .order('id');

      if (verifyError) {
        console.error('❌ Could not verify authors table:', verifyError.message);
      } else {
        console.log('✅ Authors table verified successfully:');
        authors.forEach(author => {
          console.log(`  - ${author.name} (${author.slug})`);
        });
      }
    }

    return sqlExecuted;

  } catch (error) {
    console.error('❌ Error in authors table creation:', error);
    return false;
  }
}

createAuthorsTableDirect().then((success) => {
  if (success) {
    console.log('🎉 Authors table setup completed successfully');
  } else {
    console.log('⚠️ Authors table setup incomplete - may need manual creation');
  }
  process.exit(0);
}).catch(err => {
  console.error('💥 Process failed:', err);
  process.exit(1);
});