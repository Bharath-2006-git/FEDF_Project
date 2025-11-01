# 🚀 CarbonSense - Complete Deployment Guide

**Last Updated:** November 2, 2025  
**Deployment Time:** 15-30 minutes  
**Difficulty:** Easy

---

## 📋 What You'll Need

- [ ] GitHub account
- [ ] Vercel account (free tier)
- [ ] Supabase account (free tier)
- [ ] Google account (for OAuth - optional)
- [ ] 15-30 minutes

---

## 🎯 Deployment Overview

### **Option 1: Basic Deployment (15 minutes)**
✅ Email/password authentication  
✅ All core features  
⏭️ Skip Google OAuth  

### **Option 2: Full Deployment (30 minutes)**
✅ Email/password authentication  
✅ All core features  
✅ Google "Sign in with Google"  

💡 **Recommended:** Start with Option 1, add OAuth later if needed!

---

# 📍 STEP 1: Supabase Setup (5 minutes)

## 1.1 Create Supabase Project

### **URL to Open:**
```
https://app.supabase.com
```

### **Actions:**
1. Click "New Project"
2. Fill in:
   - **Name:** `carbonsense`
   - **Database Password:** [Create a strong password]
   - **Region:** Choose closest to you
3. Click "Create new project"
4. Wait 2-3 minutes for setup

---

## 1.2 Get Your Supabase Credentials

### **URL to Open:**
```
https://app.supabase.com/project/[YOUR-PROJECT]/settings/api
```

### **Copy These Values:**

**1. Project URL:**
```
Copy from: "Project URL" section
Example: https://abcdefghijk.supabase.co
```

**2. Anon/Public Key:**
```
Copy from: "Project API keys" → anon public
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**3. Service Role Key:**
```
Copy from: "Project API keys" → service_role
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 1.3 Get Database Connection String

### **URL to Open:**
```
https://app.supabase.com/project/[YOUR-PROJECT]/settings/database
```

### **Actions:**
1. Scroll to "Connection string" section
2. Select "URI" tab
3. Click "Connection pooling"
4. Copy the string (looks like below)

### **Format:**
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password!

### **Final Connection String to Copy:**
```
Example:
postgresql://postgres.abcdefghijk:MySecurePass123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 1.4 Run Database Migrations

### **Open Terminal and Run:**
```bash
cd c:\Users\bhara\Downloads\CarbonSense
```

### **If you have Drizzle Kit installed:**
```bash
npx drizzle-kit push:pg
```

### **If not installed, install first:**
```bash
npm install -g drizzle-kit
npx drizzle-kit push:pg
```

This creates all necessary tables (users, emissions, goals, reports, tips).

---

# 📍 STEP 2: Generate JWT Secret (1 minute)

### **Open Terminal and Run:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Copy the Output:**
```
Example output:
a1b2c3d4e5f6789012345678901234567890abcdefghijklmnopqrstuvwx

⚠️ Save this! You'll need it for Vercel.
```

---

# 📍 STEP 3: Google OAuth Setup (15 minutes - OPTIONAL)

**Skip this section if you want basic deployment only!**

## 3.1 Create Google Cloud Project

### **URL to Open:**
```
https://console.cloud.google.com
```

### **Actions:**
1. Click "Select a project" dropdown at top
2. Click "New Project"
3. **Project name:** `CarbonSense`
4. Click "Create"
5. Wait 10 seconds
6. Click "Select Project" to activate it

---

## 3.2 Enable Google+ API

### **URL to Open:**
```
https://console.cloud.google.com/apis/library
```

### **Actions:**
1. Search: `Google+ API`
2. Click on it
3. Click "Enable"
4. Wait 5 seconds

---

## 3.3 Configure OAuth Consent Screen

### **URL to Open:**
```
https://console.cloud.google.com/apis/credentials/consent
```

### **Fill in the Form:**

**User Type:**
```
Select: External
Click: Create
```

**App Information:**
```
App name: CarbonSense
User support email: [Your email address]
```

**App Domain (will update after deployment):**
```
Application home page: https://your-app.vercel.app
Authorized domains: vercel.app
```

**Developer contact information:**
```
Email addresses: [Your email address]
```

Click: **Save and Continue**

**Scopes:**
```
Click: Add or Remove Scopes
Select these 3 scopes:
  ✓ .../auth/userinfo.email
  ✓ .../auth/userinfo.profile  
  ✓ openid
