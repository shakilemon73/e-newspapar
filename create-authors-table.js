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

async function createAuthorsTable() {
  console.log('🔧 Creating authors table in Supabase...');

  try {
    // Create authors table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS authors (
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
    `;

    const { data: tableResult, error: tableError } = await adminSupabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (tableError) {
      console.log('❌ Table creation failed, trying direct approach...');
      // Try direct insert instead to test connection
      const testInsert = await adminSupabase
        .from('authors')
        .select('count(*)')
        .limit(1);
      
      if (testInsert.error && testInsert.error.code === 'PGRST116') {
        console.log('⚠️ Authors table does not exist. Creating via manual SQL...');
        
        // Use raw SQL approach
        const { data, error } = await adminSupabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE authors (
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
            
            CREATE INDEX idx_authors_slug ON authors(slug);
            CREATE INDEX idx_authors_is_active ON authors(is_active);
          `
        });
        
        if (error) {
          console.error('❌ Raw SQL creation failed:', error);
        } else {
          console.log('✅ Authors table created successfully via raw SQL');
        }
      }
    } else {
      console.log('✅ Authors table created successfully');
    }

    // Add author_id column to articles table
    console.log('🔧 Adding author_id column to articles table...');
    const { data: alterResult, error: alterError } = await adminSupabase.rpc('exec_sql', {
      sql: 'ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id INTEGER;'
    });

    if (alterError) {
      console.log('⚠️ Could not alter articles table:', alterError.message);
    } else {
      console.log('✅ Added author_id column to articles table');
    }

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
        console.log(`✅ Inserted/updated author: ${data.name} (ID: ${data.id})`);
      }
    }

    // Verify authors table
    console.log('🔍 Verifying authors table...');
    const { data: authors, error: verifyError } = await adminSupabase
      .from('authors')
      .select('*')
      .order('id');

    if (verifyError) {
      console.error('❌ Could not verify authors table:', verifyError.message);
    } else {
      console.log('✅ Authors table verified successfully:');
      authors.forEach(author => {
        console.log(`  - ${author.name} (${author.slug}) - Active: ${author.is_active}`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating authors table:', error);
  }
}

createAuthorsTable().then(() => {
  console.log('🎉 Authors table creation completed');
  process.exit(0);
}).catch(err => {
  console.error('💥 Process failed:', err);
  process.exit(1);
});