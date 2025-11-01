# 🚀 CarbonSense - Vercel Deployment Guide

**Status:** ✅ Ready for Deployment  
**Date:** November 2, 2025

---

## 📋 Pre-Deployment Checklist

✅ **Project Status:**
- ✅ All features working
- ✅ Zero TypeScript errors
- ✅ Production build successful
- ✅ Environment variables configured
- ✅ Vercel.json ready

✅ **What's Configured:**
- ✅ Full-stack Vercel configuration (`vercel.json`)
- ✅ Build scripts (`build` + `build:server`)
- ✅ API routes properly configured
- ✅ Frontend SPA routing
- ✅ Serverless function settings

---

## 🎯 Deployment Steps

### **Step 1: Prepare Supabase Database**

1. **Go to Supabase** (https://app.supabase.com)
   - Create a new project or use existing
   - Note down your project credentials

2. **Get Database Credentials:**
   - Navigate to: Project Settings → Database
   - Copy these values:
     - `SUPABASE_URL` (e.g., `https://xxxxx.supabase.co`)
     - `SUPABASE_ANON_KEY` (public key)
     - `SUPABASE_SERVICE_ROLE_KEY` (secret key)
     - `DATABASE_URL` (connection string with pooler)

3. **Run Database Migrations:**
   ```bash
   # In your local project
   npm install -g drizzle-kit
   npx drizzle-kit push:pg
   ```
   This creates all tables (users, emissions, goals, reports, tips)

---

### **Step 2: Generate JWT Secret**

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output - you'll need it in Step 4.

---

### **Step 3: Deploy to Vercel**

#### **Option A: Deploy via Vercel Dashboard (Recommended)**

1. **Go to Vercel** (https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"

2. **Import Your Repository**
   - Select `FEDF_Project` repository
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Vite**
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build && npm run build:server`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

4. **Click "Deploy"**
   - First deployment will start
   - Wait for build to complete (~2-3 minutes)

#### **Option B: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? [Select your account]
# - Link to existing project? N
# - Project name? carbon-sense (or your choice)
# - Directory? ./ (press Enter)
# - Override settings? N

# Deploy to production
vercel --prod
```

---

### **Step 4: Configure Environment Variables**

After deployment, add environment variables in Vercel:

1. **Go to:** Your Project → Settings → Environment Variables

2. **Add these variables:**

```bash
# REQUIRED - Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# REQUIRED - Authentication
JWT_SECRET=your-generated-jwt-secret-here

# REQUIRED - URLs (update with your Vercel domain)
FRONTEND_URL=https://your-project.vercel.app
VITE_API_URL=https://your-project.vercel.app
API_URL=https://your-project.vercel.app

# REQUIRED - Server
NODE_ENV=production
HOST=0.0.0.0
PORT=3000

# OPTIONAL - Google OAuth (if using)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://your-project.vercel.app/api/auth/google/callback
```

3. **Set Environment for:** Production, Preview, and Development

4. **Save Changes**

---

### **Step 5: Redeploy with Environment Variables**

1. **Go to:** Deployments tab
2. **Click** the three dots (⋯) on latest deployment
3. **Select:** "Redeploy"
4. **Check:** "Use existing build cache"
5. **Click:** "Redeploy"

Wait for redeployment to complete (~1-2 minutes)

---

### **Step 6: Verify Deployment**

1. **Visit your Vercel URL:**
   ```
   https://your-project.vercel.app
   ```

2. **Test Health Endpoint:**
   ```
   https://your-project.vercel.app/api/health
   ```
   Should return: `{ "status": "healthy", "message": "CarbonSense API is running" }`

3. **Test the Application:**
   - ✅ Homepage loads
   - ✅ Can create account
   - ✅ Can login
   - ✅ Demo account works (demo@carbonsense.com / demo123)
   - ✅ Can log emissions
   - ✅ Dashboard displays data
   - ✅ Analytics page works

---

## 🔒 Security Configuration

### **Update CORS Settings**

If you encounter CORS errors, update your backend:

```typescript
// In server/index.ts
app.use(cors({
  origin: [
    'https://your-project.vercel.app',
    'http://localhost:5173' // for local development
  ],
  credentials: true
}));
```

### **Configure Supabase Security**

1. **Go to:** Supabase → Authentication → URL Configuration
2. **Add Site URL:** `https://your-project.vercel.app`
3. **Add Redirect URLs:**
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app/dashboard`

---

## 🎨 Custom Domain (Optional)

### **Add Custom Domain:**

1. **Go to:** Project Settings → Domains
2. **Add Domain:** `yourdomain.com`
3. **Follow DNS instructions** provided by Vercel
4. **Update Environment Variables:**
   ```bash
   FRONTEND_URL=https://yourdomain.com
   VITE_API_URL=https://yourdomain.com
   API_URL=https://yourdomain.com
   ```
5. **Redeploy**

---

## 📊 Monitoring & Maintenance

### **Monitor Your Deployment:**

1. **Vercel Dashboard:**
   - View deployment logs
   - Monitor function execution
   - Check analytics

2. **Supabase Dashboard:**
   - Monitor database usage
   - View API requests
   - Check storage

3. **Set Up Alerts:**
   - Vercel: Deployment notifications
   - Supabase: Database usage alerts

---

## 🐛 Troubleshooting

### **Common Issues:**

#### **Issue 1: Build Fails**
```
Error: Cannot find module 'xyz'
```
**Solution:**
- Ensure all dependencies in `package.json`
- Run `npm install` locally to verify
- Check build logs in Vercel

#### **Issue 2: API Routes 404**
```
GET /api/emissions/list - 404
```
**Solution:**
- Verify `vercel.json` routes configuration
- Check `dist/server.js` exists after build
- Review function logs in Vercel dashboard

#### **Issue 3: Database Connection Error**
```
Error: Connection refused to database
```
**Solution:**
- Verify `DATABASE_URL` is correct
- Check Supabase connection pooler is enabled
- Ensure database migrations ran successfully

#### **Issue 4: Environment Variables Not Working**
```
JWT_SECRET is undefined
```
**Solution:**
- Verify variables are set in Vercel dashboard
- Check they're enabled for "Production"
- Redeploy after adding variables

#### **Issue 5: CORS Errors**
```
Access-Control-Allow-Origin error
```
**Solution:**
- Update CORS configuration in server
- Add Vercel domain to allowed origins
- Redeploy backend

---

## 🚀 Post-Deployment Checklist

After successful deployment:

- [ ] ✅ Homepage loads correctly
- [ ] ✅ API health endpoint responds
- [ ] ✅ Can create new account
- [ ] ✅ Can login with credentials
- [ ] ✅ Demo account works
- [ ] ✅ Can log emissions
- [ ] ✅ Dashboard displays charts
- [ ] ✅ Analytics page works
- [ ] ✅ Goals feature functional
- [ ] ✅ Tips page loads
- [ ] ✅ Profile page works
- [ ] ✅ Reports generate correctly
- [ ] ✅ Dark mode toggles
- [ ] ✅ Mobile responsive
- [ ] ✅ No console errors

---

## 📈 Performance Optimization

### **After Initial Deployment:**

1. **Enable Caching:**
   - Add cache headers in Vercel
   - Configure Supabase caching

2. **Optimize Images:**
   - Use Vercel Image Optimization
   - Compress logo/assets

3. **Monitor Bundle Size:**
   - Review Vercel analytics
   - Implement code splitting if needed

4. **Database Optimization:**
   - Add indexes on frequently queried fields
   - Monitor query performance in Supabase

---

## 🔄 Continuous Deployment

### **Automatic Deployments:**

Vercel automatically deploys on:
- ✅ Push to `main` branch → Production
- ✅ Push to other branches → Preview deployments
- ✅ Pull requests → Preview URLs

### **Branch Strategy:**
```bash
main → Production (your-project.vercel.app)
staging → Preview (staging-your-project.vercel.app)
feature/* → Preview (unique URLs)
```

---

## 💰 Cost Estimation

### **Vercel Pricing:**
- **Hobby (Free):**
  - 100 GB bandwidth/month
  - 100 GB-hrs serverless function execution
  - Perfect for getting started ✅

- **Pro ($20/month):**
  - 1 TB bandwidth/month
  - 1000 GB-hrs function execution
  - Better for production traffic

### **Supabase Pricing:**
- **Free Tier:**
  - 500 MB database
  - 2 GB file storage
  - 50,000 monthly active users
  - Perfect for getting started ✅

- **Pro ($25/month):**
  - 8 GB database
  - 100 GB file storage
  - Better for production

**Expected Monthly Cost (Starting):** $0 (Free tiers) ✅

---

## 📞 Support Resources

### **Documentation:**
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Vite: https://vitejs.dev/guide

### **Community:**
- Vercel Discord: https://vercel.com/discord
- Supabase Discord: https://discord.supabase.com

---

## ✅ Quick Start Commands

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy to Production
vercel --prod

# 5. Check logs
vercel logs [deployment-url]

# 6. Open deployment
vercel open
```

---

## 🎉 You're Ready!

Your CarbonSense project is **fully prepared for Vercel deployment**!

### **Next Steps:**
1. ✅ Set up Supabase database
2. ✅ Generate JWT secret
3. ✅ Deploy to Vercel
4. ✅ Configure environment variables
5. ✅ Test all features
6. ✅ Share your live app! 🚀

---

**Questions?** Review the troubleshooting section or check the comprehensive audit report.

**Good luck with your deployment!** 🌱
