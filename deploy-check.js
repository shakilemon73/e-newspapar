#!/usr/bin/env node

/**
 * Pre-deployment Validation Script for Bengali News Website
 * Checks all requirements before deployment to any platform
 */

import { existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Running pre-deployment validation...\n');

let errors = 0;
let warnings = 0;

// Helper functions
const checkExists = (file, description) => {
  if (existsSync(file)) {
    console.log(`✅ ${description}: ${file}`);
    return true;
  } else {
    console.log(`❌ ${description}: ${file} (missing)`);
    errors++;
    return false;
  }
};

const checkEnvVar = (varName, description) => {
  if (process.env[varName]) {
    console.log(`✅ ${description}: Set`);
    return true;
  } else {
    console.log(`⚠️  ${description}: Not set`);
    warnings++;
    return false;
  }
};

console.log('📁 Checking deployment configuration files...');
checkExists('vercel.json', 'Vercel configuration');
checkExists('netlify.toml', 'Netlify configuration');
checkExists('railway.toml', 'Railway configuration');
checkExists('render.yaml', 'Render configuration');
checkExists('Dockerfile', 'Docker configuration');
checkExists('docker-compose.yml', 'Docker Compose configuration');
checkExists('Procfile', 'Heroku configuration');
checkExists('app.json', 'Heroku app.json');

console.log('\n📦 Checking API endpoints...');
checkExists('api/index.js', 'Vercel API handler');
checkExists('netlify/functions/api.js', 'Netlify function handler');

console.log('\n🏗️ Checking build scripts...');
checkExists('build-scripts.js', 'Platform build scripts');
checkExists('deploy.sh', 'Deployment script');

console.log('\n📄 Checking documentation...');
checkExists('README.md', 'Project README');
checkExists('DEPLOYMENT_GUIDE.md', 'Deployment guide');
checkExists('.env.example', 'Environment template');
checkExists('.gitignore', 'Git ignore file');

console.log('\n🔧 Checking environment variables...');
checkEnvVar('VITE_SUPABASE_URL', 'Supabase URL');
checkEnvVar('VITE_SUPABASE_ANON_KEY', 'Supabase Anonymous Key');
checkEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'Supabase Service Role Key');

console.log('\n📋 Checking package.json...');
if (existsSync('package.json')) {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts.build) {
      console.log('✅ Build script: Available');
    } else {
      console.log('❌ Build script: Missing');
      errors++;
    }
    
    if (packageJson.scripts.start) {
      console.log('✅ Start script: Available');
    } else {
      console.log('❌ Start script: Missing');
      errors++;
    }
    
    if (packageJson.engines && packageJson.engines.node) {
      console.log('✅ Node.js version: Specified');
    } else {
      console.log('⚠️  Node.js version: Not specified');
      warnings++;
    }
    
  } catch (error) {
    console.log('❌ package.json: Invalid JSON');
    errors++;
  }
} else {
  console.log('❌ package.json: Missing');
  errors++;
}

console.log('\n🧪 Testing build process...');
try {
  console.log('Testing Vite build...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build process: Working');
} catch (error) {
  console.log('❌ Build process: Failed');
  console.log('   Error:', error.message.split('\n')[0]);
  errors++;
}

console.log('\n🌐 Checking API structure...');
if (existsSync('api/index.js')) {
  try {
    const apiContent = readFileSync('api/index.js', 'utf8');
    
    if (apiContent.includes('createClient')) {
      console.log('✅ Supabase client: Initialized');
    } else {
      console.log('❌ Supabase client: Not found');
      errors++;
    }
    
    if (apiContent.includes('CORS')) {
      console.log('✅ CORS headers: Configured');
    } else {
      console.log('⚠️  CORS headers: May need configuration');
      warnings++;
    }
    
    if (apiContent.includes('/api/health')) {
      console.log('✅ Health check endpoint: Available');
    } else {
      console.log('⚠️  Health check endpoint: Missing');
      warnings++;
    }
    
  } catch (error) {
    console.log('❌ API file: Cannot read');
    errors++;
  }
}

console.log('\n📊 Validation Summary:');
console.log(`   Errors: ${errors}`);
console.log(`   Warnings: ${warnings}`);

if (errors === 0) {
  console.log('\n🎉 SUCCESS: Your Bengali News Website is ready for deployment!');
  console.log('\n🚀 Deployment Commands:');
  console.log('   Vercel:   ./deploy.sh vercel');
  console.log('   Netlify:  ./deploy.sh netlify');
  console.log('   Railway:  ./deploy.sh railway');
  console.log('   Render:   ./deploy.sh render');
  console.log('   Docker:   ./deploy.sh docker');
  console.log('   Heroku:   ./deploy.sh heroku');
  
  console.log('\n📖 For detailed instructions, see DEPLOYMENT_GUIDE.md');
  process.exit(0);
} else {
  console.log('\n❌ FAILED: Please fix the errors above before deploying.');
  
  if (warnings > 0) {
    console.log('\n⚠️  Warnings should also be addressed for optimal deployment.');
  }
  
  console.log('\n🔧 Common fixes:');
  console.log('   • Set environment variables in .env file');
  console.log('   • Run npm install to ensure dependencies');
  console.log('   • Check Supabase configuration');
  console.log('   • Verify all required files exist');
  
  process.exit(1);
}