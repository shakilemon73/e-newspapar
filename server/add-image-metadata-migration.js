import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔧 Running image metadata migration...');
    
    // Add image_metadata column
    const { error: alterError } = await supabase.rpc('sql', {
      query: `
        ALTER TABLE articles 
        ADD COLUMN IF NOT EXISTS image_metadata JSONB;
        
        CREATE INDEX IF NOT EXISTS idx_articles_image_metadata 
        ON articles USING GIN (image_metadata);
      `
    });

    if (alterError) {
      console.error('Error adding column:', alterError);
    } else {
      console.log('✅ Added image_metadata column');
    }

    // Update existing articles with sample metadata
    const { data: existingArticles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, image_url, published_at')
      .not('image_url', 'is', null)
      .neq('image_url', '');

    if (fetchError) {
      console.error('Error fetching articles:', fetchError);
      return;
    }

    console.log(`Found ${existingArticles.length} articles with images`);

    // Update articles with sample metadata
    for (const article of existingArticles) {
      const metadata = {
        caption: article.title,
        place: 'ঢাকা, বাংলাদেশ',
        date: article.published_at?.split('T')[0] || '2024-01-01',
        photographer: 'স্টাফ রিপোর্টার',
        id: `IMG-${String(article.id).padStart(4, '0')}`
      };

      const { error: updateError } = await supabase
        .from('articles')
        .update({ image_metadata: metadata })
        .eq('id', article.id);

      if (updateError) {
        console.error(`Error updating article ${article.id}:`, updateError);
      } else {
        console.log(`✅ Updated article ${article.id} with metadata`);
      }
    }

    // Test the updated structure
    const { data: testArticle, error: testError } = await supabase
      .from('articles')
      .select('id, title, image_url, image_metadata')
      .not('image_metadata', 'is', null)
      .limit(1)
      .single();

    if (testError) {
      console.error('Test fetch error:', testError);
    } else {
      console.log('✅ Migration completed! Sample article:', testArticle);
    }

  } catch (error) {
    console.error('Migration error:', error);
  }
}

runMigration();