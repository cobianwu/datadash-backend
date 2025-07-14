import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Force IPv4 for Render compatibility
let connectionString = process.env.DATABASE_URL;

// Log the original connection string (without exposing password)
console.log('Original DATABASE_URL host:', new URL(connectionString).hostname);

// Parse and modify the connection string for production
if (process.env.NODE_ENV === 'production') {
  // Always ensure we're using the domain-based connection, not IPv6
  // Replace any IPv6 address with the Supabase domain
  if (connectionString.includes('2600:1f1c:')) {
    // This is the problematic IPv6 address, replace it with the correct domain
    connectionString = connectionString.replace(
      /\[?2600:1f1c:[^\]]+\]?:5432/,
      'db.uveysvjirebyppbzwwuw.supabase.co:5432'
    );
    console.log('Replaced IPv6 with domain-based connection');
  }
  
  // Ensure SSL mode is set
  const url = new URL(connectionString);
  if (!url.searchParams.has('sslmode')) {
    url.searchParams.set('sslmode', 'require');
    connectionString = url.toString();
  }
  
  console.log('Database connection configured for production, host:', new URL(connectionString).hostname);
}

// Standard PostgreSQL pool configuration that works with Supabase
// For Supabase pooler, use simplified SSL configuration
export const pool = new Pool({ 
  connectionString: connectionString,
  // Supabase pooler requires this specific SSL setting
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

export const db = drizzle(pool, { schema });
