# Expense Tracking System - Backend API

Node.js + Express + PostgreSQL + Prisma backend for the Expense Tracking System.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3. Set Up Railway PostgreSQL

1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the `DATABASE_URL` from Railway and paste it in your `.env` file

### 4. Run Database Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

## 📦 Deployment to Railway

### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Go to Railway.app → New Project → Deploy from GitHub
3. Select your repository
4. Railway will auto-detect the `backend` directory
5. Add environment variables in Railway dashboard:
   - `DATABASE_URL` (auto-filled by Railway PostgreSQL)
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`

### Option 2: Deploy with Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Drivers
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/:id` - Get single driver
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver
- `POST /api/drivers/bulk-update-rates` - Bulk update rates

### Expenses
- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `POST /api/expenses/:id/soft-delete` - Soft delete
- `POST /api/expenses/:id/restore` - Restore
- `DELETE /api/expenses/:id` - Permanent delete
- `POST /api/expenses/bulk-delete` - Bulk soft delete
- `POST /api/expenses/bulk-restore` - Bulk restore
- `POST /api/expenses/bulk-permanent-delete` - Bulk permanent delete

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Expense Types
- `GET /api/expense-types` - Get all expense types
- `GET /api/expense-types/:id` - Get single expense type
- `POST /api/expense-types` - Create expense type
- `PUT /api/expense-types/:id` - Update expense type
- `DELETE /api/expense-types/:id` - Delete expense type

### App Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get setting by key
- `POST /api/settings` - Create/update setting
- `DELETE /api/settings/:key` - Delete setting

### Print Templates
- `GET /api/print-templates` - Get all templates
- `GET /api/print-templates/:id` - Get single template
- `POST /api/print-templates` - Create template
- `PUT /api/print-templates/:id` - Update template
- `DELETE /api/print-templates/:id` - Delete template
- `POST /api/print-templates/:id/set-default` - Set as default

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### File Upload
- `POST /api/upload` - Upload file to Cloudinary

### Backup
- `GET /api/backup/export` - Export database as JSON/SQL
- `POST /api/backup/email` - Send backup via email

## 🔐 Authentication

All endpoints (except `/api/auth/register` and `/api/auth/login`) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database Schema

The database uses PostgreSQL with Prisma ORM. Schema includes:

- **Users** - Authentication and user management
- **Drivers** - Driver information and rates
- **Expenses** - Expense records with soft delete
- **Employees** - Employee salary information
- **ExpenseTypes** - Expense categories
- **AppSettings** - Application settings
- **PrintTemplates** - Custom print templates

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT | `your-secret-key` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.railway.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-secret` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Email app password | `your-app-password` |
| `PORT` | Server port | `3000` |

## 🛠️ Development

```bash
# Run in development mode with auto-reload
npm run dev

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Production build
npm start
```

## 📊 Importing Existing Data

Your SQL backup file can be imported using Prisma:

1. Convert your existing IDs to match Prisma's format (cuid)
2. Use Prisma Studio or create a migration script
3. Import data via API endpoints or direct SQL

## 🔧 Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - File uploads
- **Nodemailer** - Email service

## 📄 License

MIT
