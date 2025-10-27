# CarbonSense - Remaining Work TODO List

**Generated:** October 27, 2025  
**Backend:** TypeScript/Express ✅ (No Python backend)  
**Database:** Supabase (PostgreSQL) ✅

---

## 📊 PROJECT STATUS OVERVIEW

### ✅ FULLY WORKING (100%)
1. **Authentication & User Management**
   - Login/Signup with JWT
   - Password hashing (bcrypt)
   - Demo account
   - Session management
   - Protected routes middleware

2. **Emissions Tracking**
   - Add emissions with CO2 calculation
   - Update emissions
   - Delete emissions
   - List emissions with filters
   - Emission history
   - Emission summary/statistics
   - Category & subcategory support
   - Comprehensive emission factors

3. **Dashboard**
   - Total emissions display
   - Monthly tracking
   - Recent emissions list
   - Charts (Recharts)
   - Goals display
   - Real database integration

4. **Goals Management (Partial)**
   - Create goals ✅
   - View goals ✅
   - **MISSING:** Update goal progress endpoint
   - **MISSING:** Delete goals
   - **MISSING:** Edit goals
   - **MISSING:** Goal completion detection

5. **Tips System**
   - Retrieve tips from database
   - Filter by category and role
   - Display tips page

---

## 🚧 INCOMPLETE FEATURES (Need Implementation)

### 1. ANALYTICS PAGE ⚠️ PRIORITY: HIGH
**Status:** Frontend exists, Backend returns dummy static data

**Current Issue:**
```typescript
// routes.ts - Returns hardcoded data, not real user data
app.get("/api/analytics/monthly-comparison", ...); // ❌ Dummy data
app.get("/api/analytics/category-breakdown", ...); // ❌ Dummy data
app.get("/api/analytics/yearly-trends", ...); // ❌ Dummy data
app.get("/api/analytics/peak-analysis", ...); // ❌ Dummy data
app.get("/api/analytics/export", ...); // ❌ Dummy CSV
```

**What Needs to be Done:**
- [ ] Implement `/api/analytics/monthly-comparison` with real user emissions data
- [ ] Implement `/api/analytics/category-breakdown` with actual category calculations
- [ ] Implement `/api/analytics/yearly-trends` with year-over-year comparison
- [ ] Implement `/api/analytics/peak-analysis` using real emission data
- [ ] Implement `/api/analytics/export` to export actual user data as CSV/PDF

**Files to Update:**
- `server/routes.ts` - Add analytics endpoints
- `server/storage.ts` - Add helper methods for analytics queries

---

### 2. ACHIEVEMENTS SYSTEM ⚠️ PRIORITY: HIGH
**Status:** Frontend UI complete, Backend returns static dummy data

**Current Issue:**
- No achievement unlock logic
- Returns same achievements for all users
- No progress tracking
- No database persistence

**What Needs to be Done:**
- [ ] Create achievement unlock logic/conditions
- [ ] Implement `storage.getUserAchievements(userId)` method
- [ ] Implement `storage.unlockAchievement(userId, achievementType)` method
- [ ] Add achievement progress tracking
- [ ] Create background job/trigger to check achievements after emissions logged
- [ ] Implement streak calculation
- [ ] Implement points system
- [ ] Create `/api/achievements/user` endpoint
- [ ] Create `/api/achievements/stats` endpoint

**Achievement Types to Implement:**
- First emission logged
- 7-day streak
- 30-day streak
- 10% emission reduction
- 20% emission reduction
- 50% emission reduction
- Complete first goal
- Complete 5 goals
- 100 entries logged

**Files to Update:**
- `server/routes.ts` - Add achievements endpoints
- `server/storage.ts` - Add achievement methods
- Consider: Create `server/achievements.ts` for business logic

---

### 3. NOTIFICATIONS SYSTEM ⚠️ PRIORITY: MEDIUM
**Status:** Frontend UI complete, Backend returns static data

**Current Issue:**
- No database persistence
- Mark as read doesn't save
- Delete doesn't work
- Settings don't persist
- No notification generation

