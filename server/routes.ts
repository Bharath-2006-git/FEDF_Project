// This is a replacement file for the routes.ts to fix all TypeScript issues
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginSchema, insertUserSchema, insertEmissionSchema, insertGoalSchema } from "@shared/schema";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback";

// Configure Google OAuth Strategy
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
          // Extract user info from Google profile
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in Google profile"), undefined);
          }

          // Check if user exists
          let user = await storage.getUserByEmail(email);

          if (!user) {
            // Create new user from Google profile
            const names = profile.displayName?.split(" ") || ["", ""];
            const firstName = profile.name?.givenName || names[0] || "User";
            const lastName = profile.name?.familyName || names[names.length - 1] || "";

            user = await storage.createUser({
              email,
              password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
              firstName,
              lastName,
              role: "individual",
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Define custom user type for JWT payload
interface JWTUser {
  userId: number;
  email: string;
  role: string;
}

// Type alias for authenticated requests
type AuthenticatedRequest = Request & { user?: JWTUser };

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    (req as AuthenticatedRequest).user = user as JWTUser;
    next();
  });
};

// Helper function to calculate CO2 emissions with comprehensive emission factors
const calculateCO2Emissions = (category: string, quantity: number, unit: string, subcategory?: string): number => {
  // Comprehensive emission factors (kg CO2 per unit) - Based on DEFRA, EPA, and IPCC data
  const emissionFactors: Record<string, Record<string, number>> = {
    electricity: { 
      kWh: 0.5,      // Grid average (varies by country, US average ~0.45-0.5)
      MWh: 500,
      GWh: 500000
    },
    travel: { 
      km: 0.15,      // Average vehicle (mixed transport)
      mile: 0.24,
      miles: 0.24,
      hours: 5.0     // Generic, overridden by subcategory
    },
    fuel: { 
      liter: 2.31,        // Gasoline default
      liters: 2.31,
      gallon: 8.74,       // Gasoline default
      gallons: 8.74,
      cubic_meter: 2.0,
      cubic_meters: 2.0,
      m3: 2.0,
      kg: 3.0,           // For solid fuels
      ton: 3000,
      tons: 3000
    },
    production: { 
      unit: 1.5,
      units: 1.5,
      kg: 0.5,
      ton: 500,
      tons: 500,
      hours: 10.0,
      pieces: 0.8
    },
    logistics: { 
      km: 0.8,           // Heavy truck
      mile: 1.29,
      miles: 1.29,
      package: 2.5,
      packages: 2.5,
      ton_km: 0.062,     // Ton-kilometer
      'ton-km': 0.062
    },
    waste: { 
      kg: 0.5,           // Landfill waste
      lbs: 0.23,
      pound: 0.23,
      pounds: 0.23,
      bag: 3.0,
      bags: 3.0,
      ton: 500,
      tons: 500,
      cubic_meter: 50,
      cubic_meters: 50,
      m3: 50
    },
    water: {
      liter: 0.0003,     // Water treatment emissions
      liters: 0.0003,
      gallon: 0.001,
      gallons: 0.001,
      m3: 0.3,
      cubic_meter: 0.3,
      cubic_meters: 0.3
    }
  };

  // Subcategory-specific factors (more accurate, override category defaults)
  const subcategoryFactors: Record<string, Record<string, Record<string, number>>> = {
    electricity: {
      grid: { kWh: 0.5, MWh: 500 },                    // Grid average
      coal: { kWh: 0.95, MWh: 950 },                   // Coal-powered
      natural_gas: { kWh: 0.45, MWh: 450 },            // Natural gas
      renewable: { kWh: 0.01, MWh: 10 },               // Solar/Wind
      nuclear: { kWh: 0.012, MWh: 12 },                // Nuclear
      hydro: { kWh: 0.024, MWh: 24 }                   // Hydroelectric
    },
    travel: {
      // Cars
      car: { km: 0.21, mile: 0.34, miles: 0.34 },                  // Average car
      car_small: { km: 0.15, mile: 0.24, miles: 0.24 },            // Small car
      car_medium: { km: 0.19, mile: 0.31, miles: 0.31 },           // Medium car
      car_large: { km: 0.28, mile: 0.45, miles: 0.45 },            // Large car/SUV
      car_electric: { km: 0.05, mile: 0.08, miles: 0.08 },         // Electric car
      car_hybrid: { km: 0.11, mile: 0.18, miles: 0.18 },           // Hybrid car
      
      // Public transport
      bus: { km: 0.05, mile: 0.08, miles: 0.08 },                  // Local bus
      coach: { km: 0.03, mile: 0.048, miles: 0.048 },              // Long-distance coach
      train: { km: 0.04, mile: 0.06, miles: 0.06 },                // Average train
      train_electric: { km: 0.035, mile: 0.056, miles: 0.056 },    // Electric train
      train_diesel: { km: 0.06, mile: 0.096, miles: 0.096 },       // Diesel train
      subway: { km: 0.03, mile: 0.048, miles: 0.048 },             // Metro/Underground
      tram: { km: 0.03, mile: 0.048, miles: 0.048 },               // Tram/Light rail
      
      // Air travel
      plane: { km: 0.25, mile: 0.40, miles: 0.40, hours: 90.0 },           // Average flight
      plane_short: { km: 0.15, mile: 0.24, miles: 0.24, hours: 70.0 },     // Short-haul (<500km)
      plane_medium: { km: 0.14, mile: 0.23, miles: 0.23, hours: 85.0 },    // Medium-haul (500-3500km)
      plane_long: { km: 0.19, mile: 0.31, miles: 0.31, hours: 100.0 },     // Long-haul (>3500km)
      plane_economy: { km: 0.14, mile: 0.23, miles: 0.23, hours: 85.0 },   // Economy class
      plane_business: { km: 0.28, mile: 0.45, miles: 0.45, hours: 170.0 }, // Business class
      plane_first: { km: 0.42, mile: 0.68, miles: 0.68, hours: 255.0 },    // First class
      
      // Other
      motorcycle: { km: 0.11, mile: 0.18, miles: 0.18 },           // Motorcycle
      scooter: { km: 0.07, mile: 0.11, miles: 0.11 },              // Motor scooter
      bike: { km: 0, mile: 0, miles: 0 },                          // Bicycle (zero emissions)
      ebike: { km: 0.003, mile: 0.005, miles: 0.005 },             // E-bike
      walk: { km: 0, mile: 0, miles: 0 },                          // Walking (zero emissions)
      
      // Taxis/Rideshare
      taxi: { km: 0.21, mile: 0.34, miles: 0.34 },                 // Regular taxi
      taxi_electric: { km: 0.05, mile: 0.08, miles: 0.08 },        // Electric taxi
      rideshare: { km: 0.19, mile: 0.31, miles: 0.31 }             // Rideshare (shared)
    },
    fuel: {
      // Liquid fuels
      gasoline: { liter: 2.31, liters: 2.31, gallon: 8.74, gallons: 8.74 },           // Petrol
      diesel: { liter: 2.68, liters: 2.68, gallon: 10.15, gallons: 10.15 },           // Diesel
      jet_fuel: { liter: 2.52, liters: 2.52, gallon: 9.54, gallons: 9.54 },           // Aviation fuel
      heating_oil: { liter: 2.96, liters: 2.96, gallon: 11.21, gallons: 11.21 },      // Heating oil
      lpg: { liter: 1.51, liters: 1.51, gallon: 5.72, gallons: 5.72, kg: 2.98 },      // LPG
      
      // Gaseous fuels
      natural_gas: { cubic_meter: 2.0, cubic_meters: 2.0, m3: 2.0, kg: 2.75 },        // Natural gas
      propane: { cubic_meter: 2.35, cubic_meters: 2.35, m3: 2.35, kg: 2.98 },         // Propane
      butane: { kg: 3.03 },                                                            // Butane
      
      // Solid fuels
      coal: { kg: 2.86, ton: 2860, tons: 2860 },                                      // Coal
      charcoal: { kg: 2.5, ton: 2500, tons: 2500 },                                   // Charcoal
      wood: { kg: 1.5, ton: 1500, tons: 1500 },                                       // Wood
      peat: { kg: 1.0, ton: 1000, tons: 1000 }                                        // Peat
    },
    waste: {
      // General waste
      household: { kg: 0.5, lbs: 0.23, bag: 3.0, bags: 3.0 },                         // Mixed household
      commercial: { kg: 0.45, lbs: 0.20, bag: 2.7, bags: 2.7 },                       // Commercial
      industrial: { kg: 0.8, lbs: 0.36, ton: 800, tons: 800 },                        // Industrial
      
      // Specific waste types
      recyclable: { kg: 0.1, lbs: 0.05, bag: 0.6, bags: 0.6 },                        // Recyclables
      paper: { kg: 0.9, lbs: 0.41, ton: 900, tons: 900 },                             // Paper/Cardboard
      plastic: { kg: 2.1, lbs: 0.95, ton: 2100, tons: 2100 },                         // Plastic
      glass: { kg: 0.5, lbs: 0.23, ton: 500, tons: 500 },                             // Glass
      metal: { kg: 0.7, lbs: 0.32, ton: 700, tons: 700 },                             // Metal
      organic: { kg: 0.3, lbs: 0.14, bag: 1.8, bags: 1.8 },                           // Food/Organic
      electronic: { kg: 1.5, lbs: 0.68, unit: 10.0 },                                 // E-waste
      hazardous: { kg: 2.0, lbs: 0.91, ton: 2000, tons: 2000 },                       // Hazardous
      medical: { kg: 1.8, lbs: 0.82 },                                                // Medical waste
      construction: { kg: 0.4, lbs: 0.18, ton: 400, tons: 400 }                       // Construction debris
    },
    production: {
      // Manufacturing
      steel: { kg: 1.85, ton: 1850, tons: 1850 },                                     // Steel production
      aluminum: { kg: 11.5, ton: 11500, tons: 11500 },                                // Aluminum
      cement: { kg: 0.93, ton: 930, tons: 930 },                                      // Cement
      concrete: { kg: 0.13, ton: 130, tons: 130 },                                    // Concrete
      plastic: { kg: 3.5, ton: 3500, tons: 3500 },                                    // Plastic
      paper: { kg: 1.3, ton: 1300, tons: 1300 },                                      // Paper
      glass: { kg: 0.85, ton: 850, tons: 850 },                                       // Glass
      
      // Food production
      beef: { kg: 27.0 },                                                              // Beef
      lamb: { kg: 24.0 },                                                              // Lamb
      pork: { kg: 7.0 },                                                               // Pork
      chicken: { kg: 6.9 },                                                            // Chicken
      fish: { kg: 5.5 },                                                               // Fish
      dairy: { kg: 3.2, liter: 1.3, liters: 1.3 },                                    // Dairy products
      vegetables: { kg: 0.4 },                                                         // Vegetables
      grains: { kg: 0.5 }                                                              // Grains
    },
    logistics: {
      // Road freight
      truck_small: { km: 0.3, mile: 0.48, miles: 0.48 },                              // Small truck
      truck_medium: { km: 0.5, mile: 0.80, miles: 0.80 },                             // Medium truck
      truck_heavy: { km: 0.8, mile: 1.29, miles: 1.29 },                              // Heavy truck/HGV
      van: { km: 0.25, mile: 0.40, miles: 0.40 },                                     // Delivery van
      
      // Sea freight
      ship: { ton_km: 0.011, 'ton-km': 0.011 },                                       // Container ship
      cargo_ship: { ton_km: 0.011, 'ton-km': 0.011 },                                 // Cargo ship
      
      // Air freight
      air_freight: { ton_km: 0.602, 'ton-km': 0.602 },                                // Air cargo
      
      // Rail freight
      rail_freight: { ton_km: 0.027, 'ton-km': 0.027 }                                // Rail cargo
    }
  };

  // Normalize unit name (replace spaces with underscores for consistent lookup)
  const normalizedUnit = unit.toLowerCase().replace(/\s+/g, '_');
  
  // Try subcategory-specific factor first, then category default, then fallback
  let factor = 1.0; // Default fallback
  
  if (subcategory && subcategoryFactors[category]?.[subcategory]?.[normalizedUnit]) {
    factor = subcategoryFactors[category][subcategory][normalizedUnit];
  } else if (emissionFactors[category]?.[normalizedUnit]) {
    factor = emissionFactors[category][normalizedUnit];
  }

  const result = quantity * factor;
  return Math.round(result * 1000) / 1000; // Round to 3 decimal places
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // POST /api/auth/signup
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      console.log('📝 Signup request received:', { ...req.body, password: '[REDACTED]' });
      
      const userData = insertUserSchema.parse(req.body);
      console.log('✓ Validation passed');
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        console.log('❌ User already exists:', userData.email);
        return res.status(400).json({ message: "User already exists" });
      }
      console.log('✓ Email is available');

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      console.log('✓ Password hashed');

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      console.log('✓ User created with ID:', user.id);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log('✓ JWT token generated');

      // Return user data (without password) and token
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token,
        message: "User created successfully"
      });
      console.log('✅ Signup successful for:', userData.email);
    } catch (error: any) {
      console.error('❌ Signup error:', error.message || error);
      console.error('Stack trace:', error.stack);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // POST /api/auth/login  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      console.log('🔐 Login request received:', { ...req.body, password: '[REDACTED]' });
      
      const { email, password } = loginSchema.parse(req.body);
      console.log('✓ Validation passed');

      // Special handling for demo account
      if (email === 'demo@carbonsense.com' && password === 'demo123') {
        console.log('👤 Demo account login');
        const demoUser = {
          id: 999,
          email: 'demo@carbonsense.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'individual',
          createdAt: new Date().toISOString()
        };

        const token = jwt.sign(
          { 
            userId: demoUser.id, 
            email: demoUser.email, 
            role: demoUser.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          user: demoUser,
          token,
          message: "Demo login successful"
        });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({ message: "Invalid email or password" });
      }
      console.log('✓ User found');

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('❌ Invalid password for:', email);
        return res.status(401).json({ message: "Invalid email or password" });
      }
      console.log('✓ Password verified');

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log('✓ JWT token generated');

      // Return user data (without password) and token
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token,
        message: "Login successful"
      });
      console.log('✅ Login successful for:', email);
    } catch (error: any) {
      console.error('❌ Login error:', error.message || error);
      console.error('Stack trace:', error.stack);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /api/auth/google - Initiate Google OAuth
  app.get("/api/auth/google", (req: Request, res: Response, next: NextFunction) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({ 
        message: "Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file." 
      });
    }
    passport.authenticate("google", { 
      scope: ["profile", "email"],
      session: false 
    })(req, res, next);
  });

  // GET /api/auth/google/callback - Google OAuth callback
  app.get("/api/auth/google/callback", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { 
      session: false,
      failureRedirect: process.env.NODE_ENV === 'production' 
        ? '/auth?error=google_auth_failed'
        : 'http://localhost:5173/auth?error=google_auth_failed'
    }, (err: any, user: any) => {
      if (err || !user) {
        console.error('Google OAuth error:', err);
        const frontendUrl = process.env.NODE_ENV === 'production' 
          ? '/auth?error=google_auth_failed'
          : 'http://localhost:5173/auth?error=google_auth_failed';
        return res.redirect(frontendUrl);
      }

      try {
        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Remove password from user object
        const { password, ...userWithoutPassword } = user;

        // Redirect to frontend with token and user data
        // Using URL hash to pass data to frontend (client-side only)
        const userData = encodeURIComponent(JSON.stringify(userWithoutPassword));
        const frontendUrl = process.env.NODE_ENV === 'production' 
          ? '/auth-callback' 
          : 'http://localhost:5173/auth-callback';
        res.redirect(`${frontendUrl}?token=${token}&user=${userData}`);
      } catch (error) {
        console.error('Token generation error:', error);
        res.redirect('/auth?error=token_generation_failed');
      }
    })(req, res, next);
  });
  
  // POST /api/emissions/add
  app.post("/api/emissions/add", authenticateToken, async (req: Request, res: Response) => {
    try {
      console.log('📊 Add emission request received');
      
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { category, subcategory, quantity, unit, date, description, department } = req.body;
      
      // Validation
      if (!category || !quantity || !unit || !date) {
        return res.status(400).json({ 
          message: 'Missing required fields: category, quantity, unit, and date are required' 
        });
      }

      const quantityNum = parseFloat(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        return res.status(400).json({ 
          message: 'Quantity must be a positive number' 
        });
      }

      // Calculate CO2 emissions with subcategory support
      const co2Emissions = calculateCO2Emissions(category, quantityNum, unit, subcategory);
      
      console.log(`✓ Calculated CO2: ${co2Emissions}kg for ${quantityNum}${unit} of ${category}${subcategory ? `/${subcategory}` : ''}`);
      
      // Convert camelCase to snake_case for database
      const emissionData = {
        user_id: user.userId,
        category,
        subcategory: subcategory || null,
        quantity: quantityNum.toString(),
        unit,
        co2_emissions: co2Emissions.toString(),
        date: new Date(date),
        description: description || null,
        department: department || null
      };

      const emission = await storage.addEmission(emissionData as any);
      
      console.log(`✅ Emission logged successfully with ID: ${emission.id}`);
      
      res.status(201).json({
        message: "Emission logged successfully",
        emission: {
          id: emission.id,
          category,
          subcategory,
          quantity: quantityNum,
          unit,
          co2Emissions,
          date,
          description,
          department
        },
        co2Emissions
      });
    } catch (error: any) {
      console.error('❌ Add emission error:', error);
      res.status(500).json({ 
        message: "Failed to log emission",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /api/emissions/calculate
  app.get("/api/emissions/calculate", async (req: Request, res: Response) => {
    try {
      console.log('🧮 Calculate emissions request received');
      
      const { category, subcategory, quantity, unit } = req.query;
      
      // Validation
      if (!category || !quantity || !unit) {
        return res.status(400).json({ 
          message: 'Missing required parameters: category, quantity, and unit are required' 
        });
      }

      const quantityNum = parseFloat(quantity as string);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        return res.status(400).json({ 
          message: 'Quantity must be a positive number' 
        });
      }
      
      // Calculate emissions for given parameters
      const co2Emissions = calculateCO2Emissions(
        category as string,
        quantityNum,
        unit as string,
        subcategory as string
      );

      console.log(`✓ Calculated: ${co2Emissions}kg CO2 for ${quantityNum}${unit} of ${category}`);

      res.json({
        co2Emissions,
        category,
        subcategory: subcategory || null,
        quantity: quantityNum,
        unit,
        message: "Emissions calculated successfully"
      });
    } catch (error: any) {
      console.error('❌ Calculate emissions error:', error);
      res.status(500).json({ 
        message: "Failed to calculate emissions",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /api/emissions/categories - Return available categories and subcategories metadata
  app.get("/api/emissions/categories", authenticateToken, async (req: Request, res: Response) => {
    try {
      console.log('📋 Categories metadata request received');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Define metadata for all categories and subcategories
      const metadata = {
        electricity: {
          description: "Electricity consumption from various sources",
          units: ["kWh", "MWh", "GWh"],
          defaultUnit: "kWh",
          subcategories: {
            grid: { name: "Grid Average", description: "Standard grid electricity mix" },
            coal: { name: "Coal-Powered", description: "Electricity from coal power plants" },
            natural_gas: { name: "Natural Gas", description: "Electricity from natural gas plants" },
            renewable: { name: "Renewable", description: "Solar, wind, and other renewables" },
            nuclear: { name: "Nuclear", description: "Nuclear power generation" },
            hydro: { name: "Hydroelectric", description: "Hydroelectric power" }
          }
        },
        travel: {
          description: "Transportation and travel emissions",
          units: ["km", "mile", "miles", "hours"],
          defaultUnit: "km",
          subcategories: {
            // Cars
            car: { name: "Car (Average)", description: "Average passenger car" },
            car_small: { name: "Small Car", description: "Compact/subcompact car" },
            car_medium: { name: "Medium Car", description: "Mid-size sedan" },
            car_large: { name: "Large Car/SUV", description: "Large car or SUV" },
            car_electric: { name: "Electric Car", description: "Battery electric vehicle" },
            car_hybrid: { name: "Hybrid Car", description: "Hybrid electric vehicle" },
            // Public transport
            bus: { name: "Bus", description: "Local bus service" },
            coach: { name: "Coach", description: "Long-distance coach" },
            train: { name: "Train (Average)", description: "Passenger train" },
            train_electric: { name: "Electric Train", description: "Electric passenger train" },
            train_diesel: { name: "Diesel Train", description: "Diesel passenger train" },
            subway: { name: "Subway/Metro", description: "Underground/metro rail" },
            tram: { name: "Tram", description: "Tram or light rail" },
            // Air travel
            plane: { name: "Plane (Average)", description: "Average flight" },
            plane_short: { name: "Short-Haul Flight", description: "Flights under 500km" },
            plane_medium: { name: "Medium-Haul Flight", description: "Flights 500-3500km" },
            plane_long: { name: "Long-Haul Flight", description: "Flights over 3500km" },
            plane_economy: { name: "Plane (Economy)", description: "Economy class seating" },
            plane_business: { name: "Plane (Business)", description: "Business class seating" },
            plane_first: { name: "Plane (First)", description: "First class seating" },
            // Other
            motorcycle: { name: "Motorcycle", description: "Motorcycle or motorbike" },
            scooter: { name: "Scooter", description: "Motor scooter" },
            bike: { name: "Bicycle", description: "Bicycle (zero emissions)" },
            ebike: { name: "E-Bike", description: "Electric bicycle" },
            walk: { name: "Walking", description: "Walking (zero emissions)" },
            taxi: { name: "Taxi", description: "Regular taxi service" },
            taxi_electric: { name: "Electric Taxi", description: "Electric taxi service" },
            rideshare: { name: "Rideshare", description: "Shared rideshare service" }
          }
        },
        fuel: {
          description: "Fuel consumption emissions",
          units: ["liter", "liters", "gallon", "gallons", "cubic_meter", "cubic_meters", "m3", "kg", "ton", "tons"],
          defaultUnit: "liters",
          subcategories: {
            gasoline: { name: "Gasoline/Petrol", description: "Automotive gasoline" },
            diesel: { name: "Diesel", description: "Diesel fuel" },
            jet_fuel: { name: "Jet Fuel", description: "Aviation fuel" },
            heating_oil: { name: "Heating Oil", description: "Heating/furnace oil" },
            lpg: { name: "LPG", description: "Liquefied petroleum gas" },
            natural_gas: { name: "Natural Gas", description: "Natural gas/methane" },
            propane: { name: "Propane", description: "Propane gas" },
            butane: { name: "Butane", description: "Butane gas" },
            coal: { name: "Coal", description: "Coal fuel" },
            charcoal: { name: "Charcoal", description: "Charcoal" },
            wood: { name: "Wood", description: "Wood/biomass" },
            peat: { name: "Peat", description: "Peat fuel" }
          }
        },
        waste: {
          description: "Waste disposal emissions",
          units: ["kg", "lbs", "pound", "pounds", "bag", "bags", "ton", "tons", "cubic_meter", "cubic_meters", "m3"],
          defaultUnit: "kg",
          subcategories: {
            household: { name: "Household Waste", description: "Mixed household waste" },
            commercial: { name: "Commercial Waste", description: "Commercial/office waste" },
            industrial: { name: "Industrial Waste", description: "Industrial waste" },
            recyclable: { name: "Recyclables", description: "Recyclable materials" },
            paper: { name: "Paper/Cardboard", description: "Paper and cardboard" },
            plastic: { name: "Plastic", description: "Plastic waste" },
            glass: { name: "Glass", description: "Glass waste" },
            metal: { name: "Metal", description: "Metal waste" },
            organic: { name: "Organic/Food", description: "Food and organic waste" },
            electronic: { name: "E-Waste", description: "Electronic waste" },
            hazardous: { name: "Hazardous", description: "Hazardous waste" },
            medical: { name: "Medical", description: "Medical waste" },
            construction: { name: "Construction", description: "Construction debris" }
          }
        },
        production: {
          description: "Manufacturing and production emissions",
          units: ["kg", "ton", "tons", "unit", "units", "liter", "liters"],
          defaultUnit: "kg",
          subcategories: {
            steel: { name: "Steel", description: "Steel production" },
            aluminum: { name: "Aluminum", description: "Aluminum production" },
            cement: { name: "Cement", description: "Cement production" },
            concrete: { name: "Concrete", description: "Concrete production" },
            plastic: { name: "Plastic", description: "Plastic manufacturing" },
            paper: { name: "Paper", description: "Paper production" },
            glass: { name: "Glass", description: "Glass manufacturing" },
            beef: { name: "Beef", description: "Beef production" },
            lamb: { name: "Lamb", description: "Lamb production" },
            pork: { name: "Pork", description: "Pork production" },
            chicken: { name: "Chicken", description: "Chicken production" },
            fish: { name: "Fish", description: "Fish production" },
            dairy: { name: "Dairy", description: "Dairy products" },
            vegetables: { name: "Vegetables", description: "Vegetable production" },
            grains: { name: "Grains", description: "Grain production" }
          }
        },
        logistics: {
          description: "Logistics and freight emissions",
          units: ["km", "mile", "miles", "ton_km", "ton-km", "package", "packages"],
          defaultUnit: "km",
          subcategories: {
            truck_small: { name: "Small Truck", description: "Small delivery truck" },
            truck_medium: { name: "Medium Truck", description: "Medium freight truck" },
            truck_heavy: { name: "Heavy Truck/HGV", description: "Heavy goods vehicle" },
            van: { name: "Delivery Van", description: "Delivery van" },
            ship: { name: "Container Ship", description: "Ocean container shipping" },
            cargo_ship: { name: "Cargo Ship", description: "Cargo vessel" },
            air_freight: { name: "Air Freight", description: "Air cargo" },
            rail_freight: { name: "Rail Freight", description: "Rail cargo" }
          }
        },
        water: {
          description: "Water usage and treatment emissions",
          units: ["liter", "liters", "gallon", "gallons", "m3", "cubic_meter", "cubic_meters"],
          defaultUnit: "liters",
          subcategories: null
        }
      };

      console.log('✅ Categories metadata returned successfully');
      res.json({
        categories: metadata,
        message: "Categories metadata retrieved successfully"
      });
    } catch (error: any) {
      console.error('❌ Categories metadata error:', error);
      res.status(500).json({ 
        message: "Failed to retrieve categories metadata",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /api/emissions/history
  app.get("/api/emissions/history", authenticateToken, async (req: Request, res: Response) => {
    try {
      console.log('📜 Emissions history request received');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { startDate, endDate } = req.query;
      
      const emissions = await storage.getUserEmissions(
        (req as AuthenticatedRequest).user!.userId,
        startDate as string,
        endDate as string
      );

      console.log(`✓ Found ${emissions.length} emissions for user ${(req as AuthenticatedRequest).user!.userId}`);

      // Group by month for history
      const history = emissions.reduce((acc, emission: any) => {
        const emissionDate = emission.date instanceof Date ? emission.date : new Date(emission.date);
        const month = emissionDate.toISOString().substring(0, 7); // YYYY-MM
        const co2 = Number(emission.co2_emissions || emission.co2Emissions || 0);
        
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += co2;
        return acc;
      }, {} as Record<string, number>);

      const historyArray = Object.entries(history)
        .map(([date, emissions]) => ({
          date,
          emissions: Math.round(emissions * 1000) / 1000 // Round to 3 decimal places
        }))
        .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically

      console.log(`✅ Returning ${historyArray.length} months of history`);

      res.json({
        history: historyArray,
        totalEmissions: historyArray.reduce((sum, item) => sum + item.emissions, 0),
        count: emissions.length
      });
    } catch (error: any) {
      console.error('❌ Emissions history error:', error);
      res.status(500).json({ 
        message: "Failed to get emissions history",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /api/emissions/list
  app.get("/api/emissions/list", authenticateToken, async (req: Request, res: Response) => {
    try {
      console.log('📋 Emissions list request received');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { startDate, endDate, category, limit } = req.query;
      
      let emissions = await storage.getUserEmissions(
        (req as AuthenticatedRequest).user!.userId,
        startDate as string,
        endDate as string
      );

      // Filter by category if provided
      if (category) {
        emissions = emissions.filter((e: any) => e.category === category);
      }

      // Convert snake_case to camelCase for frontend
      const formattedEmissions = emissions.map((e: any) => ({
        id: e.id,
        userId: e.user_id,
        category: e.category,
        subcategory: e.subcategory,
        quantity: Number(e.quantity),
        unit: e.unit,
        co2Emissions: Number(e.co2_emissions || e.co2Emissions),
        date: e.date,
        description: e.description,
        department: e.department,
        createdAt: e.created_at
      }));

      // Apply limit if provided
      const limitedEmissions = limit 
        ? formattedEmissions.slice(0, parseInt(limit as string))
        : formattedEmissions;

      console.log(`✅ Returning ${limitedEmissions.length} emissions`);

      res.json({
        emissions: limitedEmissions,
        total: formattedEmissions.length,
        filtered: !!category,
        totalEmissions: formattedEmissions.reduce((sum, e) => sum + e.co2Emissions, 0)
      });
    } catch (error: any) {
      console.error('❌ Emissions list error:', error);
      res.status(500).json({ 
        message: "Failed to get emissions list",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /api/emissions/summary - Get emission statistics and summary
  app.get("/api/emissions/summary", authenticateToken, async (req: Request, res: Response) => {
    try {
      console.log('📊 Emissions summary request received');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { startDate, endDate } = req.query;
      
      // Get all emissions for the period
      const emissions = await storage.getUserEmissions(
        (req as AuthenticatedRequest).user!.userId,
        startDate as string,
        endDate as string
      );

      // Calculate total emissions
      const totalEmissions = emissions.reduce((sum, e: any) => {
        return sum + Number(e.co2_emissions || e.co2Emissions || 0);
      }, 0);

      // Calculate emissions by category
      const byCategory = emissions.reduce((acc, e: any) => {
        const category = e.category;
        const value = Number(e.co2_emissions || e.co2Emissions || 0);
        acc[category] = (acc[category] || 0) + value;
        return acc;
      }, {} as Record<string, number>);

      // Calculate emissions by subcategory
      const bySubcategory = emissions.reduce((acc, e: any) => {
        const subcategory = e.subcategory;
        if (subcategory) {
          const value = Number(e.co2_emissions || e.co2Emissions || 0);
          acc[subcategory] = (acc[subcategory] || 0) + value;
        }
        return acc;
      }, {} as Record<string, number>);

      // Get average daily emissions
      const dates = new Set(emissions.map((e: any) => {
        const date = e.date instanceof Date ? e.date : new Date(e.date);
        return date.toISOString().split('T')[0];
      }));
      const averageDaily = dates.size > 0 ? totalEmissions / dates.size : 0;

      // Find highest emission day
      const dailyEmissions = emissions.reduce((acc, e: any) => {
        const date = e.date instanceof Date ? e.date : new Date(e.date);
        const dateStr = date.toISOString().split('T')[0];
        const value = Number(e.co2_emissions || e.co2Emissions || 0);
        acc[dateStr] = (acc[dateStr] || 0) + value;
        return acc;
      }, {} as Record<string, number>);

      const highestDay = Object.entries(dailyEmissions)
        .sort(([, a], [, b]) => b - a)[0];
      
      const lowestDay = Object.entries(dailyEmissions)
        .sort(([, a], [, b]) => a - b)[0];

      console.log(`✅ Summary: ${totalEmissions.toFixed(2)}kg CO2 from ${emissions.length} entries`);

      res.json({
        totalEmissions: Math.round(totalEmissions * 1000) / 1000,
        totalEntries: emissions.length,
        byCategory,
        bySubcategory,
        averageDaily: Math.round(averageDaily * 1000) / 1000,
        highestDay: highestDay ? { date: highestDay[0], value: Math.round(highestDay[1] * 1000) / 1000 } : null,
        lowestDay: lowestDay ? { date: lowestDay[0], value: Math.round(lowestDay[1] * 1000) / 1000 } : null,
        uniqueDays: dates.size,
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      });
    } catch (error: any) {
      console.error('❌ Emissions summary error:', error);
      res.status(500).json({ 
        message: "Failed to get emissions summary",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // PUT /api/emissions/:id - Update an emission entry
  app.put("/api/emissions/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      console.log('✏️ Update emission request received');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const emissionId = parseInt(req.params.id);
      const { category, subcategory, quantity, unit, date, description, department } = req.body;
      
      // Validation
      if (!category || !quantity || !unit || !date) {
        return res.status(400).json({ 
          message: 'Missing required fields: category, quantity, unit, and date are required' 
        });
      }

      const quantityNum = parseFloat(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        return res.status(400).json({ 
          message: 'Quantity must be a positive number' 
        });
      }

      // Recalculate CO2 emissions
      const co2Emissions = calculateCO2Emissions(category, quantityNum, unit, subcategory);
      
      const updateData = {
        category,
        subcategory: subcategory || null,
        quantity: quantityNum.toString(),
        unit,
        co2_emissions: co2Emissions.toString(),
        date: new Date(date),
        description: description || null,
        department: department || null
      };

      await storage.updateEmission(emissionId, (req as AuthenticatedRequest).user!.userId, updateData);
      
      console.log(`✅ Emission ${emissionId} updated successfully`);
      
      res.json({
        message: "Emission updated successfully",
        emission: {
          id: emissionId,
          category,
          subcategory,
          quantity: quantityNum,
          unit,
          co2Emissions,
          date,
          description,
          department
        }
      });
    } catch (error: any) {
      console.error('❌ Update emission error:', error);
      res.status(500).json({ 
        message: "Failed to update emission",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // DELETE /api/emissions/:id - Delete an emission entry
  app.delete("/api/emissions/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      console.log('🗑️ Delete emission request received');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const emissionId = parseInt(req.params.id);
      
      await storage.deleteEmission(emissionId, (req as AuthenticatedRequest).user!.userId);
      
      console.log(`✅ Emission ${emissionId} deleted successfully`);
      
      res.json({
        message: "Emission deleted successfully",
        id: emissionId
      });
    } catch (error: any) {
      console.error('❌ Delete emission error:', error);
      res.status(500).json({ 
        message: "Failed to delete emission",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // POST /api/goals
  app.post("/api/goals", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const goalData = {
        userId: (req as AuthenticatedRequest).user!.userId,
        ...req.body
      };

      const goal = await storage.createGoal(goalData);
      
      res.status(201).json(goal);
    } catch (error) {
      console.error('Create goal error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/goals
  app.get("/api/goals", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const goals = await storage.getUserGoals((req as AuthenticatedRequest).user!.userId);
      res.json(goals);
    } catch (error) {
      console.error('Goals list error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PUT /api/goals/:id - Update goal
  app.put("/api/goals/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const goalId = parseInt(req.params.id);
      const userId = (req as AuthenticatedRequest).user!.userId;
      
      await storage.updateGoal(goalId, userId, req.body);
      
      res.json({ message: 'Goal updated successfully' });
    } catch (error) {
      console.error('Update goal error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // DELETE /api/goals/:id - Delete goal
  app.delete("/api/goals/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const goalId = parseInt(req.params.id);
      const userId = (req as AuthenticatedRequest).user!.userId;
      
      await storage.deleteGoal(goalId, userId);
      
      res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      console.error('Delete goal error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/goals/:id/progress - Calculate goal progress
  app.get("/api/goals/:id/progress", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const goalId = parseInt(req.params.id);
      const userId = (req as AuthenticatedRequest).user!.userId;
      
      const progress = await storage.calculateGoalProgress(goalId, userId);
      
      res.json(progress);
    } catch (error) {
      console.error('Calculate goal progress error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/tips
  app.get("/api/tips", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { category, limit } = req.query;
      const userRole = (req as AuthenticatedRequest).user!.role;

      const tips = await storage.getTipsForUser(userRole, category as string);
      
      if (limit) {
        const limitNum = parseInt(limit as string);
        return res.json(tips.slice(0, limitNum));
      }
      
      res.json(tips);
    } catch (error) {
      console.error('Tips error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/reports/generate
  app.post("/api/reports/generate", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { reportType, startDate, endDate } = req.body;
      const userId = (req as AuthenticatedRequest).user!.userId;
      
      // Get actual emissions data for the report
      const emissions = await storage.getUserEmissions(userId, startDate, endDate);
      
      // Calculate breakdown by category
      const breakdown: Record<string, number> = {};
      let totalEmissions = 0;
      
      emissions.forEach((emission: any) => {
        const category = emission.category;
        const co2Amount = Number(emission.co2_emissions ?? emission.co2Emissions ?? 0);
        breakdown[category] = (breakdown[category] || 0) + co2Amount;
        totalEmissions += co2Amount;
      });
      
      const data = {
        totalEmissions,
        breakdown,
        period: { startDate, endDate }
      };

      const report = {
        id: Date.now(),
        userId,
        reportType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        filePath: `/reports/${userId}_${reportType}_${Date.now()}.json`,
        status: 'completed',
        createdAt: new Date()
      };

      res.json({
        report,
        data,
        message: "Report generated successfully"
      });
    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/user/profile
  app.get("/api/user/profile", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const user = await storage.getUser((req as AuthenticatedRequest).user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PUT /api/profile  
  app.put("/api/profile", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const userId = (req as AuthenticatedRequest).user!.userId;
      const { firstName, lastName, companyName, companyDepartment, currentPassword, newPassword } = req.body;
      
      // If changing password, verify current password first
      if (currentPassword && newPassword) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await storage.updateUser(userId, { password: hashedPassword });
      }
      
      // Update other profile fields
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (companyName !== undefined) updateData.companyName = companyName;
      if (companyDepartment !== undefined) updateData.companyDepartment = companyDepartment;
      
      if (Object.keys(updateData).length > 0) {
        await storage.updateUser(userId, updateData);
      }
      
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/category-breakdown", authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const emissions = await storage.getUserEmissions(user.userId);
      
      // Calculate category breakdown
      const categoryTotals: Record<string, number> = {};
      let totalEmissions = 0;

      emissions.forEach((emission: any) => {
        const category = emission.category;
        const co2Amount = Number(emission.co2_emissions ?? emission.co2Emissions ?? emission.co2Amount ?? 0);
        categoryTotals[category] = (categoryTotals[category] || 0) + co2Amount;
        totalEmissions += co2Amount;
      });

      const categoryBreakdown = Object.entries(categoryTotals).map(([category, value]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        value: parseFloat(value.toFixed(2)),
        percentage: totalEmissions > 0 ? parseFloat(((value / totalEmissions) * 100).toFixed(1)) : 0,
        trend: 0 // Trend calculation would require historical comparison
      }));

      res.json({ data: categoryBreakdown });
    } catch (error) {
      console.error('Category breakdown error:', error);
      res.status(500).json({ message: 'Failed to get category breakdown' });
    }
  });

  app.get("/api/analytics/monthly-comparison", authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const emissions = await storage.getUserEmissions(user.userId);
      
      // Group by month
      const monthlyData: Record<string, number> = {};
      emissions.forEach((emission: any) => {
        const month = new Date(emission.date).toISOString().substring(0, 7);
        const co2Amount = Number(emission.co2_emissions ?? emission.co2Emissions ?? emission.co2Amount ?? 0);
        monthlyData[month] = (monthlyData[month] || 0) + co2Amount;
      });

      // Get last 12 months
      const months = Object.keys(monthlyData).sort().slice(-12);
      const comparison = months.map((month, index) => {
        const current = monthlyData[month] || 0;
        const previous = index > 0 ? (monthlyData[months[index - 1]] || 0) : current;
        const change = previous > 0 ? ((current - previous) / previous * 100) : 0;
        
        return {
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          current: parseFloat(current.toFixed(2)),
          previous: parseFloat(previous.toFixed(2)),
          change: parseFloat(change.toFixed(1))
        };
      });

      res.json({ data: comparison });
    } catch (error) {
      console.error('Monthly comparison error:', error);
      res.status(500).json({ message: 'Failed to get monthly comparison' });
    }
  });

  app.get("/api/analytics/yearly-trends", authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const emissions = await storage.getUserEmissions(user.userId);
      const goals = await storage.getUserGoals(user.userId);
      
      // Group by year
      const yearlyData: Record<string, number> = {};
      emissions.forEach((emission: any) => {
        const year = new Date(emission.date).getFullYear().toString();
        const co2Amount = Number(emission.co2_emissions ?? emission.co2Emissions ?? emission.co2Amount ?? 0);
        yearlyData[year] = (yearlyData[year] || 0) + co2Amount;
      });

      const yearlyTrends = Object.entries(yearlyData).map(([year, emissionsTotal]) => {
        const goal = goals.find((g: any) => {
          const targetDate = g.target_date || g.targetDate;
          return targetDate && new Date(targetDate).getFullYear().toString() === year;
        });
        const goalTarget = goal ? ((goal as any).targetValue || (goal as any).target_value) : emissionsTotal * 1.1;
        
        return {
          year,
          emissions: parseFloat(emissionsTotal.toFixed(2)),
          goals: parseFloat(Number(goalTarget).toFixed(2)),
          achieved: emissionsTotal <= Number(goalTarget)
        };
      });

      res.json({ data: yearlyTrends });
    } catch (error) {
      console.error('Yearly trends error:', error);
      res.status(500).json({ message: 'Failed to get yearly trends' });
    }
  });

  app.get("/api/analytics/peak-analysis", authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const emissions = await storage.getUserEmissions(user.userId);
      
      if (emissions.length === 0) {
        return res.json({ 
          data: {
            highestDay: { date: 'N/A', value: 0 },
            lowestDay: { date: 'N/A', value: 0 },
            averageDaily: 0
          }
        });
      }

      // Group by day
      const dailyData: Record<string, number> = {};
      emissions.forEach((emission: any) => {
        const date = new Date(emission.date).toISOString().split('T')[0];
        const co2Amount = Number(emission.co2_emissions ?? emission.co2Emissions ?? emission.co2Amount ?? 0);
        dailyData[date] = (dailyData[date] || 0) + co2Amount;
      });

      const entries = Object.entries(dailyData);
      const highest = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
      const lowest = entries.reduce((min, curr) => curr[1] < min[1] ? curr : min);
      const total = entries.reduce((sum, curr) => sum + curr[1], 0);
      const average = total / entries.length;

      res.json({ 
        data: {
          highestDay: { 
            date: new Date(highest[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
            value: parseFloat(highest[1].toFixed(2)) 
          },
          lowestDay: { 
            date: new Date(lowest[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
            value: parseFloat(lowest[1].toFixed(2)) 
          },
          averageDaily: parseFloat(average.toFixed(2))
        }
      });
    } catch (error) {
      console.error('Peak analysis error:', error);
      res.status(500).json({ message: 'Failed to get peak analysis' });
    }
  });

  app.get("/api/analytics/export", authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { format } = req.query;
      const emissions = await storage.getUserEmissions(user.userId);

      if (format === 'csv') {
        // Generate CSV
        const csvHeader = 'Date,Category,Description,Quantity,Unit,CO2 Amount (kg)\n';
        const csvRows = emissions.map((e: any) => 
          `${new Date(e.date).toISOString().split('T')[0]},${e.category},${e.description || ''},${e.quantity},${e.unit},${e.co2_emissions || e.co2Emissions || e.co2Amount || 0}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=emissions-report.csv');
        res.send(csvHeader + csvRows);
      } else {
        // Return JSON for PDF generation on client
        res.json({ data: emissions });
      }
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ message: 'Failed to export data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}


