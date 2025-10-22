# CarbonSense - Migration to Python Backend Complete! 🎉

## 🏗️ New Project Structure

Your project has been restructured for better organization:

```
CarbonSense/
├── backend/                    # 🐍 Python FastAPI Backend (NEW!)
│   ├── main.py                # FastAPI application entry
│   ├── routes.py              # API route handlers
│   ├── models.py              # Pydantic data models
│   ├── storage.py             # Database layer (Supabase)
│   ├── auth.py                # JWT authentication
│   ├── utils.py               # Helper functions (CO2 calculations)
│   ├── config.py              # Configuration management
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment template
│   ├── .gitignore            # Python gitignore
│   └── README.md              # Backend documentation
│
├── client/                     # ⚛️ React Frontend (Unchanged)
│   ├── src/
│   │   ├── pages/             # React pages
│   │   ├── components/        # UI components
│   │   ├── services/          # API service (compatible!)
│   │   ├── context/           # React context
│   │   └── ...
│   └── public/
│
├── shared/                     # 📦 Shared resources
│   └── schema.ts              # TypeScript schemas (for frontend)
│
├── migrations/                 # 🗄️ Database migrations
├── attached_assets/            # 📄 Project resources
│
├── docker-compose.yml         # 🐳 Docker setup (NEW!)
├── Dockerfile.backend         # Backend Docker config (NEW!)
├── Dockerfile.frontend        # Frontend Docker config (NEW!)
│
├── package.json               # Node.js config (for frontend)
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript config
└── README.md                  # This file!
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` and add your Supabase credentials.

2. **Start everything with Docker:**
   ```bash
   docker-compose up
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Docs: http://localhost:5000/api/docs

### Option 2: Manual Setup

#### Backend Setup (Python)

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Supabase credentials.

6. **Run the server:**
   ```bash
   python main.py
   ```
   Or:
   ```bash
   uvicorn main:app --reload --port 5000
   ```

#### Frontend Setup (React)

1. **Install dependencies** (from project root):
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Access at:** http://localhost:5173

---

## 🔄 What Changed?

### ✅ Migrated from Node.js to Python

| Component | Before (Node.js) | After (Python) |
|-----------|------------------|----------------|
| **Framework** | Express.js | FastAPI |
| **Language** | TypeScript | Python 3.11+ |
| **Database ORM** | Drizzle | Direct Supabase client |
| **Authentication** | jsonwebtoken, bcryptjs | python-jose, passlib |
| **Validation** | Zod | Pydantic v2 |
| **Server** | Node.js | Uvicorn (ASGI) |

### ✅ What Stayed the Same

- ✅ **Frontend**: React + TypeScript (no changes needed!)
- ✅ **Database**: Supabase PostgreSQL
- ✅ **API Contracts**: Same endpoints, same JSON structure
- ✅ **Authentication**: JWT tokens work identically
- ✅ **Database Schema**: No changes required

---

## 📡 API Endpoints

All endpoints are now served by Python FastAPI:

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Emissions
- `POST /api/emissions/add` - Add emission
- `GET /api/emissions/calculate` - Calculate CO2
- `GET /api/emissions/history` - Monthly history
- `GET /api/emissions/list` - List all emissions
- `GET /api/emissions/summary` - Statistics
- `PUT /api/emissions/{id}` - Update emission
- `DELETE /api/emissions/{id}` - Delete emission

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - List goals

### Tips
- `GET /api/tips` - Get eco tips

### Dashboard
- `GET /api/dashboard` - Dashboard data

### Reports
- `POST /api/reports/generate` - Generate report

### What-If Analysis
- `POST /api/whatif` - Run scenarios

**📚 Full Interactive Docs:** http://localhost:5000/api/docs

---

## 🔧 Configuration

### Backend (.env)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your-secret-key-change-me
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Server
PORT=5000
HOST=0.0.0.0
DEBUG=True
```

### Frontend

The frontend API service (`client/src/services/api.ts`) is already configured and compatible with the Python backend!

---

## 🧪 Testing

### Test Backend

1. **Health check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Login (demo account):**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@carbonsense.com","password":"demo123"}'
   ```

3. **Interactive testing:**
   Visit http://localhost:5000/api/docs

### Test Frontend

1. Open http://localhost:5173
2. Login with demo account:
   - Email: `demo@carbonsense.com`
   - Password: `demo123`

---

## 📦 Dependencies

### Backend (Python)
- **fastapi** - Modern web framework
- **uvicorn** - ASGI server
- **supabase** - Database client
- **pydantic** - Data validation
- **python-jose** - JWT tokens
- **passlib** - Password hashing
- **python-dotenv** - Environment management

### Frontend (React)
No changes! Uses existing:
- React, TypeScript, Vite
- TanStack Query, Axios
- Tailwind CSS, Radix UI

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build
```

---

## 📝 Development Workflow

### Making Backend Changes

1. Edit Python files in `backend/`
2. Server auto-reloads (if using `--reload`)
3. Test at http://localhost:5000/api/docs

### Making Frontend Changes

1. Edit React files in `client/src/`
2. Vite hot-reloads automatically
3. Test at http://localhost:5173

---

## 🎯 Next Steps

1. **Setup Environment:**
   - Add your Supabase credentials to `backend/.env`

2. **Start Development:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python main.py

   # Terminal 2 - Frontend
   npm run dev
   ```

3. **Test the Demo:**
   - Visit http://localhost:5173
   - Login with demo@carbonsense.com / demo123
   - Add some emissions
   - Check the dashboard

4. **Customize:**
   - Modify emission factors in `backend/utils.py`
   - Add new API endpoints in `backend/routes.py`
   - Update UI in `client/src/`

---

## 🔥 Removed Files

The old Node.js/TypeScript backend files can be removed:
- `server/index.ts` ❌
- `server/routes.ts` ❌
- `server/storage.ts` ❌
- `server/vite.ts` ❌

They've been replaced by the Python backend in `backend/`!

---

## 💡 Tips

1. **Python 3.9+** required
2. **Use virtual environment** for Python dependencies
3. **API docs** are your friend: `/api/docs`
4. **CORS is configured** for local development
5. **Demo account** works without database setup

---

## 🆘 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.9+)
- Activate virtual environment
- Install dependencies: `pip install -r requirements.txt`
- Check `.env` file exists with correct Supabase credentials

### Frontend can't connect
- Ensure backend is running on port 5000
- Check CORS settings in `backend/main.py`
- Verify API calls go to `/api/*` endpoints

### Database errors
- Verify Supabase credentials in `.env`
- Check database schema matches `migrations/`
- Test Supabase connection directly

---

## 📚 Additional Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Supabase Docs:** https://supabase.com/docs
- **Pydantic Docs:** https://docs.pydantic.dev
- **Backend README:** `backend/README.md`

---

## ✨ Features

All original features work with Python backend:
- ✅ User authentication (JWT)
- ✅ Emission tracking
- ✅ CO2 calculations
- ✅ Dashboard & analytics
- ✅ Goal setting
- ✅ Eco-friendly tips
- ✅ Reports
- ✅ What-if analysis
- ✅ Multi-role support (individual/company)

---

**🎉 Migration Complete! Your CarbonSense app now runs on:**
- **Frontend:** React + TypeScript + Vite
- **Backend:** Python + FastAPI
- **Database:** Supabase (PostgreSQL)

Happy coding! 🚀
