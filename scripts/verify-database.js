import mysql from "mysql2/promise";

async function checkDatabaseContent() {
  console.log("🔍 Checking database content...\n");
  
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "bharath@16",
      database: "carbonsense"
    });

    // Check users
    console.log("👥 USERS:");
    const users = await connection.execute("SELECT id, email, role, first_name, last_name FROM users");
    console.table(users[0]);

    // Check emissions
    console.log("\n🌱 EMISSIONS:");
    const emissions = await connection.execute("SELECT id, user_id, category, subcategory, quantity, unit, co2_emissions FROM emissions LIMIT 5");
    console.table(emissions[0]);

    // Check goals
    console.log("\n🎯 GOALS:");
    const goals = await connection.execute("SELECT id, user_id, goal_name, target_value, current_value, status FROM goals");
    console.table(goals[0]);

    // Check tips
    console.log("\n💡 TIPS:");
    const tips = await connection.execute("SELECT id, title, category, target_role, impact_level FROM tips LIMIT 5");
    console.table(tips[0]);

    await connection.end();
    console.log("\n✅ Database verification completed!");
    
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
  }
}

checkDatabaseContent();