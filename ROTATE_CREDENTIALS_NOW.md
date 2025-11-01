# 🚨 URGENT: ROTATE ALL CREDENTIALS IMMEDIATELY

## Date: November 1, 2025

Your `.env` file with production credentials was previously committed to git history. 
Although it has been removed from the repository, **you MUST rotate all credentials immediately**.

---

## ✅ Credentials to Rotate (REQUIRED)

### 1. **Supabase Credentials**
- [ ] Go to: https://app.supabase.com/project/kjgvhtbrzgxxahjtfjth/settings/api
- [ ] Regenerate Service Role Key
- [ ] Update in production environment
- [ ] Update in local `.env` file

### 2. **Database Password**
- [ ] Go to Supabase Database Settings
- [ ] Reset database password (was: `bharath@16`)
- [ ] Update `DATABASE_URL` in production
- [ ] Update in local `.env` file

### 3. **JWT Secret**
- [ ] Generate new secure secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Update in production environment
- [ ] Update in local `.env` file

### 4. **Google OAuth Credentials**
- [ ] Go to: https://console.cloud.google.com/apis/credentials
- [ ] Delete old OAuth 2.0 Client ID
- [ ] Create new OAuth 2.0 Client ID
- [ ] Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Update callback URLs if needed

---

## 📝 After Rotating Credentials

1. Update your local `.env` file with new values
2. Update production environment variables (Vercel/hosting platform)
3. Test that authentication still works
4. Delete this file: `git rm ROTATE_CREDENTIALS_NOW.md`

---

## ⚠️ Why This Is Important

When credentials are committed to git, they can be:
- Found in git history even after deletion
- Accessed by anyone who cloned the repository
- Used maliciously to access your services
- Discovered by automated bots scanning GitHub

**Always rotate credentials immediately after exposure.**
