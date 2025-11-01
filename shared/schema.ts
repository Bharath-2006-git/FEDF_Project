import { sql } from "drizzle-orm";
import { pgTable, serial, varchar, text, decimal, timestamp, json, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role support
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("individual"), // individual, company, admin
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  companyName: varchar("company_name", { length: 255 }),
  companyDepartment: varchar("company_department", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Emissions table for tracking carbon emissions
export const emissions = pgTable("emissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // electricity, travel, fuel, waste, production, logistics
  subcategory: varchar("subcategory", { length: 100 }), // car, plane, train, etc.
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(), // kWh, miles, liters, kg
  co2Emissions: decimal("co2_emissions", { precision: 10, scale: 3 }).notNull(), // calculated CO2 in kg
  date: timestamp("date").notNull(),
  description: text("description"),
  department: varchar("department", { length: 100 }), // for companies
  createdAt: timestamp("created_at").defaultNow(),
});

// Goals table for emission reduction goals
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  goalName: varchar("goal_name", { length: 255 }).notNull(),
  goalType: varchar("goal_type", { length: 50 }).notNull(), // reduction_percentage, absolute_target
  targetValue: decimal("target_value", { precision: 10, scale: 3 }).notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 3 }).default("0"),
  targetDate: timestamp("target_date").notNull(),
  status: varchar("status", { length: 20 }).default("active"), // active, completed, expired
  category: varchar("category", { length: 50 }), // specific category or "all"
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Reports table for storing generated reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reportType: varchar("report_type", { length: 50 }).notNull(), // monthly, annual, custom
  reportDate: timestamp("report_date").notNull(),
  filePath: varchar("file_path", { length: 500 }),
  fileFormat: varchar("file_format", { length: 10 }), // csv, pdf
  reportData: json("report_data"), // store report summary data
  createdAt: timestamp("created_at").defaultNow(),
});

// Tips table for eco-friendly recommendations
export const tips = pgTable("tips", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // energy, transport, waste, industrial
  targetRole: varchar("target_role", { length: 20 }).notNull(), // individual, company, all
  impactLevel: varchar("impact_level", { length: 20 }).default("medium"), // low, medium, high
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  role: true,
  firstName: true,
  lastName: true,
  companyName: true,
  companyDepartment: true,
});

export const insertEmissionSchema = createInsertSchema(emissions).pick({
  userId: true,
  category: true,
  subcategory: true,
  quantity: true,
  unit: true,
  co2Emissions: true,
  date: true,
  description: true,
  department: true,
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  goalName: true,
  goalType: true,
  targetValue: true,
  targetDate: true,
  category: true,
});

// Additional validation schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const emissionCalculationSchema = z.object({
  userId: z.number(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEmission = z.infer<typeof insertEmissionSchema>;
export type Emission = typeof emissions.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Tip = typeof tips.$inferSelect;
