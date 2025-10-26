#!/bin/bash

# JobHub Deployment Setup Script
# This script helps you set up deployment configuration

set -e

echo "========================================="
echo "JobHub Deployment Setup"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to generate a random JWT secret
generate_jwt_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 64 | tr -d '\n'
    elif command -v node &> /dev/null; then
        node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    else
        echo "PLEASE-CHANGE-THIS-SECRET-$(date +%s)"
    fi
}

echo -e "${YELLOW}Step 1: Backend Configuration (Vercel)${NC}"
echo "----------------------------------------"
echo ""

# Check if .env exists in root
if [ -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file already exists. Backing up to .env.backup${NC}"
    cp .env .env.backup
fi

# Prompt for backend environment variables
read -p "Enter MongoDB URI: " MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}MongoDB URI is required!${NC}"
    exit 1
fi

echo ""
echo "Generating JWT secret..."
JWT_SECRET=$(generate_jwt_secret)
echo -e "${GREEN}Generated JWT secret${NC}"

echo ""
read -p "Enter Frontend URL (Netlify URL after deployment): " CLIENT_URL
if [ -z "$CLIENT_URL" ]; then
    CLIENT_URL="http://localhost:5173"
    echo -e "${YELLOW}Using default: $CLIENT_URL${NC}"
fi

# Create backend .env file
cat > .env << EOF
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
MONGODB_URI=$MONGODB_URI

# JWT Secret
JWT_SECRET=$JWT_SECRET

# Frontend URL (for CORS)
CLIENT_URL=$CLIENT_URL

# Bcrypt Salt Rounds
BCRYPT_SALT_ROUNDS=10

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@jobhub.com
EOF

echo -e "${GREEN}✓ Backend .env file created${NC}"
echo ""

echo -e "${YELLOW}Step 2: Frontend Configuration (Netlify)${NC}"
echo "----------------------------------------"
echo ""

read -p "Enter Backend API URL (Vercel URL after deployment): " API_URL
if [ -z "$API_URL" ]; then
    API_URL="http://localhost:3001/api"
    echo -e "${YELLOW}Using default: $API_URL${NC}"
fi

# Create frontend .env file
cat > client/.env << EOF
# API Configuration
VITE_API_URL=$API_URL

# Application Configuration
VITE_APP_NAME=JobHub
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
EOF

echo -e "${GREEN}✓ Frontend .env file created${NC}"
echo ""

echo -e "${YELLOW}Step 3: Deployment Instructions${NC}"
echo "----------------------------------------"
echo ""
echo "Backend (Vercel):"
echo "1. Run: npm install -g vercel"
echo "2. Run: vercel"
echo "3. Follow the prompts to deploy"
echo "4. Add environment variables from .env to Vercel dashboard"
echo "5. Update CLIENT_URL in Vercel with your Netlify URL"
echo ""
echo "Frontend (Netlify):"
echo "1. Run: npm install -g netlify-cli"
echo "2. Run: cd client && netlify deploy --prod"
echo "3. Or connect your Git repository in Netlify dashboard"
echo "4. Update VITE_API_URL with your Vercel backend URL"
echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "- Don't commit .env files to Git"
echo "- Update URLs after deployment"
echo "- Keep your JWT secret secure"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
echo ""

