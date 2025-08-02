#!/usr/bin/env node

/**
 * Environment Variables Verification for Vercel Deployment
 * Checks all required environment variables before deployment
 */

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_SERVICE_KEY'
];

const optionalEnvVars = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'VERCEL_URL',
  'NODE_ENV'
];

console.log('🔍 Checking environment variables for Vercel deployment...\n');

let hasErrors = false;

// Check required environment variables
console.log('📋 Required Environment Variables:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: Missing (REQUIRED)`);
    hasErrors = true;
  } else {
    const masked = value.substring(0, 8) + '...';
    console.log(`✅ ${envVar}: ${masked} (OK)`);
  }
});

console.log('\n📋 Optional Environment Variables:');
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`⚠️  ${envVar}: Not set (Optional)`);
  } else {
    const masked = value.substring(0, 8) + '...';
    console.log(`✅ ${envVar}: ${masked} (OK)`);
  }
});

console.log('\n🔍 Deployment Environment Check:');
console.log(`📦 Node.js Version: ${process.version}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🏗️  Build Context: ${process.env.VERCEL ? 'Vercel' : 'Local'}`);

if (process.env.VERCEL) {
  console.log(`🌐 Vercel Region: ${process.env.VERCEL_REGION || 'unknown'}`);
  console.log(`🔧 Git Branch: ${process.env.VERCEL_GIT_COMMIT_REF || 'unknown'}`);
}

console.log('\n📊 Summary:');
if (hasErrors) {
  console.log('❌ Environment check failed! Missing required variables.');
  console.log('\n💡 Add missing environment variables to your Vercel project:');
  console.log('   1. Go to your Vercel dashboard');
  console.log('   2. Select your project');
  console.log('   3. Go to Settings > Environment Variables');
  console.log('   4. Add the missing variables\n');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 Ready for Vercel deployment');
}

// Additional Supabase connection test
if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
  console.log('\n🔗 Testing Supabase connection...');
  
  import('@supabase/supabase-js').then(({ createClient }) => {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    // Simple health check
    supabase.from('articles').select('count').limit(1)
      .then(({ error }) => {
        if (error) {
          console.log('⚠️  Supabase connection warning:', error.message);
        } else {
          console.log('✅ Supabase connection successful');
        }
      })
      .catch(err => {
        console.log('⚠️  Supabase connection test failed:', err.message);
      });
  }).catch(() => {
    console.log('⚠️  Could not test Supabase connection (module not available)');
  });
}