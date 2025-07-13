// Script to generate password hash for demo user
// Run this locally: node scripts/create-demo-user.js

const bcrypt = require('bcrypt');

async function generateDemoUserSQL() {
  const password = 'demo';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n=== SQL to create demo user ===\n');
  console.log(`INSERT INTO users (username, email, password_hash) VALUES (
  'demo',
  'demo@example.com', 
  '${hash}'
) ON CONFLICT (username) DO NOTHING;`);
  
  console.log('\n=== Copy and run this in Supabase SQL Editor ===\n');
}

generateDemoUserSQL();