Click: Update
Click: Save and Continue
```

**Test users (optional):**
```
Click: Add Users
Enter: [Your email and any test user emails]
Click: Add
Click: Save and Continue
```

Click: **Back to Dashboard**

---

## 3.4 Create OAuth Credentials

### **URL to Open:**
```
https://console.cloud.google.com/apis/credentials
```

### **Actions:**
1. Click "Create Credentials" → "OAuth client ID"

### **Fill in:**
```
Application type: Web application
Name: CarbonSense Web Client
```

### **Authorized JavaScript origins - Add These URLs:**
```
http://localhost:5173
```
*Note: Add production URL after deployment*

### **Authorized redirect URIs - Add These URLs:**
```
http://localhost:3000/api/auth/google/callback
```
*Note: Add production URL after deployment*

Click: **Create**

---

## 3.5 Copy OAuth Credentials

### **You'll See a Popup - Copy These:**

```
Client ID: 
[Copy the long string ending in .apps.googleusercontent.com]

Client secret:
[Copy the string starting with GOCSPX-]
```

### **Example Format:**
```
Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxx
```

**⚠️ Save these! You'll add them to Vercel.**

Click: **OK**

---

# 📍 STEP 4: Deploy to Vercel (5 minutes)

## 4.1 Import Project

### **URL to Open:**
```
https://vercel.com/new
```

### **Actions:**
1. Click "Import Git Repository"
2. Find: `Bharath-2006-git/FEDF_Project`
3. Click "Import"

---

## 4.2 Configure Build Settings

### **Keep These Default Settings:**
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build && npm run build:server
Output Directory: dist/public
Install Command: npm install
```

**Do NOT click Deploy yet!**

---

## 4.3 Add Environment Variables

### **Click: "Environment Variables" section**

### **Add These Variables ONE BY ONE:**

#### **Variable 1: SUPABASE_URL**
```
Key: SUPABASE_URL
Value: [Paste from Step 1.2]
Example: https://abcdefghijk.supabase.co
```

#### **Variable 2: SUPABASE_ANON_KEY**
```
Key: SUPABASE_ANON_KEY
Value: [Paste from Step 1.2]
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Variable 3: SUPABASE_SERVICE_ROLE_KEY**
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [Paste from Step 1.2]
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Variable 4: DATABASE_URL**
```
Key: DATABASE_URL
Value: [Paste from Step 1.3]
Example: postgresql://postgres.abcdefghijk:MyPass@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

#### **Variable 5: JWT_SECRET**
```
Key: JWT_SECRET
Value: [Paste from Step 2]
Example: a1b2c3d4e5f6789012345678901234567890abcdefghijklmnopqrstuvwx
```

#### **Variable 6: NODE_ENV**
```
Key: NODE_ENV
Value: production
```

#### **Variable 7: FRONTEND_URL**
```
Key: FRONTEND_URL
Value: https://your-project.vercel.app
Note: You'll update this after deployment with actual URL
```

#### **Variable 8: VITE_API_URL**
```
Key: VITE_API_URL
Value: https://your-project.vercel.app
Note: You'll update this after deployment with actual URL
```

#### **Variable 9: API_URL**
```
Key: API_URL
Value: https://your-project.vercel.app
Note: You'll update this after deployment with actual URL
```

#### **Variable 10: HOST**
```
Key: HOST
Value: 0.0.0.0
```

#### **Variable 11: PORT**
```
Key: PORT
Value: 3000
```

---

### **IF YOU DID GOOGLE OAUTH (Step 3), ADD THESE TOO:**

#### **Variable 12: GOOGLE_CLIENT_ID**
```
Key: GOOGLE_CLIENT_ID
Value: [Paste from Step 3.5]
Example: 123456789-abc.apps.googleusercontent.com
```

#### **Variable 13: GOOGLE_CLIENT_SECRET**
```
Key: GOOGLE_CLIENT_SECRET
Value: [Paste from Step 3.5]
Example: GOCSPX-xxxxxxxxxxxxxxxxxxxx
```

#### **Variable 14: GOOGLE_CALLBACK_URL**
```
Key: GOOGLE_CALLBACK_URL
Value: https://your-project.vercel.app/api/auth/google/callback
Note: You'll update this after deployment with actual URL
```

---

### **For All Variables:**
```
✓ Check: Production
✓ Check: Preview
✓ Check: Development
```

