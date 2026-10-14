#!/bin/bash

echo "========================================="
echo "   FakeShield - Fake News Detection App"
echo "========================================="

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js v16+ from https://nodejs.org"
  exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then echo "❌ Backend install failed"; exit 1; fi
echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then echo "❌ Frontend install failed"; exit 1; fi
echo "✅ Frontend dependencies installed"

# Start backend in background
echo ""
echo "🚀 Starting backend server on port 5000..."
cd ../backend
node server.js &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

sleep 2

# Start frontend
echo ""
echo "🚀 Starting frontend on port 3000..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "   App is starting..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "   Default Credentials:"
echo "   Admin:  admin / admin123"
echo "   User:   testuser / user123"
echo "========================================="
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'; exit 0" INT
wait
