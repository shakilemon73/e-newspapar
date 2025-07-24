#!/usr/bin/env node
/**
 * JSX Runtime Fix for Vercel Deployment
 * Fixes the "jsxDEV is not a function" error by properly transforming JSX runtime calls
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

      // Fix common JSX runtime issues - simplified approach
      const fixes = [
        // Fix jsxDEV function calls (most common issue)
        { from: /e\.jsxDEV/g, to: 'jsx' },
        { from: /\.jsxDEV\(/g, to: '.jsx(' },
        { from: /jsxDEV\(/g, to: 'jsx(' },
        
        // Fix jsx and jsxs references that may be scoped incorrectly
        { from: /\be\.jsx\b/g, to: 'jsx' },
        { from: /\be\.jsxs\b/g, to: 'jsxs' },
        
        // Fix potential development vs production JSX runtime issues
        { from: /\.jsxDEV\b/g, to: '.jsx' },
        { from: /\bjsxDEV\b/g, to: 'jsx' },
      ];

      fixes.forEach(({ from, to }) => {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      });

      // Don't add any runtime initialization to JS files
      // The HTML polyfill will handle JSX runtime loading

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