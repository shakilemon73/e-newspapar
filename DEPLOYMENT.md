# Deployment Guide

This document provides a guide to deploy the Bengali News Website to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account
- A Supabase account with a project set up

## Deploying to Vercel

### 1. Push to GitHub

First, you need to push your code to GitHub:

```bash
# If you haven't already:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New" -> "Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Other (or Vite if available)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3. Environment Variables

Add these environment variables in Vercel project settings:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `DATABASE_URL` - Your PostgreSQL connection string

### 4. Deploy

Click "Deploy" and wait for the build process to complete.

### 5. Database Setup

Make sure your database is properly set up after deployment:

```bash
# Run these commands locally after deployment
npm run db:push
# Optionally, seed the database
npm run db:seed
```

### 6. Verify Deployment

Visit your deployed site URL to verify everything is working correctly.

## Troubleshooting

If you encounter issues:

1. Check Vercel build logs for errors
2. Verify environment variables are correctly set
3. Check database connection (make sure it's accessible from Vercel)
4. Check network settings (CORS, etc.)

## Auto-Deployments

Vercel automatically deploys when you push changes to your GitHub repository.