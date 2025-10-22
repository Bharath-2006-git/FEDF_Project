# CarbonSense Backend (Python/FastAPI)

This is the Python FastAPI backend for the CarbonSense carbon tracking platform.

## Features

- 🔐 JWT Authentication
- 📊 Emission tracking and calculations
- 🎯 Goal setting and tracking
- 💡 Eco-friendly tips
- 📈 Dashboard and analytics
- 🔮 What-if analysis
- 📑 Report generation

## Tech Stack

- **Framework**: FastAPI 0.104+
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **Validation**: Pydantic v2

## Setup

### Prerequisites

- Python 3.9 or higher
- Supabase account with database set up

### Installation

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment**:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   - Copy `.env.example` to `.env`
   - Update with your Supabase credentials:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     JWT_SECRET=your_secret_key
     ```

### Running the Server

**Development mode** (with auto-reload):
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

**Production mode**:
```bash
uvicorn main:app --host 0.0.0.0 --port 5000 --workers 4
```

The API will be available at:
- **API**: http://localhost:5000
- **Interactive Docs**: http://localhost:5000/api/docs
- **ReDoc**: http://localhost:5000/api/redoc

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Emissions
- `POST /api/emissions/add` - Add emission entry
- `GET /api/emissions/calculate` - Calculate CO2 emissions
- `GET /api/emissions/history` - Get emissions history
- `GET /api/emissions/list` - List emissions
- `GET /api/emissions/summary` - Get emissions summary
- `PUT /api/emissions/{id}` - Update emission
- `DELETE /api/emissions/{id}` - Delete emission

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get user goals

### Tips
- `GET /api/tips` - Get eco-friendly tips

### User/Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Dashboard
- `GET /api/dashboard` - Get dashboard data

### Reports
- `POST /api/reports/generate` - Generate report

### What-If Analysis
- `POST /api/whatif` - Run what-if scenarios

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── routes.py            # API route handlers
├── models.py            # Pydantic models
├── storage.py           # Database layer (Supabase)
├── auth.py              # Authentication utilities
├── utils.py             # Helper functions (CO2 calculations)
├── config.py            # Configuration management
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Development

### Adding New Routes

1. Define Pydantic models in `models.py`
2. Add database methods in `storage.py`
3. Create route handler in `routes.py`
4. Test using interactive docs at `/api/docs`

### CO2 Emission Factors

Emission factors are defined in `utils.py` in the `calculate_co2_emissions()` function. You can customize these based on your region or industry standards.

## Testing

Test the API using:
- Interactive Swagger docs: http://localhost:5000/api/docs
- ReDoc documentation: http://localhost:5000/api/redoc
- curl, Postman, or any HTTP client

Example test:
```bash
# Health check
curl http://localhost:5000/health

# Login (demo account)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@carbonsense.com","password":"demo123"}'
```

## Deployment

### Using Docker (Recommended)

See `Dockerfile` in the project root.

### Manual Deployment

1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables
3. Run with uvicorn: `uvicorn main:app --host 0.0.0.0 --port 5000 --workers 4`

### Environment Variables

Required:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key from Supabase

Optional:
- `JWT_SECRET` - Secret key for JWT (auto-generated if not set)
- `JWT_ALGORITHM` - JWT algorithm (default: HS256)
- `JWT_EXPIRATION_HOURS` - Token expiration (default: 24)
- `PORT` - Server port (default: 5000)
- `HOST` - Server host (default: 0.0.0.0)
- `DEBUG` - Debug mode (default: True)

## License

MIT
