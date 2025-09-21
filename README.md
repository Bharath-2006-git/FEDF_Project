# Carbon Sense

A React-based carbon tracking platform that helps individuals and companies track and reduce their carbon emissions.

## Features

- **Authentication**: Login, signup, and role-based access for individuals, companies, and admins
- **Emission Tracking**: Log emissions from various activities and sources
- **Dashboard**: View total carbon emissions with interactive visualizations
- **Goal Setting**: Set and track emission reduction goals
- **Reports**: Generate and export emission reports
- **Gamification**: Achievements and progress tracking
- **Tips & Recommendations**: Personalized eco-friendly suggestions

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Express.js, Node.js
- **Database**: MySQL with Drizzle ORM
- **Charts**: Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CarbonSense
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and other configurations
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## Project Structure

```
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
├── server/          # Express.js backend
├── shared/          # Shared types and schemas
└── attached_assets/ # Static assets and images
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.