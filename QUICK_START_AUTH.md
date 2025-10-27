# Quick Start Guide - New Authentication System

## 🎯 What Changed?

**Before:** Separate `/login` and `/signup` pages  
**After:** Single `/auth` page with toggle between modes

---

## 🚀 How to Use (Without Google OAuth - Works Now!)

### 1. Start the Server
```powershell
npm run dev:full
```

### 2. Visit the Auth Page
Open: `http://localhost:5174/auth`

### 3. You'll See Two Modes

#### **Login Mode** (Default for existing users)
```
┌─────────────────────────────────────┐
│     🔐 Welcome Back                 │
│                                     │
│  [Continue with Google]             │
│         --- or ---                  │
│  Email: [________________]          │
│  Password: [____________]  👁️       │
│  [Sign In]                          │
│                                     │
│  Don't have an account?             │
│  Create one now ←                   │
└─────────────────────────────────────┘
```

#### **Register Mode** (Click "Create one now")
```
┌─────────────────────────────────────┐
│     ✨ Create Account               │
│                                     │
│  [Continue with Google]             │
│         --- or ---                  │
│  First Name: [______] Last: [____]  │
│  Account Type: [Individual ▼]       │
│  Email: [________________]          │
│  Password: [____________]  👁️       │
│  Confirm: [_____________]  👁️       │
│  [Create Account]                   │
│                                     │
│  Already have an account?           │
│  Sign in instead ←                  │
└─────────────────────────────────────┘
```

---

## 🎨 Features You Get Right Now

✅ **Toggle Between Modes**
- Click "Create one now" to switch to register
- Click "Sign in instead" to switch to login
- Smooth animations and transitions

✅ **Email/Password Auth** (Works immediately)
- No setup needed
- Same functionality as before
- All validation working

✅ **Demo Account** (Still available)
- Email: `demo@carbonsense.com`
- Password: `demo123`
- Shown in login mode

✅ **Google OAuth Button** (Needs setup)
- Button is visible
- Shows error if credentials not configured
- Works after you add Google credentials

---

## 🔧 To Enable Google OAuth

### What You Need From Google:
1. Go to https://console.cloud.google.com/
2. Create a project
3. Enable Google OAuth
4. Get Client ID and Client Secret

### Add to .env file:
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### Install Package:
```powershell
npm install passport passport-google-oauth20 @types/passport-google-oauth20
```

### Restart Server:
```powershell
npm run dev:full
```

**Detailed Instructions:** See `GOOGLE_OAUTH_SETUP.md`

---

## 📍 Routes Updated

All these now go to `/auth`:
- `/auth` - Main authentication page
- `/login` - Redirects to `/auth`
- `/signup` - Redirects to `/auth`
- Landing page buttons → `/auth`

---

## 🧪 Test It Now (Without Google)

1. **Start the server:**
   ```powershell
   npm run dev:full
   ```

2. **Open your browser:**
   ```
   http://localhost:5174/auth
   ```

3. **Try creating an account:**
   - Click "Create one now"
   - Fill in the form
   - Click "Create Account"
   - You'll be logged in automatically

4. **Try logging in:**
   - Use demo account or your new account
   - Click "Sign In"
   - You'll see the dashboard

---

## ❓ FAQ

**Q: Do I need Google OAuth to use the new auth page?**  
A: No! Email/password authentication works immediately. Google OAuth is optional.

**Q: Can I still use the old login/signup pages?**  
A: They still exist as files, but all routes now point to `/auth`. The old pages are deprecated.

**Q: What if I don't want Google OAuth?**  
A: Just don't add the Google credentials. The button will show an error if clicked, or you can remove it from the UI.

**Q: Is my data safe?**  
A: Yes! Same security as before - passwords are hashed with bcrypt, JWT tokens are used, etc.

**Q: Does dark mode still work?**  
A: Yes! The new auth page fully supports dark mode.

---

## 🎉 Summary

**✅ What Works Now (No Setup Needed):**
- Unified login/registration page at `/auth`
- Toggle between login and register modes
- Email/password authentication
- Demo account login
- Dark mode support
- All existing functionality

**⏳ What Needs Setup (Optional):**
- Google OAuth button functionality
- Requires Google Cloud credentials
- Full instructions in `GOOGLE_OAUTH_SETUP.md`

**🚀 Ready to Use!**
Just start your server and visit `/auth`!