---

## 4.4 Deploy

### **Click: "Deploy"**

Wait 2-3 minutes for build to complete.

---

## 4.5 Get Your Vercel URL

### **After Deployment Completes:**

You'll see:
```
🎉 Congratulations! Your project is live!

Your production deployment is ready:
https://carbonsense-abc123.vercel.app
```

**Copy this URL! You need it for next steps.**

---

# 📍 STEP 5: Update Environment Variables with Real URL (2 minutes)

## 5.1 Update Vercel Variables

### **URL to Open:**
```
https://vercel.com/[YOUR-USERNAME]/[PROJECT-NAME]/settings/environment-variables
```

### **Find and Edit These 3 Variables:**

**Update: FRONTEND_URL**
```
Old: https://your-project.vercel.app
New: [Paste your actual Vercel URL]
Example: https://carbonsense-abc123.vercel.app
```

**Update: VITE_API_URL**
```
Old: https://your-project.vercel.app
New: [Paste your actual Vercel URL]
Example: https://carbonsense-abc123.vercel.app
```

**Update: API_URL**
```
Old: https://your-project.vercel.app
New: [Paste your actual Vercel URL]
Example: https://carbonsense-abc123.vercel.app
```

### **IF YOU HAVE GOOGLE OAUTH:**

**Update: GOOGLE_CALLBACK_URL**
```
Old: https://your-project.vercel.app/api/auth/google/callback
New: [Paste your actual Vercel URL]/api/auth/google/callback
Example: https://carbonsense-abc123.vercel.app/api/auth/google/callback
```

Click: **Save** for each

---

## 5.2 Redeploy

### **URL to Open:**
```
https://vercel.com/[YOUR-USERNAME]/[PROJECT-NAME]
```

### **Actions:**
1. Go to "Deployments" tab
2. Click three dots (⋯) on the latest deployment
3. Click "Redeploy"
4. Click "Redeploy" again to confirm
5. Wait 1-2 minutes

---

# 📍 STEP 6: Update Google OAuth URLs (2 minutes - If you did OAuth)

**Skip if you didn't set up Google OAuth!**

## 6.1 Update Google Console

### **URL to Open:**
```
https://console.cloud.google.com/apis/credentials
```

### **Actions:**
1. Click on "CarbonSense Web Client"
2. Under "Authorized JavaScript origins", click "ADD URI"

### **Add Your Vercel URL:**
```
https://carbonsense-abc123.vercel.app
[Replace with YOUR actual Vercel URL]
```

3. Under "Authorized redirect URIs", click "ADD URI"

### **Add Your Callback URL:**
```
https://carbonsense-abc123.vercel.app/api/auth/google/callback
[Replace with YOUR actual Vercel URL + /api/auth/google/callback]
```

4. Click: **Save**
5. Wait 5 minutes for changes to propagate

---

# 📍 STEP 7: Test Your Deployment (5 minutes)

## 7.1 Test Basic Features

### **Your App URL:**
```
https://[YOUR-VERCEL-URL].vercel.app
```

### **Test Checklist:**

**Homepage:**
```
URL: https://[YOUR-URL].vercel.app
✓ Loads without errors
✓ Shows welcome page
✓ Navigation works
```

**Health Check:**
```
URL: https://[YOUR-URL].vercel.app/api/health
✓ Should show: {"status":"healthy","message":"CarbonSense API is running"}
```

**Create Account:**
```
URL: https://[YOUR-URL].vercel.app/signup
✓ Can create account
✓ Redirects to login
```

**Login:**
```
URL: https://[YOUR-URL].vercel.app/login
✓ Can login with created account
✓ Redirects to dashboard
```

**Dashboard:**
```
URL: https://[YOUR-URL].vercel.app/dashboard
✓ Shows stat cards
✓ Charts render
✓ No errors in console
```

---

## 7.2 Test Google OAuth (If Configured)

### **Login Page:**
```
URL: https://[YOUR-URL].vercel.app/login
✓ Shows "Continue with Google" button
```

### **Click Google Button:**
```
✓ Redirects to Google sign-in
✓ Shows your Google accounts
✓ Select account
✓ Grant permissions (first time)
✓ Redirects back to app
✓ Shows dashboard
✓ Profile shows Google email
```

