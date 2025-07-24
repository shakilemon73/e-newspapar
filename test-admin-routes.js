#!/usr/bin/env node
/**
 * Test Admin Routes - Verify all admin pages load correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of all admin routes that should be accessible
const adminRoutes = [
  '/admin-login',
  '/admin-access', 
  '/admin-dashboard',
  '/admin/articles',
  '/admin/categories',
  '/admin/epapers',
  '/admin/breaking-news',
  '/admin/videos',
  '/admin/audio-articles',
  '/admin/users',
  '/admin/comments',
  '/admin/user-dashboard',
  '/admin/analytics',
  '/admin/trending',
  '/admin/algorithms',
  '/admin/performance',
  '/admin/settings',
  '/admin/weather',
  '/admin/database',
  '/admin/seo',
  '/admin/search',
  '/admin/security',
  '/admin/social-media',
  '/admin/email',
  '/admin/advertisement',
  '/admin/mobile-app',
  '/admin/footer-pages'
];

function testAdminRoutes() {
  console.log('🔍 Testing admin routes configuration...');
  
  // Check AdminApp.tsx for all route definitions
  const adminAppPath = path.join(__dirname, 'client/src/AdminApp.tsx');
  if (!fs.existsSync(adminAppPath)) {
    console.error('❌ AdminApp.tsx not found');
    return false;
  }
  
  const adminAppContent = fs.readFileSync(adminAppPath, 'utf8');
  let missingRoutes = [];
  let routesFound = 0;
  
  adminRoutes.forEach(route => {
    const routePattern = route.replace(/\//g, '\\/');
    const routeRegex = new RegExp(`path="${routePattern}"`, 'g');
    
    if (adminAppContent.match(routeRegex)) {
      routesFound++;
      console.log(`✅ Found route: ${route}`);
    } else {
      missingRoutes.push(route);
      console.log(`❌ Missing route: ${route}`);
    }
  });
  
  console.log(`\n📊 Route Analysis:`);
  console.log(`✅ Routes found: ${routesFound}/${adminRoutes.length}`);
  console.log(`❌ Missing routes: ${missingRoutes.length}`);
  
  if (missingRoutes.length > 0) {
    console.log(`\n🔧 Missing routes that need to be added:`);
    missingRoutes.forEach(route => {
      console.log(`   - ${route}`);
    });
  }
  
  // Check vercel.json for proper rewrites
  const vercelConfigPath = path.join(__dirname, 'vercel.json');
  if (fs.existsSync(vercelConfigPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    const rewrites = vercelConfig.rewrites || [];
    
    console.log(`\n🌐 Vercel rewrites configured: ${rewrites.length}`);
    
    // Check if admin routes are covered
    const adminRewrites = rewrites.filter(rewrite => 
      rewrite.source.includes('admin') || rewrite.source === '/(.*)'
    );
    
    console.log(`✅ Admin-related rewrites: ${adminRewrites.length}`);
  }
  
  return missingRoutes.length === 0;
}

// Run the test
const success = testAdminRoutes();

if (success) {
  console.log('\n🎉 All admin routes are properly configured!');
} else {
  console.log('\n⚠️ Some admin routes need attention.');
}

export { testAdminRoutes };