**What Needs to be Done:**
- [ ] Implement `storage.getUserNotifications(userId)` method
- [ ] Implement `storage.createNotification(userId, type, message)` method
- [ ] Implement `storage.markNotificationRead(notificationId)` method
- [ ] Implement `storage.deleteNotification(notificationId)` method
- [ ] Create `/api/notifications` endpoint
- [ ] Create `/api/notifications/:id/read` endpoint
- [ ] Create `/api/notifications/read-all` endpoint
- [ ] Create `/api/notifications/:id` DELETE endpoint
- [ ] Create `/api/notifications/settings` GET/PUT endpoints
- [ ] Add notification triggers:
  - Goal deadline approaching (3 days before)
  - Goal completed
  - Achievement unlocked
  - Daily/weekly reminders
  - High emission alerts
- [ ] Optional: Add scheduled notifications (node-cron)

**Files to Update:**
- `server/routes.ts` - Add notification endpoints
- `server/storage.ts` - Add notification CRUD methods
- Optional: `server/notifications.ts` - Notification scheduling

---

### 4. REPORTS GENERATION ⚠️ PRIORITY: MEDIUM
**Status:** Endpoint exists but no actual file generation

**Current Issue:**
```typescript
// Returns dummy data, no PDF/CSV generation
app.post("/api/reports/generate", ...) // ❌ No real report
```

**What Needs to be Done:**
- [ ] Install PDF library: `npm install pdfkit @types/pdfkit`
- [ ] Install CSV library (already have data, need formatting)
- [ ] Implement actual PDF generation with user's emission data
- [ ] Implement actual CSV generation with user's emission data
- [ ] Store generated files (Supabase Storage or filesystem)
- [ ] Create `/api/reports/:id/download` endpoint
- [ ] Add report viewing UI
- [ ] Implement `storage.createReport(userId, reportType, filePath)` method
- [ ] Implement `storage.getUserReports(userId)` method

**Report Types:**
- Monthly emission report (PDF/CSV)
- Annual emission report (PDF/CSV)
- Category breakdown report (PDF/CSV)
- Goal progress report (PDF/CSV)
- Custom date range report (PDF/CSV)

**Files to Update:**
- `server/routes.ts` - Fix report generation endpoint
- `server/storage.ts` - Add report storage methods
- Consider: Create `server/reports.ts` for report generation logic
- `client/src/pages/Reports.tsx` - Add download/view functionality

---

### 5. PROFILE MANAGEMENT ⚠️ PRIORITY: LOW
**Status:** Read-only, no update functionality

**Current Issue:**
```typescript
// Profile update doesn't save changes
app.put("/api/profile", ...) // ❌ No actual update
```

**What Needs to be Done:**
- [ ] Implement `storage.updateUser(userId, updates)` method in `storage.ts`
- [ ] Implement `/api/profile` PUT endpoint to save changes
- [ ] Add password change functionality
- [ ] Add email verification (optional)
- [ ] Add profile picture upload (optional, use Supabase Storage)
- [ ] Add validation for profile updates

**Editable Fields:**
- First name
- Last name
- Company name (for company users)
- Company department (for company users)
- Password (with old password verification)
- Email (with verification)

**Files to Update:**
- `server/storage.ts` - Add `updateUser` method
- `server/routes.ts` - Fix `/api/profile` PUT endpoint
- `client/src/pages/Profile.tsx` - Enable form editing

---

### 6. GOAL PROGRESS UPDATES ⚠️ PRIORITY: HIGH
**Status:** Goals can be created but progress isn't tracked

**Current Issue:**
- No automatic goal progress calculation
- No manual progress update endpoint
- No goal completion detection

**What Needs to be Done:**
- [ ] Create `/api/goals/:id/progress` PUT endpoint
- [ ] Implement automatic goal progress calculation based on emissions
- [ ] Add goal completion detection
- [ ] Create notification when goal is completed
- [ ] Create notification when goal deadline is approaching
- [ ] Implement `storage.updateGoalProgress(goalId, currentValue)` method (already exists but not used)
- [ ] Add background job to recalculate goal progress after emissions logged
- [ ] Implement `/api/goals/:id` PUT endpoint (edit goals)
- [ ] Implement `/api/goals/:id` DELETE endpoint

