import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function ensureDemoUser() {
  try {
    // Check if demo user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, 'demo')
    });

    if (!existingUser) {
      console.log('Creating demo user...');
      const passwordHash = await bcrypt.hash('demo', 10);
      
      await db.insert(users).values({
        username: 'demo',
        email: 'demo@example.com',
        passwordHash,
      });
      
      console.log('Demo user created successfully');
    } else {
      console.log('Demo user already exists');
    }
  } catch (error) {
    console.error('Error ensuring demo user:', error);
  } finally {
    process.exit(0);
  }
}

ensureDemoUser();