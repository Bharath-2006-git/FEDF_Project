# CarbonSense - Carbon Emissions Tracking Platform 🌱

A comprehensive carbon tracking platform that helps individuals and industries track and reduce their carbon emissions.

## 🎯 Project Overview

CarbonSense enables users to:
- Track carbon emissions from various activities (travel, electricity, fuel, waste, etc.)
- Set and monitor emission reduction goals
- Visualize emissions data through interactive dashboards
- Receive personalized eco-friendly tips
- Generate detailed emission reports
- Perform what-if analysis for reduction scenarios

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Charts**: Recharts

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn (ASGI)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **Validation**: Pydantic v2

### Database
- **Platform**: Supabase (PostgreSQL)
- **Client**: Direct Supabase Python client

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher
- Supabase account

### Automated Setup

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### 1. Backend Setup (Python)

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the server
python main.py
```

Backend will run at: http://localhost:5000
API Docs: http://localhost:5000/api/docs

#### 2. Frontend Setup (React)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run at: http://localhost:5173

### 🐳 Docker Setup (Alternative)

```bash
# Start everything with Docker
docker-compose up

# Or in detached mode
docker-compose up -d
```

## 📚 Documentation

- **Migration Guide**: [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)
- **Backend Documentation**: [backend/README.md](./backend/README.md)
- **Database Setup**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Quick Start Guide**: [QUICK_START.md](./QUICK_START.md)

## 🔧 Development

### Running Backend
```bash
cd backend
python main.py
```

### Running Frontend
```bash
npm run dev
```

### Running Both Concurrently
```bash
npm run dev:full
```

### Docker Commands
```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# Rebuild and start
npm run docker:build
```

## 📡 API Endpoints

All API endpoints are documented interactively at: http://localhost:5000/api/docs

Key endpoints:
- **Auth**: `/api/auth/login`, `/api/auth/signup`
- **Emissions**: `/api/emissions/*`
- **Goals**: `/api/goals`
- **Dashboard**: `/api/dashboard`
- **Tips**: `/api/tips`
- **Reports**: `/api/reports/generate`
- **What-If**: `/api/whatif`

## 🧪 Testing

### Demo Account
- Email: `demo@carbonsense.com`
- Password: `demo123`

### Test Backend
```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@carbonsense.com","password":"demo123"}'
```

## 📁 Project Structure

```
CarbonSense/
├── backend/              # Python FastAPI backend
│   ├── main.py          # Application entry point
│   ├── routes.py        # API routes
│   ├── models.py        # Pydantic models
│   ├── storage.py       # Database layer
│   ├── auth.py          # Authentication
│   └── utils.py         # Helper functions
│
├── client/              # React frontend
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # UI components
│       └── services/    # API service
│
├── shared/              # Shared resources
├── migrations/          # Database migrations
│
├── docker-compose.yml   # Docker configuration
├── setup.ps1           # Windows setup script
└── setup.sh            # Mac/Linux setup script
```

## 🌟 Features

- ✅ User authentication with JWT
- ✅ Multi-role support (Individual, Company, Admin)
- ✅ Emission tracking across multiple categories
- ✅ Automatic CO2 calculations
- ✅ Interactive dashboards with charts
- ✅ Goal setting and progress tracking
- ✅ Personalized eco-friendly tips
- ✅ Report generation and export
- ✅ What-if scenario analysis
- ✅ Category and department breakdowns
- ✅ Historical trend analysis

## 🔐 Environment Variables

Create `backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_secret_key
PORT=5000
DEBUG=True
```

## 📦 Deployment

### Backend (Python)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 5000 --workers 4
```

### Frontend (React)
```bash
npm run build
# Serve the dist/ directory
```

### Docker
```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: See documentation files
- **API Docs**: http://localhost:5000/api/docs

## 🎉 Acknowledgments

- Built with FastAPI, React, and Supabase
- UI components from Radix UI
- Styling with Tailwind CSS

---

**Made with 💚 for a sustainable future**
