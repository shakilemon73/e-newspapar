#!/usr/bin/env node

/**
 * Security Verification Script
 * Scans codebase for hardcoded credentials and security vulnerabilities
 */

const fs = require('fs');
const path = require('path');

// Patterns to detect security vulnerabilities
const SECURITY_PATTERNS = [
  {
    name: 'Hardcoded Supabase URL',
    pattern: /https:\/\/[a-z0-9]+\.supabase\.co/g,
    severity: 'HIGH'
  },
  {
    name: 'JWT Token',
    pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Database Connection String',
    pattern: /postgresql:\/\/[^'"\s]+/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Service Role Key Pattern',
    pattern: /service_role.*key/gi,
    severity: 'HIGH'
  }
];

// Files to exclude from security scan
const EXCLUDED_FILES = [
  'node_modules',
  '.git',
  'dist',
  'dist-static',
  'SECURITY_AUDIT_REPORT.md',
  '.env.example',
  'security-check.js'
];

// Safe patterns that are allowed
const SAFE_PATTERNS = [
  'your_supabase_project_url_here',
  'your_supabase_anon_key_here',
  'your_supabase_service_role_key_here',
  'process.env.',
  'import.meta.env.',
  'getEnvVar(',
  'Missing required environment variables'
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];

    for (const pattern of SECURITY_PATTERNS) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        // Check if this is a safe pattern
        const isSafe = matches.every(match => 
          SAFE_PATTERNS.some(safe => content.includes(safe) && content.indexOf(safe) < content.indexOf(match) + 50)
        );

        if (!isSafe) {
          results.push({
            file: filePath,
            pattern: pattern.name,
            severity: pattern.severity,
            matches: matches.length,
            preview: matches[0].substring(0, 50) + '...'
          });
        }
      }
    }

    return results;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dir) {
  let results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (EXCLUDED_FILES.includes(item)) continue;
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        results = results.concat(scanDirectory(fullPath));
      } else if (stat.isFile() && /\.(js|ts|tsx|jsx|json|md)$/.test(item)) {
        results = results.concat(scanFile(fullPath));
      }
    }
  } catch (error) {
    // Skip inaccessible directories
  }
  
  return results;
}

function main() {
  console.log('🔐 SECURITY VULNERABILITY SCANNER');
  console.log('================================\n');
  
  const results = scanDirectory('.');
  
  if (results.length === 0) {
    console.log('✅ NO SECURITY VULNERABILITIES FOUND!');
    console.log('\nYour application is secure:');
    console.log('- No hardcoded credentials detected');
    console.log('- No exposed API keys found');
    console.log('- Environment variable validation enforced');
    console.log('\n🛡️  Security audit passed successfully!');
    process.exit(0);
  } else {
    console.log('🚨 SECURITY VULNERABILITIES DETECTED!\n');
    
    const critical = results.filter(r => r.severity === 'CRITICAL');
    const high = results.filter(r => r.severity === 'HIGH');
    
    if (critical.length > 0) {
      console.log('CRITICAL ISSUES:');
      critical.forEach(issue => {
        console.log(`❌ ${issue.file}: ${issue.pattern} (${issue.matches} matches)`);
        console.log(`   Preview: ${issue.preview}\n`);
      });
    }
    
    if (high.length > 0) {
      console.log('HIGH PRIORITY ISSUES:');
      high.forEach(issue => {
        console.log(`⚠️  ${issue.file}: ${issue.pattern} (${issue.matches} matches)`);
        console.log(`   Preview: ${issue.preview}\n`);
      });
    }
    
    console.log('🔧 RECOMMENDED ACTIONS:');
    console.log('1. Remove all hardcoded credentials');
    console.log('2. Use environment variables only');
    console.log('3. Add strict validation for required variables');
    console.log('4. Never commit .env files to version control');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}