-- CarbonSense Database Setup for Supabase (PostgreSQL)
-- Run this in your Supabase SQL Editor

-- Users table with role support
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'individual', -- individual, company, admin
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(255),
  company_department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emissions table for tracking carbon emissions
CREATE TABLE IF NOT EXISTS emissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- electricity, travel, fuel, waste, production, logistics
  subcategory VARCHAR(100), -- car, plane, train, etc.
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL, -- kWh, miles, liters, kg
  co2_emissions DECIMAL(10,3) NOT NULL, -- calculated CO2 in kg
  date TIMESTAMP NOT NULL,
  description TEXT,
  department VARCHAR(100), -- for companies
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals table for emission reduction goals
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_name VARCHAR(255) NOT NULL,
  goal_type VARCHAR(50) NOT NULL, -- reduction_percentage, absolute_target
  target_value DECIMAL(10,3) NOT NULL,
  current_value DECIMAL(10,3) DEFAULT 0,
  target_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, expired
  category VARCHAR(50), -- specific category or "all"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Reports table for storing generated reports
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL, -- monthly, annual, custom
  report_date TIMESTAMP NOT NULL,
  file_path VARCHAR(500),
  file_format VARCHAR(10), -- csv, pdf
  report_data JSONB, -- store report summary data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tips table for eco-friendly recommendations
CREATE TABLE IF NOT EXISTS tips (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- energy, transport, waste, industrial
  target_role VARCHAR(20) NOT NULL, -- individual, company, all
  impact_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table for gamification
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL, -- goal_completed, streak, reduction
  title VARCHAR(255) NOT NULL,
  description TEXT,
  badge_icon VARCHAR(100),
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- reminder, milestone, tip
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_emissions_user_id ON emissions(user_id);
CREATE INDEX IF NOT EXISTS idx_emissions_date ON emissions(date);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Insert some sample tips
INSERT INTO tips (title, content, category, target_role, impact_level) VALUES
  ('Switch to LED Bulbs', 'Replace traditional incandescent bulbs with LED bulbs to reduce energy consumption by up to 75%', 'energy', 'individual', 'medium'),
  ('Use Public Transportation', 'Using public transport instead of personal vehicles can reduce your carbon footprint significantly', 'transport', 'individual', 'high'),
  ('Implement Recycling Program', 'Set up a comprehensive recycling program in your organization to reduce waste', 'waste', 'company', 'high'),
  ('Remote Work Policy', 'Allow employees to work from home to reduce commuting emissions', 'transport', 'company', 'high'),
  ('Energy Audit', 'Conduct regular energy audits to identify and fix energy waste', 'energy', 'company', 'high')
ON CONFLICT DO NOTHING;

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'CarbonSense database setup completed successfully!';
END $$;
