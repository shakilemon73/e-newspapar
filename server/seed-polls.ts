import { supabase } from './supabase';

export async function seedPolls() {
  console.log('🌱 Seeding polls...');

  const polls = [
    {
      title: 'বাংলাদেশের সবচেয়ে জনপ্রিয় খেলা কোনটি?',
      options: ['ক্রিকেট', 'ফুটবল', 'ব্যাডমিন্টন', 'কাবাডি'],
      total_votes: 1247,
      created_at: new Date().toISOString()
    },
    {
      title: 'শিক্ষার্থীদের জন্য সবচেয়ে গুরুত্বপূর্ণ বিষয় কোনটি?',
      options: ['প্রযুক্তিগত দক্ষতা', 'ভাষা শিক্ষা', 'গণিত ও বিজ্ঞান', 'সাংস্কৃতিক শিক্ষা'],
      total_votes: 892,
      created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
    },
    {
      title: 'পরিবেশ রক্ষায় সবচেয়ে জরুরি কাজ কোনটি?',
      options: ['বৃক্ষরোপণ', 'পলিথিন নিষিদ্ধকরণ', 'নদী দূষণ বন্ধ', 'বায়ু দূষণ কমানো'],
      total_votes: 1534,
      created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
    }
  ];

  try {
    // Clear existing data
    await supabase.from('polls').delete().neq('id', 0);
    
    const { data, error } = await supabase
      .from('polls')
      .insert(polls)
      .select();

    if (error) {
      console.error('Error seeding polls:', error);
      return { success: false, error };
    }

    console.log('✅ Successfully seeded', data?.length || 0, 'polls');
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Error in seedPolls:', error);
    return { success: false, error };
  }
}