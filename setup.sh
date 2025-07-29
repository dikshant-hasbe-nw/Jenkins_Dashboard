#!/bin/bash

echo "🚀 Setting up Jenkins Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your Jenkins credentials before starting the application."
fi

# Create logs directory
mkdir -p logs

echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your Jenkins credentials"
echo "2. Start database services: docker-compose up -d postgres redis"
echo "3. Run database migrations: cd server && npm run db:migrate"
echo "4. Start the application: npm run dev"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001" 