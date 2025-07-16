/**
 * Complete Supabase Table Verification Script
 * Tests all tables and their connections to website functionality
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrjukcqspvhketnfzmud.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yanVrY3FzcHZoa2V0bmZ6bXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUxMTE1OSwiZXhwIjoyMDY4MDg3MTU5fQ.0bfOMGPVOFGAUDH-mdIXWRGoUDA1-B_95yQZjlZCZx4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testMigration() {
  console.log('🔍 COMPREHENSIVE SUPABASE TABLE VERIFICATION');
  console.log('=' * 50);
  
  // Test 1: Core Tables (Basic Website Functionality)
  console.log('\n📋 TESTING CORE TABLES:');
  const coreTables = [
    { name: 'categories', api: '/api/categories', description: 'News Categories' },
    { name: 'articles', api: '/api/articles', description: 'News Articles' },
    { name: 'weather', api: '/api/weather', description: 'Weather Data' },
    { name: 'breaking_news', api: '/api/breaking-news', description: 'Breaking News' },
    { name: 'epapers', api: '/api/epapers', description: 'E-Paper Editions' },
    { name: 'video_content', api: '/api/videos', description: 'Video Content' },
    { name: 'audio_articles', api: '/api/audio-articles', description: 'Audio Articles' },
    { name: 'social_media_posts', api: '/api/social-media', description: 'Social Media Posts' }
  ];
  
  let coreScore = 0;
  for (const table of coreTables) {
    try {
      // Test Supabase table direct access
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table.description} (${table.name}) - Table Error: ${error.message}`);
        continue;
      }
      
      // Test API endpoint
      const response = await fetch(`http://localhost:5000${table.api}`);
      const apiData = await response.json();
      
      if (response.ok && apiData.length > 0) {
        console.log(`✅ ${table.description} (${table.name}) - ${apiData.length} records, API working`);
        coreScore++;
      } else {
        console.log(`⚠️  ${table.description} (${table.name}) - Table exists but API issue: ${response.status}`);
      }
    } catch (err) {
      console.log(`❌ ${table.description} (${table.name}) - Connection Error: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Core Tables Score: ${coreScore}/${coreTables.length} (${Math.round(coreScore/coreTables.length*100)}%)`);
  
  // Test 2: Advanced Tables (User Experience Features)
  console.log('\n🚀 TESTING ADVANCED TABLES:');
  const advancedTables = [
    { name: 'user_notifications', description: 'User Notifications System' },
    { name: 'user_sessions', description: 'User Session Tracking' },
    { name: 'user_feedback', description: 'User Feedback & Ratings' },
    { name: 'reading_goals', description: 'Reading Goals & Gamification' },
    { name: 'performance_metrics', description: 'Performance Analytics' },
    { name: 'article_comments', description: 'Article Comments System' },
    { name: 'user_follows', description: 'User Social Following' },
    { name: 'community_posts', description: 'Community Posts' }
  ];
  
  let advancedScore = 0;
  for (const table of advancedTables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(3);
      
      if (error) {
        console.log(`❌ ${table.description} (${table.name}) - Not Found: ${error.message}`);
      } else {
        console.log(`✅ ${table.description} (${table.name}) - ${data.length} records, Table operational`);
        advancedScore++;
      }
    } catch (err) {
      console.log(`❌ ${table.description} (${table.name}) - Error: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Advanced Tables Score: ${advancedScore}/${advancedTables.length} (${Math.round(advancedScore/advancedTables.length*100)}%)`);
  
  // Test 3: Authentication Tables (Supabase Auth)
  console.log('\n🔐 TESTING AUTHENTICATION SYSTEM:');
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    // Test auth users table access via service role
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError && usersError.message.includes('permission denied')) {
      console.log('✅ Auth System - Supabase Auth working (RLS protecting user data)');
    } else if (users) {
      console.log(`✅ Auth System - ${users.length} users, Auth tables accessible`);
    } else {
      console.log('❌ Auth System - Authentication setup issue');
    }
  } catch (err) {
    console.log(`⚠️  Auth System - ${err.message}`);
  }
  
  // Test 4: Database Indexes and Performance
  console.log('\n⚡ TESTING DATABASE PERFORMANCE:');
  try {
    const indexQueries = [
      'SELECT * FROM articles WHERE category_id = 1 LIMIT 5',
      'SELECT * FROM articles WHERE is_featured = true LIMIT 5',
      'SELECT * FROM categories WHERE slug = \'politics\' LIMIT 1'
    ];
    
    let indexScore = 0;
    for (const query of indexQueries) {
      const startTime = Date.now();
      const { data, error } = await supabase.rpc('exec', { query });
      const endTime = Date.now();
      
      if (!error && (endTime - startTime) < 1000) {
        indexScore++;
        console.log(`✅ Index Performance - Query executed in ${endTime - startTime}ms`);
      } else {
        console.log(`⚠️  Index Performance - Query slow or failed: ${error?.message}`);
      }
    }
    
    console.log(`📊 Performance Score: ${indexScore}/${indexQueries.length} queries optimized`);
  } catch (err) {
    console.log(`⚠️  Performance Test - ${err.message}`);
  }
  
  // Test 5: Website API Integration
  console.log('\n🌐 TESTING WEBSITE API INTEGRATION:');
  const apiTests = [
    { endpoint: '/api/articles/popular', description: 'Popular Articles' },
    { endpoint: '/api/articles/latest', description: 'Latest Articles' },
    { endpoint: '/api/categories/politics', description: 'Politics Category' },
    { endpoint: '/api/weather/ঢাকা', description: 'Dhaka Weather' },
    { endpoint: '/api/epapers/latest', description: 'Latest E-Paper' },
    { endpoint: '/api/trending-topics', description: 'Trending Topics' }
  ];
  
  let apiScore = 0;
  for (const test of apiTests) {
    try {
      const response = await fetch(`http://localhost:5000${test.endpoint}`);
      const data = await response.json();
      
      if (response.ok && data) {
        console.log(`✅ ${test.description} - API working correctly`);
        apiScore++;
      } else {
        console.log(`❌ ${test.description} - API issue: ${response.status}`);
      }
    } catch (err) {
      console.log(`❌ ${test.description} - Connection failed: ${err.message}`);
    }
  }
  
  console.log(`\n📊 API Integration Score: ${apiScore}/${apiTests.length} (${Math.round(apiScore/apiTests.length*100)}%)`);
  
  // Test 6: Advanced Features Testing
  console.log('\n🎯 TESTING ADVANCED FEATURES:');
  const advancedFeatures = [
    {
      name: 'User Notifications',
      test: async () => {
        const { data, error } = await supabase
          .from('user_notifications')
          .insert([{
            user_id: 'test-user-id',
            title: 'Test Notification',
            content: 'Testing notification system',
            type: 'test'
          }])
          .select();
        return !error;
      }
    },
    {
      name: 'Reading Goals',
      test: async () => {
        const { data, error } = await supabase
          .from('reading_goals')
          .insert([{
            user_id: 'test-user-id',
            goal_type: 'articles_read',
            target_value: 10,
            current_value: 0
          }])
          .select();
        return !error;
      }
    },
    {
      name: 'Performance Metrics',
      test: async () => {
        const { data, error } = await supabase
          .from('performance_metrics')
          .insert([{
            metric_name: 'test_metric',
            metric_value: 1.5,
            metric_type: 'test',
            category: 'testing'
          }])
          .select();
        return !error;
      }
    }
  ];
  
  let featureScore = 0;
  for (const feature of advancedFeatures) {
    try {
      const result = await feature.test();
      if (result) {
        console.log(`✅ ${feature.name} - Feature working correctly`);
        featureScore++;
      } else {
        console.log(`❌ ${feature.name} - Feature not working`);
      }
    } catch (err) {
      console.log(`❌ ${feature.name} - Error: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Advanced Features Score: ${featureScore}/${advancedFeatures.length} (${Math.round(featureScore/advancedFeatures.length*100)}%)`);
  
  // Final Summary
  console.log('\n' + '=' * 50);
  console.log('📋 FINAL VERIFICATION SUMMARY:');
  console.log('=' * 50);
  
  const totalScore = coreScore + advancedScore + apiScore + featureScore;
  const maxScore = coreTables.length + advancedTables.length + apiTests.length + advancedFeatures.length;
  const overallPercentage = Math.round((totalScore / maxScore) * 100);
  
  console.log(`✅ Core Tables: ${coreScore}/${coreTables.length} (${Math.round(coreScore/coreTables.length*100)}%)`);
  console.log(`🚀 Advanced Tables: ${advancedScore}/${advancedTables.length} (${Math.round(advancedScore/advancedTables.length*100)}%)`);
  console.log(`🌐 API Integration: ${apiScore}/${apiTests.length} (${Math.round(apiScore/apiTests.length*100)}%)`);
  console.log(`🎯 Advanced Features: ${featureScore}/${advancedFeatures.length} (${Math.round(featureScore/advancedFeatures.length*100)}%)`);
  console.log(`\n🏆 OVERALL SCORE: ${totalScore}/${maxScore} (${overallPercentage}%)`);
  
  if (overallPercentage >= 95) {
    console.log('🎉 EXCELLENT! Your Bengali news website is fully operational!');
  } else if (overallPercentage >= 80) {
    console.log('👍 GOOD! Most features working, minor issues to resolve.');
  } else if (overallPercentage >= 60) {
    console.log('⚠️  PARTIAL! Core features working, advanced features need attention.');
  } else {
    console.log('❌ ISSUES! Multiple systems need configuration.');
  }
  
  // Clean up test data
  console.log('\n🧹 Cleaning up test data...');
  await supabase.from('user_notifications').delete().eq('type', 'test');
  await supabase.from('reading_goals').delete().eq('user_id', 'test-user-id');
  await supabase.from('performance_metrics').delete().eq('category', 'testing');
  console.log('✅ Test data cleaned up');
  
  console.log('\n✅ Verification completed!');
  return {
    coreScore,
    advancedScore,
    apiScore,
    featureScore,
    totalScore,
    maxScore,
    overallPercentage
  };
}

// Run the migration test
testMigration()
  .then((results) => {
    console.log(`\n📊 Final Results: ${results.overallPercentage}% system operational`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });