# CarbonSense - Work Left TODO

**Last Updated:** October 27, 2025  
**Project Status:** 🟢 Core Features Working | 🟡 Several Features Need Implementation  
**Tech Stack:** React + TypeScript + Express + Supabase (PostgreSQL)

---

## 🎯 Quick Summary

### What's Working ✅
- ✅ Authentication (Login/Signup with email + Google OAuth)
- ✅ Emissions tracking (add, edit, delete, list, history)
- ✅ Dashboard with real-time data and charts
- ✅ Goals management (create, view)
- ✅ Tips system
- ✅ Database integration with Supabase
- ✅ JWT authentication
- ✅ TypeScript backend (NO Python)

### What Needs Work 🚧
- Analytics endpoints (using dummy data)
- Achievements system (no unlock logic)
- Notifications (no persistence)
- Reports (no PDF/CSV export)
- Profile updates (read-only)
- Goal progress tracking
- Comparison features
- What-If analysis

---

## 🚧 HIGH PRIORITY TASKS

### 1. Analytics Backend Implementation ⚠️ URGENT
**Current Problem:** All analytics endpoints return hardcoded dummy data instead of real user emissions.

**Files:** `server/routes.ts`

**Endpoints to Fix:**
```typescript
GET /api/analytics/monthly-comparison    // Returns fake data
GET /api/analytics/category-breakdown    // Returns fake data  
GET /api/analytics/yearly-trends         // Returns fake data
GET /api/analytics/peak-analysis         // Returns fake data
GET /api/analytics/export                // Returns fake CSV
```

**Tasks:**
- [ ] Implement real monthly comparison from user emissions
- [ ] Calculate actual category breakdown by aggregating emissions
- [ ] Add yearly trends using historical data
- [ ] Implement peak usage analysis
- [ ] Create real CSV/PDF export functionality

**Required Queries:**
- Aggregate emissions by month
- Group by category and calculate totals
- Year-over-year comparison
- Find peak emission periods

---

### 2. Achievements System ⚠️ URGENT
**Current Problem:** No achievement unlock logic, returns same static data for all users.

**Files:** `server/routes.ts`, `server/storage.ts`, `shared/schema.ts`

**Tasks:**
- [ ] Design achievement unlock conditions
- [ ] Create achievements table in database
- [ ] Implement unlock logic based on user activity
- [ ] Track achievement progress
- [ ] Calculate streaks (consecutive days logging)
- [ ] Implement points/badge system
- [ ] Create background jobs to check achievements after each emission log

**Achievement Types:**
- First emission logged
- 7-day streak
- 30-day streak
- Total CO2 reduced milestones
- Category-specific achievements
- Monthly goals met

**Endpoints Needed:**
```typescript
GET  /api/achievements           // Get all achievements
GET  /api/achievements/user      // Get user's unlocked achievements
POST /api/achievements/unlock    // Unlock achievement
GET  /api/achievements/progress  // Get progress toward achievements
```

---

### 3. Notifications System ⚠️
**Current Problem:** Notifications are static, no database persistence, no real-time updates.

**Files:** `server/routes.ts`, `server/storage.ts`

**Tasks:**
- [ ] Create notifications table
- [ ] Implement notification creation on events (goals met, achievements unlocked)
- [ ] Add mark as read/unread functionality
- [ ] Implement delete notification
- [ ] Add notification preferences
- [ ] Consider WebSocket for real-time notifications

**Endpoints to Implement:**
```typescript
GET    /api/notifications           // Get user notifications
POST   /api/notifications           // Create notification
PATCH  /api/notifications/:id/read  // Mark as read
DELETE /api/notifications/:id       // Delete notification
```

---

### 4. Reports Generation 🔧
**Current Problem:** No actual PDF/CSV generation, returns mock data.

**Files:** `server/routes.ts`

**Tasks:**
- [ ] Install PDF generation library (pdfkit or puppeteer)
- [ ] Install CSV generation library (csv-writer)
- [ ] Create report templates
- [ ] Implement date range filtering
- [ ] Add charts/graphs to PDF reports
- [ ] Create downloadable file links

**Endpoints:**
```typescript
POST /api/reports/generate        // Generate report
GET  /api/reports/:id/download    // Download report file
GET  /api/reports/history         // Get report history
```

---

## 🟡 MEDIUM PRIORITY TASKS

### 5. Profile Management
**Current Problem:** Profile is read-only, no update functionality.

**Files:** `server/routes.ts`, `client/src/pages/Profile.tsx`

**Tasks:**
- [ ] Implement PUT `/api/profile` endpoint with validation
- [ ] Add password change functionality
- [ ] Add profile picture upload
- [ ] Implement account deletion
- [ ] Add email change with verification

---

