#!/usr/bin/env node

/**
 * Comprehensive Admin API Testing Suite
 * Tests all admin endpoints for proper Supabase integration
 */

const baseUrl = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  adminToken: 'test-admin-token',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-admin-token'
  }
};

// Comprehensive list of admin endpoints to test
const adminEndpoints = [
  // Database Management
  { method: 'GET', path: '/admin/database-status', category: 'Database' },
  { method: 'GET', path: '/admin/database/stats', category: 'Database' },
  { method: 'GET', path: '/admin/database/tables', category: 'Database' },
  { method: 'POST', path: '/admin/database/backup', category: 'Database' },
  
  // Content Management
  { method: 'GET', path: '/admin/articles', category: 'Content' },
  { method: 'GET', path: '/admin/categories', category: 'Content' },
  { method: 'GET', path: '/admin/epapers', category: 'Content' },
  { method: 'GET', path: '/admin/videos', category: 'Content' },
  
  // User Management
  { method: 'GET', path: '/admin/users', category: 'Users' },
  { method: 'GET', path: '/admin/user-stats', category: 'Users' },
  { method: 'GET', path: '/admin/user-achievements', category: 'Users' },
  
  // Comment Management
  { method: 'GET', path: '/admin/comments', category: 'Comments' },
  { method: 'GET', path: '/admin/comment-stats', category: 'Comments' },
  
  // Email & Notifications
  { method: 'GET', path: '/admin/email-templates', category: 'Email' },
  { method: 'GET', path: '/admin/newsletter-subscribers', category: 'Email' },
  { method: 'GET', path: '/admin/email-stats', category: 'Email' },
  
  // Mobile App Management
  { method: 'GET', path: '/admin/mobile-app-config', category: 'Mobile' },
  { method: 'GET', path: '/admin/push-notifications', category: 'Mobile' },
  
  // SEO Management
  { method: 'GET', path: '/admin/seo-settings', category: 'SEO' },
  { method: 'GET', path: '/admin/seo-analytics', category: 'SEO' },
  { method: 'GET', path: '/admin/meta-tags', category: 'SEO' },
  
  // Search Management
  { method: 'GET', path: '/admin/search-stats', category: 'Search' },
  { method: 'GET', path: '/admin/search-analytics', category: 'Search' },
  { method: 'GET', path: '/admin/search-history', category: 'Search' },
  
  // Performance & Security
  { method: 'GET', path: '/admin/performance-metrics', category: 'Performance' },
  { method: 'GET', path: '/admin/error-logs', category: 'Performance' },
  { method: 'GET', path: '/admin/security-audit-logs', category: 'Security' },
];

