import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import {
  type User,
  type InsertUser,
  type Emission,
  type InsertEmission,
  type Goal,
  type InsertGoal,
} from "@shared/schema";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export class DatabaseStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    
    // Convert snake_case to camelCase
    return {
      id: (data as any).id,
      email: (data as any).email,
      password: (data as any).password,
      role: (data as any).role,
      firstName: (data as any).first_name,
      lastName: (data as any).last_name,
      companyName: (data as any).company_name,
      companyDepartment: (data as any).company_department,
      createdAt: (data as any).created_at,
      updatedAt: (data as any).updated_at,
    } as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    
    // Convert snake_case to camelCase
    return {
      id: (data as any).id,
      email: (data as any).email,
      password: (data as any).password,
      role: (data as any).role,
      firstName: (data as any).first_name,
      lastName: (data as any).last_name,
      companyName: (data as any).company_name,
      companyDepartment: (data as any).company_department,
      createdAt: (data as any).created_at,
      updatedAt: (data as any).updated_at,
    } as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Convert camelCase to snake_case for database
    const dbUser = {
      email: user.email,
      password: user.password,
      role: user.role,
      first_name: user.firstName,
      last_name: user.lastName,
      company_name: user.companyName,
      company_department: user.companyDepartment,
    };
    
    const { data, error } = await supabase.from("users").insert(dbUser).select().single();
    if (error) throw error;
    
    // Convert snake_case back to camelCase for response
    return {
      id: (data as any).id,
      email: (data as any).email,
      password: (data as any).password,
      role: (data as any).role,
      firstName: (data as any).first_name,
      lastName: (data as any).last_name,
      companyName: (data as any).company_name,
      companyDepartment: (data as any).company_department,
      createdAt: (data as any).created_at,
      updatedAt: (data as any).updated_at,
    } as User;
  }

  async addEmission(emission: InsertEmission): Promise<Emission> {
    const { data, error } = await supabase.from("emissions").insert(emission).select().single();
    if (error) throw error;
    return data as Emission;
  }

  async updateEmission(emissionId: number, userId: number, updateData: any): Promise<void> {
    const { error } = await supabase
      .from("emissions")
      .update(updateData)
      .eq("id", emissionId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async deleteEmission(emissionId: number, userId: number): Promise<void> {
    const { error } = await supabase
      .from("emissions")
      .delete()
      .eq("id", emissionId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async getUserEmissions(userId: number, startDate?: string, endDate?: string): Promise<Emission[]> {
    let query = supabase.from("emissions").select("*").eq("user_id", userId).order("date", { ascending: false });
    if (startDate && endDate) {
      query = query.gte("date", startDate).lte("date", endDate);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as any) || [];
  }

  async calculateTotalEmissions(userId: number, startDate?: string, endDate?: string): Promise<number> {
    const emissions = await this.getUserEmissions(userId, startDate, endDate);
    return emissions.reduce((total, e) => total + Number((e as any).co2_emissions ?? (e as any).co2Emissions ?? 0), 0);
  }

  async getEmissionsByCategory(userId: number, startDate?: string, endDate?: string): Promise<{ category: string; total: number }[]> {
    const emissions = await this.getUserEmissions(userId, startDate, endDate);
    const totals: Record<string, number> = {};
    emissions.forEach((e: any) => {
      const category = e.category;
      const value = Number(e.co2_emissions ?? e.co2Emissions ?? 0);
      totals[category] = (totals[category] || 0) + value;
    });
    return Object.entries(totals).map(([category, total]) => ({ category, total }));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    // Convert camelCase to snake_case for Supabase
    const dbGoal = {
      user_id: goal.userId,
      goal_name: goal.goalName,
      goal_type: goal.goalType,
      target_value: goal.targetValue,
      target_date: goal.targetDate,
      category: goal.category || 'all'
    };
    const { data, error } = await supabase.from("goals").insert(dbGoal).select().single();
    if (error) throw error;
    return data as Goal;
  }

  async getUserGoals(userId: number): Promise<Goal[]> {
    const { data, error } = await supabase.from("goals").select("*").eq("user_id", userId);
    if (error) throw error;
    return (data as any) || [];
  }

  async updateGoalProgress(goalId: number, currentValue: number): Promise<void> {
    const { error } = await supabase.from("goals").update({ current_value: currentValue }).eq("id", goalId);
    if (error) throw error;
  }

  async updateGoal(goalId: number, userId: number, updateData: any): Promise<void> {
    const { error } = await supabase
      .from("goals")
      .update(updateData)
      .eq("id", goalId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async deleteGoal(goalId: number, userId: number): Promise<void> {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async calculateGoalProgress(goalId: number, userId: number): Promise<any> {
    // Get the goal
    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .eq("user_id", userId)
      .single();
    
    if (goalError) throw goalError;
    if (!goal) throw new Error("Goal not found");

    // Get user's emissions for the relevant category
    let emissionsQuery = supabase
      .from("emissions")
      .select("co2_emissions")
      .eq("user_id", userId);
    
    // Filter by category if not "all"
    if (goal.category && goal.category !== "all") {
      emissionsQuery = emissionsQuery.eq("category", goal.category);
    }
    
    // Filter by date range (from goal creation to target date)
    if (goal.created_at) {
      emissionsQuery = emissionsQuery.gte("date", goal.created_at);
    }
    if (goal.target_date) {
      emissionsQuery = emissionsQuery.lte("date", goal.target_date);
    }

    const { data: emissions, error: emissionsError } = await emissionsQuery;
    if (emissionsError) throw emissionsError;

    // Calculate total emissions
    const totalEmissions = (emissions || []).reduce((sum: number, e: any) => 
      sum + parseFloat(e.co2_emissions || 0), 0
    );

    // Calculate progress based on goal type
    const targetValue = parseFloat(goal.target_value);
    let progress = 0;
    let currentValue = totalEmissions;

    if (goal.goal_type === "reduction_percentage") {
      // For reduction percentage, progress is based on reduction achieved
      progress = Math.min((currentValue / targetValue) * 100, 100);
    } else {
      // For absolute target, progress is based on how close to target
      progress = Math.min((currentValue / targetValue) * 100, 100);
    }

    // Update the current value in the database
    await this.updateGoalProgress(goalId, currentValue);

    return {
      goalId,
      goalName: goal.goal_name,
      currentValue: Math.round(currentValue * 100) / 100,
      targetValue: Math.round(targetValue * 100) / 100,
      progress: Math.round(progress * 100) / 100,
      status: goal.status
    };
  }

  async updateUser(userId: number, updateData: any): Promise<void> {
    // Convert camelCase to snake_case for database
    const dbData: any = {};
    if (updateData.firstName !== undefined) dbData.first_name = updateData.firstName;
    if (updateData.lastName !== undefined) dbData.last_name = updateData.lastName;
    if (updateData.companyName !== undefined) dbData.company_name = updateData.companyName;
    if (updateData.companyDepartment !== undefined) dbData.company_department = updateData.companyDepartment;
    if (updateData.password !== undefined) dbData.password = updateData.password;
    
    dbData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("users")
      .update(dbData)
      .eq("id", userId);
    
    if (error) throw error;
  }

  async getTipsForUser(role: string, category?: string): Promise<any[]> {
    let query = supabase.from("tips").select("*").eq("target_role", role === "individual" ? "individual" : "company");
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) throw error;
    return (data as any) || [];
  }

  async saveReport(userId: number, reportType: string, reportDate: Date, filePath: string, reportData: any): Promise<void> {
    const payload = {
      user_id: userId,
      report_type: reportType,
      report_date: reportDate,
      file_path: filePath,
      file_format: filePath.endsWith(".pdf") ? "pdf" : "csv",
      report_data: reportData,
    };
    const { error } = await supabase.from("reports").insert(payload);
    if (error) throw error;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple query to check database connectivity
      const { error } = await supabase.from("users").select("id").limit(1);
      return !error;
    } catch (error) {
      return false;
    }
  }
}

export const storage = new DatabaseStorage();