# Bengali News Website - প্রথম আলো

A comprehensive Bengali news website built with modern web technologies. Features responsive design, user authentication, content management, e-paper functionality, and personalized content recommendations.

![Bengali News Website](https://via.placeholder.com/800x400/1e40af/ffffff?text=Bengali+News+Website)

## 🌟 Features

### 📰 Content Management
- **Rich Article System**: Full-featured articles with categories, featured content, and view tracking
- **E-Paper Integration**: Digital newspaper with PDF and image support
- **Breaking News**: Real-time priority news updates
- **Category Organization**: Politics, Sports, International, Economy, Entertainment, Technology, Lifestyle

### 👤 User Features
- **Secure Authentication**: Powered by Supabase Auth
- **Personalized Experience**: Reading history, saved articles, and content recommendations
- **Interactive Elements**: Text-to-speech, article summaries, social sharing
- **Achievement System**: Gamified reading experience with progress tracking

### 🎨 Modern Design
- **Responsive Layout**: Mobile-first design that works on all devices
- **Dark/Light Mode**: Theme switching with user preference storage
- **Bengali Typography**: Optimized for Bengali language content
- **Accessibility**: Screen reader friendly and keyboard navigation

### 🛠️ Technical Features
- **Real-time Updates**: Live breaking news and weather information
- **Social Media Integration**: Embedded social media feeds
- **Video Content**: YouTube and video streaming support
- **Audio Articles**: Text-to-speech and audio content
- **Advanced Search**: Full-text search across all content

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/bengali-news-website.git
   cd bengali-news-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Setup database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

Visit [http://localhost:5000](http://localhost:5000) to see the application.

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **Framer Motion** - Smooth animations

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Supabase** - Database and authentication
- **TypeScript** - End-to-end type safety

### Database
- **PostgreSQL** - Via Supabase
- **Real-time subscriptions** - Live updates
- **Row Level Security** - Data protection

### Build Tools
- **Vite** - Fast build tool and dev server
- **ESBuild** - Optimized bundling
- **PostCSS** - CSS processing

## 📱 Project Structure

```
bengali-news-website/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Backend Express application
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
├── db/                     # Database configuration and seeding
└── deployment files        # Platform-specific deployment configs
```

## 🎯 Key Components

### Article Management
- Rich text editor for content creation
- Category assignment and tagging
- Featured article selection
- View count tracking
- SEO optimization

### User Authentication
- Email/password authentication
- User profiles and preferences
- Reading history tracking
- Saved articles functionality
- Achievement system

### Content Discovery
- Category-based browsing
- Popular articles tracking
- Search functionality
- Personalized recommendations
- Breaking news alerts

## 🌐 Deployment

The application is configured for deployment on multiple platforms:

### Supported Platforms
- **Vercel** (Recommended)
- **Netlify**
- **Railway** 
- **Render**
- **Heroku**
- **Google Cloud Platform**
- **Docker/VPS**

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/bengali-news-website)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/bengali-news-website)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/your-template)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔧 Configuration

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Production settings
NODE_ENV=production
PORT=5000
```

### Database Schema

The application uses the following main tables:
- `categories` - News categories
- `articles` - Main content
- `users` - User accounts (via Supabase Auth)
- `e_papers` - Digital newspaper editions
- `weather` - Weather information
- `breaking_news` - Priority news items

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Write tests for new features
- Ensure responsive design
- Maintain Bengali language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - For the excellent backend-as-a-service platform
- **Tailwind CSS** - For the utility-first CSS framework
- **shadcn/ui** - For the beautiful component library
- **The Bengali Community** - For inspiration and feedback

## 📞 Support

- 📧 **Email**: support@bengali-news.com
- 💬 **Discord**: [Join our community](https://discord.gg/your-invite)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/bengali-news-website/issues)
- 📖 **Documentation**: [Full Documentation](./docs/)

## 🗺️ Roadmap

- [ ] Mobile applications (React Native)
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline reading mode
- [ ] Newsletter integration
- [ ] Comment system
- [ ] Social media login

---

**Made with ❤️ for the Bengali community**

⭐ Star this repository if you find it helpful!