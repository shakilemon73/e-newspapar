#!/usr/bin/env node
/**
 * Vercel Deployment Fix - Create proper index.html for SPA routing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createVercelCompatibleHTML() {
  console.log('🔧 Creating Vercel-compatible index.html...');
  
  const distDir = path.join(__dirname, 'dist-static');
  const assetsDir = path.join(distDir, 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    console.error('❌ Assets directory not found');
    return;
  }
  
  // Find the main JS and CSS files
  const assets = fs.readdirSync(assetsDir);
  const mainJS = assets.find(file => file.startsWith('main-') && file.endsWith('.js'));
  const mainCSS = assets.find(file => file.startsWith('main-') && file.endsWith('.css'));
  
  if (!mainJS || !mainCSS) {
    console.error('❌ Main assets not found');
    return;
  }
  
  console.log(`📄 Found assets: ${mainJS}, ${mainCSS}`);
  
  const html = `<!DOCTYPE html>
<html lang="bn" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/generated-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র - Bengali News Website" />
    <meta name="keywords" content="বাংলা সংবাদ, Bangladesh news, bengali news, dhaka news, bd news" />
    <meta name="author" content="Bengali News Team" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="Bengali News - বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র" />
    <meta property="og:description" content="সর্বশেষ সংবাদ, রাজনীতি, খেলা, বিনোদন, আন্তর্জাতিক এবং আরো অনেক কিছু" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/generated-icon.png" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Bengali News - বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র" />
    <meta name="twitter:description" content="সর্বশেষ সংবাদ, রাজনীতি, খেলা, বিনোদন, আন্তর্জাতিক এবং আরো অনেক কিছু" />
    <meta name="twitter:image" content="/generated-icon.png" />
    
    <!-- Bengali Font Support -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <title>Bengali News - বাংলাদেশের সর্বাধিক পঠিত অনলাইন সংবাদপত্র</title>
    
    <!-- Load CSS first -->
    <link rel="stylesheet" crossorigin href="/assets/${mainCSS}">
    
    <!-- Essential Environment Variables -->
    <script>
      window.ENV = {
        VITE_SUPABASE_URL: 'https://ewxyqbisowrgqtnbkqmy.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3eHlxYmlzb3dyZ3F0bmJrcW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE2NzUxMjksImV4cCI6MjAzNzI1MTEyOX0.VoWj5wOHJxWQfEJ8vvdyHfAywJ5G0KD5nmdRPwBpbT0',
        NODE_ENV: 'production'
      };
    </script>
    
    <!-- Storage Cleanup -->
    <script>
      try {
        const keysToCheck = ['theme', 'userSettings', 'supabase.auth.token'];
        keysToCheck.forEach(key => {
          try {
            const value = localStorage.getItem(key);
            if (value && value !== 'null') JSON.parse(value);
          } catch (e) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Storage cleanup failed:', e);
      }
    </script>
    
    <!-- React UMD Loading -->
    <script crossorigin src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
    
    <!-- JSX Runtime Polyfill -->
    <script>
      if (typeof React !== 'undefined' && React.createElement) {
        window.jsx = window.jsxs = window.jsxDEV = function(type, props, key) {
          if (!type) return null;
          try {
            let finalProps = props || {};
            if (key !== undefined) finalProps.key = key;
            if (finalProps.children !== undefined) {
              const { children, ...rest } = finalProps;
              return React.createElement(type, rest, children);
            }
            return React.createElement(type, finalProps);
          } catch (e) {
            return React.createElement('div', { children: 'Error' });
          }
        };
        window.Fragment = React.Fragment || 'div';
        if (typeof globalThis !== 'undefined') {
          globalThis.jsx = globalThis.jsxs = globalThis.jsxDEV = window.jsx;
          globalThis.Fragment = window.Fragment;
          globalThis.React = React;
          globalThis.ReactDOM = ReactDOM;
        }
      }
    </script>
    
    <style>
      body { 
        font-family: 'Noto Sans Bengali', sans-serif; 
        margin: 0; 
        padding: 0; 
        background: #fff; 
        color: #1a1a1a; 
      }
      .loading { 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100vh; 
        font-size: 1.2rem; 
      }
      .loading-spinner { 
        width: 40px; 
        height: 40px; 
        border: 4px solid #e5e7eb; 
        border-top: 4px solid #3b82f6; 
        border-radius: 50%; 
        animation: spin 1s linear infinite; 
        margin-right: 12px; 
      }
      @keyframes spin { 
        0% { transform: rotate(0deg); } 
        100% { transform: rotate(360deg); } 
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="loading">
        <div class="loading-spinner"></div>
        <span>Bengali News লোড হচ্ছে...</span>
      </div>
    </div>
    
    <!-- Load Main Application -->
    <script type="module" crossorigin src="/assets/${mainJS}"></script>
  </body>
</html>`;

  const indexPath = path.join(distDir, 'index.html');
  fs.writeFileSync(indexPath, html);
  console.log('✅ Created Vercel-compatible index.html');
  
  // Also create a more specific vercel.json
  const vercelConfig = {
    "version": 2,
    "framework": null,
    "buildCommand": "node vercel-build.js",
    "outputDirectory": "dist-static",
    "installCommand": "npm install",
    "cleanUrls": true,
    "trailingSlash": false,
    "headers": [
      {
        "source": "/assets/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ],
    "rewrites": [
      {
        "source": "/((?!assets/|favicon|generated-icon|og-default-image|placeholder-).*)",
        "destination": "/index.html"
      }
    ]
  };
  
  const vercelConfigPath = path.join(__dirname, 'vercel.json');
  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Updated vercel.json with simplified rewrites');
}

createVercelCompatibleHTML();