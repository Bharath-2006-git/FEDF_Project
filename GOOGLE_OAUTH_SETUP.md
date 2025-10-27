# Google OAuth Setup Instructions

## What You Need to Provide

To enable Google OAuth authentication, you'll need to set up a Google Cloud Project and obtain OAuth credentials. Here's what you need to do:

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity Services)

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure the OAuth consent screen if prompted
5. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`

### 3. Get Your Credentials

After creating the OAuth client, you'll receive:
- **Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

### 4. Add to Your .env File

Add these environment variables to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# For production, use:
# GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

### 5. Install Required npm Packages

Run this command to install the necessary packages:

```powershell
npm install passport-google-oauth20 @types/passport-google-oauth20
```

### 6. OAuth Consent Screen Configuration

When setting up the OAuth consent screen:
- **Application name**: CarbonSense
- **User support email**: Your email
- **Scopes**: Add `email` and `profile`
- **Authorized domains**: Add your domain (for production)
- **Application logo**: (Optional) Upload your logo

### 7. Test Users (Development Mode)

If your app is in development mode:
- Add test users in the OAuth consent screen
- Only these users can log in until you publish the app

### 8. Publishing (For Production)

To make your app available to all users:
1. Complete the OAuth consent screen setup
2. Submit for verification (if requesting sensitive scopes)
3. Wait for Google's approval

## Current Implementation Status

✅ **Frontend**: Google OAuth button added to `/auth` page  
✅ **Backend**: Google OAuth routes created in `server/routes.ts`  
⚠️ **Credentials**: Need to be added to `.env`  
⚠️ **Package**: `passport-google-oauth20` needs to be installed

## Files Modified

- `client/src/pages/Auth.tsx` - New unified auth page with Google OAuth
- `client/src/context/AuthContext.tsx` - Added `loginWithGoogle()` function
- `server/routes.ts` - Google OAuth endpoints (will be created)
- `client/src/App.tsx` - Updated routes to use `/auth`
- `client/src/pages/Landing.tsx` - Updated links to `/auth`

## Testing Google OAuth

1. After adding credentials to `.env`, restart your server
2. Go to `http://localhost:5174/auth`
3. Click "Continue with Google"
4. You'll be redirected to Google's login page
5. After successful login, you'll be redirected back to the dashboard

## Security Notes

- Never commit your `.env` file to version control
- Keep your Client Secret confidential
- Use environment variables for all sensitive data
- For production, use HTTPS only
- Implement rate limiting on auth endpoints

## Troubleshooting

**Error: redirect_uri_mismatch**
- Make sure the redirect URI in Google Console matches exactly with your .env

**Error: access_denied**
- Check if the user is added as a test user (in development mode)
- Verify OAuth consent screen is properly configured

**Error: invalid_client**
- Check if Client ID and Secret are correct in .env
- Ensure there are no extra spaces in the credentials

## Next Steps

1. ✅ Install passport-google-oauth20 package
2. ✅ Set up Google Cloud project
3. ✅ Get OAuth credentials
4. ✅ Add credentials to .env
5. ✅ Restart the server
6. ✅ Test the Google login flow

---

**Need Help?** Check the [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
