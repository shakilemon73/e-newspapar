#!/usr/bin/env node

// Verify all admin pages are ready for Vercel deployment
const fs = require('fs');

console.log('🔍 Verifying all admin pages for Vercel deployment...\n');

const adminPages = [
  'admin-login.html',
  'admin-dashboard.html',
  'admin-articles.html',
  'admin-users.html',
  'admin-categories.html',
  'admin-videos.html',
  'admin-breaking-news.html',
  'admin-epapers.html',
  'admin-audio-articles.html',
  'admin-comments.html',
  'admin-settings.html',
  'admin-weather.html',
  'admin-analytics.html',
  'admin-social-media.html',
  'admin-trending.html',
  'admin-algorithms.html',
  'admin-email.html',
  'admin-advertisement.html'
];

const distDir = 'dist-static';
let allPagesExist = true;

adminPages.forEach(page => {
  const filePath = `${distDir}/${page}`;
  const exists = fs.existsSync(filePath);
  
  console.log(`${exists ? '✅' : '❌'} ${page} ${exists ? 'exists' : 'MISSING'}`);
  
  if (!exists) {
    allPagesExist = false;
  }
});

console.log('\n📋 vercel.json admin rewrites:');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const adminRewrites = vercelConfig.rewrites.filter(rule => 
    rule.source.includes('/admin')
  );
  
  adminRewrites.forEach(rule => {
    console.log(`  ${rule.source} → ${rule.destination}`);
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`Admin HTML files: ${adminPages.length}`);
  console.log(`Admin rewrites: ${adminRewrites.length}`);
  
} catch (error) {
  console.error('❌ Error reading vercel.json:', error.message);
  allPagesExist = false;
}

if (allPagesExist) {
  console.log('\n✅ ALL ADMIN PAGES READY FOR DEPLOYMENT!');
  console.log('🚀 Deploy now with: git add . && git commit -m "Add all admin pages" && git push');
} else {
  console.log('\n❌ Some admin pages are missing.');
  process.exit(1);
}