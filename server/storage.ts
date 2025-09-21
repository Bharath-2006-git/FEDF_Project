import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, desc, and, between, sum } from "drizzle-orm";
import { 
  users, 
  emissions, 
  goals, 
  reports, 
  tips, 
  achievements,
  notifications,
  type User, 
  type InsertUser,
  type Emission,
  type InsertEmission,
  type Goal,
  type InsertGoal
} from "@shared/schema";

// Initialize database connection
let db: ReturnType<typeof drizzle>;

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'bharath@16',
    database: 'carbonsense',
  });
  
  db = drizzle(connection);
  return db;
}

export class DatabaseStorage {
  private dbInitialized = false;

  private async ensureDatabase() {
    if (!this.dbInitialized) {
      await initializeDatabase();
      this.dbInitialized = true;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    await this.ensureDatabase();
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.ensureDatabase();
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    await this.ensureDatabase();
    const result = await db.insert(users).values(user);
    const newUser = await this.getUser(result[0].insertId as number);
    if (!newUser) {
      throw new Error("Failed to create user");
    }
    return newUser;
  }

  async addEmission(emission: InsertEmission): Promise<Emission> {
    await this.ensureDatabase();
    const result = await db.insert(emissions).values(emission);
    const newEmission = await db.select().from(emissions)
      .where(eq(emissions.id, result[0].insertId as number))
      .limit(1);
    return newEmission[0];
  }

  async getUserEmissions(userId: number, startDate?: string, endDate?: string): Promise<Emission[]> {
    await this.ensureDatabase();
    
    const baseCondition = eq(emissions.userId, userId);
    
    const whereCondition = (startDate && endDate)
      ? and(
          baseCondition,
          between(emissions.date, new Date(startDate), new Date(endDate))
        )
      : baseCondition;
    
    const result = await db.select()
      .from(emissions)
      .where(whereCondition)
      .orderBy(desc(emissions.date));
    
    return result;
  }

  async calculateTotalEmissions(userId: number, startDate?: string, endDate?: string): Promise<number> {
    await this.ensureDatabase();
    const userEmissions = await this.getUserEmissions(userId, startDate, endDate);
    return userEmissions.reduce((total, emission) => total + Number(emission.co2Emissions), 0);
  }

  async getEmissionsByCategory(userId: number, startDate?: string, endDate?: string): Promise<{ category: string; total: number }[]> {
    await this.ensureDatabase();
    const userEmissions = await this.getUserEmissions(userId, startDate, endDate);
    const categoryTotals: Record<string, number> = {};
    
    userEmissions.forEach(emission => {
      if (!categoryTotals[emission.category]) {
        categoryTotals[emission.category] = 0;
      }
      categoryTotals[emission.category] += Number(emission.co2Emissions);
    });
    
    return Object.entries(categoryTotals).map(([category, total]) => ({ category, total }));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    await this.ensureDatabase();
    const result = await db.insert(goals).values(goal);
    const newGoal = await db.select().from(goals)
      .where(eq(goals.id, result[0].insertId as number))
      .limit(1);
    return newGoal[0];
  }

  async getUserGoals(userId: number): Promise<Goal[]> {
    await this.ensureDatabase();
    const result = await db.select().from(goals).where(eq(goals.userId, userId));
    return result;
  }

  async updateGoalProgress(goalId: number, currentValue: number): Promise<void> {
    await this.ensureDatabase();
    await db.update(goals)
      .set({ currentValue: currentValue.toString() })
      .where(eq(goals.id, goalId));
  }

  async getTipsForUser(role: string, category?: string): Promise<any[]> {
    await this.ensureDatabase();
    
    const baseCondition = eq(tips.targetRole, role === 'individual' ? 'individual' : 'company');
    
    const whereCondition = category 
      ? and(baseCondition, eq(tips.category, category))
      : baseCondition;
    
    const result = await db.select().from(tips).where(whereCondition);
    return result;
  }

  async saveReport(userId: number, reportType: string, reportDate: Date, filePath: string, reportData: any): Promise<void> {
    await this.ensureDatabase();
    await db.insert(reports).values({
      userId,
      reportType,
      reportDate,
      filePath,
      fileFormat: filePath.endsWith('.pdf') ? 'pdf' : 'csv',
      reportData
    });
  }
}

export const storage = new DatabaseStorage();