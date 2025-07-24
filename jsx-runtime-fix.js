#!/usr/bin/env node
/**
 * JSX Runtime Fix for Vercel Deployment
 * Fixes the "jsxDEV is not a function" error by properly transforming JSX runtime calls
 */

import fs from 'fs';
import path from 'path';

export function fixJSXRuntime(distPath) {
  console.log('🔧 Applying comprehensive JSX runtime fixes...');
  
  const assetsDir = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.warn('⚠️ Assets directory not found');
    return;
  }

  const jsFiles = fs.readdirSync(assetsDir)
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(assetsDir, file));

  jsFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Fix common JSX runtime issues with comprehensive patterns
      const fixes = [
        // Fix jsxDEV function calls (most common issue)
        { from: /e\.jsxDEV/g, to: 'jsx' },
        { from: /\.jsxDEV\(/g, to: '.jsx(' },
        { from: /jsxDEV\(/g, to: 'jsx(' },
        
        // Fix jsx and jsxs references that may be scoped incorrectly
        { from: /\be\.jsx\b/g, to: 'jsx' },
        { from: /\be\.jsxs\b/g, to: 'jsxs' },
        
        // Fix undefined jsx references - key fix for Vercel
        { from: /(?<![\w$.])\bjsx\(/g, to: 'window.jsx(' },
        { from: /(?<![\w$.])\bjsxs\(/g, to: 'window.jsxs(' },
        
        // Fix potential development vs production JSX runtime issues
        { from: /\.jsxDEV\b/g, to: '.jsx' },
        { from: /\bjsxDEV\b/g, to: 'jsx' },
        
        // Fix module scope issues in production builds
        { from: /\bconst jsx\s*=/g, to: 'window.jsx = window.jsx ||' },
        { from: /\bconst jsxs\s*=/g, to: 'window.jsxs = window.jsxs ||' },
      ];

      fixes.forEach(({ from, to }) => {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      });

      // Add JSX runtime initialization for production environment
      if (modified && content.includes('jsx(')) {
        // Add JSX runtime globals at the beginning of the file
        const jsxRuntimeInit = `
// JSX Runtime Fix for Vercel Production
if (typeof window !== 'undefined' && !window.jsx) {
  import('https://esm.sh/react@18.3.1/jsx-runtime').then(({ jsx, jsxs, Fragment }) => {
    window.jsx = jsx;
    window.jsxs = jsxs;
    window.Fragment = Fragment;
  });
}
`;
        content = jsxRuntimeInit + content;
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed JSX runtime in ${path.basename(filePath)}`);
      }
    } catch (error) {
      console.warn(`⚠️ Could not process ${filePath}: ${error.message}`);
    }
  });

  console.log('✅ JSX runtime fixes completed');
}