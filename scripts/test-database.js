import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

// Database connection setup
async function testDatabaseConnection() {
  console.log("🔗 Testing database connection...");
  
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "bharath@16",
      database: "carbonsense"
    });

    const db = drizzle(connection);
    
    // Test connection with a simple query
    const result = await connection.execute("SELECT 1 as test");
    console.log("✅ Database connection successful!");
    
    return { db, connection };
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
}

// Create database and tables if they don't exist
async function setupDatabase() {
  console.log("🏗️  Setting up database...");
  
  try {
    // Connect without specifying database first
    const connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "bharath@16"
    });

    // Create database if it doesn't exist
    await connection.execute("CREATE DATABASE IF NOT EXISTS carbonsense");
    console.log("✅ Database 'carbonsense' ready");
    
    await connection.end();
    
    // Now connect to the specific database
    const { db, connection: dbConnection } = await testDatabaseConnection();
    
    // Check if tables exist by trying to query them
    try {
      await dbConnection.execute("SELECT COUNT(*) FROM users LIMIT 1");
      console.log("✅ Tables already exist");
    } catch (error) {
      console.log("📊 Tables don't exist, they need to be created via migrations");
      console.log("💡 Run: npm run db:push");
    }
    
    await dbConnection.end();
    return true;
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    throw error;
  }
}

// Add dummy data
async function insertDummyData() {
  console.log("📊 Inserting dummy data...");
  
  const { db, connection } = await testDatabaseConnection();
  
  try {
    // Insert dummy users using raw SQL
    console.log("👥 Adding sample users...");
    const userInserts = [
      `INSERT IGNORE INTO users (email, password, role, first_name, last_name) VALUES 
       ('john.doe@example.com', '$2a$10$hash1', 'individual', 'John', 'Doe')`,
      `INSERT IGNORE INTO users (email, password, role, first_name, last_name) VALUES 
       ('jane.smith@example.com', '$2a$10$hash2', 'individual', 'Jane', 'Smith')`,
      `INSERT IGNORE INTO users (email, password, role, first_name, last_name, company_name, company_department) VALUES 
       ('admin@company.com', '$2a$10$hash3', 'company', 'Admin', 'User', 'EcoTech Solutions', 'Sustainability')`
    ];

    for (const userSQL of userInserts) {
      try {
        await connection.execute(userSQL);
        console.log(`✅ User added successfully`);
      } catch (error) {
        console.log(`⚠️  User might already exist: ${error.message}`);
      }
    }

    // Insert sample emissions data
    console.log("🌱 Adding sample emissions...");
    const emissionInserts = [
      `INSERT IGNORE INTO emissions (user_id, category, subcategory, quantity, unit, co2_emissions, date, description) VALUES 
       (1, 'electricity', 'home', 150.5, 'kWh', 72.24, '2024-01-15', 'Monthly home electricity usage')`,
      `INSERT IGNORE INTO emissions (user_id, category, subcategory, quantity, unit, co2_emissions, date, description) VALUES 
       (1, 'travel', 'car', 50.0, 'miles', 22.68, '2024-01-20', 'Commute to work')`,
      `INSERT IGNORE INTO emissions (user_id, category, subcategory, quantity, unit, co2_emissions, date, description) VALUES 
       (2, 'travel', 'plane', 500.0, 'miles', 82.5, '2024-01-25', 'Business trip')`,
      `INSERT IGNORE INTO emissions (user_id, category, subcategory, quantity, unit, co2_emissions, date, description, department) VALUES 
       (3, 'electricity', 'office', 1200.0, 'kWh', 576.0, '2024-01-10', 'Office building monthly usage', 'Operations')`
    ];

    for (const emissionSQL of emissionInserts) {
      try {
        await connection.execute(emissionSQL);
        console.log(`✅ Emission record added`);
      } catch (error) {
        console.log(`⚠️  Emission might already exist: ${error.message}`);
      }
    }

    // Insert sample goals
    console.log("🎯 Adding sample goals...");
    const goalInserts = [
      `INSERT IGNORE INTO goals (user_id, goal_name, goal_type, target_value, current_value, target_date, status, category) VALUES 
       (1, 'Reduce Home Energy by 20%', 'reduction_percentage', 20.0, 5.0, '2024-12-31', 'active', 'electricity')`,
      `INSERT IGNORE INTO goals (user_id, goal_name, goal_type, target_value, current_value, target_date, status, category) VALUES 
       (2, 'Carbon Neutral Travel', 'absolute_target', 0.0, 82.5, '2024-06-30', 'active', 'travel')`
    ];

    for (const goalSQL of goalInserts) {
      try {
        await connection.execute(goalSQL);
        console.log(`✅ Goal added successfully`);
      } catch (error) {
        console.log(`⚠️  Goal might already exist: ${error.message}`);
      }
    }

    // Insert tips using the existing SQL file
    console.log("💡 Adding sustainability tips...");
    const tipCount = await connection.execute("SELECT COUNT(*) as count FROM tips");
    const count = tipCount[0][0].count;
    
    if (count === 0) {
      console.log("📝 Loading tips from sample data...");
      
      const tipInserts = [
        `INSERT INTO tips (title, content, category, target_role, impact_level, is_active) VALUES
         ('Use LED light bulbs', 'Replace incandescent bulbs with LED bulbs to reduce electricity consumption by up to 75%', 'energy', 'individual', 'medium', 'true')`,
        `INSERT INTO tips (title, content, category, target_role, impact_level, is_active) VALUES
         ('Walk or bike for short trips', 'Choose active transportation for trips under 2 miles to reduce carbon emissions', 'transport', 'individual', 'high', 'true')`,
        `INSERT INTO tips (title, content, category, target_role, impact_level, is_active) VALUES
         ('Lower your thermostat', 'Reduce heating/cooling by 2°C to save 10-15% on energy bills', 'energy', 'individual', 'medium', 'true')`,
        `INSERT INTO tips (title, content, category, target_role, impact_level, is_active) VALUES
         ('Implement remote work policies', 'Allow employees to work from home to reduce commuting emissions', 'transport', 'company', 'high', 'true')`,
        `INSERT INTO tips (title, content, category, target_role, impact_level, is_active) VALUES
         ('Switch to renewable energy', 'Source electricity from solar, wind, or other renewable sources', 'energy', 'company', 'high', 'true')`
      ];

      for (const tipSQL of tipInserts) {
        try {
          await connection.execute(tipSQL);
          console.log(`✅ Tip added successfully`);
        } catch (error) {
          console.log(`⚠️  Tip might already exist: ${error.message}`);
        }
      }
    } else {
      console.log(`✅ ${count} tips already in database`);
    }

    console.log("🎉 Dummy data insertion completed!");
    await connection.end();
    
  } catch (error) {
    console.error("❌ Error inserting dummy data:", error);
    await connection.end();
    throw error;
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting database setup and testing...\n");
  
  try {
    await setupDatabase();
    console.log("");
    await insertDummyData();
    console.log("\n✅ Database setup and testing completed successfully!");
    console.log("\n📊 You can now:");
    console.log("   - Start your application: npm run dev");
    console.log("   - Check your database with a MySQL client");
    console.log("   - View the data in your application dashboard");
    
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    console.log("\n🔧 Troubleshooting steps:");
    console.log("   1. Make sure MySQL is running");
    console.log("   2. Check your database credentials in .env");
    console.log("   3. Ensure you have permissions to create databases");
    console.log("   4. Run: npm run db:push to create tables");
    process.exit(1);
  }
}

main();