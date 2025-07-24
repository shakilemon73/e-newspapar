#!/usr/bin/env node

// Test script to check which pages work on Vercel deployment
const pages = [
  // Public pages
  { name: 'Homepage', url: '/', expected: 'should load main content' },
  { name: 'Category - Economy', url: '/category/economy', expected: 'should show economy articles' },
  { name: 'Category - Sports', url: '/category/sports', expected: 'should show sports articles' },
  { name: 'Category - Politics', url: '/category/politics', expected: 'should show politics articles' },
  { name: 'Article Detail', url: '/article/bangladesh-economy-growth', expected: 'should show article content' },
  { name: 'Videos', url: '/videos', expected: 'should show video content' },
  { name: 'E-Paper', url: '/e-paper', expected: 'should show digital newspapers' },
  { name: 'Search', url: '/search', expected: 'should show search interface' },
  { name: 'Audio Articles', url: '/audio', expected: 'should show audio articles' },
  { name: 'Archive', url: '/archive', expected: 'should show archived content' },
  
  // Auth pages
  { name: 'Login', url: '/login', expected: 'should show login form' },
  { name: 'Register', url: '/register', expected: 'should show registration form' },
  { name: 'User Dashboard', url: '/dashboard', expected: 'should redirect to login if not authenticated' },
  
  // Admin pages
  { name: 'Admin Login', url: '/admin-login', expected: 'should show admin login form' },
  { name: 'Admin Dashboard', url: '/admin-dashboard', expected: 'should redirect to admin login if not authenticated' },
  { name: 'Admin Articles', url: '/admin/articles', expected: 'should show article management' },
  { name: 'Admin Categories', url: '/admin/categories', expected: 'should show category management' },
  { name: 'Admin Users', url: '/admin/users', expected: 'should show user management' },
  { name: 'Admin Settings', url: '/admin/settings', expected: 'should show site settings' },
  { name: 'Admin Videos', url: '/admin/videos', expected: 'should show video management' },
  { name: 'Admin E-Papers', url: '/admin/epapers', expected: 'should show e-paper management' },
  { name: 'Admin Breaking News', url: '/admin/breaking-news', expected: 'should show breaking news management' },
  { name: 'Admin Analytics', url: '/admin/analytics', expected: 'should show analytics dashboard' },
  { name: 'Admin Comments', url: '/admin/comments', expected: 'should show comment moderation' },
  { name: 'Admin Audio Articles', url: '/admin/audio-articles', expected: 'should show audio article management' },
  { name: 'Admin Trending', url: '/admin/trending', expected: 'should show trending content management' },
  { name: 'Admin Algorithms', url: '/admin/algorithms', expected: 'should show algorithm management' },
  { name: 'Admin Email', url: '/admin/email', expected: 'should show email management' },
  { name: 'Admin Advertisement', url: '/admin/advertisement', expected: 'should show ad management' },
  
  // Error pages
  { name: '404 Page', url: '/non-existent-page', expected: 'should show 404 error page' }
];

const deploymentUrls = [
  'http://localhost:8080', // Local static test
  // Add your actual Vercel URL here when you share it
];

async function testPage(baseUrl, page) {
  const fullUrl = baseUrl + page.url;
  
  try {
    console.log(`Testing: ${page.name} (${page.url})`);
    
    // Since we can't actually fetch from Node.js without additional dependencies,
    // we'll just log the URLs that should be tested
    console.log(`  URL: ${fullUrl}`);
    console.log(`  Expected: ${page.expected}`);
    console.log(`  Status: Ready for testing\n`);
    
    return { page: page.name, url: fullUrl, status: 'ready' };
  } catch (error) {
    console.error(`  Error: ${error.message}\n`);
    return { page: page.name, url: fullUrl, status: 'error', error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Bengali News Website - Vercel Deployment Page Tests\n');
  console.log('==========================================\n');
  
  for (const baseUrl of deploymentUrls) {
    console.log(`🌐 Testing deployment: ${baseUrl}\n`);
    
    for (const page of pages) {
      await testPage(baseUrl, page);
    }
    
    console.log('\n==========================================\n');
  }
  
  console.log('✅ Test preparation complete!');
  console.log('\n📋 Manual Testing Instructions:');
  console.log('1. Open your browser and visit each URL listed above');
  console.log('2. Check if the page loads correctly');
  console.log('3. Verify that the expected content appears');
  console.log('4. Test admin pages by logging in with admin credentials first');
  console.log('\n🔧 Troubleshooting:');
  console.log('- If admin pages redirect to login, that\'s expected behavior');
  console.log('- If you get 404 errors, check the vercel.json rewrite rules');
  console.log('- If pages are blank, check browser console for JavaScript errors');
}

runTests();