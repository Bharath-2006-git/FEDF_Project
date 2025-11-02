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

      // Map database fields to frontend expected format
      const { password, first_name, last_name, company_name, company_department, created_at, updated_at, ...rest } = user;
      const userForFrontend = {
        ...rest,
        firstName: first_name || 'User',
        lastName: last_name || '',
        companyName: company_name,
        companyDepartment: company_department,
        createdAt: created_at,
      };
      
      const userData = encodeURIComponent(JSON.stringify(userForFrontend));
      console.log('Redirecting to auth-callback with user:', userForFrontend.email);
      res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect(`${FRONTEND_URL}/auth?error=token_generation_failed`);
    }
  })(req, res, next);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// POST /api/auth/signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, companyName, companyDepartment } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role,
        company_name: companyName,
        company_department: companyDepartment,
      })
      .select()
      .single();

    if (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ message: "Failed to create user" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Map database fields to frontend expected format
    const { password: _, first_name, last_name, company_name, company_department, created_at, updated_at, ...rest } = user;
    const userForFrontend = {
      ...rest,
      firstName: first_name || '',
      lastName: last_name || '',
      companyName: company_name,
      companyDepartment: company_department,
      createdAt: created_at,
    };
    
    res.status(201).json({
      user: userForFrontend,
      token,
      message: "User created successfully"
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Special handling for demo account
    if (email === 'demo@carbonsense.com' && password === 'demo123') {
      const demoUser = {
        id: 999,
        email: 'demo@carbonsense.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'individual',
        createdAt: new Date().toISOString()
      };

      const token = jwt.sign(
        { userId: demoUser.id, email: demoUser.email, role: demoUser.role },
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
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Map database fields to frontend expected format
    const { password: _, first_name, last_name, company_name, company_department, created_at, updated_at, ...rest } = user;
    const userForFrontend = {
      ...rest,
      firstName: first_name || '',
      lastName: last_name || '',
      companyName: company_name,
      companyDepartment: company_department,
      createdAt: created_at,
    };
    
    res.json({
      user: userForFrontend,
      token,
      message: "Login successful"
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// JWT User type
interface JWTUser {
  userId: number;
  email: string;
  role: string;
}

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user as JWTUser;
    next();
  });
};

// GET /api/emissions/list
app.get("/api/emissions/list", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const { startDate, endDate, category, limit } = req.query;

    let query = supabase
      .from("emissions")
      .select("*")
      .eq("user_id", user.userId)
      .order("date", { ascending: false });

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }
    if (category) {
      query = query.eq("category", category);
    }
    if (limit) {
      query = query.limit(parseInt(limit as string));
    }

    const { data: emissions, error } = await query;

    if (error) throw error;

    // Map database fields to frontend format
    const mappedEmissions = (emissions || []).map((e: any) => ({
      id: e.id,
      category: e.category,
      subcategory: e.subcategory,
      quantity: parseFloat(e.quantity),
      unit: e.unit,
      co2Emissions: parseFloat(e.co2_emissions),
      date: e.date,
      description: e.description,
      department: e.department,
      createdAt: e.created_at,
    }));

    res.json({ emissions: mappedEmissions });
  } catch (error) {
    console.error('Error fetching emissions:', error);
    res.status(500).json({ message: "Failed to fetch emissions" });
  }
});

// POST /api/emissions/add
app.post("/api/emissions/add", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const { category, subcategory, quantity, unit, date, description, department } = req.body;

    if (!category || !quantity || !unit || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    // Simple CO2 calculation (you can enhance this)
    const emissionFactors: Record<string, number> = {
      electricity: 0.5, // kg CO2 per kWh
      transport: 0.2,   // kg CO2 per km
      fuel: 2.3,        // kg CO2 per liter
      waste: 0.5,       // kg CO2 per kg
    };

    const factor = emissionFactors[category.toLowerCase()] || 0.5;
    const co2Emissions = quantityNum * factor;

    const { data: emission, error } = await supabase
      .from("emissions")
      .insert({
        user_id: user.userId,
        category,
        subcategory: subcategory || null,
        quantity: quantityNum.toString(),
        unit,
        co2_emissions: co2Emissions.toString(),
        date: new Date(date).toISOString(),
        description: description || null,
        department: department || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Emission logged successfully",
      emission: {
        id: emission.id,
        category: emission.category,
        subcategory: emission.subcategory,
        quantity: parseFloat(emission.quantity),
        unit: emission.unit,
        co2Emissions: parseFloat(emission.co2_emissions),
        date: emission.date,
        description: emission.description,
        department: emission.department,
      },
      co2Emissions,
    });
  } catch (error) {
    console.error('Error adding emission:', error);
    res.status(500).json({ message: "Failed to log emission" });
  }
});

