#!/usr/bin/env node
/**
 * Complete Vercel build script with admin page support
 * Creates admin HTML files, applies JSX fixes, and prepares for deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Starting complete Vercel build with admin support...');

try {
  // Clean previous build
  if (fs.existsSync('dist-static')) {
    console.log('🧹 Cleaning previous build...');
    fs.rmSync('dist-static', { recursive: true, force: true });
  }

  // Set production environment variables
  process.env.NODE_ENV = 'production';
  process.env.VITE_NODE_ENV = 'production';

  // Build with static config
  console.log('🏗️ Building static site with admin support...');
  execSync('vite build --config vite.config.static.ts', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      VITE_NODE_ENV: 'production'
    }
  });

  // Apply JSX runtime polyfill fix
  console.log('🔧 Applying JSX runtime polyfill...');
  const jsxPolyfill = `
// JSX Runtime Polyfill for Vercel Static Deployment
(function() {
  if (typeof globalThis !== 'undefined' && !globalThis.jsx) {
    // Import React from global if available
    const React = globalThis.React || window.React;
    if (React && React.createElement) {
      globalThis.jsx = React.createElement;
      globalThis.jsxs = React.createElement;
      globalThis.jsxDEV = React.createElement;
      globalThis.Fragment = React.Fragment;
    }
  }
})();
`;

  // Read the main JS file and prepend JSX polyfill
  const assetsDir = 'dist-static/assets';
  if (fs.existsSync(assetsDir)) {
    const jsFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js'));
    jsFiles.forEach(file => {
      const filePath = path.join(assetsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('jsx') || content.includes('jsxs')) {
        fs.writeFileSync(filePath, jsxPolyfill + content);
        console.log(`✅ Applied JSX polyfill to ${file}`);
      }
    });
  }

  // Copy static assets
  console.log('📁 Copying static assets...');
  
  // Create favicon.ico if it doesn't exist
  const faviconIcoPath = 'dist-static/favicon.ico';
  if (!fs.existsSync(faviconIcoPath)) {
    // Create a simple ICO file (base64 encoded)
    const faviconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJUSURBVFhH7ZY9axRREMafJQQSCxsLwcJCG1sLG0uxsLCwsLGwsLCwsLGwsLCwsLCwsLGwsLCwsLCwsLGwsLCwsLGwsLCwsLGwsLCwsLGwsLCwsLCwsLGwsLCwsLCwsLGwsLCwsLCwsLGwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsA==';
    fs.writeFileSync(faviconIcoPath, Buffer.from(faviconBase64, 'base64'));
    console.log('✅ Created favicon.ico');
  }

  // Create favicon.svg
  const faviconSvgPath = 'dist-static/favicon.svg';
  const faviconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#1e40af" rx="4"/>
  <text x="16" y="22" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">বা</text>
</svg>`;
  fs.writeFileSync(faviconSvgPath, faviconSvg);
  console.log('✅ Created favicon.svg');

  // Create generated-icon.png
  const generatedIconPath = 'dist-static/generated-icon.png';
  if (fs.existsSync('generated-icon.png')) {
    fs.copyFileSync('generated-icon.png', generatedIconPath);
  } else {
    // Create a simple PNG icon (1x1 transparent pixel as placeholder)
    const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(generatedIconPath, transparentPng);
  }
  console.log('✅ Created generated-icon.png');

  // Create og-default-image.svg
  const ogImagePath = 'dist-static/og-default-image.svg';
  const ogImage = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#1e40af"/>
  <text x="600" y="330" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">Bengali News</text>
  <text x="600" y="380" font-family="Arial, sans-serif" font-size="24" fill="#e5e7eb" text-anchor="middle">বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম</text>
</svg>`;
  fs.writeFileSync(ogImagePath, ogImage);
  console.log('✅ Created og-default-image.svg');

  // Create placeholder SVGs for admin pages
  const placeholderSizes = [
    { name: 'placeholder-32x32.svg', width: 32, height: 32 },
    { name: 'placeholder-60x60.svg', width: 60, height: 60 },
    { name: 'placeholder-64x64.svg', width: 64, height: 64 },
    { name: 'placeholder-80x80.svg', width: 80, height: 80 },
    { name: 'placeholder-300x176.svg', width: 300, height: 176 },
    { name: 'placeholder-800x450.svg', width: 800, height: 450 }
  ];

  placeholderSizes.forEach(placeholder => {
    const placeholderPath = `dist-static/${placeholder.name}`;
    const placeholderSvg = `<svg width="${placeholder.width}" height="${placeholder.height}" viewBox="0 0 ${placeholder.width} ${placeholder.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${placeholder.width}" height="${placeholder.height}" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1"/>
  <text x="${placeholder.width/2}" y="${placeholder.height/2 + 5}" font-family="Arial, sans-serif" font-size="12" fill="#6b7280" text-anchor="middle">${placeholder.width}×${placeholder.height}</text>
</svg>`;
    fs.writeFileSync(placeholderPath, placeholderSvg);
    console.log(`✅ Created ${placeholder.name}`);
  });

  // Copy index-static.html to index.html for Vercel compatibility
  if (fs.existsSync('dist-static/index-static.html')) {
    fs.copyFileSync('dist-static/index-static.html', 'dist-static/index.html');
    console.log('✅ Created index.html for Vercel compatibility');
  }

  // Create ALL 32 admin HTML files directly in dist-static
  console.log('🔐 Creating all 32 admin HTML files...');
  
  // Get the template content from index.html
  const templatePath = 'dist-static/index.html';
  let templateContent = '';
  if (fs.existsSync(templatePath)) {
    templateContent = fs.readFileSync(templatePath, 'utf8');
  } else {
    console.error('❌ Template file not found: dist-static/index.html');
    process.exit(1);
  }

  // Define all 32 admin routes
  const adminRoutes = [
    'admin-access',
    'admin-login', 
    'admin-dashboard',
    'admin-articles',
    'admin-categories',
    'admin-epapers',
    'admin-breaking-news',
    'admin-videos',
    'admin-audio',
    'admin-audio-articles',
    'admin-users',
    'admin-analytics',
    'admin-trending',
    'admin-trending-analytics',
    'admin-settings',
    'admin-weather',
    'admin-algorithms',
    'admin-advanced-algorithms',
    'admin-comments',
    'admin-email',
    'admin-email-notifications',
    'admin-social-media',
    'admin-advertisement',
    'admin-advertisements',
    'admin-seo',
    'admin-search',
    'admin-database',
    'admin-performance',
    'admin-mobile-app',
    'admin-security',
    'admin-footer-pages',
    'admin-user-dashboard'
  ];

  let createdAdminFiles = 0;
  adminRoutes.forEach(route => {
    const adminHtmlPath = `dist-static/${route}.html`;
    
    // Customize content for each admin page
    let adminContent = templateContent;
    
    // Update title for admin pages
    const adminTitle = route.replace('admin-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    adminContent = adminContent.replace('<title>Bengali News</title>', `<title>Admin ${adminTitle} - Bengali News</title>`);
    
    // Add noindex meta tag for admin pages
    const noIndexMeta = '<meta name="robots" content="noindex, nofollow">';
    adminContent = adminContent.replace('<meta name="viewport"', noIndexMeta + '\n    <meta name="viewport"');
    
    fs.writeFileSync(adminHtmlPath, adminContent);
    createdAdminFiles++;
    console.log(`✅ Created ${route}.html`);
  });

  console.log(`✅ Created all ${createdAdminFiles} admin HTML files`);

  // Create admin verification page
  const adminVerificationPath = 'dist-static/admin-verification.html';
  const adminVerificationContent = `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Admin Route Verification - Bengali News</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 { text-align: center; margin-bottom: 30px; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        .route-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .route-link {
            color: white;
            text-decoration: none;
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
        }
        .route-link:hover {
            color: #ffd700;
            text-decoration: underline;
        }
        .route-desc {
            font-size: 0.9em;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Admin Route Verification (${createdAdminFiles} Routes)</h1>
        <div class="grid">
            ${adminRoutes.map(route => {
              const routeName = route.replace('admin-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return `
            <div class="route-card">
                <a href="/${route}" class="route-link">/${route}</a>
                <div class="route-desc">Admin ${routeName}</div>
            </div>`;
            }).join('')}
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <a href="/admin-login" style="background: white; color: #667eea; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Admin Login</a>
        </div>
    </div>
</body>
</html>`;
  fs.writeFileSync(adminVerificationPath, adminVerificationContent);
  console.log('✅ Created admin-verification.html');

  // Create 404.html for proper client-side routing fallback
  const notFoundPath = 'dist-static/404.html';
  const notFoundContent = `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>পৃষ্ঠা খুঁজে পাওয়া যায়নি - Bengali News</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 50px 20px;
            margin: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        h1 { font-size: 3em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; }
        .btn {
            background: white;
            color: #667eea;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            transition: transform 0.3s;
        }
        .btn:hover { transform: scale(1.05); }
    </style>
</head>
<body>
    <div class="container">
        <h1>৪০৪</h1>
        <p>দুঃখিত, আপনার অনুরোধকৃত পৃষ্ঠাটি খুঁজে পাওয়া যায়নি।</p>
        <a href="/" class="btn">হোমপেজে ফিরে যান</a>
    </div>
    <script>
        // Auto-redirect after 5 seconds
        setTimeout(() => {
            window.location.href = '/';
        }, 5000);
    </script>
</body>
</html>`;
  fs.writeFileSync(notFoundPath, notFoundContent);
  console.log('✅ Created 404.html for client-side routing');

  // Apply storage cleanup to ALL HTML pages
  console.log('🔧 Injecting storage cleanup script to all pages...');
  const htmlFiles = fs.readdirSync('dist-static').filter(file => file.endsWith('.html'));
  
  const storageCleanup = `
<script>
// Storage cleanup for production deployment
(function() {
  try {
    console.log('🧹 Starting storage cleanup...');
    let cleanedCount = 0;
    
    // Clean corrupted localStorage entries
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            JSON.parse(value);
          }
        } catch (e) {
          console.warn('🗑️ Removing corrupted localStorage key:', key, e);
          localStorage.removeItem(key);
          cleanedCount++;
        }
      }
    }
    
    if (cleanedCount > 0) {
      console.log(\`✅ Cleaned up \${cleanedCount} corrupted storage entries\`);
    } else {
      console.log('✅ No corrupted storage entries found');
    }
  } catch (error) {
    console.warn('Storage cleanup failed:', error);
  }
})();
</script>`;

  htmlFiles.forEach(htmlFile => {
    const htmlPath = `dist-static/${htmlFile}`;
    if (fs.existsSync(htmlPath)) {
      let htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Insert before closing head tag
      htmlContent = htmlContent.replace('</head>', storageCleanup + '\n</head>');
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`✅ Added storage cleanup script to ${htmlFile}`);
    }
  });

  console.log('✅ Complete Vercel build finished successfully!');
  console.log('📦 Output directory: dist-static/');
  console.log(`🔐 All ${createdAdminFiles} admin pages ready for static deployment`);
  console.log(`📄 Total HTML files created: ${htmlFiles.length + 1} (including verification page)`);
  
  // List built files
  const files = fs.readdirSync('dist-static');
  console.log('📄 Built files:', files.length, 'items');

  // Calculate bundle size
  const statsPath = 'dist-static/assets';
  if (fs.existsSync(statsPath)) {
    const assetFiles = fs.readdirSync(statsPath);
    let totalSize = 0;
    assetFiles.forEach(file => {
      const filePath = path.join(statsPath, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });
    console.log(`📊 Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  }

  console.log('🎉 Ready for Vercel deployment with complete admin support!');
  console.log('📋 Test admin routes: /admin-verification.html');
  console.log('🔐 Admin login: /admin-login');

} catch (error) {
  console.error('❌ Complete build failed:', error.message);
  process.exit(1);
}