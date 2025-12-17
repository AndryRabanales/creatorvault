#!/usr/bin/env node
/**
 * CreatorVault Health Check Script
 * 
 * Tests that the application is running and all services are accessible
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

const API_URL = process.env.VITE_API_URL || process.env.BACKEND_URL || 'http://localhost:3000';

console.log('🏥 CreatorVault Health Check\n');
console.log('='.repeat(50));
console.log(`\nChecking: ${API_URL}\n`);

async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Server is running\n');
    console.log('📊 System Status:\n');
    console.log(`   Status: ${data.status}`);
    console.log(`   Environment: ${data.environment}`);
    console.log(`   Database: ${data.database}`);
    console.log(`   Stripe: ${data.stripe}`);
    console.log(`   Auth: ${data.auth}`);
    console.log(`   Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
    
    // Check for warnings
    const warnings = [];
    if (data.database === 'not configured') {
      warnings.push('⚠️  Database is not configured');
    }
    if (data.stripe === 'not configured') {
      warnings.push('⚠️  Stripe is not configured (payments disabled)');
    }
    if (data.auth === 'none') {
      warnings.push('⚠️  No authentication provider configured');
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:\n');
      warnings.forEach(w => console.log(`   ${w}`));
    }
    
    console.log('\n✅ Health check passed!\n');
    return true;
  } catch (error) {
    console.error('\n❌ Health check failed!\n');
    console.error(`   Error: ${error.message}`);
    console.error('\n   Possible causes:');
    console.error('   - Server is not running');
    console.error('   - Incorrect API URL');
    console.error('   - Network connectivity issues');
    console.error('\n   Try:');
    console.error('   - Start the server with: pnpm dev');
    console.error('   - Check VITE_API_URL environment variable');
    console.error('   - Verify firewall/network settings\n');
    return false;
  }
}

async function checkDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('\n⚠️  DATABASE_URL not configured, skipping database check');
    return;
  }
  
  console.log('\n🗄️  Checking database connection...\n');
  
  try {
    // Try to make a simple query through the API
    const response = await fetch(`${API_URL}/api/trpc/auth.me`);
    
    if (response.ok || response.status === 401) {
      console.log('✅ Database connection successful');
    } else {
      console.log('⚠️  Database connection may have issues');
    }
  } catch (error) {
    console.log('⚠️  Could not verify database connection');
  }
}

async function main() {
  const healthOk = await checkHealth();
  
  if (healthOk) {
    await checkDatabase();
  }
  
  console.log('='.repeat(50));
  
  process.exit(healthOk ? 0 : 1);
}

main().catch(console.error);
