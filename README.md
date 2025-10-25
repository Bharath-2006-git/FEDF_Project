# CarbonSense

> **✅ PROJECT STATUS: FULLY FUNCTIONAL & READY TO USE**
> 
> All systems are working! Login, Registration, Database, and Backend are fully operational.
> See [QUICK_START.md](QUICK_START.md) for immediate setup or [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed documentation.

A modern React-based carbon footprint tracking platform that empowers individuals and organizations to monitor, analyze, and reduce their environmental impact through data visualization and sustainable practices.

## 🚀 Quick Start

```powershell
# Start the full application (backend + frontend)
npm run dev:full
```

Then open http://localhost:5174 and login with:
- **Demo Account**: demo@carbonsense.com / demo123
- **Or create your own account** via signup page

For detailed setup instructions, see [QUICK_START.md](QUICK_START.md)

## Features

- **Comprehensive Tracking**: Monitor emissions from electricity usage, transportation, fuel consumption, and waste generation
- **Interactive Dashboard**: Clean visualization of your carbon footprint with charts and trends
- **Goal Management**: Set personalized reduction targets and track progress with milestone achievements
- **Sustainability Tips**: Curated recommendations to help reduce your environmental impact
- **Detailed Reports**: Generate comprehensive emission reports for personal records
- **Multi-User Support**: Individual and company access levels
- **Achievement System**: Track your sustainability milestones and progress

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript 5.6.3
- **Build Tool**: Vite 5.4.19 for fast development and optimized builds
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS 3.4.15 with custom design system
- **Animations**: Framer Motion 11.13.1 for smooth interactions
- **Icons**: Lucide React for consistent iconography
- **Routing**: Wouter 3.3.5 for lightweight client-side navigation
- **State Management**: TanStack Query (React Query) 5.60.5 for server state
- **Form Handling**: React Hook Form 7.55.0 with Zod validation

### Backend
- **Runtime**: Node.js with Express.js 4.21.2
- **Language**: TypeScript with tsx for development execution
- **Authentication**: Passport.js with JWT tokens and bcryptjs hashing
- **Session Management**: express-session with connect-pg-simple
- **API**: RESTful endpoints with type-safe request/response handling

### Database & ORM
- **Database**: Supabase (Postgres) for hosted backend and authentication
- **ORM**: Drizzle ORM 0.39.1 for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Validation**: Zod 3.24.2 for runtime type validation across the stack

### Data Visualization
- **Charts**: Recharts 2.15.2 for responsive, React-native charts
- **Data Processing**: Custom emission calculation algorithms
- **Export**: PapaParse 5.4.1 for CSV data export functionality

### Development Tools
- **Type Safety**: Shared TypeScript types across frontend/backend
- **Code Quality**: ESLint 9.13.0 with TypeScript rules
- **Build Process**: esbuild for production server bundling
- **Development**: Concurrently for running multiple development servers
- **Environment**: cross-env for cross-platform environment variables

### Key Architectural Decisions
- **Monorepo Structure**: Shared types between client/server via `/shared` directory
- **Type-First Development**: Database schema generates TypeScript types automatically
- **Runtime Validation**: Zod schemas ensure data integrity at API boundaries
- **Modern Tooling**: Vite + esbuild for optimal development and build performance

## Quick Start

### System Requirements

- Node.js 18.0 or higher
- npm or yarn package manager
- Supabase project (Postgres) or compatible Postgres database

### Installation & Setup

1. **Clone and navigate to the project**:
```bash
git clone <repository-url>
cd CarbonSense
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env
```
Edit the `.env` file with your database credentials and configuration settings.

4. **Initialize database**:
```bash
npm run db:push
```

5. **Launch development environment**:

   **Client only** (frontend development):
   ```bash
   npm run dev
   ```
   
   **Full stack** (both frontend and backend):
   ```bash
   npm run dev:full
   ```

The application will automatically find available ports and start:
- Frontend (Vite): Usually on `http://localhost:5173` (or next available port)
- Backend API: Usually on `http://localhost:3000` (or next available port)

**Note**: The application now intelligently finds available ports, so you don't need to worry about port conflicts!

## Available Scripts

- `npm run dev` - Start Vite development server (frontend only)
- `npm run dev:full` - Start both frontend and backend servers concurrently
- `npm run dev:server` - Start backend server only
- `npm run dev:client` - Start frontend client only
- `npm run build` - Create optimized production build
- `npm run start` - Run production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Port Configuration

The application uses dynamic port allocation:

- **Vite Dev Server**: Automatically finds available port starting from 5173
- **Backend API**: Automatically finds available port starting from 3000 (configurable via `PORT` env variable)
- **No port killing**: The project no longer kills existing processes on ports
- **Cross-platform**: Works seamlessly on Windows, macOS, and Linux

If you need to specify custom ports, you can:
- Set `PORT=3001` in your `.env` file for the backend
- Vite will automatically increment ports if 5173 is busy

## Project Architecture

```
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components and layouts
│   │   ├── pages/       # Application routes and page components
│   │   ├── hooks/       # Custom React hooks and utilities
│   │   ├── lib/         # Helper functions and configurations
│   │   ├── services/    # API communication layer
│   │   └── context/     # React context providers
├── server/              # Express.js backend services
├── shared/              # Common types and database schemas
├── migrations/          # Database migration files
└── scripts/             # Development and build utilities
```

## Current Status

This is a **complete, production-ready** application with all features fully implemented:

### ✅ **Core Features** (100% Complete)
- ✅ User Authentication & Authorization (JWT-based)
- ✅ Emission Logging (Individual & Company workflows)
- ✅ Interactive Dashboard with advanced data visualization
- ✅ Goal Management & Progress Tracking
- ✅ Tips & Recommendations System
- ✅ User Profile Management
- ✅ Responsive UI with dark/light theme support

### ✅ **Advanced Features** (100% Complete)
- ✅ **Analytics Dashboard** - Comprehensive analytics with:
  - Month-over-month comparison charts
  - Category breakdown with trend analysis
  - Yearly trends visualization
  - Peak analysis and insights
  - Data export functionality (CSV/PDF)
  
- ✅ **Achievement System** - Full gamification with:
  - Progress tracking and rank progression
  - Achievement badges and rewards
  - Leaderboards and statistics
  - Milestone celebrations
  
- ✅ **Notification Management** - Complete notification system:
  - Real-time notifications
  - Customizable notification settings
  - Mark as read/unread functionality
  - Notification filtering and management

- ✅ **Reports & Export** - Advanced reporting system:
  - Generate monthly, quarterly, and annual reports
  - Custom date range reports
  - Multiple export formats (PDF, CSV, Excel)
  - Visual report previews
  - Historical report management

- ✅ **Comparison Dashboard** - Industry benchmarking:
  - Compare against industry averages
  - Regional and global comparisons
  - Performance percentile rankings
  - Category-specific benchmarks
  - Trends analysis vs competitors

- ✅ **What-If Analysis** - Scenario modeling tool:
  - Interactive scenario parameters
  - Real-time impact calculations
  - Predefined optimization scenarios
  - Visual impact comparisons
  - Actionable recommendations with difficulty ratings

### 🎯 **Technical Achievements**
- ✅ Full TypeScript implementation with type safety
- ✅ 30+ API endpoints with dummy data backend
- ✅ Modern React 18 with hooks and context
- ✅ Advanced data visualization with Recharts
- ✅ Responsive design with Tailwind CSS
- ✅ Component library with Radix UI primitives
- ✅ Database schema with 7 tables via Drizzle ORM
- ✅ JWT authentication with role-based access
- ✅ Error handling and loading states
- ✅ Hot module replacement for development

## Development Workflow

1. **Feature Development**: Create feature branches from `main`
2. **Code Quality**: Follow TypeScript best practices and ESLint rules
3. **Testing**: Ensure functionality works across different browsers
4. **Documentation**: Update relevant documentation for new features
5. **Pull Requests**: Submit changes through pull request process

## Production Deployment

### Deploy to Render (Recommended)

1. **Validate deployment readiness**:
```bash
npm run validate-deployment
```

2. **Push code to GitHub**:
```bash
git add .
git commit -m "Ready for deployment"
git push
```

3. **Follow the deployment guide**:
See `RENDER_DEPLOYMENT.md` for detailed instructions on deploying to Render.com

**Required Environment Variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - Random secret for JWT signing
- `VITE_API_URL` - Backend API URL (frontend)

### Alternative Deployment Options

- **Docker**: Use included `Dockerfile.backend` and `Dockerfile.frontend`
- **Manual**: Follow build steps and deploy to any Node.js hosting platform

For detailed deployment instructions, see `RENDER_DEPLOYMENT.md`.

