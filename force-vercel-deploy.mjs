#!/usr/bin/env node

// Force Vercel deployment with correct configuration
import fs from 'fs';
import { execSync } from 'child_process';

console.log('🚀 Force deploying corrected Vercel configuration...');

// Verify vercel.json has correct configuration
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
console.log('📋 Current vercel.json rewrites:', JSON.stringify(vercelConfig.rewrites, null, 2));

// Verify the rewrite rule is correct
const hasCorrectRewrite = vercelConfig.rewrites?.some(rule => 
  rule.source === "/(.*)" && rule.destination === "/index.html"
);

if (!hasCorrectRewrite) {
  console.error('❌ ERROR: vercel.json does not have correct rewrite rule!');
  console.log('Expected: {"source": "/(.*)", "destination": "/index.html"}');
  process.exit(1);
}

console.log('✅ vercel.json configuration is correct');

// Create a fresh build
console.log('🏗️ Creating fresh build...');
try {
  execSync('node vercel-build.js', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Verify critical files exist
const requiredFiles = [
  'dist-static/index.html',
  'dist-static/404.html',
  'dist-static/assets'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ ERROR: Required file missing: ${file}`);
    process.exit(1);
  }
}

console.log('✅ All required files present');

// Add deployment instructions
console.log('\n🚀 DEPLOYMENT INSTRUCTIONS:');
console.log('1. Commit any remaining changes:');
console.log('   git add .');
console.log('   git commit -m "Force deploy - fix admin routing"');
console.log('   git push origin main');
console.log('\n2. OR use Vercel CLI:');
console.log('   npx vercel --prod --force');
console.log('\n3. OR manually redeploy in Vercel Dashboard');

console.log('\n✅ Ready for deployment!');
console.log('After deployment, test: https://www.dainiktni.news/admin-login');