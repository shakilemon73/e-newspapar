import { supabase } from './supabase';

export async function seedVideoContent() {
  console.log('🌱 Seeding video content...');

  const videoContent = [
    {
      title: 'বাংলাদেশের অর্থনৈতিক অগ্রগতি - ২০২৫',
      slug: 'bangladesh-economic-progress-2025',
      description: 'বাংলাদেশের সাম্প্রতিক অর্থনৈতিক অর্জন এবং ভবিষ্যৎ পরিকল্পনা নিয়ে বিস্তারিত আলোচনা।',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail_url: '/api/placeholder/400/225',
      duration: '12:45',
      published_at: new Date().toISOString()
    },
    {
      title: 'শিক্ষা ব্যবস্থায় ডিজিটাল রূপান্তর',
      slug: 'education-digital-transformation',
      description: 'বাংলাদেশের শিক্ষা ব্যবস্থায় ডিজিটাল প্রযুক্তির ব্যবহার এবং এর প্রভাব।',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail_url: '/api/placeholder/400/225',
      duration: '8:30',
      published_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
    },
    {
      title: 'বাংলাদেশ ক্রিকেট দলের নতুন কৌশল',
      slug: 'bangladesh-cricket-new-strategy',
      description: 'আসন্ন বিশ্বকাপের জন্য বাংলাদেশ ক্রিকেট দলের প্রস্তুতি এবং নতুন খেলোয়াড়দের পরিচিতি।',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail_url: '/api/placeholder/400/225',
      duration: '15:20',
      published_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
    },
    {
      title: 'পরিবেশ সংরক্ষণে বাংলাদেশের উদ্যোগ',
      slug: 'bangladesh-environment-conservation',
      description: 'জলবায়ু পরিবর্তনের মোকাবিলায় বাংলাদেশের গৃহীত পদক্ষেপ এবং ভবিষ্যৎ পরিকল্পনা।',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail_url: '/api/placeholder/400/225',
      duration: '11:15',
      published_at: new Date(Date.now() - 3*24*60*60*1000).toISOString()
    },
    {
      title: 'বাংলাদেশের সাংস্কৃতিক ঐতিহ্য',
      slug: 'bangladesh-cultural-heritage',
      description: 'বাংলাদেশের সমৃদ্ধ সাংস্কৃতিক ঐতিহ্য এবং আধুনিক যুগে এর সংরক্ষণের প্রয়োজনীয়তা।',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail_url: '/api/placeholder/400/225',
      duration: '20:30',
      published_at: new Date(Date.now() - 4*24*60*60*1000).toISOString()
    }
  ];

  try {
    // Clear existing data
    await supabase.from('video_content').delete().neq('id', 0);
    
    const { data, error } = await supabase
      .from('video_content')
      .insert(videoContent)
      .select();

    if (error) {
      console.error('Error seeding video content:', error);
      return { success: false, error };
    }

    console.log('✅ Successfully seeded', data?.length || 0, 'video content items');
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Error in seedVideoContent:', error);
    return { success: false, error };
  }
}