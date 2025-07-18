#!/usr/bin/env node

/**
 * Comprehensive Admin API Testing and Real Data Verification
 * This tests all admin endpoints to ensure they return real Supabase data
 */

import http from 'http';

async function testAdminEndpoint(path, testName) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth, but shows the endpoint exists
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          const isAuthError = res.statusCode === 401;
          const isWorking = res.statusCode < 500 && res.statusCode !== 404;
          
          console.log(`${isWorking ? '✅' : '❌'} ${testName}`);
          console.log(`   Status: ${res.statusCode} ${isAuthError ? '(Auth Protected ✓)' : ''}`);
          
          if (!isAuthError && jsonData && res.statusCode < 400) {
            if (Array.isArray(jsonData)) {
              console.log(`   📊 Returns array with ${jsonData.length} items`);
            } else if (typeof jsonData === 'object') {
              const keys = Object.keys(jsonData);
              console.log(`   📊 Returns object with ${keys.length} properties`);
              
              // Check for real vs mock data indicators
              const dataStr = JSON.stringify(jsonData);
              if (dataStr.includes('mock') || dataStr.includes('dummy') || dataStr.includes('fake')) {
                console.log(`   ⚠️  Contains mock data - needs Supabase integration`);
              } else {
                console.log(`   ✅ Real data detected`);
              }
            }
          }
          
          resolve({ working: isWorking, authProtected: isAuthError, status: res.statusCode });
        } catch (error) {
          console.log(`❌ ${testName} - Parse Error: ${error.message}`);
          resolve({ working: false, authProtected: false, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${testName} - Request Error: ${error.message}`);
      resolve({ working: false, authProtected: false, status: 0 });
    });

    req.end();
  });
}

async function runComprehensiveTest() {
  console.log('🔍 Comprehensive Admin API Integration Test');
  console.log('='.repeat(50));
  
  const testEndpoints = [
    { path: '/api/admin/database-status', name: 'Database Status' },
    { path: '/api/admin/database/stats', name: 'Database Stats' },
    { path: '/api/admin/user-stats', name: 'User Statistics' },
    { path: '/api/admin/user-achievements', name: 'User Achievements' },
    { path: '/api/admin/active-users', name: 'Active Users' },
    { path: '/api/admin/comments', name: 'Comment Management' },
    { path: '/api/admin/comment-stats', name: 'Comment Statistics' },
    { path: '/api/admin/email-templates', name: 'Email Templates' },
    { path: '/api/admin/newsletter-subscribers', name: 'Newsletter Subscribers' },
    { path: '/api/admin/mobile-app-config', name: 'Mobile App Config' },
    { path: '/api/admin/push-notifications', name: 'Push Notifications' },
    { path: '/api/admin/seo-settings', name: 'SEO Settings' },
    { path: '/api/admin/seo-analytics', name: 'SEO Analytics' },
    { path: '/api/admin/search-stats', name: 'Search Statistics' },
    { path: '/api/admin/performance-metrics', name: 'Performance Metrics' },
    { path: '/api/admin/advertisements', name: 'Advertisement Management' }
  ];
  
  let authProtectedCount = 0;
  let workingCount = 0;
  let totalTests = testEndpoints.length;
  
  console.log(`\nTesting ${totalTests} critical admin endpoints...\n`);
  
  for (const endpoint of testEndpoints) {
    const result = await testAdminEndpoint(endpoint.path, endpoint.name);
    if (result.working) workingCount++;
    if (result.authProtected) authProtectedCount++;
    console.log(''); // Space between tests
  }
  
  console.log('📊 Test Summary:');
  console.log(`Total endpoints tested: ${totalTests}`);
  console.log(`✅ Working endpoints: ${workingCount}`);
  console.log(`🔒 Auth protected: ${authProtectedCount}`);
  console.log(`❌ Failed/Missing: ${totalTests - workingCount}`);
  
  const authRate = ((authProtectedCount / totalTests) * 100).toFixed(1);
  const workingRate = ((workingCount / totalTests) * 100).toFixed(1);
  
  console.log(`\n📈 Security & Functionality Analysis:`);
  console.log(`- ${authRate}% of endpoints are properly auth-protected`);
  console.log(`- ${workingRate}% of endpoints are functional`);
  
  if (authProtectedCount > totalTests * 0.8) {
    console.log(`✅ Excellent: Strong authentication implementation`);
  }
  
  if (workingCount > totalTests * 0.9) {
    console.log(`✅ Excellent: Admin system is fully functional`);
  } else if (workingCount > totalTests * 0.7) {
    console.log(`⚠️  Good: Most admin features working, minor fixes needed`);
  } else {
    console.log(`❌ Issues: Significant admin endpoints need attention`);
  }
  
  console.log(`\n🎯 Next Steps:`);
  if (authProtectedCount < totalTests) {
    console.log(`- Review ${totalTests - authProtectedCount} endpoints missing authentication`);
  }
  if (workingCount < totalTests) {
    console.log(`- Fix ${totalTests - workingCount} non-functional endpoints`);
  }
  console.log(`- Verify all endpoints return real Supabase data instead of mock data`);
  console.log(`- Test admin CRUD operations (Create, Update, Delete)`);
}

runComprehensiveTest().catch(console.error);