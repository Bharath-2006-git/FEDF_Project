import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Express } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

// Environment configuration
process.env.NODE_ENV = 'production';

// Validate and get required environment variables
const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const JWT_SECRET = process.env.JWT_SECRET as string;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || '';
const FRONTEND_URL = process.env.FRONTEND_URL || '';

// Validate critical environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !JWT_SECRET) {
  console.error('❌ CRITICAL: Missing required environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET');
  console.error('SUPABASE_URL present:', !!process.env.SUPABASE_URL);
  console.error('SUPABASE_SERVICE_ROLE_KEY present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.error('JWT_SECRET present:', !!process.env.JWT_SECRET);
}

// Create Supabase client with better error handling
const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'carbonsense-api',
      },
    },
  }
);

// Test Supabase connection on startup
(async () => {
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection test FAILED:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (e) {
    console.error('❌ Supabase connection test ERROR:', e);
  }
})();

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

          // Check if user exists - only select needed fields for faster query
          const { data: existingUser } = await supabase
            .from("users")
            .select("id, email, role, first_name, last_name, company_name, company_department, created_at")
            .eq("email", email)
            .limit(1)
            .maybeSingle();

          if (existingUser) {
            return done(null, existingUser);
          }

          // Create new user with faster password (Google users don't need strong bcrypt hash)
          const names = profile.displayName?.split(" ") || ["", ""];
          const firstName = profile.name?.givenName || names[0] || "User";
          const lastName = profile.name?.familyName || names[names.length - 1] || "";

          const { data: newUser, error } = await supabase
            .from("users")
            .insert({
              email,
              password: 'google-oauth-' + Date.now(), // Simple placeholder, not used for OAuth users
              first_name: firstName,
              last_name: lastName,
              role: "individual",
            })
            .select("id, email, role, first_name, last_name, company_name, company_department, created_at")
            .single();

          if (error) {
            console.error('❌ OAuth user creation error:', JSON.stringify(error, null, 2));
            throw error;
          }
          return done(null, newUser);
        } catch (error) {
          console.error('❌ OAuth error:', error);
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
      if (!JWT_SECRET) {
        return res.redirect(`${FRONTEND_URL}/auth?error=config_error`);
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Only send minimal user data in URL to reduce size and speed up redirect
      const minimalUser = {
        id: user.id,
        email: user.email,
        firstName: user.first_name || 'User',
        lastName: user.last_name || '',
        role: user.role
      };
      
      const userData = encodeURIComponent(JSON.stringify(minimalUser));
      res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('[OAuth] Token generation error:', error);
      res.redirect(`${FRONTEND_URL}/auth?error=token_generation_failed`);
    }
  })(req, res, next);
});

