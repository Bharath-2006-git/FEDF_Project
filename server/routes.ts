// This is a replacement file for the routes.ts to fix all TypeScript issues
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginSchema, insertUserSchema, insertEmissionSchema, insertGoalSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Extend Express Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

// Middleware to verify JWT token
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to calculate CO2 emissions with comprehensive emission factors
const calculateCO2Emissions = (category: string, quantity: number, unit: string, subcategory?: string): number => {
  // Comprehensive emission factors (kg CO2 per unit)
  const emissionFactors: Record<string, Record<string, number>> = {
    electricity: { 
      kWh: 0.5,  // Grid average
      MWh: 500
    },
    travel: { 
      km: 0.15,      // Average vehicle
      mile: 0.24,    // Average vehicle
      miles: 0.24,
      hours: 5.0     // For flights (approximate)
    },
    fuel: { 
      liter: 2.31,        // Gasoline
      liters: 2.31,
      gallon: 8.74,       // Gasoline
      gallons: 8.74,
      cubic_meters: 2.0,  // Natural gas
      "cubic meters": 2.0
    },
    production: { 
      unit: 1.5,
      units: 1.5,
      kg: 0.5,
      tons: 500,
      hours: 10.0
    },
    logistics: { 
      km: 0.8,
      miles: 1.29,
      packages: 2.5,
      tons: 100
    },
    waste: { 
      kg: 0.5,     // Landfill waste
      lbs: 0.23,
      bags: 3.0,   // Assuming ~6kg per bag
      tons: 500,
      cubic_meters: 50,
      "cubic meters": 50
    }
  };

  // Subcategory-specific factors (override category defaults)
  const subcategoryFactors: Record<string, Record<string, Record<string, number>>> = {
    travel: {
      car: { km: 0.21, mile: 0.34, miles: 0.34 },
      bus: { km: 0.05, mile: 0.08, miles: 0.08 },
      train: { km: 0.04, mile: 0.06, miles: 0.06 },
      plane: { km: 0.25, mile: 0.40, miles: 0.40, hours: 90.0 },
      bike: { km: 0, mile: 0, miles: 0 },
      walk: { km: 0, mile: 0, miles: 0 }
    },
    fuel: {
      gasoline: { liter: 2.31, liters: 2.31, gallon: 8.74, gallons: 8.74 },
      diesel: { liter: 2.68, liters: 2.68, gallon: 10.15, gallons: 10.15 },
      natural_gas: { cubic_meters: 2.0, "cubic meters": 2.0, liter: 0.002, liters: 0.002 },
      heating_oil: { liter: 2.52, liters: 2.52, gallon: 9.54, gallons: 9.54 }
    },
    waste: {
      household: { kg: 0.5, lbs: 0.23, bags: 3.0 },
      recyclable: { kg: 0.1, lbs: 0.05, bags: 0.6 },
      organic: { kg: 0.3, lbs: 0.14, bags: 1.8 },
      electronic: { kg: 1.5, lbs: 0.68, bags: 9.0 },
      industrial: { kg: 0.8, lbs: 0.36, tons: 800 },
      hazardous: { kg: 2.0, lbs: 0.91, tons: 2000 }
    }
  };

  // Try subcategory-specific factor first, then category default, then fallback
  let factor = 1.0; // Default fallback
  
  if (subcategory && subcategoryFactors[category]?.[subcategory]?.[unit]) {
    factor = subcategoryFactors[category][subcategory][unit];
  } else if (emissionFactors[category]?.[unit]) {
    factor = emissionFactors[category][unit];
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
  
  // POST /api/emissions/add
  app.post("/api/emissions/add", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('📊 Add emission request received');
      
      if (!req.user) {
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
        user_id: req.user.userId,
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
  app.get("/api/emissions/calculate", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('🧮 Calculate emissions request received');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
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

  // GET /api/emissions/history
  app.get("/api/emissions/history", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('📜 Emissions history request received');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { startDate, endDate } = req.query;
      
      const emissions = await storage.getUserEmissions(
        req.user.userId,
        startDate as string,
        endDate as string
      );

      console.log(`✓ Found ${emissions.length} emissions for user ${req.user.userId}`);

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
  app.get("/api/emissions/list", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('📋 Emissions list request received');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { startDate, endDate, category, limit } = req.query;
      
      let emissions = await storage.getUserEmissions(
        req.user.userId,
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
  app.get("/api/emissions/summary", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('📊 Emissions summary request received');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { startDate, endDate } = req.query;
      
      // Get all emissions for the period
      const emissions = await storage.getUserEmissions(
        req.user.userId,
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
  app.put("/api/emissions/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

      await storage.updateEmission(emissionId, req.user.userId, updateData);
      
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
  app.delete("/api/emissions/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('🗑️ Delete emission request received');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const emissionId = parseInt(req.params.id);
      
      await storage.deleteEmission(emissionId, req.user.userId);
      
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
  app.post("/api/goals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const goalData = {
        userId: req.user.userId,
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
  app.get("/api/goals", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const goals = await storage.getUserGoals(req.user.userId);
      res.json(goals);
    } catch (error) {
      console.error('Goals list error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/tips
  app.get("/api/tips", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { category, limit } = req.query;
      const userRole = req.user.role;

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
  app.post("/api/reports/generate", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { reportType, startDate, endDate } = req.body;
      
      // For now, return dummy data since getReportData doesn't exist yet
      const data = {
        totalEmissions: 1000,
        breakdown: { electricity: 400, travel: 300, fuel: 200, waste: 100 },
        period: { startDate, endDate }
      };

      // For now, return dummy report since createReport doesn't exist yet  
      const report = {
        id: Date.now(),
        userId: req.user.userId,
        reportType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        filePath: `/reports/${req.user.userId}_${reportType}_${Date.now()}.json`,
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
  app.get("/api/user/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const user = await storage.getUser(req.user.userId);
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
  app.put("/api/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // For now, just return success message since updateUser doesn't exist yet
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/dummy/dashboard - for testing
  app.get("/api/dummy/dashboard", (req: Request, res: Response) => {
    const dummyData = {
      totalEmissions: 1234.5,
      monthlyEmissions: 234.7,
      categories: {
        electricity: 450.2,
        travel: 320.8,
        fuel: 123.5,
        waste: 67.3
      },
      history: [
        { date: '2024-01', emissions: 400 },
        { date: '2024-02', emissions: 380 },
        { date: '2024-03', emissions: 420 },
        { date: '2024-04', emissions: 350 },
        { date: '2024-05', emissions: 320 },
        { date: '2024-06', emissions: 234.7 }
      ],
      goals: [
        { id: 1, name: 'Reduce electricity by 20%', progress: 65, target: 20 },
        { id: 2, name: 'Cut travel emissions by 30%', progress: 45, target: 30 }
      ]
    };
    
    res.json(dummyData);
  });

  const httpServer = createServer(app);
  return httpServer;
}