#!/usr/bin/env node

/**
 * Vercel Build Script for Bengali News Website
 * Optimized build process based on Vercel best practices for full-stack applications
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting optimized Vercel build process...');

// Helper function to run commands with proper error handling
function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Helper function to check if directory exists
function directoryExists(dir) {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

try {
  // Step 1: Verify client directory structure
  console.log('🔍 Verifying project structure...');
  
  const clientDir = path.join(process.cwd(), 'client');
  if (!directoryExists(clientDir)) {
    throw new Error('Client directory not found! Expected at ./client/');
  }
  
  const apiDir = path.join(process.cwd(), 'api');
  if (!directoryExists(apiDir)) {
    console.log('ℹ️ API directory not found, will use server directory for serverless functions');
  }
  
  // Step 2: Install client dependencies
  console.log('📥 Installing client dependencies...');
  process.chdir(clientDir);
  
  // Check if package.json exists in client directory
  if (!fs.existsSync('package.json')) {
    throw new Error('Client package.json not found!');
  }
  
  // Install dependencies with production optimizations
  runCommand('npm ci --only=production --silent', 'Installing production dependencies');
  
  // Step 3: Build frontend with optimizations
  console.log('🏗️ Building React frontend...');
  
  // Set environment variables for optimal build
  process.env.NODE_ENV = 'production';
  process.env.GENERATE_SOURCEMAP = 'false';
  process.env.INLINE_RUNTIME_CHUNK = 'false';
  
  runCommand('npm run build', 'Building React application');
  
  // Step 4: Verify build output
  const distDir = path.join(clientDir, 'dist');
  if (!directoryExists(distDir)) {
    throw new Error('Build failed! Dist directory not created');
  }
  
  // Step 5: Optimize build output
  console.log('⚡ Optimizing build output...');
  
  // Get build size information
  const getDirectorySize = (dir) => {
    let totalSize = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        totalSize += getDirectorySize(fullPath);
      } else {
        totalSize += fs.statSync(fullPath).size;
      }
    }
    return totalSize;
  };
  
  const buildSize = getDirectorySize(distDir);
  const buildSizeMB = (buildSize / (1024 * 1024)).toFixed(2);
  
  console.log(`📊 Build statistics:`);
  console.log(`   Total build size: ${buildSizeMB} MB`);
  console.log(`   Build directory: ${distDir}`);
  
  // Step 6: Create deployment manifest
  const deploymentInfo = {
    buildTime: new Date().toISOString(),
    buildSize: `${buildSizeMB} MB`,
    nodeVersion: process.version,
    platform: 'vercel',
    environment: 'production'
  };
  
  fs.writeFileSync(
    path.join(distDir, 'deployment-info.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // Step 7: Final validation
  console.log('🔍 Running final validation...');
  
  // Check for essential files
  const essentialFiles = ['index.html'];
  for (const file of essentialFiles) {
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Essential file missing: ${file}`);
    }
  }
  
  // Step 8: Success message
  console.log('🎉 Build completed successfully!');
  console.log('📦 Deployment package ready for Vercel');
  console.log('🌐 Your Bengali news website is ready to deploy');
  
  // Return build info for Vercel
  console.log(JSON.stringify({
    success: true,
    buildSize: buildSizeMB,
    outputDirectory: 'client/dist'
  }));

} catch (error) {
  console.error('💥 Build failed:', error.message);
  process.exit(1);
}