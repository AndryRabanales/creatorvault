#!/usr/bin/env node
/**
 * CreatorVault Deployment Validation Script
 * 
 * This script validates that all required environment variables and
 * configurations are properly set before deployment.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

const validations = [];
const warnings = [];
const errors = [];

console.log('🚀 CreatorVault Deployment Validation\n');
console.log('='.repeat(50));

// Required environment variables for production
const requiredVars = {
  DATABASE_URL: {
    required: true,
    description: 'Database connection string',
    validate: (val) => val.startsWith('mysql://') || val.startsWith('postgresql://') || val.startsWith('postgres://'),
  },
  JWT_SECRET: {
    required: true,
    description: 'JWT secret for session management',
    validate: (val) => val.length >= 32,
  },
};

// Recommended variables for full functionality
const recommendedVars = {
  STRIPE_SECRET_KEY: {
    description: 'Stripe secret key (required for payments)',
    validate: (val) => val.startsWith('sk_'),
  },
  STRIPE_WEBHOOK_SECRET: {
    description: 'Stripe webhook secret (required for payments)',
    validate: (val) => val.startsWith('whsec_'),
  },
  VITE_STRIPE_PUBLISHABLE_KEY: {
    description: 'Stripe publishable key (required for payments)',
    validate: (val) => val.startsWith('pk_'),
  },
};

// Optional but recommended variables
const optionalVars = {
  NODE_ENV: {
    description: 'Environment mode',
    default: 'development',
  },
  PORT: {
    description: 'Server port',
    default: '3000',
  },
  FRONTEND_URL: {
    description: 'Frontend URL for CORS',
    default: 'http://localhost:3000',
  },
  BACKEND_URL: {
    description: 'Backend URL for webhooks',
    default: 'http://localhost:3000',
  },
};

// Auth provider variables (at least one should be configured)
const authVars = {
  auth0: ['AUTH0_DOMAIN', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET'],
  clerk: ['CLERK_SECRET_KEY', 'CLERK_PUBLISHABLE_KEY'],
  manus: ['VITE_APP_ID', 'OAUTH_SERVER_URL'],
};

console.log('\n📋 Checking Required Variables...\n');

// Check required variables
for (const [key, config] of Object.entries(requiredVars)) {
  const value = process.env[key];
  
  if (!value) {
    errors.push(`❌ ${key} is REQUIRED but not set - ${config.description}`);
  } else if (config.validate && !config.validate(value)) {
    errors.push(`❌ ${key} has invalid format - ${config.description}`);
  } else {
    const maskedValue = value.substring(0, 10) + '...';
    console.log(`✅ ${key}: ${maskedValue}`);
    validations.push(key);
  }
}

console.log('\n📋 Checking Recommended Variables...\n');

// Check recommended variables
for (const [key, config] of Object.entries(recommendedVars)) {
  const value = process.env[key];
  
  if (!value) {
    console.log(`⚠️  ${key}: Not set - ${config.description}`);
    warnings.push(`${key} not configured - payments may not work`);
  } else if (config.validate && !config.validate(value)) {
    console.log(`⚠️  ${key}: Invalid format - ${config.description}`);
    warnings.push(`${key} has invalid format`);
  } else {
    const maskedValue = value.substring(0, 10) + '...';
    console.log(`✅ ${key}: ${maskedValue}`);
  }
}

console.log('\n📋 Checking Optional Variables...\n');

// Check optional variables
for (const [key, config] of Object.entries(optionalVars)) {
  const value = process.env[key];
  
  if (!value) {
    console.log(`⚠️  ${key}: Not set (using default: ${config.default}) - ${config.description}`);
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
}

console.log('\n📋 Checking Authentication Configuration...\n');

// Check auth providers
let authConfigured = false;
for (const [provider, vars] of Object.entries(authVars)) {
  const allSet = vars.every(v => process.env[v]);
  if (allSet) {
    console.log(`✅ ${provider.toUpperCase()} authentication is configured`);
    authConfigured = true;
  } else {
    const missing = vars.filter(v => !process.env[v]);
    console.log(`⚠️  ${provider.toUpperCase()}: Missing ${missing.join(', ')}`);
  }
}

if (!authConfigured) {
  errors.push('❌ No authentication provider is fully configured (Auth0, Clerk, or Manus)');
}

// Check database connection format
console.log('\n📋 Database Configuration...\n');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  if (dbUrl.includes('mysql')) {
    console.log('✅ MySQL database detected');
    if (!dbUrl.includes('ssl') && process.env.NODE_ENV === 'production') {
      warnings.push('Database URL should include SSL in production');
    }
  } else if (dbUrl.includes('postgresql') || dbUrl.includes('postgres')) {
    console.log('✅ PostgreSQL database detected');
    if (!dbUrl.includes('sslmode') && process.env.NODE_ENV === 'production') {
      warnings.push('Database URL should include sslmode=require in production');
    }
  }
}

// Check Stripe configuration
console.log('\n📋 Stripe Configuration...\n');
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (stripeKey) {
  if (stripeKey.includes('test')) {
    console.log('⚠️  Using Stripe TEST mode (this is fine for development)');
  } else if (stripeKey.includes('live')) {
    console.log('✅ Using Stripe LIVE mode (production)');
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Validation Summary\n');

console.log(`✅ Passed: ${validations.length} checks`);
if (warnings.length > 0) {
  console.log(`⚠️  Warnings: ${warnings.length} items`);
}
if (errors.length > 0) {
  console.log(`❌ Errors: ${errors.length} items`);
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:\n');
  warnings.forEach(w => console.log(`   - ${w}`));
}

if (errors.length > 0) {
  console.log('\n❌ Errors:\n');
  errors.forEach(e => console.log(`   ${e}`));
  console.log('\n🚫 Deployment validation FAILED. Please fix the errors above.\n');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('\n⚠️  Deployment validation passed with warnings.');
  console.log('Review warnings above before deploying to production.\n');
  process.exit(0);
}

console.log('\n✅ All checks passed! Ready for deployment.\n');
process.exit(0);
