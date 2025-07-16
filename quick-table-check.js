/**
 * Quick Supabase Table Verification
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function quickCheck() {
  console.log('🔍 QUICK TABLE VERIFICATION');
  console.log('===========================\n');
  
  // Core tables check
  console.log('📋 CORE TABLES:');
  const coreTables = ['categories', 'articles', 'weather', 'breaking_news', 'epapers', 'video_content', 'audio_articles', 'social_media_posts'];
  
  let coreWorking = 0;
  for (const table of coreTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        console.log(`✅ ${table} - Working`);
        coreWorking++;
      } else {
        console.log(`❌ ${table} - Error: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${table} - Failed: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Core Tables: ${coreWorking}/${coreTables.length} working\n`);
  
  // Advanced tables check
  console.log('🚀 ADVANCED TABLES:');
  const advancedTables = ['user_notifications', 'user_sessions', 'user_feedback', 'reading_goals', 'performance_metrics', 'article_comments', 'user_follows', 'community_posts'];
  
  let advancedWorking = 0;
  for (const table of advancedTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        console.log(`✅ ${table} - Working`);
        advancedWorking++;
      } else {
        console.log(`❌ ${table} - Error: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${table} - Failed: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Advanced Tables: ${advancedWorking}/${advancedTables.length} working\n`);
  
  // API endpoint check
  console.log('🌐 API ENDPOINTS:');
  const apiEndpoints = [
    '/api/categories',
    '/api/articles',
    '/api/articles/popular',
    '/api/weather',
    '/api/breaking-news',
    '/api/epapers',
    '/api/videos',
    '/api/audio-articles',
    '/api/social-media'
  ];
  
  let apiWorking = 0;
  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`);
      if (response.ok) {
        console.log(`✅ ${endpoint} - Working`);
        apiWorking++;
      } else {
        console.log(`❌ ${endpoint} - Status: ${response.status}`);
      }
    } catch (err) {
      console.log(`❌ ${endpoint} - Failed: ${err.message}`);
    }
  }
  
  console.log(`\n📊 API Endpoints: ${apiWorking}/${apiEndpoints.length} working\n`);
  
  // Summary
  const totalWorking = coreWorking + advancedWorking + apiWorking;
  const totalPossible = coreTables.length + advancedTables.length + apiEndpoints.length;
  const percentage = Math.round((totalWorking / totalPossible) * 100);
  
  console.log('===========================');
  console.log('📋 VERIFICATION SUMMARY');
  console.log('===========================');
  console.log(`✅ Core Tables: ${coreWorking}/${coreTables.length}`);
  console.log(`🚀 Advanced Tables: ${advancedWorking}/${advancedTables.length}`);
  console.log(`🌐 API Endpoints: ${apiWorking}/${apiEndpoints.length}`);
  console.log(`\n🏆 OVERALL: ${totalWorking}/${totalPossible} (${percentage}%)`);
  
  if (percentage >= 95) {
    console.log('🎉 EXCELLENT! Website fully operational!');
  } else if (percentage >= 80) {
    console.log('👍 GOOD! Most features working.');
  } else {
    console.log('⚠️ ISSUES! Some systems need attention.');
  }
  
  return {
    coreWorking,
    advancedWorking,
    apiWorking,
    totalWorking,
    totalPossible,
    percentage
  };
}

quickCheck()
  .then(result => {
    console.log(`\n✅ Verification completed: ${result.percentage}% operational`);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
  });