**Files to Update:**
- `server/routes.ts` - Add goal update/delete endpoints
- Consider: Create `server/goals.ts` for goal business logic

---

### 7. COMPARISON PAGE ⚠️ PRIORITY: LOW
**Status:** Frontend UI exists, uses dummy benchmark data

**Current Issue:**
- Industry averages are hardcoded
- No real benchmarking data
- No peer comparison

**What Needs to be Done:**
- [ ] Define industry/regional benchmark data (can be static initially)
- [ ] Create comparison calculations based on user's data
- [ ] Implement `/api/comparison/industry` endpoint
- [ ] Implement `/api/comparison/regional` endpoint
- [ ] Implement `/api/comparison/peers` endpoint (optional)
- [ ] Add comparison insights/recommendations

**Options:**
1. **Static Benchmarks:** Define average values per industry/region
2. **Dynamic Benchmarks:** Calculate from all users in database
3. **External API:** Integrate with external benchmarking service

**Files to Update:**
- `server/routes.ts` - Add comparison endpoints
- `client/src/pages/Comparison.tsx` - Connect to real API

---

### 8. WHAT-IF ANALYSIS ⚠️ PRIORITY: LOW
**Status:** Frontend UI exists, calculations are client-side only

**Current Issue:**
- No backend support
- Calculations done in frontend
- No save/load scenario functionality

**What Needs to be Done:**
- [ ] Create `/api/scenarios` POST endpoint (save scenarios)
- [ ] Create `/api/scenarios` GET endpoint (load saved scenarios)
- [ ] Create `/api/scenarios/:id` DELETE endpoint
- [ ] Implement scenario calculation in backend
- [ ] Add scenario recommendations based on user data
- [ ] Implement `storage.saveScenario()` method
- [ ] Implement `storage.getUserScenarios()` method

**Files to Update:**
- `server/routes.ts` - Add scenario endpoints
- `server/storage.ts` - Add scenario storage methods
- `client/src/pages/WhatIfAnalysis.tsx` - Connect to API for save/load

---

## 🔧 MISSING DATABASE METHODS IN `storage.ts`

Add these methods to `server/storage.ts`:

```typescript
// Profile Management
async updateUser(userId: number, updates: Partial<User>): Promise<User>

// Goals
async updateGoal(goalId: number, userId: number, updates: any): Promise<void>
async deleteGoal(goalId: number, userId: number): Promise<void>

// Achievements
async getUserAchievements(userId: number): Promise<Achievement[]>
async unlockAchievement(userId: number, achievementType: string): Promise<void>
async checkAchievements(userId: number): Promise<Achievement[]>

// Notifications
async getUserNotifications(userId: number): Promise<Notification[]>
async createNotification(userId: number, type: string, message: string): Promise<void>
async markNotificationRead(notificationId: number): Promise<void>
async markAllNotificationsRead(userId: number): Promise<void>
async deleteNotification(notificationId: number): Promise<void>
async getUserNotificationSettings(userId: number): Promise<NotificationSettings>
async updateNotificationSettings(userId: number, settings: NotificationSettings): Promise<void>

// Reports
async createReport(userId: number, reportType: string, filePath: string): Promise<Report>
async getUserReports(userId: number): Promise<Report[]>
async getReport(reportId: number): Promise<Report | undefined>

// Analytics (helper methods)
async getMonthlyComparisonData(userId: number, months: number): Promise<any>
async getCategoryBreakdownData(userId: number, startDate: string, endDate: string): Promise<any>
async getYearlyTrendsData(userId: number): Promise<any>
async getPeakAnalysisData(userId: number, startDate: string, endDate: string): Promise<any>

// Scenarios (What-If Analysis)
async saveScenario(userId: number, scenario: any): Promise<Scenario>
async getUserScenarios(userId: number): Promise<Scenario[]>
async deleteScenario(scenarioId: number, userId: number): Promise<void>
```