// DELETE /api/emissions/:id
app.delete("/api/emissions/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const emissionId = parseInt(req.params.id);

    const { error } = await supabase
      .from("emissions")
      .delete()
      .eq("id", emissionId)
      .eq("user_id", user.userId);

    if (error) throw error;

    res.json({ message: "Emission deleted successfully" });
  } catch (error) {
    console.error('Error deleting emission:', error);
    res.status(500).json({ message: "Failed to delete emission" });
  }
});

// GET /api/emissions/summary
app.get("/api/emissions/summary", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const { startDate, endDate } = req.query;

    let query = supabase
      .from("emissions")
      .select("*")
      .eq("user_id", user.userId);

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    const { data: emissions, error } = await query;
    if (error) throw error;

    const totalEmissions = (emissions || []).reduce(
      (sum: number, e: any) => sum + parseFloat(e.co2_emissions || 0),
      0
    );

    const categories: Record<string, number> = {};
    (emissions || []).forEach((e: any) => {
      categories[e.category] = (categories[e.category] || 0) + parseFloat(e.co2_emissions || 0);
    });

    res.json({
      totalEmissions,
      categories,
      emissionCount: emissions?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
});

// GET /api/goals
app.get("/api/goals", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;

    const { data: goals, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mappedGoals = (goals || []).map((g: any) => ({
      id: g.id,
      goalName: g.goal_name,
      goalType: g.goal_type,
      targetValue: parseFloat(g.target_value),
      currentValue: parseFloat(g.current_value || 0),
      targetDate: g.target_date,
      status: g.status,
      category: g.category,
      createdAt: g.created_at,
    }));

    res.json({ goals: mappedGoals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
});

// POST /api/goals
app.post("/api/goals", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const { goalName, goalType, targetValue, targetDate, category } = req.body;

    if (!goalName || !goalType || !targetValue || !targetDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { data: goal, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.userId,
        goal_name: goalName,
        goal_type: goalType,
        target_value: targetValue.toString(),
        current_value: "0",
        target_date: new Date(targetDate).toISOString(),
        status: "active",
        category: category || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Goal created successfully",
      goal: {
        id: goal.id,
        goalName: goal.goal_name,
        goalType: goal.goal_type,
        targetValue: parseFloat(goal.target_value),
        currentValue: parseFloat(goal.current_value),
        targetDate: goal.target_date,
        status: goal.status,
        category: goal.category,
      },
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: "Failed to create goal" });
  }
});

// GET /api/user/profile
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;

    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.userId)
      .single();

    if (error) throw error;

    const { password, first_name, last_name, company_name, company_department, created_at, updated_at, ...rest } = userData;
    const userProfile = {
      ...rest,
      firstName: first_name,
      lastName: last_name,
      companyName: company_name,
      companyDepartment: company_department,
      createdAt: created_at,
    };

    res.json({ user: userProfile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Catch all for other API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found", path: req.url });
});

// Export handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Log environment check (without exposing secrets)
    console.log('Environment check:', {
      hasJwtSecret: !!JWT_SECRET,
      hasGoogleClientId: !!GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!GOOGLE_CLIENT_SECRET,
      hasFrontendUrl: !!FRONTEND_URL,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    
    app(req as any, res as any);
  } catch (error) {
    console.error('Serverless error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }
  }
}
