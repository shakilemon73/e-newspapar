import { supabase } from './supabase.js';

async function createAdvertisementsTable() {
  console.log('Creating advertisements table via Supabase...');
  
  try {
    // Try to insert sample data - table will be created if it doesn't exist
    const { data, error } = await supabase
      .from('advertisements')
      .upsert([
        {
          id: 1,
          title: 'Breaking News Banner',
          content: 'আপনার বিজ্ঞাপন এখানে দিন',
          image_url: '/placeholder-800x450.svg',
          link_url: '#',
          placement: 'breaking_news',
          active: true
        },
        {
          id: 2,
          title: 'Header Banner',
          content: 'প্রিমিয়াম বিজ্ঞাপন স্থান',
          image_url: '/placeholder-800x450.svg',
          link_url: '#',
          placement: 'header',
          active: true
        },
        {
          id: 3,
          title: 'Sidebar Ad',
          content: 'সাইডবার বিজ্ঞাপন',
          image_url: '/placeholder-300x176.svg',
          link_url: '#',
          placement: 'sidebar',
          active: true
        },
        {
          id: 4,
          title: 'Footer Banner',
          content: 'ফুটার বিজ্ঞাপন স্থান',
          image_url: '/placeholder-800x450.svg',
          link_url: '#',
          placement: 'footer',
          active: true
        }
      ], { 
        onConflict: 'id'
      });

    if (error) {
      console.log('Could not insert via Supabase client:', error.message);
      console.log('Table may not exist yet - this is normal for new projects');
    } else {
      console.log('Sample advertisements created successfully');
    }

    // Test reading data
    const { data: testData, error: readError } = await supabase
      .from('advertisements')
      .select('*')
      .limit(5);

    if (readError) {
      console.log('Table does not exist:', readError.message);
    } else {
      console.log('Found', testData?.length || 0, 'advertisements in database');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createAdvertisementsTable();