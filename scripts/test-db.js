import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users, emissions } from '../shared/schema.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'bharath@16',
      database: 'carbonsense',
    });
    
    const db = drizzle(connection);
    
    // Test basic query
    console.log('✓ Database connection established');
    
    // Test table access
    const userCount = await db.select().from(users).limit(1);
    console.log('✓ Users table accessible');
    
    const emissionCount = await db.select().from(emissions).limit(1);
    console.log('✓ Emissions table accessible');
    
    console.log('✓ All database tests passed!');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection();