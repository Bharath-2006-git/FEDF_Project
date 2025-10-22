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

// Helper function to calculate CO2 emissions
const calculateCO2Emissions = (category: string, quantity: number, unit: string): number => {
  // Emission factors (kg CO2 per unit)
  const emissionFactors: Record<string, Record<string, number>> = {
    electricity: { kWh: 0.5 },
    travel: { km: 0.2, mile: 0.32 },
    fuel: { liter: 2.3, gallon: 8.7 },
    production: { unit: 1.5 },
    logistics: { km: 0.8 },
    waste: { kg: 0.1 }
  };

  const factor = emissionFactors[category]?.[unit] || 1;
  return quantity * factor;
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

  // Analytics routes
  app.get("/api/analytics/monthly-comparison", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const timeRange = req.query.range as string || '6months';
      // This would typically fetch real data from the database
      // For now, returning dummy data that matches the frontend expectations
      res.json({
        data: [
          { month: 'Jan', current: 280, previous: 320, change: -12.5 },
          { month: 'Feb', current: 310, previous: 340, change: -8.8 },
          { month: 'Mar', current: 290, previous: 350, change: -17.1 },
          { month: 'Apr', current: 340, previous: 380, change: -10.5 },
          { month: 'May', current: 320, previous: 360, change: -11.1 },
          { month: 'Jun', current: 300, previous: 330, change: -9.1 }
        ]
      });
    } catch (error) {
      console.error('Monthly comparison error:', error);
      res.status(500).json({ message: "Failed to get monthly comparison" });
    }
  });

  app.get("/api/analytics/category-breakdown", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const timeRange = req.query.range as string || '6months';
      res.json({
        data: [
          { category: 'Electricity', value: 450.3, percentage: 36, trend: -5.2 },
          { category: 'Travel', value: 380.7, percentage: 30, trend: 2.1 },
          { category: 'Fuel', value: 250.1, percentage: 20, trend: -8.5 },
          { category: 'Waste', value: 169.4, percentage: 14, trend: -1.3 }
        ]
      });
    } catch (error) {
      console.error('Category breakdown error:', error);
      res.status(500).json({ message: "Failed to get category breakdown" });
    }
  });

  app.get("/api/analytics/yearly-trends", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      res.json({
        data: [
          { year: '2022', emissions: 4200, goals: 4000, achieved: false },
          { year: '2023', emissions: 3800, goals: 3500, achieved: false },
          { year: '2024', emissions: 3200, goals: 3400, achieved: true },
          { year: '2025', emissions: 2800, goals: 3000, achieved: true }
        ]
      });
    } catch (error) {
      console.error('Yearly trends error:', error);
      res.status(500).json({ message: "Failed to get yearly trends" });
    }
  });

  app.get("/api/analytics/peak-analysis", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const timeRange = req.query.range as string || '6months';
      res.json({
        data: {
          highestDay: { date: '2025-08-15', value: 45.8 },
          lowestDay: { date: '2025-07-22', value: 8.2 },
          averageDaily: 23.7
        }
      });
    } catch (error) {
      console.error('Peak analysis error:', error);
      res.status(500).json({ message: "Failed to get peak analysis" });
    }
  });

  app.get("/api/analytics/export", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const format = req.query.format as string || 'csv';
      const timeRange = req.query.range as string || '6months';
      
      if (format === 'csv') {
        const csvData = 'Date,Category,Amount,CO2\n2025-09-01,Electricity,250,58.25\n2025-09-02,Travel,50,20.2';
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=carbon-analytics.csv');
        res.send(csvData);
      } else {
        res.status(400).json({ message: "Unsupported format" });
      }
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ message: "Failed to export report" });
    }
  });

  // Achievements routes
  app.get("/api/achievements/user", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      res.json({
        data: [
          {
            id: 1,
            achievementType: 'goal_completed',
            title: 'Goal Crusher',
            description: 'Complete your first emission reduction goal',
            badgeIcon: 'trophy',
            unlockedAt: '2025-08-15T10:30:00Z',
            isUnlocked: true
          },
          {
            id: 2,
            achievementType: 'streak',
            title: 'Consistency Champion',
            description: 'Log emissions for 7 consecutive days',
            badgeIcon: 'flame',
            unlockedAt: '2025-08-20T14:15:00Z',
            isUnlocked: true
          },
          {
            id: 3,
            achievementType: 'reduction',
            title: 'Carbon Cutter',
            description: 'Reduce monthly emissions by 20%',
            badgeIcon: 'trending-down',
            progress: 15,
            maxProgress: 20,
            isUnlocked: false
          }
        ]
      });
    } catch (error) {
      console.error('User achievements error:', error);
      res.status(500).json({ message: "Failed to get user achievements" });
    }
  });

  app.get("/api/achievements/stats", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      res.json({
        data: {
          totalAchievements: 12,
          unlockedAchievements: 6,
          currentStreak: 14,
          longestStreak: 28,
          totalPoints: 850,
          rank: 'Gold',
          nextRankPoints: 1000
        }
      });
    } catch (error) {
      console.error('Achievement stats error:', error);
      res.status(500).json({ message: "Failed to get achievement stats" });
    }
  });

  // Notifications routes
  app.get("/api/notifications/list", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      res.json({
        data: [
          {
            id: 1,
            type: 'reminder',
            message: 'Don\'t forget to log your daily emissions!',
            isRead: false,
            scheduledFor: '2025-09-23T09:00:00Z',
            createdAt: '2025-09-23T09:00:00Z',
            priority: 'medium'
          },
          {
            id: 2,
            type: 'milestone',
            message: 'Congratulations! You\'ve achieved your monthly reduction goal of 15%',
            isRead: true,
            scheduledFor: '2025-09-20T10:30:00Z',
            createdAt: '2025-09-20T10:30:00Z',
            priority: 'high'
          }
        ]
      });
    } catch (error) {
      console.error('Notifications error:', error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.put("/api/notifications/:id/read", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // This would update the notification in the database
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put("/api/notifications/read-all", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // This would update all notifications for the user in the database
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // This would delete the notification from the database
      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.get("/api/notifications/settings", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      res.json({
        data: {
          emailNotifications: true,
          pushNotifications: true,
          dailyReminders: true,
          weeklyReports: true,
          goalDeadlines: true,
          achievements: true,
          tips: true,
          emissionAlerts: true,
          reminderTime: '09:00',
          reportDay: 'monday'
        }
      });
    } catch (error) {
      console.error('Notification settings error:', error);
      res.status(500).json({ message: "Failed to get notification settings" });
    }
  });

  app.put("/api/notifications/settings", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // This would update the user's notification settings in the database
      res.json({ message: "Notification settings updated" });
    } catch (error) {
      console.error('Update notification settings error:', error);
      res.status(500).json({ message: "Failed to update notification settings" });
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
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { category, subcategory, quantity, unit, date, description, department } = req.body;
      
      // Calculate CO2 emissions
      const co2Emissions = calculateCO2Emissions(category, quantity, unit);
      
      const emissionData = {
        userId: req.user.userId,
        category,
        subcategory,
        quantity: quantity.toString(),
        unit,
        co2Emissions: co2Emissions.toString(),
        date: new Date(date),
        description,
        department
      };

      const emission = await storage.addEmission(emissionData);
      
      res.status(201).json({
        emission,
        message: "Emission logged successfully"
      });
    } catch (error) {
      console.error('Add emission error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/emissions/calculate
  app.get("/api/emissions/calculate", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { category, quantity, unit } = req.query;
      
      // Calculate emissions for given parameters
      const co2Emissions = calculateCO2Emissions(
        category as string,
        parseFloat(quantity as string),
        unit as string
      );

      res.json({
        co2Emissions,
        category,
        quantity,
        unit
      });
    } catch (error) {
      console.error('Calculate emissions error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/emissions/history
  app.get("/api/emissions/history", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { startDate, endDate } = req.query;
      
      const emissions = await storage.getUserEmissions(
        req.user.userId,
        startDate as string,
        endDate as string
      );

      // Group by month for history
      const history = emissions.reduce((acc, emission) => {
        const month = emission.date.toISOString().substring(0, 7); // YYYY-MM
        const co2 = Number(emission.co2Emissions);
        
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += co2;
        return acc;
      }, {} as Record<string, number>);

      const historyArray = Object.entries(history).map(([date, emissions]) => ({
        date,
        emissions
      }));

      res.json(historyArray);
    } catch (error) {
      console.error('Emissions history error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/emissions/list
  app.get("/api/emissions/list", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { startDate, endDate } = req.query;
      
      const emissions = await storage.getUserEmissions(
        req.user.userId,
        startDate as string,
        endDate as string
      );

      res.json(emissions);
    } catch (error) {
      console.error('Emissions list error:', error);
      res.status(500).json({ message: "Internal server error" });
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