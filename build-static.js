#!/usr/bin/env node
/**
 * Static build script for Vercel deployment
 * Ensures proper environment variable handling and asset copying
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Starting static build for Vercel...');

try {
  // Clean previous build
  if (fs.existsSync('dist-static')) {
    console.log('🧹 Cleaning previous build...');
    fs.rmSync('dist-static', { recursive: true, force: true });
  }

  // Build with static config
  console.log('🏗️ Building static site...');
  execSync('vite build --config vite.config.static.ts', { stdio: 'inherit' });

  // Copy static assets
  console.log('📁 Copying static assets...');
  
  // Copy favicon files
  const assets = [
    { src: 'generated-icon.png', dest: 'dist-static/generated-icon.png' },
    { src: 'client/public/favicon.ico', dest: 'dist-static/favicon.ico' },
    { src: 'client/public/og-default-image.svg', dest: 'dist-static/og-default-image.svg' }
  ];

  assets.forEach(asset => {
    if (fs.existsSync(asset.src)) {
      fs.copyFileSync(asset.src, asset.dest);
      console.log(`✅ Copied ${asset.src} -> ${asset.dest}`);
    } else {
      console.warn(`⚠️ Asset not found: ${asset.src}`);
    }
  });

  // Create favicon.svg if it doesn't exist
  const faviconSvgPath = 'dist-static/favicon.svg';
  if (!fs.existsSync(faviconSvgPath)) {
    const faviconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#1e40af" rx="4"/>
  <text x="16" y="22" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">বা</text>
</svg>`;
    fs.writeFileSync(faviconSvgPath, faviconSvg);
    console.log('✅ Created favicon.svg');
  }

  console.log('✅ Static build completed successfully!');
  console.log('📦 Output directory: dist-static/');
  
  // List built files
  const files = fs.readdirSync('dist-static');
  console.log('📄 Built files:', files.join(', '));

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}