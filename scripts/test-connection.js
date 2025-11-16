#!/usr/bin/env node

// Load environment variables first
require('dotenv').config();

const db = require('../db');

async function testConnection() {
  try {
    console.log('🔍 Testing Turso database connection...');
    console.log('📡 URL:', process.env.TURSO_DATABASE_URL);
    console.log('🔑 Token length:', process.env.TURSO_AUTH_TOKEN ? process.env.TURSO_AUTH_TOKEN.length : 'undefined');
    
    // Simple test query
    const result = await db.execute('SELECT 1 as test, datetime("now") as current_time');
    console.log('✅ Connection successful!');
    console.log('📊 Test result:', result.rows[0]);
    
    // Test if tasks table exists
    try {
      const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'");
      if (tables.rows.length > 0) {
        console.log('📋 Tasks table exists');
        const count = await db.execute('SELECT COUNT(*) as count FROM tasks');
        console.log(`📈 Current tasks in database: ${count.rows[0].count}`);
      } else {
        console.log('⚠️  Tasks table not found - run migration: npm run migrate');
      }
    } catch (error) {
      console.log('⚠️  Could not check tasks table:', error.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('401')) {
      console.error('💡 Authentication failed. Your token may be expired.');
      console.error('🔧 Generate a new token with: turso db tokens create your-database-name');
    } else if (error.message.includes('URL_INVALID')) {
      console.error('💡 Invalid database URL format.');
      console.error('🔧 Ensure URL starts with libsql:// and is correct');
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };