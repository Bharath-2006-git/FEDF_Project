# Google OAuth Setup Guide

## ✅ Changes Made

### 1. Email Placeholder Fixed
- Changed email input placeholder from `your.email@example.com` to `Enter your email`
- Location: `client/src/pages/Auth.tsx`

### 2. Backend Server Started
- Backend server is now running on `http://localhost:3000`
- Frontend is running on `http://localhost:5174`
- The proxy configuration in `vite.config.ts` correctly forwards `/api` requests to the backend

## 🔧 Google OAuth Configuration

### Current Setup
- **Google Client ID**: `78419696882-884ssg7cr5ps8fv0eeg0naac18kj0etn.apps.googleusercontent.com`
- **Google Client Secret**: `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`
- **Callback URL**: `http://localhost:3000/api/auth/google/callback`

### How It Works
1. User clicks "Continue with Google" button
2. Frontend redirects to `/api/auth/google` (proxied to backend)
3. Backend redirects to Google OAuth consent screen
4. User authorizes the app
5. Google redirects back to `http://localhost:3000/api/auth/google/callback`
6. Backend processes the authentication
7. Backend redirects to frontend at `http://localhost:5174/auth-callback?token=...&user=...`
8. Frontend stores the token and user data in localStorage
9. User is redirected to the dashboard

### ⚠️ Important: Google Cloud Console Configuration

For Google OAuth to work, you MUST configure the redirect URI in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/google/callback` ✅ (Already configured)
   
   **If deploying to production, also add:**
   - `https://yourdomain.com/api/auth/google/callback`

6. Click **Save**

### Testing Google OAuth

1. Make sure both servers are running:
   - Backend: `npm run dev:server` (port 3000)
   - Frontend: `npm run dev` (port 5174)

2. Open browser to `http://localhost:5174/auth`

3. Click "Continue with Google"

4. If you see an error like "redirect_uri_mismatch", it means the redirect URI is not configured in Google Cloud Console. Follow the steps above to add it.

### Common Issues and Solutions

#### Issue: "redirect_uri_mismatch"
**Solution**: Add `http://localhost:3000/api/auth/google/callback` to authorized redirect URIs in Google Cloud Console

#### Issue: "ECONNREFUSED" when clicking Google button
**Solution**: Make sure the backend server is running on port 3000
```bash
npm run dev:server
```

#### Issue: Google OAuth works but user is not logged in
**Solution**: Check browser console for errors. The issue might be in the AuthCallback component or localStorage

#### Issue: "Google OAuth is not configured"
**Solution**: Make sure `.env` file has valid `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## 🚀 Running the Application

### Development Mode (Recommended)
Run both servers simultaneously in separate terminals:

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Single Command (if available)
```bash
npm run dev
```
This should start both servers if the package.json has a concurrent script configured.

## 🔍 Debugging

If Google OAuth is still not working:

1. **Check Backend Logs**: Look at the terminal running `npm run dev:server` for any errors

2. **Check Browser Console**: Look for JavaScript errors or failed network requests

3. **Check Network Tab**: 
   - Look for the `/api/auth/google` request
   - Check if it redirects to Google
   - Check if the callback request succeeds

4. **Verify Environment Variables**:
   ```bash
   # In backend terminal, check if variables are loaded
   echo $GOOGLE_CLIENT_ID  # Linux/Mac
   echo %GOOGLE_CLIENT_ID%  # Windows CMD
   $env:GOOGLE_CLIENT_ID   # Windows PowerShell
   ```

## 📝 Summary

- ✅ Email placeholder changed to "Enter your email"
- ✅ Backend server configured and running on port 3000
- ✅ Frontend proxy configured correctly
- ✅ Google OAuth credentials present in `.env`
- ⚠️ **Next Step**: Verify redirect URI in Google Cloud Console

The main thing you need to verify is that `http://localhost:3000/api/auth/google/callback` is added to the authorized redirect URIs in your Google Cloud Console project.
