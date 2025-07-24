#!/usr/bin/env node
/**
 * Enhanced build script for Vercel deployment
 * Fixes JSX runtime issues and ensures proper React configuration
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting enhanced Vercel build with JSX runtime fixes...');

try {
  // Clean previous build
  if (fs.existsSync('dist-static')) {
    console.log('🧹 Cleaning previous build...');
    fs.rmSync('dist-static', { recursive: true, force: true });
  }

  // Set NODE_ENV for production build
  process.env.NODE_ENV = 'production';
  
  // Create temporary babel config for proper JSX runtime
  const babelConfig = {
    presets: [
      ['@babel/preset-react', {
        runtime: 'automatic',
        importSource: 'react',
        development: false
      }]
    ]
  };
  
  fs.writeFileSync('.babelrc.json', JSON.stringify(babelConfig, null, 2));
  console.log('✅ Created Babel config for JSX runtime');

  // Build with static config
  console.log('🏗️ Building static site with JSX runtime fixes...');
  execSync('vite build --config vite.config.static.ts --mode production', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      VITE_JSX_RUNTIME: 'automatic'
    }
  });

  // Clean up temporary babel config
  if (fs.existsSync('.babelrc.json')) {
    fs.unlinkSync('.babelrc.json');
    console.log('🧹 Cleaned up temporary Babel config');
  }

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

  // Copy index-static.html to index.html for Vercel compatibility
  if (fs.existsSync('dist-static/index-static.html')) {
    fs.copyFileSync('dist-static/index-static.html', 'dist-static/index.html');
    console.log('✅ Created index.html for Vercel compatibility');
  } else {
    console.error('❌ index-static.html not found in dist-static/');
  }

  // Copy 404.html for proper client-side routing fallback
  if (fs.existsSync('client/public/404.html')) {
    fs.copyFileSync('client/public/404.html', 'dist-static/404.html');
    console.log('✅ Created 404.html for client-side routing');
  }

  // Apply comprehensive JSX runtime fixes
  const { fixJSXRuntime } = await import('./jsx-runtime-fix.js');
  fixJSXRuntime('dist-static');

  console.log('✅ Enhanced Vercel build completed successfully!');
  console.log('📦 Output directory: dist-static/');
  console.log('🔧 JSX runtime issues fixed for production deployment');
  
  // List built files
  const files = fs.readdirSync('dist-static');
  console.log('📄 Built files:', files.join(', '));

} catch (error) {
  console.error('❌ Enhanced build failed:', error.message);
  process.exit(1);
}