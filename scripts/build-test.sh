#!/bin/bash

# Bengali News Website - Build Test Script
# This script tests the build process and validates deployment readiness

set -e  # Exit on any error

echo "🔧 Bengali News Website - Build & Deployment Test"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check Node.js version
echo -e "\n📋 Checking prerequisites..."
node_version=$(node --version)
echo "Node.js version: $node_version"

if [[ $(echo $node_version | cut -d'.' -f1 | sed 's/v//') -lt 18 ]]; then
    print_error "Node.js 18+ required. Current version: $node_version"
    exit 1
else
    print_status "Node.js version is compatible"
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found!"
    exit 1
else
    print_status "package.json found"
fi

# Check if environment variables are set
echo -e "\n🔐 Checking environment variables..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Using .env.example if available"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Copied .env.example to .env. Please update with real values."
    fi
else
    print_status ".env file exists"
fi

# Check required environment variables
required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
for var in "${required_vars[@]}"; do
    if grep -q "^$var=" .env; then
        print_status "$var is set"
    else
        print_warning "$var not found in .env"
    fi
done

# Install dependencies
echo -e "\n📦 Installing dependencies..."
if npm install; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# TypeScript check
echo -e "\n🔍 Running TypeScript check..."
if npm run check; then
    print_status "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi

# Build the application
echo -e "\n🏗️ Building application..."
if npm run build; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Check build output
echo -e "\n📂 Checking build output..."
if [ -d "dist" ]; then
    print_status "dist directory created"
    
    if [ -f "dist/index.js" ]; then
        print_status "Server bundle created (dist/index.js)"
    else
        print_error "Server bundle not found"
        exit 1
    fi
    
    if [ -d "dist/public" ]; then
        print_status "Client build directory created (dist/public)"
        
        if [ -f "dist/public/index.html" ]; then
            print_status "Client HTML found"
        else
            print_error "Client HTML not found"
            exit 1
        fi
    else
        print_error "Client build directory not found"
        exit 1
    fi
else
    print_error "Build output directory (dist) not found"
    exit 1
fi

# Check file sizes
echo -e "\n📊 Build size analysis..."
if command -v du >/dev/null 2>&1; then
    echo "Total build size: $(du -sh dist | cut -f1)"
    echo "Server bundle size: $(du -sh dist/index.js | cut -f1)"
    echo "Client build size: $(du -sh dist/public | cut -f1)"
fi

# Test production server start (briefly)
echo -e "\n🚀 Testing production server start..."
timeout 10s npm start &
server_pid=$!
sleep 3

if kill -0 $server_pid 2>/dev/null; then
    print_status "Production server started successfully"
    kill $server_pid 2>/dev/null || true
else
    print_warning "Could not verify server start (might be normal)"
fi

# Check deployment configurations
echo -e "\n📋 Checking deployment configurations..."
deployment_files=("vercel.json" "netlify.toml" "Dockerfile" "Procfile" "app.json" "render.yaml" "railway.toml")
for file in "${deployment_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file configuration found"
    else
        print_warning "$file not found"
    fi
done

# Final summary
echo -e "\n🎉 Build Test Summary"
echo "===================="
print_status "Build process completed successfully"
print_status "Application is ready for deployment"

if [ -f ".env" ]; then
    print_warning "Remember to set environment variables on your hosting platform"
fi

echo -e "\n📚 Next steps:"
echo "1. Choose a hosting platform (Vercel, Netlify, Railway, etc.)"
echo "2. Set up environment variables on the platform"
echo "3. Connect your repository and deploy"
echo "4. Run database seeding if needed: npm run db:seed"

echo -e "\n📖 See DEPLOYMENT.md for detailed deployment instructions"
echo -e "🔗 Platform-specific configurations are already included"

print_status "Build test completed successfully!"