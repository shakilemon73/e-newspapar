# Bengali News Website - প্রথম আলো

A comprehensive Bengali news website built with modern web technologies, featuring a responsive design, user authentication, content management, and advanced algorithms for personalized content recommendations.

## 🌟 Features

- **Modern Architecture**: React + TypeScript frontend with Node.js/Express backend
- **Database**: Supabase PostgreSQL with advanced algorithms
- **Authentication**: Secure user authentication with role-based access
- **Content Management**: Full CRUD operations for articles, categories, videos, audio
- **Personalization**: AI-powered content recommendations based on reading history
- **Bengali Language Support**: Full Bengali text support with proper formatting
- **Media Support**: Images, videos, audio articles, and e-papers
- **Real-time Features**: Breaking news ticker, weather updates
- **Admin Dashboard**: Complete content management system
- **Mobile Responsive**: Optimized for all device sizes

## 🚀 Deployment

This application is configured for deployment on multiple platforms:

### Vercel Deployment (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Set Environment Variables**:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Deploy**: Click "Deploy" and your site will be live!

### Netlify Deployment

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings** (auto-configured via `netlify.toml`):
   - Build command: `npm run build:netlify`
   - Publish directory: `dist/public`

3. **Environment Variables**: Add the same Supabase variables as above

4. **Deploy**: Your site will build and deploy automatically

### Railway Deployment

1. **Connect Repository**:
   - Go to [railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your repository

2. **Configuration**: Railway will use `railway.toml` for configuration

3. **Environment Variables**: Add Supabase credentials

4. **Deploy**: Your application will be live with a custom domain

### Render Deployment

1. **Create Web Service**:
   - Go to [render.com](https://render.com)
   - Click "New Web Service"
   - Connect your GitHub repository

2. **Configuration**: Render will use `render.yaml` for setup

3. **Environment Variables**: Add your Supabase credentials

4. **Deploy**: Your service will be deployed automatically

### Docker Deployment

1. **Build Image**:
   ```bash
   docker build -t bengali-news-website .
   ```

2. **Run Container**:
   ```bash
   docker run -p 5000:5000 \
     -e VITE_SUPABASE_URL=your_url \
     -e VITE_SUPABASE_ANON_KEY=your_key \
     -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \
     bengali-news-website
   ```

3. **Docker Compose** (recommended):
   ```bash
   docker-compose up -d
   ```

## 🛠️ Local Development

1. **Clone Repository**:
   ```bash
   git clone <your-repo-url>
   cd bengali-news-website
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Visit**: Open [http://localhost:5000](http://localhost:5000)

## 📊 Database Setup

The application uses Supabase PostgreSQL with the following tables:
- `categories` - News categories
- `articles` - Main news articles
- `epapers` - Digital newspaper editions
- `weather` - Weather information
- `breaking_news` - Breaking news items
- `video_content` - Video articles
- `audio_articles` - Audio content
- `social_media_posts` - Social media integration
- `user_preferences` - Personalization data
- `user_interactions` - User behavior tracking
- `article_analytics` - Content analytics

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/articles` - List articles
- `GET /api/articles/featured` - Featured articles
- `GET /api/articles/latest` - Latest articles
- `GET /api/articles/popular` - Popular articles
- `GET /api/articles/:slug` - Single article
- `GET /api/categories` - List categories
- `GET /api/categories/:slug` - Category details
- `GET /api/search?q=query` - Search articles
- `GET /api/weather` - Weather data
- `GET /api/breaking-news` - Breaking news
- `GET /api/epapers` - E-paper editions
- `GET /api/videos` - Video content
- `GET /api/audio-articles` - Audio articles
- `GET /api/social-media` - Social media posts

### Health Check
- `GET /api/health` - Service health status

## 🔐 Security Features

- **CORS Protection**: Configured for cross-origin requests
- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Protection**: Parameterized queries via Supabase
- **Authentication**: Secure user sessions with Supabase Auth
- **Environment Variables**: Sensitive data stored securely
- **HTTPS**: SSL/TLS encryption on all platforms

## 📱 Browser Support

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For deployment issues or questions:
1. Check the deployment platform's documentation
2. Verify environment variables are set correctly
3. Check the logs for specific error messages
4. Ensure Supabase database is accessible

## 🌐 Live Demo

After deployment, your Bengali news website will be accessible with:
- Responsive design for all devices
- Bengali language support
- Real-time content updates
- User authentication and personalization
- Admin content management
- SEO-optimized pages

---

Made with ❤️ for the Bengali community