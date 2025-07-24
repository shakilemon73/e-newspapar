#!/usr/bin/env node

import https from 'https';

const testRoutes = [
  { name: 'Homepage', url: 'https://www.dainiktni.news/' },
  { name: 'About Page', url: 'https://www.dainiktni.news/about' },
  { name: 'Contact Page', url: 'https://www.dainiktni.news/contact' },
  { name: 'Admin Login', url: 'https://www.dainiktni.news/admin-login' },
  { name: 'Admin Dashboard', url: 'https://www.dainiktni.news/admin-dashboard' }
];

console.log('🧪 Testing Vercel Admin Routes Status\n');

async function testRoute(route) {
  return new Promise((resolve) => {
    const request = https.get(route.url, (res) => {
      const status = res.statusCode;
      const isWorking = status === 200;
      const lastModified = res.headers['last-modified'];
      
      console.log(`${isWorking ? '✅' : '❌'} ${route.name}: ${status}`);
      if (lastModified) {
        console.log(`   Last modified: ${lastModified}`);
      }
      
      resolve({ ...route, status, isWorking, lastModified });
    });
    
    request.on('error', (error) => {
      console.log(`❌ ${route.name}: ERROR - ${error.message}`);
      resolve({ ...route, status: 'ERROR', isWorking: false });
    });
    
    request.setTimeout(10000, () => {
      console.log(`❌ ${route.name}: TIMEOUT`);
      resolve({ ...route, status: 'TIMEOUT', isWorking: false });
    });
  });
}

async function runTests() {
  const results = [];
  
  for (const route of testRoutes) {
    const result = await testRoute(route);
    results.push(result);
    console.log(''); // spacing
  }
  
  console.log('📊 SUMMARY:');
  const working = results.filter(r => r.isWorking).length;
  const total = results.length;
  
  console.log(`Working: ${working}/${total} routes`);
  
  if (working === 1 && results[0].isWorking) {
    console.log('\n🚨 ISSUE: Only homepage works - ALL other routes broken');
    console.log('💡 This means the Vercel deployment is NOT using the updated files');
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. The fix files exist locally but are not deployed');
    console.log('2. You need to commit and push the changes:');
    console.log('   git add .');
    console.log('   git commit -m "Fix Vercel admin 404 - add individual route files"');
    console.log('   git push origin main');
    console.log('3. Wait 2-3 minutes for Vercel to redeploy');
    console.log('4. Test again');
  } else if (working === total) {
    console.log('🎉 SUCCESS: All admin routes are working!');
  } else {
    console.log('⚠️  PARTIAL: Some routes working, some broken');
  }
}

runTests().catch(console.error);