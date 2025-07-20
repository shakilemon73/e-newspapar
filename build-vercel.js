#!/usr/bin/env node

/**
 * Vercel Build Script for Bengali News Portal
 * This script prepares the project for Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Vercel build process...');

// 1. Build the client application
console.log('📦 Building client application...');
try {
  execSync('npm run build:client', { stdio: 'inherit' });
  console.log('✅ Client build completed successfully');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// 2. Verify build output
const buildDir = path.join(__dirname, 'dist', 'public');
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found:', buildDir);
  process.exit(1);
}

const indexFile = path.join(buildDir, 'index.html');
if (!fs.existsSync(indexFile)) {
  console.error('❌ index.html not found in build directory');
  process.exit(1);
}

console.log('✅ Build verification passed');

// 3. Create deployment info
const deploymentInfo = {
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
  environment: 'vercel',
  apiRoutes: [
    '/api/articles',
    '/api/articles/[slug]',
    '/api/articles/latest', 
    '/api/articles/popular',
    '/api/audio-articles',
    '/api/audio-articles/[slug]',
    '/api/categories',
    '/api/settings',
    '/api/videos',
    '/api/epapers',
    '/api/social-media'
  ]
};

fs.writeFileSync(
  path.join(buildDir, 'deployment-info.json'),
  JSON.stringify(deploymentInfo, null, 2)
);

console.log('🎉 Vercel build completed successfully!');
console.log(`📁 Output directory: ${buildDir}`);
console.log(`🌐 Ready for deployment to Vercel`);