### **Test Logout & Re-login:**
```
✓ Logout works
✓ "Continue with Google" logs in immediately
✓ No permission prompt on second login
```

---

# 🐛 Troubleshooting

## Issue 1: Build Failed

### **Check:**
```
URL: https://vercel.com/[USER]/[PROJECT]/deployments
Click on failed deployment
Check build logs
```

### **Common Causes:**
- Missing environment variables
- Incorrect build command
- Node version mismatch

### **Fix:**
```
1. Verify all 11 environment variables are set (14 if OAuth)
2. Check "Build Command" is: npm run build && npm run build:server
3. Redeploy
```

---

## Issue 2: API Returns 500 Error

### **Check:**
```
URL: https://vercel.com/[USER]/[PROJECT]/functions
Look at function logs
```

### **Common Causes:**
- Database connection failed
- JWT_SECRET missing
- Supabase credentials wrong

### **Fix:**
```
1. Verify DATABASE_URL is correct (has your password)
2. Verify JWT_SECRET is set
3. Test Supabase connection at: https://app.supabase.com
4. Redeploy
```

---

## Issue 3: Google OAuth - "redirect_uri_mismatch"

### **Error:**
```
Error 400: redirect_uri_mismatch
```

### **Fix:**
```
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth client
3. Verify redirect URI EXACTLY matches:
   https://YOUR-EXACT-VERCEL-URL.vercel.app/api/auth/google/callback
4. No trailing slash!
5. Must use https://
6. Save and wait 5 minutes
```

---

## Issue 4: Google OAuth - "This app isn't verified"

### **This is NORMAL for new apps!**

### **For Testing:**
```
Click: Advanced
Click: Go to CarbonSense (unsafe)
Continue testing
```

### **For Production (Optional):**
```
1. Go to OAuth consent screen
2. Click "Publish App"
3. Submit for verification (takes 1-2 weeks)
```

---

## Issue 5: Charts Not Displaying

### **Check Browser Console:**
```
F12 → Console tab
Look for errors
```

### **Common Causes:**
- API returning no data
- User has no emissions logged

### **Fix:**
```
1. Log some test emissions
2. Refresh dashboard
3. Check if data appears
```

---

# ✅ Post-Deployment Checklist

Copy this checklist and check off as you test:

```
BASIC FEATURES:
□ Homepage loads
□ API health endpoint responds
□ Can create account
□ Can login
□ Dashboard shows stats
□ Can log emissions
□ Charts display
□ Analytics page works
□ Goals feature works
□ Profile page works
□ Dark mode toggles
□ Mobile responsive

GOOGLE OAUTH (if configured):
□ "Continue with Google" button shows
□ Google sign-in works
□ Creates account automatically
□ Can logout and re-login
□ Profile shows Google email

PERFORMANCE:
□ Pages load fast (< 3 seconds)
□ No console errors
□ Images load properly
□ Navigation is smooth
```

---

# 🎉 You're Live!

Congratulations! Your CarbonSense app is now deployed! 🚀🌱

### **Your Live App:**
```
https://[YOUR-VERCEL-URL].vercel.app
```

### **Share Your App:**
```
✓ Test with friends and family
✓ Gather feedback
✓ Monitor Vercel analytics
✓ Check Supabase database usage
```

---

# 📞 Quick Reference

## All URLs You Need:

```
Supabase Dashboard:
https://app.supabase.com

Vercel Dashboard:
https://vercel.com/dashboard

Google Cloud Console:
https://console.cloud.google.com

Your App:
https://[YOUR-VERCEL-URL].vercel.app

API Health Check:
https://[YOUR-VERCEL-URL].vercel.app/api/health
```

---

## Environment Variables Summary:

```
REQUIRED (11):
✓ SUPABASE_URL
✓ SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
✓ DATABASE_URL
✓ JWT_SECRET
✓ NODE_ENV
✓ FRONTEND_URL
✓ VITE_API_URL
✓ API_URL
✓ HOST
✓ PORT

OPTIONAL FOR GOOGLE OAUTH (3):
○ GOOGLE_CLIENT_ID
○ GOOGLE_CLIENT_SECRET
○ GOOGLE_CALLBACK_URL
```

---

**Deployment Time:** 15-30 minutes  
**Cost:** $0 (using free tiers)  
**Difficulty:** Easy  

**Questions?** Check troubleshooting section above or Vercel/Supabase documentation.

**Good luck! 🌱**
