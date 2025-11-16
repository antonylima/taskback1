#!/bin/bash

# Task Manager Development Setup Script
echo "🚀 Task Manager Development Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Task Manager full-stack application...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "server.js" ]; then
    echo -e "${RED}❌ Please run this script from the task manager root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
npm install

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found. Please configure your environment variables.${NC}"
    echo -e "${YELLOW}💡 Copy .env.example to .env and fill in your Turso credentials${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Testing database connection...${NC}"
npm run test-connection

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database connection failed. Please check your credentials.${NC}"
    exit 1
fi

echo -e "${YELLOW}📊 Running database migrations...${NC}"
npm run migrate

echo -e "${YELLOW}📱 Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}🚀 To start development:${NC}"
echo ""
echo -e "${YELLOW}Backend (Terminal 1):${NC}"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Frontend (Terminal 2):${NC}"
echo "  cd frontend && npm start"
echo ""
echo -e "${BLUE}📱 Mobile Testing:${NC}"
echo "  1. Install Expo Go on your mobile device"
echo "  2. Scan the QR code when frontend starts"
echo "  3. Update API URL in frontend/src/utils/config.ts if needed"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"