#!/usr/bin/env node

// Verify all required pages exist for Vercel deployment
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying all pages exist for deployment...\n');

const requiredPages = [
  'index.html',
  'about.html', 
  'contact.html',
  'admin-login.html',
  'admin-dashboard.html',
  '404.html'
];

const distDir = 'dist-static';
let allPagesExist = true;

requiredPages.forEach(page => {
  const filePath = path.join(distDir, page);
  const exists = fs.existsSync(filePath);
  
  console.log(`${exists ? '✅' : '❌'} ${page} ${exists ? 'exists' : 'MISSING'}`);
  
  if (!exists) {
    allPagesExist = false;
  }
});

console.log('\n📋 vercel.json rewrites:');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  vercelConfig.rewrites.forEach(rule => {
    console.log(`  ${rule.source} → ${rule.destination}`);
  });
} catch (error) {
  console.error('❌ Error reading vercel.json:', error.message);
  allPagesExist = false;
}

if (allPagesExist) {
  console.log('\n✅ All pages ready for deployment!');
  console.log('🚀 Deploy now with: git add . && git commit -m "Fix SPA routing" && git push');
} else {
  console.log('\n❌ Some pages are missing. Fix required before deployment.');
  process.exit(1);
}