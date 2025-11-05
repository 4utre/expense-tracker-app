#!/bin/bash

# Expense Tracker Backend - Quick Start Script
# This script helps you set up the backend for local development

echo "🚀 Expense Tracker Backend - Quick Start"
echo "========================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your credentials:"
    echo "   - DATABASE_URL (from Railway PostgreSQL)"
    echo "   - JWT_SECRET (generate a strong secret)"
    echo "   - CLOUDINARY credentials (from cloudinary.com)"
    echo "   - EMAIL credentials (Gmail app password)"
    echo ""
    echo "Press Enter when you're done editing .env..."
    read
else
    echo "✅ .env file already exists"
    echo ""
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npm run prisma:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"
echo ""

# Check if DATABASE_URL is set
source .env 2>/dev/null
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set in .env"
    echo "   You'll need to set this before running migrations"
    echo ""
else
    echo "🗄️  Running database migrations..."
    npm run prisma:migrate
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to run migrations"
        echo "   Make sure your DATABASE_URL is correct"
    else
        echo "✅ Database migrations complete"
        echo ""
    fi
fi

echo ""
echo "✨ Setup complete! Next steps:"
echo ""
echo "1. Start development server:"
echo "   npm run dev"
echo ""
echo "2. Test the server:"
echo "   curl http://localhost:3000/health"
echo ""
echo "3. Open Prisma Studio (database GUI):"
echo "   npm run prisma:studio"
echo ""
echo "4. Deploy to Railway:"
echo "   See DEPLOYMENT_GUIDE.md"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Backend API documentation"
echo "   - DEPLOYMENT_GUIDE.md - Railway deployment guide"
echo "   - BACKEND_COMPLETE.md - Complete feature list"
echo ""
echo "Happy coding! 🎉"
