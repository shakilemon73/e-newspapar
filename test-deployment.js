#!/usr/bin/env node

// Test script to verify deployment works
const https = require('https');

const testUrls = [
  'https://www.dainiktni.news/',
  'https://www.dainiktni.news/admin-login',
  'https://www.dainiktni.news/about',
  'https://www.dainiktni.news/admin/articles'
];

console.log('🧪 Testing Vercel deployment...\n');

function testUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (res) => {
      const status = res.statusCode;
      const isWorking = status === 200;
      
      console.log(`${isWorking ? '✅' : '❌'} ${url} - ${status}`);
      
      resolve({ url, status, isWorking });
    });
    
    request.on('error', (error) => {
      console.log(`❌ ${url} - ERROR: ${error.message}`);
      resolve({ url, status: 'ERROR', isWorking: false });
    });
    
    request.setTimeout(10000, () => {
      console.log(`❌ ${url} - TIMEOUT`);
      resolve({ url, status: 'TIMEOUT', isWorking: false });
    });
  });
}

async function runTests() {
  const results = [];
  
  for (const url of testUrls) {
    const result = await testUrl(url);
    results.push(result);
  }
  
  console.log('\n📊 RESULTS:');
  const working = results.filter(r => r.isWorking).length;
  const total = results.length;
  
  if (working === total) {
    console.log(`✅ All ${total} URLs are working correctly!`);
    console.log('🎉 Admin routes are fixed!');
  } else {
    console.log(`❌ ${working}/${total} URLs working`);
    console.log('🔧 Deployment may still be in progress or needs to be triggered');
    
    if (results.find(r => r.url.includes('admin-login'))?.status === 404) {
      console.log('\n💡 NEXT STEPS:');
      console.log('1. Check if new deployment was triggered in Vercel Dashboard');
      console.log('2. If not, manually redeploy or push changes to Git');
      console.log('3. Wait 2-3 minutes for deployment to complete');
      console.log('4. Run this test again');
    }
  }
}

runTests().catch(console.error);