// Health check with Supabase connection test
app.get("/api/health", async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const supabaseStatus = error ? 'disconnected' : 'connected';
    const supabaseError = error ? error.message : null;

    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: {
        SUPABASE_URL_SET: !!SUPABASE_URL,
        SUPABASE_KEY_SET: !!SUPABASE_SERVICE_ROLE_KEY,
        JWT_SECRET_SET: !!JWT_SECRET,
        GOOGLE_OAuth_SET: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
        NODE_ENV: process.env.NODE_ENV,
      },
      supabase: {
        status: supabaseStatus,
        error: supabaseError,
        url: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'NOT SET',
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: String(error),
      timestamp: new Date().toISOString(),
    });
  }
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
      console.error('❌ Signup error:', JSON.stringify(error, null, 2));
      console.error('Supabase URL configured:', !!SUPABASE_URL);
      return res.status(500).json({ 
        message: "Failed to create user",
        details: error.message || 'Database error',
      });
    }

    // Generate JWT token
    if (!JWT_SECRET) {
      return res.status(503).json({ message: "Server configuration error" });
    }

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

      if (!JWT_SECRET) {
        return res.status(503).json({ message: "Server configuration error" });
      }

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
      if (error) {
        console.error('❌ Login DB error:', JSON.stringify(error, null, 2));
      }
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    if (!JWT_SECRET) {
      return res.status(503).json({ message: "Server configuration error" });
    }

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

  if (!JWT_SECRET) {
    return res.status(503).json({ message: 'Server configuration error' });
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

    if (error) {
      console.error('❌ Fetch emissions error:', JSON.stringify(error, null, 2));
      throw error;
    }

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

// GET /api/emissions/summary
app.get("/api/emissions/summary", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const { startDate, endDate } = req.query;

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

    const { data: emissions, error } = await query;

    if (error) throw error;

    const emissionsData = emissions || [];

    // Calculate total emissions
    const totalEmissions = emissionsData.reduce((sum, e: any) => {
      return sum + parseFloat(e.co2_emissions || 0);
    }, 0);

    // Calculate emissions by category
    const byCategory = emissionsData.reduce((acc, e: any) => {
      const category = e.category;
      const value = parseFloat(e.co2_emissions || 0);
      acc[category] = (acc[category] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    // Calculate emissions by subcategory
    const bySubcategory = emissionsData.reduce((acc, e: any) => {
      const subcategory = e.subcategory;
      if (subcategory) {
        const value = parseFloat(e.co2_emissions || 0);
        acc[subcategory] = (acc[subcategory] || 0) + value;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get average daily emissions
    const dates = new Set(emissionsData.map((e: any) => {
      const date = e.date instanceof Date ? e.date : new Date(e.date);
      return date.toISOString().split('T')[0];
    }));
    const averageDaily = dates.size > 0 ? totalEmissions / dates.size : 0;

    // Find highest and lowest emission days
    const dailyEmissions = emissionsData.reduce((acc, e: any) => {
      const date = e.date instanceof Date ? e.date : new Date(e.date);
      const dateStr = date.toISOString().split('T')[0];
      const value = parseFloat(e.co2_emissions || 0);
      acc[dateStr] = (acc[dateStr] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    const highestDay = Object.entries(dailyEmissions)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];
    
    const lowestDay = Object.entries(dailyEmissions)
      .sort(([, a], [, b]) => (a as number) - (b as number))[0];

    res.json({
      totalEmissions: Math.round(totalEmissions * 1000) / 1000,
      totalEntries: emissionsData.length,
      byCategory,
      bySubcategory,
      averageDaily: Math.round(averageDaily * 1000) / 1000,
      highestDay: highestDay ? { date: highestDay[0] as string, value: Math.round((highestDay[1] as number) * 1000) / 1000 } : null,
      lowestDay: lowestDay ? { date: lowestDay[0] as string, value: Math.round((lowestDay[1] as number) * 1000) / 1000 } : null,
      uniqueDays: dates.size,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
  } catch (error) {
    console.error('Error fetching emissions summary:', error);
    res.status(500).json({ message: "Failed to fetch emissions summary" });
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

    if (error) {
      console.error('❌ Add emission error:', JSON.stringify(error, null, 2));
      console.error('Payload:', { user_id: user.userId, category, quantity: quantityNum });
      throw error;
    }

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

// PUT /api/emissions/:id  
app.put("/api/emissions/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const emissionId = parseInt(req.params.id);
    const { category, subcategory, quantity, unit, date, description, department } = req.body;

    const quantityNum = parseFloat(quantity);
    const emissionFactors: Record<string, number> = {
      electricity: 0.5,
      transport: 0.2,
      fuel: 2.3,
      waste: 0.5,
    };
    const factor = emissionFactors[category?.toLowerCase()] || 0.5;
    const co2Emissions = quantityNum * factor;

    const { data: emission, error } = await supabase
      .from("emissions")
      .update({
        category,
        subcategory: subcategory || null,
        quantity: quantityNum.toString(),
        unit,
        co2_emissions: co2Emissions.toString(),
        date: new Date(date).toISOString(),
        description: description || null,
        department: department || null,
      })
      .eq("id", emissionId)
      .eq("user_id", user.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Emission updated successfully",
      emission: {
        id: emission.id,
        category: emission.category,
        quantity: parseFloat(emission.quantity),
        unit: emission.unit,
        co2Emissions: parseFloat(emission.co2_emissions),
        date: emission.date,
      },
    });
  } catch (error) {
    console.error('Error updating emission:', error);
    res.status(500).json({ message: "Failed to update emission" });
  }
});

// GET /api/emissions/history
app.get("/api/emissions/history", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const { startDate, endDate } = req.query;

    let query = supabase
      .from("emissions")
      .select("date, co2_emissions")
      .eq("user_id", user.userId)
      .order("date", { ascending: true });

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    const { data: emissions, error } = await query;
    if (error) throw error;

    // Group by date and sum emissions
    const historyMap: Record<string, number> = {};
    (emissions || []).forEach((e: any) => {
      const dateKey = e.date.split('T')[0];
      historyMap[dateKey] = (historyMap[dateKey] || 0) + parseFloat(e.co2_emissions || 0);
    });

    const history = Object.entries(historyMap).map(([date, emissions]) => ({
      date,
      emissions,
    }));

    res.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// GET /api/emissions/calculate
app.get("/api/emissions/calculate", async (req, res) => {
  try {
    const { category, subcategory, quantity, unit } = req.query;

    if (!category || !quantity || !unit) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const quantityNum = parseFloat(quantity as string);
    const emissionFactors: Record<string, number> = {
      electricity: 0.5,
      transport: 0.2,
      fuel: 2.3,
      waste: 0.5,
    };

    const factor = emissionFactors[(category as string).toLowerCase()] || 0.5;
    const co2Emissions = quantityNum * factor;

    res.json({
      co2Emissions,
      emissionFactor: factor,
      calculationMethod: "standard",
      confidence: "medium",
    });
  } catch (error) {
    console.error('Error calculating emissions:', error);
    res.status(500).json({ message: "Failed to calculate emissions" });
  }
});

// PUT /api/goals/:id
app.put("/api/goals/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const goalId = parseInt(req.params.id);
    const { goalName, targetValue, targetDate, status } = req.body;

    const { data: goal, error } = await supabase
      .from("goals")
      .update({
        goal_name: goalName,
        target_value: targetValue?.toString(),
        target_date: targetDate,
        status,
      })
      .eq("id", goalId)
      .eq("user_id", user.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Goal updated successfully",
      goal: {
        id: goal.id,
        goalName: goal.goal_name,
        targetValue: parseFloat(goal.target_value),
        targetDate: goal.target_date,
        status: goal.status,
      },
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: "Failed to update goal" });
  }
});

// DELETE /api/goals/:id
app.delete("/api/goals/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const goalId = parseInt(req.params.id);

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", user.userId);

    if (error) throw error;

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: "Failed to delete goal" });
  }
});

// GET /api/goals/:id/progress
app.get("/api/goals/:id/progress", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const goalId = parseInt(req.params.id);

    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .eq("user_id", user.userId)
      .single();

    if (goalError) throw goalError;

    // Calculate progress based on emissions
    const { data: emissions, error: emError } = await supabase
      .from("emissions")
      .select("co2_emissions")
      .eq("user_id", user.userId);

    if (emError) throw emError;

    const currentValue = (emissions || []).reduce(
      (sum: number, e: any) => sum + parseFloat(e.co2_emissions || 0),
      0
    );

    const targetValue = parseFloat(goal.target_value);
    const progress = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;

    res.json({
      goalId: goal.id,
      goalName: goal.goal_name,
      currentValue,
      targetValue,
      progress: Math.min(progress, 100),
      status: goal.status,
    });
  } catch (error) {
    console.error('Error fetching goal progress:', error);
    res.status(500).json({ message: "Failed to fetch goal progress" });
  }
});

// (Removed duplicate /api/tips that returned { tips: [...] } to ensure consistent Tip[] response)

// POST /api/reports/generate
app.post("/api/reports/generate", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const { reportType, startDate, endDate } = req.body;

    // Get emissions data for report
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
      message: "Report generated successfully",
      report: {
        reportType,
        startDate,
        endDate,
        totalEmissions,
        categories,
        emissionCount: emissions?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: "Failed to generate report" });
  }
});

