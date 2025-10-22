# CarbonSense Database Setup Guide

## Issue

The login and registration aren't working because the database tables don't exist in your Supabase database yet.

## Quick Solution - Use Demo Account (Immediate)

You can test the app right now with the demo account:

**Login credentials:**
- Email: `demo@carbonsense.com`
- Password: `demo123`

Go to: `http://localhost:5174/login`

## Full Solution - Setup Supabase Database

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your project: `kjgvhtbrzgxxahjtfjth`

### Step 2: Run the Setup SQL

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `migrations/supabase_setup.sql`
4. Paste it into the SQL editor
5. Click **Run** button

This will create all the necessary tables:
- ✅ `users` - User accounts
- ✅ `emissions` - Carbon emission records
- ✅ `goals` - User reduction goals
- ✅ `reports` - Generated reports
- ✅ `tips` - Eco-friendly tips
- ✅ `achievements` - Gamification
- ✅ `notifications` - User notifications

### Step 3: Verify Setup

After running the SQL, you should see:
- All tables listed in the **Table Editor**
- 5 sample tips in the `tips` table
- No errors in the SQL editor

### Step 4: Test Registration

1. Go to `http://localhost:5174/signup`
2. Fill in the registration form:
   - Email: your-email@example.com
   - Password: (at least 6 characters)
   - First Name: Your Name
   - Last Name: Your Last Name
   - Role: individual or company
3. Click **Sign Up**

You should now be able to create accounts and log in!

## Troubleshooting

### If you still get network errors:

1. **Check the terminal logs** - The server now has detailed logging that will show exactly what's happening
2. **Check browser console** - Press F12 and look for errors
3. **Verify Supabase connection** - Make sure your `.env` file has the correct credentials

### Common Issues:

**"Network Error"**: Usually means the tables don't exist yet - run the setup SQL

**"User already exists"**: Try a different email address

**"Invalid email or password"**: Check your credentials or use the demo account

## What's Next?

Once the database is set up, you can:
- ✅ Register new accounts
- ✅ Log in with your credentials
- ✅ Add emission records
- ✅ Set and track goals
- ✅ View analytics and reports
- ✅ Get sustainability tips

## Need Help?

Check the terminal output where `npm run dev:full` is running. It now shows detailed logs with emojis:
- 📝 Registration requests
- 🔐 Login attempts
- ✅ Success messages
- ❌ Error messages

This will help you see exactly what's happening!
