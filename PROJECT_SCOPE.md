# CarbonSense - College Project Scope & Implementation Guide

> **Project Type:** Full-Stack Carbon Footprint Tracking Platform  
> **Tech Stack:** React + TypeScript + Express.js + PostgreSQL (Supabase)  
> **Target:** College Project Demonstration  
> **Last Updated:** October 30, 2025

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Core Features to Implement](#core-features-to-implement)
3. [Features to Avoid](#features-to-avoid)
4. [Technical Implementation Details](#technical-implementation-details)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Pages](#frontend-pages)
8. [Libraries & Dependencies](#libraries--dependencies)
9. [Implementation Priority](#implementation-priority)
10. [Why This Scope?](#why-this-scope)

---

## 🎯 Project Overview

**CarbonSense** is a modern carbon footprint tracking platform that helps individuals and organizations monitor, analyze, and reduce their environmental impact through data visualization and sustainable practices.

### **Project Goals:**
- Demonstrate full-stack development skills
- Implement real-world emission calculations (100+ emission factors)
- Create interactive data visualizations
- Build a production-ready authentication system
- Generate exportable reports (PDF & CSV)
- Maintain clean, maintainable code architecture

### **What Makes This Project Stand Out:**
✅ Scientific emission calculations based on DEFRA, EPA, and IPCC data  
✅ Google OAuth integration alongside traditional authentication  
✅ Real-time interactive charts and analytics  
✅ PDF report generation with professional formatting  
✅ Responsive design with dark mode support  
✅ Type-safe development with TypeScript across the stack  

---

## ✅ Core Features to Implement

### 1. **Authentication System** 🔐

#### **What to Implement:**
- ✅ **Email/Password Authentication**
  - User registration with validation
  - Secure login with JWT tokens
  - Password hashing with bcryptjs
  - Token-based session management
  
- ✅ **Google OAuth 2.0**
  - Google Sign-In integration
  - Passport.js Google Strategy
  - Automatic user creation from Google profile
  - Seamless token exchange
  
- ✅ **User Roles**
  - Individual users (personal emission tracking)
  - Company users (organizational tracking)
  - Role-based emission categories
  
- ✅ **Protected Routes**
  - JWT middleware for API protection
  - Frontend route guards
  - Automatic token refresh handling

#### **Implementation Details:**
```typescript
// Backend: JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Google OAuth Configuration
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  // Handle user creation/login
}));
```

#### **Why This Matters:**
- Demonstrates understanding of authentication flows
- Shows security best practices
- OAuth integration is industry-standard
- Protects user data and API endpoints

---

### 2. **Emission Logging System** 📊 (PRIMARY FEATURE)

#### **What to Implement:**
- ✅ **Add Emissions**
  - Multi-category support (electricity, travel, fuel, waste, production, logistics, water)
  - 100+ emission factors based on scientific data
  - Subcategory selection for accurate calculations
  - Unit conversion handling
  - Date selection and description
  
- ✅ **Edit Emissions**
  - Modify existing emission entries
  - Recalculate CO2 values on update
  - Form validation
  
- ✅ **Delete Emissions**
  - Remove emission entries
  - Confirmation dialogs
  
- ✅ **View Emission History**
  - List all user emissions
  - Filter by date range
  - Filter by category
  - Sort by date/amount
  - Pagination support

#### **Emission Categories & Subcategories:**

**Electricity:**
- Grid average, Coal, Natural gas, Renewable, Nuclear, Hydro

**Travel:**
- Cars (small, medium, large, electric, hybrid)
- Public transport (bus, coach, train, subway, tram)
- Air travel (short/medium/long haul, economy/business/first class)
- Motorcycles, scooters, bikes, e-bikes
- Taxis and rideshare

**Fuel:**
- Liquid fuels (gasoline, diesel, jet fuel, heating oil, LPG)
- Gaseous fuels (natural gas, propane, butane)
- Solid fuels (coal, charcoal, wood, peat)

**Waste:**
- General waste (household, commercial, industrial)
- Specific waste (recyclable, paper, plastic, glass, metal, organic, electronic, hazardous, medical, construction)

**Production:**
- Manufacturing (steel, aluminum, cement, concrete, plastic, paper, glass)
- Food production (beef, lamb, pork, chicken, fish, dairy, vegetables, grains)

**Logistics:**
- Road freight (truck sizes, vans)
- Sea freight (container ships, cargo ships)
- Air freight
- Rail freight

**Water:**
- Water consumption and treatment emissions

#### **Emission Calculation Engine:**
```typescript
// Example: Calculate CO2 emissions
const calculateCO2Emissions = (
  category: string,
  quantity: number,
  unit: string,
  subcategory?: string
): number => {
  // 100+ emission factors based on DEFRA, EPA, IPCC data
  const emissionFactors = {
    electricity: { kWh: 0.5, MWh: 500 },
    travel: { km: 0.15, mile: 0.24 },
    // ... 100+ more factors
  };
  
  const subcategoryFactors = {
    electricity: {
      coal: { kWh: 0.95 },
      renewable: { kWh: 0.01 }
    },
    travel: {
      car_electric: { km: 0.05 },
      plane_business: { km: 0.28 }
    }
    // ... detailed subcategory factors
  };
  
  // Lookup and calculate
  const factor = subcategory 
    ? subcategoryFactors[category]?.[subcategory]?.[unit]
    : emissionFactors[category]?.[unit];
    
  return quantity * (factor || 1.0);
};
```

#### **Why This Matters:**
- Core functionality of the entire application
- Demonstrates data modeling and calculation logic
- Shows understanding of real-world environmental science
- Complex form handling and validation

---

### 3. **Dashboard** 📈 (PRIMARY FEATURE)

#### **What to Implement:**
- ✅ **Summary Statistics**
  - Total emissions (lifetime)
  - Monthly emissions
  - Emissions trend (up/down percentage)
  - Active goals count
  
- ✅ **Category Breakdown (Pie Chart)**
  - Visual representation of emissions by category
  - Percentage calculations
  - Interactive tooltips
  - Color-coded categories
  
- ✅ **Emission Trends Over Time**
  - Line chart showing monthly emissions
  - Last 6-12 months of data
  - Comparison with previous periods
  - Smooth animations
  
- ✅ **Recent Activities**
  - Latest emission entries
  - Quick edit/delete actions
  - Date formatting
  
- ✅ **Quick Actions**
  - "Log New Emission" button
  - "Set New Goal" button
  - "View Tips" shortcut

#### **Charts to Include:**
1. **Pie Chart** - Category breakdown
2. **Line Chart** - Monthly emissions trend
3. **Bar Chart** - Category comparison
4. **Area Chart** - Cumulative emissions

#### **Example Dashboard Data:**
```typescript
interface DashboardData {
  totalEmissions: number;
  monthlyEmissions: number;
  categories: Record<string, number>;
  history: Array<{
    date: string;
    emissions: number;
  }>;
  goals: Array<{
    id: number;
    name: string;
    progress: number;
    target: number;
  }>;
}
```

#### **Why This Matters:**
- Central hub of the application
- Demonstrates data visualization skills
- Shows ability to aggregate and present data
- Tests performance with chart rendering

---

### 4. **Analytics Page** 📊

#### **What to Implement:**
- ✅ **Monthly Comparison**
  - Current month vs previous month
  - Percentage change calculation
  - Visual indicators (up/down arrows)
  - Month-over-month growth chart
  
- ✅ **Category Breakdown with Percentages**
  - Detailed breakdown by category
  - Percentage of total for each category
  - Trend indicators per category
  - Sortable table view
  
- ✅ **Emission Trends (6-12 months)**
  - Historical emission data
  - Line/area charts
  - Moving averages
  - Seasonal pattern identification
  
- ✅ **Peak Analysis**
  - Highest emission day
  - Lowest emission day
  - Average daily emissions
  - Peak hours/days of week (if time-tracked)
  
- ✅ **CSV Export**
  - Export all analytics data
  - Date range selection
  - Formatted CSV with headers
  - Download functionality

#### **Analytics Endpoints:**
```typescript
// Backend API Endpoints
GET /api/analytics/monthly-comparison?period=6months
GET /api/analytics/category-breakdown?period=6months
GET /api/analytics/trends?period=1year
GET /api/analytics/peak-analysis?period=3months
GET /api/analytics/export-csv?startDate=2025-01-01&endDate=2025-10-30
```

#### **Sample Analytics Calculations:**
```typescript
// Monthly Comparison
const monthlyComparison = {
  currentMonth: {
    month: "October 2025",
    emissions: 234.5,
    entries: 45
  },
  previousMonth: {
    month: "September 2025",
    emissions: 267.8,
    entries: 52
  },
  change: -12.4, // percentage
  trend: "down" // improving
};

// Peak Analysis
const peakAnalysis = {
  highestDay: {
    date: "2025-10-15",
    value: 45.6
  },
  lowestDay: {
    date: "2025-10-22",
    value: 2.3
  },
  averageDaily: 12.5
};
```

#### **What NOT to Implement:**
- ❌ Year-over-year statistical analysis
- ❌ Predictive forecasting with ML
- ❌ Complex statistical models
- ❌ Benchmark comparisons with industry data (no data source)

#### **Why This Matters:**
- Shows data aggregation skills
- Demonstrates SQL/database query optimization
- Tests understanding of time-series data
- Proves ability to derive insights from raw data

---

### 5. **Reports Page** 📄

#### **What to Implement:**
- ✅ **Report Generation (On-Demand)**
  - Generate reports in real-time
  - No database storage (calculate on-the-fly)
  - Custom date range selection
  - Report type selection (summary, detailed)
  
- ✅ **Date Range Filtering**
  - Start date picker
  - End date picker
  - Preset ranges (last week, last month, last quarter, last year)
  - Custom range validation
  
- ✅ **Category Breakdown Visualization**
  - Pie charts for category distribution
  - Bar charts for comparisons
  - Data tables with totals
  - Summary statistics
  
- ✅ **CSV Export**
  - Export emission data as CSV
  - Include all fields
  - Proper formatting
  - Filename with timestamp
  
- ✅ **PDF Export** (NEW!)
  - Professional PDF generation
  - Include charts/graphs
  - Company/user header
  - Summary statistics
  - Detailed emission tables
  - Footer with generation date

#### **PDF Report Structure:**
```
┌─────────────────────────────────────────┐
│  CarbonSense Emission Report            │
│  User: John Doe                         │
│  Period: Jan 1, 2025 - Oct 30, 2025    │
├─────────────────────────────────────────┤
│  Summary Statistics                     │
│  • Total Emissions: 1,234.5 kg CO2     │
│  • Total Entries: 156                   │
│  • Average Daily: 6.2 kg CO2           │
│  • Highest Category: Travel (45%)      │
├─────────────────────────────────────────┤
│  Category Breakdown (Pie Chart)         │
│  [Visual Chart Rendered]                │
├─────────────────────────────────────────┤
│  Monthly Trends (Bar Chart)             │
│  [Visual Chart Rendered]                │
├─────────────────────────────────────────┤
│  Detailed Emission Entries (Table)      │
│  Date       Category    Qty  CO2        │
│  2025-10-01 Travel      50km 10.5kg     │
│  ...                                    │
├─────────────────────────────────────────┤
│  Generated: Oct 30, 2025 | Page 1      │
└─────────────────────────────────────────┘
```

#### **PDF Generation Library:**
Use **jsPDF** + **jsPDF-AutoTable**

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const generatePDFReport = (data: ReportData) => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('CarbonSense Emission Report', 20, 20);
  
  // Add summary
  doc.setFontSize(12);
  doc.text(`Total Emissions: ${data.totalEmissions} kg CO2`, 20, 40);
  
  // Add table
  autoTable(doc, {
    head: [['Date', 'Category', 'Quantity', 'CO2 (kg)']],
    body: data.emissions.map(e => [
      e.date,
      e.category,
      `${e.quantity} ${e.unit}`,
      e.co2Emissions
    ])
  });
  
  // Save
  doc.save('emission-report.pdf');
};
```

#### **What NOT to Implement:**
- ❌ Report history storage in database
- ❌ Saved report management (view/delete old reports)
- ❌ Scheduled/automated report generation
- ❌ Email delivery of reports
- ❌ Report templates with customization
- ❌ Excel export (CSV is sufficient)

#### **Why This Matters:**
- Demonstrates file generation capabilities
- Shows understanding of data export formats
- PDF generation is a valuable real-world skill
- Tests ability to format data for printing

---

### 6. **Profile Page** 👤

#### **What to Implement:**
- ✅ **Read-Only Profile Display**
  - User's full name
  - Email address
  - Account role (individual/company)
  - Account creation date
  - Total emissions to date
  - Total entries count
  - Last login timestamp
  
- ✅ **Profile Statistics**
  - Total emissions lifetime
  - Average monthly emissions
  - Most active category
  - Streak days (consecutive logging)
  - Goals completed count

#### **Profile Data Structure:**
```typescript
interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'individual' | 'company';
  createdAt: string;
  lastLogin: string;
  statistics: {
    totalEmissions: number;
    totalEntries: number;
    averageMonthly: number;
    mostActiveCategory: string;
    goalsCompleted: number;
  };
}
```

#### **What NOT to Implement:**
- ❌ Profile editing (name, email changes)
- ❌ Password change functionality
- ❌ Profile picture upload
- ❌ Email verification/change
- ❌ Account deletion
- ❌ Two-factor authentication
- ❌ Privacy settings
- ❌ Notification preferences

#### **Why Keep It Simple:**
- Profile editing requires validation logic
- File uploads need storage service (AWS S3, Cloudinary)
- Password changes need email verification
- These features add complexity without demonstrating core skills
- Read-only profile is sufficient for college project

---

### 7. **Goals System** 🎯

#### **What to Implement:**
- ✅ **Create Goals**
  - Goal name/title
  - Goal type (reduce emissions, specific category target)
  - Target value (kg CO2)
  - Target date/deadline
  - Category (optional - for category-specific goals)
  
- ✅ **View Goals List**
  - All active goals
  - Goal details display
  - Creation date
  - Target date
  
- ✅ **Basic Progress Display**
  - Manual progress calculation
  - Current emissions vs target
  - Percentage completion
  - Simple progress bar
  - Status indicator (on track, behind, completed)

#### **Goal Data Structure:**
```typescript
interface Goal {
  id: number;
  userId: number;
  goalName: string;
  goalType: 'total_reduction' | 'category_target' | 'monthly_limit';
  targetValue: number; // kg CO2
  currentValue?: number; // calculated
  targetDate: string;
  status: 'active' | 'completed' | 'expired';
  category?: string;
  createdAt: string;
  completedAt?: string;
}
```

#### **Simple Progress Calculation:**
```typescript
// Calculate goal progress manually
const calculateGoalProgress = (goal: Goal, emissions: Emission[]) => {
  // Filter emissions in goal period
  const goalEmissions = emissions.filter(e => 
    new Date(e.date) >= new Date(goal.createdAt) &&
    new Date(e.date) <= new Date(goal.targetDate)
  );
  
  // Sum emissions
  const totalEmissions = goalEmissions.reduce(
    (sum, e) => sum + e.co2Emissions, 
    0
  );
  
  // Calculate progress
  const progress = (totalEmissions / goal.targetValue) * 100;
  
  return {
    currentValue: totalEmissions,
    progress: Math.min(progress, 100),
    status: progress >= 100 ? 'completed' : 'active'
  };
};
```

#### **What NOT to Implement:**
- ❌ Automatic progress tracking with background jobs
- ❌ Goal editing/deletion endpoints
- ❌ Recurring goals
- ❌ Goal completion notifications
- ❌ Goal templates
- ❌ Milestone celebrations
- ❌ Goal sharing with others
- ❌ Collaborative goals

#### **Why Keep It Basic:**
- Automatic tracking needs cron jobs/schedulers
- Goal editing adds CRUD complexity
- Notifications require separate system
- Basic create + view + manual progress is sufficient to demonstrate the feature

---

### 8. **Tips Page** 💡

#### **What to Implement:**
- ✅ **Display Sustainability Tips**
  - List of eco-friendly tips
  - Categorized tips
  - Impact level indicators (low, medium, high)
  - Relevance to user role
  
- ✅ **Filter by Category**
  - Energy saving tips
  - Transport tips
  - Waste reduction tips
  - Industrial practices (for companies)
  - All categories view
  
- ✅ **Impact Level Badges**
  - Visual impact indicators
  - Color-coded badges
  - Impact descriptions
  
- ✅ **Tips Management (Backend)**
  - Fetch tips from database
  - Filter by category and role
  - Active/inactive status

#### **Tip Categories:**
- 🔋 **Energy**: Electricity saving, renewable energy, heating/cooling
- 🚗 **Transport**: Public transport, electric vehicles, carpooling
- 🗑️ **Waste**: Recycling, composting, reducing waste
- 🏭 **Industrial**: Manufacturing efficiency, sustainable materials
- 🌍 **General**: Lifestyle changes, sustainable practices

#### **Tip Data Structure:**
```typescript
interface Tip {
  id: number;
  title: string;
  content: string;
  category: 'energy' | 'transport' | 'waste' | 'industrial' | 'general';
  targetRole: 'individual' | 'company' | 'all';
  impactLevel: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt: string;
}
```

#### **Example Tips:**
```typescript
const tips = [
  {
    title: "Switch to LED Bulbs",
    content: "LED bulbs use 75% less energy than traditional bulbs and last 25 times longer.",
    category: "energy",
    impactLevel: "medium"
  },
  {
    title: "Use Public Transportation",
    content: "Taking public transport instead of driving alone can reduce your carbon footprint by up to 4,800 pounds per year.",
    category: "transport",
    impactLevel: "high"
  }
];
```

#### **Why This Matters:**
- Educational component of the platform
- Easy to implement
- Adds value without complexity
- Demonstrates CRUD operations

---

## 🚫 Features to Avoid

### 1. **Achievements System** ❌

#### **Why Avoid:**
- **Complex unlock logic**: Requires checking conditions after each action
- **Streak tracking**: Needs cron jobs to track consecutive days
- **Background jobs**: Requires task scheduler setup (node-cron, Bull queue)
- **Badge/points database**: Additional tables and relationships
- **Not core functionality**: Gamification is nice-to-have, not essential

#### **What It Would Require:**
```typescript
// Achievement unlock logic (COMPLEX)
const checkAchievements = async (userId: number) => {
  // Check after every emission logged
  const emissions = await getEmissions(userId);
  const goals = await getGoals(userId);
  
  // Check 50+ different conditions
  if (emissions.length === 1) unlockAchievement('first_entry');
  if (checkStreak(userId) === 7) unlockAchievement('week_streak');
  if (totalEmissions < 1000) unlockAchievement('eco_warrior');
  // ... 50+ more checks
};

// Cron job for streak tracking (COMPLEX)
cron.schedule('0 0 * * *', async () => {
  // Check all users daily
  const users = await getAllUsers();
  for (const user of users) {
    updateStreak(user.id);
    checkStreakAchievements(user.id);
  }
});
```

#### **Complexity Added:**
- New database table: `achievements`, `user_achievements`
- Background job scheduler
- Achievement unlock conditions (50+ rules)
- Streak calculation logic
- Points/ranking system
- Badge design and icons

#### **Impact:** 3-4 days of additional development, not core to emission tracking

---

### 2. **Notifications System** ❌

#### **Why Avoid:**
- **Separate notification table**: Additional database complexity
- **Real-time updates**: Requires WebSocket or Server-Sent Events
- **Email notifications**: Needs external service (SendGrid, AWS SES)
- **Push notifications**: Requires service workers, browser permissions
- **Reminder scheduling**: Needs cron jobs
- **Not essential**: Users can check dashboard without notifications

#### **What It Would Require:**
```typescript
// Real-time notifications (COMPLEX)
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('subscribe', (userId) => {
    socket.join(`user_${userId}`);
  });
});

// Send notification
const sendNotification = (userId, message) => {
  io.to(`user_${userId}`).emit('notification', message);
  saveToDatabase(userId, message);
  sendEmail(userId, message);
  sendPushNotification(userId, message);
};

// Email service integration (COMPLEX)
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (userId, message) => {
  const user = await getUser(userId);
  await sgMail.send({
    to: user.email,
    from: 'noreply@carbonsense.com',
    subject: 'CarbonSense Notification',
    text: message
  });
};

// Scheduled reminders (COMPLEX)
cron.schedule('0 9 * * *', async () => {
  const users = await getUsersWithDailyReminders();
  for (const user of users) {
    sendNotification(user.id, 'Don\'t forget to log your emissions today!');
  }
});
```

#### **Complexity Added:**
- Database table: `notifications`
- WebSocket server setup
- Email service account and configuration
- Service worker for push notifications
- Notification preferences management
- Cron jobs for scheduled reminders

#### **Impact:** 5-7 days of additional development, requires third-party services

---

### 3. **Comparison Dashboard** ❌

#### **Why Avoid:**
- **No data source**: Industry benchmarks, regional averages don't exist for free
- **Would need mock data**: Unprofessional to use fake comparison data
- **Complex calculations**: Statistical comparisons, percentile rankings
- **API integration**: Would need paid services for real benchmark data
- **Not feasible**: Cannot demonstrate with real data

#### **What It Would Require:**
```typescript
// Benchmark comparison (NOT FEASIBLE)
const getComparison = async (userId: number) => {
  // Where does this data come from?
  const industryAverage = 350; // ???
  const regionalAverage = 320; // ???
  const bestInClass = 180; // ???
  
  const userEmissions = await getUserEmissions(userId);
  
  // Complex percentile calculations
  return {
    userValue: userEmissions.total,
    industryAverage: industryAverage, // FAKE DATA
    ranking: calculatePercentile(userEmissions, allUsers),
    comparison: userEmissions < industryAverage ? 'better' : 'worse'
  };
};

// Would need external API (EXPENSIVE)
const getBenchmarkData = async (industry: string, region: string) => {
  // Paid API call
  const response = await fetch(
    `https://api.carbonbenchmarks.com/data?industry=${industry}&region=${region}`,
    { headers: { 'Authorization': `Bearer ${API_KEY}` } }
  );
  return response.json();
};
```

#### **Why It's Impossible:**
- **No free benchmark data sources**
- Using fake data is unprofessional for a demo
- Paid APIs are expensive ($100+/month)
- Would require extensive user base for meaningful comparisons
- Complex statistical analysis

#### **Impact:** Cannot be implemented realistically without real data

---

### 4. **What-If Analysis** ❌

#### **Why Avoid:**
- **Complex projection logic**: Forecasting algorithms are advanced
- **Scenario simulation**: Requires multiple calculation engines
- **Not core functionality**: Advanced feature, not essential
- **Time-consuming**: Would take 3-4 days to implement properly

#### **What It Would Require:**
```typescript
// What-if scenario simulation (COMPLEX)
const simulateScenario = (currentData: EmissionData, changes: Scenario[]) => {
  // Complex projection logic
  const projectedEmissions = currentData.emissions;
  
  changes.forEach(change => {
    switch (change.type) {
      case 'reduce_travel':
        // Calculate impact of reducing travel by X%
        projectedEmissions.travel *= (1 - change.percentage);
        break;
      case 'switch_to_renewable':
        // Calculate impact of switching energy sources
        projectedEmissions.electricity *= 0.1; // Simplified
        break;
      case 'improve_efficiency':
        // Complex efficiency calculations
        break;
    }
  });
  
  // Forecast future emissions with changes
  return forecastEmissions(projectedEmissions, 12); // 12 months
};

// Time-series forecasting (VERY COMPLEX)
const forecastEmissions = (data: number[], periods: number) => {
  // Would need ML library or complex algorithm
  // Simple moving average? Exponential smoothing? ARIMA?
  // This is advanced data science
};
```

#### **Complexity Added:**
- Projection algorithms
- Multiple scenario types
- User interface for scenario creation
- Visualization of projections
- Comparison of multiple scenarios

#### **Impact:** 3-4 days of development for a non-essential feature

---

### 5. **Profile Editing Features** ❌

#### **Why Avoid:**
- **File uploads**: Requires storage service (AWS S3, Cloudinary, etc.)
- **Email changes**: Requires email verification flow
- **Password changes**: Needs password reset emails
- **Adds complexity**: Multiple validation rules, security concerns
- **Not essential**: Read-only profile is sufficient

#### **What It Would Require:**
```typescript
// Profile picture upload (COMPLEX)
const uploadProfilePicture = async (file: File, userId: number) => {
  // Need cloud storage service
  const s3 = new AWS.S3();
  
  const params = {
    Bucket: 'carbonsense-profiles',
    Key: `${userId}/profile.jpg`,
    Body: file,
    ACL: 'public-read'
  };
  
  const result = await s3.upload(params).promise();
  
  // Update user record
  await updateUser(userId, { profilePicture: result.Location });
};

// Email change with verification (COMPLEX)
const changeEmail = async (userId: number, newEmail: string) => {
  // Generate verification token
  const token = generateToken();
  
  // Store pending email change
  await storePendingEmailChange(userId, newEmail, token);
  
  // Send verification email
  await sendVerificationEmail(newEmail, token);
  
  // Wait for user to click verification link
  // Then update email
};

// Password change (COMPLEX)
const changePassword = async (userId: number, oldPassword: string, newPassword: string) => {
  // Verify old password
  const user = await getUser(userId);
  const valid = await bcrypt.compare(oldPassword, user.password);
  
  if (!valid) throw new Error('Invalid password');
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update database
  await updateUser(userId, { password: hashedPassword });
  
  // Send confirmation email
  await sendPasswordChangeEmail(user.email);
  
  // Invalidate all sessions
  await invalidateAllSessions(userId);
};
```

#### **Complexity Added:**
- File upload handling and validation
- Cloud storage configuration
- Image resizing/optimization
- Email verification system
- Password validation rules
- Session invalidation logic

#### **Impact:** 2-3 days of development, requires third-party services

---

### 6. **Advanced Goal Features** ❌

#### **Why Avoid:**
- **Automatic progress tracking**: Needs background calculations
- **Goal editing**: Additional CRUD endpoints
- **Recurring goals**: Complex scheduling logic
- **Notifications**: Depends on notification system
- **Not necessary**: Basic goals are sufficient

#### **What to Skip:**
- ❌ Goal editing/deletion
- ❌ Automatic progress updates (use manual calculation)
- ❌ Recurring goals (weekly, monthly targets)
- ❌ Goal templates
- ❌ Milestone celebrations
- ❌ Goal reminders

#### **Impact:** Basic goals are sufficient for demonstration

---

### 7. **Report History Storage** ❌

#### **Why Avoid:**
- **Database storage**: Additional table and file management
- **File storage service**: Needs cloud storage for PDFs
- **Report management**: View, delete, re-download old reports
- **Not necessary**: Generate reports on-demand instead

#### **What It Would Require:**
```typescript
// Report storage (ADDS COMPLEXITY)
const generateAndStoreReport = async (userId: number, params: ReportParams) => {
  // Generate PDF
  const pdfBuffer = await generatePDF(params);
  
  // Upload to cloud storage
  const s3 = new AWS.S3();
  const key = `reports/${userId}/${Date.now()}.pdf`;
  await s3.upload({
    Bucket: 'carbonsense-reports',
    Key: key,
    Body: pdfBuffer
  }).promise();
  
  // Store in database
  await db.insert(reports).values({
    userId,
    filePath: key,
    reportType: params.type,
    startDate: params.startDate,
    endDate: params.endDate,
    createdAt: new Date()
  });
};

// Report management
app.get('/api/reports/history', async (req, res) => {
  const reports = await getUserReports(req.user.userId);
  res.json(reports);
});

app.get('/api/reports/:id/download', async (req, res) => {
  const report = await getReport(req.params.id);
  const file = await s3.getObject({
    Bucket: 'carbonsense-reports',
    Key: report.filePath
  }).promise();
  res.send(file.Body);
});
```

#### **Complexity Added:**
- Reports database table
- Cloud storage for PDF files
- Report management UI
- Download/delete functionality
- Storage costs

#### **Alternative:** Generate reports on-the-fly, download immediately, no storage

---

### 8. **Advanced Analytics** ❌

#### **Features to Skip:**
- ❌ Predictive forecasting (ML-based)
- ❌ Multi-year statistical analysis
- ❌ Complex trend detection
- ❌ Anomaly detection
- ❌ Excel export (CSV is enough)

#### **Why Keep It Simple:**
These features require:
- Machine learning libraries
- Complex statistical calculations
- Large datasets for accuracy
- Data science expertise
- Not essential for core functionality

---

### 9. **Multi-User Company Features** ❌

#### **Why Avoid:**
- **User management**: Admin dashboard, invite users
- **Departments**: Department structure and analytics
- **Permissions**: Role-based access control
- **Team features**: Shared goals, collaboration
- **Enterprise complexity**: Beyond college project scope

#### **What to Skip:**
- ❌ Admin dashboard for companies
- ❌ Department management
- ❌ Multi-user accounts
- ❌ Team collaboration
- ❌ Department-wise breakdowns

#### **Keep Simple:** Individual vs Company role just affects available emission categories

---

### 10. **Advanced Backend Features** ❌

#### **Why Avoid:**
- **Background jobs**: Requires job queue (Bull, Agenda)
- **Caching**: Redis setup and management
- **Rate limiting**: Additional middleware
- **Email service**: External service integration
- **WebSockets**: Real-time infrastructure
- **Adds complexity**: Without significant benefit for demo

#### **What to Skip:**
- ❌ Cron jobs / scheduled tasks
- ❌ Redis caching
- ❌ Rate limiting middleware
- ❌ Email service (SendGrid, AWS SES)
- ❌ WebSocket real-time features
- ❌ Advanced logging/monitoring
- ❌ API versioning

---

## 🛠️ Technical Implementation Details

### **Tech Stack Summary:**

#### **Frontend:**
- React 18.3.1
- TypeScript 5.6.3
- Vite 5.4.19 (build tool)
- Tailwind CSS 3.4.15
- Radix UI (component library)
- Recharts 2.15.2 (charts)
- TanStack Query (data fetching)
- Wouter (routing)
- React Hook Form (forms)
- Zod (validation)

#### **Backend:**
- Node.js with Express.js 4.21.2
- TypeScript
- Drizzle ORM 0.39.1
- PostgreSQL (Supabase)
- Passport.js (authentication)
- JWT tokens
- bcryptjs (password hashing)

#### **Development Tools:**
- tsx (TypeScript execution)
- Concurrently (run multiple processes)
- ESLint (code quality)
- Drizzle Kit (database migrations)

---

## 💾 Database Schema

### **Users Table:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('individual', 'company')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

### **Emissions Table:**
```sql
CREATE TABLE emissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  co2_emissions DECIMAL(10, 3) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Goals Table:**
```sql
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  goal_name VARCHAR(255) NOT NULL,
  goal_type VARCHAR(50) NOT NULL,
  target_value DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2),
  target_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
```

### **Tips Table:**
```sql
CREATE TABLE tips (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  target_role VARCHAR(20) NOT NULL,
  impact_level VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpoints

### **Authentication:**
```
POST   /api/auth/register         - Register new user
POST   /api/auth/login            - Login with email/password
GET    /api/auth/google           - Initiate Google OAuth
GET    /api/auth/google/callback  - Google OAuth callback
POST   /api/auth/logout           - Logout
GET    /api/auth/me               - Get current user
```

### **Emissions:**
```
POST   /api/emissions/add         - Add new emission
GET    /api/emissions/list        - Get user emissions (with filters)
GET    /api/emissions/history     - Get monthly emission history
GET    /api/emissions/summary     - Get emission statistics
GET    /api/emissions/calculate   - Calculate CO2 for inputs
GET    /api/emissions/categories  - Get available categories/subcategories
PUT    /api/emissions/:id         - Update emission
DELETE /api/emissions/:id         - Delete emission
```

### **Dashboard:**
```
GET    /api/dashboard             - Get dashboard data
```

### **Analytics:**
```
GET    /api/analytics/monthly-comparison  - Monthly comparison
GET    /api/analytics/category-breakdown  - Category breakdown
GET    /api/analytics/trends              - Emission trends
GET    /api/analytics/peak-analysis       - Peak analysis
GET    /api/analytics/export-csv          - Export to CSV
```

### **Goals:**
```
POST   /api/goals                 - Create new goal
GET    /api/goals                 - Get user goals
GET    /api/goals/:id             - Get specific goal
```

### **Tips:**
```
GET    /api/tips                  - Get tips (with filters)
```

### **Profile:**
```
GET    /api/profile               - Get user profile
```

---

## 📱 Frontend Pages

### **Public Pages:**
1. **Landing Page** (`/`) - Homepage with features
2. **Login Page** (`/login`) - Authentication
3. **Signup Page** (`/signup`) - Registration

### **Protected Pages:**
4. **Dashboard** (`/dashboard`) - Main overview
5. **Log Emissions** (`/log-emissions`) - Add/edit emissions
6. **Analytics** (`/analytics`) - Advanced analytics
7. **Reports** (`/reports`) - Generate reports
8. **Profile** (`/profile`) - User profile
9. **Goals** (`/goals`) - Manage goals
10. **Tips** (`/tips`) - Sustainability tips

### **Pages to Remove:**
- ❌ Achievements (`/achievements`) → Coming Soon
- ❌ Notifications (`/notifications`) → Coming Soon
- ❌ Comparison (`/comparison`) → Coming Soon
- ❌ What-If Analysis (`/what-if`) → Coming Soon

---

## 📦 Libraries & Dependencies

### **To Keep (Already Installed):**
```json
{
  "react": "^18.3.1",
  "typescript": "^5.6.3",
  "express": "^4.21.2",
  "drizzle-orm": "^0.39.1",
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "recharts": "^2.15.2",
  "zod": "^3.24.2",
  "react-hook-form": "^7.55.0",
  "@tanstack/react-query": "^5.60.5"
}
```

### **To Add (For PDF Generation):**
```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

### **Library Usage:**
- **React**: Frontend framework
- **Express.js**: Backend API server
- **Drizzle ORM**: Database queries
- **Passport.js**: Google OAuth
- **JWT**: Token authentication
- **Recharts**: Data visualization
- **jsPDF**: PDF generation
- **Zod**: Data validation
- **React Hook Form**: Form handling
- **TanStack Query**: Data fetching and caching

---

## 📊 Implementation Priority

### **Phase 1: Core Setup** (Week 1)
1. ✅ Authentication (email/password + Google OAuth)
2. ✅ Database setup and migrations
3. ✅ Basic routing and layout
4. ✅ Protected route middleware

### **Phase 2: Emission System** (Week 2)
1. ✅ Emission logging (add/edit/delete)
2. ✅ Emission calculation engine
3. ✅ Category/subcategory system
4. ✅ Emission history API

### **Phase 3: Dashboard & Visualization** (Week 3)
1. ✅ Dashboard layout
2. ✅ Charts integration (Recharts)
3. ✅ Statistics calculations
4. ✅ Real-time data updates

### **Phase 4: Analytics & Reports** (Week 4)
1. ✅ Analytics page with comparisons
2. ✅ Report generation UI
3. ✅ CSV export functionality
4. ✅ PDF generation (jsPDF)

### **Phase 5: Goals & Tips** (Week 5)
1. ✅ Goals creation and viewing
2. ✅ Basic progress calculation
3. ✅ Tips page with filtering
4. ✅ Profile page (read-only)

### **Phase 6: Polish & Testing** (Week 6)
1. ✅ UI/UX improvements
2. ✅ Error handling
3. ✅ Loading states
4. ✅ Responsive design
5. ✅ Dark mode refinement
6. ✅ Testing all features

---

## 🎯 Why This Scope?

### **What This Project Demonstrates:**

#### **1. Full-Stack Development**
- Frontend (React) + Backend (Express) + Database (PostgreSQL)
- RESTful API design
- State management
- Type-safe development with TypeScript

#### **2. Authentication & Security**
- OAuth 2.0 implementation (Google)
- JWT token management
- Password hashing
- Protected routes and middleware

#### **3. Complex Business Logic**
- Emission calculation engine (100+ factors)
- Data aggregation and statistics
- Time-series data handling
- Scientific accuracy in calculations

#### **4. Data Visualization**
- Multiple chart types (pie, line, bar, area)
- Interactive dashboards
- Real-time data updates
- Responsive charts

#### **5. File Generation**
- PDF creation with charts
- CSV export functionality
- Data formatting for export
- Professional report layouts

#### **6. Database Design**
- Normalized schema
- Relationships and foreign keys
- Efficient queries
- Data integrity

#### **7. Modern Development Practices**
- TypeScript for type safety
- Component-based architecture
- Reusable UI components
- Clean code organization

#### **8. UI/UX Design**
- Responsive design
- Dark mode support
- Accessibility considerations
- Professional UI components

### **What Makes This Scope Realistic:**

✅ **Achievable in 4-6 weeks**  
✅ **No complex infrastructure** (no cron jobs, WebSockets, etc.)  
✅ **No expensive third-party services** (except optional email)  
✅ **Core features are fully functional**  
✅ **Demonstrates wide range of skills**  
✅ **Professional presentation**  
✅ **Well-scoped for college project**  

### **What This Scope Avoids:**

❌ Feature bloat and scope creep  
❌ Complex infrastructure requirements  
❌ Expensive third-party service dependencies  
❌ Features requiring extensive datasets  
❌ Advanced algorithms beyond project scope  
❌ Features that add little demonstration value  

---

## 📝 Summary

### **Core Features (Must Implement):**
1. ✅ Authentication (Email + Google OAuth)
2. ✅ Emission Logging (Add/Edit/Delete with 100+ factors)
3. ✅ Dashboard (Charts, statistics, visualization)
4. ✅ Analytics (Monthly comparison, trends, peak analysis)
5. ✅ Reports (PDF + CSV generation)
6. ✅ Profile (Read-only display)
7. ✅ Goals (Basic create and view)
8. ✅ Tips (Sustainability recommendations)

### **Features to Avoid:**
1. ❌ Achievements & Gamification
2. ❌ Notifications System
3. ❌ Comparison Dashboard (no data source)
4. ❌ What-If Analysis
5. ❌ Profile Editing Features
6. ❌ Advanced Goal Features
7. ❌ Report History Storage
8. ❌ Complex Analytics (ML, forecasting)
9. ❌ Multi-User Company Features
10. ❌ Advanced Backend Infrastructure

### **Development Timeline:**
- **Week 1-2**: Auth + Emission System
- **Week 3**: Dashboard + Visualization
- **Week 4**: Analytics + Reports
- **Week 5**: Goals + Tips + Profile
- **Week 6**: Polish + Testing

### **Final Result:**
A **professional, fully-functional carbon tracking platform** that demonstrates:
- Full-stack development skills
- Real-world business logic
- Data visualization expertise
- Modern development practices
- Clean, maintainable codebase

**Perfect scope for a college project! 🎓🚀**

---

## 🔗 Related Documentation

- [README.md](./README.md) - Project overview and setup
- [QUICK_START.md](./QUICK_START.md) - Getting started guide
- [WorkLeft.md](./WorkLeft.md) - Current development status
- [EMISSION_SYSTEM_GUIDE.md](./EMISSION_SYSTEM_GUIDE.md) - Emission calculations

---

**Last Updated:** October 30, 2025  
**Version:** 1.0  
**Status:** Ready for Implementation 🎯