// GET /api/analytics/category-breakdown
app.get("/api/analytics/category-breakdown", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const { timeRange } = req.query;

    // Get emissions grouped by category
    const { data: emissions, error } = await supabase
      .from("emissions")
      .select("category, co2_emissions")
      .eq("user_id", user.userId);

    if (error) throw error;

    // Group by category and calculate totals
    const categoryData: Record<string, number> = {};
    let total = 0;
    
    (emissions || []).forEach((e: any) => {
      const category = e.category || 'other';
      const value = parseFloat(e.co2_emissions || 0);
      categoryData[category] = (categoryData[category] || 0) + value;
      total += value;
    });

    const data = Object.entries(categoryData).map(([category, value]) => ({
      category,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      trend: 0
    }));

    res.json({ data });
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    res.status(500).json({ message: "Failed to fetch category breakdown" });
  }
});

// GET /api/analytics/monthly-comparison
app.get("/api/analytics/monthly-comparison", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const { timeRange } = req.query;

    // Get emissions for the specified time range
    const { data: emissions, error } = await supabase
      .from("emissions")
      .select("date, co2_emissions")
      .eq("user_id", user.userId)
      .order("date", { ascending: true });

    if (error) throw error;

    // Group by month and calculate totals
    const monthlyData: Record<string, number> = {};
    (emissions || []).forEach((e: any) => {
      const month = e.date.substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + parseFloat(e.co2_emissions || 0);
    });

    const data = Object.entries(monthlyData).map(([month, current]) => ({
      month,
      current,
      previous: 0, // Could calculate previous year comparison
      change: 0
    }));

    res.json({ data });
  } catch (error) {
    console.error('Error fetching monthly comparison:', error);
    res.status(500).json({ message: "Failed to fetch monthly comparison" });
  }
});

