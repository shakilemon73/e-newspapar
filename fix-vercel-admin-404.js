#!/usr/bin/env node

/**
 * Enhanced Vercel deployment fix for admin 404 errors
 * Creates explicit route files and fallback mechanisms
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing Vercel admin 404 errors...');

// Admin routes that need individual HTML files
const adminRoutes = [
  'admin-login',
  'admin-dashboard', 
  'admin-access',
  'admin/articles',
  'admin/categories', 
  'admin/users',
  'admin/settings',
  'admin/videos',
  'admin/epapers',
  'admin/breaking-news',
  'admin/analytics',
  'admin/comments',
  'admin/audio-articles',
  'admin/trending',
  'admin/algorithms',
  'admin/email',
  'admin/advertisement'
];

try {
  // Ensure dist-static directory exists
  if (!fs.existsSync('dist-static')) {
    console.log('❌ dist-static directory not found. Run build first.');
    process.exit(1);
  }

  // Read the main index.html
  const indexPath = 'dist-static/index.html';
  if (!fs.existsSync(indexPath)) {
    console.log('❌ index.html not found in dist-static');
    process.exit(1);
  }

  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Create individual HTML files for each admin route
  let createdFiles = 0;
  
  adminRoutes.forEach(route => {
    const routePath = `dist-static/${route}.html`;
    const routeDir = path.dirname(routePath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    
    // Copy index.html content to route file
    fs.writeFileSync(routePath, indexContent);
    createdFiles++;
    console.log(`✅ Created ${route}.html`);
  });

  // Create a comprehensive _redirects file for Netlify compatibility
  const redirectsContent = adminRoutes.map(route => 
    `/${route} /index.html 200`
  ).join('\n') + '\n/*    /index.html   200';
  
  fs.writeFileSync('dist-static/_redirects', redirectsContent);
  console.log('✅ Created _redirects file for Netlify compatibility');

  // Update vercel.json with explicit routes
  const vercelConfig = {
    version: 2,
    framework: null,
    buildCommand: "node vercel-build.js",
    outputDirectory: "dist-static",
    installCommand: "npm install",
    cleanUrls: true,
    trailingSlash: false,
    headers: [
      {
        source: "/assets/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      }
    ],
    rewrites: [
      // Explicit admin routes first
      ...adminRoutes.map(route => ({
        source: `/${route}`,
        destination: `/index.html`
      })),
      // Catch-all for other routes
      {
        source: "/((?!assets/|favicon|generated-icon|og-default-image|placeholder-|404).*)",
        destination: "/index.html"
      }
    ]
  };

  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Updated vercel.json with explicit admin routes');

  // Create a test HTML file to verify deployment
  const testContent = `<!DOCTYPE html>
<html>
<head>
  <title>Vercel Admin Test</title>
  <meta charset="utf-8">
</head>
<body>
  <h1>Admin Routes Test</h1>
  <p>If you can see this page, admin routing is working!</p>
  <h2>Test these admin routes:</h2>
  <ul>
    ${adminRoutes.map(route => `<li><a href="/${route}">/${route}</a></li>`).join('')}
  </ul>
  <script>
    console.log('Admin test page loaded successfully');
    // Test routing
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    
    if (currentPath.includes('/admin')) {
      console.log('✅ Admin route detected');
    }
  </script>
</body>
</html>`;

  fs.writeFileSync('dist-static/admin-test.html', testContent);
  console.log('✅ Created admin-test.html for verification');

  console.log(`\n🎉 Successfully fixed Vercel admin routing!`);
  console.log(`📊 Created ${createdFiles} admin route files`);
  console.log(`\n📝 Next steps:`);
  console.log(`1. Deploy to Vercel with updated configuration`);
  console.log(`2. Test admin routes: yoursite.vercel.app/admin-login`);
  console.log(`3. Check admin-test page: yoursite.vercel.app/admin-test.html`);
  console.log(`4. If still getting 404s, contact support with this error info\n`);

} catch (error) {
  console.error('❌ Error fixing Vercel admin routes:', error);
  process.exit(1);
}