#!/usr/bin/env node

/**
 * Vercel Deployment Validation Script
 * Tests all deployment configurations and requirements
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Validating Vercel deployment configuration...\n');

const checks = [];
let passedChecks = 0;
let totalChecks = 0;

// Helper function to add check results
function addCheck(name, passed, message = '') {
  checks.push({ name, passed, message });
  totalChecks++;
  if (passed) passedChecks++;
  
  const status = passed ? '✅' : '❌';
  const msg = message ? ` - ${message}` : '';
  console.log(`${status} ${name}${msg}`);
}

// Test 1: Verify vercel.json exists and is valid
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  addCheck('vercel.json configuration', true, 'Valid JSON configuration found');
  
  // Check required properties
  const hasBuilds = vercelConfig.builds && vercelConfig.builds.length > 0;
  addCheck('Serverless function configuration', hasBuilds, hasBuilds ? 'API build configured' : 'No builds found');
  
  const hasRoutes = (vercelConfig.routes && vercelConfig.routes.length > 0) || 
                   (vercelConfig.rewrites && vercelConfig.rewrites.length > 0);
  addCheck('Routing configuration', hasRoutes, hasRoutes ? 'API and SPA routes configured' : 'No routing configuration found');
  
  const hasHeaders = vercelConfig.headers && vercelConfig.headers.length > 0;
  addCheck('Security headers', hasHeaders, hasHeaders ? 'CORS and caching headers configured' : 'No headers found');
  
} catch (error) {
  addCheck('vercel.json configuration', false, 'File missing or invalid JSON');
}

// Test 2: Verify API entry point
const apiEntryExists = fs.existsSync('api/index.ts');
addCheck('API entry point', apiEntryExists, apiEntryExists ? 'api/index.ts found' : 'api/index.ts missing');

// Test 3: Verify client structure
const clientDirExists = fs.existsSync('client') && fs.statSync('client').isDirectory();
addCheck('Client directory', clientDirExists, clientDirExists ? 'Client directory exists' : 'Client directory missing');

if (clientDirExists) {
  const clientPackageExists = fs.existsSync('client/package.json');
  addCheck('Client package.json', clientPackageExists, clientPackageExists ? 'Client dependencies configured' : 'Client package.json missing');
  
  const clientIndexExists = fs.existsSync('client/index.html');
  addCheck('Client HTML template', clientIndexExists, clientIndexExists ? 'index.html found' : 'index.html missing');
}

// Test 4: Verify build script
const buildScriptExists = fs.existsSync('vercel-build.js');
addCheck('Custom build script', buildScriptExists, buildScriptExists ? 'vercel-build.js available' : 'Using default build');

// Test 5: Verify ignore file
const vercelIgnoreExists = fs.existsSync('.vercelignore');
addCheck('Deployment exclusions', vercelIgnoreExists, vercelIgnoreExists ? '.vercelignore configured' : 'No exclusions configured');

// Test 6: Verify environment template
const envExampleExists = fs.existsSync('.env.example');
addCheck('Environment template', envExampleExists, envExampleExists ? '.env.example provided' : 'No environment template');

// Test 7: Verify documentation
const deployGuideExists = fs.existsSync('VERCEL_DEPLOYMENT_GUIDE.md');
addCheck('Deployment documentation', deployGuideExists, deployGuideExists ? 'Comprehensive guide available' : 'No deployment guide');

// Test 8: Check for required dependencies
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasExpress = packageJson.dependencies && packageJson.dependencies.express;
  addCheck('Express dependency', hasExpress, hasExpress ? 'Express server configured' : 'Express not found');
  
  const hasSupabase = packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js'];
  addCheck('Supabase integration', hasSupabase, hasSupabase ? 'Supabase client available' : 'Supabase not configured');
  
} catch (error) {
  addCheck('Package dependencies', false, 'Could not read package.json');
}

// Test 9: Verify essential directories
const serverDirExists = fs.existsSync('server') && fs.statSync('server').isDirectory();
addCheck('Server directory', serverDirExists, serverDirExists ? 'Backend logic available' : 'No server directory');

const sharedDirExists = fs.existsSync('shared') && fs.statSync('shared').isDirectory();
addCheck('Shared schemas', sharedDirExists, sharedDirExists ? 'TypeScript schemas shared' : 'No shared directory');

// Test 10: Check for critical files
const essentialFiles = [
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts'
];

essentialFiles.forEach(file => {
  const exists = fs.existsSync(file);
  addCheck(`Configuration: ${file}`, exists, exists ? 'Available' : 'Missing');
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 DEPLOYMENT VALIDATION SUMMARY');
console.log('='.repeat(60));

const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);
console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks (${successRate}%)`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 ALL CHECKS PASSED!');
  console.log('🚀 Your Bengali news website is ready for Vercel deployment');
  console.log('\n📋 Next steps:');
  console.log('   1. Push your code to Git repository');
  console.log('   2. Connect repository to Vercel');
  console.log('   3. Configure environment variables');
  console.log('   4. Deploy with: vercel --prod');
  console.log('\n📖 See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions');
} else {
  const failedChecks = totalChecks - passedChecks;
  console.log(`\n⚠️  ${failedChecks} checks failed`);
  console.log('🔧 Please address the failed checks before deployment');
  
  console.log('\n❌ Failed checks:');
  checks.filter(check => !check.passed).forEach(check => {
    console.log(`   • ${check.name}: ${check.message}`);
  });
}

console.log('\n' + '='.repeat(60));

// Exit with appropriate code
process.exit(passedChecks === totalChecks ? 0 : 1);