# CarbonSense

A modern carbon footprint tracking platform that empowers individuals and organizations to monitor, analyze, and reduce their environmental impact through comprehensive data visualization and actionable sustainability insights.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
npm run db:push

# Start the full application (backend + frontend)
npm run dev:full
```

Access the application at http://localhost:5173

## Features

- **Comprehensive Tracking**: Monitor emissions from electricity usage, transportation, fuel consumption, and waste generation
- **Interactive Dashboard**: Clean visualization of your carbon footprint with charts and trends
- **Analytics & Insights**: Advanced analytics with category breakdowns, monthly comparisons, and yearly trends
- **Goal Management**: Set personalized reduction targets and track progress
- **Sustainability Tips**: Curated recommendations to help reduce your environmental impact
- **Detailed Reports**: Generate comprehensive emission reports for personal records (CSV/PDF export)
- **Multi-User Support**: Individual and company access levels

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

## Features

### Core Functionality
- User Authentication & Authorization (JWT-based)
- Emission Logging for Individual & Company workflows
- Interactive Dashboard with advanced data visualization
- Goal Management & Progress Tracking
- Sustainability Tips & Recommendations (80+ actionable tips)
- User Profile Management
- Responsive UI with dark/light theme support

### Advanced Features
- **Analytics Dashboard**: Comprehensive analytics with month-over-month comparison, category breakdown, yearly trends, and data export
- **Achievement System**: Gamification with progress tracking, rank progression, achievement badges, and leaderboards
- **Notification Management**: Real-time notifications with customizable settings and filtering
- **Reports & Export**: Generate monthly, quarterly, and annual reports in multiple formats (PDF, CSV, Excel)
- **Comparison Dashboard**: Industry benchmarking with regional comparisons and performance rankings
- **What-If Analysis**: Scenario modeling tool with real-time impact calculations and optimization recommendations

### Technical Highlights
- Full TypeScript implementation with type safety
- 30+ RESTful API endpoints
- Modern React 18 with hooks and context
- Advanced data visualization with Recharts
- Responsive design with Tailwind CSS
- Component library with Radix UI primitives
- Database schema with Drizzle ORM
- JWT authentication with role-based access control

## Development Workflow

1. **Feature Development**: Create feature branches from `main`
2. **Code Quality**: Follow TypeScript best practices and ESLint rules
3. **Testing**: Ensure functionality works across different browsers
4. **Documentation**: Update relevant documentation for new features
5. **Pull Requests**: Submit changes through pull request process

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
JWT_SECRET=your_random_jwt_secret

# Frontend (for production builds)
VITE_API_URL=your_backend_api_url
```

## Production Deployment

### Build for Production

```bash
# Build frontend
npm run build

# Build backend
npm run build:server
```

### Deployment Options

**Vercel** (Recommended for this project):
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Vercel will automatically detect the build settings from `vercel.json`

**Other Cloud Platforms**: 
Compatible with Render, Heroku, Railway, AWS, or any Node.js hosting platform.

**Manual Deployment**: 
1. Build the application using the commands above
2. Configure environment variables on your hosting platform
3. Deploy the `dist` folder (frontend) and server build
4. Ensure both frontend and backend are properly configured

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Follow TypeScript best practices and ESLint rules
4. Test your changes thoroughly
5. Submit a pull request with a clear description

## License

MIT License - see LICENSE file for details