// Test helper functions
async function makeRequest(method, path, body = null) {
  try {
    const url = `${baseUrl}${path}`;
    const options = {
      method,
      headers: testConfig.headers
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Test execution functions
async function testEndpoint(endpoint) {
  console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
  
  const result = await makeRequest(endpoint.method, endpoint.path);
  
  const status = result.ok ? '✅ PASS' : '❌ FAIL';
  const details = result.ok 
    ? `Status: ${result.status}` 
    : `Status: ${result.status}, Error: ${result.data?.error || result.error}`;
  
  console.log(`  ${status} - ${details}`);
  
  // If successful, check if data structure looks correct
  if (result.ok && result.data) {
    if (Array.isArray(result.data)) {
      console.log(`  📊 Returned ${result.data.length} items`);
    } else if (typeof result.data === 'object') {
      const keys = Object.keys(result.data);
      console.log(`  📊 Object with keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
    }
  }
  
  return result;
}

async function testPublicEndpoints() {
  console.log('\n🌐 Testing Public API Endpoints (Non-Admin)...\n');
  
  const publicEndpoints = [
    '/categories',
    '/articles',
    '/articles/latest',
    '/articles/popular',
    '/breaking-news',
    '/weather',
    '/epapers/latest',
    '/videos',
    '/audio-articles'
  ];
  
  for (const path of publicEndpoints) {
    const result = await makeRequest('GET', path);
    const status = result.ok ? '✅' : '❌';
    console.log(`  ${status} GET ${path} - Status: ${result.status}`);
  }
}

async function testAdminEndpoints() {
  console.log('\n🔒 Testing Admin API Endpoints...\n');
  
  // Group endpoints by category
  const categories = {};
  adminEndpoints.forEach(endpoint => {
    if (!categories[endpoint.category]) {
      categories[endpoint.category] = [];
    }
    categories[endpoint.category].push(endpoint);
  });
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    categories: {}
  };
  
  for (const [category, endpoints] of Object.entries(categories)) {
    console.log(`\n📂 ${category} Management:`);
    
    const categoryResults = { passed: 0, failed: 0 };
    
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      results.total++;
      
      if (result.ok) {
        results.passed++;
        categoryResults.passed++;
      } else {
        results.failed++;
        categoryResults.failed++;
      }
    }
    
    results.categories[category] = categoryResults;
    console.log(`  📈 ${category}: ${categoryResults.passed} passed, ${categoryResults.failed} failed`);
  }
  
  return results;
}

async function testDataIntegrity() {
  console.log('\n🔍 Testing Data Integrity & Supabase Integration...\n');
  
  // Test creating and retrieving data
  const testData = {
    category: {
      name: 'Test Category',
      slug: 'test-category'
    },
    article: {
      title: 'Test Article Title',
      slug: 'test-article',
      content: 'This is test content',
      categoryId: 1,
      isFeatured: false
    }
  };
  
  // Test category creation
  console.log('Testing category creation...');
  const createCategoryResult = await makeRequest('POST', '/admin/categories', testData.category);
  console.log(`  ${createCategoryResult.ok ? '✅' : '❌'} Create Category - Status: ${createCategoryResult.status}`);
  
  // Test article creation
  console.log('Testing article creation...');
  const createArticleResult = await makeRequest('POST', '/admin/articles', testData.article);
  console.log(`  ${createArticleResult.ok ? '✅' : '❌'} Create Article - Status: ${createArticleResult.status}`);
  
  // Test data retrieval
  console.log('Testing data retrieval after creation...');
  const getCategoriesResult = await makeRequest('GET', '/admin/categories');
  const getArticlesResult = await makeRequest('GET', '/admin/articles');
  
  console.log(`  ${getCategoriesResult.ok ? '✅' : '❌'} Get Categories - ${getCategoriesResult.data?.length || 0} items`);
  console.log(`  ${getArticlesResult.ok ? '✅' : '❌'} Get Articles - ${getArticlesResult.data?.length || 0} items`);
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Admin API Test Suite');
  console.log('='.repeat(50));
  
  try {
    // Test public endpoints first
    await testPublicEndpoints();
    
    // Test admin endpoints
    const adminResults = await testAdminEndpoints();
    
    // Test data integrity
    await testDataIntegrity();
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log('='.repeat(30));
    console.log(`Total Admin Endpoints Tested: ${adminResults.total}`);
    console.log(`✅ Passed: ${adminResults.passed}`);
    console.log(`❌ Failed: ${adminResults.failed}`);
    console.log(`Success Rate: ${((adminResults.passed / adminResults.total) * 100).toFixed(1)}%`);
    
    console.log('\n📈 Results by Category:');
    for (const [category, results] of Object.entries(adminResults.categories)) {
      const total = results.passed + results.failed;
      const successRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
      console.log(`  ${category}: ${results.passed}/${total} (${successRate}%)`);
    }
    
    if (adminResults.failed > 0) {
      console.log('\n⚠️  Some endpoints failed. Check authentication and Supabase integration.');
    } else {
      console.log('\n🎉 All admin endpoints are working correctly!');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Import fetch for Node.js
import('node-fetch').then(({ default: fetch }) => {
  global.fetch = fetch;
  runComprehensiveTest();
}).catch(() => {
  console.error('❌ node-fetch not available. Please install: npm install node-fetch');
  console.log('⚠️  Running without fetch support - tests may fail');
  runComprehensiveTest();
});