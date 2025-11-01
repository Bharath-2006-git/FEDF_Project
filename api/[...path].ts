import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Express } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

// Environment configuration
process.env.NODE_ENV = 'production';

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

// JWT and OAuth config
const JWT_SECRET = process.env.JWT_SECRET || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || '';
const FRONTEND_URL = process.env.FRONTEND_URL || '';

// Configure Google OAuth
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in Google profile"), undefined);
          }

          // Check if user exists
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .limit(1)
            .maybeSingle();

          if (existingUser) {
            return done(null, existingUser);
          }

          // Create new user
          const names = profile.displayName?.split(" ") || ["", ""];
          const firstName = profile.name?.givenName || names[0] || "User";
          const lastName = profile.name?.familyName || names[names.length - 1] || "";

          const { data: newUser, error } = await supabase
            .from("users")
            .insert({
              email,
              password: await bcrypt.hash(Math.random().toString(36), 10),
              first_name: firstName,
              last_name: lastName,
              role: "individual",
            })
            .select()
            .single();

          if (error) throw error;
          return done(null, newUser);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Create Express app
const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Google OAuth routes
app.get("/api/auth/google", (req, res, next) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ 
      message: "Google OAuth is not configured" 
    });
  }
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    session: false 
  })(req, res, next);
});

app.get("/api/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", { 
    session: false,
    failureRedirect: `${FRONTEND_URL}/auth?error=google_auth_failed`
  }, (err: any, user: any) => {
    if (err || !user) {
      return res.redirect(`${FRONTEND_URL}/auth?error=google_auth_failed`);
    }

    try {
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password, ...userWithoutPassword } = user;
      const userData = encodeURIComponent(JSON.stringify(userWithoutPassword));
      res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}&user=${userData}`);
    } catch (error) {
      res.redirect(`${FRONTEND_URL}/auth?error=token_generation_failed`);
    }
  })(req, res, next);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch all for other API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Export handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`${req.method} ${req.url}`);
    app(req as any, res as any);
  } catch (error) {
    console.error('Serverless error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
