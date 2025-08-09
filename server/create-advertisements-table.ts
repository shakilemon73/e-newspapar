import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createAdvertisementsTable() {
  console.log('Creating advertisements table...');
  
  try {
    await client.connect();

    // Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.advertisements (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        image_url VARCHAR(500),
        link_url VARCHAR(500),
        placement VARCHAR(100) DEFAULT 'banner',
        active BOOLEAN DEFAULT true,
        start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        end_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('Table created successfully');

    // Insert sample data
    await client.query(`
      INSERT INTO public.advertisements (title, content, image_url, link_url, placement, active) 
      VALUES 
        ('Breaking News Banner', 'আপনার বিজ্ঞাপন এখানে দিন', '/placeholder-800x450.svg', '#', 'breaking_news', true),
        ('Header Banner', 'প্রিমিয়াম বিজ্ঞাপন স্থান', '/placeholder-800x450.svg', '#', 'header', true),
        ('Sidebar Ad', 'সাইডবার বিজ্ঞাপন', '/placeholder-300x176.svg', '#', 'sidebar', true),
        ('Footer Banner', 'ফুটার বিজ্ঞাপন স্থান', '/placeholder-800x450.svg', '#', 'footer', true)
      ON CONFLICT DO NOTHING;
    `);
    console.log('Sample advertisements inserted');

    // Enable RLS
    await client.query(`
      ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Allow public read access to advertisements" ON public.advertisements;
      
      CREATE POLICY "Allow public read access to advertisements" 
      ON public.advertisements FOR SELECT 
      USING (active = true);
    `);
    console.log('RLS policies set up successfully');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

createAdvertisementsTable();