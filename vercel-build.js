#!/usr/bin/env node

/**
 * Simple Vercel Build Script for Bengali News Website
 * Compatible with current project structure
 */

console.log('Building Bengali News Website for Vercel...');

try {
  // Environment setup
  process.env.NODE_ENV = 'production';
  
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  
  // Run the build
  console.log('Running Vite build...');
  execSync('vite build', { stdio: 'inherit', cwd: process.cwd() });
  
  // Verify output
  const outputDir = path.join(process.cwd(), 'dist', 'public');
  if (!fs.existsSync(outputDir)) {
    throw new Error('Build output directory not found');
  }
  
  // Check for index.html
  const indexPath = path.join(outputDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('index.html not found in build output');
  }
  
  console.log('Build completed successfully!');
  console.log('Output directory:', outputDir);
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}