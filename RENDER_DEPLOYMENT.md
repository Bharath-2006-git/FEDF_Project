# CarbonSense - Render Deployment Guide

This guide walks you through deploying CarbonSense to Render.com.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A GitHub repository with your code pushed
3. A Supabase project set up with your database

## Deployment Options

You have two options to deploy on Render:

### Option 1: Using render.yaml (Recommended)

This automatically deploys both backend and frontend services.

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push
   ```

2. **Connect to Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing CarbonSense
   - Render will automatically detect `render.yaml` and set up both services

3. **Configure Environment Variables**
   
   For the **Backend Service** (carbonsense-api):
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `JWT_SECRET`: Will be auto-generated (or set your own)
   - Other variables are pre-configured in render.yaml

   For the **Frontend Service** (carbonsense-frontend):
   - `API_URL`: Will be set to your backend URL (update after backend is deployed)

4. **Update Frontend API URL**
   - After backend deploys, copy its URL (e.g., https://carbonsense-api.onrender.com)
   - Update the frontend's `API_URL` environment variable
   - Manually trigger a frontend redeploy

### Option 2: Manual Service Creation

If you prefer to set up services manually:

#### Backend Service

1. **Create Web Service**
   - Go to Render Dashboard → New + → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name**: carbonsense-api
     - **Region**: Choose your preferred region
     - **Branch**: main
     - **Root Directory**: (leave empty or set to root)
     - **Runtime**: Python 3
     - **Build Command**: `pip install -r backend/requirements.txt`
     - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Add Environment Variables** (in the Render dashboard):
   ```
   PYTHON_VERSION=3.11.0
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_ROLE_KEY=<your-supabase-key>
   JWT_SECRET=<generate-a-secure-random-string>
   JWT_ALGORITHM=HS256
   JWT_EXPIRATION_HOURS=24
   DEBUG=false
   ```

3. **Health Check Path**: `/health`

#### Frontend Service

1. **Create Web Service**
   - Go to Render Dashboard → New + → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name**: carbonsense-frontend
     - **Region**: Same as backend
     - **Branch**: main
     - **Root Directory**: (leave empty)
     - **Runtime**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`

2. **Add Environment Variables**:
   ```
   NODE_VERSION=20.16.0
   API_URL=<your-backend-url-from-step-above>
   VITE_API_URL=<your-backend-url-from-step-above>
   ```

## Post-Deployment Configuration

### 1. Update CORS Settings

After deployment, update the backend CORS settings to include your frontend URL:

In `backend/main.py`, update the `allow_origins` list:
```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend-url.onrender.com",  # Add this
],
```

### 2. Database Migrations

If you need to run database migrations:
- Your Supabase database should already be set up
- The migrations in the `migrations/` folder can be run directly in Supabase SQL editor if needed

### 3. Custom Domain (Optional)

To add a custom domain:
1. Go to your service in Render Dashboard
2. Click "Settings" → "Custom Domain"
3. Add your domain and update DNS records as instructed

## Environment Variables Reference

### Backend Required Variables:
- `SUPABASE_URL`: Your Supabase project URL (find in Supabase dashboard)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key from Supabase (Settings → API)
- `JWT_SECRET`: Random secure string for JWT signing (generate with: `openssl rand -hex 32`)

### Backend Optional Variables:
- `JWT_ALGORITHM`: Algorithm for JWT (default: HS256)
- `JWT_EXPIRATION_HOURS`: Token expiration time (default: 24)
- `DEBUG`: Set to false for production

### Frontend Variables:
- `API_URL`: Your backend API URL
- `VITE_API_URL`: Same as API_URL (used by Vite at build time)

## Monitoring and Logs

- View logs in Render Dashboard → Select Service → Logs
- Check health status at: `https://your-backend-url.onrender.com/health`
- API documentation at: `https://your-backend-url.onrender.com/api/docs`

## Troubleshooting

### Backend won't start
- Check that all required environment variables are set
- Verify Supabase credentials are correct
- Check logs for Python errors

### Frontend can't connect to backend
- Verify `API_URL` environment variable is set correctly
- Check CORS settings in backend
- Ensure backend service is running

### Build failures
- Check that Python version is 3.11+
- Check that Node version is 20+
- Verify all dependencies are listed in requirements.txt/package.json

## Free Tier Limitations

Render's free tier includes:
- 750 hours/month of runtime
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid tier for production use

## Support

For issues:
1. Check Render's status page: https://status.render.com
2. Review Render documentation: https://render.com/docs
3. Check application logs in Render Dashboard

## Next Steps

After deployment:
1. Test all API endpoints via `/api/docs`
2. Test frontend functionality
3. Set up monitoring and alerts
4. Configure automatic deployments on git push
5. Consider setting up staging environment
6. Add custom domain for production

---

**Deployed Services:**
- Backend API: `https://carbonsense-api.onrender.com`
- Frontend: `https://carbonsense-frontend.onrender.com`
- API Docs: `https://carbonsense-api.onrender.com/api/docs`
