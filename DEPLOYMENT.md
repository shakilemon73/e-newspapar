# Bengali News Website - Deployment Guide

This comprehensive guide explains how to deploy the Bengali News Website to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Environment Variables**: Get your Supabase keys:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Quick Start

1. **Clone and Setup**:
   ```bash
   git clone <your-repo-url>
   cd bengali-news-website
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Setup Database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Test Locally**:
   ```bash
   npm run dev
   ```

## Deployment Options

### 1. Vercel (Recommended)

**Why Vercel?** Best for React apps with serverless functions.

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Add environment variables in Vercel dashboard

**Configuration**: Uses `vercel.json` (already configured)

### 2. Netlify

**Why Netlify?** Great for static sites with serverless functions.

1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist/public`
4. Add environment variables in Netlify dashboard

**Configuration**: Uses `netlify.toml` (already configured)

### 3. Railway

**Why Railway?** Simple deployment with database hosting.

1. Visit [railway.app](https://railway.app)
2. Connect GitHub repo
3. Add environment variables
4. Deploy automatically

**Configuration**: Uses `railway.toml` (already configured)

### 4. Render

**Why Render?** Free tier with good performance.

1. Visit [render.com](https://render.com)
2. Connect GitHub repo
3. Use `render.yaml` configuration
4. Add environment variables

**Configuration**: Uses `render.yaml` (already configured)

### 5. Heroku

**Why Heroku?** Traditional PaaS with add-ons ecosystem.

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add environment variables: `heroku config:set VITE_SUPABASE_URL=...`
5. Deploy: `git push heroku main`

**Configuration**: Uses `Procfile` and `app.json` (already configured)

### 6. Google Cloud Platform

**Why GCP?** Enterprise-grade with auto-scaling.

1. Setup Google Cloud project
2. Enable Cloud Build and Cloud Run APIs
3. Deploy: `gcloud builds submit`

**Configuration**: Uses `cloudbuild.yaml` (already configured)

### 7. Docker / VPS

**Why Docker?** Complete control and portability.

1. **Build image**: `docker build -t bengali-news .`
2. **Run container**: `docker run -p 5000:5000 --env-file .env bengali-news`
3. **Or use docker-compose**: `docker-compose up -d`

**Configuration**: Uses `Dockerfile` and `docker-compose.yml` (already configured)

## Environment Variables Setup

### Required Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Platform-Specific Setup

#### Vercel
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

#### Netlify
Add in Netlify Dashboard → Site Settings → Environment Variables

#### Railway
Add in Railway Dashboard → Variables tab

#### Heroku
```bash
heroku config:set VITE_SUPABASE_URL=your_url
heroku config:set VITE_SUPABASE_ANON_KEY=your_key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## Database Setup

The app uses Supabase PostgreSQL. After deployment:

1. Ensure your Supabase project has the required tables
2. Run seeding if needed: `npm run db:seed`
3. Configure Row Level Security (RLS) policies as needed

## Build Process

The build process:
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles Express server to `dist/index.js`
3. **Assets**: Static files served from `dist/public`

## Monitoring & Maintenance

### Health Checks
- Endpoint: `GET /api/health` (if implemented)
- Port: `5000`
- Protocol: HTTP

### Logs
- Application logs available in platform dashboards
- Error tracking recommended (Sentry, LogRocket)

### Performance
- Frontend optimized with Vite
- Backend uses Express with proper middleware
- Database queries optimized through Supabase

## Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check Node.js version (requires 18+)
   - Verify all dependencies installed
   - Check TypeScript errors: `npm run check`

2. **Environment Variables Not Working**:
   - Ensure `VITE_` prefix for frontend variables
   - Check spelling and format
   - Restart deployment after adding variables

3. **Database Connection Issues**:
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure service role key has proper permissions

4. **Static Files Not Serving**:
   - Check build output in `dist/public`
   - Verify server configuration serves static files
   - Check file paths and routing

### Getting Help

1. Check application logs in platform dashboard
2. Verify environment variables are set correctly
3. Test database connection separately
4. Check Supabase dashboard for errors

## Performance Optimization

### Frontend
- Code splitting enabled by Vite
- Images optimized and lazy-loaded
- CSS minified and tree-shaken

### Backend
- Express server optimized for production
- Database queries use indexing
- Static files served with proper caching headers

### Database
- Supabase provides auto-scaling
- Queries optimized for Bengali content
- RLS policies for security

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Use service role key only on backend
3. **CORS**: Configure for your domain
4. **HTTPS**: Enable SSL/TLS on hosting platform
5. **Database**: Configure Row Level Security in Supabase

## Scaling

The application is designed to scale:
- **Frontend**: Served via CDN on most platforms
- **Backend**: Stateless Express server can scale horizontally
- **Database**: Supabase handles scaling automatically
- **Assets**: Optimized for delivery networks

## Support

For deployment issues:
1. Check this documentation
2. Review platform-specific documentation
3. Check community forums for your hosting platform
4. Verify environment configuration

---

**Ready to deploy?** Choose your preferred platform above and follow the specific instructions!