---

## 📋 IMPLEMENTATION PRIORITY ORDER

### 🔴 HIGH PRIORITY (Implement First)
1. **Analytics Endpoints** - Most visible missing feature
2. **Achievement System** - Core gamification feature
3. **Goal Progress Updates** - Makes goals functional

### 🟡 MEDIUM PRIORITY (Implement Second)
4. **Notifications System** - Improves user engagement
5. **Reports Generation** - Important for business use

### 🟢 LOW PRIORITY (Nice to Have)
6. **Profile Updates** - Users can view profiles already
7. **Comparison Page** - Extra feature
8. **What-If Analysis Backend** - Frontend works client-side

---

## 🎯 RECOMMENDED IMPLEMENTATION PLAN

### Phase 1: Analytics & Achievements (1-2 weeks)
- Implement all analytics endpoints with real data
- Build achievement system with unlock logic
- Add achievement triggers

### Phase 2: Notifications & Goals (1 week)
- Implement notification CRUD operations
- Add notification triggers
- Complete goal update/delete endpoints
- Add automatic goal progress calculation

### Phase 3: Reports & Profile (1 week)
- Add PDF/CSV generation
- Implement file storage
- Add profile update functionality
- Add password change

### Phase 4: Advanced Features (1 week)
- Comparison page backend
- What-If Analysis save/load
- Polish and testing

---

## 📝 NOTES

### Backend Architecture
- ✅ Using TypeScript/Express (NOT Python)
- ✅ Database: Supabase (PostgreSQL)
- ✅ Authentication: JWT with bcrypt
- ✅ ORM: Drizzle ORM

### Database Tables Status
All 7 tables exist in Supabase:
- ✅ users
- ✅ emissions
- ✅ goals
- ✅ reports
- ✅ tips
- ✅ achievements
- ✅ notifications

### Environment Setup
- ✅ `.env` configured correctly
- ✅ Database connection working
- ✅ All dependencies installed

### What Works Perfectly
- Authentication (Login/Signup)
- Emissions CRUD operations
- Dashboard with real data
- Tips system
- Goal creation and viewing

### What Needs Real Implementation
- Analytics (5 endpoints)
- Achievements (2 endpoints + logic)
- Notifications (5 endpoints + triggers)
- Reports (PDF/CSV generation)
- Profile updates (1 endpoint)
- Goal updates/deletes (2 endpoints)

---

## 🚀 GETTING STARTED

To continue development:

```powershell
# Start the application
npm run dev:full

# Backend runs on: http://localhost:3000
# Frontend runs on: http://localhost:5174
```

### Quick Test Checklist
- ✅ Login works
- ✅ Add emissions works
- ✅ Dashboard shows real data
- ✅ Goals can be created
- ⚠️ Analytics shows dummy data → **FIX THIS**
- ⚠️ Achievements show dummy data → **FIX THIS**
- ⚠️ Notifications show dummy data → **FIX THIS**
- ⚠️ Reports don't generate files → **FIX THIS**
- ⚠️ Profile can't be updated → **FIX THIS**

---

## 📚 ADDITIONAL RECOMMENDATIONS

### Code Quality
- Add input validation with Zod schemas for all endpoints
- Add error logging (Winston or similar)
- Add request rate limiting
- Add API documentation (Swagger/OpenAPI)

### Testing
- Add unit tests for backend endpoints
- Add integration tests for database operations
- Add E2E tests for critical flows

### Security
- Add CSRF protection
- Add request size limits
- Add SQL injection prevention (Drizzle ORM handles this)
- Add XSS prevention
- Rate limiting on authentication endpoints

### Performance
- Add database indexes for frequently queried fields
- Add caching for tips and static data
- Optimize emission calculations
- Add pagination for large data sets

### Documentation
- Add API documentation
- Add deployment guide
- Add developer setup guide
- Add troubleshooting guide

---

**END OF TODO LIST**
