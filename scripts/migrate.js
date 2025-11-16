#!/usr/bin/env node

// Load environment variables first
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...');
    
    // Test connection first
    try {
      await db.execute('SELECT 1');
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      if (error.message.includes('401')) {
        console.error('💡 Your auth token may be expired. Please generate a new one with: turso db tokens create your-database-name');
      }
      process.exit(1);
    }
    
    // Read and execute migration
    const migrationPath = path.join(__dirname, '../migrations', '001_create_tasks.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await db.execute(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Tasks table is ready');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Table already exists - migration skipped');
      process.exit(0);
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };