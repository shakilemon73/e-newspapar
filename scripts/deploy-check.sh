#!/bin/bash

# Bengali News Website - Deployment Readiness Check
# This script checks if the application is ready for deployment

set -e

echo "🚀 Bengali News Website - Deployment Readiness Check"
echo "==================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

score=0
max_score=0

check_item() {
    max_score=$((max_score + 1))
    if [ "$1" = "true" ]; then
        score=$((score + 1))
        print_status "$2"
    else
        print_error "$2"
    fi
}

check_warning() {
    if [ "$1" = "true" ]; then
        print_status "$2"
    else
        print_warning "$2"
    fi
}

echo -e "\n📋 Essential Files Check"
echo "========================"

# Check essential files
check_item "$([ -f 'package.json' ] && echo 'true' || echo 'false')" "package.json exists"
check_item "$([ -f 'tsconfig.json' ] && echo 'true' || echo 'false')" "tsconfig.json exists"
check_item "$([ -f 'vite.config.ts' ] && echo 'true' || echo 'false')" "vite.config.ts exists"
check_item "$([ -f 'server/index.ts' ] && echo 'true' || echo 'false')" "Server entry point exists"
check_item "$([ -f 'client/src/App.tsx' ] && echo 'true' || echo 'false')" "Client entry point exists"

echo -e "\n🌐 Deployment Configurations"
echo "============================"

# Check deployment configurations
deployment_configs=(
    "vercel.json:Vercel deployment"
    "netlify.toml:Netlify deployment"
    "Dockerfile:Docker deployment"
    "docker-compose.yml:Docker Compose"
    "Procfile:Heroku deployment"
    "app.json:Heroku configuration"
    "render.yaml:Render deployment"
    "railway.toml:Railway deployment"
    "cloudbuild.yaml:Google Cloud Build"
)

for config in "${deployment_configs[@]}"; do
    file=$(echo "$config" | cut -d':' -f1)
    desc=$(echo "$config" | cut -d':' -f2)
    check_warning "$([ -f "$file" ] && echo 'true' || echo 'false')" "$desc configuration"
done

echo -e "\n🔐 Environment & Security"
echo "========================"

# Check environment files
check_item "$([ -f '.env.example' ] && echo 'true' || echo 'false')" ".env.example template exists"
check_warning "$([ -f '.env' ] && echo 'true' || echo 'false')" "Local .env file exists"

# Check security files
check_warning "$([ -f 'SECURITY.md' ] && echo 'true' || echo 'false')" "Security policy documented"
check_warning "$([ -f 'LICENSE' ] && echo 'true' || echo 'false')" "License file exists"

# Check gitignore
if [ -f '.gitignore' ]; then
    if grep -q "\.env" .gitignore && grep -q "node_modules" .gitignore; then
        check_item "true" ".gitignore properly configured"
    else
        check_item "false" ".gitignore missing essential entries"
    fi
else
    check_item "false" ".gitignore file exists"
fi

echo -e "\n📚 Documentation"
echo "================"

# Check documentation
check_warning "$([ -f 'README.md' ] && echo 'true' || echo 'false')" "README.md exists"
check_warning "$([ -f 'DEPLOYMENT.md' ] && echo 'true' || echo 'false')" "Deployment guide exists"

echo -e "\n🔧 Build System"
echo "==============="

# Check if build works
if [ -d "dist" ]; then
    check_item "true" "Previous build output exists"
    if [ -f "dist/index.js" ] && [ -d "dist/public" ]; then
        check_item "true" "Build output structure is correct"
    else
        check_item "false" "Build output structure is incorrect"
    fi
else
    check_item "false" "No build output found (run npm run build)"
fi

# Check package.json scripts
if [ -f "package.json" ]; then
    if grep -q '"build"' package.json && grep -q '"start"' package.json; then
        check_item "true" "Essential npm scripts exist"
    else
        check_item "false" "Missing essential npm scripts"
    fi
else
    check_item "false" "Cannot check npm scripts"
fi

echo -e "\n🛠️ Development Tools"
echo "==================="

# Check if essential tools are available
check_warning "$(command_exists node && echo 'true' || echo 'false')" "Node.js installed"
check_warning "$(command_exists npm && echo 'true' || echo 'false')" "npm available"
check_warning "$(command_exists git && echo 'true' || echo 'false')" "Git available"
check_warning "$(command_exists docker && echo 'true' || echo 'false')" "Docker available (optional)"

echo -e "\n📊 Deployment Readiness Score"
echo "============================="

percentage=$((score * 100 / max_score))
echo "Score: $score/$max_score ($percentage%)"

if [ $percentage -ge 90 ]; then
    print_status "Excellent! Your app is fully ready for deployment"
elif [ $percentage -ge 75 ]; then
    print_status "Good! Your app is ready for deployment with minor improvements"
elif [ $percentage -ge 60 ]; then
    print_warning "Fair. Your app can be deployed but consider addressing the issues above"
else
    print_error "Poor. Please fix the critical issues before deployment"
fi

echo -e "\n🎯 Platform Recommendations"
echo "=========================="

if [ -f "vercel.json" ]; then
    print_info "✅ Vercel: Fully configured and ready"
fi

if [ -f "netlify.toml" ]; then
    print_info "✅ Netlify: Fully configured and ready"
fi

if [ -f "Dockerfile" ]; then
    print_info "✅ Docker: Containerization ready"
fi

if [ -f "Procfile" ] && [ -f "app.json" ]; then
    print_info "✅ Heroku: Fully configured and ready"
fi

if [ -f "render.yaml" ]; then
    print_info "✅ Render: Fully configured and ready"
fi

if [ -f "railway.toml" ]; then
    print_info "✅ Railway: Fully configured and ready"
fi

echo -e "\n📝 Quick Deployment Commands"
echo "============================"

if command_exists vercel; then
    echo "Vercel:   vercel --prod"
fi

if command_exists netlify; then
    echo "Netlify:  netlify deploy --prod"
fi

if command_exists docker; then
    echo "Docker:   docker build -t bengali-news . && docker run -p 5000:5000 bengali-news"
fi

if command_exists heroku; then
    echo "Heroku:   git push heroku main"
fi

echo -e "\n📖 For detailed instructions, see DEPLOYMENT.md"

if [ $percentage -ge 75 ]; then
    echo -e "\n🚀 Your Bengali News Website is ready for the world!"
else
    echo -e "\n🔧 Please address the issues above before deployment"
fi