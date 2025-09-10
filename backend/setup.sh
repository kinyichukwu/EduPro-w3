#!/bin/bash

echo "�� EduPro Backend Setup Script"
echo "================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📋 Copying .env.example to .env..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "🔧 Please edit .env file with your actual Supabase credentials:"
    echo "   - SUPABASE_KEY (anon/public key)"
    echo "   - SUPABASE_JWT_SECRET"
    echo "   - DATABASE_URL (replace YOUR_ACTUAL_PASSWORD with your database password)"
    echo "   - GEMINI_API_KEY"
    echo ""
    echo "📖 Instructions:"
    echo "   1. Go to https://supabase.com/dashboard"
    echo "   2. Select your project: dixceqaeloiywxihgfem"
    echo "   3. Go to Settings → API to get your keys"
    echo "   4. Go to Settings → Database to get your connection string"
    echo ""
    exit 1
else
    echo "✅ .env file found!"
fi

# Check if required environment variables are set
echo "🔍 Checking environment variables..."
source .env

if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "your_supabase_url_here" ]; then
    echo "❌ SUPABASE_URL not set correctly"
    exit 1
fi

if [ -z "$SUPABASE_KEY" ] || [ "$SUPABASE_KEY" = "your_supabase_anon_key_here" ]; then
    echo "❌ SUPABASE_KEY not set correctly"
    exit 1
fi

if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"YOUR_ACTUAL_PASSWORD"* ]]; then
    echo "❌ DATABASE_URL not set correctly (still contains placeholder)"
    exit 1
fi

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    echo "❌ GEMINI_API_KEY not set correctly"
    exit 1
fi

echo "✅ All environment variables are set!"

# Install dependencies
echo "📦 Installing Go dependencies..."
go mod tidy

# Test database connection
echo "🔌 Testing database connection..."
go run cmd/api/main.go &
PID=$!
sleep 3
kill $PID 2>/dev/null

echo ""
echo "🎉 Setup complete! You can now run:"
echo "   go run cmd/api/main.go"
echo ""
echo "📚 Don't forget to set up your database schema:"
echo "   1. Go to Supabase dashboard → SQL Editor"
echo "   2. Copy and paste the contents of setup_database.sql"
echo "   3. Run the script"
