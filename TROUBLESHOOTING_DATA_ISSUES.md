# Data Not Showing - Troubleshooting Guide

## Issues Found & Fixed

### 1. **API URL Configuration Issue** ✅ FIXED
**Problem:** Frontend was pointing to Railway production API instead of local backend
**Solution:** Updated `.env` file to use `http://localhost:3000`

```env
# Before:
VITE_API_URL=https://incredible-embrace-production-1370.up.railway.app

# After:
VITE_API_URL=http://localhost:3000
```

### 2. **Field Name Inconsistency** ⚠️ CRITICAL
**Problem:** Backend uses camelCase (Prisma) but frontend expects snake_case

**Backend (Prisma):**
- `driverName`, `driverNumber`, `hourlyRate`, `expenseDate`, etc.

**Frontend expects:**
- `driver_name`, `driver_number`, `hourly_rate`, `expense_date`, etc.

**Fix Required:** Update backend routes to map Prisma camelCase to snake_case

### 3. **Authentication Token**
Check if you have a valid JWT token in localStorage:
- Open DevTools → Application → Local Storage
- Look for `token` key
- If missing, login again

### 4. **Database Connection**
✅ Database is connected properly (PostgreSQL on Railway)
✅ Prisma client is generated
✅ Backend server is running on port 3000

## Quick Fix Steps

### Step 1: Update Backend Response Transformation

The backend needs to transform Prisma's camelCase to frontend's snake_case.

**File:** `backend/routes/driver.routes.js`
Add this transformation helper:

```javascript
// Add at top of file
const transformDriver = (driver) => ({
  id: driver.id,
  driver_name: driver.driverName,
  driver_number: driver.driverNumber,
  phone: driver.phone,
  hourly_rate: driver.hourlyRate,
  overtime_rate: driver.overtimeRate,
  currency: driver.currency,
  assigned_months: driver.assignedMonths,
  created_date: driver.createdDate,
  created_by: driver.createdBy
});

// Update get all drivers route:
router.get('/', async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { createdDate: 'desc' }
    });
    res.json(drivers.map(transformDriver));
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});
```

**Same transformation needed for:**
- ✅ driver.routes.js
- ✅ expense.routes.js
- ✅ employee.routes.js
- ✅ expenseType.routes.js
- ✅ printTemplate.routes.js

### Step 2: Restart Servers

After fixing .env:
```bash
# Stop and restart frontend (it's on port 5175)
# Press Ctrl+C in the terminal running Vite, then:
npm run dev

# Backend should auto-restart with nodemon
```

### Step 3: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click on refresh button
3. Select "Empty Cache and Hard Reload"

### Step 4: Check Authentication
```javascript
// In browser console:
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('user'));

// If null, login again at:
// http://localhost:5175/login
```

## Testing the Fix

### Test Backend API Directly:
```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Test auth (replace YOUR_TOKEN with actual token from localStorage)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/drivers

# 3. Test expenses
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/expenses?limit=10
```

### Test Frontend:
1. Open http://localhost:5175
2. Login if needed
3. Go to Dashboard
4. Open DevTools → Network tab
5. Check API calls:
   - Should go to `http://localhost:3000/api/*`
   - Should return 200 status
   - Should have data in response

## Common Errors & Solutions

### Error: "Access token required"
**Solution:** Login again to get fresh token

### Error: "Failed to fetch"
**Solution:** 
- Check if backend is running: `curl http://localhost:3000/health`
- Check .env VITE_API_URL is `http://localhost:3000`

### Error: Data shows as undefined
**Solution:** Field name mismatch - apply transformations in backend routes

### Error: CORS issues
**Solution:** Backend already configured for `http://localhost:5173` - update to also allow `http://localhost:5175`:

```javascript
// backend/server.js
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5175' // Add this
  ],
  credentials: true
}));
```

## Database Schema Check

Verify tables exist:
```bash
cd backend
npx prisma studio
# Opens GUI at http://localhost:5555
# Check if tables have data
```

## Priority Fixes (In Order)

1. ✅ **Update .env to use localhost** (DONE)
2. 🔄 **Add CORS for port 5175** (DO NEXT)
3. 🔄 **Add field transformations in all routes** (CRITICAL)
4. ✅ **Verify authentication token** (CHECK)
5. ✅ **Restart both servers** (DO LAST)

## After All Fixes

If data still not showing:
1. Check Prisma Studio: `npx prisma studio` - verify data exists in DB
2. Check backend logs in terminal
3. Check browser console for errors
4. Check Network tab for failed requests
5. Verify you're logged in with correct account

## Contact for Help

If issues persist, provide:
1. Screenshot of browser console errors
2. Screenshot of Network tab showing API calls
3. Backend terminal output
4. Result of: `curl -v http://localhost:3000/health`
