-- SQL script to create admin user in Supabase
-- Password: test123 (bcrypt hash)

INSERT INTO users (username, email, "passwordHash", "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin',
  'admin@example.com',
  '$2b$10$UNPwr.76IGHKptziuvoG2.JYIHRPoTjJu0Ynkn6VxRQuG4GpbdE5u',
  'Admin',
  'User',
  'admin',
  true,
  NOW(),
  NOW()
);