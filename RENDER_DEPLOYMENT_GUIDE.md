# Render Deployment Guide for DataFlow Analytics

## Prerequisites
1. Supabase database with DATABASE_URL
2. OpenAI API key for AI features
3. GitHub repository connected to Render

## Environment Variables Required on Render

Set these in your Render dashboard under Environment:

```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
NODE_ENV=production
SESSION_SECRET=your-very-secure-random-string-here
OPENAI_API_KEY=your-openai-api-key
```

## Important Configuration Changes Made

### 1. Database Connection (server/db.ts)
- Switched from Neon-specific driver to standard PostgreSQL driver
- Added SSL configuration for production
- Works with Supabase's PostgreSQL

### 2. Session Management (server/auth.ts)
- Uses PostgreSQL-based sessions in production (persistent)
- Sessions stored in 'sessions' table (auto-created)
- Cookies configured for HTTPS in production
- Proxy trust enabled for Render's load balancer

### 3. Build Configuration
- Build command: `npm run build`
- Start command: `npm start`
- The build process creates both frontend and backend bundles

## Initial Setup Steps

### 1. Create Demo User
After deployment, you need to create the demo user in your Supabase database:

```sql
-- Run this in Supabase SQL editor
INSERT INTO users (username, email, password_hash)
VALUES (
  'demo', 
  'demo@example.com',
  '$2b$10$YourHashedPasswordHere'
);
```

To generate the password hash locally:
```javascript
// Run this Node.js script locally
const bcrypt = require('bcrypt');
bcrypt.hash('demo', 10).then(hash => console.log(hash));
```

### 2. Push Database Schema
In your Render shell or locally with DATABASE_URL set:
```bash
npm run db:push
```

## Troubleshooting

### "Not authenticated" error
1. Check SESSION_SECRET is set in environment
2. Verify cookies are being set (check browser DevTools)
3. Ensure DATABASE_URL is correct
4. Check that sessions table exists in database

### Database connection issues
1. Verify DATABASE_URL format is correct
2. Ensure Supabase allows connections from Render IPs
3. Check SSL settings in connection string

### Session persistence issues
1. Sessions table should be auto-created on first run
2. If not, manually create:
```sql
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
```

## Security Notes
- Always use HTTPS in production
- Set strong SESSION_SECRET (32+ random characters)
- Keep OPENAI_API_KEY secure
- Review Supabase connection pool settings

## Monitoring
- Check Render logs for startup errors
- Monitor PostgreSQL connections in Supabase dashboard
- Watch for session table growth over time