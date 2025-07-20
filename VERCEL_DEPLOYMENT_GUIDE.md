# Bengali News Portal - Vercel Deployment Guide

This guide will help you migrate your Bengali news website from Replit to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Supabase Account**: Keep your existing Supabase database

## Step 1: Prepare Your Environment Variables

In Vercel, you'll need to set up the following environment variables:

### Required Environment Variables:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key
NODE_ENV=production
```

### Optional Environment Variables:
```
SENDGRID_API_KEY=your-sendgrid-api-key (if using email features)
STRIPE_SECRET_KEY=your-stripe-secret-key (if using payments)
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key (if using payments)
```

## Step 2: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration from `vercel.json`
5. Add your environment variables in the project settings
6. Click "Deploy"

### Method 2: Vercel CLI
```bash
npm install -g vercel
cd your-project-directory
vercel
```

## Step 3: Configure Environment Variables in Vercel

1. Go to your project dashboard in Vercel
2. Navigate to Settings > Environment Variables
3. Add each environment variable with the appropriate values
4. Make sure to set the environment for Production, Preview, and Development

## Step 4: Update Your Supabase Configuration

No changes needed to your Supabase database. The API routes will work with your existing setup.

## Step 5: Configure Custom Domain (Optional)

1. In your Vercel project dashboard, go to Settings > Domains
2. Add your custom domain
3. Update your DNS settings as instructed by Vercel

## API Routes Structure

The following API routes have been created for Vercel:

```
/api/articles - Get articles with filters
/api/articles/[slug] - Get specific article
/api/articles/latest - Get latest articles
/api/articles/popular - Get popular articles
/api/audio-articles - Get audio articles
/api/audio-articles/[slug] - Get specific audio article
/api/categories - Get categories
/api/settings - Get site settings
```

## Build Configuration

The project uses these build settings:
- **Build Command**: `npm run build:client` (automatically detected from vercel.json)
- **Output Directory**: `dist/public`
- **Node Version**: 18.x

## Database Notes

- Your Supabase database will continue to work without changes
- All authentication and data storage remains the same
- The API routes connect to your existing Supabase instance

## Testing Your Deployment

After deployment, test these key features:
1. Homepage loads correctly
2. Article pages work
3. Audio article pages work
4. Admin dashboard functions
5. User authentication works
6. Database operations function

## Performance Optimizations

Vercel automatically provides:
- CDN distribution
- Edge caching
- Automatic HTTPS
- Image optimization
- API route caching (configured in the API files)

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Working**
   - Ensure all variables are set in Vercel dashboard
   - Redeploy after adding variables

2. **API Routes Returning 404**
   - Check the `vercel.json` routing configuration
   - Ensure API files are in the correct `/api` directory

3. **Build Failures**
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are in package.json

4. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check Supabase project is not paused

## Migration Checklist

- [ ] Code pushed to GitHub repository
- [ ] Vercel project created and connected
- [ ] Environment variables configured
- [ ] Test deployment successful
- [ ] Custom domain configured (if needed)
- [ ] Database operations verified
- [ ] Performance tested

## Support

If you encounter issues:
1. Check Vercel build logs
2. Review Supabase logs
3. Test API endpoints individually
4. Contact Vercel support if needed

Your Bengali news website should now be successfully running on Vercel with improved performance and global CDN distribution.