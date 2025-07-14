import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcrypt";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import MemoryStore from "memorystore";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const MemoryStoreSession = MemoryStore(session);
const PgStore = ConnectPgSimple(session);

// Configure session store
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const isProduction = process.env.NODE_ENV === "production";

  // Use PostgreSQL store in production, memory store in development
  const sessionStore = isProduction
    ? new PgStore({
        pool: pool,
        tableName: "sessions",
        createTableIfMissing: true,
      })
    : new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      });

  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: isProduction, // Trust proxy in production (important for Render)
    cookie: {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: isProduction ? "strict" : "lax",
      maxAge: sessionTtl,
    },
  });
}

// Configure passport local strategy
export async function setupAuth(app: Express) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username: string, password: string, done) => {
      try {
        console.log("🔐 LOGIN ATTEMPT:", username);

        const user = await storage.getUserByUsername(username);
        console.log("🔎 USER FOUND:", user);

        if (!user) {
          console.warn("⚠️ No user found");
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log("✅ PASSWORD MATCH:", isValid);

        if (!isValid) {
          console.warn("⚠️ Password does not match");
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log("🎉 LOGIN SUCCESS");
        return done(null, user);
      } catch (error) {
        console.error("❌ LOGIN ERROR:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Authentication middleware
export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// Helper to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
