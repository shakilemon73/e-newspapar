#!/usr/bin/env node

/**
 * Vercel-specific build script for Bengali News Website
 * Handles the correct directory structure and build process
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting Vercel build for Bengali News Website...');

try {
  // Set production environment
  process.env.NODE_ENV = 'production';
  
  // Check project structure
  const clientDir = path.join(__dirname, 'client');
  const hasClientDir = fs.existsSync(clientDir);
  
  console.log(`Project structure: ${hasClientDir ? 'Using client directory' : 'Root directory'}`);
  
  if (hasClientDir) {
    // If client directory exists, we need to set the working directory correctly
    console.log('Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    
    console.log('Building with Vite...');
    // Run vite build from project root (it knows about client directory from vite.config.ts)
    execSync('vite build', { stdio: 'inherit', cwd: __dirname });
  } else {
    // Standard build if no client directory
    console.log('Running standard build...');
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
  }
  
  // Verify build output
  const expectedOutput = path.join(__dirname, 'dist', 'public');
  if (fs.existsSync(expectedOutput)) {
    console.log('✅ Build successful! Output directory:', expectedOutput);
    
    // List build contents
    const files = fs.readdirSync(expectedOutput);
    console.log('Build contents:', files.slice(0, 10).join(', '));
    
    if (!files.includes('index.html')) {
      throw new Error('index.html not found in build output!');
    }
    
  } else {
    throw new Error(`Build output directory not found: ${expectedOutput}`);
  }
  
  console.log('🎉 Vercel build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}