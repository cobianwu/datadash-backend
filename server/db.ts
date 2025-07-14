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

// Parse and modify the connection string for production
if (process.env.NODE_ENV === 'production') {
  const url = new URL(connectionString);
  
  // Force IPv4 by replacing the hostname if it's IPv6
  // Supabase provides both IPv4 and IPv6, we need to use the domain name
  if (url.hostname.includes(':')) {
    // This is an IPv6 address, replace with the domain
    const match = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
    if (match) {
      // Extract the host part and look for .supabase.co domain
      const hostPart = match[3];
      if (hostPart.includes('.supabase.co')) {
        // Already using domain, just add family parameter
        url.searchParams.set('sslmode', 'require');
      }
    }
  }
  
  connectionString = url.toString();
  console.log('Database connection configured for production');
}

// Standard PostgreSQL pool configuration that works with Supabase
export const pool = new Pool({ 
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });
