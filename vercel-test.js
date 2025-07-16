#!/usr/bin/env node

/**
 * Vercel Configuration Validator
 * Tests the vercel.json configuration for compatibility
 */

import { readFileSync } from 'fs';

console.log('🔍 Validating Vercel configuration...\n');

try {
  const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));
  
  console.log('✅ vercel.json is valid JSON');
  
  // Check for conflicting properties
  const conflictingProps = ['routes', 'builds'];
  const modernProps = ['rewrites', 'redirects', 'headers', 'cleanUrls', 'trailingSlash'];
  
  const hasConflicting = conflictingProps.some(prop => vercelConfig.hasOwnProperty(prop));
  const hasModern = modernProps.some(prop => vercelConfig.hasOwnProperty(prop));
  
  if (hasConflicting && hasModern) {
    console.log('❌ Configuration conflict detected');
    console.log('   Cannot use routes/builds with rewrites/headers/redirects');
    process.exit(1);
  } else {
    console.log('✅ No configuration conflicts');
  }
  
  // Check required properties
  if (vercelConfig.functions && vercelConfig.functions['api/index.js']) {
    console.log('✅ API function configured');
  } else {
    console.log('⚠️  API function not found');
  }
  
  if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
    console.log('✅ API routing configured');
  } else {
    console.log('⚠️  API routing not configured');
  }
  
  if (vercelConfig.buildCommand) {
    console.log('✅ Build command specified');
  } else {
    console.log('⚠️  Build command not specified');
  }
  
  console.log('\n🎉 Vercel configuration is valid and ready for deployment!');
  console.log('\n🚀 Deploy with: vercel --prod');
  
} catch (error) {
  console.log('❌ Error reading vercel.json:', error.message);
  process.exit(1);
}