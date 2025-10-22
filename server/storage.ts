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
    return data as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).limit(1).maybeSingle();
    if (error) throw error;
    return data as User | undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase.from("users").insert(user).select().single();
    if (error) throw error;
    return data as User;
  }

  async addEmission(emission: InsertEmission): Promise<Emission> {
    const { data, error } = await supabase.from("emissions").insert(emission).select().single();
    if (error) throw error;
    return data as Emission;
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
    const { data, error } = await supabase.from("goals").insert(goal).select().single();
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
}

export const storage = new DatabaseStorage();