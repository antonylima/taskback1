const { createClient } = require('@libsql/client');

// Validate environment variables
if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL environment variable is required');
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN environment variable is required');
}

let client;

try {
  // Initialize Turso client
  client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
} catch (error) {
  console.error('❌ Failed to create Turso client:', error.message);
  console.error('Please check your TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env file');
  process.exit(1);
}

module.exports = client;