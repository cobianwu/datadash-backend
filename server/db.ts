import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Force IPv4 for Render compatibility (add ?family=4 to connection string)
let connectionString = process.env.DATABASE_URL;
if (process.env.NODE_ENV === 'production') {
  // Parse the URL and add family=4 parameter to force IPv4
  const url = new URL(connectionString);
  url.searchParams.set('family', '4');
  connectionString = url.toString();
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
