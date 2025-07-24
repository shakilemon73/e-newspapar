#!/usr/bin/env node
/**
 * Comprehensive JSX Runtime Fix for Vercel Deployment
 * Fixes all JSX and ES module issues by replacing them with working alternatives
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixAllJSXRuntimeIssues() {
  console.log('🔧 Applying comprehensive JSX runtime fixes...');
  
  const distDir = path.join(__dirname, 'dist-static');
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist-static directory not found');
    return;
  }
  
  // Find all JavaScript files
  const jsFiles = fs.readdirSync(path.join(distDir, 'assets'))
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(distDir, 'assets', file));
  
  jsFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;
      
      // Replace all JSX runtime imports and exports
      const fixes = [
        // Fix jsx imports
        {
          pattern: /import\s*{\s*jsx\s*,?\s*jsxs?\s*,?\s*Fragment?\s*}\s*from\s*['"][^'"]*jsx-runtime['"];?/g,
          replacement: '// JSX runtime handled by global polyfill'
        },
        {
          pattern: /import\s*{\s*jsxDEV\s*}\s*from\s*['"][^'"]*jsx-dev-runtime['"];?/g,
          replacement: '// JSX dev runtime handled by global polyfill'
        },
        // Fix jsx calls - replace with global window functions
        {
          pattern: /\bjsx\s*\(/g,
          replacement: '(window.jsx||globalThis.jsx)('
        },
        {
          pattern: /\bjsxs\s*\(/g,
          replacement: '(window.jsxs||globalThis.jsxs)('
        },
        {
          pattern: /\bjsxDEV\s*\(/g,
          replacement: '(window.jsxDEV||globalThis.jsxDEV)('
        },
        // Fix React imports that might be problematic
        {
          pattern: /import\s+\*\s+as\s+React\s+from\s*['"]react['"];?/g,
          replacement: 'const React = window.React || globalThis.React;'
        },
        {
          pattern: /import\s+React\s+from\s*['"]react['"];?/g,
          replacement: 'const React = window.React || globalThis.React;'
        },
        // Fix Fragment references
        {
          pattern: /React\.Fragment/g,
          replacement: '(React.Fragment || "div")'
        },
        // Fix export statements that might cause issues
        {
          pattern: /export\s*{\s*[^}]*jsx[^}]*\s*}\s*;?/g,
          replacement: '// Exports handled by global polyfill'
        }
      ];
      
      fixes.forEach(fix => {
        const originalContent = content;
        content = content.replace(fix.pattern, fix.replacement);
        if (content !== originalContent) {
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed JSX runtime in ${path.basename(filePath)}`);
      }
      
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  });
  
  // Create enhanced index.html with bulletproof JSX polyfill
  const indexPath = path.join(distDir, 'index.html');
  createEnhancedIndexHTML(indexPath);
}

function createEnhancedIndexHTML(indexPath) {
  const enhancedHTML = `<!DOCTYPE html>
<html lang="bn" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/generated-icon.png" />
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
    
    <!-- Storage Cleanup Script - Fix JSON parse errors FIRST -->
    <script>
      function cleanupCorruptedStorage() {
        console.log('🧹 Starting storage cleanup...');
        
        const keysToCheck = [
          'supabase.auth.token', 'sb-auth-token', 'userSettings', 'theme', 'language',
          ...Object.keys(localStorage).filter(key => key.startsWith('sb-'))
        ];

        let cleanedCount = 0;
        keysToCheck.forEach(key => {
          try {
            const value = localStorage.getItem(key);
            if (value && value !== 'null' && value !== 'undefined') {
              JSON.parse(value);
            }
          } catch (error) {
            console.warn('🗑️ Removing corrupted localStorage key: ' + key, error);
            try {
              localStorage.removeItem(key);
              cleanedCount++;
            } catch (removeError) {
              console.error('Failed to remove corrupted key ' + key + ':', removeError);
            }
          }
        });

        if (cleanedCount > 0) {
          console.log('✅ Cleaned up ' + cleanedCount + ' corrupted storage entries');
        } else {
          console.log('✅ No corrupted storage entries found');
        }
      }
      
      // Run storage cleanup immediately
      cleanupCorruptedStorage();
    </script>

    <!-- Bulletproof JSX Runtime Polyfill -->
    <script>
      // Global error handler for JSX issues
      window.onerror = function(msg, url, lineNo, columnNo, error) {
        if (msg.includes('jsx is not defined') || 
            msg.includes('jsxDEV is not a function') || 
            msg.includes('Unexpected token')) {
          console.warn('JSX runtime error caught, ensuring polyfill is active...');
          ensureJSXPolyfill();
        }
        return false;
      };
      
      function ensureJSXPolyfill() {
        // Create bulletproof jsx functions
        if (typeof React !== 'undefined' && React.createElement) {
          const createJSXFunction = function(isDev) {
            return function(type, props, key) {
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
                console.warn('JSX function error:', e);
                return React.createElement('div', { children: 'Render Error' });
              }
            };
          };
          
          // Create global functions
          window.jsx = window.jsx || createJSXFunction(false);
          window.jsxs = window.jsxs || createJSXFunction(false);
          window.jsxDEV = window.jsxDEV || createJSXFunction(true);
          window.Fragment = window.Fragment || React.Fragment || 'div';
          
          // Ensure global scope access
          if (typeof globalThis !== 'undefined') {
            globalThis.jsx = window.jsx;
            globalThis.jsxs = window.jsxs; 
            globalThis.jsxDEV = window.jsxDEV;
            globalThis.Fragment = window.Fragment;
            globalThis.React = React;
            globalThis.ReactDOM = ReactDOM;
          }
          
          console.log('✅ Bulletproof JSX polyfill active');
          return true;
        }
        return false;
      }
      
      // Initialize immediately if React available
      if (typeof React !== 'undefined') {
        ensureJSXPolyfill();
      }
    </script>
    
    <!-- Load React UMD from reliable CDN -->
    <script crossorigin src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
    
    <script>
      // Ensure polyfill after React loads
      if (typeof React !== 'undefined') {
        ensureJSXPolyfill();
      } else {
        // Poll for React
        let attempts = 0;
        const checkReact = setInterval(() => {
          if (typeof React !== 'undefined' || attempts++ > 50) {
            clearInterval(checkReact);
            if (typeof React !== 'undefined') {
              ensureJSXPolyfill();
            }
          }
        }, 100);
      }
    </script>
    
    <style>
      /* Critical CSS for Bengali fonts and loading state */
      body {
        font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #ffffff;
        color: #1a1a1a;
      }
      
      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-size: 1.2rem;
        background: linear-gradient(45deg, #f0f9ff, #e0f2fe);
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
    <script type="module" src="/src/main-static.tsx"></script>
  </body>
</html>`;

  fs.writeFileSync(indexPath, enhancedHTML);
  console.log('✅ Created enhanced index.html with bulletproof JSX polyfill');
}

// Run the comprehensive fix
fixAllJSXRuntimeIssues();