import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import passport from "passport";

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize Passport
app.use(passport.initialize());

// Set as production environment for Vercel
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
app.set('env', 'production');

// Register all routes once
let routesRegistered = false;
const initializeApp = async () => {
  if (!routesRegistered) {
    console.log('Initializing Express app for Vercel...');
    await registerRoutes(app);
    routesRegistered = true;
    console.log('Routes registered successfully');
  }
};

// Export handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize app on first request
    await initializeApp();
    
    // Log request for debugging
    console.log(`${req.method} ${req.url}`);
    
    // Convert Vercel request to Express-compatible format
    const expressReq = req as any as Request;
    const expressRes = res as any as Response;
    
    // Handle the request with Express
    return app(expressReq, expressRes);
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: String(error)
    });
  }
}
