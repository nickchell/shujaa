#!/usr/bin/env node

/**
 * Script to validate environment variables
 * Run with: node scripts/check-env.js
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
  // NEXT_PUBLIC_APP_URL is no longer required as we're using config.baseUrl
];

function checkEnvironment() {
  console.log('🔍 Checking environment variables...\n');
  
  const missingVars = [];
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (!value) {
      missingVars.push(envVar);
      console.log(`❌ ${envVar}: Missing`);
    } else {
      // Show a masked version of the value for sensitive keys
      const maskedValue = envVar.includes('KEY') || envVar.includes('SECRET') 
        ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
        : value;
      console.log(`✅ ${envVar}: ${maskedValue}`);
    }
  });
  
  console.log('\n');
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables are set!\n');
    return true;
  } else {
    console.log(`❌ Missing ${missingVars.length} required environment variables.`);
    console.log('Please add the missing variables to your .env.local file.\n');
    
    console.log('Example .env.local file:');
    console.log('```');
    requiredEnvVars.forEach(envVar => {
      console.log(`${envVar}=${missingVars.includes(envVar) ? 'YOUR_VALUE_HERE' : 'already_set'}`);
    });
    console.log('```\n');
    return false;
  }
}

// Check environment variables when running this script directly
if (require.main === module) {
  const result = checkEnvironment();
  process.exit(result ? 0 : 1);
}

module.exports = { checkEnvironment }; 