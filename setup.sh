#!/bin/bash

# Setup script for Bengali News Website

echo "Setting up the Bengali News Website..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  echo "# Add your environment variables here" > .env
  echo "VITE_SUPABASE_URL=your_supabase_url" >> .env
  echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env
  echo "DATABASE_URL=your_postgresql_connection_string" >> .env
  echo ""
  echo "Please update the .env file with your actual values."
fi

# Set up database
echo "Setting up database..."
npm run db:push

# Seed database
echo "Would you like to seed the database with sample data? (y/n)"
read SEED_DB
if [ "$SEED_DB" = "y" ] || [ "$SEED_DB" = "Y" ]; then
  npm run db:seed
fi

echo "Setup complete! You can now run 'npm run dev' to start the development server."