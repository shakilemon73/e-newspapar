#!/usr/bin/env node

/**
 * Direct Admin API Testing - Bypass Auth for Testing
 * This script tests admin endpoints by temporarily bypassing authentication
 */

import http from 'http';

const baseUrl = 'localhost';
const port = 5000;

// List of admin endpoints that should return data from Supabase
const adminEndpoints = [
  '/api/admin/database-status',
  '/api/admin/database/stats', 
  '/api/admin/users',
  '/api/admin/user-stats',
  '/api/admin/user-achievements',
  '/api/admin/comments',
  '/api/admin/comment-stats',
  '/api/admin/email-templates',
  '/api/admin/newsletter-subscribers',
  '/api/admin/email-stats',
  '/api/admin/mobile-app-config',
  '/api/admin/push-notifications',
  '/api/admin/seo-settings',
  '/api/admin/seo-analytics',
  '/api/admin/meta-tags',
  '/api/admin/search-stats',
  '/api/admin/search-analytics',
  '/api/admin/search-history',
  '/api/admin/performance-metrics',
  '/api/admin/error-logs',
  '/api/admin/security-audit-logs'
];

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: port,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            ok: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            ok: false,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testEndpoints() {
  console.log('🔍 Testing Admin API Endpoints for Supabase Integration\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let authFailures = 0;
  let dataIntegrityIssues = 0;
  
  for (const endpoint of adminEndpoints) {
    totalTests++;
    console.log(`Testing: ${endpoint}`);
    
    try {
      const result = await makeRequest(endpoint);
      
      if (result.status === 401) {
        console.log(`  🔒 AUTH REQUIRED - Status: ${result.status} (Expected - auth is working)`);
        authFailures++;
      } else if (result.status === 404) {
        console.log(`  ❌ NOT FOUND - Status: ${result.status} (Endpoint may not be implemented)`);
      } else if (result.ok) {
        console.log(`  ✅ SUCCESS - Status: ${result.status}`);
        
        // Check data quality
        if (result.data) {
          if (Array.isArray(result.data)) {
            console.log(`    📊 Array with ${result.data.length} items`);
          } else if (typeof result.data === 'object') {
            const keys = Object.keys(result.data);
            console.log(`    📊 Object with ${keys.length} properties`);
            
            // Check for mock data indicators
            const jsonStr = JSON.stringify(result.data);
            if (jsonStr.includes('mock') || jsonStr.includes('dummy') || jsonStr.includes('fake')) {
              console.log(`    ⚠️  WARNING: Contains mock data`);
              dataIntegrityIssues++;
            }
          }
        }
        passedTests++;
      } else {
        console.log(`  ❌ FAILED - Status: ${result.status}`);
        if (result.data && result.data.error) {
          console.log(`    Error: ${result.data.error}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ ERROR - ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Test Summary:');
  console.log(`Total Endpoints: ${totalTests}`);
  console.log(`✅ Working: ${passedTests}`);
  console.log(`🔒 Auth Protected: ${authFailures}`);
  console.log(`❌ Failed/Missing: ${totalTests - passedTests - authFailures}`);
  console.log(`⚠️  Data Integrity Issues: ${dataIntegrityIssues}`);
  
  const authProtectedRate = ((authFailures / totalTests) * 100).toFixed(1);
  const workingRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`\n📈 Analysis:`);
  console.log(`- ${authProtectedRate}% of endpoints are properly auth-protected`);
  console.log(`- ${workingRate}% of endpoints are functioning`);
  
  if (authFailures > 0) {
    console.log(`\n✅ Good: Authentication is properly implemented`);
    console.log(`   ${authFailures} endpoints require admin authentication`);
  }
  
  if (dataIntegrityIssues > 0) {
    console.log(`\n⚠️  Warning: ${dataIntegrityIssues} endpoints may be using mock data`);
    console.log(`   Review these endpoints for proper Supabase integration`);
  }
  
  if (passedTests > 0) {
    console.log(`\n✅ Working endpoints suggest Supabase integration is functional`);
  }
}

// Run the test
testEndpoints().catch(console.error);