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

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS with Shadcn/ui component library
- **Backend**: Express.js with Node.js
- **Database**: MySQL with Drizzle ORM for type-safe queries
- **Visualization**: Recharts for data charts and graphs
- **Authentication**: Session-based user management
- **Routing**: Wouter for client-side navigation

## Quick Start

### System Requirements

- Node.js 18.0 or higher
- npm or yarn package manager
- MySQL 8.0 or compatible database

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

This is a working prototype with the following implemented features:
- Basic emission logging and tracking
- Dashboard with data visualization
- User authentication and session management
- Goal setting and progress tracking
- Tips and recommendations system
- Responsive UI with dark/light theme support

**Note**: Some advanced features shown in the UI (like detailed analytics, comparisons, and reports) are currently placeholders and marked as "Coming Soon".

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

## Contributing

We welcome contributions to improve CarbonSense! Please follow these guidelines:

1. Fork the repository and create a feature branch
2. Implement your changes with appropriate testing
3. Follow the existing code style and conventions
4. Update documentation as needed
5. Submit a pull request with a clear description

## License

This project is licensed under the MIT License. See the LICENSE file for complete terms and conditions.