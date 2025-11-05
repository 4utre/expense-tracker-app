# 🚀 Railway Deployment Guide

## Overview
You need to deploy **3 services** on Railway:
1. **PostgreSQL Database** (already exists ✅)
2. **Backend API** (Node.js)
3. **Frontend** (Vite React App)

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Project

1. **Push your code to GitHub** (if not already):
   ```bash
   cd /Users/hershibrahim/Downloads/app-980af4ad\ \(2\)
   git init
   git add .
   git commit -m "Ready for Railway deployment"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

### Step 2: Deploy Backend to Railway

1. **Go to Railway Dashboard**: https://railway.app
2. **Create New Project** or use existing one
3. **Add Service** → **GitHub Repo**
4. **Select your repository**
5. **Configure Backend Service:**
   - **Root Directory**: `/backend`
   - **Build Command**: (auto-detected from railway.json)
   - **Start Command**: (auto-detected from railway.json)

6. **Add Environment Variables** (in Backend service):
   ```env
   DATABASE_URL=your_railway_postgres_url
   JWT_SECRET=h/QswLM526NFelJjwwpc4ZHJgF3O/ZZopn8GHboy1Io=
   FRONTEND_URL=https://your-frontend.up.railway.app
   NODE_ENV=production
   PORT=3000
   ```

   **Get DATABASE_URL from your PostgreSQL service:**
   - Click on PostgreSQL service
   - Go to "Variables" tab
   - Copy `DATABASE_URL` value

7. **Wait for deployment** (2-5 minutes)
8. **Note your backend URL**: `https://your-backend.up.railway.app`

### Step 3: Deploy Frontend to Railway

1. **In same Railway project, Add New Service**
2. **Select Same GitHub Repo**
3. **Configure Frontend Service:**
   - **Root Directory**: `/` (root of repo)
   - **Build Command**: (auto-detected from railway.json)
   - **Start Command**: (auto-detected from railway.json)

4. **Add Environment Variable** (in Frontend service):
   ```env
   VITE_API_URL=https://your-backend.up.railway.app
   ```
   ⚠️ **IMPORTANT**: Replace with YOUR actual backend URL from Step 2

5. **Wait for deployment** (2-5 minutes)
6. **Note your frontend URL**: `https://your-frontend.up.railway.app`

### Step 4: Update Backend CORS

1. **Go to Backend service** in Railway
2. **Update FRONTEND_URL** environment variable:
   ```env
   FRONTEND_URL=https://your-frontend.up.railway.app
   ```
3. **Redeploy backend** (it will auto-restart)

---

## 🔧 Alternative: Using Railway CLI

### Install Railway CLI:
```bash
npm i -g @railway/cli
railway login
```

### Deploy Backend:
```bash
cd backend
railway link
railway up
railway variables set DATABASE_URL=your_postgres_url
railway variables set JWT_SECRET=h/QswLM526NFelJjwwpc4ZHJgF3O/ZZopn8GHboy1Io=
railway variables set FRONTEND_URL=https://your-frontend.up.railway.app
railway variables set NODE_ENV=production
```

### Deploy Frontend:
```bash
cd ..  # back to root
railway link
railway up
railway variables set VITE_API_URL=https://your-backend.up.railway.app
```

---

## 📁 Project Structure on Railway

```
Railway Project
├── PostgreSQL Database Service
│   └── Already exists ✅
│
├── Backend Service (Node.js)
│   ├── Root: /backend
│   ├── Port: 3000 (auto-assigned by Railway)
│   └── ENV:
│       ├── DATABASE_URL (from PostgreSQL service)
│       ├── JWT_SECRET
│       ├── FRONTEND_URL
│       └── NODE_ENV=production
│
└── Frontend Service (Vite)
    ├── Root: / (project root)
    ├── Port: auto-assigned by Railway
    └── ENV:
        └── VITE_API_URL (backend URL)
```

---

## ✅ Verification Checklist

After deployment, verify:

### Backend:
- [ ] Visit: `https://your-backend.up.railway.app/health`
- [ ] Should return: `{"status":"OK","timestamp":"..."}`

### Frontend:
- [ ] Visit: `https://your-frontend.up.railway.app`
- [ ] Should load the login page
- [ ] Open browser console (F12) - check for errors
- [ ] Check Network tab - API calls should go to Railway backend

### Database:
- [ ] Backend logs show Prisma connecting successfully
- [ ] No database connection errors in Railway logs

---

## 🐛 Troubleshooting

### Backend Issues:

**Error: "Cannot connect to database"**
- Check DATABASE_URL is set correctly
- Verify PostgreSQL service is running
- Check Railway logs for exact error

**Error: "CORS policy"**
- Update FRONTEND_URL in backend environment variables
- Redeploy backend service

**Error: "Prisma Client not generated"**
- Check build command includes `npm run prisma:generate`
- Redeploy service

### Frontend Issues:

**Error: "Failed to fetch"**
- Check VITE_API_URL is set correctly
- Verify backend is deployed and running
- Check backend URL is accessible

**Blank page:**
- Check browser console for errors
- Verify build completed successfully in Railway logs
- Check start command is correct

**404 on routes:**
- Vite preview handles SPA routing automatically
- Check Railway logs for any startup errors

---

## 🔐 Important Security Notes

1. **Never commit .env files** to GitHub
2. **Set all secrets** in Railway dashboard
3. **Use different JWT_SECRET** for production
4. **Enable HTTPS only** (Railway provides this automatically)

---

## 📊 Expected URLs After Deployment

```
Database:  postgresql://...@railway.app:xxxx/railway
Backend:   https://your-backend.up.railway.app
Frontend:  https://your-frontend.up.railway.app
```

---

## 💡 Tips

1. **Domain Names**: You can add custom domains in Railway
2. **Logs**: Check Railway logs if something doesn't work
3. **Redeploy**: Any push to GitHub auto-deploys
4. **Environment Variables**: Can be updated without redeploying code

---

## 🎯 Quick Commands Reference

```bash
# Check Railway services
railway status

# View logs
railway logs

# Open service in browser
railway open

# Link to different service
railway link

# Set environment variable
railway variables set KEY=value
```

---

## ✨ After Successful Deployment

1. Share your frontend URL: `https://your-frontend.up.railway.app`
2. Your app is now accessible from anywhere!
3. All changes pushed to GitHub will auto-deploy
4. Database is persistent and backed up by Railway

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway logs for error details
