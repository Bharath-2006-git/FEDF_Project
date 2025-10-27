# ✅ Google OAuth Setup Checklist

## Step-by-Step Instructions

### ☐ Step 1: Install Required Packages
```powershell
npm install passport passport-google-oauth20 @types/passport-google-oauth20
```

### ☐ Step 2: Create Google Cloud Project
1. Go to: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Enter project name: **CarbonSense**
4. Click "Create"

### ☐ Step 3: Enable Google OAuth API
1. In your project, go to: **APIs & Services** → **Library**
2. Search for: **Google+ API** or **Google Identity Services**
3. Click **Enable**

### ☐ Step 4: Configure OAuth Consent Screen
1. Go to: **APIs & Services** → **OAuth consent screen**
2. Select: **External** (for testing)
3. Fill in:
   - App name: `CarbonSense`
   - User support email: `your-email@example.com`
   - Developer contact: `your-email@example.com`
4. Click **Save and Continue**
5. On Scopes page: Click **Add or Remove Scopes**
   - Select: `email`
   - Select: `profile`
6. Click **Save and Continue**
7. On Test users page: Click **Add Users**
   - Add your test email addresses
8. Click **Save and Continue**

### ☐ Step 5: Create OAuth Credentials
1. Go to: **APIs & Services** → **Credentials**
2. Click: **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `CarbonSense Web Client`
5. Authorized JavaScript origins:
   - Add: `http://localhost:5174`
   - Add: `http://localhost:3000`
6. Authorized redirect URIs:
   - Add: `http://localhost:3000/api/auth/google/callback`
7. Click **Create**
8. **COPY** the Client ID and Client Secret (you'll need these!)

### ☐ Step 6: Add Credentials to .env File
1. Open your `.env` file in the project root
2. Add these lines (replace with your actual values):
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### ☐ Step 7: Restart Your Server
```powershell
# Stop the server (Ctrl+C)
# Then start again:
npm run dev:full
```

### ☐ Step 8: Test Google OAuth
1. Open browser: `http://localhost:5174/auth`
2. Click: **Continue with Google**
3. Select your Google account
4. Grant permissions
5. You should be redirected to the dashboard!

---

## 🎯 What to Provide

I need you to provide in your `.env` file:

```env
GOOGLE_CLIENT_ID=<paste-your-client-id-here>
GOOGLE_CLIENT_SECRET=<paste-your-client-secret-here>
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

**Where to find these:**
- After completing Step 5 above
- Google will show you a popup with Client ID and Client Secret
- You can also find them later in: **APIs & Services** → **Credentials**

---

## 📸 Visual Guide

### Finding Your Credentials:

1. **Google Cloud Console:**
   ```
   console.cloud.google.com → Your Project → APIs & Services → Credentials
   ```

2. **Look for:** "OAuth 2.0 Client IDs"

3. **Your credentials will look like:**
   ```
   Client ID: 123456789-abc123xyz.apps.googleusercontent.com
   Client Secret: GOCSPX-abc123xyz_secret
   ```

---

## 🧪 Testing Checklist

### ☐ Test Without Google (Should work now)
- [ ] Can open `/auth` page
- [ ] Can toggle between login/register
- [ ] Can create account with email/password
- [ ] Can login with demo account
- [ ] Can login with created account

### ☐ Test With Google (After setup)
- [ ] Google button doesn't show error
- [ ] Clicking button redirects to Google
- [ ] Can select Google account
- [ ] Redirected back to dashboard
- [ ] Account created automatically
- [ ] Can login again with same Google account

---

## ⚠️ Common Issues

### Issue: "Google OAuth is not configured"
- **Fix:** Add credentials to `.env` file
- **Check:** No spaces before or after the values

### Issue: "redirect_uri_mismatch"
- **Fix:** Make sure callback URL in `.env` matches Google Console exactly
- **Check:** `http://localhost:3000/api/auth/google/callback`

### Issue: "access_denied"
- **Fix:** Add your email as test user in OAuth consent screen
- **Check:** Email must match the Google account you're testing with

### Issue: "invalid_client"
- **Fix:** Client ID or Secret is wrong
- **Check:** Copy-paste from Google Console carefully
- **Check:** Remove any extra spaces or quotes

---

## 🎉 You're Done!

Once you complete all steps, you'll have:
- ✅ Unified login/registration page
- ✅ Email/password authentication
- ✅ Google OAuth authentication
- ✅ Automatic account creation
- ✅ Secure JWT authentication

**Questions?** Check the detailed guides:
- `GOOGLE_OAUTH_SETUP.md` - Full setup instructions
- `AUTH_IMPLEMENTATION_SUMMARY.md` - Technical details
- `QUICK_START_AUTH.md` - Quick start guide
