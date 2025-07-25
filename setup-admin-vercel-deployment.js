#!/usr/bin/env node
/**
 * Complete Admin Vercel Deployment Setup
 * Creates all missing admin HTML files and updates vercel.json for proper routing
 * Following the same pattern as public pages (about.html, contact.html)
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Setting up ALL admin files for Vercel deployment...\n');

// Complete list of admin routes from AdminApp.tsx
const adminRoutes = [
  // Main admin routes
  { route: 'admin-login', file: 'admin-login.html', component: 'AdminLogin' },
  { route: 'admin-dashboard', file: 'admin-dashboard.html', component: 'AdminDashboard' },
  { route: 'admin-access', file: 'admin-access.html', component: 'EnhancedAdminAccess' },
  
  // Content Management
  { route: 'admin/articles', file: 'admin-articles.html', component: 'ArticlesAdminPage' },
  { route: 'admin/categories', file: 'admin-categories.html', component: 'CategoriesAdminPage' },
  { route: 'admin/epapers', file: 'admin-epapers.html', component: 'EPapersAdminPage' },
  { route: 'admin/breaking-news', file: 'admin-breaking-news.html', component: 'BreakingNewsAdminPage' },
  { route: 'admin/videos', file: 'admin-videos.html', component: 'VideosAdminPage' },
  { route: 'admin/audio', file: 'admin-audio.html', component: 'AudioArticlesAdminPage' },
  { route: 'admin/audio-articles', file: 'admin-audio-articles.html', component: 'AudioArticlesAdminPage' },
  
  // User & Analytics
  { route: 'admin/users', file: 'admin-users.html', component: 'UsersAdminPage' },
  { route: 'admin/analytics', file: 'admin-analytics.html', component: 'AnalyticsAdminPage' },
  { route: 'admin/trending', file: 'admin-trending.html', component: 'TrendingAnalyticsPage' },
  { route: 'admin/trending-analytics', file: 'admin-trending-analytics.html', component: 'TrendingAnalyticsPage' },
  
  // System Management
  { route: 'admin/settings', file: 'admin-settings.html', component: 'SettingsAdminPage' },
  { route: 'admin/weather', file: 'admin-weather.html', component: 'WeatherAdminPage' },
  { route: 'admin/algorithms', file: 'admin-algorithms.html', component: 'AdvancedAlgorithmsPage' },
  { route: 'admin/advanced-algorithms', file: 'admin-advanced-algorithms.html', component: 'AdvancedAlgorithmsPage' },
  
  // Communication & Content
  { route: 'admin/comments', file: 'admin-comments.html', component: 'CommentManagementPage' },
  { route: 'admin/email', file: 'admin-email.html', component: 'EmailNotificationPage' },
  { route: 'admin/email-notifications', file: 'admin-email-notifications.html', component: 'EmailNotificationPage' },
  { route: 'admin/social-media', file: 'admin-social-media.html', component: 'SocialMediaAdminPage' },
  
  // Advanced Management
  { route: 'admin/advertisement', file: 'admin-advertisement.html', component: 'AdvertisementManagementPage' },
  { route: 'admin/advertisements', file: 'admin-advertisements.html', component: 'AdvertisementManagementPage' },
  { route: 'admin/seo', file: 'admin-seo.html', component: 'SEOManagementPage' },
  { route: 'admin/search', file: 'admin-search.html', component: 'SearchManagementPage' },
  { route: 'admin/database', file: 'admin-database.html', component: 'DatabaseManagementPage' },
  { route: 'admin/performance', file: 'admin-performance.html', component: 'PerformanceMonitoringPage' },
  { route: 'admin/mobile-app', file: 'admin-mobile-app.html', component: 'MobileAppManagementPage' },
  { route: 'admin/security', file: 'admin-security.html', component: 'SecurityAccessControlPage' },
  { route: 'admin/footer-pages', file: 'admin-footer-pages.html', component: 'FooterPagesAdminPage' },
  { route: 'admin/user-dashboard', file: 'admin-user-dashboard.html', component: 'UserDashboardAdminPage' },
];

console.log(`📊 Total admin routes to configure: ${adminRoutes.length}`);

// Read the template HTML file (use admin-dashboard.html as template)
const templateFile = 'dist-static/admin-dashboard.html';
if (!fs.existsSync(templateFile)) {
  console.error('❌ Template file not found:', templateFile);
  console.log('💡 Using index.html as fallback template...');
  
  // Use index.html as template if admin-dashboard.html doesn't exist
  const indexTemplate = 'dist-static/index.html';
  if (!fs.existsSync(indexTemplate)) {
    console.error('❌ No template files found! Please run build first.');
    process.exit(1);
  }
  
  // Copy index.html to admin-dashboard.html first
  const indexContent = fs.readFileSync(indexTemplate, 'utf8');
  fs.writeFileSync(templateFile, indexContent);
  console.log('✅ Created admin-dashboard.html from index.html template');
}

const templateContent = fs.readFileSync(templateFile, 'utf8');
let createdFiles = 0;
let skippedFiles = 0;

// Create all admin HTML files
console.log('\n📁 Creating admin HTML files...');
adminRoutes.forEach(({ route, file, component }) => {
  const filePath = `dist-static/${file}`;
  
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  Skip: ${file} (already exists)`);
    skippedFiles++;
  } else {
    // Create the HTML file with proper title and meta data
    const customContent = templateContent
      .replace(/<title>.*?<\/title>/, `<title>Admin ${component} - Bengali News</title>`)
      .replace(/<meta name="description" content=".*?"/, `<meta name="description" content="Admin ${component} - Bengali News Website Administration"`);
    
    fs.writeFileSync(filePath, customContent);
    console.log(`✅ Created: ${file}`);
    createdFiles++;
  }
});

// Update vercel.json with all admin routes
console.log('\n🔧 Updating vercel.json with admin routes...');

let vercelConfig;
try {
  vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
} catch (error) {
  console.error('❌ Could not read vercel.json:', error.message);
  process.exit(1);
}

// Create rewrites for all admin routes
const adminRewrites = adminRoutes.map(({ route, file }) => ({
  source: `/${route}`,
  destination: `/${file}`
}));

// Remove existing admin rewrites (except catch-all patterns)
const existingRewrites = vercelConfig.rewrites || [];
const nonAdminRewrites = existingRewrites.filter(rewrite => 
  !rewrite.source.includes('admin') || 
  rewrite.source === '/admin/(.*)' || 
  rewrite.source === '/(.*)'
);

// Combine all rewrites: public pages + admin pages + catch-alls
vercelConfig.rewrites = [
  // Public page rewrites first
  ...nonAdminRewrites.filter(r => !r.source.includes('(.*)')),
  // Admin page rewrites
  ...adminRewrites,
  // Catch-all patterns last
  { source: "/admin/(.*)", destination: "/admin-dashboard.html" },
  { source: "/(.*)", destination: "/index.html" }
];

// Write updated vercel.json
fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));

console.log('\n📊 ADMIN VERCEL DEPLOYMENT SETUP COMPLETE!');
console.log(`✅ Admin HTML files created: ${createdFiles}`);
console.log(`⏭️  Files already existed: ${skippedFiles}`);
console.log(`📝 Total admin routes configured: ${adminRoutes.length}`);
console.log(`🔧 vercel.json updated with ${adminRewrites.length} admin rewrites`);

// Create verification file
const verificationContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Routes Verification - Bengali News</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    .route-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin: 20px 0; }
    .route-item { background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 4px solid #10b981; }
    .route-item a { text-decoration: none; color: #1f2937; font-weight: 500; }
    .route-item a:hover { color: #2563eb; }
    .status { background: #dcfce7; color: #166534; padding: 8px 12px; border-radius: 4px; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 Admin Routes Verification</h1>
    <p>This page verifies all admin routes are properly configured for Vercel static deployment.</p>
    
    <div class="status">
      ✅ All ${adminRoutes.length} admin routes configured and ready for deployment
    </div>
    
    <h2>📋 Available Admin Routes:</h2>
    <div class="route-list">
      ${adminRoutes.map(({ route, component }) => `
        <div class="route-item">
          <a href="/${route}" target="_blank">/${route}</a>
          <br><small style="color: #6b7280;">${component}</small>
        </div>
      `).join('')}
    </div>
    
    <h2>🚀 Deployment Status:</h2>
    <ul>
      <li>✅ ${createdFiles} new admin HTML files created</li>
      <li>✅ ${skippedFiles} existing files verified</li>
      <li>✅ vercel.json updated with all routes</li>
      <li>✅ Ready for Vercel static hosting</li>
    </ul>
    
    <h2>🧪 Test Instructions:</h2>
    <ol>
      <li>Deploy to Vercel using: <code>vercel --prod</code></li>
      <li>Test admin login: <code>yoursite.vercel.app/admin-login</code></li>
      <li>Test admin routes from the list above</li>
      <li>Verify admin authentication works</li>
    </ol>
  </div>
</body>
</html>`;

fs.writeFileSync('dist-static/admin-verification.html', verificationContent);

console.log('\n🧪 Created admin verification page: /admin-verification.html');
console.log('\n🎉 Your admin system is now ready for Vercel deployment!');
console.log('\n📋 Next steps:');
console.log('1. Commit changes: git add . && git commit -m "Setup all admin routes for Vercel"');
console.log('2. Deploy: vercel --prod');
console.log('3. Test: yoursite.vercel.app/admin-verification.html');
console.log('4. Admin login: yoursite.vercel.app/admin-login');