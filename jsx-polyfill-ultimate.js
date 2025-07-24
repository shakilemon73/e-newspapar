#!/usr/bin/env node
/**
 * Ultimate JSX Runtime Polyfill for Vercel Deployment
 * This creates a comprehensive polyfill that works in all scenarios
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createUltimateJSXPolyfill() {
  console.log('🔧 Creating ultimate JSX runtime polyfill...');
  
  const polyfillCode = `
    <!-- Ultimate JSX Runtime Polyfill - Guaranteed to work -->
    <script>
      // Pre-load React error handling
      window.onerror = function(msg, url, lineNo, columnNo, error) {
        if (msg.includes('jsx is not defined') || msg.includes('jsxDEV is not a function')) {
          console.warn('JSX runtime error caught, initializing polyfill...');
          initializeJSXPolyfill();
        }
        return false;
      };
      
      function initializeJSXPolyfill() {
        // Create jsx runtime functions using basic createElement
        if (typeof React !== 'undefined' && React.createElement) {
          window.jsx = function(type, props, key) {
            if (key !== undefined) {
              props = props || {};
              props.key = key;
            }
            if (props && typeof props.children !== 'undefined') {
              const { children, ...rest } = props;
              return React.createElement(type, rest, children);
            }
            return React.createElement(type, props);
          };
          
          window.jsxs = window.jsx;
          window.jsxDEV = window.jsx;
          window.Fragment = React.Fragment || 'div';
          
          // Global assignments for modules
          if (typeof globalThis !== 'undefined') {
            globalThis.jsx = window.jsx;
            globalThis.jsxs = window.jsxs;
            globalThis.jsxDEV = window.jsxDEV;
            globalThis.Fragment = window.Fragment;
          }
          
          console.log('✅ Ultimate JSX polyfill active');
          return true;
        }
        return false;
      }
      
      // Try to initialize immediately
      if (!initializeJSXPolyfill()) {
        // Wait for React to load
        let retries = 0;
        const waitForReact = setInterval(() => {
          if (initializeJSXPolyfill() || retries++ > 50) {
            clearInterval(waitForReact);
          }
        }, 100);
      }
    </script>
    
    <!-- Load React UMD from reliable CDN -->
    <script crossorigin src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
    
    <script>
      // Ensure polyfill is active after React loads
      if (typeof React !== 'undefined') {
        initializeJSXPolyfill();
      }
    </script>
  `;
  
  return polyfillCode.trim();
}

// Apply the ultimate polyfill to index-static.html
const staticHtmlPath = path.join(__dirname, 'client', 'index-static.html');
if (fs.existsSync(staticHtmlPath)) {
  let content = fs.readFileSync(staticHtmlPath, 'utf8');
  
  // Replace existing JSX polyfill section
  const polyfillStart = content.indexOf('<!-- JSX Runtime Polyfill');
  const polyfillEnd = content.indexOf('</script>', polyfillStart);
  
  if (polyfillStart !== -1 && polyfillEnd !== -1) {
    const beforePolyfill = content.substring(0, polyfillStart);
    const afterPolyfill = content.substring(polyfillEnd + 9);
    
    content = beforePolyfill + createUltimateJSXPolyfill() + afterPolyfill;
    
    fs.writeFileSync(staticHtmlPath, content);
    console.log('✅ Applied ultimate JSX Runtime polyfill to index-static.html');
  }
}

export { createUltimateJSXPolyfill };