// GET /api/analytics/yearly-trends
app.get("/api/analytics/yearly-trends", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;

    const { data: emissions, error } = await supabase
      .from("emissions")
      .select("date, co2_emissions")
      .eq("user_id", user.userId)
      .order("date", { ascending: true });

    if (error) throw error;

    // Group by year
    const yearlyData: Record<string, number> = {};
    (emissions || []).forEach((e: any) => {
      const year = e.date.substring(0, 4);
      yearlyData[year] = (yearlyData[year] || 0) + parseFloat(e.co2_emissions || 0);
    });

    const data = Object.entries(yearlyData).map(([year, emissions]) => ({
      year,
      emissions,
      goals: 0,
      achieved: false
    }));

    res.json({ data });
  } catch (error) {
    console.error('Error fetching yearly trends:', error);
    res.status(500).json({ message: "Failed to fetch yearly trends" });
  }
});

// GET /api/analytics/peak-analysis
app.get("/api/analytics/peak-analysis", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;

    const { data: emissions, error } = await supabase
      .from("emissions")
      .select("date, co2_emissions")
      .eq("user_id", user.userId)
      .order("co2_emissions", { ascending: false });

    if (error) throw error;

    const emissionsArray = emissions || [];
    const highest = emissionsArray[0];
    const lowest = emissionsArray[emissionsArray.length - 1];
    const total = emissionsArray.reduce((sum: number, e: any) => sum + parseFloat(e.co2_emissions || 0), 0);
    const average = emissionsArray.length > 0 ? total / emissionsArray.length : 0;

    const data = {
      highestDay: { date: highest?.date || '', value: parseFloat(highest?.co2_emissions || 0) },
      lowestDay: { date: lowest?.date || '', value: parseFloat(lowest?.co2_emissions || 0) },
      averageDaily: average
    };

    res.json({ data });
  } catch (error) {
    console.error('Error fetching peak analysis:', error);
    res.status(500).json({ message: "Failed to fetch peak analysis" });
  }
});

