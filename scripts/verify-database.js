// Database verification script
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Please make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const requiredTables = [
  'users',
  'emissions',
  'goals',
  'reports',
  'tips',
  'achievements',
  'notifications'
];

async function verifyDatabase() {
  console.log('🔍 Verifying CarbonSense Database Setup...\n');
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('');

  let allTablesExist = true;

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}' - NOT FOUND or ERROR`);
        console.log(`   Error: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table '${table}' - EXISTS`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' - ERROR: ${err.message}`);
      allTablesExist = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  
  if (allTablesExist) {
    console.log('✅ DATABASE SETUP COMPLETE!');
    console.log('\nYour database is ready. You can now:');
    console.log('  1. Run: npm run dev:full');
    console.log('  2. Open: http://localhost:5174');
    console.log('  3. Try signup/login');
  } else {
    console.log('❌ DATABASE SETUP INCOMPLETE!');
    console.log('\n📋 Action Required:');
    console.log('  1. Go to: https://supabase.com/dashboard');
    console.log('  2. Open your project');
    console.log('  3. Go to SQL Editor');
    console.log('  4. Run the SQL in: migrations/supabase_setup.sql');
    console.log('\nOR use the Supabase CLI:');
    console.log('  npx supabase db push');
  }
  
  console.log('='.repeat(60) + '\n');
}

verifyDatabase().catch(console.error);
