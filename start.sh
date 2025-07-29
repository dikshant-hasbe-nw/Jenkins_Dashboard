#!/bin/bash

echo "🚀 Starting Jenkins Dashboard..."
echo "📦 Installing dependencies if needed..."
npm run install-all

echo "🗄️ Starting database services..."
docker compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🔄 Starting development servers..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

npm run dev 