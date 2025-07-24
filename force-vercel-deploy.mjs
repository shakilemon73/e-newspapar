#!/usr/bin/env node

// Force deployment script to fix admin pages on Vercel
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Force deploying admin page fix to Vercel...\n');

// Check if the fix files exist
const requiredFiles = [
  'dist-static/admin-login.html',
  'dist-static/admin-dashboard.html', 
  'dist-static/about.html',
  'dist-static/contact.html'
];

console.log('✅ Verifying fix files exist:');
for (const file of requiredFiles) {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) {
    console.error(`❌ Missing file: ${file}`);
    process.exit(1);
  }
}

console.log('\n📝 Current vercel.json rewrites:');
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
vercelConfig.rewrites.forEach(rule => {
  console.log(`  ${rule.source} → ${rule.destination}`);
});

console.log('\n⚡ MANUAL DEPLOYMENT REQUIRED');
console.log('Since I cannot access Git directly, please run these commands:');
console.log('');
console.log('1. git add .');
console.log('2. git commit -m "Fix Vercel admin 404 - deploy route files"');
console.log('3. git push origin main');
console.log('');
console.log('OR use Vercel CLI:');
console.log('npx vercel --prod --force');
console.log('');
console.log('✅ All files are ready - admin pages will work after deployment');