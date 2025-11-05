# 🚀 Complete Deployment Guide - Railway

This guide will walk you through deploying your Expense Tracking System (backend + frontend) to Railway.

## Prerequisites

- [Railway account](https://railway.app) (free tier available)
- [Cloudinary account](https://cloudinary.com) (free tier available)
- GitHub account
- Gmail account (for email functionality)

---

## Part 1: Backend Deployment

### Step 1: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select your repository
5. Railway will detect the project

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provision a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically set

### Step 3: Configure Environment Variables

In your Railway backend service, add these environment variables:

```env
# Database (auto-set by Railway PostgreSQL)
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Frontend URL (we'll update this after deploying frontend)
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=Expense Tracker <your-email@gmail.com>

# Server
PORT=3000
NODE_ENV=production
```

#### Getting Cloudinary Credentials:

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard
4. Copy: Cloud Name, API Key, API Secret

#### Getting Gmail App Password:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate new app password for "Mail"
5. Copy the 16-character password

### Step 4: Configure Build Settings

Railway should auto-detect Node.js. If not:

1. Go to Settings → Build
2. Set Root Directory: `/backend`
3. Build Command: `npm install && npm run prisma:generate`
4. Start Command: `npm run prisma:deploy && npm start`

### Step 5: Deploy Backend

1. Click "Deploy" or push to your GitHub repository
2. Railway will automatically build and deploy
3. Wait for deployment to complete (2-3 minutes)
4. Copy your backend URL (e.g., `https://your-app.up.railway.app`)

### Step 6: Test Backend

Visit: `https://your-backend-url.up.railway.app/health`

You should see:
```json
{
  "status": "OK",
  "timestamp": "2025-11-05T..."
}
```

### Step 7: Create First User

Use a tool like Postman or curl to register:

```bash
curl -X POST https://your-backend-url.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hershufo23@gmail.com",
    "password": "your-password",
    "fullName": "Hershi Ibrahim"
  }'
```

Save the `token` from the response!

### Step 8: Make First User Admin

Use Prisma Studio or SQL:

1. In Railway dashboard, click on PostgreSQL service
2. Go to "Data" tab
3. Click "Connect"
4. Use the connection string to connect with a PostgreSQL client
5. Run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'hershufo23@gmail.com';
```

---

## Part 2: Frontend Deployment

### Step 1: Update Frontend Configuration

Create `/src/config.js`:

```javascript
const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
};

export default config;
```

### Step 2: Create `.env` for Frontend

In your frontend root directory, create `.env`:

```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

### Step 3: Update API Client

Update `/src/api/base44Client.js`:

```javascript
import config from '../config';

const API_URL = config.API_URL;

// Replace all Base44 calls with your custom API
export const api = {
  get: async (endpoint, token) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  
  post: async (endpoint, data, token) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  
  // Add put, delete methods similarly...
};
```

### Step 4: Add Frontend to Railway

1. In your Railway project, click "+ New"
2. Select "GitHub Repo"
3. Choose your repository again
4. Railway will create a new service

### Step 5: Configure Frontend Service

1. Go to Settings
2. Set Root Directory: `/` (if frontend is in root) or `/frontend` (if separate)
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run preview` or use a static server

### Step 6: Set Frontend Environment Variable

Add in Railway:
```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

### Step 7: Update Backend CORS

Go back to your backend service in Railway and update:
```env
FRONTEND_URL=https://your-frontend-url.up.railway.app
```

Redeploy backend.

### Step 8: Deploy Frontend

Push to GitHub or click "Deploy" in Railway.

---

## Part 3: Import Your Existing Data

### Option A: Use Backup Import Feature

1. Once frontend is deployed, login as admin
2. Go to Backup page
3. Use the "Import" feature (you'll need to add this endpoint)

### Option B: Manual SQL Import

1. Connect to Railway PostgreSQL
2. Run your backup SQL file
3. Adjust IDs if needed (Base44 uses different ID format)

### Option C: API Import Script

Create a Node.js script to import via API:

```javascript
import fs from 'fs';

const API_URL = 'https://your-backend-url.up.railway.app';
const TOKEN = 'your-admin-token';

const backup = JSON.parse(fs.readFileSync('backup.json', 'utf8'));

// Import drivers
for (const driver of backup.drivers) {
  await fetch(`${API_URL}/api/drivers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(driver),
  });
}

// Repeat for expenses, employees, etc...
```

---

## Part 4: Verify Everything Works

### Backend Checks:
- ✅ `/health` returns OK
- ✅ `/api/auth/login` works
- ✅ `/api/drivers` returns data (with auth)

### Frontend Checks:
- ✅ Login page loads
- ✅ Can login successfully
- ✅ Dashboard shows data
- ✅ Can create new expense
- ✅ Can upload files (logo/favicon)
- ✅ Can export backup
- ✅ Can send backup email

---

## Part 5: Custom Domain (Optional)

### Backend Domain:
1. In Railway backend service → Settings → Domains
2. Click "Generate Domain" or add custom domain
3. Update `FRONTEND_URL` in backend to match

### Frontend Domain:
1. In Railway frontend service → Settings → Domains
2. Click "Generate Domain" or add custom domain
3. Update `VITE_API_URL` in frontend to match backend URL

---

## Troubleshooting

### Issue: "Database connection failed"
- Check DATABASE_URL is set correctly
- Ensure Prisma migrations ran: `npm run prisma:deploy`

### Issue: "CORS error"
- Verify FRONTEND_URL in backend matches your frontend URL exactly
- Check both http/https protocols match

### Issue: "401 Unauthorized"
- Token might be expired (7 days default)
- Re-login to get new token

### Issue: "File upload failed"
- Check Cloudinary credentials are correct
- Verify file size is under 10MB

### Issue: "Email not sending"
- Check Gmail app password (not regular password)
- Ensure 2FA is enabled on Google account

---

## Environment Variables Summary

### Backend:
```
DATABASE_URL=postgresql://... (auto-set)
JWT_SECRET=min-32-chars-secret
FRONTEND_URL=https://your-frontend.railway.app
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=16-char-app-password
EMAIL_FROM=Expense Tracker <your-email@gmail.com>
PORT=3000
NODE_ENV=production
```

### Frontend:
```
VITE_API_URL=https://your-backend.railway.app
```

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Set up PostgreSQL database
3. ✅ Configure all environment variables
4. ✅ Create admin user
5. ✅ Test all API endpoints
6. ✅ Deploy frontend to Railway
7. ✅ Update CORS settings
8. ✅ Import existing data
9. ✅ Test full application
10. ✅ Set up custom domains (optional)

---

## Cost Estimate

Railway Free Tier includes:
- $5 credit per month
- Unlimited projects
- 512MB RAM per service
- 1GB disk per service

Your app should fit comfortably in free tier with:
- 1x Backend service (~$2/month)
- 1x PostgreSQL (~$2/month)
- 1x Frontend service (~$1/month)

**Total: ~$5/month = FREE on trial credit** 🎉

---

## Support

If you encounter any issues:
1. Check Railway logs: Click service → Deployments → View logs
2. Check browser console for frontend errors
3. Test API endpoints with Postman
4. Verify all environment variables are set

Good luck with your deployment! 🚀
