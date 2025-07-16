#!/bin/bash

# Bengali News Website Deployment Script
# Usage: ./deploy.sh [platform]

set -e

PLATFORM=${1:-default}
PROJECT_NAME="bengali-news-website"

echo "🚀 Deploying Bengali News Website to $PLATFORM"

# Function to check environment variables
check_env() {
    if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        echo "❌ Missing required environment variables:"
        echo "   VITE_SUPABASE_URL"
        echo "   VITE_SUPABASE_ANON_KEY" 
        echo "   SUPABASE_SERVICE_ROLE_KEY"
        echo ""
        echo "Please set these variables before deploying."
        exit 1
    fi
}

# Platform-specific deployment functions
deploy_vercel() {
    echo "🔷 Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Build for Vercel
    node build-scripts.js vercel
    
    # Deploy
    vercel --prod
    
    echo "✅ Deployed to Vercel successfully!"
}

deploy_netlify() {
    echo "🟢 Deploying to Netlify..."
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        echo "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Build for Netlify
    node build-scripts.js netlify
    
    # Deploy
    netlify deploy --prod --dir=dist/public
    
    echo "✅ Deployed to Netlify successfully!"
}

deploy_railway() {
    echo "🚂 Deploying to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Build for Railway
    node build-scripts.js railway
    
    # Deploy
    railway up
    
    echo "✅ Deployed to Railway successfully!"
}

deploy_render() {
    echo "🎨 Deploying to Render..."
    echo "Please use Render dashboard to deploy from GitHub repository"
    echo "Build command: node build-scripts.js render"
    echo "Start command: npm start"
}

deploy_docker() {
    echo "🐳 Building Docker image..."
    
    # Build for Docker
    node build-scripts.js docker
    
    # Build Docker image
    docker build -t $PROJECT_NAME .
    
    echo "✅ Docker image built successfully!"
    echo "To run: docker run -p 5000:5000 -e VITE_SUPABASE_URL=$VITE_SUPABASE_URL -e VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY $PROJECT_NAME"
}

deploy_heroku() {
    echo "🟣 Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "Please install Heroku CLI first"
        exit 1
    fi
    
    # Create Procfile if not exists
    if [ ! -f "Procfile" ]; then
        echo "web: npm start" > Procfile
    fi
    
    # Set environment variables
    heroku config:set VITE_SUPABASE_URL="$VITE_SUPABASE_URL"
    heroku config:set VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY"
    heroku config:set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
    
    # Deploy
    git push heroku main
    
    echo "✅ Deployed to Heroku successfully!"
}

# Main deployment logic
case $PLATFORM in
    "vercel")
        check_env
        deploy_vercel
        ;;
    "netlify")
        check_env
        deploy_netlify
        ;;
    "railway")
        check_env
        deploy_railway
        ;;
    "render")
        check_env
        deploy_render
        ;;
    "docker")
        check_env
        deploy_docker
        ;;
    "heroku")
        check_env
        deploy_heroku
        ;;
    *)
        echo "❌ Unknown platform: $PLATFORM"
        echo "Available platforms:"
        echo "  vercel   - Deploy to Vercel"
        echo "  netlify  - Deploy to Netlify"
        echo "  railway  - Deploy to Railway"
        echo "  render   - Deploy to Render (manual)"
        echo "  docker   - Build Docker image"
        echo "  heroku   - Deploy to Heroku"
        echo ""
        echo "Usage: ./deploy.sh [platform]"
        exit 1
        ;;
esac

echo "🎉 Deployment process completed!"