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

// For now, use in-memory storage with dummy data
export class DatabaseStorage {
  private usersData: User[] = [];
  private emissionsData: Emission[] = [];
  private goalsData: Goal[] = [];
  private nextUserId = 1;
  private nextEmissionId = 1;
  private nextGoalId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersData.find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextUserId++,
      email: user.email,
      password: user.password,
      role: user.role || 'individual',
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      companyName: user.companyName || null,
      companyDepartment: user.companyDepartment || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.usersData.push(newUser);
    return newUser;
  }

  async addEmission(emission: InsertEmission): Promise<Emission> {
    const newEmission: Emission = {
      id: this.nextEmissionId++,
      userId: emission.userId,
      category: emission.category,
      subcategory: emission.subcategory || null,
      quantity: emission.quantity,
      unit: emission.unit,
      co2Emissions: emission.co2Emissions,
      date: emission.date || new Date(),
      description: emission.description || null,
      department: emission.department || null,
      createdAt: new Date()
    };
    this.emissionsData.push(newEmission);
    return newEmission;
  }

  async getUserEmissions(userId: number, startDate?: string, endDate?: string): Promise<Emission[]> {
    let userEmissions = this.emissionsData.filter(emission => emission.userId === userId);
    
    if (startDate || endDate) {
      userEmissions = userEmissions.filter(emission => {
        const emissionDate = emission.date;
        if (startDate && emissionDate < new Date(startDate)) return false;
        if (endDate && emissionDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    return userEmissions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async calculateTotalEmissions(userId: number, startDate?: string, endDate?: string): Promise<number> {
    const emissions = await this.getUserEmissions(userId, startDate, endDate);
    return emissions.reduce((total, emission) => total + Number(emission.co2Emissions), 0);
  }

  async getEmissionsByCategory(userId: number, startDate?: string, endDate?: string): Promise<{ category: string; total: number }[]> {
    const emissions = await this.getUserEmissions(userId, startDate, endDate);
    const categoryTotals: Record<string, number> = {};
    
    emissions.forEach(emission => {
      if (!categoryTotals[emission.category]) {
        categoryTotals[emission.category] = 0;
      }
      categoryTotals[emission.category] += Number(emission.co2Emissions);
    });
    
    return Object.entries(categoryTotals).map(([category, total]) => ({ category, total }));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const newGoal: Goal = {
      id: this.nextGoalId++,
      userId: goal.userId,
      category: goal.category || null,
      goalName: goal.goalName,
      goalType: goal.goalType,
      targetValue: goal.targetValue,
      currentValue: null,
      targetDate: goal.targetDate,
      status: null,
      completedAt: null,
      createdAt: new Date()
    };
    this.goalsData.push(newGoal);
    return newGoal;
  }

  async getUserGoals(userId: number): Promise<Goal[]> {
    return this.goalsData.filter(goal => goal.userId === userId);
  }

  async updateGoalProgress(goalId: number, currentValue: number): Promise<void> {
    const goal = this.goalsData.find(g => g.id === goalId);
    if (goal) {
      goal.currentValue = currentValue.toString();
      // Note: 'progress' and 'updatedAt' properties don't exist in the schema
    }
  }

  async getTipsForUser(role: string, category?: string): Promise<any[]> {
    // Return dummy tips based on role
    const individualTips = [
      { id: 1, title: "Use LED bulbs", content: "Switch to LED lighting to reduce electricity consumption", category: "electricity" },
      { id: 2, title: "Walk or bike", content: "Use active transportation for short trips", category: "travel" },
      { id: 3, title: "Reduce heating", content: "Lower your thermostat by 2°C to save energy", category: "electricity" }
    ];

    const companyTips = [
      { id: 4, title: "Remote work", content: "Implement remote work policies to reduce commuting emissions", category: "travel" },
      { id: 5, title: "Energy audit", content: "Conduct regular energy audits to identify savings opportunities", category: "electricity" },
      { id: 6, title: "Sustainable supply chain", content: "Choose suppliers with strong environmental commitments", category: "production" }
    ];

    const tips = role === 'individual' ? individualTips : companyTips;
    
    if (category) {
      return tips.filter(tip => tip.category === category);
    }
    
    return tips;
  }

  async saveReport(userId: number, reportType: string, reportDate: Date, filePath: string, reportData: any): Promise<void> {
    // For now, just log the report
    console.log(`Report saved: ${reportType} for user ${userId} at ${filePath}`);
  }
}

export const storage = new DatabaseStorage();