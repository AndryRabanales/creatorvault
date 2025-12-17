#!/usr/bin/env node
/**
 * CreatorVault Database Connection Test
 * 
 * Tests the database connection and provides helpful diagnostics
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

console.log('🗄️  CreatorVault Database Connection Test\n');
console.log('='.repeat(50));

if (!DATABASE_URL) {
  console.error('\n❌ DATABASE_URL is not set');
  console.log('\n💡 Set it in your .env file:');
  console.log('   DATABASE_URL=mysql://user:pass@host:3306/database');
  console.log('   or');
  console.log('   DATABASE_URL=postgresql://user:pass@host:5432/database?sslmode=require');
  process.exit(1);
}

// Detect database type
const isMySQL = DATABASE_URL.includes('mysql://');
const isPostgreSQL = DATABASE_URL.includes('postgresql://') || DATABASE_URL.includes('postgres://');

console.log('\n📋 Connection Details:\n');

if (isMySQL) {
  console.log('✅ Database Type: MySQL');
} else if (isPostgreSQL) {
  console.log('✅ Database Type: PostgreSQL');
} else {
  console.log('⚠️  Unknown database type');
}

// Mask password in URL for display
const maskedURL = DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
console.log(`📍 Connection String: ${maskedURL}\n`);

// Test connection
console.log('🔌 Testing connection...\n');

try {
  let dbModule;
  
  if (isMySQL) {
    // Dynamically import mysql2
    dbModule = await import('mysql2/promise');
    
    const connection = await dbModule.default.createConnection(DATABASE_URL);
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    
    if (rows[0].test === 1) {
      console.log('✅ MySQL connection successful!');
    }
    
    // Get database info
    const [dbInfo] = await connection.execute('SELECT DATABASE() as db_name, VERSION() as version');
    console.log(`📊 Database: ${dbInfo[0].db_name}`);
    console.log(`📦 Version: ${dbInfo[0].version}`);
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Tables: ${tables.length} found`);
    
    if (tables.length === 0) {
      console.log('\n⚠️  No tables found. Run migrations:');
      console.log('   pnpm db:push');
    }
    
    await connection.end();
    
  } else if (isPostgreSQL) {
    // Dynamically import pg
    dbModule = await import('pg');
    
    const client = new dbModule.default.Client({
      connectionString: DATABASE_URL,
    });
    
    await client.connect();
    
    // Test query
    const testResult = await client.query('SELECT 1 as test');
    
    if (testResult.rows[0].test === 1) {
      console.log('✅ PostgreSQL connection successful!');
    }
    
    // Get database info
    const dbInfo = await client.query('SELECT current_database() as db_name, version()');
    console.log(`📊 Database: ${dbInfo.rows[0].db_name}`);
    console.log(`📦 Version: ${dbInfo.rows[0].version.split(' ')[1]}`);
    
    // Check if tables exist
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log(`📋 Tables: ${tables.rows.length} found`);
    
    if (tables.rows.length === 0) {
      console.log('\n⚠️  No tables found. Run migrations:');
      console.log('   pnpm db:push');
    }
    
    await client.end();
  }
  
  console.log('\n✅ All checks passed!\n');
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ Connection failed!\n');
  console.error('Error:', error.message);
  
  console.log('\n💡 Troubleshooting:\n');
  
  if (error.code === 'ENOTFOUND') {
    console.log('   - Check that the hostname is correct');
    console.log('   - Verify your internet connection');
  } else if (error.code === 'ECONNREFUSED') {
    console.log('   - Database server might be down');
    console.log('   - Check the port number');
  } else if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.message.includes('password')) {
    console.log('   - Check username and password');
    console.log('   - Verify user has correct permissions');
  } else if (error.message.includes('SSL') || error.message.includes('ssl')) {
    console.log('   - Add SSL parameters to connection string:');
    if (isMySQL) {
      console.log('     DATABASE_URL=mysql://...?ssl={"rejectUnauthorized":true}');
    } else if (isPostgreSQL) {
      console.log('     DATABASE_URL=postgresql://...?sslmode=require');
    }
  } else {
    console.log('   - Check your DATABASE_URL format');
    console.log('   - Verify the database exists');
    console.log('   - Check firewall settings');
  }
  
  console.log('\n📖 For more help, see: docs/DATABASE_SETUP.md\n');
  process.exit(1);
}
