#!/usr/bin/env node

/**
 * Build Scripts for Bengali News Website
 * Handles platform-specific builds for Vercel, Netlify, Railway, Render, etc.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const platform = process.argv[2] || 'default';

console.log(`🚀 Building for platform: ${platform}`);

// Common build steps
function buildFrontend() {
  console.log('📦 Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
}

function buildBackend() {
  console.log('🔧 Building backend...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
}

// Platform-specific builds
const builds = {
  vercel: () => {
    console.log('🔷 Building for Vercel...');
    buildFrontend();
    // Vercel uses serverless functions in api/ directory
    console.log('✅ Vercel build complete');
  },

  netlify: () => {
    console.log('🟢 Building for Netlify...');
    buildFrontend();
    
    // Ensure netlify functions directory exists
    if (!existsSync('dist/netlify/functions')) {
      mkdirSync('dist/netlify/functions', { recursive: true });
    }
    
    // Copy Netlify function
    if (existsSync('netlify/functions/api.js')) {
      copyFileSync('netlify/functions/api.js', 'dist/netlify/functions/api.js');
    }
    
    console.log('✅ Netlify build complete');
  },

  railway: () => {
    console.log('🚂 Building for Railway...');
    buildFrontend();
    buildBackend();
    console.log('✅ Railway build complete');
  },

  render: () => {
    console.log('🎨 Building for Render...');
    buildFrontend();
    buildBackend();
    console.log('✅ Render build complete');
  },

  docker: () => {
    console.log('🐳 Building for Docker...');
    buildFrontend();
    buildBackend();
    console.log('✅ Docker build complete');
  },

  production: () => {
    console.log('🏭 Building for production...');
    process.env.NODE_ENV = 'production';
    buildFrontend();
    buildBackend();
    console.log('✅ Production build complete');
  },

  default: () => {
    console.log('📦 Building default...');
    buildFrontend();
    buildBackend();
    console.log('✅ Default build complete');
  }
};

// Execute build
try {
  if (builds[platform]) {
    builds[platform]();
  } else {
    console.log(`❌ Unknown platform: ${platform}`);
    console.log('Available platforms: vercel, netlify, railway, render, docker, production');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}