// PUT /api/profile
app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const { firstName, lastName, companyName, companyDepartment } = req.body;

    const { data: updated, error } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        company_department: companyDepartment,
      })
      .eq("id", user.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Profile updated successfully",
      user: {
        firstName: updated.first_name,
        lastName: updated.last_name,
        companyName: updated.company_name,
        companyDepartment: updated.company_department,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// GET /api/tips
app.get("/api/tips", authenticateToken, async (req, res) => {
  try {
    console.log('[Tips API] Request received');
    
    const user = req.user as JWTUser;  
    const { category, limit } = req.query; 

    console.log(`[Tips] User: ${user.userId}, Role: ${user.role}, Category: ${category || 'all'}`);

    // Get all active tips
    const { data: allTips, error } = await supabase
      .from("tips")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error('❌ [Tips] Database error:', error);
      return res.status(500).json({ 
        message: "Failed to fetch tips from database", 
        error: error.message 
      });
    }

    console.log(`[Tips] Found ${(allTips || []).length} active tips in database`);

    if (!allTips || allTips.length === 0) {
      console.log('[Tips] No active tips found in database');
      return res.json([]);
    }

    // Log sample tip structure
    if (allTips.length > 0) {
      console.log('[Tips] Sample tip structure:', {
        id: allTips[0].id,
        title: allTips[0].title,
        target_role: allTips[0].target_role,
        category: allTips[0].category
      });
    }

    // Filter by role
    const tipsByRole = allTips.filter((tip: any) => {
      const targetRole = tip.target_role;
      const matches = targetRole === user.role || targetRole === 'all';
      return matches;
    });

    console.log(`[Tips] After role filter (${user.role}): ${tipsByRole.length} tips`);

    // Filter by category if specified
    let filteredTips = tipsByRole;
    if (category && category !== 'all') {
      filteredTips = tipsByRole.filter((tip: any) => tip.category === category);
      console.log(`[Tips] After category filter (${category}): ${filteredTips.length} tips`);
    }

    // Transform to camelCase
    const transformedTips = filteredTips.map((tip: any) => ({
      id: tip.id,
      title: tip.title,
      content: tip.content,
      category: tip.category,
      targetRole: tip.target_role,
      impactLevel: tip.impact_level,
      estimatedSavings: tip.estimated_savings,
      difficulty: tip.difficulty,
      explanation: tip.explanation,
      source: tip.source,
    }));

    // Apply limit if specified
    const finalTips = limit 
      ? transformedTips.slice(0, parseInt(limit as string))
      : transformedTips;

    console.log(`✅ [Tips] Returning ${finalTips.length} tips to client`);
    res.json(finalTips);
  } catch (error) {
    console.error('❌ Error fetching tips:', error);
    res.status(500).json({ message: "Failed to fetch tips", error: String(error) });
  }
});

// GET /api/tips/completed
app.get("/api/tips/completed", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;

    const { data: completedTips, error } = await supabase
      .from("completed_tips")
      .select("*")
      .eq("user_id", user.userId);

    if (error) throw error;

    // Transform snake_case to camelCase
    const transformedCompleted = (completedTips || []).map((ct: any) => ({
      id: ct.id,
      userId: ct.user_id,
      tipId: ct.tip_id,
      completedAt: ct.completed_at,
      estimatedSavings: ct.estimated_savings,
    }));

    res.json(transformedCompleted);
  } catch (error) {
    console.error('Error fetching completed tips:', error);
    res.status(500).json({ message: "Failed to fetch completed tips" });
  }
});

