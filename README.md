# CarbonSense

A modern React-based carbon footprint tracking platform that empowers individuals and organizations to monitor, analyze, and reduce their environmental impact through data visualization and sustainable practices.

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
```bash
npm run dev
```

Access the application at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create optimized production build
- `npm run start` - Run production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

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

1. **Build the application**:
```bash
npm run build
```

2. **Configure production environment variables**

3. **Deploy to your preferred hosting platform**