### 6. Goals Enhancement
**Current Problem:** Can create goals but no progress tracking or updates.

**Files:** `server/routes.ts`, `server/storage.ts`

**Tasks:**
- [ ] Add goal progress calculation based on emissions
- [ ] Implement goal update endpoint
- [ ] Add goal deletion
- [ ] Add goal completion notifications
- [ ] Create goal templates
- [ ] Add recurring goals

**Endpoints Needed:**
```typescript
PUT    /api/goals/:id        // Update goal
DELETE /api/goals/:id        // Delete goal
GET    /api/goals/:id/progress  // Get goal progress
```

---

### 7. Advanced Emissions Features
**Tasks:**
- [ ] Add bulk upload (CSV import)
- [ ] Add emission categories management
- [ ] Implement recurring emissions
- [ ] Add emission notes/attachments
- [ ] Create emission templates

---

## 🔵 LOW PRIORITY / FUTURE FEATURES

### 8. Comparison Features
**Current:** Page exists but no backend implementation.

**Tasks:**
- [ ] Implement comparison with average users
- [ ] Add industry benchmarks
- [ ] Create comparison charts
- [ ] Add peer comparison (company accounts)

---

### 9. What-If Analysis
**Current:** Page exists but no backend.

**Tasks:**
- [ ] Create scenario modeling
- [ ] Implement projection algorithms
- [ ] Add recommendation engine
- [ ] Create "what-if" calculators

---

### 10. Data Visualization Improvements
**Tasks:**
- [ ] Add more chart types
- [ ] Implement custom date ranges
- [ ] Add export chart as image
- [ ] Create interactive tooltips
- [ ] Add data filtering options

---

## 🗄️ DATABASE SCHEMA UPDATES NEEDED

### Tables to Create:
```sql
-- Achievements table
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  points INTEGER DEFAULT 0
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  report_type TEXT NOT NULL,
  file_path TEXT,
  generated_at TIMESTAMP DEFAULT NOW()
);
```

### Tables to Update:
- `goals` - Add progress tracking fields
- `users` - Add profile picture, preferences
- `emissions` - Add recurring flag, template_id

---

## 📦 PACKAGES TO INSTALL

```bash
# PDF Generation
npm install pdfkit @types/pdfkit

# CSV Export
npm install csv-writer

# File Upload
npm install multer @types/multer

# Email (for notifications)
npm install nodemailer @types/nodemailer

# Scheduled Jobs (for achievements check)
npm install node-cron @types/node-cron
```

---

## 🐛 KNOWN BUGS / ISSUES

1. ⚠️ **PostCSS Warning:** "PostCSS plugin did not pass the `from` option" - cosmetic, doesn't break functionality
2. ⚠️ **Port Mismatch:** Frontend originally configured for 5174, actually runs on 5173 (FIXED)
3. ⚠️ **TypeScript Errors:** Express User type conflicts (FIXED)
4. ⚠️ **Demo Account:** Credentials shown on login page should be removed for production

---

## ✅ RECENTLY COMPLETED

- ✅ Fixed port configuration (backend: 3000, frontend: 5173)
- ✅ Fixed Vite proxy to target correct backend port
- ✅ Implemented Google OAuth integration
- ✅ Created unified Auth page (login + signup)
- ✅ Fixed TypeScript errors in routes.ts
- ✅ Removed Python backend files
- ✅ Updated all OAuth callback URLs
- ✅ Removed demo account from UI
- ✅ Removed placeholder text (John Doe, etc.)

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Remove demo account credentials
- [ ] Set up environment variables properly
- [ ] Configure production database
- [ ] Set up proper CORS settings
- [ ] Add rate limiting
- [ ] Implement proper error logging
- [ ] Add monitoring (Sentry, LogRocket)
- [ ] Set up CI/CD pipeline
- [ ] Configure SSL certificates
- [ ] Add backup strategy
- [ ] Test all Google OAuth in production domain
- [ ] Update Google Console with production URLs

---

## 📝 NEXT STEPS (Recommended Order)

1. **Week 1:** Implement Analytics with real data
2. **Week 2:** Build Achievements system
3. **Week 3:** Add Notifications with database
4. **Week 4:** Implement Reports (PDF/CSV)
5. **Week 5:** Profile management & Goal enhancements
6. **Week 6:** Testing & Bug fixes
7. **Week 7:** Deployment preparation
8. **Week 8:** Production deployment

---

## 📞 SUPPORT & RESOURCES

- **Backend:** TypeScript + Express
- **Frontend:** React 18.3.1 + TypeScript + Vite
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT + Passport.js (Google OAuth)
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Routing:** Wouter

**Repository:** github.com/Bharath-2006-git/FEDF_Project

---

*Last sync: All changes pushed to GitHub (commit 8aad0b7)*
