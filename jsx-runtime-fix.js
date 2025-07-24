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

      // Fix common JSX runtime issues
      const fixes = [
        // Fix jsxDEV function calls
        { from: /e\.jsxDEV/g, to: 'jsx' },
        { from: /\.jsxDEV\(/g, to: '.jsx(' },
        { from: /jsxDEV\(/g, to: 'jsx(' },
        
        // Fix jsx and jsxs references
        { from: /\be\.jsx\b/g, to: 'jsx' },
        { from: /\be\.jsxs\b/g, to: 'jsxs' },
        
        // Fix React import issues
        { from: /import\s*\{\s*jsx,\s*jsxs\s*\}\s*from\s*["']react\/jsx-runtime["'];?/g, to: '' },
        { from: /import\s*\{\s*jsx\s*\}\s*from\s*["']react\/jsx-runtime["'];?/g, to: '' },
      ];

      fixes.forEach(({ from, to }) => {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      });

      // Add proper React import at the beginning
      if (modified && !content.includes('import React')) {
        content = 'import React from "react";\nimport{jsx,jsxs}from"react/jsx-runtime";\n' + content;
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