// POST /api/tips/complete
app.post("/api/tips/complete", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const { tipId, estimatedSavings } = req.body;

    const { data: completed, error } = await supabase
      .from("completed_tips")
      .insert({
        user_id: user.userId,
        tip_id: tipId,
        estimated_savings: estimatedSavings || 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Transform response
    const transformed = {
      id: completed.id,
      userId: completed.user_id,
      tipId: completed.tip_id,
      completedAt: completed.completed_at,
      estimatedSavings: completed.estimated_savings,
    };

    res.json(transformed);
  } catch (error) {
    console.error('Error completing tip:', error);
    res.status(500).json({ message: "Failed to complete tip" });
  }
});

// DELETE /api/tips/complete/:id
app.delete("/api/tips/complete/:id", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;
    const tipId = parseInt(req.params.id);

    const { error } = await supabase
      .from("completed_tips")
      .delete()
      .eq("user_id", user.userId)
      .eq("tip_id", tipId);

    if (error) throw error;

    res.json({ message: "Tip unmarked as completed" });
  } catch (error) {
    console.error('Error uncompleting tip:', error);
    res.status(500).json({ message: "Failed to uncomplete tip" });
  }
});

// GET /api/tips/personalized
app.get("/api/tips/personalized", authenticateToken, async (req, res) => {
  try {
    const user = req.user as JWTUser;

    console.log(`[Personalized Tips] Fetching for user ${user.userId}, role: ${user.role}`);

    // Get user's emission categories
    const { data: emissions } = await supabase
      .from("emissions")
      .select("category, co2_emissions")
      .eq("user_id", user.userId);

    // Calculate top categories
    const categoryTotals: Record<string, number> = {};
    emissions?.forEach((e: any) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.co2_emissions);
    });

    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([cat]) => cat);

    // Get tips for top categories
    const categoriesToQuery = topCategories.length > 0 ? topCategories : ["energy", "transport"];
    console.log(`[Personalized Tips] Top categories:`, categoriesToQuery);

    // Get all active tips first
    let query = supabase
      .from("tips")
      .select("*")
      .eq("is_active", true)
      .order("impact_level", { ascending: false });

    // Add category filter if we have categories
    if (categoriesToQuery.length > 0) {
      query = query.in("category", categoriesToQuery);
    }

    const { data: allTips, error } = await query;

    if (error) {
      console.error('❌ Fetch personalized tips error:', JSON.stringify(error, null, 2));
      return res.json([]);
    }

    // Filter by role on the application side and limit
    const tips = (allTips || [])
      .filter((tip: any) => {
        const targetRole = tip.target_role || tip.targetRole;
        return targetRole === user.role || targetRole === 'all';
      })
      .slice(0, 15);

    console.log(`✅ Found ${tips.length} personalized tips`);

    // Transform snake_case to camelCase
    const transformedTips = tips.map((tip: any) => ({
      id: tip.id,
      title: tip.title,
      content: tip.content,
      category: tip.category,
      targetRole: tip.target_role || tip.targetRole,
      impactLevel: tip.impact_level || tip.impactLevel,
      estimatedSavings: tip.estimated_savings || tip.estimatedSavings,
      difficulty: tip.difficulty,
      explanation: tip.explanation,
      source: tip.source,
    }));

    res.json(transformedTips);
  } catch (error) {
    console.error('❌ Error fetching personalized tips:', error);
    res.json([]);
  }
});

// Catch all for other API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found", path: req.url });
});

// Export handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Log all requests for debugging
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Validate environment variables
    if (!JWT_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ [Config] Missing required environment variables');
      console.error('Environment check:', {
        JWT_SECRET: !!JWT_SECRET,
        SUPABASE_URL: !!SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
        NODE_ENV: process.env.NODE_ENV,
      });
      return res.status(503).json({ 
        message: 'Service configuration error',
        details: 'Server is not properly configured. Check environment variables.',
      });
    }
    
    app(req as any, res as any);
  } catch (error) {
    console.error('❌ [Server] Unhandled error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Internal server error',
        error: String(error),
      });
    }
  }
}
